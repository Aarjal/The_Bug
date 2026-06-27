import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { registerUser } from "../api/services";
import { getErrorMessage } from "../utils/helpers";
import "../styles/Auth.css";

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to home
  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactMethod" && value === "") {
      setForm({ ...form, contactMethod: "", contactValue: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
    if (error) setError("");
  };

  const validate = () => {
    if (!form.username.trim()) return "Username is required";
    if (form.username.trim().length < 3)
      return "Username must be at least 3 characters";
    if (!form.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return "Please enter a valid email";
    if (!form.password) return "Password is required";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    if (form.contactMethod && !form.contactValue.trim())
      return "Contact information is required when contact method is specified";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      addToast(validationError, "error");
      return;
    }

    setLoading(true);
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
      setError(getErrorMessage(err));
      addToast("Failed to create account. Please check inputs.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <UserPlus size={24} />
          </div>
          <h1>Create account</h1>
          <p>Join the Lost &amp; Found community</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

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
              onChange={handleChange}
              autoComplete="username"
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
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password
            </label>
            <div className="password-wrapper">
              <input
                id="reg-password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-location">
              Location{" "}
              <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
                (optional)
              </span>
            </label>
            <input
              id="reg-location"
              className="form-input"
              type="text"
              name="location"
              placeholder="e.g. Kathmandu"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-contact-method">
              Preferred Contact Method{" "}
              <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
                (optional)
              </span>
            </label>
            <select
              id="reg-contact-method"
              className="form-select"
              name="contactMethod"
              value={form.contactMethod}
              onChange={handleChange}
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

          {form.contactMethod && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-contact-value">
                Contact Information{" "}
                <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
                  (required)
                </span>
              </label>
              <input
                id="reg-contact-value"
                className="form-input"
                type="text"
                name="contactValue"
                placeholder={
                  form.contactMethod === "Phone"
                    ? "e.g. +977 9876543210"
                    : form.contactMethod === "WhatsApp"
                    ? "e.g. +977 9876543210"
                    : form.contactMethod === "Email"
                    ? "e.g. contact@domain.com"
                    : form.contactMethod === "Facebook"
                    ? "e.g. facebook.com/username"
                    : form.contactMethod === "Instagram"
                    ? "e.g. @username"
                    : "Enter your contact details"
                }
                value={form.contactValue}
                onChange={handleChange}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block auth-submit"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
