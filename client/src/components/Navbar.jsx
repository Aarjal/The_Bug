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
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useTheme } from "../context/ThemeContext";
import "../styles/Layout.css";

function getAccountInitials(username) {
  if (!username) return "?";
  return username.slice(0, 2).toUpperCase();
}

function NavNotificationBadge({ count, top = "2px", left = "22px" }) {
  if (!count || count <= 0) return null;

  return (
    <span
      style={{
        position: "absolute",
        top,
        left,
        background: "var(--danger)",
        color: "#fff",
        fontSize: "0.65rem",
        fontWeight: "bold",
        borderRadius: "50%",
        minWidth: "16px",
        height: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
        boxShadow: "0 0 0 2px var(--bg-card)",
        lineHeight: 1,
      }}
    >
      {count}
    </span>
  );
}

function ThemeModeSelector({ currentTheme, onSelectTheme, extraClassName = "" }) {
  const themeOptions = [
    { key: "light", label: "Light", Icon: Sun },
    { key: "dark", label: "Dark", Icon: Moon },
    { key: "system", label: "System", Icon: Monitor },
  ];

  return (
    <div className={`dropdown-theme-section ${extraClassName}`}>
      <span className="dropdown-theme-title">Theme</span>
      <div className="theme-options-grid">
        {themeOptions.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelectTheme(key)}
            className={`theme-btn ${currentTheme === key ? "active" : ""}`}
          >
            <Icon size={14} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function UserAvatarBadge({ user }) {
  if (user?.profilePicture) {
    return <img src={user.profilePicture} alt={user.username} />;
  }
  return <span className="avatar-fallback">{getAccountInitials(user?.username)}</span>;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount, unreadClaimsCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownMenuRef = useRef(null);

  useEffect(() => {
    function handlePointerDownOutside(event) {
      if (dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDownOutside);
    return () => document.removeEventListener("mousedown", handlePointerDownOutside);
  }, []);

  const [activeRouteKey, setActiveRouteKey] = useState(location.pathname + location.search);
  const currentRouteKey = location.pathname + location.search;

  if (activeRouteKey !== currentRouteKey) {
    setActiveRouteKey(currentRouteKey);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const isLostCreateActive = location.pathname === "/create" && location.search === "?type=lost";
  const isFoundCreateActive = location.pathname === "/create" && location.search === "?type=found";

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="Lost & Found" className="logo-img" />
        </Link>

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
                <NavLink
                  to="/create?type=lost"
                  className={`nav-link ${isLostCreateActive ? "active" : ""}`}
                >
                  <PlusCircle size={18} />
                  <span>Report Lost</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/create?type=found"
                  className={`nav-link ${isFoundCreateActive ? "active" : ""}`}
                >
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
                <NavLink to="/claims" className="nav-link" style={{ position: "relative" }}>
                  <FileCheck size={18} />
                  <span>Claims</span>
                  <NavNotificationBadge count={unreadClaimsCount} />
                </NavLink>
              </li>
              <li>
                <NavLink to="/notifications" className="nav-link" style={{ position: "relative" }}>
                  <Bell size={18} />
                  <span>Notifications</span>
                  <NavNotificationBadge count={unreadCount} />
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="nav-actions">
          {user ? (
            <div className="profile-menu-container" ref={dropdownMenuRef}>
              <button
                className="profile-btn"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-label="User profile menu"
              >
                <div className="avatar">
                  <UserAvatarBadge user={user} />
                </div>
              </button>

              {isDropdownOpen && (
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

                  <ThemeModeSelector currentTheme={theme} onSelectTheme={setTheme} />

                  <button onClick={handleSignOut} className="dropdown-item dropdown-item-danger">
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

        <button
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          style={{ position: "relative" }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          {!isMobileMenuOpen && (unreadCount > 0 || unreadClaimsCount > 0) && (
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
                boxShadow: "0 0 0 2px var(--bg-card)",
              }}
            />
          )}
        </button>
      </div>

      <div
        className={`mobile-nav ${isMobileMenuOpen ? "open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div className="mobile-menu-content" onClick={(event) => event.stopPropagation()}>
          <NavLink to="/" end className="mobile-nav-link">
            <Search size={18} />
            <span>Browse Feed</span>
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/create?type=lost"
                className={`mobile-nav-link ${isLostCreateActive ? "active" : ""}`}
              >
                <PlusCircle size={18} />
                <span>Report Lost Item</span>
              </NavLink>
              <NavLink
                to="/create?type=found"
                className={`mobile-nav-link ${isFoundCreateActive ? "active" : ""}`}
              >
                <PlusCircle size={18} />
                <span>Report Found Item</span>
              </NavLink>
              <NavLink to="/my-posts" className="mobile-nav-link">
                <FileText size={18} />
                <span>My Items</span>
              </NavLink>
              <NavLink to="/claims" className="mobile-nav-link" style={{ position: "relative" }}>
                <FileCheck size={18} />
                <span>Claims</span>
                <NavNotificationBadge count={unreadClaimsCount} top="10px" left="24px" />
              </NavLink>
              <NavLink to="/notifications" className="mobile-nav-link" style={{ position: "relative" }}>
                <Bell size={18} />
                <span>Notifications</span>
                <NavNotificationBadge count={unreadCount} top="10px" left="24px" />
              </NavLink>

              <div className="mobile-nav-user">
                <div className="mobile-user-card">
                  <div className="avatar">
                    <UserAvatarBadge user={user} />
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

                <ThemeModeSelector
                  currentTheme={theme}
                  onSelectTheme={setTheme}
                  extraClassName="mobile-theme-section"
                />

                <button
                  onClick={handleSignOut}
                  className="dropdown-item dropdown-item-danger"
                  style={{ borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem" }}
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                borderTop: "1px solid var(--border)",
                paddingTop: "1rem",
                marginTop: "0.5rem",
              }}
            >
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
