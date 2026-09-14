import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { loginUser } from "../api/services";
import { getErrorMessage } from "../utils/helpers";
import "../styles/Auth.css";

function PasswordInput({ value, onChange, disabled }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="password-wrapper">
      <input
        id="login-password"
        className="form-input"
        type={isRevealed ? "text" : "password"}
        name="password"
        placeholder="Enter your password"
        value={value}
        onChange={onChange}
        autoComplete="current-password"
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

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const trimmedEmail = credentials.email.trim();
    if (!trimmedEmail || !credentials.password) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await loginUser({
        email: trimmedEmail,
        password: credentials.password,
      });
      login(data.token, data.user);
      addToast(`Welcome back, ${data.user.username}!`, "success");
      navigate("/", { replace: true });
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      addToast("Failed to sign in. Please check your credentials.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <LogIn size={24} aria-hidden="true" />
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your Lost &amp; Found account</p>
        </div>

        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

        <form className="auth-form" onSubmit={handleFormSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={credentials.email}
              onChange={handleFieldChange}
              autoComplete="email"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <PasswordInput
              value={credentials.password}
              onChange={handleFieldChange}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
