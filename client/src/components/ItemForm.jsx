import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, AlertCircle } from "lucide-react";
import { createItem, updateItem } from "../api/services";
import { useToast } from "../context/ToastContext";
import { CATEGORIES, getErrorMessage } from "../utils/helpers";
import "../styles/Form.css";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB ceiling for client uploads

function FieldErrorMessage({ message }) {
  if (!message) return null;
  return <div className="error-text">{message}</div>;
}

function ImageUploadField({ imageSource, onFileSelected, onRemoveImage, errorMessage }) {
  const filePickerRef = useRef(null);

  return (
    <div className="form-group form-grid-full image-upload-container">
      <span className="form-label">Attach Photo</span>
      {imageSource ? (
        <div className="image-preview-wrapper">
          <img src={imageSource} alt="Attached item preview" className="image-preview" />
          <button
            type="button"
            className="image-remove-btn"
            onClick={onRemoveImage}
            aria-label="Remove attached image"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          className="image-dropzone"
          role="button"
          tabIndex={0}
          onClick={() => filePickerRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              filePickerRef.current?.click();
            }
          }}
        >
          <Upload size={32} strokeWidth={1.5} aria-hidden="true" />
          <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>Upload an image</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Supports JPG, PNG up to 5MB
          </span>
        </div>
      )}

      <input
        type="file"
        ref={filePickerRef}
        onChange={onFileSelected}
        accept="image/*"
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <FieldErrorMessage message={errorMessage} />
    </div>
  );
}

function buildInitialFormData(itemToEdit) {
  if (!itemToEdit) {
    return {
      title: "",
      category: "",
      description: "",
      location: "",
      date: "",
      image: "",
    };
  }

  const rawDate = itemToEdit.type === "lost" ? itemToEdit.dateLost : itemToEdit.dateFound;
  const isoDateString = rawDate ? new Date(rawDate).toISOString().split("T")[0] : "";

  return {
    title: itemToEdit.title || "",
    category: itemToEdit.category || "",
    description: itemToEdit.description || "",
    location: itemToEdit.location || "",
    date: isoDateString,
    image: itemToEdit.image || "",
  };
}

export default function ItemForm({ type, itemToEdit }) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState(() => buildInitialFormData(itemToEdit));
  const [validationErrors, setValidationErrors] = useState({});
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLostItem = type === "lost";
  const isEditMode = Boolean(itemToEdit);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const handleImageUpload = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_IMAGE_BYTES) {
      setValidationErrors((prev) => ({ ...prev, image: "Image size must be under 5MB" }));
      return;
    }

    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      setFormData((prevData) => ({ ...prevData, image: fileReader.result }));
      setValidationErrors((prevErrors) => ({ ...prevErrors, image: "" }));
    };
    fileReader.readAsDataURL(selectedFile);
  };

  const handleRemoveImage = () => {
    setFormData((prevData) => ({ ...prevData, image: "" }));
  };

  const validateForm = () => {
    const detectedErrors = {};

    if (!formData.title.trim()) {
      detectedErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      detectedErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.category) {
      detectedErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      detectedErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      detectedErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.location.trim()) {
      detectedErrors.location = "Location is required";
    }

    if (!formData.date) {
      detectedErrors.date = `Date ${isLostItem ? "lost" : "found"} is required`;
    } else {
      const parsedDate = new Date(formData.date);
      const currentDate = new Date();
      if (parsedDate > currentDate) {
        detectedErrors.date = "Date cannot be in the future";
      }
    }

    setValidationErrors(detectedErrors);
    return Object.keys(detectedErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmissionError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const commonPayload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        location: formData.location.trim(),
        image: formData.image,
        dateLost: isLostItem ? formData.date : undefined,
        dateFound: !isLostItem ? formData.date : undefined,
      };

      if (isEditMode) {
        await updateItem(itemToEdit._id, commonPayload);
        addToast("Report updated successfully!", "success");
        navigate(`/item/${itemToEdit._id}`, { replace: true });
      } else {
        await createItem({ ...commonPayload, type });
        addToast("Report submitted successfully!", "success");
        navigate("/", { replace: true });
      }
    } catch (err) {
      setSubmissionError(getErrorMessage(err));
      addToast("Failed to submit report. Please review the errors.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {submissionError && (
        <div className="alert alert-error" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <AlertCircle size={18} />
          <span>{submissionError}</span>
        </div>
      )}

      <div className="form-grid">
        <div className="form-group form-grid-full">
          <label className="form-label" htmlFor="form-title">
            Item Title
          </label>
          <input
            id="form-title"
            name="title"
            className={`form-input ${validationErrors.title ? "invalid" : ""}`}
            type="text"
            placeholder="e.g. Black Leather Trifold Wallet"
            value={formData.title}
            onChange={handleInputChange}
          />
          <FieldErrorMessage message={validationErrors.title} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="form-category">
            Category
          </label>
          <select
            id="form-category"
            name="category"
            className={`form-select ${validationErrors.category ? "invalid" : ""}`}
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="">Select Category</option>
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldErrorMessage message={validationErrors.category} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="form-date">
            Date {isLostItem ? "Lost" : "Found"}
          </label>
          <input
            id="form-date"
            name="date"
            className={`form-input ${validationErrors.date ? "invalid" : ""}`}
            type="date"
            value={formData.date}
            onChange={handleInputChange}
          />
          <FieldErrorMessage message={validationErrors.date} />
        </div>

        <div className="form-group form-grid-full">
          <label className="form-label" htmlFor="form-location">
            Location {isLostItem ? "Lost" : "Found"}
          </label>
          <input
            id="form-location"
            name="location"
            className={`form-input ${validationErrors.location ? "invalid" : ""}`}
            type="text"
            placeholder="e.g. Near Library building, 2nd Floor"
            value={formData.location}
            onChange={handleInputChange}
          />
          <FieldErrorMessage message={validationErrors.location} />
        </div>

        <div className="form-group form-grid-full">
          <label className="form-label" htmlFor="form-description">
            Detailed Description
          </label>
          <textarea
            id="form-description"
            name="description"
            className={`form-textarea ${validationErrors.description ? "invalid" : ""}`}
            placeholder="Describe unique characteristics, markings, brand names, or anything that helps identify the item..."
            value={formData.description}
            onChange={handleInputChange}
          />
          <FieldErrorMessage message={validationErrors.description} />
        </div>

        <ImageUploadField
          imageSource={formData.image}
          onFileSelected={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          errorMessage={validationErrors.image}
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ minWidth: "140px" }}
        >
          {isSubmitting ? (
            <span className="spinner" />
          ) : isEditMode ? (
            "Save Changes"
          ) : (
            "Submit Report"
          )}
        </button>
      </div>
    </form>
  );
}
