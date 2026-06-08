import React, { useEffect, useState, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Authen/Navbar";
import WelcomePage from "./components/Pages/WelcomePage";
import IntroSlides from "./components/Pages/IntroSlides";
import ForgotPasswordPage from "./components/Authen/ForgotPasswordPage";
import VerifyOTP from "./components/Authen/VerifyOTP";
import ResetPassword from "./components/Authen/ResetPassword";
import AuthPage from "./components/Authen/AuthPage";
import AboutPage from "./components/Pages/AboutPage";
import RegisterPage from "./components/Authen/RegisterPage";
import LoginPage from "./components/Authen/LoginPage";
import StudentDashboard from "./components/Dashbords/StudentDashboard";
import AdminDashboard from "./components/Dashbords/AdminDashboard";
import ClearanceForm from "./components/forms/ClearanceForm";
import DepartmentHeadPage from "./components/Pages/DepartmentHeadPage";
import LibrarianPage from "./components/Pages/LibrarianPage";
import PsychologyPage from "./components/Pages/PsychologyPage";
import SportMasterPage from "./components/Pages/SportMasterPage";
import CampusPolicePage from "./components/Pages/CampusPolicePage";
import CooperationSharingPage from "./components/Pages/CooperationSharingPage";
import DOPCordinatorPage from "./components/Pages/DOPCordinatorPage";
import StudentAffairsPage from "./components/Pages/StudentAffairsPage";
import DormitoryPage from "./components/Pages/DormitoryPage";
import CafeteriaPage from "./components/Pages/CafeteriaPage";
import RegistrarPage from "./components/Pages/RegistrarPage";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ProfilePage from "./components/Pages/ProfilePage";
import ChangeProfile from "./components/Pages/ChangeProfile";
import AdminLogin from "./components/Authen/AdminLogin";
 import LearnMorePage from "./components/Pages/LearnMorePage";

// Import the payment components
import StudentPaymentPage from "./components/Payments/StudentPaymentPage";
import StaffPaymentVerification from "./components/Payments/StaffPaymentVerification";

import "./App.css";

/* ===============================
   ✅ Theme Context (Global)
================================= */
export const ThemeContext = createContext();
export function useTheme() {
  return useContext(ThemeContext);
}

/* ===============================
   ✅ Theme Toggle Component
================================= */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <div className="theme-toggle-inner">
        <span className={`sun-icon ${theme === "light" ? "active" : ""}`}>☀️</span>
        <div className={`toggle-slider ${theme === "dark" ? "dark" : ""}`}>
          <div className="toggle-knob"></div>
        </div>
        <span className={`moon-icon ${theme === "dark" ? "active" : ""}`}>🌙</span>
      </div>
    </button>
  );
}

