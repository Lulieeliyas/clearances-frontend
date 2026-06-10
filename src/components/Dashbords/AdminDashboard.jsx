import { API_BASE } from '../../utils/api.jsx';
import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Typography,
  message,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Input,
  Popconfirm,
  Space,
  Select,
  Switch,
  Spin,
  Table,
  Tabs,
  Tag,
  Form,
  Tooltip,
  Alert,
  Descriptions,
  Divider,
  Badge,
  Progress,
  Timeline,
  Upload,
  Image,
  List,
  Avatar,
  InputNumber
} from "antd";
import { useNavigate } from "react-router-dom";
import { 
  UserOutlined,
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  TeamOutlined,
  BankOutlined,
  ShopOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  WarningOutlined,
  SafetyOutlined,
  HomeOutlined,
  SolutionOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  CheckOutlined,
  PercentageOutlined,
  DashboardOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  MoneyCollectOutlined,
  PhoneOutlined,
  VerifiedOutlined,
  StopOutlined,
  SyncOutlined,
  FileExcelOutlined,
  DownloadOutlined,
  UploadOutlined,
  InboxOutlined,
  HeartOutlined,
  TrophyOutlined,
  TagOutlined,
   MailOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { apiFetch } from "../../utils/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ROLE_OPTIONS = [
  { value: "departmenthead", label: "Department Head", color: "blue", icon: <ShopOutlined /> },
  { value: "librarian", label: "Librarian", color: "green", icon: <FileTextOutlined /> },
  { value: "cafeteria", label: "Cafeteria", color: "orange", icon: <ShopOutlined /> },
  { value: "psychology", label: "Psychology", color: "magenta", icon: <HeartOutlined /> },
  { value: "sportmaster", label: "Sport Master", color: "lime", icon: <TrophyOutlined /> },
  { value: "campuspolice", label: "Campus Police", color: "red", icon: <SafetyOutlined /> },
  { value: "cooperationsharing", label: "Cooperation Sharing", color: "geekblue", icon: <TeamOutlined /> },
  { value: "dopcordinator", label: "DOP Cordinator", color: "cyan", icon: <SolutionOutlined /> },
  { value: "studentaffairs", label: "Student Affairs", color: "gold", icon: <SafetyOutlined /> },
  { value: "dormitory", label: "Dormitory", color: "purple", icon: <HomeOutlined /> },
  { value: "registrar", label: "Registrar", color: "volcano", icon: <SolutionOutlined /> },
];

const PAYMENT_METHOD_TYPES = [
  { value: "telebirr", label: "Telebirr", color: "green", icon: <PhoneOutlined /> },
  { value: "cbe", label: "CBE Bank", color: "blue", icon: <BankOutlined /> },
];

const PAYMENT_STATUS = {
  pending: { text: "Pending", color: "orange", icon: <ClockCircleOutlined /> },
  verified: { text: "Verified", color: "green", icon: <CheckCircleOutlined /> },
  rejected: { text: "Rejected", color: "red", icon: <CloseCircleOutlined /> },
  expired: { text: "Expired", color: "gray", icon: <StopOutlined /> },
};

// Mock data generators
const generateMockStats = () => ({
  total_users: 0,
  active_departments: 0,
  total_colleges: 0,
  total_forms: 0,
  approved_forms: 0,
  pending_forms: 0,
  rejected_forms: 0,
  efficiency: 0,
  avg_processing_time: "0",
  today_forms: 0,
  weekly_trend: "+0%"
});

const generateMockActivities = () => [
  { id: 1, user: "John Doe", action: "approved clearance form", target: "Form #1234", time: "5 minutes ago", icon: "check", color: "green" },
  { id: 2, user: "Jane Smith", action: "registered new dormitory due", target: "Student STU2024001", time: "15 minutes ago", icon: "home", color: "purple" },
  { id: 3, user: "Admin", action: "created new department", target: "Computer Science", time: "1 hour ago", icon: "shop", color: "blue" },
  { id: 4, user: "System", action: "auto-generated report", target: "Weekly Efficiency", time: "2 hours ago", icon: "line-chart", color: "orange" },
  { id: 5, user: "Librarian", action: "checked book dues", target: "5 students", time: "3 hours ago", icon: "book", color: "green" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState(false);

  // Data states
  const [stats, setStats] = useState(generateMockStats());
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [systemControls, setSystemControls] = useState([]);
  const [forms, setForms] = useState([]);
  const [recentActivities, setRecentActivities] = useState(generateMockActivities());

  // Building Management states
  const [buildings, setBuildings] = useState([]);
  const [buildingModal, setBuildingModal] = useState({ open: false, building: null });
  const [buildingForm] = Form.useForm();
  const [dormitoryStaff, setDormitoryStaff] = useState([]);
  const [buildingAssignmentModal, setBuildingAssignmentModal] = useState({ open: false, staff: null });
  const [assignmentForm] = Form.useForm();
  const [buildingStats, setBuildingStats] = useState({
    total: 0,
    active: 0,
    total_capacity: 0,
    current_occupancy: 0
  });

  // Payment states
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [studentPayments, setStudentPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    total_payments: 0,
    total_amount: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    by_department: {
      library: 0,
      cafeteria: 0,
      dormitory: 0,
      other: 0,
    }
  });

  // Student Registration states
  const [authorizedStudents, setAuthorizedStudents] = useState([]);
  const [csvUploads, setCsvUploads] = useState([]);
  const [csvUploadModal, setCSVUploadModal] = useState(false);
  const [csvUploading, setCSVUploading] = useState(false);
  const [csvFile, setCSVFile] = useState(null);

  // Modal states
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createUserForm] = Form.useForm();
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptForm] = Form.useForm();
  const [deptEdit, setDeptEdit] = useState(null);
  const [collegeOpen, setCollegeOpen] = useState(false);
  const [collegeForm] = Form.useForm();
  const [collegeEdit, setCollegeEdit] = useState(null);
  const [userModal, setUserModal] = useState({ open: false, user: null });
  const [userForm] = Form.useForm();
  const [systemControlOpen, setSystemControlOpen] = useState(false);
  const [systemControlForm] = Form.useForm();
  const [paymentMethodModal, setPaymentMethodModal] = useState({ open: false, method: null });
  const [paymentMethodForm] = Form.useForm();
  const [viewPaymentModal, setViewPaymentModal] = useState({ open: false, payment: null });
  const [paymentLogsModal, setPaymentLogsModal] = useState({ open: false, payment: null, logs: [] });
  const [viewFormModal, setViewFormModal] = useState({ open: false, form: null });
  const [viewUserModal, setViewUserModal] = useState({ open: false, user: null });
  const [efficiencyModal, setEfficiencyModal] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  // ==================== AUTH GUARD ====================
  useEffect(() => {
    const stored = sessionStorage.getItem("ucs_current");
    if (!stored) {
      message.error("Please login first");
      navigate("/login");
      return;
    }
    
    const parsed = JSON.parse(stored);
    if (parsed.role !== "admin") {
      message.error("Access denied. Admin only.");
      navigate("/login");
      return;
    }
    
    setSession(parsed);
  }, [navigate]);

  // ==================== BUILDING MANAGEMENT FUNCTIONS ====================
  const loadBuildings = async () => {
    try {
      const data = await apiFetch("buildings/");
      setBuildings(data || []);
      
      // Calculate building stats
      const total = data?.length || 0;
      const active = data?.filter(b => b.is_active).length || 0;
      const totalCapacity = data?.reduce((sum, b) => sum + (b.capacity || 0), 0) || 0;
      const currentOccupancy = data?.reduce((sum, b) => {
        return sum + (b.student_count || 0);
      }, 0) || 0;
      
      setBuildingStats({
        total,
        active,
        total_capacity: totalCapacity,
        current_occupancy: currentOccupancy
      });
    } catch (err) {
      console.warn("Failed to load buildings:", err.message);
      setBuildings([]);
    }
  };

// Update this function in your AdminDashboard.jsx

