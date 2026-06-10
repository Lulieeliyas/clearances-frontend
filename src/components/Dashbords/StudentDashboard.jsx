import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClearanceForm from "../forms/ClearanceForm";
import "../Dashbords/studentDashboard.css";
import axios from "axios";
import ChatSystem from "../../Chat/ChatSystem";
import ChatRooms from "../../Chat/ChatRooms";
import {
  message,
} from "antd";

import { API_BASE } from '../../utils/api.jsx';


export default function StudentDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [forms, setForms] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  // Chat states
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [chatDepartments, setChatDepartments] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Define latestForm here, before using it
  const latestForm = forms.length > 0 ? forms[0] : null;

  // Get user from session
  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem("ucs_current") || "{}");

    if (!session || session.role !== "student") {
      window.location.href = "/login";
      return;
    }

    setUser(session);
    loadDashboardData(session.token);
  }, []);
  
  // Load all dashboard data
  const loadDashboardData = async (token) => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.get(`${API_BASE}student/dashboard/`, { headers });
      
      setForms(response.data.forms || []);
      setNotifications(response.data.notifications || []);

    } catch (err) {
      console.error("Failed to load data:", err);
      
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          sessionStorage.clear();
          window.location.href = "/login";
        }, 2000);
      } else if (err.response?.status === 404) {
        await loadFallbackData(token);
      } else {
        setError("Failed to load data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load chat departments
const loadChatDepartments = async () => {
  if (!user || !user.token) return;
  
  try {
    setIsChatLoading(true);
    // Check if this endpoint exists, otherwise use mock data
    const response = await axios.get(`${API_BASE}chat/department-staff/`, {
      headers: {
        'Authorization': `Token ${user.token}`
      }
    }).catch(err => {
      // If endpoint doesn't exist, use mock data
      console.log("Using mock department data");
      return {
        data: [
          { role: 'department_head', name: 'Department Head', available: true, staff: [] },
          { role: 'librarian', name: 'Librarian', available: true, staff: [] },
          { role: 'cafeteria', name: 'Cafeteria', available: true, staff: [] },
          { role: 'dormitory', name: 'Dormitory', available: true, staff: [] },
          { role: 'registrar', name: 'Registrar', available: true, staff: [] },
        ]
      };
    });
    
    setChatDepartments(response.data);
  } catch (err) {
    console.error("Failed to load departments:", err);
    // Fallback mock data
    setChatDepartments([
      { role: 'department_head', name: 'Department Head', available: true, staff: [] },
      { role: 'librarian', name: 'Librarian', available: true, staff: [] },
      { role: 'cafeteria', name: 'Cafeteria', available: true, staff: [] },
      { role: 'dormitory', name: 'Dormitory', available: true, staff: [] },
      { role: 'registrar', name: 'Registrar', available: true, staff: [] },
    ]);
  } finally {
    setIsChatLoading(false);
  }
};

  // Start new chat
const startNewChat = async (roleType) => {
  try {
    setIsChatLoading(true);
    const latestForm = forms[0];
    const formId = latestForm?.id;

    const roomType = roleType === 'department_head' ? 'student_department_head'
                     : roleType === 'librarian' ? 'student_librarian'
                     : roleType === 'cafeteria' ? 'student_cafeteria'
                     : roleType === 'dormitory' ? 'student_dormitory'
                     : 'student_registrar';

    const response = await axios.post(`${API_BASE}chat/start-chat/`, {
      room_type: roomType,
      form_id: formId
    }, {
      headers: { 'Authorization': `Token ${user.token}` }
    });

    if (response.data.chat_room) {
      setSelectedChatRoom(response.data.chat_room);
      message.success(`Chat started with ${roleType.replace('_',' ')}!`);
      loadChatDepartments(); // refresh chat list
    }
  } catch (err) {
    console.error(err);
    message.error("Failed to start chat");
  } finally {
    setIsChatLoading(false);
  }
};


  // Load chat departments when user is set
  useEffect(() => {
    if (user && user.token) {
      loadChatDepartments();
    }
  }, [user]);

  // Fallback data loading
  const loadFallbackData = async (token) => {
    try {
      const headers = {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      };

      const formsRes = await axios.get(`${API_BASE}student/forms/`, { headers });
      const formsData = Array.isArray(formsRes.data) ? formsRes.data : [];
      setForms(formsData);

    } catch (error) {
      console.error("Fallback loading failed:", error);
    }
  };

  // Refresh data
  const refreshData = () => {
    if (user && user.token) {
      loadDashboardData(user.token);
      loadChatDepartments();
    }
  };

  // Handle form deletion
const handleDeleteForm = async (formId) => {
  const confirmDelete = window.confirm(
    "Delete this form?\nProgress and certificate will be permanently removed."
  );

  if (!confirmDelete) return;

  try {
    const response = await axios.delete(
      `${API_BASE}forms/${formId}/delete/`,
      {
        headers: { Authorization: `Token ${user.token}` },
      }
    );

    alert(response.data.message || "Form deleted");
    refreshData();

  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};


  // Download clearance certificate
const downloadClearanceCertificate = async (formId) => {
  try {
    const response = await axios.get(`${API_BASE}clearance-certificate/${formId}/download/`, {
      headers: {
        'Authorization': `Token ${user.token}`
      },
      responseType: 'blob'
    });
    
    // Get filename from content disposition or create one
    const contentDisposition = response.headers['content-disposition'];
    let filename = `clearance_certificate_${formId}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    // Show success message
    message.success('Certificate downloaded successfully!');
    
  } catch (err) {
    console.error("Download failed:", err);
    if (err.response?.status === 400) {
      message.error("Certificate not available yet. Form must be cleared by Registrar.");
    } else if (err.response?.status === 403) {
      message.error("You don't have permission to download this certificate.");
    } else {
      message.error("Failed to download certificate. Please try again.");
    }
  }
};

  // View form tracking details
 const viewFormTracking = async (formId) => {
  try {
    const response = await axios.get(`${API_BASE}forms/${formId}/`, {
      headers: { 'Authorization': `Token ${user.token}` }
    });

    const form = response.data;

    // Define stages in order
    const stages = [
      { 
        name: "Department Head", 
        note: form.note, 
        approvedBy: form.department_approved_by,
        approvedStatus: ["approved_department", "approved_library", "approved_cafeteria", 
                        "approved_psychology", "approved_sportmaster", "approved_campuspolice",
                        "approved_coastsharing", "approved_dopcoordinator", "approved_studentaffairs",
                        "approved_dormitory", "Cleared by Registrar"] 
      },
      { 
        name: "Library", 
        note: form.library_note, 
        approvedBy: form.library_approved_by,
        approvedStatus: ["approved_library", "approved_cafeteria", "approved_psychology", 
                        "approved_sportmaster", "approved_campuspolice", "approved_coastsharing",
                        "approved_dopcoordinator", "approved_studentaffairs", "approved_dormitory", 
                        "Cleared by Registrar"] 
      },
      { 
        name: "Cafeteria", 
        note: form.cafeteria_note, 
        approvedBy: form.cafeteria_approved_by,
        approvedStatus: ["approved_cafeteria", "approved_psychology", "approved_sportmaster", 
                        "approved_campuspolice", "approved_coastsharing", "approved_dopcoordinator",
                        "approved_studentaffairs", "approved_dormitory", "Cleared by Registrar"] 
      },
      { 
        name: "Psychology", 
        note: form.psychology_note, 
        approvedBy: form.psychology_approved_by,
        approvedStatus: ["approved_psychology", "approved_sportmaster", "approved_campuspolice", 
                        "approved_coastsharing", "approved_dopcoordinator", "approved_studentaffairs",
                        "approved_dormitory", "Cleared by Registrar"] 
      },
      { 
        name: "Sport Master", 
        note: form.sportmaster_note, 
        approvedBy: form.sportmaster_approved_by,
        approvedStatus: ["approved_sportmaster", "approved_campuspolice", "approved_coastsharing", 
                        "approved_dopcoordinator", "approved_studentaffairs", "approved_dormitory", 
                        "Cleared by Registrar"] 
      },
      { 
        name: "Campus Police", 
        note: form.campuspolice_note, 
        approvedBy: form.campuspolice_approved_by,
        approvedStatus: ["approved_campuspolice", "approved_coastsharing", "approved_dopcoordinator", 
                        "approved_studentaffairs", "approved_dormitory", "Cleared by Registrar"] 
      },
      { 
        name: "Coast Sharing", 
        note: form.coastsharing_note, 
        approvedBy: form.coastsharing_approved_by,
        approvedStatus: ["approved_coastsharing", "approved_dopcoordinator", "approved_studentaffairs", 
                        "approved_dormitory", "Cleared by Registrar"] 
      },
      { 
        name: "DOP Coordinator", 
        note: form.dopcoordinator_note, 
        approvedBy: form.dopcoordinator_approved_by,
        approvedStatus: ["approved_dopcoordinator", "approved_studentaffairs", "approved_dormitory", 
                        "Cleared by Registrar"] 
      },
      { 
        name: "Student Affairs", 
        note: form.studentaffairs_note, 
        approvedBy: form.studentaffairs_approved_by,
        approvedStatus: ["approved_studentaffairs", "approved_dormitory", "Cleared by Registrar"] 
      },
      { 
        name: "Dormitory", 
        note: form.dormitory_note, 
        approvedBy: form.dormitory_approved_by,
        approvedStatus: ["approved_dormitory", "Cleared by Registrar"] 
      },
      { 
        name: "Registrar", 
        note: form.registrar_note, 
        approvedBy: form.registrar_approved_by,
        approvedStatus: ["Cleared by Registrar"] 
      },
    ];

    let trackingInfo = `
📋 FORM TRACKING DETAILS
========================
Form ID: ${form.id}
Student: ${form.full_name}
ID Number: ${form.id_number}
Department: ${form.department_name}
Current Status: ${form.status}
Submitted: ${new Date(form.created_at).toLocaleDateString()}
Last Updated: ${new Date(form.updated_at).toLocaleDateString()}

📊 APPROVAL PROGRESS (${stages.length} stages):
------------------------------------------------
`;

    // Compute stage statuses
    
    stages.forEach((stage, idx) => {
      let statusIcon = "⏳"; // Pending by default
      let statusText = "Pending";
      let details = stage.note || "No details provided";

      if (stage.approvedStatus.includes(form.status)) {
        statusIcon = "✅";
        statusText = "Approved";
      } else if (form.status === "rejected") {
        statusIcon = "❌";
        statusText = "Rejected";
      }

      trackingInfo += `
${idx + 1}. ${stage.name}: ${statusIcon}
   Status: ${statusText}
   Note: ${details}
`;
    });

    // Add overall progress
    const approvedCount = stages.filter(stage => stage.approvedStatus.includes(form.status)).length;
    const totalStages = stages.length;
    const progressPercent = Math.round((approvedCount / totalStages) * 100);

    trackingInfo += `\nProgress: ${progressPercent}% complete\n[${'█'.repeat(approvedCount)}${'░'.repeat(totalStages - approvedCount)}]\n`;

    // Next steps messages
    if (form.status === "Cleared by Registrar") {
      trackingInfo += `\n🎉 Congratulations! Your clearance is complete.\n📥 You can now download your clearance certificate.`;
    } else if (form.status === "rejected") {
      trackingInfo += `\n❌ Form rejected. Please check the rejection notes above and resubmit if needed.`;
    } else {
      const nextStage = stages.find(stage => !stage.approvedStatus.includes(form.status));
      if (nextStage) {
        trackingInfo += `\n⏭️ Next Step: Waiting for ${nextStage.name} approval.`;
      }
    }

    alert(trackingInfo);

  } catch (err) {
    console.error("Failed to get tracking info:", err);
    alert("Could not load tracking information. Please try again.");
  }
};

  // Helper function to check payment requirements
  const getPaymentRequirement = (form) => {
    let paymentInfo = null;
    
    // Check for library payment requirement
    if (form.status === 'requires_library_payment' && form.library_note) {
      const amountMatch = form.library_note.match(/Payment required: (\d+) ETB/i);
      const amount = amountMatch ? amountMatch[1] : null;
      
      paymentInfo = {
        department: 'library',
        reason: form.library_note,
        amount: amount,
        requires_payment: true
      };
    }
    
    // Check for cafeteria payment requirement
    else if (form.status === 'requires_cafeteria_payment' && form.cafeteria_note) {
      paymentInfo = {
        department: 'cafeteria',
        reason: form.cafeteria_note,
        amount: null,
        requires_payment: true
      };
    }
    
    // Check for dormitory payment requirement
    else if (form.status === 'requires_dormitory_payment' && form.dormitory_note) {
      paymentInfo = {
        department: 'dormitory',
        reason: form.dormitory_note,
        amount: null,
        requires_payment: true
      };
    }
    
    return paymentInfo;
  };

  // Function to navigate to payment page
  const navigateToPayment = (formId, departmentType, amount = null) => {
    let url = `/student/payments?form_id=${formId}&department=${departmentType}`;
    if (amount) {
      url += `&amount=${amount}`;
    }
    navigate(url);
  };

  // Render notifications with payment links
  const renderNotifications = () => (
    <div className="notifications-panel">
      <h3>🔔 Notifications ({notifications.length})</h3>
      {notifications.length === 0 ? (
        <p className="no-notifications">No new notifications</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification, index) => {
            // Check if notification contains payment link
            const isPaymentNotification = notification.message && 
              (notification.message.toLowerCase().includes('payment required') || 
               notification.message.toLowerCase().includes('requires payment') ||
               notification.message.toLowerCase().includes('make payment'));
            
            // Extract form ID from notification if available
            let formId = null;
            let department = null;
            let amount = null;
            
            if (isPaymentNotification && notification.message) {
              const formMatch = notification.message.match(/form #(\d+)/i) || 
                               notification.message.match(/Form (\d+)/i);
              if (formMatch) {
                formId = formMatch[1];
                
                // Determine department
                if (notification.message.toLowerCase().includes('library')) {
                  department = 'library';
                } else if (notification.message.toLowerCase().includes('cafeteria')) {
                  department = 'cafeteria';
                } else if (notification.message.toLowerCase().includes('dormitory')) {
                  department = 'dormitory';
                }
                
                // Extract amount if available
                const amountMatch = notification.message.match(/(\d+) ETB/i);
                if (amountMatch) {
                  amount = amountMatch[1];
                }
              }
            }
            
            return (
              <div key={index} className="notification-item">
                <p>{notification.message}</p>
                
                {isPaymentNotification && formId && (
                  <button 
                    className="btn-notification-action"
                    onClick={() => navigateToPayment(formId, department, amount)}
                  >
                    💳 Make Payment Now
                  </button>
                )}
                
                <small>{new Date(notification.created_at).toLocaleString()}</small>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Helper function to get step status and approver info
const getStepStatusInfo = (form, deptName) => {
  let stepStatus = 'pending';
  let note = '';
  let approverName = '';

  // Order of approval flow
  const statusOrder = [
    'submitted',
    'approved_department',
    'approved_library',
    'approved_cafeteria',
    'approved_psychology',
    'approved_sportmaster',
    'approved_campuspolice',
    'approved_cooperationsharing',
    'approved_dopcordinator',
    'approved_studentaffairs',
    'approved_dormitory',
    'Cleared by Registrar'
  ];

  const currentStatusIndex = statusOrder.indexOf(form.status);


  // Helper to check if a specific status has been reached
  const hasReached = (targetStatus) => {
    const targetIndex = statusOrder.indexOf(targetStatus);
    return currentStatusIndex >= targetIndex && targetIndex !== -1;
  };

  const isCompleted = (requiredStatus) =>
    currentStatusIndex >= statusOrder.indexOf(requiredStatus);

  const isRejected = form.status === 'rejected';

  switch (deptName) {

    case 'Department Head':
      if (isCompleted('approved_department')) {
        stepStatus = 'completed';
        approverName = 'Department Head';
        note = form.note || 'Approved';
      } else if (isRejected) {
        stepStatus = 'rejected';
        approverName = 'Department Head';
        note = form.note || 'Rejected';
      }
      break;

    case 'Library':
      if (isCompleted('approved_library')) {
        stepStatus = 'completed';
        approverName = form.library_approved_by || 'Librarian';
        note = form.library_note || 'Approved';
      } else if (isRejected && form.library_note) {
        stepStatus = 'rejected';
        approverName = 'Librarian';
        note = form.library_note;
      } else if (form.status === 'requires_library_payment') {
        stepStatus = 'payment_required';
        approverName = 'Librarian';
        note = form.library_note || 'Payment required';
      }
      break;

    case 'Cafeteria':
      if (isCompleted('approved_cafeteria')) {
        stepStatus = 'completed';
        approverName = 'Cafeteria Staff';
        note = form.cafeteria_note || 'Approved';
      } else if (isRejected && form.cafeteria_note) {
        stepStatus = 'rejected';
        approverName = 'Cafeteria Staff';
        note = form.cafeteria_note;
      }
      break;
    case 'Psychology':
      if (isCompleted('approved_psychology')) {
        stepStatus = 'completed';
        approverName = form.psychology_approved_by || 'Psychology';
        note = form.psychology_note || 'Approved';
      } else if (isRejected && form.psychology_note) {
        stepStatus = 'rejected';
        approverName = 'Psychology';
        note = form.psychology_note;
      } else if (form.status === 'requires_psychology_payment') {
        stepStatus = 'payment_required';
        approverName = 'Psychology';
        note = form.psychology_note || 'Payment required';
      }
      break;

    case 'Sport Master':
      if (isCompleted('approved_sportmaster')) {
        stepStatus = 'completed';
        approverName = form.sportmaster_approved_by || 'Sport Master';
        note = form.sportmaster_note || 'Approved';
      } else if (isRejected && form.sportmaster_note) {
        stepStatus = 'rejected';
        approverName = 'Sport Master';
        note = form.sportmaster_note;
      } else if (form.status === 'requires_sportmaster_payment') {
        stepStatus = 'payment_required';
        approverName = 'Sport Master';
        note = form.sportmaster_note || 'Payment required';
      }
      break;

    case 'Campus Police':
      if (isCompleted('approved_campuspolice')) {
        stepStatus = 'completed';
        approverName = form.campuspolice_approved_by || 'Campus Police';
        note = form.campuspolice_note || 'Approved';
      } else if (isRejected && form.campuspolice_note) {
        stepStatus = 'rejected';
        approverName = 'Campus Police';
        note = form.campuspolice_note;
      } else if (form.status === 'requires_campuspolice_payment') {
        stepStatus = 'payment_required';
        approverName = 'Campus Police';
        note = form.campuspolice_note || 'Payment required';
      }
      break;

    case 'Cooperation Sharing':  // Make sure this matches exactly what's in your mapping
      console.log('Checking Cooperation Sharing with status:', form.status);
      console.log('Has reached approved_cooperationsharing?', hasReached('approved_cooperationsharing'));
      
      if (hasReached('approved_cooperationsharing')) {
        stepStatus = 'completed';
        approverName = form.cooperationsharing_approved_by || 'Cooperation Sharing';
        note = form.cooperationsharing_note || 'Approved';
        console.log('Cooperation Sharing should be COMPLETED');
      } else if (isRejected && form.cooperationsharing_note) {
        stepStatus = 'rejected';
        approverName = 'Cooperation Sharing';
        note = form.cooperationsharing_note;
      } else if (form.status === 'requires_cooperationsharing_payment') {
        stepStatus = 'payment_required';
        approverName = 'Cooperation Sharing';
        note = form.cooperationsharing_note || 'Payment required';
      }
      break;

    case 'DOP Coordinator':
      if (hasReached('approved_dopcordinator')) {
        stepStatus = 'completed';
        approverName = form.dopcoordinator_approved_by || 'DOP Coordinator';
        note = form.dopcordinator_note || 'Approved';
      } else if (isRejected && form.dopcordinator_note) {
        stepStatus = 'rejected';
        approverName = 'DOP Coordinator';
        note = form.dopcordinator_note;
      } else if (form.status === 'requires_dopcordinator_payment') {
        stepStatus = 'payment_required';
        approverName = 'DOP Coordinator';
        note = form.dopcordinator_note || 'Payment required';
      }
      break;

    case 'Student Affairs':
      if (isCompleted('approved_studentaffairs')) {
        stepStatus = 'completed';
        approverName = form.studentaffairs_approved_by || 'Student Affairs';
        note = form.studentaffairs_note || 'Approved';
      } else if (isRejected && form.studentaffairs_note) {
        stepStatus = 'rejected';
        approverName = 'Student Affairs';
        note = form.studentaffairs_note;
      } else if (form.status === 'requires_studentaffairs_payment') {
        stepStatus = 'payment_required';
        approverName = 'Student Affairs';
        note = form.studentaffairs_note || 'Payment required';
      }
      break;

    case 'Dormitory':
      if (isCompleted('approved_dormitory')) {
        stepStatus = 'completed';
        approverName = 'Dormitory Staff';
        note = form.dormitory_note || 'Approved';
      } else if (isRejected && form.dormitory_note) {
        stepStatus = 'rejected';
        approverName = 'Dormitory Staff';
        note = form.dormitory_note;
      }
      break;

    case 'Registrar':
      if (form.status === 'Cleared by Registrar') {
        stepStatus = 'completed';
        approverName = 'Registrar';
        note = 'Cleared by Registrar';
      } else if (isRejected && form.registrar_note) {
        stepStatus = 'rejected';
        approverName = 'Registrar';
        note = form.registrar_note;
      }
      break;

    default:
      break;
  }

  return { stepStatus, note, approverName };
};


  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Student Dashboard</h2>
          <p className="student-info">
            {user?.username || "Student"}<br/>
            <small>{user?.email || ""}</small>
          </p>
        </div>
        
        <div className="sidebar-menu">
          <button onClick={() => {setTab("dashboard"); setSelectedChatRoom(null);}} className={tab === "dashboard" ? "active" : ""}>
            📊 Dashboard
          </button>
          <button onClick={() => {setTab("form"); setSelectedChatRoom(null);}} className={tab === "form" ? "active" : ""}>
            📄 {forms.find(f => f.can_resubmit) ? "Resubmit Form" : "Submit Clearance"}
          </button>
          <button onClick={() => {setTab("tracking"); setSelectedChatRoom(null);}} className={tab === "tracking" ? "active" : ""}>
            📍 Track Forms ({forms.length})
          </button>
          <button onClick={() => {setTab("certificate"); setSelectedChatRoom(null);}} className={tab === "certificate" ? "active" : ""}>
            📜 Certificate ({forms.filter(f => f.status === 'Cleared by Registrar').length})
          </button>
          <button onClick={() => {setTab("payment"); setSelectedChatRoom(null);}} className={tab === "payment" ? "active" : ""}>
            💰 My Payments
          </button>
          <button onClick={() => {setTab("chat"); setSelectedChatRoom(null);}} className={tab === "chat" ? "active" : ""}>
            💬 Live Chat
          </button>
        </div>
        
        {renderNotifications()}
      </aside>

      <main className="content">
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>🗑️ Delete Form</h3>
              <p>Are you sure you want to delete form #{formToDelete}?</p>
              <p className="warning-text">This action cannot be undone.</p>
              
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn-danger"
                  onClick={() => handleDeleteForm(formToDelete)}
                >
                  Delete Form
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <>
            <div className="header-row">
              <h1>Welcome, {user?.username || "Student"}!</h1>
              <button className="btn-refresh" onClick={refreshData} disabled={loading}>
                {loading ? 'Refreshing...' : '🔄 Refresh Data'}
              </button>
            </div>
            
            {error && (
              <div className="error-alert">
                <p>{error}</p>
                <button onClick={refreshData}>Try Again</button>
              </div>
            )}
            
            <div className="dashboard-cards">
              {/* Status Card */}
              <div className="card status-card">
                <h3>📋 Current Status</h3>
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : latestForm ? (
                  <>
                    <div className="status-info">
                      <p><strong>Latest Form:</strong> #{latestForm.id}</p>
                      <p><strong>Status:</strong> 
                        <span className={`status-badge ${latestForm.status}`}>
                          {latestForm.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                        </span>
                      </p>
                      <p><strong>Department:</strong> {latestForm.department_name || 'Not specified'}</p>
                      <p><strong>Submitted:</strong> {new Date(latestForm.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    {/* Check for payment requirements */}
                    {['requires_library_payment', 'requires_cafeteria_payment', 'requires_dormitory_payment'].includes(latestForm.status) && (
                      <div className="payment-required-alert">
                        <div className="alert-icon">💰</div>
                        <div className="alert-content">
                          <h4>Payment Required</h4>
                          <p>
                            {latestForm.status === 'requires_library_payment' ? 'Library' : 
                             latestForm.status === 'requires_cafeteria_payment' ? 'Cafeteria' : 'Dormitory'} 
                            dues need to be paid to proceed.
                          </p>
                          <button 
                            onClick={() => {
                              const dept = latestForm.status.replace('requires_', '').replace('_payment', '');
                              navigateToPayment(latestForm.id, dept);
                            }}
                            className="btn-payment-link"
                          >
                            💳 Make Payment Now
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {latestForm.status === "rejected" && (
                      <div className="rejection-alert">
                        <p><strong>Form rejected. Please check with the concerned department.</strong></p>
                        <div className="action-buttons">
                          <button onClick={() => setTab("tracking")} className="btn-action">
                            View Details
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {latestForm.status === "Cleared by Registrar" && (
                      <div className="success-alert">
                        <p>✅ Your clearance is complete! You can download your certificate.</p>
                        <button 
                          onClick={() => downloadClearanceCertificate(latestForm.id)} 
                          className="btn-success"
                        >
                          📥 Download Certificate
                        </button>
                      </div>
                    )}
                    
                    {latestForm.status === "pending_resubmission" && (
                      <div className="info-alert">
                        <p>✅ Ready to resubmit! You can now submit your form.</p>
                        <button 
                          onClick={() => setTab("form")} 
                          className="btn-primary"
                        >
                          Submit Now
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-forms">
                    <p>No clearance forms submitted yet.</p>
                    <button onClick={() => setTab("form")} className="btn-submit">
                      Submit First Clearance Form
                    </button>
                  </div>
                )}
              </div>
              
              {/* Quick Stats Card */}
              <div className="card stats-card">
                <h3>📊 Quick Stats</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">{forms.length}</div>
                    <div className="stat-label">Total Forms</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {forms.filter(f => f.status === 'Cleared by Registrar').length}
                    </div>
                    <div className="stat-label">Completed</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {forms.filter(f => ['pending_department', 'approved_department', 'approved_library', 'approved_cafeteria', 'approved_dormitory'].includes(f.status)).length}
                    </div>
                    <div className="stat-label">Pending</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {forms.filter(f => f.status.includes('requires_') && f.status.includes('_payment')).length}
                    </div>
                    <div className="stat-label">Payment Required</div>
                  </div>
                </div>
                
                <div className="progress-section">
                  <div className="progress-item">
                    <span>Approval Progress</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${(forms.filter(f => f.status === 'Cleared by Registrar').length / Math.max(forms.length, 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span>{forms.filter(f => f.status === 'Cleared by Registrar').length}/{forms.length} forms cleared</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions Card */}
              <div className="card actions-card">
                <h3>⚡ Quick Actions</h3>
                <div className="quick-actions">
                  <button 
                    onClick={() => setTab("form")}
                    className="quick-btn primary"
                  >
                    📝 {forms.find(f => f.can_resubmit) ? "Resubmit Form" : "New Form"}
                  </button>
                  
                  <button 
                    onClick={() => setTab("payment")}
                    className="quick-btn payment"
                  >
                    💰 Make Payments
                  </button>
                  
                  {forms.filter(f => f.status.includes('requires_') && f.status.includes('_payment')).length > 0 && (
                    <button 
                      onClick={() => {
                        const formWithPayment = forms.find(f => 
                          f.status.includes('requires_') && f.status.includes('_payment')
                        );
                        if (formWithPayment) {
                          const dept = formWithPayment.status.replace('requires_', '').replace('_payment', '');
                          navigateToPayment(formWithPayment.id, dept);
                        }
                      }}
                      className="quick-btn warning"
                    >
                      💳 Make Required Payments
                    </button>
                  )}
                  
                  {forms.filter(f => f.status === 'Cleared by Registrar').length > 0 && (
                    <button 
                      onClick={() => setTab("certificate")}
                      className="quick-btn success"
                    >
                      📜 View Certificates
                    </button>
                  )}
                  
                  <button 
                    onClick={refreshData}
                    className="quick-btn info"
                  >
                    🔄 Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Form Submission Tab */}
        {tab === "form" && (
          <div className="form-container">
            <ClearanceForm 
              isResubmit={forms.find(f => f.can_resubmit)}
              previousForm={forms.find(f => f.can_resubmit)}
              onSuccess={() => {
                alert("Form submitted successfully!");
                refreshData();
                setTab("dashboard");
              }}
            />
          </div>
        )}

        {/* Form Tracking Tab */}
        {tab === "tracking" && (
          <div className="tracking-container">
            <h2>📍 Track My Forms</h2>
            
            {loading ? (
              <div className="loading">Loading...</div>
            ) : forms.length === 0 ? (
              <div className="no-forms">
                <p>No forms to track. Please submit a clearance form first.</p>
                <button onClick={() => setTab("form")} className="btn-submit">
                  Submit Form
                </button>
              </div>
            ) : (
              <div className="tracking-list">
                {forms.map((form, index) => {
                  const paymentRequirement = getPaymentRequirement(form);
                  
                  return (
                    <div key={index} className="tracking-card">
                      <div className="tracking-header">
                        <div className="header-left">
                          <h4>Form #{form.id} - {form.full_name}</h4>
                          <span className="form-id">ID: {form.id_number}</span>
                        </div>
                        <div className="header-right">
                          <span className={`form-status ${form.status}`}>
                            {form.status?.replace('_', ' ').toUpperCase()}
                          </span>
                          <div className="tracking-actions">
                            <button 
                              onClick={() => viewFormTracking(form.id)} 
                              className="btn-details"
                            >
                              View Details
                            </button>
                            
                            {form.status === 'Cleared by Registrar' && (
                              <button 
                                onClick={() => downloadClearanceCertificate(form.id)} 
                                className="btn-download"
                              >
                                Download
                              </button>
                            )}

                            {(form.status === 'pending_department' || form.status === 'rejected') && (
                              <button 
                                onClick={() => {
                                  setFormToDelete(form.id);
                                  setShowDeleteModal(true);
                                }}
                                className="btn-delete"
                              >
                                Delete
                              </button>
                            )}
                            
                            {paymentRequirement && (
                              <button 
                                onClick={() => navigateToPayment(form.id, paymentRequirement.department, paymentRequirement.amount)}
                                className="btn-payment"
                              >
                                💳 Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Requirement Alert */}
                      {paymentRequirement && (
                        <div className="payment-required-alert">
                          <div className="alert-icon">💰</div>
                          <div className="alert-content">
                            <h4>Payment Required</h4>
                            <p>{paymentRequirement.reason}</p>
                            {paymentRequirement.amount && (
                              <p className="payment-amount">
                                <strong>Amount:</strong> {paymentRequirement.amount} ETB
                              </p>
                            )}
                            <button 
                              className="btn-payment-link"
                              onClick={() => navigateToPayment(form.id, paymentRequirement.department, paymentRequirement.amount)}
                            >
                              💳 Make Payment Now
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="tracking-progress">
                          {['Department Head', 'Library', 'Cafeteria', 'Psychology', 'Sport Master', 
                              'Campus Police', 'Cooperation Sharing', 'DOP Coordinator', 'Student Affairs', 
                               'Dormitory', 'Registrar'].map((dept, idx) => {
                              const { stepStatus, note, approverName } = getStepStatusInfo(form, dept);
                          
                          return (
                            <div key={idx} className={`progress-step ${stepStatus}`}>
                              <div className="step-indicator">
                                <div className="step-number">{idx + 1}</div>
                                <div className="step-line"></div>
                              </div>
                              <div className="step-info">
                                <div className="step-name">{dept}</div>
                                <div className="step-status">
                                  {stepStatus === 'completed' ? `✅ Approved by ${approverName}` : 
                                   stepStatus === 'rejected' ? `❌ Rejected by ${approverName}` : 
                                   stepStatus === 'payment_required' ? `💰 Payment Required - ${note}` : 
                                    '⏳ Pending'}
                                </div>
                                {note && <div className="step-note">{note}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Payment Tab */}
        {tab === "payment" && (
          <div className="payment-container">
            <div className="payment-header">
              <h2>💰 My Payments</h2>
              <button 
                onClick={refreshData} 
                className="btn-refresh"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
            
            <div className="payment-cards-section">
              <h3>Make Payments</h3>
              <div className="payment-cards">
                <div className="payment-card">
                  <div className="payment-icon">📚</div>
                  <h4>Library Fees</h4>
                  <p>Pay library dues, book fines, and other library-related fees</p>
                  <button 
                    className="btn-payment"
                    onClick={() => {
                      // Check if any form requires library payment
                      const libraryForm = forms.find(f => f.status === 'requires_library_payment');
                      if (libraryForm) {
                        navigateToPayment(libraryForm.id, 'library');
                      } else {
                        navigate("/student/payments?department=library");
                      }
                    }}
                  >
                    {forms.some(f => f.status === 'requires_library_payment') ? 'Pay Library Dues' : 'Pay Library Fees'}
                  </button>
                </div>
                
                <div className="payment-card">
                  <div className="payment-icon">🍽️</div>
                  <h4>Cafeteria Fees</h4>
                  <p>Clear your meal dues and cafeteria-related charges</p>
                  <button 
                    className="btn-payment"
                    onClick={() => {
                      const cafeteriaForm = forms.find(f => f.status === 'requires_cafeteria_payment');
                      if (cafeteriaForm) {
                        navigateToPayment(cafeteriaForm.id, 'cafeteria');
                      } else {
                        navigate("/student/payments?department=cafeteria");
                      }
                    }}
                  >
                    {forms.some(f => f.status === 'requires_cafeteria_payment') ? 'Pay Cafeteria Dues' : 'Pay Cafeteria Fees'}
                  </button>
                </div>
                
                <div className="payment-card">
                  <div className="payment-icon">🏠</div>
                  <h4>Dormitory Fees</h4>
                  <p>Pay dormitory damages, room charges, and accommodation fees</p>
                  <button 
                    className="btn-payment"
                    onClick={() => {
                      const dormitoryForm = forms.find(f => f.status === 'requires_dormitory_payment');
                      if (dormitoryForm) {
                        navigateToPayment(dormitoryForm.id, 'dormitory');
                      } else {
                        navigate("/student/payments?department=dormitory");
                      }
                    }}
                  >
                    {forms.some(f => f.status === 'requires_dormitory_payment') ? 'Pay Dormitory Dues' : 'Pay Dormitory Fees'}
                  </button>
                </div>
              </div>
              
              {/* Forms requiring payment */}
              {forms.filter(f => f.status.includes('requires_') && f.status.includes('_payment')).length > 0 && (
                <div className="pending-payments-section">
                  <h4>📋 Forms Requiring Payment</h4>
                  <div className="pending-payments-list">
                    {forms.filter(f => f.status.includes('requires_') && f.status.includes('_payment')).map((form, idx) => {
                      const dept = form.status.replace('requires_', '').replace('_payment', '');
                      const deptName = dept === 'library' ? 'Library' : 
                                      dept === 'cafeteria' ? 'Cafeteria' : 'Dormitory';
                      
                      return (
                        <div key={idx} className="pending-payment-item">
                          <div className="pending-info">
                            <h5>Form #{form.id} - {deptName} Dues</h5>
                            <p>Status: <span className="status-warning">{form.status.replace('_', ' ')}</span></p>
                            {dept === 'library' && form.library_note && (
                              <p className="payment-reason">{form.library_note}</p>
                            )}
                          </div>
                          <button 
                            className="btn-payment-small"
                            onClick={() => navigateToPayment(form.id, dept)}
                          >
                            Pay Now
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="payment-instructions">
                <h4>📋 Payment Instructions:</h4>
                <ol>
                  <li>Select the department you want to pay</li>
                  <li>Upload payment receipt/screenshot</li>
                  <li>Fill in payment details</li>
                  <li>Submit for verification</li>
                  <li>Track verification status</li>
                </ol>
                <p className="note">Note: All payments must be verified by respective department staff.</p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Tab */}
        {tab === "certificate" && (
          <div className="certificate-container">
            <h2>📜 Clearance Certificates</h2>
            
            {loading ? (
              <div className="loading">Loading...</div>
            ) : forms.filter(f => f.status === 'Cleared by Registrar').length === 0 ? (
              <div className="no-certificate">
                <div className="no-certificate-icon">📄</div>
                <p>No clearance certificates available yet.</p>
                <p>Your forms must be cleared by the Registrar to download certificates.</p>
                <button onClick={() => setTab("tracking")} className="btn-track">
                  Track My Forms
                </button>
              </div>
            ) : (
              <div className="certificate-list">
                {forms.filter(f => f.status === 'Cleared by Registrar').map((form, index) => (
                  <div key={index} className="certificate-card">
                    <div className="certificate-info">
                      <h4>Clearance Certificate #{form.id}</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Student:</span>
                          <span className="value">{form.full_name}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">ID Number:</span>
                          <span className="value">{form.id_number}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Department:</span>
                          <span className="value">{form.department_name}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Cleared On:</span>
                          <span className="value">{new Date(form.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="certificate-actions">
                      <button 
                        onClick={() => downloadClearanceCertificate(form.id)} 
                        className="btn-download-large"
                      >
                        📥 Download PDF Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {/* Chat Tab */}
{tab === "chat" && (
  <div className="chat-container">
    <div className="chat-header">
      <h2>💬 Live Chat Support</h2>
      <button 
        onClick={refreshData} 
        className="btn-refresh"
        disabled={loading}
      >
        {loading ? 'Refreshing...' : '🔄 Refresh'}
      </button>
    </div>
    
    <div className="chat-layout">
      {/* Chat Departments Sidebar */}
      <div className="chat-sidebar">
        <div className="departments-section">
          <h3>💼 Departments</h3>
          <div className="departments-list">
            {isChatLoading ? (
              <div className="loading">Loading departments...</div>
            ) : chatDepartments.length > 0 ? (
              chatDepartments.map((dept, idx) => (
                <div 
                  key={idx} 
                  className={`department-item ${dept.available ? 'available' : 'unavailable'}`}
                  onClick={() => dept.available && startNewChat(dept.role)}
                >
                  <div className="dept-info">
                    <h4>{dept.name}</h4>
                    <p>{dept.available ? 'Available now' : 'Offline'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-departments">
                <p>No departments available at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Chats */}
        <div className="active-chats-section">
          <h3>💬 Active Chats</h3>
          <ChatRooms 
            user={user}
            onSelectRoom={setSelectedChatRoom}
            selectedRoom={selectedChatRoom}
          />
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="main-chat-area">
        {selectedChatRoom ? (
          <ChatSystem 
            roomId={selectedChatRoom.id}
            user={user}
            onClose={() => setSelectedChatRoom(null)}
          />
        ) : (
          <div className="chat-welcome">
            <div className="welcome-icon">💬</div>
            <h3>Welcome to Live Chat Support</h3>
            <p>Select a department to start a conversation, or continue an existing chat from the list.</p>
            
            <div className="chat-instructions">
              <h4>How to use:</h4>
              <ol>
                <li>Choose a department from the left panel</li>
                <li>Start a new chat or continue existing conversation</li>
                <li>Send your queries and receive real-time responses</li>
                <li>You can also upload files if needed</li>
                <li>All chats are saved for future reference</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

      </main>

      {/* Add CSS styles */}
      <style jsx>{`
        .payment-container {
          padding: 20px;
        }
        
        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .payment-cards-section h3 {
          margin-bottom: 20px;
          color: #333;
          font-size: 1.5rem;
        }
        
        .payment-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .payment-card {
          background: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid #e0e0e0;
        }
        
        .payment-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .payment-icon {
          font-size: 40px;
          margin-bottom: 15px;
        }
        
        .payment-card h4 {
          margin: 10px 0;
          color: #333;
          font-size: 1.3rem;
        }
        
        .payment-card p {
          color: #666;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .btn-payment {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          font-size: 1rem;
          width: 100%;
          transition: background 0.3s;
        }
        
        .btn-payment:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
        
        .btn-payment-small {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.9rem;
          transition: background 0.3s;
        }
        
        .btn-payment-small:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
        
        .payment-instructions {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 25px;
          margin-top: 30px;
          border-left: 5px solid #667eea;
        }
        
        .payment-instructions h4 {
          margin-bottom: 15px;
          color: #333;
        }
        
        .payment-instructions ol {
          margin-left: 20px;
          margin-bottom: 15px;
        }
        
        .payment-instructions li {
          margin-bottom: 8px;
          color: #555;
        }
        
        .payment-instructions .note {
          background: #fff3cd;
          padding: 10px;
          border-radius: 5px;
          color: #856404;
          font-style: italic;
          margin-top: 15px;
        }
        
        .quick-btn.payment {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }
        
        .quick-btn.payment:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
        
        .quick-btn.warning {
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          border: none;
        }
        
        .quick-btn.warning:hover {
          background: linear-gradient(135deg, #ff5722 0%, #ff9800 100%);
        }
        
        .payment-required-alert {
          background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
          border: 2px solid #ffc107;
          border-radius: 10px;
          padding: 15px;
          margin: 15px 0;
          display: flex;
          align-items: flex-start;
          gap: 15px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { border-color: #ffc107; }
          50% { border-color: #ff9800; }
          100% { border-color: #ffc107; }
        }
        
        .payment-required-alert .alert-icon {
          font-size: 24px;
          background: #ffc107;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .payment-required-alert .alert-content {
          flex: 1;
        }
        
        .payment-required-alert .alert-content h4 {
          margin: 0 0 8px 0;
          color: #856404;
        }
        
        .payment-required-alert .alert-content p {
          margin: 5px 0;
          color: #856404;
        }
        
        .payment-required-alert .payment-amount {
          font-size: 1.1rem;
          font-weight: bold;
        }
        
        .btn-payment-link {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 10px;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .btn-payment-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .btn-notification-action {
          background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          margin-top: 5px;
          display: inline-block;
        }
        
        .btn-notification-action:hover {
          background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
        }
        
        .pending-payments-section {
          background: #fff8e1;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          border: 2px dashed #ffc107;
        }
        
        .pending-payments-section h4 {
          margin-bottom: 15px;
          color: #856404;
        }
        
        .pending-payments-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .pending-payment-item {
          background: white;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 4px solid #ffc107;
        }
        
        .pending-info h5 {
          margin: 0 0 5px 0;
          color: #333;
        }
        
        .pending-info p {
          margin: 3px 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .status-warning {
          color: #ff9800;
          font-weight: bold;
        }
        
        .payment-reason {
          font-style: italic;
          color: #856404 !important;
        }
        
        /* Status badge colors for payment requirements */
        .status-badge.requires_library_payment {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }
        
        .status-badge.requires_cafeteria_payment {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        
        .status-badge.requires_dormitory_payment {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        /* Form status colors in tracking */
        .form-status.requires_library_payment,
        .form-status.requires_cafeteria_payment,
        .form-status.requires_dormitory_payment {
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          font-weight: bold;
        }
        
        .tracking-actions .btn-payment {
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          margin-left: 10px;
        }
        
        .tracking-actions .btn-payment:hover {
          background: linear-gradient(135deg, #ff5722 0%, #ff9800 100%);
        }
      `}</style>
    </div>
  );
}