/* ===============================
   ✅ Protected Route
================================= */
function ProtectedRoute({ children, role }) {
  const raw = sessionStorage.getItem("ucs_current");
  if (!raw) {
    // Redirect to appropriate login based on role
    if (role === "admin") {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(raw);
    if (role && user.role !== role) {
      // If trying to access admin but not admin, go to admin login
      if (role === "admin") {
        return <Navigate to="/admin/login" replace />;
      }
      return <Navigate to="/login" replace />;
    }
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

/* ===============================
   ✅ Landing Page
================================= */
function LandingPage() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("ucs_current") || "null");

  const handleStudentClick = () => {
    if (user && user.role === "student") {
      navigate("/student");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="landing-page">
      {/* 🌟 HERO SECTION */}
<section className="hero-section11">
  <div className="hero-content11">
<h1 className="welcome-title">
  <span className="welcome-gradient">WELCOME TO</span>
  <span className="university-gradient">UNIVERSITY</span>
</h1>
    <h1 className="hero-title11">
      <span>Online Clearance System</span>
    </h1>
    <p className="hero-subtitle11">
      Manage your university clearance process easily and efficiently.
    </p>

    <div className="hero-buttons11">
      <button className="hero-btn student-btn" onClick={handleStudentClick}>
        <i className="fas fa-play-circle"></i> Get Started
      </button>
    </div>
  </div>
</section>

      {/* 🧩 PROCESS STEPS */}
      <section className="card-section1">
        <h2 className="section-title">Clearance Process Steps</h2>
        <div className="steps-cards">
          {/* Step 1 */}
          <div className="step-card-modern">
            <div className="step-circle">1</div>
            <div className="step-icon">📝</div>
            <h3>Submit Form</h3>
            <p>Fill out your clearance form accurately using your student dashboard.</p>
            <p>Students can fill out and submit their clearance forms digitally from their dashboard without visiting offices.</p>
            <div className="step-note">📌 Note: Ensure all required fields are completed before submission.</div>
          </div>

          {/* Step 2 */}
          <div className="step-card-dept">
            <div className="step-number">2</div>
            <div className="step-icon">🏢</div>
            <h3>Department Approval</h3>
            <p>Get approval from each responsible department efficiently.</p>
            <small className="step-note">📌 Note: Departments can add comments or request revisions before approval.</small>
          </div>

          {/* Step 3 */}
          <div className="step-card-final">
            <div className="step-number">3</div>
            <div className="step-icon">📚</div>
            <h3>Library,Cafeteria & Dormtery Clearance</h3>
            <p>Ensures students have returned books and cleared cafeteria and dormtery dues.</p>
            <small className="step-note">📌 Note: each staffs can add due register, comments or request revisions before approval.</small>
          </div>

          {/* Step 4 */}
          <div className="info-card-modern">
            <div className="card-icon">🎓</div>
            <h3>Final Registrar Clearance</h3>
            <p>After all approvals, the registrar grants the final clearance digitally.</p>
            <div className="card-note">📌 Note: Students can track status updates at any stage.</div>
          </div>

          {/* Step 5 */}
          <div className="info-card-modern">
            <div className="card-icon">⚡</div>
            <h3>Instant Notifications</h3>
            <p>Students and staff receive notifications for approvals, pending items, and messages instantly.</p>
            <div className="card-note">📌 Note: Alerts can be sent via email or in-app notifications.</div>
          </div>
        </div>

        {/* 📘 About University */}
<div className="info-card">
<h2>📘 About the University</h2>
<p>
Welcome to our <strong>University</strong> a center of
<strong> academic excellence</strong>, <strong>innovation</strong>,
and <strong>community development</strong>.
</p>


<p>
Our <strong>Online Clearance System</strong>, known as
<strong> “Monty”</strong>, simplifies and modernizes the clearance process
for students and administrative offices.
</p>


<p>
Monty helps to <strong>save time</strong>,
<strong> reduce paperwork</strong>, and
<strong> improve transparency</strong> across all departments.
</p>
</div>


{/* Rules & Regulations */}
<div className="info-card highlight">
<h2>📋 Rules & Regulations</h2>
<ul>
<li>All financial and departmental dues must be cleared.</li>
<li>Valid student identification is required.</li>
<li>Follow each department’s instructions carefully.</li>
<li>All deadlines are strict and must be respected.</li>
</ul>
</div>
      </section>
    </div>
  );
}

/* ===============================
   ✅ Splash Screen
================================= */
function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-background"></div>
      <img
        src="../images/MAU.jpg"
        alt="Mekdela Amba University"
        className="splash-logo"
      />
      <h1 className="splash-text">
        Welcome To MAU Student Online Clearance System
      </h1>
      <div className="loading-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  );
}

/* ===============================
   ✅ MAIN APP COMPONENT
================================= */
export default function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });
  const [message, setMessage] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    document.body.classList.add(theme + "-theme");
    
    // Apply theme class to HTML root
    document.documentElement.setAttribute("data-theme", theme);
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

