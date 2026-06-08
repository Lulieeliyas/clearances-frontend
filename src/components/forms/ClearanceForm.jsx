import React, { useEffect, useState,useCallback } from "react";
import { apiRequest } from "../../utils/api";
import "./ClearanceForm.css";

export default function ClearanceForm() {
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [existingForms, setExistingForms] = useState([]);
  const [hasActiveForm, setHasActiveForm] = useState(false);
  const [activeFormStatus, setActiveFormStatus] = useState("");
  const [checkingForms, setCheckingForms] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    idNumber: "",
    academicYear: "",
    programLevel: "",
    enrollmentType: "",
    college: "",
    department: "",
    section: "",
    lastAttendance: "",
    year: "",
    semester: "",
    reason: "",
  });

  // Get user session
  const getSession = () => {
    const session = sessionStorage.getItem("ucs_current");
    return session ? JSON.parse(session) : null;
  };

  // Check if user has an active form
const checkActiveForms = useCallback(async () => {
    setCheckingForms(true);
    try {
      const session = getSession();
      if (!session || !session.token) {
        setCheckingForms(false);
        return;
      }

      // Get all forms for the current student
      const forms = await apiRequest.get('forms/student/');
      setExistingForms(forms || []);
      
      // Check for any non-rejected form
      const activeForm = forms?.find(form => 
        form.status !== 'rejected' && 
        form.status !== 'pending_resubmission'
      );
      
      if (activeForm) {
        setHasActiveForm(true);
        setActiveFormStatus(activeForm.status);
        
        // Pre-fill form with existing data if needed
        setFormData(prev => ({
          ...prev,
          firstName: activeForm.full_name?.split(' ')[0] || '',
          middleName: activeForm.full_name?.split(' ')[1] || '',
          lastName: activeForm.full_name?.split(' ').slice(2).join(' ') || '',
          idNumber: activeForm.id_number || '',
          academicYear: activeForm.academic_year || '',
          programLevel: activeForm.program_level || '',
          enrollmentType: activeForm.enrollment_type || '',
          college: activeForm.college || '',
          department: activeForm.department_name || '',
          section: activeForm.section || '',
          lastAttendance: activeForm.last_attendance || '',
          year: activeForm.year || '',
          semester: activeForm.semester || '',
          reason: activeForm.reason || '',
        }));
      }
    } catch (err) {
      console.error("Failed to check active forms:", err);
    } finally {
      setCheckingForms(false);
    }
  },[]);

  /* ================= LOAD COLLEGES & DEPARTMENTS ================= */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        // Check if user is logged in
        const session = getSession();
        if (!session || !session.token) {
          setError("Please login first");
          setLoading(false);
          return;
        }

        // Load colleges and departments
        const collegesData = await apiRequest.get('colleges/');
        const departmentsData = await apiRequest.get('departments/');
        
        setColleges(collegesData || []);
        setDepartments(departmentsData || []);
        
        // Check active forms
        await checkActiveForms();
        
      } catch (err) {
        console.error("Failed to load data:", err);
        if (err.message.includes("401") || err.message.includes("403")) {
          setError("Session expired. Please login again.");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          setError(`Failed to load data: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [checkActiveForms]);

  /* ================= FILTER DEPARTMENTS BY COLLEGE ================= */
  useEffect(() => {
    if (!formData.college) {
      setFilteredDepartments([]);
      setFormData(prev => ({ ...prev, department: "" }));
      return;
    }

    const filtered = departments.filter(
      (d) => d.college && String(d.college) === String(formData.college)
    );

    setFilteredDepartments(filtered);
    
    // Reset department if it's not in the filtered list
    if (formData.department && !filtered.some(d => d.name === formData.department)) {
      setFormData(prev => ({ ...prev, department: "" }));
    }
  }, [formData.college, departments, formData.department]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    if (hasActiveForm) return; // Don't allow changes if active form exists
    
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ================= VALIDATE FORM ================= */
  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'idNumber', 'academicYear',
      'programLevel', 'enrollmentType', 'college', 'department',
      'section', 'lastAttendance', 'year', 'semester', 'reason'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        return `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    }

    const idPattern = /^[A-Za-z]{3,4}\d+$/;
    if (!idPattern.test(formData.idNumber)) {
      return "Invalid ID format (Example: CSE1234)";
    }

    // Validate date
    const selectedDate = new Date(formData.lastAttendance);
    const today = new Date();
    if (selectedDate > today) {
      return "Last attendance date cannot be in the future";
    }

    return null;
  };

  /* ================= GET COLLEGE NAME ================= */
  const getCollegeName = (collegeId) => {
    const college = colleges.find(c => String(c.id) === String(collegeId));
    return college ? college.name : "";
  };

  /* ================= SUBMIT FORM ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (hasActiveForm) {
      alert("You already have an active form. Please wait for it to be processed.");
      return;
    }
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    // Get college name for display
    const collegeName = getCollegeName(formData.college);

    const payload = {
      full_name: `${formData.firstName.trim()} ${formData.middleName.trim()} ${formData.lastName.trim()}`.replace(/\s+/g, ' '),
      id_number: formData.idNumber.trim(),
      academic_year: formData.academicYear.trim(),
      program_level: formData.programLevel,
      enrollment_type: formData.enrollmentType,
      college: collegeName,
      department_name: formData.department,
      section: formData.section.trim(),
      last_attendance: formData.lastAttendance,
      year: formData.year,
      semester: formData.semester,
      reason: formData.reason.trim(),
    };

    console.log("Submitting form:", payload);

    try {
      const result = await apiRequest.post('forms/submit/', payload);
      
      alert(result.message || "Form submitted successfully! It will be reviewed by your department head.");
      
      // Reset form
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        idNumber: "",
        academicYear: "",
        programLevel: "",
        enrollmentType: "",
        college: "",
        department: "",
        section: "",
        lastAttendance: "",
        year: "",
        semester: "",
        reason: "",
      });
      
      // Redirect to status page after 2 seconds
      setTimeout(() => {
        window.location.href = "/student-dashboard?tab=status";
      }, 2000);
      
    } catch (err) {
      console.error("Submission error:", err);
      setError(`Submission failed: ${err.message}`);
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= GET STATUS MESSAGE ================= */
  const getStatusMessage = () => {
    if (!hasActiveForm) return null;
    
    const statusMessages = {
      'pending_department': 'Your form is pending review by the Department Head',
      'approved_department': 'Your form has been approved by Department Head and is pending Library review',
      'approved_library': 'Your form has been approved by Library and is pending Cafeteria review',
      'approved_cafeteria': 'Your form has been approved by Cafeteria and is pending Dormitory review',
      'approved_dormitory': 'Your form has been approved by Dormitory and is pending Registrar review',
      'Cleared by Registrar': 'Your form has been fully cleared!',
      'requires_library_payment': 'Your form requires library payment',
      'requires_cafeteria_payment': 'Your form requires cafeteria payment',
      'requires_dormitory_payment': 'Your form requires dormitory payment',
      'pending_resubmission': 'Your form is pending resubmission'
    };
    
    return statusMessages[activeFormStatus] || `Your form is being processed (Status: ${activeFormStatus})`;
  };

  /* ================= RENDER LOADING ================= */
  if (loading || checkingForms) {
    return (
      <div className="form-page">
        <div className="form-container loading-container">
          <div className="spinner"></div>
          <p>Loading your information...</p>
        </div>
      </div>
    );
  }

  /* ================= RENDER ERROR ================= */
  if (error) {
    return (
      <div className="form-page">
        <div className="form-container error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <div className="button-group">
            <button 
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.href = "/login"}
              className="login-btn"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= RENDER ACTIVE FORM MESSAGE ================= */
  if (hasActiveForm) {
    return (
      <div className="form-page">
        <div className="form-container active-form-container">
          <div className="active-form-icon">📋</div>
          <h2 className="active-form-title">You Already Have an Active Clearance Form</h2>
          <div className="active-form-message">
            <p>{getStatusMessage()}</p>
            <div className="status-badge">
              Status: <span className={`status-${activeFormStatus?.toLowerCase().replace(/_/g, '-')}`}>
                {activeFormStatus?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <div className="active-form-actions">
            <button 
              onClick={() => window.location.href = "/student-dashboard?tab=status"}
              className="view-status-btn"
            >
              View Form Status
            </button>
            <button 
              onClick={() => window.location.href = "/student-dashboard"}
              className="dashboard-btn"
            >
              Go to Dashboard
            </button>
          </div>
          <p className="active-form-note">
            You can only submit one clearance form at a time. 
            {activeFormStatus === 'rejected' ? 
              ' Your form was rejected. You can submit a new one.' : 
              ' Please wait until your current form is processed or rejected before submitting another.'}
          </p>
        </div>
      </div>
    );
  }

  /* ================= RENDER FORM ================= */
  return (
    <div className="form-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h1 className="form-title">Student Clearance Form</h1>
        <p className="form-subtitle">
          Fill out all fields. Your form will be sent to your department head for approval.
          {existingForms.some(f => f.status === 'rejected') && (
            <span className="rejected-note">
              <br />
              <strong>Note:</strong> Your previous form was rejected. You can submit a new one.
            </span>
          )}
        </p>

        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="three-input-row">
            <input 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              placeholder="First Name *" 
              required 
              disabled={submitting || hasActiveForm}
            />
            <input 
              name="middleName" 
              value={formData.middleName} 
              onChange={handleChange} 
              placeholder="Middle Name *" 
              required 
              disabled={submitting || hasActiveForm}
            />
            <input 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              placeholder="Last Name *" 
              required 
              disabled={submitting || hasActiveForm}
            />
          </div>

          <div className="input-with-note">
            <input 
              name="idNumber" 
              value={formData.idNumber} 
              onChange={handleChange} 
              placeholder="ID Number (Example: CSE1234) *" 
              required 
              disabled={submitting || hasActiveForm}
              className="id-input"
            />
            <small>Format: 3-4 letters followed by numbers (e.g., CSE1234, IT456)</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Academic Information</h3>
          <input 
            name="academicYear" 
            value={formData.academicYear} 
            onChange={handleChange} 
            placeholder="Academic Year (e.g., 2024/2025) *" 
            required 
            disabled={submitting || hasActiveForm}
          />

          <div className="select-row">
            <select 
              name="programLevel" 
              value={formData.programLevel} 
              onChange={handleChange} 
              required 
              disabled={submitting || hasActiveForm}
            >
              <option value="">Program Level *</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Graduate">Graduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>

            <select 
              name="enrollmentType" 
              value={formData.enrollmentType} 
              onChange={handleChange} 
              required 
              disabled={submitting || hasActiveForm}
            >
              <option value="">Enrollment Type *</option>
              <option value="Regular Full Time">Regular Full Time</option>
              <option value="Regular Part Time">Regular Part Time</option>
              <option value="Extension">Extension</option>
              <option value="Summer">Summer</option>
              <option value="Distance Education">Distance Education</option>
            </select>
          </div>

          <div className="select-row">
            <select 
              name="college" 
              value={formData.college} 
              onChange={handleChange} 
              required 
              disabled={submitting || hasActiveForm || colleges.length === 0}
              className={colleges.length === 0 ? "disabled-select" : ""}
            >
              <option value="">Select College *</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select 
              name="department" 
              value={formData.department} 
              onChange={handleChange} 
              required 
              disabled={submitting || hasActiveForm || filteredDepartments.length === 0 || !formData.college}
              className={filteredDepartments.length === 0 ? "disabled-select" : ""}
            >
              <option value="">Select Department *</option>
              {filteredDepartments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {formData.college && (
            <div className="info-bubble">
              <strong>Selected College:</strong> {getCollegeName(formData.college)}
              {formData.department && (
                <><br /><strong>Selected Department:</strong> {formData.department}</>
              )}
            </div>
          )}

          <input 
            name="section" 
            value={formData.section} 
            onChange={handleChange} 
            placeholder="Section (e.g., A, B, C) *" 
            required 
            disabled={submitting || hasActiveForm}
          />
        </div>

        <div className="form-section">
          <h3>Attendance Information</h3>
          <div className="date-row">
            <label>Last Attendance Date *</label>
            <input 
              type="date" 
              name="lastAttendance" 
              value={formData.lastAttendance} 
              onChange={handleChange} 
              required 
              disabled={submitting || hasActiveForm}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="select-row">
            <select 
              name="year" 
              value={formData.year} 
              onChange={handleChange} 
              required 
              disabled={submitting || hasActiveForm}
            >
              <option value="">Class Year *</option>
              <option value="RMD">RMD</option>
              <option value="freshman">Freshman</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
              <option value="VI">VI</option>
              <option value="VII">VII</option>
              <option value="VIII">VIII</option>
            </select>

            <select 
              name="semester" 
              value={formData.semester} 
              onChange={handleChange} 
              required 
              disabled={submitting || hasActiveForm}
            >
              <option value="">Semester *</option>
              <option value="I">I</option>
              <option value="II">II</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Clearance Reason</h3>
          <div className="input-with-note">
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="5"
              placeholder="Please explain the reason for clearance in detail *"
              required
              disabled={submitting || hasActiveForm}
              className="reason-textarea"
            />
            <small>Explain why you need clearance (e.g., graduation, transfer, withdrawal, etc.)</small>
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="form-btn" 
            type="submit" 
            disabled={submitting || hasActiveForm || colleges.length === 0}
          >
            {submitting ? (
              <>
                <span className="spinner-small"></span>
                Submitting...
              </>
            ) : hasActiveForm ? (
              "Form Already Submitted"
            ) : (
              "Submit Clearance Form"
            )}
          </button>
          
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => window.location.href = "/student-dashboard"}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>

        {colleges.length === 0 && !loading && (
          <div className="error-message">
            <strong>Warning:</strong> No colleges found. Please contact the administrator.
          </div>
        )}
      </form>
    </div>
  );
}