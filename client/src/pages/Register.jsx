import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { registerUser } from "../api/services";
import { getErrorMessage } from "../utils/helpers";
import "../styles/Auth.css";

const CONTACT_PLACEHOLDERS = {
  Phone: "e.g. +977 9876543210",
  WhatsApp: "e.g. +977 9876543210",
  Email: "e.g. contact@domain.com",
  Facebook: "e.g. facebook.com/username",
  Instagram: "e.g. @username",
  Other: "Enter your contact details",
};

function RegisterPasswordInput({ value, onChange, disabled }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="password-wrapper">
      <input
        id="reg-password"
        className="form-input"
        type={isRevealed ? "text" : "password"}
        name="password"
        placeholder="At least 6 characters"
        value={value}
        onChange={onChange}
        autoComplete="new-password"
        disabled={disabled}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setIsRevealed((prev) => !prev)}
        aria-label={isRevealed ? "Hide password" : "Show password"}
      >
        {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function ContactMethodSelector({ contactMethod, contactValue, onChange, disabled }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label" htmlFor="reg-contact-method">
          Preferred Contact Method{" "}
          <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
        </label>
        <select
          id="reg-contact-method"
          className="form-select"
          name="contactMethod"
          value={contactMethod}
          onChange={onChange}
          disabled={disabled}
        >
          <option value="">None (Select to add contact details)</option>
          <option value="Phone">Phone</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Email">Email</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {contactMethod && (
        <div className="form-group">
          <label className="form-label" htmlFor="reg-contact-value">
            Contact Information{" "}
            <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(required)</span>
          </label>
          <input
            id="reg-contact-value"
            className="form-input"
            type="text"
            name="contactValue"
            placeholder={CONTACT_PLACEHOLDERS[contactMethod] || "Enter your contact details"}
            value={contactValue}
            onChange={onChange}
            disabled={disabled}
            required
          />
        </div>
      )}
    </>
  );
}

function TermsAgreementCheckbox({ agreed, onToggle, disabled }) {
  return (
    <div
      className="form-group checkbox-group"
      style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "1.5rem" }}
    >
      <input
        type="checkbox"
        id="reg-agreed"
        checked={agreed}
        onChange={(event) => onToggle(event.target.checked)}
        disabled={disabled}
        style={{ marginTop: "0.25rem" }}
      />
      <label htmlFor="reg-agreed" style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
        I have read and agree to the{" "}
        <Link to="/terms-of-service" target="_blank">
          Terms of Service
        </Link>
        ,{" "}
        <Link to="/privacy-policy" target="_blank">
          Privacy Policy
        </Link>
        , and{" "}
        <Link to="/community-guidelines" target="_blank">
          Community Guidelines
        </Link>
        .
      </label>
    </div>
  );
}

function validateRegistrationForm(formValues) {
  const username = formValues.username.trim();
  const email = formValues.email.trim();
  const password = formValues.password;

  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (!email) return "Email is required";
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email";
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  if (formValues.contactMethod && !formValues.contactValue.trim()) {
    return "Contact information is required when contact method is specified";
  }
  return null;
}

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    location: "",
    contactMethod: "",
    contactValue: "",
  });
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "contactMethod" && value === "") {
      setForm((prev) => ({ ...prev, contactMethod: "", contactValue: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const validationFailure = validateRegistrationForm(form);
    if (validationFailure) {
      setErrorMessage(validationFailure);
      addToast(validationFailure, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        location: form.location.trim(),
        contactMethod: form.contactMethod,
        contactValue: form.contactValue.trim(),
      });
      login(data.token, data.user);
      addToast(`Account created successfully! Welcome, ${data.user.username}!`, "success");
      navigate("/", { replace: true });
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      addToast("Failed to create account. Please check inputs.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <UserPlus size={24} aria-hidden="true" />
          </div>
          <h1>Create account</h1>
          <p>Join the Lost &amp; Found community</p>
        </div>

        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">
              Username
            </label>
            <input
              id="reg-username"
              className="form-input"
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleInputChange}
              autoComplete="username"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleInputChange}
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password
            </label>
            <RegisterPasswordInput
              value={form.password}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-location">
              Location{" "}
              <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
            </label>
            <input
              id="reg-location"
              className="form-input"
              type="text"
              name="location"
              placeholder="e.g. Kathmandu"
              value={form.location}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>

          <ContactMethodSelector
            contactMethod={form.contactMethod}
            contactValue={form.contactValue}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />

          <TermsAgreementCheckbox
            agreed={hasAgreedToTerms}
            onToggle={setHasAgreedToTerms}
            disabled={isSubmitting}
          />

          <button
            type="submit"
            className="btn btn-primary btn-block auth-submit"
            disabled={isSubmitting || !hasAgreedToTerms}
          >
            {isSubmitting ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
