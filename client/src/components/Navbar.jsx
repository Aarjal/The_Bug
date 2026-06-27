import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  PlusCircle,
  FileText,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  FileCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import "../styles/Layout.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (username) => {
    if (!username) return "?";
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="Lost & Found" className="logo-img" />
          {/* <span>Lost &amp; Found</span> */}
        </Link>

        {/* Desktop Menu */}
        <ul className="nav-menu">
          <li>
            <NavLink to="/" end className="nav-link">
              <Search size={18} />
              <span>Browse Feed</span>
            </NavLink>
          </li>
          {user && (
            <>
              <li>
                <NavLink to="/create?type=lost" className="nav-link">
                  <PlusCircle size={18} />
                  <span>Report Lost</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/create?type=found" className="nav-link">
                  <PlusCircle size={18} />
                  <span>Report Found</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-posts" className="nav-link">
                  <FileText size={18} />
                  <span>My Items</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/claims" className="nav-link">
                  <FileCheck size={18} />
                  <span>Claims</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/notifications" className="nav-link" style={{ position: "relative" }}>
                  <Bell size={18} />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: "22px",
                        background: "var(--danger)",
                        color: "#fff",
                        fontSize: "0.65rem",
                        fontWeight: "bold",
                        borderRadius: "50%",
                        minWidth: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifycontent: "center",
                        padding: "0 4px",
                        boxShadow: "0 0 0 2px #fff",
                        lineHeight: 1
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Desktop Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="profile-menu-container" ref={dropdownRef}>
              <button
                className="profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="User profile menu"
              >
                <div className="avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.username} />
                  ) : (
                    <span className="avatar-fallback">{getInitials(user.username)}</span>
                  )}
                </div>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <span className="dropdown-username">{user.username}</span>
                      <span className="dropdown-email">{user.email}</span>
                      {user.role === "admin" && (
                        <span
                          className="badge badge-found"
                          style={{ alignSelf: "flex-start", marginTop: "0.25rem", fontSize: "0.65rem" }}
                        >
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  {user.role === "admin" && (
                    <Link to="/admin" className="dropdown-item">
                      <User size={16} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link to="/login" className="btn btn-outline btn-sm" style={{ padding: "0.45rem 1rem" }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ padding: "0.45rem 1rem" }}>
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          style={{ position: "relative" }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          {!mobileMenuOpen && unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                background: "var(--danger)",
                color: "#fff",
                fontSize: "0.6rem",
                fontWeight: "bold",
                borderRadius: "50%",
                width: "8px",
                height: "8px",
                boxShadow: "0 0 0 2px #fff",
              }}
            />
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      <div className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)}>
        <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
          <NavLink to="/" end className="mobile-nav-link">
            <Search size={18} />
            <span>Browse Feed</span>
          </NavLink>

          {user ? (
            <>
              <NavLink to="/create?type=lost" className="mobile-nav-link">
                <PlusCircle size={18} />
                <span>Report Lost Item</span>
              </NavLink>
              <NavLink to="/create?type=found" className="mobile-nav-link">
                <PlusCircle size={18} />
                <span>Report Found Item</span>
              </NavLink>
              <NavLink to="/my-posts" className="mobile-nav-link">
                <FileText size={18} />
                <span>My Items</span>
              </NavLink>
              <NavLink to="/claims" className="mobile-nav-link">
                <FileCheck size={18} />
                <span>Claims</span>
              </NavLink>
              <NavLink to="/notifications" className="mobile-nav-link" style={{ position: "relative" }}>
                <Bell size={18} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "24px",
                      background: "var(--danger)",
                      color: "#fff",
                      fontSize: "0.62rem",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      minWidth: "15px",
                      height: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                      lineHeight: 1
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </NavLink>

              <div className="mobile-nav-user">
                <div className="mobile-user-card">
                  <div className="avatar">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.username} />
                    ) : (
                      <span className="avatar-fallback">{getInitials(user.username)}</span>
                    )}
                  </div>
                  <div className="mobile-user-details">
                    <span className="mobile-username">{user.username}</span>
                    <span className="mobile-email">{user.email}</span>
                  </div>
                </div>
                {user.role === "admin" && (
                  <NavLink to="/admin" className="mobile-nav-link">
                    <User size={18} />
                    <span>Admin Dashboard</span>
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="dropdown-item dropdown-item-danger"
                  style={{ borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem" }}
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "0.5rem" }}>
              <Link to="/login" className="btn btn-outline btn-block">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-block">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
