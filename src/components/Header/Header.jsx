// src/components/Header/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import { clearSession } from "../../utils/api";
import { useTheme } from "../../App";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const [open, setOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Get logged-in user
  const userRaw = sessionStorage.getItem("ucs_current");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // Logout function
  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <header
      className="header"
      style={{
        background: "var(--header-bg)",
        color: "var(--header-text)",
      }}
    >
      <div className="header-container">

        {/* LEFT LOGO WITH TEXT */}
        <div className="header-logo">
          <img
            className="logo-img"
            src="/images/MAU.jpg"
            alt="University Logo"
          />
          <Link to="/" onClick={handleLinkClick} className="logo-text">
            Online Clearance
          </Link>
        </div>

        {/* MOBILE MENU BUTTON - Only visible on mobile */}
        <button
          className="menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✖" : "☰"}
        </button>

        {/* NAVIGATION MENU - Desktop always visible, mobile toggle */}
        <nav className={`nav ${open ? "open" : ""}`}>
          {/* PUBLIC LINKS - Always visible for non-logged in users */}
          {!user && (
            <>
              <Link to="/" onClick={handleLinkClick}>Home</Link>
              <Link to="/about" onClick={handleLinkClick}>About</Link>
              <Link to="/register" onClick={handleLinkClick}>Register</Link>
              {/* Sign In button inside mobile menu */}
              <Link to="/login" onClick={handleLinkClick} className="mobile-signin">Sign In</Link>
            </>
          )}

          {/* ROLE-SPECIFIC LINKS - For logged in users */}
          {user?.role === "student" && (
            <Link to="/student" onClick={handleLinkClick}>Student Dashboard</Link>
          )}
          {user?.role === "departmenthead" && (
            <Link to="/departmenthead" onClick={handleLinkClick}>Department</Link>
          )}
          {user?.role === "librarian" && (
            <Link to="/librarian" onClick={handleLinkClick}>Library</Link>
          )}
          {user?.role === "dormitory" && (
            <Link to="/dormitory" onClick={handleLinkClick}>Dormitory</Link>
          )}
          {user?.role === "cafeteria" && (
            <Link to="/cafeteria" onClick={handleLinkClick}>Cafeteria</Link>
          )}
          {user?.role === "registrar" && (
            <Link to="/registrar" onClick={handleLinkClick}>Registrar</Link>
          )}
          {user?.role === "psychology" && (
            <Link to="/psychology" onClick={handleLinkClick}>Psychology</Link>
          )}
          {user?.role === "sportmaster" && (
            <Link to="/sportmaster" onClick={handleLinkClick}>Sport Master</Link>
          )}
          {user?.role === "campuspolice" && (
            <Link to="/campuspolice" onClick={handleLinkClick}>Campus Police</Link>
          )}
          {user?.role === "cooperationsharing" && (
            <Link to="/cooperationsharing" onClick={handleLinkClick}>Cooperation Sharing</Link>
          )}
          {user?.role === "dopcordinator" && (
            <Link to="/dopcordinator" onClick={handleLinkClick}>DOP Cordinator</Link>
          )}
          {user?.role === "studentaffairs" && (
            <Link to="/studentaffairs" onClick={handleLinkClick}>Student Affairs</Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" onClick={handleLinkClick}>Admin</Link>
          )}

          {/* Logout button inside mobile menu for logged in users */}
          {user && (
            <button
              className="mobile-logout"
              onClick={() => {
                handleLogout();
                handleLinkClick();
              }}
            >
              Logout
            </button>
          )}
        </nav>

        {/* RIGHT SIDE - Auth buttons and theme toggle (Desktop only) */}
        <div className="header-right">
          {/* AUTH SECTION - Desktop only */}
          <div className="header-auth desktop-only">
            {user ? (
              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <Link className="signin-btn" to="/login">
                Sign In
              </Link>
            )}
          </div>

          {/* THEME TOGGLE - Larger size */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon size={24} />
            ) : (
              <Sun size={24} />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}