const loadDormitoryStaff = async () => {
  try {
    setLoading(true);
    const users = await apiFetch("users/");
    const dormStaff = users?.filter(u => u.role === 'dormitory') || [];
    
    // Enhance with building details
    const enhancedStaff = await Promise.all(dormStaff.map(async (staff) => {
      // Get assigned buildings with details
      const assignedBuildings = staff.assigned_buildings_info || [];
      
      // Get count of students in assigned buildings
      let totalStudents = 0;
      const buildingStats = [];
      
      if (assignedBuildings.length > 0) {
        // Fetch all students once to avoid multiple API calls
        const allStudents = await apiFetch("users/");
        
        for (const building of assignedBuildings) {
          const studentsInBuilding = allStudents?.filter(s => 
            s.role === 'student' && 
            s.building === building.id
          ) || [];
          
          totalStudents += studentsInBuilding.length;
          
          buildingStats.push({
            ...building,
            student_count: studentsInBuilding.length,
            students: studentsInBuilding.slice(0, 5) // First 5 students for preview
          });
        }
      }
      
      return {
        ...staff,
        id: staff.id,
        username: staff.username,
        email: staff.email,
        first_name: staff.first_name || '',
        last_name: staff.last_name || '',
        full_name: staff.full_name || `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || staff.username,
        assigned_buildings: assignedBuildings,
        assigned_buildings_count: assignedBuildings.length,
        students_managed: totalStudents,
        building_stats: buildingStats,
        is_blocked: staff.is_blocked || false,
        is_active: staff.is_active || !staff.is_blocked
      };
    }));
    
    setDormitoryStaff(enhancedStaff);
    console.log("Dormitory staff loaded:", enhancedStaff);
    message.success(`Loaded ${enhancedStaff.length} dormitory staff members`);
  } catch (err) {
    console.error("Failed to load dormitory staff:", err);
    message.error(`Failed to load dormitory staff: ${err.message}`);
    setDormitoryStaff([]);
  } finally {
    setLoading(false);
  }
};

  const saveBuilding = async (values) => {
    try {
      if (buildingModal.building) {
        await apiFetch(`buildings/${buildingModal.building.id}/`, {
          method: "PUT",
          body: values,
        });
        message.success("Building updated successfully");
      } else {
        await apiFetch("buildings/", {
          method: "POST",
          body: values,
        });
        message.success("Building created successfully");
      }
      setBuildingModal({ open: false, building: null });
      buildingForm.resetFields();
      loadBuildings();
    } catch (err) {
      message.error(`Failed to save building: ${err.message}`);
    }
  };

  const deleteBuilding = async (id) => {
    try {
      await apiFetch(`buildings/${id}/`, { method: "DELETE" });
      message.success("Building deleted successfully");
      loadBuildings();
    } catch (err) {
      message.error(`Failed to delete building: ${err.message}`);
    }
  };

  const toggleBuildingStatus = async (building) => {
    try {
      await apiFetch(`buildings/${building.id}/`, {
        method: "PATCH",
        body: { is_active: !building.is_active }
      });
      message.success(`Building ${!building.is_active ? "activated" : "deactivated"} successfully`);
      loadBuildings();
    } catch (err) {
      message.error(`Failed to update building: ${err.message}`);
    }
  };

// In your AdminDashboard.jsx - Update the assignBuildingsToStaff function

const assignBuildingsToStaff = async (staffId, values) => {
  try {
    console.log(`Assigning buildings to staff ${staffId}:`, values);
    
    const response = await apiFetch(`admin/assign-buildings/${staffId}/`, {
      method: "POST",
      body: { building_ids: values.building_ids || [] },
    });
    
    console.log("Assignment response:", response);
    
    message.success(`Buildings assigned successfully to ${response.staff_name || 'staff member'}`);
    
    // Close modal
    setBuildingAssignmentModal({ open: false, staff: null });
    assignmentForm.resetFields();
    
    // Reload data
    await Promise.all([
      loadDormitoryStaff(),
      loadBuildings()
    ]);
    
  } catch (err) {
    console.error("Failed to assign buildings:", err);
    
    // Show more detailed error
    if (err.response?.data) {
      const errorData = err.response.data;
      if (errorData.missing_buildings) {
        message.error(
          `Some buildings are invalid: ${errorData.missing_buildings.map(b => 
            `${b.name} (${b.status})`
          ).join(', ')}`
        );
      } else if (errorData.error) {
        message.error(`Failed to assign buildings: ${errorData.error}`);
      } else {
        message.error(`Failed to assign buildings: ${err.message}`);
      }
    } else {
      message.error(`Failed to assign buildings: ${err.message}`);
    }
  }
};

  const exportBuildingStats = async () => {
    try {
      const token = sessionStorage.getItem("ucs_current") 
        ? JSON.parse(sessionStorage.getItem("ucs_current")).token 
        : '';
      
      window.open(`${API_BASE}admin/export-building-stats/?token=${token}`, '_blank');
    } catch (err) {
      message.error("Failed to export building statistics");
    }
  };

  // ==================== LOAD ALL DATA ====================
  const loadAllData = useCallback(async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      console.log("Loading all admin data...");
      
      // Load stats
      try {
        const statsData = await apiFetch("admin/stats/");
        console.log("Stats data:", statsData);
        setStats(prev => ({
          ...prev,
          ...statsData,
          efficiency: statsData?.efficiency || 0,
        }));
      } catch (err) {
        console.warn("Failed to load stats:", err.message);
                    setStats({
                total_users: 0,
                active_departments: 0,
                total_colleges: 0,
                total_forms: 0,
                approved_forms: 0,
                pending_forms: 0,
                rejected_forms: 0,
                efficiency: 0,
                avg_processing_time: "0",
                today_forms: 0,
                weekly_trend: "+0%"
            });
      }
      
      // Load users
      try {
        const usersData = await apiFetch("users/");
        console.log("Users data count:", usersData?.length);
        setUsers(usersData || []);
      } catch (err) {
        console.warn("Failed to load users:", err.message);
        setUsers([]);
      }
      
      // Load departments
      try {
        const departmentsData = await apiFetch("departments/");
        console.log("Departments data count:", departmentsData?.length);
        setDepartments(departmentsData || []);
      } catch (err) {
        console.warn("Failed to load departments:", err.message);
        setDepartments([]);
      }
      
      // Load colleges
      try {
        const collegesData = await apiFetch("colleges/");
        console.log("Colleges data count:", collegesData?.length);
        setColleges(collegesData || []);
      } catch (err) {
        console.warn("Failed to load colleges:", err.message);
        setColleges([]);
      }
      
      // Load system controls
      try {
        const systemData = await apiFetch("system-controls/");
        console.log("System controls:", systemData);
        setSystemControls(systemData || []);
      } catch (err) {
        console.warn("Failed to load system controls:", err.message);
        setSystemControls([]);
      }
      
      // Load forms
      try {
        const formsData = await apiFetch("admin/form-requests/");
        console.log("Forms data count:", formsData?.length);
        setForms(formsData || []);
      } catch (err) {
        console.warn("Failed to load forms:", err.message);
        setForms([]);
      }
      
      // Load payment methods
      try {
        console.log("Loading payment methods...");
        const paymentMethodsData = await apiFetch("admin/payment-methods/");
        console.log("Payment methods loaded successfully:", paymentMethodsData);
        setPaymentMethods(paymentMethodsData || []);
      } catch (err) {
        console.warn("Failed to load payment methods from admin endpoint:", err.message);
      }

      try {
        const publicPaymentMethods = await apiFetch("payment/methods/");
        console.log("Falling back to public payment methods:", publicPaymentMethods);
        setPaymentMethods(publicPaymentMethods || []);
      } catch (fallbackErr) {
        console.warn("Failed to load any payment methods:", fallbackErr.message);
        setPaymentMethods([]);
      }
    
      // Load all payments
      try {
        const paymentsData = await apiFetch("admin/payments/all/");
        console.log("Payments data loaded:", paymentsData?.length);
        setStudentPayments(paymentsData || []);
      } catch (err) {
        console.warn("Failed to load payments:", err.message);
        setStudentPayments([]);
      }
      
      // Load payment statistics
      try {
        const paymentStatsData = await apiFetch("payment/statistics/");
        console.log("Payment stats:", paymentStatsData);
        setPaymentStats(paymentStatsData || {
          total_payments: 0,
          total_amount: 0,
          pending: 0,
          verified: 0,
          rejected: 0,
          by_department: {
            library: 0,
            cafeteria: 0,
            dormitory: 0,
            other: 0,
          }
        });
      } catch (err) {
        console.warn("Failed to load payment stats:", err.message);
      }
      
      // Load authorized students
      try {
        const authStudentsData = await apiFetch("admin/authorized-students/");
        console.log("Authorized students count:", authStudentsData?.length);
        setAuthorizedStudents(authStudentsData || []);
      } catch (err) {
        console.warn("Failed to load authorized students:", err.message);
        setAuthorizedStudents([]);
      }
      
      // Load CSV uploads
      try {
        const csvUploadsData = await apiFetch("admin/csv-uploads/");
        console.log("CSV uploads count:", csvUploadsData?.length);
        setCsvUploads(csvUploadsData || []);
      } catch (err) {
        console.warn("Failed to load CSV uploads:", err.message);
        setCsvUploads([]);
      }

      // Load buildings
      try {
        await loadBuildings();
      } catch (err) {
        console.warn("Failed to load buildings:", err.message);
      }

      // Load dormitory staff
      try {
        await loadDormitoryStaff();
      } catch (err) {
        console.warn("Failed to load dormitory staff:", err.message);
      }
      
      // Set activities
      setRecentActivities(generateMockActivities());
      
      message.success("Data loaded successfully");
    } catch (err) {
      console.error("Failed to load admin data:", err);
      message.error(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      loadAllData();
       loadBuildings();
    }
  }, [session, loadAllData]);

  const handleSearch = () => {
    if (!searchText.trim()) {
      setFilteredData(allData);
      return;
    }

    const filtered = allData.filter(item =>
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.id_number?.toLowerCase().includes(searchText.toLowerCase())
    );

    setFilteredData(filtered);
  };

  // ==================== STUDENT REGISTRATION FUNCTIONS ====================
  const uploadCSVFile = async (file) => {
    setCSVUploading(true);
    try {
      const formData = new FormData();
      formData.append('csv_file', file);
      
      const token = sessionStorage.getItem("ucs_current") 
        ? JSON.parse(sessionStorage.getItem("ucs_current")).token 
        : '';
      
      const response = await fetch('${API_BASE}admin/csv-upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        message.success(`CSV uploaded successfully: ${data.summary?.successful || 0} students added`);
        setCSVUploadModal(false);
        setCSVFile(null);
        loadAllData();
      } else {
        message.error(`Failed to upload CSV: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (err) {
      message.error(`CSV upload failed: ${err.message}`);
    } finally {
      setCSVUploading(false);
    }
  };

  const toggleStudentStatus = async (student) => {
    try {
      await apiFetch(`admin/authorized-students/${student.id}/toggle/`, {
        method: "PATCH",
      });
      message.success(`Student ${student.is_active ? "deactivated" : "activated"}`);
      loadAllData();
    } catch (err) {
      message.error(`Failed to update student: ${err.message}`);
    }
  };

  const deleteAuthorizedStudent = async (studentId) => {
    try {
      await apiFetch(`admin/authorized-students/${studentId}/`, {
        method: "DELETE",
      });
      message.success("Student deleted successfully");
      loadAllData();
    } catch (err) {
      message.error(`Failed to delete student: ${err.message}`);
    }
  };

  const deleteCSVUpload = async (uploadId) => {
    try {
      await apiFetch(`admin/csv-uploads/${uploadId}/`, {
        method: "DELETE",
      });
      message.success("CSV upload deleted successfully");
      loadAllData();
    } catch (err) {
      message.error(`Failed to delete CSV upload: ${err.message}`);
    }
  };

  const downloadCSVTemplate = () => {
    const token = sessionStorage.getItem("ucs_current") 
      ? JSON.parse(sessionStorage.getItem("ucs_current")).token 
      : '';
    
    window.open(`${API_BASE}admin/download-csv-template/?token=${token}`, '_blank');
  };

  // ==================== PAYMENT MANAGEMENT FUNCTIONS ====================
  const initializePaymentMethods = async () => {
    try {
      if (paymentMethods.length === 0) {
        const defaultMethods = [
          {
            name: 'telebirr',
            account_name: 'Mekdela Amba University',
            phone_number: '0918114545',
            instructions: 'Send payment via Telebirr to 0918114545\nInclude your student ID in the reference\nSave the receipt for verification',
            is_active: true
          },
          {
            name: 'cbe',
            account_name: 'Mekdela Amba University',
            account_number: '1000225566778',
            instructions: 'Deposit to CBE Account 1000225566778\nInclude your student ID in the reference\nSave the deposit slip for verification',
            is_active: true
          }
        ];

        let createdCount = 0;
        for (const method of defaultMethods) {
          try {
            await apiFetch("admin/payment-methods/create/", {
              method: "POST",
              body: method,
            });
            createdCount++;
          } catch (createErr) {
            console.warn(`Failed to create ${method.name}:`, createErr.message);
          }
        }
        
        if (createdCount > 0) {
          message.success(`${createdCount} default payment methods initialized`);
          loadAllData();
        } else {
          message.info("Payment methods already exist or failed to create");
        }
      } else {
        message.info("Payment methods already exist");
      }
    } catch (err) {
      message.error(`Failed to initialize: ${err.message}`);
    }
  };

  const savePaymentMethod = async (values) => {
    try {
      console.log("Saving payment method with values:", values);
      
      let endpoint, method;
      
      if (paymentMethodModal.method) {
        endpoint = `admin/payment-methods/${paymentMethodModal.method.id}/`;
        method = "PUT";
      } else {
        endpoint = "admin/payment-methods/create/";
        method = "POST";
      }
      
      const response = await apiFetch(endpoint, {
        method: method,
        body: values,
      });
      
      console.log("Payment method saved successfully:", response);
      
      message.success(`Payment method ${paymentMethodModal.method ? "updated" : "created"} successfully`);
      setPaymentMethodModal({ open: false, method: null });
      paymentMethodForm.resetFields();
      loadAllData();
    } catch (err) {
      console.error("Failed to save payment method:", err);
      message.error(`Failed to save payment method: ${err.message}`);
    }
  };

  const deletePaymentMethod = async (id) => {
    try {
      await apiFetch(`admin/payment-methods/${id}/delete/`, {
        method: "DELETE",
      });
      message.success("Payment method deleted successfully");
      loadAllData();
    } catch (err) {
      message.error(`Failed to delete payment method: ${err.message}`);
    }
  };

  const debugDataLoading = async () => {
    console.log("=== DEBUG DATA LOADING ===");
    console.log("Session:", session);
    console.log("Active Tab:", activeTab);
    
    try {
      const endpoints = [
        "admin/stats/",
        "users/",
        "departments/",
        "colleges/",
        "admin/payment-methods/",
        "admin/payments/all/",
        "payment/statistics/",
        "admin/authorized-students/",
        "buildings/"
      ];
      
      for (const endpoint of endpoints) {
        try {
          const data = await apiFetch(endpoint);
          console.log(`${endpoint}:`, Array.isArray(data) ? `Array(${data.length})` : data);
        } catch (err) {
          console.error(`Failed to load ${endpoint}:`, err.message);
        }
      }
      
      message.info("Check console for debug information");
    } catch (err) {
      console.error("Debug error:", err);
    }
  };

  const debugPaymentMethods = async () => {
    try {
      console.log("Debugging payment methods...");
      
      const adminResponse = await fetch('${API_BASE}admin/payment-methods/all/', {
        headers: {
          'Authorization': `Token ${session.token}`,
          'Content-Type': 'application/json',
        }
      });
      console.log("Admin endpoint status:", adminResponse.status);
      const adminData = await adminResponse.json();
      console.log("Admin endpoint data:", adminData);
      
      const publicResponse = await fetch('${API_BASE}payment/methods/');
      console.log("Public endpoint status:", publicResponse.status);
      const publicData = await publicResponse.json();
      console.log("Public endpoint data:", publicData);
      
      message.info("Check console for debug information");
    } catch (err) {
      console.error("Debug error:", err);
    }
  };

  const togglePaymentMethodStatus = async (method) => {
    try {
      await apiFetch(`admin/payment-methods/${method.id}/toggle/`, {
        method: "PATCH",
        body: { is_active: !method.is_active }
      });
      message.success(`Payment method ${!method.is_active ? "activated" : "deactivated"} successfully`);
      loadAllData();
    } catch (err) {
      message.error(`Failed to update payment method: ${err.message}`);
    }
  };

  const viewPaymentDetails = async (payment) => {
    setViewPaymentModal({ open: true, payment });
  };

  const viewPaymentLogs = async (payment) => {
    try {
      const logs = await apiFetch(`payment/${payment.id}/logs/`);
      setPaymentLogsModal({ open: true, payment, logs });
    } catch (err) {
      message.error(`Failed to load payment logs: ${err.message}`);
    }
  };

  const updatePaymentStatus = async (paymentId, status, reason = "") => {
    try {
      await apiFetch(`admin/payments/${paymentId}/update/`, {
        method: "PATCH",
        body: { status, rejection_reason: reason },
      });
      message.success(`Payment status updated to ${status}`);
      loadAllData();
      setViewPaymentModal({ open: false, payment: null });
    } catch (err) {
      message.error(`Failed to update payment: ${err.message}`);
    }
  };

  // ==================== RENDER PAYMENT STATUS ====================
  const renderPaymentStatus = (status) => {
    const statusInfo = PAYMENT_STATUS[status] || { text: status, color: "default", icon: <ClockCircleOutlined /> };
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text.toUpperCase()}
      </Tag>
    );
  };

  const renderPaymentMethod = (method) => {
    if (!method) return <Tag color="default">N/A</Tag>;
    
    const methodInfo = PAYMENT_METHOD_TYPES.find(m => m.value === method) || {
        label: method,
        color: "default",
        icon: <CreditCardOutlined />
    };

    return (
        <Tag color={methodInfo.color} icon={methodInfo.icon}>
            {String(methodInfo.label).toUpperCase()}
        </Tag>
    );
  };

  const renderDepartmentType = (type) => {
    const deptMap = {
      library: { label: "Library", color: "blue" },
      cafeteria: { label: "Cafeteria", color: "orange" },
      dormitory: { label: "Dormitory", color: "purple" },
      other: { label: "Other", color: "gray" },
    };
    const deptInfo = deptMap[type] || { label: type, color: "default" };
    return (
      <Tag color={deptInfo.color}>
        {deptInfo.label}
      </Tag>
    );
  };

  // ==================== RENDER STATS CARD FOR PAYMENTS ====================
  const renderPaymentStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #52c41a' }}>
          <Statistic 
            title="Total Payments" 
            value={paymentStats.total_payments || 0}
            prefix={<MoneyCollectOutlined />}
            valueStyle={{ color: '#52c41a', fontSize: '28px' }}
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>All transactions</Text>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #1890ff' }}>
          <Statistic 
            title="Total Amount" 
            value={paymentStats.total_amount || 0}
            prefix="ETB"
            valueStyle={{ color: '#1890ff', fontSize: '28px' }}
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>Total revenue</Text>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #fa8c16' }}>
          <Statistic 
            title="Pending" 
            value={paymentStats.pending || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#fa8c16', fontSize: '28px' }}
          />
          <Progress 
            percent={paymentStats.total_payments ? Math.round((paymentStats.pending / paymentStats.total_payments) * 100) : 0}
            size="small"
            strokeColor="#fa8c16"
            showInfo={false}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6}>
        <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #13c2c2' }}>
          <Statistic 
            title="Verified" 
            value={paymentStats.verified || 0}
            prefix={<VerifiedOutlined />}
            valueStyle={{ color: '#13c2c2', fontSize: '28px' }}
          />
          <Progress 
            percent={paymentStats.total_payments ? Math.round((paymentStats.verified / paymentStats.total_payments) * 100) : 0}
            size="small"
            strokeColor="#13c2c2"
            showInfo={false}
          />
        </Card>
      </Col>
    </Row>
  );

  // ==================== PAYMENT DISTRIBUTION CHART ====================
  const renderPaymentDistribution = () => {
    const departmentData = [
      { department: "Library", count: paymentStats.by_department?.library || 0, color: "#1890ff" },
      { department: "Cafeteria", count: paymentStats.by_department?.cafeteria || 0, color: "#fa8c16" },
      { department: "Dormitory", count: paymentStats.by_department?.dormitory || 0, color: "#722ed1" },
      { department: "Other", count: paymentStats.by_department?.other || 0, color: "#52c41a" },
    ];

    const total = departmentData.reduce((sum, dept) => sum + dept.count, 0);

    return (
      <Card title="Payment Distribution by Department" style={{ borderRadius: 12 }}>
        <div style={{ padding: '0 10px' }}>
          {departmentData.map((dept, index) => (
            <div key={index} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong>{dept.department}</Text>
                <Space>
                  <Text type="secondary">{dept.count} payments</Text>
                  <Text type="secondary">
                    ({total > 0 ? Math.round((dept.count / total) * 100) : 0}%)
                  </Text>
                </Space>
              </div>
              <Progress 
                percent={total > 0 ? Math.round((dept.count / total) * 100) : 0}
                strokeColor={dept.color}
                size="small"
                showInfo={false}
              />
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // ==================== RECENT PAYMENTS ====================
  const renderRecentPayments = () => (
    <Card 
      title="Recent Payments" 
      extra={
        <Button type="link" onClick={() => setActiveTab("payments")}>
          View All
        </Button>
      }
      style={{ borderRadius: 12, marginTop: 16 }}
    >
      <Table
        dataSource={studentPayments.slice(0, 5)}
        rowKey="id"
        loading={loading}
        pagination={false}
        columns={[
          { 
            title: "ID", 
            dataIndex: "transaction_id", 
            width: 120,
            render: (id) => <Tag color="blue">{id?.substring?.(0, 8) || 'N/A'}...</Tag>
          },
          { 
            title: "Student", 
            dataIndex: ["student", "username"],
            render: (text, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{text || 'Unknown'}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.student?.email || 'No email'}
                </Text>
              </Space>
            )
          },
          { 
            title: "Department", 
            dataIndex: "department_type",
            render: (type) => renderDepartmentType(type)
          },
          { 
            title: "Amount", 
            dataIndex: "amount",
            render: (amount) => (
              <Text strong style={{ color: '#52c41a' }}>
                {amount || 0} ETB
              </Text>
            )
          },
          { 
            title: "Status", 
            dataIndex: "status",
            render: (status) => renderPaymentStatus(status)
          },
          {
            title: "Actions",
            width: 80,
            render: (_, payment) => (
              <Tooltip title="View Details">
                <Button 
                  icon={<EyeOutlined />} 
                  size="small"
                  type="link"
                  onClick={() => viewPaymentDetails(payment)}
                />
              </Tooltip>
            ),
          },
        ]}
      />
    </Card>
  );

  // ==================== CALCULATE EFFICIENCY ====================
  const calculateSystemEfficiency = () => {
    const totalForms = forms.length;
    if (totalForms === 0) return 100;
    
    const approvedForms = forms.filter(f => 
      f.status === "completed" || 
      f.status === "Cleared by Registrar"
    ).length;
    
    const pendingForms = forms.filter(f => 
      f.status === "pending" || 
      f.status?.includes("pending") ||
      f.status === "approved_dormitory"
    ).length;
    
    const efficiency = Math.round(((approvedForms + (pendingForms * 0.5)) / totalForms) * 100);
    return Math.min(efficiency, 100);
  };

  // ==================== USER MANAGEMENT ====================
 // Update the createStaff function in your AdminDashboard.jsx

const createStaff = async (values) => {
  try {
    setLoading(true);
    console.log("Creating staff with values:", values);
    
    // Ensure assigned_buildings is always an array
    const payload = {
      ...values,
      assigned_buildings: values.assigned_buildings || []
    };
    
    console.log("Sending payload:", payload);
    
    const response = await apiFetch("admin/create-user/", {
      method: "POST",
      body: payload,
    });
    
    console.log("Create user response:", response);
    
    message.success(`Staff user created successfully`);
    setCreateUserOpen(false);
    createUserForm.resetFields();
    
    // Reload data to show the new user
    await loadAllData();
    
  } catch (err) {
    console.error("Failed to create staff:", err);
    
    // Show detailed error message
    if (err.message) {
      message.error(`Failed to create staff: ${err.message}`);
    } else {
      message.error("Failed to create staff. Please check your input.");
    }
  } finally {
    setLoading(false);
  }
};

  const updateUser = async (id, data) => {
    try {
      await apiFetch(`users/${id}/`, { 
        method: "PUT", 
        body: data 
      });
      message.success("User updated successfully");
      loadAllData();
      setUserModal({ open: false, user: null });
      userForm.resetFields();
    } catch (err) {
      message.error(`Failed to update user: ${err.message}`);
    }
  };

  const deleteUser = async (id) => {
    try {
      await apiFetch(`users/${id}/`, { method: "DELETE" });
      message.success("User deleted successfully");
      loadAllData();
    } catch (err) {
      message.error(`Failed to delete user: ${err.message}`);
    }
  };

  const toggleUserBlock = async (user) => {
    try {
      await apiFetch(`users/${user.id}/`, {
        method: "PATCH",
        body: { is_blocked: !user.is_blocked }
      });
      message.success(`User ${user.is_blocked ? "unblocked" : "blocked"} successfully`);
      loadAllData();
    } catch (err) {
      message.error(`Failed to update user: ${err.message}`);
    }
  };

  // ==================== DEPARTMENT MANAGEMENT ====================
  const saveDepartment = async (values) => {
    try {
      if (deptEdit) {
        await apiFetch(`departments/${deptEdit.id}/`, { 
          method: "PUT", 
          body: values 
        });
        message.success("Department updated successfully");
      } else {
        await apiFetch("departments/create/", { 
          method: "POST", 
          body: values 
        });
        message.success("Department created successfully");
      }
      setDeptOpen(false);
      setDeptEdit(null);
      deptForm.resetFields();
      loadAllData();
    } catch (err) {
      message.error(`Failed to save department: ${err.message}`);
    }
  };

  const deleteDepartment = async (id) => {
    try { 
      await apiFetch(`departments/${id}/`, { method: "DELETE" }); 
      message.success("Department deleted successfully"); 
      loadAllData(); 
    } catch (err) { 
      message.error(`Failed to delete department: ${err.message}`); 
    }
  };

  const openEditDepartment = (dept) => {
    setDeptEdit(dept);
    deptForm.setFieldsValue({
      name: dept.name,
      college: dept.college
    });
    setDeptOpen(true);
  };

  // ==================== COLLEGE MANAGEMENT ====================
  const saveCollege = async (values) => {
    try {
      if (collegeEdit) {
        await apiFetch(`colleges/${collegeEdit.id}/`, { 
          method: "PUT", 
          body: values 
        });
        message.success("College updated successfully");
      } else {
        await apiFetch("colleges/create/", { 
          method: "POST", 
          body: values 
        });
        message.success("College created successfully");
      }
      setCollegeOpen(false);
      setCollegeEdit(null);
      collegeForm.resetFields();
      loadAllData();
    } catch (err) {
      message.error(`Failed to save college: ${err.message}`);
    }
  };

  const deleteCollege = async (id) => {
    try { 
      await apiFetch(`colleges/${id}/`, { method: "DELETE" }); 
      message.success("College deleted successfully"); 
      loadAllData(); 
    } catch (err) { 
      message.error(`Failed to delete college: ${err.message}`); 
    }
  };

  const openEditCollege = (college) => {
    setCollegeEdit(college);
    collegeForm.setFieldsValue({
      name: college.name
    });
    setCollegeOpen(true);
  };

  // ==================== FORM MANAGEMENT ====================
  const updateFormStatus = async (formId, status) => {
    try {
      await apiFetch(`admin/form-requests/${formId}/`, {
        method: "PATCH",
        body: { status },
      });
      message.success(`Form status updated to ${status}`);
      loadAllData();
    } catch (err) {
      message.error(`Failed to update form: ${err.message}`);
    }
  };

  // ==================== SYSTEM CONTROL ====================
  const saveSystemControl = async (values) => {
    try {
      if (systemControls.length > 0) {
        await apiFetch(`system-controls/${systemControls[0].id}/`, { 
          method: "PUT", 
          body: values 
        });
      } else {
        await apiFetch("system-controls/", { 
          method: "POST", 
          body: values 
        });
      }
      message.success("System control updated successfully");
      setSystemControlOpen(false);
      systemControlForm.resetFields();
      loadAllData();
    } catch (err) {
      message.error(`Failed to update system control: ${err.message}`);
    }
  };

  const toggleSystem = async (value) => {
    try {
      if (systemControls.length > 0) {
        await apiFetch(`system-controls/${systemControls[0].id}/`, { 
          method: "PATCH", 
          body: { is_open: value } 
        });
      } else {
        await apiFetch("system-controls/", { 
          method: "POST", 
          body: { is_open: value } 
        });
      }
      message.success(`System ${value ? "opened" : "closed"} successfully`);
      loadAllData();
    } catch (err) {
      message.error(`Failed to update system: ${err.message}`);
    }
  };

  // ==================== RENDER STATUS ====================
  const renderStatus = (status) => {
    switch(status?.toLowerCase()) {
      case "approved":
      case "completed":
      case "cleared by registrar":
        return <Tag icon={<CheckCircleOutlined />} color="success">APPROVED</Tag>;
      case "rejected":
        return <Tag icon={<CloseCircleOutlined />} color="error">REJECTED</Tag>;
      case "pending":
      case "pending_department":
        return <Tag icon={<ClockCircleOutlined />} color="warning">PENDING</Tag>;
      case "approved_department":
        return <Tag color="blue" icon={<CheckCircleOutlined />}>APPROVED BY DEPT</Tag>;
      case "approved_library":
        return <Tag color="green" icon={<CheckCircleOutlined />}>APPROVED BY LIBRARY</Tag>;
      case "approved_cafeteria":
        return <Tag color="orange" icon={<CheckCircleOutlined />}>APPROVED BY CAFETERIA</Tag>;
      case "approved_psychology":
        return <Tag color="magenta" icon={<CheckCircleOutlined />}>APPROVED BY PSYCHOLOGY</Tag>;
      case "approved_sportmaster":
        return <Tag color="lime" icon={<CheckCircleOutlined />}>APPROVED BY SPORT MASTER</Tag>;
      case "approved_campuspolice":
        return <Tag color="red" icon={<CheckCircleOutlined />}>APPROVED BY CAMPUS POLICE</Tag>;
      case "approved_cooperationsharing":
        return <Tag color="geekblue" icon={<CheckCircleOutlined />}>APPROVED BY COOP SHARING</Tag>;
      case "approved_dopcordinator":
        return <Tag color="cyan" icon={<CheckCircleOutlined />}>APPROVED BY DOP</Tag>;
      case "approved_studentaffairs":
        return <Tag color="gold" icon={<CheckCircleOutlined />}>APPROVED BY STUDENT AFFAIRS</Tag>;
      case "approved_dormitory":
        return <Tag color="purple" icon={<CheckCircleOutlined />}>APPROVED BY DORMITORY</Tag>;
      default:
        return <Tag color="default">{status || "Unknown"}</Tag>;
    }
  };

  const renderUserStatus = (user) => (
    <Badge 
      status={user.is_blocked ? "error" : "success"} 
      text={user.is_blocked ? "Blocked" : "Active"}
    />
    
  );
  

  const renderRoleTag = (role) => {
    const roleInfo = ROLE_OPTIONS.find(r => r.value === role) || { label: role, color: "default" };
    return (
      <Tag color={roleInfo.color} icon={roleInfo.icon}>
        {roleInfo.label.toUpperCase()}
      </Tag>
    );
  };

  // ==================== RENDER BUILDING STATUS ====================
  const renderBuildingStatus = (building) => {
    const occupancy = building.capacity > 0 
      ? Math.round(((building.student_count || 0) / building.capacity) * 100)
      : 0;
    
    let color = 'green';
    if (occupancy > 90) color = 'red';
    else if (occupancy > 75) color = 'orange';
    
    return (
      <Space direction="vertical" size={2}>
        <Text strong>{building.student_count || 0} / {building.capacity || '∞'}</Text>
        {building.capacity > 0 && (
          <Progress 
            percent={occupancy}
            size="small"
            strokeColor={color}
            showInfo={false}
          />
        )}
      </Space>
    );
  };

  // ==================== LOGOUT ====================
  const logout = () => {
    sessionStorage.clear();
    localStorage.removeItem("ucs_user");
    message.success("Logged out successfully");
    navigate("/login");
  };

  // ==================== RENDER EFFICIENCY METRICS ====================
  const renderEfficiencyMetrics = () => {
    const efficiencyData = [
      { department: "Department Head", efficiency: 92, color: "#1890ff" },
      { department: "Library", efficiency: 88, color: "#52c41a" },
      { department: "Cafeteria", efficiency: 85, color: "#fa8c16" },
      { department: "Psychology", efficiency: 90, color: "#eb2f96" },
      { department: "Sport Master", efficiency: 87, color: "#a0d911" },
      { department: "Campus Police", efficiency: 82, color: "#f5222d" },
      { department: "Cooperation Sharing", efficiency: 84, color: "#2f54eb" },
      { department: "DOP Cordinator", efficiency: 89, color: "#13c2c2" },
      { department: "Student Affairs", efficiency: 86, color: "#faad14" },
      { department: "Dormitory", efficiency: 78, color: "#722ed1" },
      { department: "Registrar", efficiency: 95, color: "#fa541c" },
    ];

    return (
      <Card title="Department Efficiency" extra={
        <Button type="link" size="small" onClick={() => setEfficiencyModal(true)}>
          View Details
        </Button>
      }>
        <div style={{ padding: '0 10px' }}>
          {efficiencyData.map((dept, index) => (
            <div key={index} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong>{dept.department}</Text>
                <Text type="secondary">{dept.efficiency}%</Text>
              </div>
              <Progress 
                percent={dept.efficiency} 
                strokeColor={dept.color}
                size="small"
                showInfo={false}
              />
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // ==================== RENDER ====================
  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Card 
        style={{ 
          marginBottom: 24,
          background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
          color: 'white',
          borderRadius: 12,
          boxShadow: '0 8px 25px rgba(24, 144, 255, 0.3)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                <SafetyOutlined /> Admin Dashboard
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                <DashboardOutlined /> Welcome, {session.username} | Role: {session.role}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadAllData}
                loading={loading}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600
                }}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #1890ff' }}>
            <Statistic 
              title="Total Users" 
              value={stats.total_users || users.length} 
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '28px' }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>Across all roles</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #52c41a' }}>
            <Statistic 
              title="Colleges" 
              value={stats.total_colleges || colleges.length} 
              prefix={<BankOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #722ed1' }}>
            <Statistic 
              title="Departments" 
              value={stats.active_departments || departments.length} 
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #fa8c16' }}>
            <Statistic 
              title="Forms Today" 
              value={stats.today_forms || 0} 
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #13c2c2' }}>
            <Statistic
              title="System Efficiency"
              value={stats.efficiency || calculateSystemEfficiency()}
              suffix="%"
              prefix={<PercentageOutlined />}
              valueStyle={{ color: '#13c2c2', fontSize: '28px' }}
            />
            <Progress 
              percent={stats.efficiency || calculateSystemEfficiency()} 
              size="small" 
              strokeColor="#13c2c2"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #eb2f96' }}>
            <Statistic
              title="Weekly Trend"
              value={stats.weekly_trend || "+0%"}
              prefix={stats.weekly_trend?.startsWith?.('+') ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ 
                color: stats.weekly_trend?.startsWith?.('+') ? '#52c41a' : '#ff4d4f', 
                fontSize: '28px' 
              }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>Form submissions</Text>
          </Card>
        </Col>
      </Row>

      {/* Building Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #722ed1' }}>
            <Statistic 
              title="Total Buildings" 
              value={buildingStats.total}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #52c41a' }}>
            <Statistic 
              title="Active Buildings" 
              value={buildingStats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #1890ff' }}>
            <Statistic 
              title="Total Capacity" 
              value={buildingStats.total_capacity}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable style={{ borderRadius: 12, textAlign: 'center', border: '2px solid #fa8c16' }}>
            <Statistic 
              title="Current Occupancy" 
              value={buildingStats.current_occupancy}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fa8c16', fontSize: '28px' }}
            />
            {buildingStats.total_capacity > 0 && (
              <Progress 
                percent={Math.round((buildingStats.current_occupancy / buildingStats.total_capacity) * 100)}
                size="small"
                strokeColor="#fa8c16"
                showInfo={false}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Payment Stats */}
      {renderPaymentStats()}

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Left Column - Efficiency & Activity */}
        <Col xs={24} lg={8}>
          {renderEfficiencyMetrics()}
          {renderPaymentDistribution()}
          
          <Card title="Recent Activities" style={{ marginTop: 16, borderRadius: 12 }}>
            <Timeline>
              {recentActivities.slice(0, 5).map((activity, index) => (
                <Timeline.Item
                  key={index}
                  color={activity.color}
                  dot={activity.icon === 'check' ? <CheckCircleOutlined /> : 
                        activity.icon === 'home' ? <HomeOutlined /> :
                        activity.icon === 'shop' ? <ShopOutlined /> :
                        activity.icon === 'line-chart' ? <LineChartOutlined /> :
                        <FileTextOutlined />}
                >
                  <Space direction="vertical" size={2}>
                    <Text strong>{activity.user}</Text>
                    <Text type="secondary">{activity.action} - {activity.target}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{activity.time}</Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          <Card title="Quick Stats" style={{ marginTop: 16, borderRadius: 12 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                  <Statistic 
                    title="Approved Forms" 
                    value={stats.approved_forms || forms.filter(f => f.status === "completed").length} 
                    valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: '#fff2f0', border: '1px solid #ffccc7' }}>
                  <Statistic 
                    title="Rejected Forms" 
                    value={stats.rejected_forms || forms.filter(f => f.status === "rejected").length} 
                    valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                  <Statistic
                    title="Avg. Processing" 
                    value={stats.avg_processing_time || "0"}
                    suffix="days"
                    valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ background: '#f9f0ff', border: '1px solid #d3adf7' }}>
                  <Statistic 
                    title="Active Staff" 
                    value={users.filter(u => !u.is_blocked && u.role !== 'student').length} 
                    valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Right Column - Main Tabs */}
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 12, minHeight: '100%' }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              size="large"
              style={{ marginBottom: 0 }}
            >
              <TabPane 
                tab={<span><DatabaseOutlined /> Dashboard</span>}
                key="dashboard"
              >
                {/* Quick Actions */}
                <Card title="Quick Actions" style={{ marginBottom: 24, borderRadius: 8 }}>
                  <Space wrap>
                    <Button 
                      type="primary" 
                      icon={<UserAddOutlined />} 
                      onClick={() => {
                        createUserForm.resetFields();
                        setCreateUserOpen(true);
                      }}
                      size="large"
                    >
                      Create Staff User
                    </Button>
                    <Button 
                      type="default"
                      icon={<BankOutlined />} 
                      onClick={() => {
                        setCollegeEdit(null);
                        collegeForm.resetFields();
                        setCollegeOpen(true);
                      }}
                      size="large"
                    >
                      Add College
                    </Button>
                    <Button 
                      type="default"
                      icon={<ShopOutlined />} 
                      onClick={() => {
                        setDeptEdit(null);
                        deptForm.resetFields();
                        setDeptOpen(true);
                      }}
                      size="large"
                    >
                      Add Department
                    </Button>
                    <Button 
                      type="default"
                      icon={<HomeOutlined />} 
                      onClick={() => {
                        buildingForm.resetFields();
                        setBuildingModal({ open: true, building: null });
                      }}
                      size="large"
                    >
                      Add Building
                    </Button>
                    <Button 
                      type="primary"
                      icon={<MoneyCollectOutlined />}
                      onClick={() => {
                        paymentMethodForm.resetFields();
                        setPaymentMethodModal({ open: true, method: null });
                      }}
                      size="large"
                    >
                      Add Payment Method
                    </Button>
                  {/* Quick Actions - Add this button */}
<Button 
  type="default"
  icon={<TeamOutlined />}
  onClick={() => setStaffModalOpen(true)}
  size="large"
>
  View All Staff
</Button>
                  </Space>
                </Card>

                {/* In the Dashboard TabPane, after the Quick Actions card */}

{/* Staff Overview Card */}
<Card 
  title="Staff Overview" 
  style={{ marginBottom: 24, borderRadius: 8 }}
  extra={
    <Button 
      type="primary" 
      icon={<TeamOutlined />}
      onClick={() => {
        // Navigate to users tab and filter for staff only
        setActiveTab("users");
        // You could add a filter here if you implement search
      }}
    >
      View All Staff
    </Button>
  }
>
  <Row gutter={[16, 16]}>
    <Col xs={24} sm={12} md={6}>
      <Card 
        size="small" 
        style={{ 
          background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
          border: '1px solid #91d5ff',
          borderRadius: 8
        }}
      >
        <Statistic 
          title="Department Heads" 
          value={users.filter(u => u.role === 'departmenthead').length} 
          prefix={<ShopOutlined style={{ color: '#1890ff' }} />}
          valueStyle={{ color: '#1890ff' }}
        />
        <div style={{ marginTop: 8 }}>
          {users.filter(u => u.role === 'departmenthead').slice(0, 3).map(head => (
            <Tag color="blue" key={head.id} style={{ margin: '2px' }}>
              {head.username}
            </Tag>
          ))}
          {users.filter(u => u.role === 'departmenthead').length > 3 && (
            <Tag color="blue">+{users.filter(u => u.role === 'departmenthead').length - 3} more</Tag>
          )}
        </div>
      </Card>
    </Col>
    
    <Col xs={24} sm={12} md={6}>
      <Card 
        size="small" 
        style={{ 
          background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
          border: '1px solid #b7eb8f',
          borderRadius: 8
        }}
      >
        <Statistic 
          title="Librarians" 
          value={users.filter(u => u.role === 'librarian').length} 
          prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
          valueStyle={{ color: '#52c41a' }}
        />
        <div style={{ marginTop: 8 }}>
          {users.filter(u => u.role === 'librarian').slice(0, 3).map(lib => (
            <Tag color="green" key={lib.id} style={{ margin: '2px' }}>
              {lib.username}
            </Tag>
          ))}
        </div>
      </Card>
    </Col>
    
    <Col xs={24} sm={12} md={6}>
      <Card 
        size="small" 
        style={{ 
          background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)',
          border: '1px solid #ffc53d',
          borderRadius: 8
        }}
      >
        <Statistic 
          title="Cafeteria Staff" 
          value={users.filter(u => u.role === 'cafeteria').length} 
          prefix={<ShopOutlined style={{ color: '#fa8c16' }} />}
          valueStyle={{ color: '#fa8c16' }}
        />
        <div style={{ marginTop: 8 }}>
          {users.filter(u => u.role === 'cafeteria').slice(0, 3).map(cafe => (
            <Tag color="orange" key={cafe.id} style={{ margin: '2px' }}>
              {cafe.username}
            </Tag>
          ))}
        </div>
      </Card>
    </Col>
    
    <Col xs={24} sm={12} md={6}>
      <Card 
        size="small" 
        style={{ 
          background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
          border: '1px solid #d3adf7',
          borderRadius: 8
        }}
      >
        <Statistic 
          title="Dormitory Staff" 
          value={dormitoryStaff.length} 
          prefix={<HomeOutlined style={{ color: '#722ed1' }} />}
          valueStyle={{ color: '#722ed1' }}
        />
        <div style={{ marginTop: 8 }}>
          {dormitoryStaff.slice(0, 3).map(staff => (
            <Tag color="purple" key={staff.id} style={{ margin: '2px' }}>
              {staff.full_name || staff.username}
            </Tag>
          ))}
          {dormitoryStaff.length > 3 && (
            <Tag color="purple">+{dormitoryStaff.length - 3} more</Tag>
          )}
        </div>
      </Card>
    </Col>
  </Row>
  
  {/* Second row of staff roles */}
  <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
    <Col xs={24} sm={12} md={6}>
      <Card 
        size="small" 
        style={{ 
          background: '#fff0f6',
          border: '1px solid #ffadd2',
          borderRadius: 8
        }}
      >
        <Statistic 
          title="Psychology" 
          value={users.filter(u => u.role === 'psychology').length} 
          prefix={<HeartOutlined style={{ color: '#eb2f96' }} />}
          valueStyle={{ color: '#eb2f96' }}
        />
      </Card>
    </Col>
    
    <Col xs={24} sm={12} md={6}>
      <Card 
        size="small" 
        style={{ 
          background: '#fcffe6',
          border: '1px solid #eaff8f',
          borderRadius: 8
        }}
      >
        <Statistic 
          title="Sport Masters" 
          value={users.filter(u => u.role === 'sportmaster').length} 
          prefix={<TrophyOutlined style={{ color: '#a0d911' }} />}
          valueStyle={{ color: '#a0d911' }}
        />
      </Card>
    </Col>
    
    <Col xs={24} sm={12} md={6}>
      <Card 
        size="small" 
        style={{ 
          background: '#fff1f0',
          border: '1px solid #ffa39e',
          borderRadius: 8
        }}
      >
        <Statistic 
          title="Campus Police" 
          value={users.filter(u => u.role === 'campuspolice').length} 
          prefix={<SafetyOutlined style={{ color: '#f5222d' }} />}
          valueStyle={{ color: '#f5222d' }}
        />
      </Card>
    </Col>
    
    <Col xs={24} sm={12} md={6}>
      <Card 
        size="small" 
        style={{ 
          background: '#e6fffb',
          border: '1px solid #87e8de',
          borderRadius: 8
        }}
      >
        <Statistic 
          title="Registrars" 
          value={users.filter(u => u.role === 'registrar').length} 
          prefix={<SolutionOutlined style={{ color: '#13c2c2' }} />}
          valueStyle={{ color: '#13c2c2' }}
        />
      </Card>
    </Col>
  </Row>
</Card>

{/* Staff Details Modal - Updated with Delete and Update functionality */}
<Modal
  title={<span><TeamOutlined /> All Staff Members</span>}
  open={staffModalOpen}
  onCancel={() => setStaffModalOpen(false)}
  footer={[
    <Button key="close" onClick={() => setStaffModalOpen(false)}>
      Close
    </Button>,
    <Button 
      key="manage" 
      type="primary"
      icon={<UserAddOutlined />}
      onClick={() => {
        setStaffModalOpen(false);
        setCreateUserOpen(true);
      }}
    >
      Add New Staff
    </Button>
  ]}
  width={1100}
  style={{ top: 20 }}
>
  <Tabs defaultActiveKey="all" size="large">
    {/* ALL STAFF TAB */}
    <TabPane tab="All Staff" key="all">
      <Table
        dataSource={users.filter(u => u.role !== 'student')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        size="middle"
        scroll={{ x: 900 }}
        columns={[
          { 
            title: "Staff Member", 
            width: 200,
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Role", 
            width: 150,
            render: (_, record) => renderRoleTag(record.role)
          },
          { 
            title: "Department/Building", 
            width: 250,
            render: (_, record) => {
              // Dormitory staff - show buildings
              if (record.role === 'dormitory') {
                const buildings = record.assigned_buildings_info || [];
                return buildings.length > 0 ? (
                  <Space wrap>
                    {buildings.map(b => (
                      <Tag color="purple" key={b.id}>{b.name}</Tag>
                    ))}
                  </Space>
                ) : <Tag color="orange">No buildings</Tag>;
              }
              // Department heads - show department
              else if (record.role === 'departmenthead') {
                const deptName = record.department_name || 
                                (record.department ? 
                                  (typeof record.department === 'object' ? record.department.name : record.department) 
                                  : null);
                return deptName ? (
                  <Tag color="blue">{deptName}</Tag>
                ) : <Tag color="orange">No department</Tag>;
              }
              // Other staff - show department if available
              else {
                const deptName = record.department_name || 
                                (record.department ? 
                                  (typeof record.department === 'object' ? record.department.name : record.department) 
                                  : null);
                return deptName || '-';
              }
            }
          },
          { 
            title: "Status", 
            width: 100,
            render: (_, user) => renderUserStatus(user)
          },
          { 
            title: "Joined", 
            width: 120,
            dataIndex: "date_joined",
            render: (date) => date ? dayjs(date).format('MMM D, YYYY') : '-'
          },
          {
            title: "Actions",
            width: 150,
            fixed: 'right',
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        department: user.department,
                        is_blocked: user.is_blocked,
                        assigned_buildings: user.assigned_buildings_info?.map(b => b.id) || []
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete this user?"
                  description={
                    <div>
                      <p>Are you sure you want to delete this user?</p>
                      <p><Text strong>{user.full_name || user.username}</Text> ({user.role})</p>
                      <p>This action cannot be undone.</p>
                    </div>
                  }
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes, Delete"
                  cancelText="Cancel"
                  okType="danger"
                  placement="left"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* DEPARTMENT HEADS TAB */}
    <TabPane tab="Department Heads" key="deptheads">
      <Table
        dataSource={users.filter(u => u.role === 'departmenthead')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Department", 
            render: (_, record) => {
              const deptName = record.department_name || 
                              (record.department ? 
                                (typeof record.department === 'object' ? record.department.name : record.department) 
                                : null);
              return deptName ? (
                <Space>
                  <ShopOutlined style={{ color: '#1890ff' }} />
                  <Tag color="blue" style={{ fontSize: '13px', padding: '4px 8px' }}>
                    {deptName}
                  </Tag>
                </Space>
              ) : (
                <Tag color="orange">No department assigned</Tag>
              );
            }
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 200,
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        department: user.department,
                        is_blocked: user.is_blocked
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete Department Head?"
                  description={`Are you sure you want to delete ${user.full_name || user.username}?`}
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* LIBRARIANS TAB */}
    <TabPane tab="Librarians" key="librarians">
      <Table
        dataSource={users.filter(u => u.role === 'librarian')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 200,
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        is_blocked: user.is_blocked
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete Librarian?"
                  description={`Are you sure you want to delete ${user.full_name || user.username}?`}
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* CAFETERIA TAB */}
    <TabPane tab="Cafeteria" key="cafeteria">
      <Table
        dataSource={users.filter(u => u.role === 'cafeteria')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 200,
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        is_blocked: user.is_blocked
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete Cafeteria Staff?"
                  description={`Are you sure you want to delete ${user.full_name || user.username}?`}
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* PSYCHOLOGY TAB */}
    <TabPane tab="Psychology" key="psychology">
      <Table
        dataSource={users.filter(u => u.role === 'psychology')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 200,
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        is_blocked: user.is_blocked
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete Psychology Staff?"
                  description={`Are you sure you want to delete ${user.full_name || user.username}?`}
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* SPORT MASTER TAB */}
    <TabPane tab="Sport Masters" key="sportmaster">
      <Table
        dataSource={users.filter(u => u.role === 'sportmaster')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 200,
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        is_blocked: user.is_blocked
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete Sport Master?"
                  description={`Are you sure you want to delete ${user.full_name || user.username}?`}
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* CAMPUS POLICE TAB */}
    <TabPane tab="Campus Police" key="campuspolice">
      <Table
        dataSource={users.filter(u => u.role === 'campuspolice')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 200,
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        is_blocked: user.is_blocked
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete Campus Police?"
                  description={`Are you sure you want to delete ${user.full_name || user.username}?`}
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* COOPERATION SHARING TAB */}
    <TabPane tab="Cooperation Sharing" key="cooperationsharing">
      <Table
        dataSource={users.filter(u => u.role === 'cooperationsharing')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 200,
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        is_blocked: user.is_blocked
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete Cooperation Sharing Staff?"
                  description={`Are you sure you want to delete ${user.full_name || user.username}?`}
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* DOP COORDINATOR TAB */}
    <TabPane tab="DOP Coordinator" key="dopcoordinator">
      <Table
        dataSource={users.filter(u => u.role === 'dopcordinator')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Department", 
            render: (_, record) => {
              const deptName = record.department_name || 
                              (record.department ? 
                                (typeof record.department === 'object' ? record.department.name : record.department) 
                                : null);
              return deptName || '-';
            }
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 200,
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        department: user.department,
                        is_blocked: user.is_blocked
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete DOP Coordinator?"
                  description={`Are you sure you want to delete ${user.full_name || user.username}?`}
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* STUDENT AFFAIRS TAB */}
    <TabPane tab="Student Affairs" key="studentaffairs">
      <Table
        dataSource={users.filter(u => u.role === 'studentaffairs')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 200,
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        is_blocked: user.is_blocked
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete Student Affairs Staff?"
                  description={`Are you sure you want to delete ${user.full_name || user.username}?`}
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* DORMITORY TAB */}
    <TabPane tab="Dormitory" key="dormitory">
      <Table
        dataSource={dormitoryStaff}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Assigned Buildings", 
            render: (_, record) => {
              const buildings = record.assigned_buildings || [];
              return buildings.length > 0 ? (
                <Space wrap>
                  {buildings.map(b => (
                    <Tag color="purple" key={b.id}>{b.name}</Tag>
                  ))}
                </Space>
              ) : <Tag color="orange">No buildings</Tag>;
            }
          },
          { 
            title: "Students Managed", 
            render: (_, record) => record.students_managed || 0
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 250,
            render: (_, staff) => (
              <Space size="small">
                <Tooltip title="Assign Buildings">
                  <Button 
                    icon={<HomeOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setBuildingAssignmentModal({ open: true, staff });
                      assignmentForm.setFieldsValue({
                        building_ids: (staff.assigned_buildings || []).map(b => b.id)
                      });
                    }}
                  >
                    Assign
                  </Button>
                </Tooltip>
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user: staff })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user: staff });
                      userForm.setFieldsValue({
                        username: staff.username,
                        email: staff.email,
                        role: staff.role,
                        is_blocked: staff.is_blocked,
                        assigned_buildings: (staff.assigned_buildings || []).map(b => b.id)
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={staff.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={staff.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={staff.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(staff)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete Dormitory Staff?"
                  description={`Are you sure you want to delete ${staff.full_name || staff.username}?`}
                  onConfirm={() => deleteUser(staff.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
    
    {/* REGISTRAR TAB */}
    <TabPane tab="Registrar" key="registrar">
      <Table
        dataSource={users.filter(u => u.role === 'registrar')}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={[
          { 
            title: "Name", 
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Text strong>{record.full_name || record.username}</Text>
                <Text type="secondary">{record.email}</Text>
              </Space>
            )
          },
          { 
            title: "Status", 
            render: (_, user) => renderUserStatus(user)
          },
          {
            title: "Actions",
            width: 200,
            render: (_, user) => (
              <Space size="small">
                <Tooltip title="View Details">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => setViewUserModal({ open: true, user })}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small"
                    type="primary"
                    onClick={() => {
                      setUserModal({ open: true, user });
                      userForm.setFieldsValue({
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        is_blocked: user.is_blocked
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
                  <Button 
                    icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                    size="small"
                    type={user.is_blocked ? "primary" : "danger"}
                    onClick={() => toggleUserBlock(user)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete Registrar?"
                  description={`Are you sure you want to delete ${user.full_name || user.username}?`}
                  onConfirm={() => deleteUser(user.id)}
                  okText="Yes"
                  cancelText="No"
                  okType="danger"
                >
                  <Tooltip title="Delete">
                    <Button 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      danger
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />
    </TabPane>
  </Tabs>
</Modal>

                {/* Recent Forms */}
                <Card 
                  title="Recent Clearance Forms" 
                  extra={
                    <Button type="link" onClick={() => setActiveTab("forms")}>View All</Button>
                  }
                  style={{ borderRadius: 8, marginBottom: 16 }}
                >
                  <Table
                    dataSource={forms.slice(0, 5)}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    columns={[
                      { 
                        title: "ID", 
                        dataIndex: "id", 
                        width: 60,
                        render: (id) => <Tag color="blue">#{id}</Tag>
                      },
                      { 
                        title: "Student", 
                        dataIndex: "student_name",
                        render: (text, record) => (
                          <Space direction="vertical" size={0}>
                            <Text strong>{text || 'Unknown'}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {record.student_email || 'No email'}
                            </Text>
                          </Space>
                        )
                      },
                      { title: "Department", dataIndex: "department" },
                      { 
                        title: "Status", 
                        dataIndex: "status",
                        render: (status) => renderStatus(status)
                      },
                      { 
                        title: "Created", 
                        dataIndex: "created_at",
                        render: (date) => date ? dayjs(date).format('MMM D, YYYY') : 'N/A'
                      },
                      {
                        title: "Actions",
                        width: 80,
                        render: (_, form) => (
                          <Tooltip title="View Details">
                            <Button 
                              icon={<EyeOutlined />} 
                              size="small"
                              type="link"
                              onClick={() => setViewFormModal({ open: true, form })}
                            />
                          </Tooltip>
                        ),
                      },
                    ]}
                  />
                </Card>

                {/* Recent Payments */}
                {renderRecentPayments()}
              </TabPane>

              {/* Buildings Tab */}
              <TabPane 
                tab={<span><HomeOutlined /> Buildings ({buildings.length})</span>}
                key="buildings"
              >
                <Card 
                  title="Building Management"
                  extra={
                    <Space>
                      <Button 
                        icon={<DownloadOutlined />}
                        onClick={exportBuildingStats}
                      >
                        Export Stats
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<HomeOutlined />}
                        onClick={() => {
                          buildingForm.resetFields();
                          setBuildingModal({ open: true, building: null });
                        }}
                      >
                        Add Building
                      </Button>
                    </Space>
                  }
                  style={{ borderRadius: 8 }}
                >
                  <Tabs defaultActiveKey="buildings" size="middle">
                    <TabPane tab="Buildings List" key="buildings">
                      <Table
                        dataSource={buildings}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        columns={[
                          { 
                            title: "ID", 
                            dataIndex: "id", 
                            width: 60,
                            render: (id) => <Tag color="purple">#{id}</Tag>
                          },
                          { 
                            title: "Building", 
                            dataIndex: "name",
                            render: (name, record) => (
                              <Space direction="vertical" size={0}>
                                <Text strong>{name}</Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Code: {record.code || 'N/A'}
                                </Text>
                              </Space>
                            )
                          },
                          { 
                            title: "Address", 
                            dataIndex: "address",
                            render: (address) => address || '-'
                          },
                          { 
                            title: "Capacity", 
                            dataIndex: "capacity",
                            render: (cap) => cap || 'Unlimited'
                          },
                          { 
                            title: "Occupancy", 
                            render: (_, building) => renderBuildingStatus(building)
                          },
                          { 
                            title: "Status", 
                            dataIndex: "is_active",
                            render: (active) => (
                              <Tag color={active ? "success" : "error"}>
                                {active ? "ACTIVE" : "INACTIVE"}
                              </Tag>
                            )
                          },
                          { 
                            title: "Staff Count", 
                            render: (_, building) => building.staff_count || 0
                          },
                          { 
                            title: "Forms", 
                            render: (_, building) => building.form_count || 0
                          },
                          {
                            title: "Actions",
                            width: 200,
                            render: (_, building) => (
                              <Space size="small">
                                <Tooltip title="Edit">
                                  <Button 
                                    icon={<EditOutlined />} 
                                    size="small"
                                    onClick={() => {
                                      setBuildingModal({ open: true, building });
                                      buildingForm.setFieldsValue({
                                        name: building.name,
                                        code: building.code,
                                        address: building.address,
                                        capacity: building.capacity,
                                        is_active: building.is_active
                                      });
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip title={building.is_active ? "Deactivate" : "Activate"}>
                                  <Button 
                                    icon={building.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />} 
                                    size="small"
                                    type={building.is_active ? "default" : "primary"}
                                    onClick={() => toggleBuildingStatus(building)}
                                  />
                                </Tooltip>
                                <Tooltip title="View Students">
                                  <Button 
                                    icon={<TeamOutlined />} 
                                    size="small"
                                    onClick={() => {
                                      const url = `/admin/users?building=${building.id}`;
                                      window.open(url, '_blank');
                                    }}
                                  />
                                </Tooltip>
                                <Popconfirm
                                  title="Delete this building?"
                                  description="This action cannot be undone."
                                  onConfirm={() => deleteBuilding(building.id)}
                                  okText="Yes"
                                  cancelText="No"
                                  okType="danger"
                                >
                                  <Tooltip title="Delete">
                                    <Button 
                                      icon={<DeleteOutlined />} 
                                      size="small" 
                                      danger
                                    />
                                  </Tooltip>
                                </Popconfirm>
                              </Space>
                            ),
                          },
                        ]}
                        expandable={{
                          expandedRowRender: (building) => (
                            <div style={{ padding: '20px', background: '#fafafa' }}>
                              <Row gutter={[16, 16]}>
                                <Col span={8}>
                                  <Card size="small" title="Building Info">
                                    <p><Text strong>Code:</Text> {building.code || 'N/A'}</p>
                                    <p><Text strong>Address:</Text> {building.address || 'N/A'}</p>
                                    <p><Text strong>Created:</Text> {building.created_at ? dayjs(building.created_at).format('MMM D, YYYY') : 'N/A'}</p>
                                  </Card>
                                </Col>
                                <Col span={8}>
                                  <Card size="small" title="Statistics">
                                    <Statistic title="Students" value={building.student_count || 0} suffix={`/ ${building.capacity || '∞'}`} />
                                    <Statistic title="Staff" value={building.staff_count || 0} style={{ marginTop: 10 }} />
                                    <Statistic title="Forms" value={building.form_count || 0} style={{ marginTop: 10 }} />
                                  </Card>
                                </Col>
                                <Col span={8}>
                                  <Card size="small" title="Quick Actions">
                                    <Button type="link" block icon={<TeamOutlined />}>View All Students</Button>
                                    <Button type="link" block icon={<UserAddOutlined />}>Assign Staff</Button>
                                  </Card>
                                </Col>
                              </Row>
                            </div>
                          ),
                        }}
                      />
                    </TabPane>
                    
                    <TabPane tab="Dormitory Staff Assignment" key="staff">

<Table
  dataSource={dormitoryStaff}
  rowKey="id"
  loading={loading}
  pagination={{ pageSize: 10 }}
  columns={[
    { 
      title: "Staff Name", 
      render: (_, staff) => (
        <Space direction="vertical" size={0}>
          <Text strong>{staff.full_name || staff.username}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{staff.email}</Text>
        </Space>
      )
    },
    { 
      title: "Assigned Buildings", 
      render: (_, staff) => {
        const assigned = staff.assigned_buildings || [];
        if (assigned.length === 0) {
          return <Tag color="orange">No buildings assigned</Tag>;
        }
        return (
          <Space wrap>
            {assigned.map(b => (
              <Tooltip key={b.id} title={`Code: ${b.code}`}>
                <Tag color="purple" style={{ cursor: 'pointer' }}>
                  <HomeOutlined /> {b.name}
                </Tag>
              </Tooltip>
            ))}
          </Space>
        );
      }
    },
    { 
      title: "Students Managed", 
      render: (_, staff) => staff.students_managed || 0
    },
    { 
      title: "Status", 
      dataIndex: "is_blocked",
      render: (blocked) => (
        <Tag color={blocked ? "error" : "success"}>
          {blocked ? "BLOCKED" : "ACTIVE"}
        </Tag>
      )
    },
    {
      title: "Actions",
      width: 200,
      render: (_, staff) => (
        <Space size="small">
          <Tooltip title="Assign Buildings">
            <Button 
              icon={<HomeOutlined />} 
              size="small"
              type="primary"
              onClick={() => {
                setBuildingAssignmentModal({ open: true, staff });
                assignmentForm.setFieldsValue({
                  building_ids: (staff.assigned_buildings || []).map(b => b.id)
                });
              }}
            >
              Assign
            </Button>
          </Tooltip>
          <Tooltip title="View Students">
            <Button 
              icon={<TeamOutlined />} 
              size="small"
              onClick={() => {
                // Navigate to users filtered by this staff's buildings
                const buildingIds = (staff.assigned_buildings || []).map(b => b.id).join(',');
                if (buildingIds) {
                  window.open(`/admin/users?buildings=${buildingIds}`, '_blank');
                } else {
                  message.info("No buildings assigned to this staff");
                }
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]}
/>
                    </TabPane>
                  </Tabs>
                </Card>
              </TabPane>

              {/* Payments Tab */}
              <TabPane 
                tab={<span><MoneyCollectOutlined /> Payments ({studentPayments.length})</span>}
                key="payments"
              >
                <Card 
                  title="Payment Management"
                  extra={
                    <Space>
                      <Button 
                        icon={<SyncOutlined />}
                        onClick={initializePaymentMethods}
                      >
                        Initialize Default Methods
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<MoneyCollectOutlined />}
                        onClick={() => {
                          paymentMethodForm.resetFields();
                          setPaymentMethodModal({ open: true, method: null });
                        }}
                      >
                        Add Payment Method
                      </Button>
                    </Space>
                  }
                  style={{ borderRadius: 8 }}
                >
                  <Tabs defaultActiveKey="all" size="middle">
                    <TabPane tab="All Payments" key="all">
                      <Table
                        dataSource={studentPayments}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        columns={[
                          { 
                            title: "Transaction ID", 
                            dataIndex: "transaction_id",
                            width: 150,
                            render: (id) => <Tag color="blue">{id || 'N/A'}</Tag>
                          },
                          { 
                            title: "Student", 
                            dataIndex: ["student", "username"],
                            render: (text, record) => (
                              <Space direction="vertical" size={0}>
                                <Text strong>{text || 'Unknown'}</Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {record.student?.email || 'No email'}
                                </Text>
                              </Space>
                            )
                          },
                          { 
                            title: "Department", 
                            dataIndex: "department_type",
                            render: (type) => renderDepartmentType(type)
                          },
                          { 
                            title: "Method", 
                            dataIndex: ["payment_method", "name"],
                            render: (method) => renderPaymentMethod(method)
                          },
                          { 
                            title: "Amount", 
                            dataIndex: "amount",
                            render: (amount) => (
                              <Text strong style={{ color: '#52c41a' }}>
                                {amount || 0} ETB
                              </Text>
                            )
                          },
                          { 
                            title: "Status", 
                            dataIndex: "status",
                            render: (status) => renderPaymentStatus(status)
                          },
                          { 
                            title: "Date", 
                            dataIndex: "created_at",
                            render: (date) => date ? dayjs(date).format('MMM D, YYYY') : 'N/A'
                          },
                          {
                            title: "Actions",
                            width: 120,
                            render: (_, payment) => (
                              <Space size="small">
                                <Tooltip title="View Details">
                                  <Button 
                                    icon={<EyeOutlined />} 
                                    size="small"
                                    onClick={() => viewPaymentDetails(payment)}
                                  />
                                </Tooltip>
                                <Tooltip title="View Logs">
                                  <Button 
                                    icon={<HistoryOutlined />} 
                                    size="small"
                                    onClick={() => viewPaymentLogs(payment)}
                                  />
                                </Tooltip>
                              </Space>
                            ),
                          },
                        ]}
                      />
                    </TabPane>
                    <TabPane tab="Payment Methods" key="methods">
                      <Table
                        dataSource={paymentMethods}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        columns={[
                          { 
                            title: "Method", 
                            dataIndex: "name",
                            render: (method) => renderPaymentMethod(method)
                          },
                          { 
                            title: "Account Name", 
                            dataIndex: "account_name"
                          },
                          { 
                            title: "Account Number", 
                            dataIndex: "account_number",
                            render: (num) => num || "N/A"
                          },
                          { 
                            title: "Phone Number", 
                            dataIndex: "phone_number",
                            render: (num) => num || "N/A"
                          },
                          { 
                            title: "Status", 
                            dataIndex: "is_active",
                            render: (active) => (
                              <Tag color={active ? "success" : "error"}>
                                {active ? "ACTIVE" : "INACTIVE"}
                              </Tag>
                            )
                          },
                          { 
                            title: "Created", 
                            dataIndex: "created_at",
                            render: (date) => date ? dayjs(date).format('MMM D, YYYY') : 'N/A'
                          },
                          {
                            title: "Actions",
                            width: 150,
                            render: (_, method) => (
                              <Space size="small">
                                <Tooltip title="Edit">
                                  <Button 
                                    icon={<EditOutlined />} 
                                    size="small"
                                    onClick={() => {
                                      setPaymentMethodModal({ open: true, method });
                                      paymentMethodForm.setFieldsValue({
                                        name: method.name,
                                        account_name: method.account_name,
                                        account_number: method.account_number,
                                        phone_number: method.phone_number,
                                        instructions: method.instructions,
                                        is_active: method.is_active
                                      });
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip title={method.is_active ? "Deactivate" : "Activate"}>
                                  <Button 
                                    icon={method.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />} 
                                    size="small"
                                    type={method.is_active ? "default" : "primary"}
                                    onClick={() => togglePaymentMethodStatus(method)}
                                  />
                                </Tooltip>
                                <Popconfirm
                                  title="Delete this payment method?"
                                  description="This action cannot be undone."
                                  onConfirm={() => deletePaymentMethod(method.id)}
                                  okText="Yes"
                                  cancelText="No"
                                  okType="danger"
                                >
                                  <Tooltip title="Delete">
                                    <Button 
                                      icon={<DeleteOutlined />} 
                                      size="small" 
                                      danger
                                    />
                                  </Tooltip>
                                </Popconfirm>
                              </Space>
                            ),
                          },
                        ]}
                      />
                    </TabPane>
                  </Tabs>
                </Card>
              </TabPane>

              {/* Student Registration Tab */}
              <TabPane 
                tab={<span><FileExcelOutlined /> Student Registration ({authorizedStudents.length})</span>}
                key="studentRegistration"
              >
                <Card 
                  title="Student Registration Management"
                  extra={
                    <Space>
                      <Button 
                        icon={<DownloadOutlined />}
                        onClick={downloadCSVTemplate}
                      >
                        Download Template
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<UploadOutlined />}
                        onClick={() => setCSVUploadModal(true)}
                      >
                        Upload CSV
                      </Button>
                    </Space>
                  }
                  style={{ borderRadius: 8 }}
                >
                  <Tabs defaultActiveKey="authorized" size="middle">
                    <TabPane tab="Authorized Students" key="authorized">
                      <Table
                        dataSource={authorizedStudents}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        tableLayout="fixed"
                        scroll={{ x: 1300 }}
                        columns={[
                          { 
                            title: "ID Number", 
                            dataIndex: "id_number",
                            width: 130,
                            render: (id) => <Tag color="blue">{id}</Tag>
                          },
                          { 
                            title: "Name",
                            width: 230,
                            ellipsis: true,
                            render: (_, student) => (
                              <Text strong style={{ display: "block" }}>
                                {student.first_name} {student.last_name}
                              </Text>
                            )
                          },
                          { 
                            title: "Email", 
                            dataIndex: "email",
                            width: 260,
                            ellipsis: true,
                            render: (email) => email || "-"
                          },
                          { 
                            title: "College", 
                            dataIndex: "college_name",
                            width: 200,
                            ellipsis: true,
                            render: (name) => name || "-"
                          },
                          { 
                            title: "Department", 
                            dataIndex: "department_name",
                            width: 200,
                            ellipsis: true,
                            render: (name) => name || "-"
                          },
                          { 
                            title: "Status",
                            width: 220,
                            render: (_, student) => (
                              <Space>
                                <Tag color={student.is_active ? "success" : "error"}>
                                  {student.is_active ? "ACTIVE" : "INACTIVE"}
                                </Tag>
                                <Tag color={student.is_registered ? "green" : "orange"}>
                                  {student.is_registered ? "REGISTERED" : "PENDING"}
                                </Tag>
                              </Space>
                            )
                          },
                          { 
                            title: "Registered", 
                            dataIndex: "registration_date",
                            width: 170,
                            render: (date) => 
                              date ? dayjs(date).format("MMM D, YYYY") : "-"
                          },
                          {
                            title: "Actions",
                            width: 150,
                            render: (_, student) => (
                              <Space size="small">
                                <Tooltip title={student.is_active ? "Deactivate" : "Activate"}>
                                  <Button 
                                    icon={
                                      student.is_active 
                                        ? <CloseCircleOutlined /> 
                                        : <CheckCircleOutlined />
                                    } 
                                    size="small"
                                    type={student.is_active ? "default" : "primary"}
                                    onClick={() => toggleStudentStatus(student)}
                                  />
                                </Tooltip>

                                {!student.is_registered && (
                                  <Popconfirm
                                    title="Delete this student?"
                                    description="This action cannot be undone."
                                    onConfirm={() => deleteAuthorizedStudent(student.id)}
                                    okText="Yes"
                                    cancelText="No"
                                    okType="danger"
                                  >
                                    <Tooltip title="Delete">
                                      <Button 
                                        icon={<DeleteOutlined />} 
                                        size="small" 
                                        danger
                                      />
                                    </Tooltip>
                                  </Popconfirm>
                                )}
                              </Space>
                            ),
                          },
                        ]}
                      />
                    </TabPane>
                    <TabPane tab="CSV Uploads" key="uploads">
                      <Table
                        dataSource={csvUploads}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        columns={[
                          { 
                            title: "Filename", 
                            dataIndex: "filename",
                            render: (name) => <Text strong>{name}</Text>
                          },
                          { 
                            title: "Uploaded By", 
                            dataIndex: ["uploaded_by", "username"]
                          },
                          { 
                            title: "Records", 
                            render: (_, upload) => (
                              <Space>
                                <Text strong style={{ color: '#52c41a' }}>{upload.successful_records || 0}</Text>
                                <Text>/</Text>
                                <Text>{upload.total_records || 0}</Text>
                              </Space>
                            )
                          },
                          { 
                            title: "Failed", 
                            dataIndex: "failed_records",
                            render: (count) => count > 0 ? (
                              <Text type="danger" strong>{count || 0}</Text>
                            ) : (
                              <Text type="success">0</Text>
                            )
                          },
                          { 
                            title: "Date", 
                            dataIndex: "created_at",
                            render: (date) => date ? dayjs(date).format('MMM D, YYYY HH:mm') : 'N/A'
                          },
                          {
                            title: "Actions",
                            width: 80,
                            render: (_, upload) => (
                              <Popconfirm
                                title="Delete this upload?"
                                description="This will also delete all associated students that are not registered."
                                onConfirm={() => deleteCSVUpload(upload.id)}
                                okText="Yes"
                                cancelText="No"
                                okType="danger"
                              >
                                <Tooltip title="Delete">
                                  <Button 
                                    icon={<DeleteOutlined />} 
                                    size="small" 
                                    danger
                                  />
                                </Tooltip>
                              </Popconfirm>
                            ),
                          },
                        ]}
                      />
                    </TabPane>
                  </Tabs>
                </Card>
              </TabPane>

{/* Users Tab - Fixed Table Columns */}
{/* Users Tab - Add College column */}
<TabPane 
  tab={<span><TeamOutlined /> Users ({users.length})</span>}
  key="users"
>
  <Card 
    title="User Management"
    extra={
      <Button 
        type="primary" 
        icon={<UserAddOutlined />} 
        onClick={() => {
          createUserForm.resetFields();
          setCreateUserOpen(true);
        }}
      >
        Add User
      </Button>
    }
    style={{ borderRadius: 8 }}
  >
    <Table
      dataSource={users}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 1200 }}
    >
      <Table.Column 
        title="ID" 
        width={80}
        render={(_, record) => {
          if (record.role === 'student') {
            return <Tag color="green">#{record.id_number || record.id}</Tag>;
          }
          return <Tag color="blue">#{record.id}</Tag>;
        }}
      />
      
      <Table.Column 
        title="User" 
        width={200}
        render={(_, record) => (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Text strong style={{ wordBreak: 'break-word' }}>
              {record.full_name || record.username}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px', wordBreak: 'break-word' }}>
              {record.email}
            </Text>
          </Space>
        )}
      />
      
      <Table.Column 
        title="Role" 
        width={120}
        render={(_, record) => renderRoleTag(record.role)}
      />
      
      <Table.Column 
        title="Department" 
        width={150}
        render={(_, record) => {
          if (!record.department && !record.department_name) return '-';
          
          const deptName = record.department_name || 
                          (record.department ? 
                            (typeof record.department === 'object' ? record.department.name : record.department) 
                            : null);
          
          return deptName ? (
            <Tag color={record.role === 'departmenthead' ? "blue" : "default"}>
              {deptName}
            </Tag>
          ) : '-';
        }}
      />
      
      {/* College column - Only show for students */}
      <Table.Column 
        title="College" 
        width={150}
        render={(_, record) => {
          if (record.role === 'student') {
            const college = record.college_name || 
                           record.college ||
                           (record.college_info?.name);
            
            return college ? (
              <Tag color="purple">{college}</Tag>
            ) : (
              <Tag color="orange">Not set</Tag>
            );
          }
          return '-';
        }}
      />
      
      <Table.Column 
        title="Student ID" 
        width={120}
        render={(_, record) => {
          if (record.role === 'student') {
            const username = record.username || '';
            const parts = username.split('_');
            let studentId = null;
            
            if (parts.length >= 3) {
              studentId = parts[parts.length - 1];
            } else if (parts.length === 2) {
              studentId = parts[1];
            }
            
            if (studentId && /\d/.test(studentId)) {
              return <Tag color="green">{studentId}</Tag>;
            }
            
            if (record.id_number) {
              return <Tag color="green">{record.id_number}</Tag>;
            }
            
            return <Tag color="orange">In username</Tag>;
          }
          return '-';
        }}
      />
      
      <Table.Column 
        title="Status" 
        width={100}
        render={(_, record) => renderUserStatus(record)}
      />
      
      <Table.Column
        title="Actions"
        width={200}
        fixed="right"
        render={(_, user) => (
          <Space size="small">
            <Tooltip title="View Details">
              <Button 
                icon={<EyeOutlined />} 
                size="small"
                onClick={() => setViewUserModal({ open: true, user })}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => {
                  setUserModal({ open: true, user });
                  userForm.setFieldsValue({
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    is_blocked: user.is_blocked,
                    assigned_buildings: user.assigned_buildings_info?.map(b => b.id) || []
                  });
                }}
              />
            </Tooltip>
            <Tooltip title={user.is_blocked ? "Unblock" : "Block"}>
              <Button 
                icon={user.is_blocked ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                size="small"
                type={user.is_blocked ? "primary" : "danger"}
                onClick={() => toggleUserBlock(user)}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this user?"
              description="This action cannot be undone."
              onConfirm={() => deleteUser(user.id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
            >
              <Tooltip title="Delete">
                <Button 
                  icon={<DeleteOutlined />} 
                  size="small" 
                  danger
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        )}
      />
    </Table>
  </Card>
</TabPane>

              {/* Colleges Tab */}
              <TabPane 
                tab={<span><BankOutlined /> Colleges ({colleges.length})</span>}
                key="colleges"
              >
                <Card 
                  title="College Management"
                  extra={
                    <Button 
                      icon={<BankOutlined />} 
                      onClick={() => {
                        setCollegeEdit(null);
                        collegeForm.resetFields();
                        setCollegeOpen(true);
                      }}
                    >
                      Add College
                    </Button>
                  }
                  style={{ borderRadius: 8 }}
                >
                  <Table
                    dataSource={colleges}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    columns={[
                      { 
                        title: "ID", 
                        dataIndex: "id", 
                        width: 60,
                        render: (id) => <Tag color="green">#{id}</Tag>
                      },
                      { title: "Name", dataIndex: "name" },
                      { 
                        title: "Created", 
                        dataIndex: "created_at",
                        render: (date) => date ? dayjs(date).format('MMM D, YYYY') : "-"
                      },
                      {
                        title: "Actions",
                        width: 100,
                        render: (_, college) => (
                          <Space size="small">
                            <Tooltip title="Edit">
                              <Button 
                                icon={<EditOutlined />} 
                                size="small"
                                onClick={() => openEditCollege(college)}
                              />
                            </Tooltip>
                            <Popconfirm
                              title="Delete this college?"
                              description="This will also delete all associated departments."
                              onConfirm={() => deleteCollege(college.id)}
                              okText="Yes"
                              cancelText="No"
                              okType="danger"
                            >
                              <Tooltip title="Delete">
                                <Button 
                                  icon={<DeleteOutlined />} 
                                  size="small" 
                                  danger
                                />
                              </Tooltip>
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Card>
              </TabPane>

              {/* Departments Tab */}
              <TabPane 
                tab={<span><ShopOutlined /> Departments ({departments.length})</span>}
                key="departments"
              >
                <Card 
                  title="Department Management"
                  extra={
                    <Button 
                      icon={<ShopOutlined />} 
                      onClick={() => {
                        setDeptEdit(null);
                        deptForm.resetFields();
                        setDeptOpen(true);
                      }}
                    >
                      Add Department
                    </Button>
                  }
                  style={{ borderRadius: 8 }}
                >
                  <Table
                    dataSource={departments}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    columns={[
                      { 
                        title: "ID", 
                        dataIndex: "id", 
                        width: 60,
                        render: (id) => <Tag color="purple">#{id}</Tag>
                      },
                      { title: "Name", dataIndex: "name" },
                      { 
                        title: "College", 
                        dataIndex: "college_name",
                        render: (name) => name || "-"
                      },
                      { 
                        title: "Created", 
                        dataIndex: "created_at",
                        render: (date) => date ? dayjs(date).format('MMM D, YYYY') : "-"
                      },
                      {
                        title: "Actions",
                        width: 100,
                        render: (_, dept) => (
                          <Space size="small">
                            <Tooltip title="Edit">
                              <Button 
                                icon={<EditOutlined />} 
                                size="small"
                                onClick={() => openEditDepartment(dept)}
                              />
                            </Tooltip>
                            <Popconfirm
                              title="Delete this department?"
                              onConfirm={() => deleteDepartment(dept.id)}
                              okText="Yes"
                              cancelText="No"
                              okType="danger"
                            >
                              <Tooltip title="Delete">
                                <Button 
                                  icon={<DeleteOutlined />} 
                                  size="small" 
                                  danger
                                />
                              </Tooltip>
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Card>
              </TabPane>

              {/* Forms Tab */}
              <TabPane 
                tab={<span><FileTextOutlined /> Forms ({forms.length})</span>}
                key="forms"
              >
                <Card title="Clearance Forms Management" style={{ borderRadius: 8 }}>
                  <Table
                    dataSource={forms}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    columns={[
                      { 
                        title: "ID", 
                        dataIndex: "id", 
                        width: 60,
                        render: (id) => <Tag color="blue">#{id}</Tag>
                      },
                      { 
                        title: "Student", 
                        dataIndex: "student_name",
                        render: (text, record) => (
                          <Space direction="vertical" size={0}>
                            <Text strong>{text || 'Unknown'}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {record.student_email || 'No email'}
                            </Text>
                          </Space>
                        )
                      },
                      { title: "Department", dataIndex: "department" },
                      { 
                        title: "Status", 
                        dataIndex: "status",
                        render: (status) => renderStatus(status)
                      },
                      { 
                        title: "Created", 
                        dataIndex: "created_at",
                        render: (date) => date ? dayjs(date).format('MMM D, YYYY') : 'N/A'
                      },
                      {
                        title: "Actions",
                        width: 150,
                        render: (_, form) => (
                          <Space size="small">
                            <Tooltip title="View Details">
                              <Button 
                                icon={<EyeOutlined />} 
                                size="small"
                                onClick={() => setViewFormModal({ open: true, form })}
                              />
                            </Tooltip>
                            {form.status !== "completed" && form.status !== "rejected" && (
                              <Select
                                size="small"
                                style={{ width: 140 }}
                                placeholder="Change Status"
                                onChange={(value) => updateFormStatus(form.id, value)}
                              >
                                <Option value="pending_department">Pending Dept</Option>
                                <Option value="approved_department">Approve Dept</Option>
                                <Option value="approved_library">Approve Library</Option>
                                <Option value="approved_cafeteria">Approve Cafeteria</Option>
                                <Option value="approved_dormitory">Approve Dormitory</Option>
                                <Option value="approved_registrar">Approve Registrar</Option>
                                <Option value="Cleared by Registrar">Cleared</Option>
                                <Option value="completed">Complete</Option>
                                <Option value="rejected">Reject</Option>
                              </Select>
                            )}
                          </Space>
                        ),
                      },
                    ]}
                  />
                </Card>
              </TabPane>

              {/* System Tab */}
              <TabPane 
                tab={<span><SettingOutlined /> System</span>}
                key="system"
              >
                <Card 
                  title="System Control"
                  extra={
                    <Button 
                      icon={<SettingOutlined />}
                      onClick={() => {
                        if (systemControls.length > 0) {
                          systemControlForm.setFieldsValue({
                            is_open: systemControls[0].is_open,
                            maintenance_message: systemControls[0].maintenance_message || ""
                          });
                        }
                        setSystemControlOpen(true);
                      }}
                    >
                      Edit System Settings
                    </Button>
                  }
                  style={{ borderRadius: 8 }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <Switch 
                          checked={systemControls[0]?.is_open || false} 
                          onChange={toggleSystem}
                          checkedChildren="System Open"
                          unCheckedChildren="System Closed"
                          size="large"
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <Text strong style={{ fontSize: '16px' }}>
                          System is currently: 
                          <Tag 
                            color={systemControls[0]?.is_open ? "success" : "error"} 
                            style={{ marginLeft: 8, fontSize: '14px', padding: '4px 8px' }}
                          >
                            {systemControls[0]?.is_open ? "OPEN" : "CLOSED"}
                          </Tag>
                        </Text>
                      </div>
                      
                      {systemControls[0]?.maintenance_message && !systemControls[0]?.is_open && (
                        <Alert
                          message="Maintenance Message"
                          description={systemControls[0].maintenance_message}
                          type="warning"
                          showIcon
                          icon={<WarningOutlined />}
                          style={{ borderRadius: 8 }}
                        />
                      )}
                    </div>

                    <Divider />

                    <div>
                      <Title level={5}>System Information</Title>
                      {systemControls[0] ? (
                        <Descriptions bordered size="small" column={1}>
                          <Descriptions.Item label="System Status">
                            {systemControls[0].is_open ? (
                              <Tag color="green" icon={<CheckCircleOutlined />}>Operational</Tag>
                            ) : (
                              <Tag color="red" icon={<CloseCircleOutlined />}>Under Maintenance</Tag>
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Last Updated">
                            {systemControls[0].updated_at ? dayjs(systemControls[0].updated_at).format('MMM D, YYYY HH:mm:ss') : 'N/A'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Created">
                            {systemControls[0].created_at ? dayjs(systemControls[0].created_at).format('MMM D, YYYY') : 'N/A'}
                          </Descriptions.Item>
                        </Descriptions>
                      ) : (
                        <Alert
                          message="No system control settings found"
                          description="Click 'Edit System Settings' to create system control configuration."
                          type="info"
                          style={{ borderRadius: 8 }}
                        />
                      )}
                    </div>
                  </div>
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
      
      {/* Create User Modal */}
      <Modal
        title={<span><UserAddOutlined /> Create Staff User</span>}
        open={createUserOpen}
        onOk={() => {
          createUserForm.validateFields().then(values => {
            createStaff(values);
          });
        }}
        onCancel={() => {
          setCreateUserOpen(false);
          createUserForm.resetFields();
        }}
        okText="Create"
        cancelText="Cancel"
        width={500}
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        <Form form={createUserForm} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input placeholder="Enter username" size="large" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password placeholder="Enter password" size="large" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Enter email" size="large" />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select role" size="large">
              {ROLE_OPTIONS.filter(r => r.value !== "student").map((r) => (
                <Option key={r.value} value={r.value}>
                  <Space>
                    {r.icon}
                    {r.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            noStyle 
            shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
          >
            {({ getFieldValue }) => 
              getFieldValue('role') === 'departmenthead' ? (
                <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                  <Select placeholder="Select department" size="large">
                    {departments.map((d) => (
                      <Option key={d.id} value={d.id}>{d.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
<Modal
  title={
    <Space>
      <EditOutlined style={{ color: '#1890ff' }} />
      <span style={{ fontSize: '18px', fontWeight: 600 }}>Edit User</span>
    </Space>
  }
  open={userModal.open}
  onOk={() => {
    userForm.validateFields()
      .then(values => {
        console.log("Updating user with values:", values);
        
        // For department head, check if department is already assigned to another head
        if (values.role === 'departmenthead' && values.department) {
          const existingDeptHead = users.find(u => 
            u.role === 'departmenthead' && 
            u.department === values.department &&
            u.id !== userModal.user.id
          );
          
          if (existingDeptHead) {
            message.error(`Department already has a department head: ${existingDeptHead.username}`);
            return;
          }
        }
        
        // For dormitory staff, check building assignments
        if (values.role === 'dormitory' && values.assigned_buildings?.length > 0) {
          // Check each building for existing manager
          const conflicts = [];
          values.assigned_buildings.forEach(buildingId => {
            const building = buildings.find(b => b.id === buildingId);
            const existingManager = dormitoryStaff.find(s => 
              s.id !== userModal.user.id && 
              s.assigned_buildings?.some(b => b.id === buildingId)
            );
            
            if (existingManager) {
              conflicts.push(`${building?.name} (managed by ${existingManager.full_name})`);
            }
          });
          
          if (conflicts.length > 0) {
            message.error(`Cannot assign: ${conflicts.join(', ')}`);
            return;
          }
        }
        
        updateUser(userModal.user.id, values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  }}
  onCancel={() => {
    setUserModal({ open: false, user: null });
    userForm.resetFields();
  }}
  okText="Update"
  cancelText="Cancel"
  width={600}
  okButtonProps={{ 
    icon: <CheckOutlined />,
    style: { background: '#1890ff', borderColor: '#1890ff' }
  }}
>
  <Form 
    form={userForm} 
    layout="vertical"
    initialValues={{
      username: userModal.user?.username,
      email: userModal.user?.email,
      role: userModal.user?.role,
      department: userModal.user?.department,
      is_blocked: userModal.user?.is_blocked,
      assigned_buildings: userModal.user?.assigned_buildings_info?.map(b => b.id) || []
    }}
  >
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item 
          name="username" 
          label={<span><UserOutlined style={{ marginRight: 5 }} /> Username</span>}
          rules={[{ required: true, message: "Please enter username" }]}
        >
          <Input placeholder="Enter username" size="large" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item 
          name="email" 
          label="Email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: 'email', message: "Please enter a valid email" }
          ]}
        >
          <Input placeholder="Enter email" size="large" prefix={<MailOutlined />} />
        </Form.Item>
      </Col>
    </Row>
    
    <Form.Item 
      name="role" 
      label="Role"
      rules={[{ required: true, message: "Please select role" }]}
    >
      <Select 
        placeholder="Select role" 
        size="large"
        style={{ borderRadius: '8px' }}
        onChange={(value) => {
          if (value !== 'departmenthead') {
            userForm.setFieldsValue({ department: undefined });
          }
          if (value !== 'dormitory') {
            userForm.setFieldsValue({ assigned_buildings: [] });
          }
        }}
      >
        {ROLE_OPTIONS.filter(r => r.value !== "student").map((r) => (
          <Option key={r.value} value={r.value}>
            <Space>
              {r.icon}
              <span style={{ fontWeight: 500 }}>{r.label}</span>
            </Space>
          </Option>
        ))}
      </Select>
    </Form.Item>
    
    {/* Department selection for Department Head */}
    <Form.Item 
      noStyle 
      shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
    >
      {({ getFieldValue }) => {
        const selectedRole = getFieldValue('role');
        
        if (selectedRole === 'departmenthead') {
          return (
            <Form.Item 
              name="department" 
              label={<span><ShopOutlined style={{ marginRight: 5 }} /> Department</span>}
            >
              <Select 
                placeholder="Select department" 
                size="large" 
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {departments.map((d) => {
                  // Check if this department already has a head (excluding current user)
                  const hasHead = users.some(u => 
                    u.role === 'departmenthead' && 
                    u.department === d.id && 
                    u.id !== userModal.user?.id
                  );
                  
                  return (
                    <Option 
                      key={d.id} 
                      value={d.id}
                      disabled={hasHead}
                    >
                      <Space>
                        {d.name}
                        {hasHead && <Tag color="red">Already has head</Tag>}
                      </Space>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          );
        }
        
        // Building selection for Dormitory Staff
        if (selectedRole === 'dormitory') {
          return (
            <Form.Item 
              name="assigned_buildings" 
              label={
                <Space>
                  <HomeOutlined style={{ color: '#722ed1' }} />
                  <span style={{ fontWeight: 500 }}>Assign Buildings</span>
                </Space>
              }
            >
              <Select
                mode="multiple"
                size="large"
                placeholder="Search and select buildings..."
                optionFilterProp="children"
                allowClear
                showSearch
                style={{ width: '100%', borderRadius: '8px' }}
                filterOption={(input, option) => 
                  option.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {buildings
                  .filter(b => b.is_active)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(building => {
                    // Check if this building already has a manager (excluding current user)
                    const hasManager = dormitoryStaff.some(s => 
                      s.id !== userModal.user?.id && 
                      s.assigned_buildings?.some(b => b.id === building.id)
                    );
                    
                    return (
                      <Option 
                        key={building.id} 
                        value={building.id}
                        disabled={hasManager}
                      >
                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                          <Space>
                            <HomeOutlined style={{ color: hasManager ? '#ff4d4f' : '#1890ff' }} />
                            <Text strong>{building.name}</Text>
                            <Tag color="purple">{building.code}</Tag>
                          </Space>
                          <div style={{ marginLeft: 24 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Capacity: {building.capacity || 'Unlimited'} | 
                              Current: {building.student_count || 0} students
                              {hasManager && ' | Already has manager'}
                            </Text>
                          </div>
                        </Space>
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          );
        }
        
        return null;
      }}
    </Form.Item>
    
    <Form.Item name="is_blocked" label="Account Status" valuePropName="checked">
      <Switch 
        checkedChildren="Blocked" 
        unCheckedChildren="Active" 
        size="large"
        style={{ transform: 'scale(1.1)' }}
      />
    </Form.Item>
  </Form>
</Modal>

{/* Create User Modal - Updated with Building Selection for Dormitory Staff */}
<Modal
  title={
    <Space>
      <UserAddOutlined style={{ color: '#1890ff' }} />
      <span style={{ fontSize: '18px', fontWeight: 600 }}>Create Staff User</span>
    </Space>
  }
  open={createUserOpen}
  onOk={() => {
    createUserForm.validateFields()
      .then(values => {
        console.log("Creating user with values:", values);
        createStaff(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  }}
  onCancel={() => {
    setCreateUserOpen(false);
    createUserForm.resetFields();
  }}
  okText="Create"
  cancelText="Cancel"
  width={600}
  okButtonProps={{ 
    icon: <CheckOutlined />,
    style: { background: '#1890ff', borderColor: '#1890ff' }
  }}
  cancelButtonProps={{ style: { borderColor: '#d9d9d9' } }}
>
  <Form 
    form={createUserForm} 
    layout="vertical"
    style={{ marginTop: '10px' }}
  >
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item 
          name="username" 
          label={<span><UserOutlined style={{ marginRight: 5 }} /> Username</span>}
          rules={[{ required: true, message: "Please enter username" }]}
        >
          <Input placeholder="Enter username" size="large" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item 
          name="password" 
          label="Password"
          rules={[{ required: true, message: "Please enter password" }]}
        >
          <Input.Password placeholder="Enter password" size="large" />
        </Form.Item>
      </Col>
    </Row>
    
    <Form.Item 
      name="email" 
      label="Email"
      rules={[
        { required: true, message: "Please enter email" },
        { type: 'email', message: "Please enter a valid email" }
      ]}
    >
      <Input placeholder="Enter email" size="large" prefix={<MailOutlined />} />
    </Form.Item>
    
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item name="first_name" label="First Name">
          <Input placeholder="Enter first name" size="large" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="last_name" label="Last Name">
          <Input placeholder="Enter last name" size="large" />
        </Form.Item>
      </Col>
    </Row>
    
    <Form.Item name="phone" label="Phone Number">
      <Input placeholder="Enter phone number" size="large" prefix={<PhoneOutlined />} />
    </Form.Item>
    
    <Form.Item 
      name="role" 
      label="Role"
      rules={[{ required: true, message: "Please select role" }]}
    >
      <Select 
        placeholder="Select role" 
        size="large"
        style={{ borderRadius: '8px' }}
        onChange={(value) => {
          if (value !== 'departmenthead') {
            createUserForm.setFieldsValue({ department: undefined });
          }
          if (value !== 'dormitory') {
            createUserForm.setFieldsValue({ assigned_buildings: [] });
          }
        }}
      >
        {ROLE_OPTIONS.filter(r => r.value !== "student").map((r) => (
          <Option key={r.value} value={r.value}>
            <Space>
              {r.icon}
              <span style={{ fontWeight: 500 }}>{r.label}</span>
            </Space>
          </Option>
        ))}
      </Select>
    </Form.Item>
    
    {/* Department selection for Department Head */}
    <Form.Item 
      noStyle 
      shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
    >
      {({ getFieldValue }) => {
        const selectedRole = getFieldValue('role');
        
        if (selectedRole === 'departmenthead') {
          return (
            <Form.Item 
              name="department" 
              label={<span><ShopOutlined style={{ marginRight: 5 }} /> Department</span>}
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select placeholder="Select department" size="large" showSearch>
                {departments.map((d) => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        
        // Building selection for Dormitory Staff
        if (selectedRole === 'dormitory') {
          return (
            <Form.Item 
              name="assigned_buildings" 
              label={
                <Space>
                  <HomeOutlined style={{ color: '#722ed1' }} />
                  <span style={{ fontWeight: 500 }}>Assign Buildings</span>
                </Space>
              }
            >
              <Select
                mode="multiple"
                size="large"
                placeholder="Search and select buildings..."
                optionFilterProp="children"
                allowClear
                showSearch
                style={{ width: '100%', borderRadius: '8px' }}
                filterOption={(input, option) => 
                  option.children?.toLowerCase().includes(input.toLowerCase())
                }
                loading={loading}
                notFoundContent={buildings.length === 0 ? "No buildings available" : null}
              >
                {buildings
                  .filter(b => b.is_active)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(building => (
                    <Option key={building.id} value={building.id}>
                      <div style={{ padding: '5px 0' }}>
                        <Space>
                          <HomeOutlined style={{ color: '#1890ff' }} />
                          <Text strong>{building.name}</Text>
                          <Tag color="purple">{building.code}</Tag>
                        </Space>
                      </div>
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          );
        }
        
        return null;
      }}
    </Form.Item>
  </Form>
</Modal>

{/* Building Modal - For Creating/Editing Buildings */}
<Modal
  title={
    <Space>
      <HomeOutlined style={{ color: '#722ed1', fontSize: '20px' }} />
      <span style={{ fontSize: '18px', fontWeight: 600 }}>
        {buildingModal.building ? 'Edit Building' : 'Add New Building'}
      </span>
    </Space>
  }
  open={buildingModal.open}
  onOk={() => {
    buildingForm.validateFields()
      .then(values => {
        saveBuilding(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  }}
  onCancel={() => {
    setBuildingModal({ open: false, building: null });
    buildingForm.resetFields();
  }}
  okText={buildingModal.building ? "Update" : "Create"}
  cancelText="Cancel"
  width={600}
  okButtonProps={{ 
    icon: <CheckOutlined />,
    style: { background: '#722ed1', borderColor: '#722ed1' }
  }}
  cancelButtonProps={{ style: { borderColor: '#d9d9d9' } }}
>
  <div style={{ 
    background: 'linear-gradient(135deg, #f9f0ff 0%, #ffffff 100%)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px'
  }}>
    <Alert
      message={
        <Space>
          <HomeOutlined />
          <span>Building Information</span>
        </Space>
      }
      description="Add or edit building details for dormitory management."
      type="info"
      showIcon
      icon={<HomeOutlined />}
      style={{ 
        borderRadius: '8px',
        background: 'rgba(114, 46, 209, 0.05)',
        border: '1px solid #d3adf7'
      }}
    />
  </div>
  
  <Form 
    form={buildingForm} 
    layout="vertical"
    initialValues={{
      is_active: true
    }}
  >
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item 
          name="name" 
          label={<span><HomeOutlined style={{ marginRight: 5 }} /> Building Name</span>}
          rules={[{ required: true, message: "Please enter building name" }]}
        >
          <Input 
            placeholder="e.g., Block A, Dormitory 1" 
            size="large"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item 
          name="code" 
          label={<span><TagOutlined style={{ marginRight: 5 }} /> Building Code</span>}
          rules={[{ required: true, message: "Please enter building code" }]}
        >
          <Input 
            placeholder="e.g., BLK-A, DORM-1" 
            size="large"
            style={{ borderRadius: '8px' }}
          />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item 
      name="address" 
      label={<span><HomeOutlined style={{ marginRight: 5 }} /> Address / Location</span>}
      rules={[{ required: true, message: "Please enter building address" }]}
    >
      <Input.TextArea 
        rows={2} 
        placeholder="Enter building address or location description"
        size="large"
        style={{ borderRadius: '8px' }}
      />
    </Form.Item>

    <Row gutter={16}>
      <Col span={12}>
        <Form.Item 
          name="capacity" 
          label={<span><TeamOutlined style={{ marginRight: 5 }} /> Capacity</span>}
        >
          <InputNumber
            style={{ width: '100%', borderRadius: '8px' }}
            placeholder="Enter capacity"
            min={0}
            size="large"
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item 
          name="is_active" 
          label="Status" 
          valuePropName="checked"
        >
          <Switch 
            checkedChildren="Active" 
            unCheckedChildren="Inactive" 
            size="large"
            style={{ 
              transform: 'scale(1.1)',
              background: '#722ed1'
            }}
          />
        </Form.Item>
      </Col>
    </Row>
  </Form>

  <div style={{ 
    marginTop: '20px',
    padding: '15px',
    background: '#f5f5f5',
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    <Text type="secondary" style={{ fontSize: '12px' }}>
      <InfoCircleOutlined /> Building will be available for dormitory staff assignment
    </Text>
  </div>
</Modal>

{/* Building Assignment Modal - Fixed Version */}
<Modal
  title={<span><HomeOutlined /> Assign Buildings to Dormitory Staff</span>}
  open={buildingAssignmentModal.open}
  onOk={() => {
    assignmentForm.validateFields().then(values => {
      // Show loading
      setLoading(true);
      // Call the API
      assignBuildingsToStaff(buildingAssignmentModal.staff.id, values)
        .finally(() => setLoading(false));
    });
  }}
  onCancel={() => {
    setBuildingAssignmentModal({ open: false, staff: null });
    assignmentForm.resetFields();
  }}
  okText="Assign Buildings"
  cancelText="Cancel"
  width={700}
  okButtonProps={{ 
    icon: <CheckOutlined />,
    loading: loading
  }}
>
  {buildingAssignmentModal.staff && (
    <>
      <Alert
        message={
          <Space>
            <UserOutlined />
            <Text strong>Assigning buildings to: {buildingAssignmentModal.staff.full_name || buildingAssignmentModal.staff.username}</Text>
          </Space>
        }
        description={
          <div style={{ marginTop: 10 }}>
            <p>Select the buildings this dormitory staff member will manage.</p>
            <p><Text type="secondary">Students in these buildings will be able to chat with this staff member.</Text></p>
          </div>
        }
        type="info"
        showIcon
        icon={<HomeOutlined />}
        style={{ marginBottom: 20 }}
      />
      
      <Form form={assignmentForm} layout="vertical">
        <Form.Item 
          name="building_ids" 
          label={<Text strong>Select Buildings to Assign</Text>}
          rules={[{ required: false }]}
          help="Leave empty to unassign all buildings"
        >
          <Select
            mode="multiple"
            size="large"
            placeholder="Search and select buildings..."
            optionFilterProp="children"
            allowClear
            showSearch
            style={{ width: '100%' }}
            filterOption={(input, option) => 
              option.children?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {buildings
              .filter(b => b.is_active)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(building => {
                const isAssigned = buildingAssignmentModal.staff.assigned_buildings?.some(
                  b => b.id === building.id
                );
                
                return (
                  <Option key={building.id} value={building.id}>
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Space>
                        <HomeOutlined style={{ color: isAssigned ? '#52c41a' : '#1890ff' }} />
                        <Text strong>{building.name}</Text>
                        <Tag color="purple">{building.code}</Tag>
                      </Space>
                      <div style={{ marginLeft: 24 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Capacity: {building.capacity || 'Unlimited'} | 
                          Current: {building.student_count || 0} students |
                          Staff: {building.staff_count || 0}
                        </Text>
                      </div>
                    </Space>
                  </Option>
                );
              })}
          </Select>
        </Form.Item>
        
        {/* Show current assignments */}
        {buildingAssignmentModal.staff.assigned_buildings?.length > 0 && (
          <div style={{ marginTop: 20, padding: 15, background: '#f6ffed', borderRadius: 8 }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong>Currently Assigned Buildings:</Text>
            </Space>
            <div style={{ marginTop: 10 }}>
              {buildingAssignmentModal.staff.assigned_buildings.map(b => (
                <Tag 
                  key={b.id} 
                  color="success" 
                  style={{ margin: '5px', padding: '5px 10px' }}
                >
                  <HomeOutlined /> {b.name} ({b.code})
                </Tag>
              ))}
            </div>
          </div>
        )}
        
        {/* Summary */}
        <div style={{ marginTop: 20, padding: 15, background: '#f5f5f5', borderRadius: 8 }}>
          <Text strong>Assignment Summary:</Text>
          <div style={{ marginTop: 10 }}>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const selectedIds = getFieldValue('building_ids') || [];
                const selectedBuildings = buildings.filter(b => selectedIds.includes(b.id));
                
                return (
                  <>
                    <p>
                      <Text>Selected: </Text>
                      <Tag color="blue">{selectedIds.length} buildings</Tag>
                    </p>
                    {selectedBuildings.length > 0 && (
                      <div>
                        <Text type="secondary">Selected buildings:</Text>
                        <div style={{ marginTop: 5 }}>
                          {selectedBuildings.map(b => (
                            <Tag key={b.id} color="processing" style={{ margin: '2px' }}>
                              {b.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              }}
            </Form.Item>
          </div>
        </div>
      </Form>
    </>
  )}
</Modal>

      {/* Department Modal */}
      <Modal
        title={deptEdit ? <span><EditOutlined /> Edit Department</span> : <span><ShopOutlined /> Create Department</span>}
        open={deptOpen}
        onOk={() => {
          deptForm.validateFields().then(values => {
            saveDepartment(values);
          });
        }}
        onCancel={() => {
          setDeptOpen(false);
          setDeptEdit(null);
          deptForm.resetFields();
        }}
        okText={deptEdit ? "Update" : "Create"}
        cancelText="Cancel"
        width={500}
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        <Form form={deptForm} layout="vertical">
          <Form.Item name="name" label="Department Name" rules={[{ required: true }]}>
            <Input placeholder="Enter department name" size="large" />
          </Form.Item>
          <Form.Item name="college" label="College">
            <Select allowClear placeholder="Select college (optional)" size="large">
              {colleges.map((c) => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* College Modal */}
      <Modal
        title={collegeEdit ? <span><EditOutlined /> Edit College</span> : <span><BankOutlined /> Create College</span>}
        open={collegeOpen}
        onOk={() => {
          collegeForm.validateFields().then(values => {
            saveCollege(values);
          });
        }}
        onCancel={() => {
          setCollegeOpen(false);
          setCollegeEdit(null);
          collegeForm.resetFields();
        }}
        okText={collegeEdit ? "Update" : "Create"}
        cancelText="Cancel"
        width={500}
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        <Form form={collegeForm} layout="vertical">
          <Form.Item name="name" label="College Name" rules={[{ required: true }]}>
            <Input placeholder="Enter college name" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Method Modal */}
      <Modal
        title={paymentMethodModal.method ? 
          <span><EditOutlined /> Edit Payment Method</span> : 
          <span><MoneyCollectOutlined /> Add Payment Method</span>
        }
        open={paymentMethodModal.open}
        onOk={() => {
          paymentMethodForm.validateFields().then(values => {
            savePaymentMethod(values);
          });
        }}
        onCancel={() => {
          setPaymentMethodModal({ open: false, method: null });
          paymentMethodForm.resetFields();
        }}
        okText={paymentMethodModal.method ? "Update" : "Create"}
        cancelText="Cancel"
        width={600}
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        <Form form={paymentMethodForm} layout="vertical">
          <Form.Item 
            name="name" 
            label="Payment Method Name" 
            rules={[{ required: true, message: "Please enter payment method name" }]}
          >
            <Input 
              placeholder="e.g., Telebirr, CBE Bank, Awash Bank" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item 
            name="bank_name" 
            label="Bank Name (Optional)"
          >
            <Input 
              placeholder="e.g., Commercial Bank of Ethiopia" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item 
            name="account_name" 
            label="Account Name" 
            rules={[{ required: true, message: "Please enter account name" }]}
          >
            <Input 
              placeholder="e.g., Mekdela Amba University" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item 
            name="account_number" 
            label="Account Number"
            rules={[{ required: true, message: "Please enter account number" }]}
          >
            <Input 
              placeholder="e.g., 1000225566778" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item 
            name="phone_number" 
            label="Phone Number (Optional)"
          >
            <Input 
              placeholder="e.g., 0918114545" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item 
            name="instructions" 
            label="Payment Instructions" 
            rules={[{ required: true, message: "Please enter payment instructions" }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Enter detailed payment instructions for students..."
              size="large"
            />
          </Form.Item>
          
          <Form.Item 
            name="is_active" 
            label="Status" 
            valuePropName="checked" 
            initialValue={true}
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Inactive" 
              size="large"
              style={{ transform: 'scale(1.1)' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Payment Details Modal */}
      <Modal
        title={<span><EyeOutlined /> Payment Details</span>}
        open={viewPaymentModal.open}
        onCancel={() => setViewPaymentModal({ open: false, payment: null })}
        footer={[
          <Button key="close" onClick={() => setViewPaymentModal({ open: false, payment: null })}>
            Close
          </Button>
        ]}
        width={700}
      >
        {viewPaymentModal.payment && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Transaction ID" span={2}>
              <Tag color="blue">{viewPaymentModal.payment.transaction_id}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Student Name">
              <Text strong>{viewPaymentModal.payment.student?.username || 'Unknown'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Student Email">
              {viewPaymentModal.payment.student?.email || 'No email'}
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              {renderDepartmentType(viewPaymentModal.payment.department_type)}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              {renderPaymentMethod(viewPaymentModal.payment.payment_method?.name)}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <Text strong style={{ color: '#52c41a', fontSize: '18px' }}>
                {viewPaymentModal.payment.amount || 0} ETB
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>
              {renderPaymentStatus(viewPaymentModal.payment.status)}
            </Descriptions.Item>
            {viewPaymentModal.payment.phone_number && (
              <Descriptions.Item label="Phone Number">
                {viewPaymentModal.payment.phone_number}
              </Descriptions.Item>
            )}
            {viewPaymentModal.payment.account_last_digits && (
              <Descriptions.Item label="Account Last Digits">
                ****{viewPaymentModal.payment.account_last_digits}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Payment Date">
              {viewPaymentModal.payment.payment_date ? dayjs(viewPaymentModal.payment.payment_date).format('MMM D, YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Submitted">
              {viewPaymentModal.payment.created_at ? dayjs(viewPaymentModal.payment.created_at).format('MMM D, YYYY HH:mm') : 'N/A'}
            </Descriptions.Item>
            {viewPaymentModal.payment.verified_at && (
              <Descriptions.Item label="Verified At">
                {dayjs(viewPaymentModal.payment.verified_at).format('MMM D, YYYY HH:mm')}
              </Descriptions.Item>
            )}
            {viewPaymentModal.payment.verified_by && (
              <Descriptions.Item label="Verified By">
                {viewPaymentModal.payment.verified_by?.username || 'System'}
              </Descriptions.Item>
            )}
            {viewPaymentModal.payment.rejection_reason && (
              <Descriptions.Item label="Rejection Reason" span={2}>
                <Alert
                  message={viewPaymentModal.payment.rejection_reason}
                  type="error"
                  showIcon
                />
              </Descriptions.Item>
            )}
            {viewPaymentModal.payment.receipt_file && (
              <Descriptions.Item label="Receipt" span={2}>
                <Image
                  width={200}
                  src={viewPaymentModal.payment.receipt_file}
                  alt="Payment Receipt"
                  style={{ borderRadius: 8 }}
                />
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Payment Logs Modal */}
      <Modal
        title={<span><HistoryOutlined /> Payment Verification Logs</span>}
        open={paymentLogsModal.open}
        onCancel={() => setPaymentLogsModal({ open: false, payment: null, logs: [] })}
        footer={[
          <Button key="close" onClick={() => setPaymentLogsModal({ open: false, payment: null, logs: [] })}>
            Close
          </Button>
        ]}
        width={800}
      >
        {paymentLogsModal.payment && (
          <>
            <div style={{ marginBottom: 24 }}>
              <Text strong>Transaction: </Text>
              <Tag color="blue">{paymentLogsModal.payment.transaction_id}</Tag>
              <Text strong style={{ marginLeft: 16 }}>Amount: </Text>
              <Text strong style={{ color: '#52c41a' }}>
                {paymentLogsModal.payment.amount || 0} ETB
              </Text>
            </div>
            
            <List
              dataSource={paymentLogsModal.logs || []}
              renderItem={(log) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={log.action === 'verify' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} 
                              style={{ backgroundColor: log.action === 'verify' ? '#52c41a' : '#ff4d4f' }} />
                    }
                    title={
                      <Space>
                        <Text strong>{log.verified_by?.username || 'System'}</Text>
                        <Tag color={log.action === 'verify' ? 'success' : 'error'}>
                          {log.action?.toUpperCase?.() || 'UNKNOWN'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <>
                        <Text>{log.note}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {log.created_at ? dayjs(log.created_at).format('MMM D, YYYY HH:mm:ss') : 'N/A'}
                        </Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        title={<span><UploadOutlined /> Upload Student CSV</span>}
        open={csvUploadModal}
        onOk={() => {
          if (csvFile) {
            uploadCSVFile(csvFile);
          } else {
            message.error("Please select a CSV file first");
          }
        }}
        onCancel={() => {
          setCSVUploadModal(false);
          setCSVFile(null);
        }}
        okText="Upload"
        cancelText="Cancel"
        confirmLoading={csvUploading}
        width={600}
      >
        <div style={{ padding: '20px 0' }}>
          <Alert
            message="CSV Upload Requirements"
            description={
              <div>
                <p>Your CSV file must have these columns in order:</p>
                <ul>
                  <li><strong>first_name</strong> - Student's first name</li>
                  <li><strong>last_name</strong> - Student's last name</li>
                  <li><strong>email</strong> - Student's email address (must be unique)</li>
                  <li><strong>id_number</strong> - Student's ID number (must be unique)</li>
                  <li><strong>college</strong> - College name (must exist in system)</li>
                  <li><strong>department</strong> - Department name (must exist in system and belong to college)</li>
                </ul>
                <p>Download the template to see the correct format.</p>
              </div>
            }
            type="info"
            style={{ marginBottom: 20 }}
          />
          
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #d9d9d9', borderRadius: 8 }}>
            {csvFile ? (
              <div>
                <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                <div>
                  <Text strong>{csvFile.name}</Text>
                  <br />
                  <Text type="secondary">
                    {(csvFile.size / 1024).toFixed(2)} KB
                  </Text>
                </div>
                <Button 
                  type="link" 
                  onClick={() => setCSVFile(null)}
                  style={{ marginTop: 16 }}
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <Upload.Dragger
                accept=".csv"
                showUploadList={false}
                beforeUpload={(file) => {
                  setCSVFile(file);
                  return false; // Prevent automatic upload
                }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">Click or drag CSV file to upload</p>
                <p className="ant-upload-hint">Only .csv files are supported</p>
              </Upload.Dragger>
            )}
          </div>
          
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Button 
              type="link" 
              icon={<DownloadOutlined />}
              onClick={downloadCSVTemplate}
            >
              Download CSV Template
            </Button>
          </div>
        </div>
      </Modal>

      {/* System Control Modal */}
      <Modal
        title={<span><SettingOutlined /> System Control Settings</span>}
        open={systemControlOpen}
        onOk={() => {
          systemControlForm.validateFields().then(values => {
            saveSystemControl(values);
          });
        }}
        onCancel={() => {
          setSystemControlOpen(false);
          systemControlForm.resetFields();
        }}
        okText="Save"
        cancelText="Cancel"
        width={500}
        okButtonProps={{ icon: <CheckOutlined /> }}
      >
        <Form form={systemControlForm} layout="vertical">
          <Form.Item name="is_open" label="System Status" valuePropName="checked">
            <Switch 
              checkedChildren="Open" 
              unCheckedChildren="Closed" 
              size="large"
              style={{ transform: 'scale(1.1)' }}
            />
          </Form.Item>
          <Form.Item 
            noStyle 
            shouldUpdate={(prevValues, currentValues) => prevValues.is_open !== currentValues.is_open}
          >
            {({ getFieldValue }) => 
              !getFieldValue('is_open') ? (
                <Form.Item name="maintenance_message" label="Maintenance Message">
                  <TextArea rows={3} placeholder="Enter maintenance message" size="large" />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* Efficiency Modal */}
      <Modal
        title={<span><LineChartOutlined /> System Efficiency Details</span>}
        open={efficiencyModal}
        onCancel={() => setEfficiencyModal(false)}
        footer={[
          <Button key="close" onClick={() => setEfficiencyModal(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Overall Efficiency" span={2}>
            <Progress 
              percent={stats.efficiency || calculateSystemEfficiency()} 
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              size="small"
            />
          </Descriptions.Item>
          <Descriptions.Item label="Avg. Processing Time">
            {stats.avg_processing_time || "0"} days
          </Descriptions.Item>
          <Descriptions.Item label="Weekly Trend">
            <Tag color={stats.weekly_trend?.startsWith?.('+') ? "green" : "red"}>
              {stats.weekly_trend || "+0%"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Forms Today">
            {stats.today_forms || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Total Forms Processed">
            {stats.total_forms || forms.length}
          </Descriptions.Item>
          <Descriptions.Item label="Approval Rate">
            {Math.round((stats.approved_forms / (stats.total_forms || forms.length)) * 100) || 0}%
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* View Form Modal */}
      <Modal
        title={<span><FileTextOutlined /> Form Details</span>}
        open={viewFormModal.open}
        onCancel={() => setViewFormModal({ open: false, form: null })}
        footer={[
          <Button key="close" onClick={() => setViewFormModal({ open: false, form: null })}>
            Close
          </Button>
        ]}
        width={700}
      >
        {viewFormModal.form && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Form ID" span={2}>
              <Tag color="blue">#{viewFormModal.form.id}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Student Name">
              <Text strong>{viewFormModal.form.student_name || 'Unknown'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Student Email">
              {viewFormModal.form.student_email || 'No email'}
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              {viewFormModal.form.department || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>
              {renderStatus(viewFormModal.form.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Created" span={2}>
              {viewFormModal.form.created_at ? dayjs(viewFormModal.form.created_at).format('MMMM D, YYYY HH:mm:ss') : 'N/A'}
            </Descriptions.Item>
            {viewFormModal.form.reason && (
              <Descriptions.Item label="Clearance Reason" span={2}>
                <Text type="secondary">{viewFormModal.form.reason}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* View User Modal */}
{/* View User Modal - Extract student ID from username */}
<Modal
  title={<span><TeamOutlined /> User Details</span>}
  open={viewUserModal.open}
  onCancel={() => setViewUserModal({ open: false, user: null })}
  footer={[
    <Button key="close" onClick={() => setViewUserModal({ open: false, user: null })}>
      Close
    </Button>
  ]}
  width={600}
>
  {viewUserModal.user && (
    <Descriptions bordered column={2}>
      <Descriptions.Item label="User ID" span={2}>
        {viewUserModal.user.role === 'student' ? (
          <Space>
            <Tag color="blue">System ID: #{viewUserModal.user.id}</Tag>
          </Space>
        ) : (
          <Tag color="blue">System ID: #{viewUserModal.user.id}</Tag>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Username">
        <Text strong>{viewUserModal.user.username}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Email">
        {viewUserModal.user.email}
      </Descriptions.Item>
      <Descriptions.Item label="Full Name" span={2}>
        {viewUserModal.user.full_name || 
         `${viewUserModal.user.first_name || ''} ${viewUserModal.user.last_name || ''}`.trim() || 
         viewUserModal.user.username || '-'}
      </Descriptions.Item>
      <Descriptions.Item label="Role">
        {renderRoleTag(viewUserModal.user.role)}
      </Descriptions.Item>
      <Descriptions.Item label="Department">
        {viewUserModal.user.department_name || 
         (viewUserModal.user.department ? 
           (typeof viewUserModal.user.department === 'object' ? viewUserModal.user.department.name : viewUserModal.user.department) 
           : '-')}
      </Descriptions.Item>
      
      {/* Student-specific fields - Extract ID from username */}
      {viewUserModal.user.role === 'student' && (
        <>
          <Descriptions.Item label="Student ID" span={2}>
            {(() => {
              // Try to extract student ID from username pattern
              const username = viewUserModal.user.username || '';
              // Look for pattern like name_name_ID or just the last part after last underscore
              const parts = username.split('_');
              let extractedId = null;
              
              if (parts.length >= 3) {
                // Take the last part as potential ID
                extractedId = parts[parts.length - 1];
              } else if (parts.length === 2) {
                extractedId = parts[1];
              }
              
              // Check if it looks like an ID (contains numbers)
              if (extractedId && /\d/.test(extractedId)) {
                return (
                  <Space direction="vertical">
                    <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>
                      {extractedId}
                    </Tag>
                  </Space>
                );
              }
              
              // If we have id_number field, use that
              if (viewUserModal.user.id_number) {
                return (
                  <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>
                    {viewUserModal.user.id_number}
                  </Tag>
                );
              }
              
              // No ID found
              return (
                <Space direction="vertical">
                  <Tag color="orange">Not set</Tag>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Username: {username}
                  </Text>
                </Space>
              );
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="College" span={2}>
            {viewUserModal.user.college || '-'}
          </Descriptions.Item>
        </>
      )}
      
      <Descriptions.Item label="Status" span={2}>
        {renderUserStatus(viewUserModal.user)}
      </Descriptions.Item>
      <Descriptions.Item label="Last Login" span={2}>
        {viewUserModal.user.last_login ? dayjs(viewUserModal.user.last_login).format('MMMM D, YYYY HH:mm') : "Never logged in"}
      </Descriptions.Item>
      <Descriptions.Item label="Date Joined" span={2}>
        {viewUserModal.user.date_joined ? dayjs(viewUserModal.user.date_joined).format('MMMM D, YYYY') : '-'}
      </Descriptions.Item>
    </Descriptions>
  )}
</Modal>
    </div>
  );
}


