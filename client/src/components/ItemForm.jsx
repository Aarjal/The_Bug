import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, AlertCircle } from "lucide-react";
import { createItem, updateItem } from "../api/services";
import { useToast } from "../context/ToastContext";
import { CATEGORIES, getErrorMessage } from "../utils/helpers";
import "../styles/Form.css";

export default function ItemForm({ type, itemToEdit }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    date: "",
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLost = type === "lost";
  const isEditing = !!itemToEdit;

  // Load edit data if editing
  useEffect(() => {
    if (itemToEdit) {
      const dateVal = itemToEdit.type === "lost" ? itemToEdit.dateLost : itemToEdit.dateFound;
      const formattedDate = dateVal ? new Date(dateVal).toISOString().split("T")[0] : "";

      setForm({
        title: itemToEdit.title || "",
        category: itemToEdit.category || "",
        description: itemToEdit.description || "",
        location: itemToEdit.location || "",
        date: formattedDate,
        image: itemToEdit.image || "",
      });
    }
  }, [itemToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Convert uploaded image to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "Image size must be under 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result });
      setErrors({ ...errors, image: "" });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm({ ...form, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!form.title.trim()) tempErrors.title = "Title is required";
    else if (form.title.length < 3) tempErrors.title = "Title must be at least 3 characters";

    if (!form.category) tempErrors.category = "Category is required";

    if (!form.description.trim()) tempErrors.description = "Description is required";
    else if (form.description.length < 10) tempErrors.description = "Description must be at least 10 characters";

    if (!form.location.trim()) tempErrors.location = "Location is required";

    if (!form.date) {
      tempErrors.date = `Date ${isLost ? "lost" : "found"} is required`;
    } else {
      const selectedDate = new Date(form.date);
      const today = new Date();
      if (selectedDate > today) {
        tempErrors.date = "Date cannot be in the future";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        location: form.location.trim(),
        image: form.image,
        dateLost: isLost ? form.date : undefined,
        dateFound: !isLost ? form.date : undefined,
      };

      if (isEditing) {
        await updateItem(itemToEdit._id, payload);
        addToast("Report updated successfully!", "success");
        navigate(`/item/${itemToEdit._id}`, { replace: true });
      } else {
        // Create mode
        const createPayload = { ...payload, type };
        await createItem(createPayload);
        addToast("Report submitted successfully!", "success");
        navigate("/", { replace: true });
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      addToast("Failed to submit report. Please check errors.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="alert alert-error" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <AlertCircle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <div className="form-grid">
        {/* Title */}
        <div className="form-group form-grid-full">
          <label className="form-label" htmlFor="form-title">
            Item Title
          </label>
          <input
            id="form-title"
            name="title"
            className={`form-input ${errors.title ? "invalid" : ""}`}
            type="text"
            placeholder="e.g. Black Leather Trifold Wallet"
            value={form.title}
            onChange={handleChange}
          />
          {errors.title && <div className="error-text">{errors.title}</div>}
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label" htmlFor="form-category">
            Category
          </label>
          <select
            id="form-category"
            name="category"
            className={`form-select ${errors.category ? "invalid" : ""}`}
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && <div className="error-text">{errors.category}</div>}
        </div>

        {/* Date picker */}
        <div className="form-group">
          <label className="form-label" htmlFor="form-date">
            Date {isLost ? "Lost" : "Found"}
          </label>
          <input
            id="form-date"
            name="date"
            className={`form-input ${errors.date ? "invalid" : ""}`}
            type="date"
            value={form.date}
            onChange={handleChange}
          />
          {errors.date && <div className="error-text">{errors.date}</div>}
        </div>

        {/* Location */}
        <div className="form-group form-grid-full">
          <label className="form-label" htmlFor="form-location">
            Location {isLost ? "Lost" : "Found"}
          </label>
          <input
            id="form-location"
            name="location"
            className={`form-input ${errors.location ? "invalid" : ""}`}
            type="text"
            placeholder="e.g. Near Library building, 2nd Floor"
            value={form.location}
            onChange={handleChange}
          />
          {errors.location && <div className="error-text">{errors.location}</div>}
        </div>

        {/* Description */}
        <div className="form-group form-grid-full">
          <label className="form-label" htmlFor="form-description">
            Detailed Description
          </label>
          <textarea
            id="form-description"
            name="description"
            className={`form-textarea ${errors.description ? "invalid" : ""}`}
            placeholder="Describe unique characteristics, markings, brand names, or anything that helps identify the item..."
            value={form.description}
            onChange={handleChange}
          />
          {errors.description && <div className="error-text">{errors.description}</div>}
        </div>

        {/* Image Upload */}
        <div className="form-group form-grid-full image-upload-container">
          <span className="form-label">Attach Photo</span>
          {form.image ? (
            <div className="image-preview-wrapper">
              <img src={form.image} alt="Preview" className="image-preview" />
              <button type="button" className="image-remove-btn" onClick={removeImage} aria-label="Remove image">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="image-dropzone" onClick={() => fileInputRef.current.click()}>
              <Upload size={32} strokeWidth={1.5} />
              <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>Upload an image</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Supports JPG, PNG up to 5MB</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          {errors.image && <div className="error-text">{errors.image}</div>}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: "140px" }}>
          {loading ? <span className="spinner" /> : isEditing ? "Save Changes" : "Submit Report"}
        </button>
      </div>
    </form>
  );
}