useEffect(() => {
  // Use your actual backend API URL
  fetch("https://clearances.onrender.com/api/view/")
    .then((res) => res.json())
    .then((data) => setMessage(data.message))
    .catch((err) => console.error("API fetch error:", err));
}, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Router>
        <div className="app-root">
          {showSplash ? (
            <SplashScreen onFinish={() => setShowSplash(false)} />
          ) : (
            <>
              <Header />

              <div className="main-layout">
                <Navbar />
                <main className="content-area">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/welcome" element={<WelcomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    {/* REMOVE THIS LINE: <Route path="/PaymentPage" element={<PaymentPage />} /> */}
                    <Route path="/payment" element={
                      <ProtectedRoute role="student">
                        <StudentPaymentPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/intro" element={<IntroSlides />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/change-profile" element={<ChangeProfile />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/learn-more" element={<LearnMorePage />} />
                    <Route path="/student/payments" element={<StudentPaymentPage />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* STUDENT ROUTES */}
                    <Route
                      path="/student"
                      element={
                        <ProtectedRoute role="student">
                          <StudentDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clearance-form"
                      element={
                        <ProtectedRoute role="student">
                          <ClearanceForm />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* STUDENT PAYMENT ROUTES */}
                    <Route
                      path="/student/payments"
                      element={
                        <ProtectedRoute role="student">
                          <StudentPaymentPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* OFFICE ROUTES */}
                    <Route
                      path="/departmenthead"
                      element={
                        <ProtectedRoute role="departmenthead">
                          <DepartmentHeadPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/librarian"
                      element={
                        <ProtectedRoute role="librarian">
                          <LibrarianPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cafeteria"
                      element={
                        <ProtectedRoute role="cafeteria">
                          <CafeteriaPage />
                        </ProtectedRoute>
                      }
                    />
                    {/* ==================== PSYCHOLOGY ROUTES ==================== */}
<Route
  path="/psychology"
  element={
    <ProtectedRoute role="psychology">
      <PsychologyPage />
    </ProtectedRoute>
  }
/>

{/* ==================== SPORT MASTER ROUTES ==================== */}
<Route
  path="/sportmaster"
  element={
    <ProtectedRoute role="sportmaster">
      <SportMasterPage />
    </ProtectedRoute>
  }
/>

{/* ==================== CAMPUS POLICE ROUTES ==================== */}
<Route
  path="/campuspolice"
  element={
    <ProtectedRoute role="campuspolice">
      <CampusPolicePage />
    </ProtectedRoute>
  }
/>

{/* ==================== COOPERATION SHARING ROUTES ==================== */}
<Route
  path="/cooperationsharing"
  element={
    <ProtectedRoute role="cooperationsharing">
      <CooperationSharingPage />
    </ProtectedRoute>
  }
/>

{/* ==================== DOP CORDINATOR ROUTES ==================== */}
<Route
  path="/dopcordinator"
  element={
    <ProtectedRoute role="dopcordinator">
      <DOPCordinatorPage />
    </ProtectedRoute>
  }
/>

{/* ==================== STUDENT AFFAIRS ROUTES ==================== */}
<Route
  path="/studentaffairs"
  element={
    <ProtectedRoute role="studentaffairs">
      <StudentAffairsPage />
    </ProtectedRoute>
  }
/>
                    <Route
                      path="/dormitory"
                      element={
                        <ProtectedRoute role="dormitory">
                          <DormitoryPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/registrar"
                      element={
                        <ProtectedRoute role="registrar">
                          <RegistrarPage />
                        </ProtectedRoute>
                      }
                    />
                      <Route
    path="/staff/payments"
    element={
      <ProtectedRoute>
        <StaffPaymentVerification />
      </ProtectedRoute>
    }
  />
                    
                    {/* STAFF PAYMENT VERIFICATION ROUTES */}
                    <Route
                      path="/librarian/payments"
                      element={
                        <ProtectedRoute role="librarian">
                          <StaffPaymentVerification />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cafeteria/payments"
                      element={
                        <ProtectedRoute role="cafeteria">
                          <StaffPaymentVerification />
                        </ProtectedRoute>
                      }
                    />
                    <Route
  path="/psychology/payments"
  element={
    <ProtectedRoute role="psychology">
      <StaffPaymentVerification />
    </ProtectedRoute>
  }
/>
<Route
  path="/sportmaster/payments"
  element={
    <ProtectedRoute role="sportmaster">
      <StaffPaymentVerification />
    </ProtectedRoute>
  }
/>

<Route
  path="/campuspolice/payments"
  element={
    <ProtectedRoute role="campuspolice">
      <StaffPaymentVerification />
    </ProtectedRoute>
  }
/>

<Route
  path="/cooperationsharing/payments"
  element={
    <ProtectedRoute role="cooperationsharing">
      <StaffPaymentVerification />
    </ProtectedRoute>
  }
/>
<Route
  path="/dopcordinator/payments"
  element={
    <ProtectedRoute role="dopcordinator">
      <StaffPaymentVerification />
    </ProtectedRoute>
  }
/>
<Route
  path="/studentaffairs/payments"
  element={
    <ProtectedRoute role="studentaffairs">
      <StaffPaymentVerification />
    </ProtectedRoute>
  }
/>
                    <Route
                      path="/dormitory/payments"
                      element={
                        <ProtectedRoute role="dormitory">
                          <StaffPaymentVerification />
                        </ProtectedRoute>
                      }
                    />

                    {/* ADMIN DASHBOARD */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute role="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch all route - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>

              <Footer />
            </>
          )}
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}