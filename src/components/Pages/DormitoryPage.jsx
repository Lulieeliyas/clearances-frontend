import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
Menu,
  Button,
  Typography,
  Input,
  Modal,
  Spin,
  Space,
  Row,
  Col,
  Statistic,
  Tag,
  message,
  Alert,
  Descriptions,
  Table,
  Badge,
  Steps,
  Tooltip,
  Popconfirm,
  notification,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Tabs,
  Radio,
  Checkbox,
  Upload,
  Image,
  Avatar,
  List,
  Timeline,
  Progress,
  Divider,
  Dropdown,
  Result
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  MessageOutlined,
  EyeOutlined,
  ReloadOutlined,
  HomeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  DollarOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DatabaseOutlined,
  BuildOutlined,
  ToolOutlined,
  SafetyOutlined,
  KeyOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  DollarCircleOutlined,
  CheckSquareOutlined,
  FileImageOutlined,
  SendOutlined,
  UserAddOutlined,
  DownloadOutlined,
  BarChartOutlined,
  TeamOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
  VideoCameraOutlined,
  SolutionOutlined,
  ShareAltOutlined,
  SecurityScanOutlined,
  HeartOutlined,
  TrophyOutlined,
  CoffeeOutlined,
  PaperClipOutlined,
  SoundOutlined,
  DeleteOutlined as DeleteIcon,
  RocketOutlined,
  FilterOutlined as FilterIcon,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;
const API_BASE = "http://127.0.0.1:8000/api/";

export default function DormitoryPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

  // ================= STATE VARIABLES =================
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [rejectAction, setRejectAction] = useState('reject_only');
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReason, setPaymentReason] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [assignedBuildings, setAssignedBuildings] = useState([]);
  
  // ================= MULTI-APPROVAL BATCH PROCESSING =================
  const [selectedForms, setSelectedForms] = useState([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchModal, setBatchModal] = useState(false);
  const [batchAction, setBatchAction] = useState('approve');
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, status: 'idle' });
  const [batchResults, setBatchResults] = useState({ success: [], failed: [] });
  const [batchNotes, setBatchNotes] = useState("");
  const [batchPaymentRequired, setBatchPaymentRequired] = useState(false);
  const [batchPaymentAmount, setBatchPaymentAmount] = useState("");
  const [batchPaymentReason, setBatchPaymentReason] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    department: '',
    hasDues: false,
    dateRange: null
  });
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    payment_required: 0,
    today_forms: 0,
    withDues: 0
  });
  
  // ================= DORMITORY DUES =================
  const [dormDuesModal, setDormDuesModal] = useState(false);
  const [dormDues, setDormDues] = useState({
    has_dorm_dues: false,
    dues: [],
    total_amount: 0,
    can_approve: true,
    student_info: null,
    form_id: null
  });
  const [checkingDues, setCheckingDues] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  
  // ================= DUES REGISTRATION =================
  const [dueStudents, setDueStudents] = useState([]);
  const [dueSearchId, setDueSearchId] = useState("");
  const [dueSearchName, setDueSearchName] = useState("");
  const [loadingDues, setLoadingDues] = useState(false);
  const [registerDueModal, setRegisterDueModal] = useState(false);
  const [editingDue, setEditingDue] = useState(null);
  
  // ================= PAYMENT VERIFICATION =================
  const [pendingPayments, setPendingPayments] = useState([]);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [paymentVerificationModal, setPaymentVerificationModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // ================= DAMAGE CHECKLIST =================
  const [damageChecklist, setDamageChecklist] = useState([
    { id: 1, name: "Door Damage", key: "door", icon: <SafetyOutlined />, price: 5000, selected: false },
    { id: 2, name: "Window Damage", key: "window", icon: <EnvironmentOutlined />, price: 3000, selected: false },
    { id: 3, name: "Bed Damage", key: "bed", icon: <HomeOutlined />, price: 8000, selected: false },
    { id: 4, name: "Wall Damage", key: "wall", icon: <BuildOutlined />, price: 4000, selected: false },
    { id: 5, name: "Floor Damage", key: "floor", icon: <BuildOutlined />, price: 6000, selected: false },
    { id: 6, name: "Electrical Issues", key: "electrical", icon: <ToolOutlined />, price: 2500, selected: false },
    { id: 7, name: "Missing Key", key: "key", icon: <KeyOutlined />, price: 1500, selected: false },
    { id: 8, name: "Safety Equipment", key: "safety", icon: <SafetyOutlined />, price: 10000, selected: false },
    { id: 9, name: "Furniture Damage", key: "furniture", icon: <ApartmentOutlined />, price: 7000, selected: false },
    { id: 10, name: "Plumbing Issues", key: "plumbing", icon: <ToolOutlined />, price: 4500, selected: false }
  ]);
  
  // ================= CHAT SYSTEM =================
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedStudentForChat, setSelectedStudentForChat] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ================= REPORTS =================
  const [reportsData, setReportsData] = useState({
    monthlyStats: [],
    topDamages: [],
    revenueStats: { total: 0, pending: 0, collected: 0 }
  });

  // ================= AUTHENTICATION =================
  useEffect(() => {
    const stored = sessionStorage.getItem("ucs_current");
    if (!stored) {
      message.error("Please login first");
      navigate("/login");
      return;
    }
    
    const parsed = JSON.parse(stored);
    if (parsed.role !== "dormitory") {
      message.error("Access denied. Dormitory only.");
      navigate("/login");
      return;
    }
    
    setUser(parsed);
    setToken(parsed.token);
    
    // Load data
    loadForms(parsed.token);
    loadDueStudents();
    loadPendingPayments(parsed.token);
    loadReportsData();
  }, [navigate]);

// ================= LOAD FORMS =================
const loadForms = async (authToken) => {
  try {
    setLoading(true);
    console.log("Loading forms for dormitory...");
    
    const res = await axios.get(`${API_BASE}dormitory/forms/`, {
      headers: { 
        Authorization: `Token ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("API Response:", res.data);
    
    // Store assigned buildings from response
    if (res.data.assigned_buildings) {
      setAssignedBuildings(res.data.assigned_buildings);
      console.log("Assigned buildings:", res.data.assigned_buildings);
    }
    
    let formsData = [];
    
    if (res.data.forms && Array.isArray(res.data.forms)) {
      // This matches your backend response
      formsData = res.data.forms;
      console.log("Found forms in res.data.forms:", formsData.length);
    } 
    else if (Array.isArray(res.data)) {
      // Response is array
      formsData = res.data;
      console.log("Response is array:", formsData.length);
    }
    else if (res.data.data && Array.isArray(res.data.data)) {
      // Response has data property
      formsData = res.data.data;
      console.log("Found forms in res.data.data:", formsData.length);
    }
    else {
      console.log("No forms found in response");
      formsData = [];
    }
    
    console.log("Forms data to display:", formsData);
    setForms(formsData);
    calculateStats(formsData);
    
    // Show message if no forms
    if (formsData.length === 0) {
      message.info("No pending clearance forms for your buildings");
    } else {
      message.success(`Found ${formsData.length} form(s) for your buildings`);
    }
    
  } catch (err) {
    console.error("Load forms error:", err);
    if (err.response?.status === 401 || err.response?.status === 403) {
      message.error("Session expired. Please login again.");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      message.error("Failed to load forms. Please try again.");
    }
    setForms([]);
    calculateStats([]);
  } finally {
    setLoading(false);
  }
};
  // ================= LOAD PENDING PAYMENTS =================
  const loadPendingPayments = async (authToken) => {
    try {
      const res = await axios.get(`${API_BASE}payment/pending/`, {
        headers: { 
          Authorization: `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.data && Array.isArray(res.data)) {
        const dormitoryPayments = res.data.filter(payment => 
          payment.department_type === 'dormitory'
        );
        setPendingPayments(dormitoryPayments);
        setPendingPaymentsCount(dormitoryPayments.length);
      }
    } catch (err) {
      console.error("Error loading pending payments:", err);
      setPendingPayments([]);
      setPendingPaymentsCount(0);
    }
  };

  // ================= LOAD DUE STUDENTS =================
  const loadDueStudents = async () => {
    try {
      setLoadingDues(true);
      const savedDues = localStorage.getItem("dormitory_due_students");
      if (savedDues) {
        setDueStudents(JSON.parse(savedDues));
      } else {
        // Initialize with sample data
        const sampleDues = [
          {
            id: 1,
            student_id: "STU2024001",
            student_name: "John Doe",
            room_number: "D-101",
            description: "Broken window and door damage",
            items: ["window", "door"],
            amount: 8000.00,
            due_date: "2024-03-15",
            status: "overdue",
            registered_date: "2024-03-20",
            payment_status: "unpaid"
          },
          {
            id: 2,
            student_id: "STU2024002",
            student_name: "Jane Smith",
            room_number: "D-205",
            description: "Bed damage and missing key",
            items: ["bed", "key"],
            amount: 9500.00,
            due_date: "2024-03-20",
            status: "due_soon",
            registered_date: "2024-03-25",
            payment_status: "pending"
          },
          {
            id: 3,
            student_id: "STU2024003",
            student_name: "Robert Johnson",
            room_number: "A-302",
            description: "Wall and floor damage",
            items: ["wall", "floor"],
            amount: 10000.00,
            due_date: "2024-03-30",
            status: "due_soon",
            registered_date: "2024-03-28",
            payment_status: "paid"
          }
        ];
        setDueStudents(sampleDues);
        localStorage.setItem("dormitory_due_students", JSON.stringify(sampleDues));
      }
    } catch (err) {
      console.error("Error loading due students:", err);
      message.error("Failed to load due students list.");
      setDueStudents([]);
    } finally {
      setLoadingDues(false);
    }
  };

  // ================= LOAD REPORTS DATA =================
  const loadReportsData = async () => {
    // Mock data for demonstration
    const mockReports = {
      monthlyStats: [
        { month: 'Jan', forms: 45, payments: 38000 },
        { month: 'Feb', forms: 52, payments: 42000 },
        { month: 'Mar', forms: 48, payments: 39000 },
        { month: 'Apr', forms: 60, payments: 52000 },
        { month: 'May', forms: 55, payments: 48000 },
        { month: 'Jun', forms: 58, payments: 51000 }
      ],
      topDamages: [
        { name: 'Bed Damage', count: 23, amount: 184000 },
        { name: 'Door Damage', count: 18, amount: 90000 },
        { name: 'Window Damage', count: 15, amount: 45000 },
        { name: 'Electrical Issues', count: 12, amount: 30000 },
        { name: 'Missing Key', count: 10, amount: 15000 }
      ],
      revenueStats: { 
        total: 354000, 
        pending: 17500, 
        collected: 336500 
      }
    };
    setReportsData(mockReports);
  };

  // ================= CALCULATE STATS =================
  const calculateStats = (formsList) => {
    const today = dayjs().format('YYYY-MM-DD');
    const todayForms = formsList.filter(f => 
      dayjs(f.created_at).format('YYYY-MM-DD') === today
    ).length;
    
    const stats = {
      total: formsList.length,
      pending: formsList.filter(f => f.status === "approved_studentaffairs").length,
      approved: formsList.filter(f => f.status === "approved_dormitory").length,
      rejected: formsList.filter(f => f.status === "rejected" && f.dormitory_note).length,
      payment_required: formsList.filter(f => f.status === "requires_dormitory_payment").length,
      today_forms: todayForms,
      withDues: formsList.filter(f => checkIfStudentHasDue(f.id_number)).length
    };
    setStats(stats);
  };

  // ================= SAVE DUE STUDENTS =================
  const saveDueStudents = (dues) => {
    localStorage.setItem("dormitory_due_students", JSON.stringify(dues));
    setDueStudents(dues);
  };

  // ================= REGISTER NEW DUE =================
  const registerNewDue = async (values) => {
    try {
      const selectedItems = damageChecklist.filter(item => item.selected).map(item => item.key);
      const itemsTotal = selectedItems.reduce((total, itemKey) => {
        const item = damageChecklist.find(d => d.key === itemKey);
        return total + (item?.price || 0);
      }, 0);

      const newDue = {
        id: Date.now(),
        student_id: values.student_id,
        student_name: values.student_name,
        room_number: values.room_number || "N/A",
        description: values.description || "Dormitory damages",
        items: selectedItems,
        amount: values.amount || itemsTotal,
        due_date: values.due_date.format('YYYY-MM-DD'),
        status: dayjs(values.due_date).isBefore(dayjs()) ? 'overdue' : 'due_soon',
        registered_date: dayjs().format('YYYY-MM-DD'),
        registered_by: user?.username || 'dormitory',
        payment_status: 'unpaid'
      };

      const updatedDues = [...dueStudents, newDue];
      saveDueStudents(updatedDues);
      
      message.success("Dormitory due registered successfully!");
      setRegisterDueModal(false);
      form.resetFields();
      resetChecklist();
      
    } catch (err) {
      console.error("Error registering due:", err);
      message.error("Failed to register due.");
    }
  };

  // ================= UPDATE DUE =================
  const updateDue = async (values) => {
    try {
      const selectedItems = damageChecklist.filter(item => item.selected).map(item => item.key);
      const itemsTotal = selectedItems.reduce((total, itemKey) => {
        const item = damageChecklist.find(d => d.key === itemKey);
        return total + (item?.price || 0);
      }, 0);

      const updatedDue = {
        ...editingDue,
        student_id: values.student_id,
        student_name: values.student_name,
        room_number: values.room_number || "N/A",
        description: values.description || "Dormitory damages",
        items: selectedItems,
        amount: values.amount || itemsTotal,
        due_date: values.due_date.format('YYYY-MM-DD'),
        status: dayjs(values.due_date).isBefore(dayjs()) ? 'overdue' : 'due_soon'
      };

      const updatedDues = dueStudents.map(due => 
        due.id === editingDue.id ? updatedDue : due
      );
      saveDueStudents(updatedDues);
      
      message.success("Due updated successfully!");
      setRegisterDueModal(false);
      setEditingDue(null);
      form.resetFields();
      resetChecklist();
      
    } catch (err) {
      console.error("Error updating due:", err);
      message.error("Failed to update due.");
    }
  };

  // ================= DELETE DUE =================
  const deleteDue = (id) => {
    Modal.confirm({
      title: 'Delete Due Record',
      content: 'Are you sure you want to delete this due record?',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        const updatedDues = dueStudents.filter(due => due.id !== id);
        saveDueStudents(updatedDues);
        message.success("Due record deleted successfully!");
      }
    });
  };

  // ================= RESET CHECKLIST =================
  const resetChecklist = () => {
    setDamageChecklist(prev => prev.map(item => ({ ...item, selected: false })));
  };

  // ================= TOGGLE CHECKLIST ITEM =================
  const toggleChecklistItem = (key) => {
    setDamageChecklist(prev => prev.map(item => 
      item.key === key ? { ...item, selected: !item.selected } : item
    ));
  };

  // ================= CHECK IF STUDENT HAS DUE =================
  const checkIfStudentHasDue = (studentId) => {
    return dueStudents.some(due => 
      due.student_id === studentId && 
      due.payment_status !== 'paid'
    );
  };

  // ================= GET STUDENT DUE DETAILS =================
  const getStudentDueDetails = (studentId) => {
    return dueStudents.filter(due => due.student_id === studentId);
  };

  // ================= GET STUDENT TOTAL DUES =================
  const getStudentTotalDues = (studentId) => {
    return dueStudents
      .filter(due => due.student_id === studentId && due.payment_status !== 'paid')
      .reduce((total, due) => total + due.amount, 0);
  };

  // ================= MANUAL CHECK DORMITORY DUES =================
  const checkDormitoryDues = async (studentId, formId) => {
    try {
      setCheckingDues(true);
      setSelectedStudentId(studentId);
      setSelectedFormId(formId);
      
      // Check manual due registry
      const studentDues = getStudentDueDetails(studentId);
      const hasDueInRegistry = checkIfStudentHasDue(studentId);
      const totalAmount = studentDues.reduce((total, due) => total + due.amount, 0);
      
      let duesData = {
        has_dorm_dues: hasDueInRegistry,
        dues: studentDues.map(due => ({
          id: due.id,
          description: due.description,
          amount: due.amount,
          due_date: due.due_date,
          status: due.status,
          payment_status: due.payment_status,
          registered_by: due.registered_by,
          registered_date: due.registered_date,
          room_number: due.room_number,
          items: due.items
        })),
        total_amount: totalAmount,
        can_approve: !hasDueInRegistry,
        student_info: {
          student_name: forms.find(f => f.id_number === studentId)?.full_name || studentId,
          id_number: studentId,
          email: forms.find(f => f.id_number === studentId)?.student_email || 'N/A',
          room_number: studentDues[0]?.room_number || 'N/A'
        },
        check_source: "manual_registry",
        checked_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        checked_by: user?.username
      };
      
      setDormDues({
        ...duesData,
        form_id: formId
      });
      setDormDuesModal(true);
      
      notification.info({
        message: 'Dormitory Dues Check',
        description: 'This is from the manual registry. You must verify.',
        duration: 5,
      });
      
      return duesData;
      
    } catch (err) {
      console.error("Check dormitory dues error:", err);
      message.error("Could not check dormitory dues from registry.");
      return null;
    } finally {
      setCheckingDues(false);
    }
  };

  // ================= MULTI-APPROVAL BATCH FUNCTIONS =================
  const toggleSelectForm = (formId) => {
    setSelectedForms(prev => {
      if (prev.includes(formId)) {
        return prev.filter(id => id !== formId);
      } else {
        return [...prev, formId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedForms([]);
      setSelectAll(false);
    } else {
      const pendingForms = getFilteredByCriteria()
        .filter(f => f.status === "approved_studentaffairs")
        .map(f => f.id);
      setSelectedForms(pendingForms);
      setSelectAll(true);
    }
  };

  const clearSelection = () => {
    setSelectedForms([]);
    setSelectAll(false);
  };

  const openBatchModal = (action) => {
    if (selectedForms.length === 0) {
      message.warning("Please select at least one form");
      return;
    }
    setBatchAction(action);
    setBatchModal(true);
    setBatchNotes("");
    setBatchPaymentRequired(false);
    setBatchPaymentAmount("");
    setBatchPaymentReason("");
  };

  const processBatchApproval = async () => {
    try {
      setBatchProgress({ current: 0, total: selectedForms.length, status: 'processing' });
      setBatchResults({ success: [], failed: [] });
      
      const results = { success: [], failed: [] };
      let totalDues = 0;
      
      for (let i = 0; i < selectedForms.length; i++) {
        const formId = selectedForms[i];
        const form = forms.find(f => f.id === formId);
        
        try {
          setBatchProgress(prev => ({ ...prev, current: i + 1 }));
          
          // Check if student has dormitory dues
          const hasDues = checkIfStudentHasDue(form.id_number);
          const studentDues = getStudentTotalDues(form.id_number);
          
          if (hasDues && batchAction === 'approve') {
            results.failed.push({
              id: formId,
              name: form.full_name,
              reason: `Student has unpaid dormitory dues (Amount: ETB ${studentDues})`
            });
            continue;
          }
          
          const payload = {
            action: batchAction,
            note: batchNotes || `Batch ${batchAction} by Dormitory`
          };
          
          if (batchAction === 'reject' && batchPaymentRequired) {
            payload.requires_payment = true;
            payload.payment_amount = parseFloat(batchPaymentAmount) + studentDues;
            payload.payment_reason = batchPaymentReason || 'Dormitory fees required';
            totalDues += parseFloat(batchPaymentAmount) + studentDues;
          }
          
          const res = await axios.patch(
            `${API_BASE}dormitory/action/${formId}/`,
            payload,
            { 
              headers: { 
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json'
              } 
            }
          );
          
          results.success.push({
            id: formId,
            name: form.full_name,
            message: res.data.message || `${batchAction} successful`,
            dues: studentDues
          });
          
          // Update local state
          setForms(prev => prev.map(f => {
            if (f.id === formId) {
              const newStatus = batchAction === 'approve' ? 'approved_dormitory' : 'rejected';
              return { 
                ...f, 
                status: newStatus,
                dormitory_note: batchNotes || f.dormitory_note
              };
            }
            return f;
          }));
          
        } catch (err) {
          results.failed.push({
            id: formId,
            name: form?.full_name || 'Unknown',
            reason: err.response?.data?.error || 'Processing failed'
          });
        }
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setBatchResults(results);
      setBatchProgress({ current: selectedForms.length, total: selectedForms.length, status: 'completed' });
      
      // Show summary notification
      notification.info({
        message: 'Batch Processing Complete',
        description: (
          <div>
            <p>✅ Successful: {results.success.length}</p>
            <p>❌ Failed: {results.failed.length}</p>
            {totalDues > 0 && (
              <p><DollarOutlined /> Total Dues: ETB {totalDues.toFixed(2)}</p>
            )}
          </div>
        ),
        duration: 5
      });
      
      if (results.success.length > 0) {
        message.success(`Successfully processed ${results.success.length} forms`);
      }
      
      if (results.failed.length > 0) {
        message.warning(`${results.failed.length} forms failed to process`);
      }
      
      // Clear selection and refresh data
      clearSelection();
      setTimeout(() => {
        loadForms(token);
      }, 2000);
      
    } catch (err) {
      console.error("Batch processing error:", err);
      message.error("Batch processing failed");
      setBatchProgress({ current: 0, total: 0, status: 'failed' });
    }
  };

  const closeBatchModal = () => {
    setBatchModal(false);
    setBatchProgress({ current: 0, total: 0, status: 'idle' });
    setBatchResults({ success: [], failed: [] });
  };

  const getFilteredByCriteria = () => {
    //  Check if forms is array before filtering
  if (!forms || !Array.isArray(forms)) {
    return [];
  }
    let filtered = forms.filter(f => f.status === "approved_studentaffairs");
    
    if (filterCriteria.department) {
      filtered = filtered.filter(f => f.department_name === filterCriteria.department);
    }
    
    if (filterCriteria.hasDues) {
      filtered = filtered.filter(f => checkIfStudentHasDue(f.id_number));
    }
    
    if (filterCriteria.dateRange && filterCriteria.dateRange[0] && filterCriteria.dateRange[1]) {
      filtered = filtered.filter(f => {
        const date = dayjs(f.created_at);
        return date.isAfter(filterCriteria.dateRange[0]) && date.isBefore(filterCriteria.dateRange[1]);
      });
    }
    
    return filtered;
  };

  const getUniqueDepartments = () => {
    const depts = new Set(forms.map(f => f.department_name).filter(Boolean));
    return Array.from(depts);
  };

  // ================= VIEW FORM DETAILS =================
  const viewFormDetails = (form) => {
    setSelectedForm(form);
    setViewModal(true);
  };

  // ================= APPROVE FORM =================
  const approveForm = async (formId, studentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [formId]: true }));
      
      confirm({
        title: 'Confirm Dormitory Dues Check',
        content: (
          <div>
            <p>Have you verified this student's dormitory dues/damages status?</p>
            <Alert
              message="Important:"
              description="As the dormitory officer, you must verify if the student has any unpaid dues or damages."
              type="warning"
              showIcon
              style={{ marginTop: 10 }}
            />
          </div>
        ),
        okText: 'Yes, I have verified - Approve',
        cancelText: 'No, Check First',
        onOk: async () => {
          try {
            const note = "Approved by Dormitory after manual dues/damages verification";
            const res = await axios.patch(
              `${API_BASE}dormitory/action/${formId}/`,
              { 
                action: "approve", 
                note: note
              },
              { 
                headers: { 
                  Authorization: `Token ${token}`,
                  'Content-Type': 'application/json'
                } 
              }
            );
            
            setForms(prev => prev.map(f => 
              f.id === formId ? { 
                ...f, 
                status: "approved_dormitory",
                dormitory_note: res.data.note
              } : f
            ));
            
            message.success("Form approved successfully!");
            
            notification.success({
              message: 'Clearance Approved',
              description: 'Form has been approved and sent to Registrar',
              duration: 5,
            });
            
            setTimeout(() => loadForms(token), 1000);
            
          } catch (apiErr) {
            if (apiErr.response?.data?.error) {
              message.error(apiErr.response.data.error);
            } else {
              message.error("Approval failed. Please try again.");
            }
          }
        },
        onCancel: () => {
          message.info("Please check dormitory dues first using the 'Check Dues' button.");
        }
      });
      
    } catch (err) {
      console.error("Approve error:", err);
      message.error("An error occurred. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [formId]: false }));
    }
  };

  // ================= REJECT FORM =================
  const openRejectModal = (formId, studentId) => {
    setSelectedFormId(formId);
    setSelectedStudentId(studentId);
    setRejectModal(true);
    setRejectAction('reject_only');
    setPaymentAmount("");
    setPaymentReason("");
  };

  const handleRejectForm = async () => {
    try {
      if (!rejectNote.trim()) {
        message.error("Please provide a rejection reason");
        return;
      }
      
      if (rejectAction === 'require_payment') {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
          message.error("Please enter a valid payment amount");
          return;
        }
        if (!paymentReason.trim()) {
          message.error("Please provide a payment reason");
          return;
        }
      }
      
      const payload = {
        action: "reject",
        note: rejectNote.trim()
      };
      
      if (rejectAction === 'require_payment') {
        payload.requires_payment = true;
        payload.payment_amount = parseFloat(paymentAmount);
        payload.payment_reason = paymentReason.trim();
      }
      
      const res = await axios.patch(
        `${API_BASE}dormitory/action/${selectedFormId}/`,
        payload,
        { 
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      message.success(res.data.message || "Form rejected successfully");
      
      setForms(prev => prev.map(f => {
        if (f.id === selectedFormId) {
          const updatedForm = { 
            ...f, 
            status: res.data.status || "rejected",
            dormitory_note: res.data.note || rejectNote.trim()
          };
          
          if (rejectAction === 'require_payment') {
            updatedForm.requires_payment = true;
            updatedForm.payment_amount = paymentAmount;
            updatedForm.payment_reason = paymentReason;
          }
          
          return updatedForm;
        }
        return f;
      }));
      
      if (rejectAction === 'require_payment') {
        notification.info({
          message: 'Payment Required',
          description: 'Student will receive payment instructions. Form will continue after payment verification.',
          duration: 5,
        });
      } else {
        notification.error({
          message: 'Form Rejected',
          description: 'Form has been rejected and sent back to student.',
          duration: 5,
        });
      }
      
      setRejectModal(false);
      setRejectNote("");
      setRejectAction('reject_only');
      setPaymentAmount("");
      setPaymentReason("");
      setSelectedFormId(null);
      setSelectedStudentId(null);
      
      setTimeout(() => loadForms(token), 1000);
      
    } catch (err) {
      console.error("Reject error:", err);
      message.error(err.response?.data?.error || err.response?.data?.message || "Rejection failed");
    }
  };

  // ================= VERIFY PAYMENT =================
  const verifyPayment = async (paymentId, action) => {
    try {
      if (action === 'verify') {
        const updatedDues = dueStudents.map(due => 
          due.id === paymentId ? { ...due, payment_status: 'paid' } : due
        );
        saveDueStudents(updatedDues);
        
        message.success("Payment verified successfully!");
        notification.success({
          message: 'Payment Verified',
          description: 'Student can now proceed with clearance.',
          duration: 4,
        });
      } else {
        message.success("Payment rejected.");
      }
      
      loadDueStudents();
      loadPendingPayments(token);
      
    } catch (err) {
      console.error("Payment verification error:", err);
      message.error("Payment verification failed");
    }
  };

  // ================= CHAT FUNCTIONS =================
  
  // Load dormitory's chat rooms
  const loadChatRooms = async () => {
    if (!token) return;
    
    try {
      setLoadingChats(true);
      const response = await axios.get(`${API_BASE}chat/rooms/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      let rooms = [];
      if (response.data && response.data.data) {
        rooms = response.data.data;
      } else if (Array.isArray(response.data)) {
        rooms = response.data;
      } else if (response.data && response.data.results) {
        rooms = response.data.results;
      }
      
      setChatRooms(rooms);
      
      const totalUnread = rooms.reduce((sum, room) => sum + (room.unread_count || 0), 0);
      setUnreadCount(totalUnread);
      
    } catch (err) {
      console.error("Failed to load chat rooms:", err);
      try {
        const altResponse = await axios.get(`${API_BASE}dormitory/chat/rooms/`, {
          headers: { Authorization: `Token ${token}` }
        });
        
        let rooms = [];
        if (Array.isArray(altResponse.data)) {
          rooms = altResponse.data;
        } else if (altResponse.data && altResponse.data.rooms) {
          rooms = altResponse.data.rooms;
        }
        
        setChatRooms(rooms);
        
        const totalUnread = rooms.reduce((sum, room) => sum + (room.unread_count || 0), 0);
        setUnreadCount(totalUnread);
        
      } catch (altErr) {
        console.error("Alternative chat rooms load failed:", altErr);
        setChatRooms([]);
      }
    } finally {
      setLoadingChats(false);
    }
  };

  // Load messages for a specific room
  const loadChatMessages = async (roomId) => {
    if (!token || !roomId) return;
    
    try {
      setLoadingChats(true);
      const response = await axios.get(`${API_BASE}chat/messages/${roomId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      let messages = [];
      
      if (response.data && response.data.messages) {
        messages = response.data.messages;
      } else if (Array.isArray(response.data)) {
        messages = response.data;
      } else if (response.data && response.data.data) {
        messages = response.data.data;
      }
      
      setChatMessages(messages);
      
      // Mark messages as read
      try {
        await axios.post(`${API_BASE}chat/mark-read/`, 
          { room_id: roomId },
          { headers: { Authorization: `Token ${token}` } }
        );
        
        setChatRooms(prev => prev.map(room => 
          room.id === roomId ? { ...room, unread_count: 0 } : room
        ));
        
      } catch (markErr) {
        console.error("Failed to mark messages as read:", markErr);
      }
      
    } catch (err) {
      console.error("Failed to load messages:", err);
      try {
        const altResponse = await axios.get(`${API_BASE}dormitory/chat/messages/${roomId}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        
        let messages = [];
        if (Array.isArray(altResponse.data)) {
          messages = altResponse.data;
        } else if (altResponse.data && altResponse.data.messages) {
          messages = altResponse.data.messages;
        }
        
        setChatMessages(messages);
        
      } catch (altErr) {
        console.error("Alternative messages load failed:", altErr);
        setChatMessages([]);
      }
    } finally {
      setLoadingChats(false);
    }
  };

  // Send a message
  const sendChatMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      
      const response = await axios.post(`${API_BASE}chat/send/`, {
        room_id: selectedRoom.id,
        content: newMessage.trim(),
        message_type: 'text'
      }, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let newMsg = response.data;
      if (response.data && response.data.data) {
        newMsg = response.data.data;
      } else if (response.data && response.data.message) {
        newMsg = response.data.message;
      }
      
      if (!newMsg.sender && user) {
        newMsg.sender = {
          id: user.id,
          username: user.username,
          full_name: user.full_name || user.username,
          role: 'dormitory'
        };
      }
      
      setChatMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      
      setTimeout(() => {
        const messagesContainer = document.getElementById('chat-messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
      
    } catch (err) {
      console.error("Failed to send message:", err);
      try {
        const altResponse = await axios.post(`${API_BASE}dormitory/chat/send/`, {
          room_id: selectedRoom.id,
          content: newMessage.trim()
        }, {
          headers: { Authorization: `Token ${token}` }
        });
        
        let newMsg = altResponse.data;
        if (altResponse.data && altResponse.data.data) {
          newMsg = altResponse.data.data;
        }
        
        newMsg.sender = {
          id: user.id,
          username: user.username,
          full_name: user.full_name || user.username,
          role: 'dormitory'
        };
        
        setChatMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        
      } catch (altErr) {
        console.error("Alternative send failed:", altErr);
        message.error("Failed to send message");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  // Send file message
  const sendFileMessage = async (file, type) => {
    if (!selectedRoom || !file) return;
    
    const formData = new FormData();
    formData.append('room_id', selectedRoom.id);
    
    if (type === 'image') {
      formData.append('image_file', file);
      formData.append('message_type', 'image');
    } else if (type === 'audio') {
      formData.append('audio_file', file);
      formData.append('message_type', 'audio');
    } else if (type === 'video') {
      formData.append('video_file', file);
      formData.append('message_type', 'video');
    } else {
      formData.append('file', file);
      formData.append('message_type', 'file');
      formData.append('file_name', file.name);
      formData.append('file_size', file.size);
    }
    
    try {
      setSendingMessage(true);
      
      const response = await axios.post(`${API_BASE}chat/send/`, formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      let newMsg = response.data;
      if (response.data && response.data.data) {
        newMsg = response.data.data;
      }
      
      if (!newMsg.sender && user) {
        newMsg.sender = {
          id: user.id,
          username: user.username,
          full_name: user.full_name || user.username,
          role: 'dormitory'
        };
      }
      
      setChatMessages(prev => [...prev, newMsg]);
      
      setTimeout(() => {
        const messagesContainer = document.getElementById('chat-messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
      
    } catch (err) {
      console.error("Failed to send file:", err);
      message.error("Failed to send file");
    } finally {
      setSendingMessage(false);
    }
  };

  // Load students for chat
  const loadStudentsForChat = async () => {
    if (!token) return;
    
    try {
      setLoadingStudents(true);
      const response = await axios.get(`${API_BASE}students/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      let students = [];
      if (Array.isArray(response.data)) {
        students = response.data;
      } else if (response.data && response.data.students) {
        students = response.data.students;
      } else if (response.data && response.data.data) {
        students = response.data.data;
      }
      
      setStudentsList(students);
      
    } catch (err) {
      console.error("Failed to load students:", err);
      try {
        const altResponse = await axios.get(`${API_BASE}dormitory/students/`, {
          headers: { Authorization: `Token ${token}` }
        });
        
        if (Array.isArray(altResponse.data)) {
          setStudentsList(altResponse.data);
        } else if (altResponse.data && altResponse.data.students) {
          setStudentsList(altResponse.data.students);
        }
      } catch (altErr) {
        console.error("Alternative student load failed:", altErr);
        setStudentsList([]);
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  // Start new chat with student
  const startChatWithStudent = async (studentId, studentName) => {
    try {
      setLoadingChats(true);
      const response = await axios.post(`${API_BASE}dormitory/chat/start/`, {
        student_id: studentId
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      
      if (response.data.chat_room) {
        setSelectedRoom(response.data.chat_room);
        setSelectedStudentForChat({
          id: studentId,
          name: studentName
        });
        await loadChatMessages(response.data.chat_room.id);
        message.success(`Chat started with ${studentName}`);
        setChatModalVisible(true);
      }
      
    } catch (err) {
      console.error("Failed to start chat:", err);
      
      if (err.response?.data?.chat_room) {
        const existingRoom = err.response.data.chat_room;
        setSelectedRoom(existingRoom);
        setSelectedStudentForChat({
          id: studentId,
          name: studentName
        });
        await loadChatMessages(existingRoom.id);
        message.info("Continuing existing chat");
        setChatModalVisible(true);
      } else {
        message.error(err.response?.data?.error || "Failed to start chat");
      }
    } finally {
      setLoadingChats(false);
    }
  };

  // Handle file upload for chat
  const handleFileUpload = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    
    if (type === 'image') {
      input.accept = 'image/*';
    } else if (type === 'audio') {
      input.accept = 'audio/*';
    } else if (type === 'video') {
      input.accept = 'video/*';
    } else {
      input.accept = '*/*';
    }
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          message.error("File size must be less than 10MB");
          return;
        }
        sendFileMessage(file, type);
      }
    };
    
    input.click();
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Open chat modal for a student
  const openChatWithStudent = (studentId, studentName, existingRoomId = null) => {
    setSelectedStudentForChat({ id: studentId, name: studentName });
    
    if (existingRoomId) {
      const room = chatRooms.find(r => r.id === existingRoomId);
      if (room) {
        setSelectedRoom(room);
        loadChatMessages(room.id);
      }
    }
    
    setChatModalVisible(true);
  };

  // Close chat modal
  const closeChatModal = () => {
    setChatModalVisible(false);
    setSelectedRoom(null);
    setSelectedStudentForChat(null);
    setChatMessages([]);
    setNewMessage("");
  };

  // Delete a message
  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API_BASE}chat/message/${messageId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
      message.success("Message deleted");
      
    } catch (err) {
      console.error("Failed to delete message:", err);
      try {
        await axios.delete(`${API_BASE}dormitory/chat/message/${messageId}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        
        setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
        message.success("Message deleted");
        
      } catch (altErr) {
        console.error("Alternative delete failed:", altErr);
        message.error("Failed to delete message");
      }
    }
  };

  // Download file attachment
  const downloadFile = async (messageId, fileName) => {
    try {
      const response = await axios.get(`${API_BASE}chat/download/${messageId}/`, {
        headers: { Authorization: `Token ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Failed to download file:", err);
      message.error("Failed to download file");
    }
  };

  // Initialize chat on component mount
  useEffect(() => {
    if (token && user?.role === 'dormitory') {
      loadChatRooms();
      loadStudentsForChat();
      
      const interval = setInterval(() => {
        loadChatRooms();
        if (selectedRoom) {
          loadChatMessages(selectedRoom.id);
        }
      }, 5000);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [token, user, selectedRoom]);

  // Update unread count when chat rooms change
  useEffect(() => {
    const totalUnread = chatRooms.reduce((sum, room) => sum + (room.unread_count || 0), 0);
    setUnreadCount(totalUnread);
  }, [chatRooms]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      const messagesContainer = document.getElementById('chat-messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }, [chatMessages]);


  // Add this useEffect to debug form data
  useEffect(() => {
  if (forms.length > 0) {
    console.log("Current forms state:", forms);
    console.log("First form structure:", forms[0]);
    console.log("Forms with approved_studentaffairs status:", 
      forms.filter(f => f.status === "approved_studentaffairs").length);
  }
}, [forms]);
  // ================= FILTERED FORMS =================
  const filteredForms = forms.filter((f) =>
    f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= SEARCH DUE STUDENTS =================
  const searchDueStudents = () => {
    if (!dueSearchId.trim() && !dueSearchName.trim()) {
      return dueStudents;
    }
    
    return dueStudents.filter(due => 
      (dueSearchId && due.student_id.toLowerCase().includes(dueSearchId.toLowerCase())) ||
      (dueSearchName && due.student_name.toLowerCase().includes(dueSearchName.toLowerCase()))
    );
  };

  // ================= RENDER STATUS =================
  const renderStatus = (status, dormitoryNote) => {
    switch(status) {
      case "approved_dormitory":
        return (
          <Badge 
            status="success" 
            text={
              <Space>
                <CheckCircleOutlined />
                <span style={{ fontWeight: 'bold' }}>APPROVED</span>
                <Tag color="green">Sent to Registrar</Tag>
              </Space>
            }
          />
        );
      case "rejected":
        return (
          <Badge 
            status="error" 
            text={
              <Space>
                <CloseCircleOutlined />
                <span style={{ fontWeight: 'bold' }}>REJECTED</span>
                {dormitoryNote && (
                  <Tooltip title={dormitoryNote}>
                    <WarningOutlined style={{ color: '#ff4d4f' }} />
                  </Tooltip>
                )}
              </Space>
            }
          />
        );
      case "requires_dormitory_payment":
        return (
          <Badge 
            status="warning" 
            text={
              <Space>
                <DollarOutlined />
                <span style={{ fontWeight: 'bold' }}>PAYMENT REQUIRED</span>
                <Tag color="orange">Waiting Payment</Tag>
              </Space>
            }
          />
        );
      case "approved_studentaffairs":
        return (
          <Badge 
            status="processing" 
            text={
              <Space>
                <ClockCircleOutlined />
                <span style={{ fontWeight: 'bold' }}>PENDING</span>
                <Tag color="blue">Dormitory Check</Tag>
              </Space>
            }
          />
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // ================= RENDER CLEARANCE FLOW =================
  const renderClearanceFlow = (form) => {
    const workflowSteps = [
      { name: 'Dept. Head', key: 'department', icon: <UserOutlined /> },
      { name: 'Library', key: 'library', icon: <FileTextOutlined /> },
      { name: 'Cafeteria', key: 'cafeteria', icon: <CoffeeOutlined /> },
      { name: 'Psychology', key: 'psychology', icon: <HeartOutlined /> },
      { name: 'Sport Master', key: 'sportmaster', icon: <TrophyOutlined /> },
      { name: 'Campus Police', key: 'campuspolice', icon: <SecurityScanOutlined /> },
      { name: 'Cooperation', key: 'cooperation', icon: <ShareAltOutlined /> },
      { name: 'DOP Cord.', key: 'dop', icon: <SolutionOutlined /> },
      { name: 'Student Affairs', key: 'studentaffairs', icon: <TeamOutlined /> },
      { name: 'Dormitory', key: 'dormitory', icon: <HomeOutlined /> },
    ];

    let currentStep = -1;
    
    if (form.status === 'rejected') {
      currentStep = -2;
    } else if (form.status === 'approved_dormitory') {
      currentStep = workflowSteps.length - 1;
    } else if (form.status === 'approved_studentaffairs') {
      currentStep = 8;
    } else {
      for (let i = 0; i < workflowSteps.length; i++) {
        if (form.status?.includes(workflowSteps[i].key)) {
          currentStep = i;
          break;
        }
      }
    }

    return (
      <Steps size="small" current={currentStep} style={{ marginTop: 20, marginBottom: 10 }}>
        {workflowSteps.map((step, index) => {
          let description = '';
          let status = 'wait';
          
          if (form.status === 'rejected') {
            status = 'error';
            description = 'Rejected';
          } else if (index < currentStep) {
            status = 'finish';
            description = 'Approved';
          } else if (index === currentStep) {
            status = 'process';
            if (step.key === 'dormitory') {
              description = form.status === 'approved_dormitory' ? 'Approved' : 'Check Needed';
            } else {
              description = 'Approved';
            }
          } else {
            status = 'wait';
            description = 'In progress';
          }

          return (
            <Step
              key={index}
              title={step.name}
              description={description}
              icon={step.icon}
              status={status}
            />
          );
        })}
      </Steps>
    );
  };

  // ================= DUES TABLE COLUMNS =================
  const duesColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Room',
      dataIndex: 'room_number',
      key: 'room_number',
      render: (room) => (
        <Space>
          <HomeOutlined />
          {room || 'N/A'}
        </Space>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {date}
          {dayjs(date).isBefore(dayjs()) && (
            <Tag color="red" size="small">OVERDUE</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Payment Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status) => (
        <Tag 
          color={status === 'paid' ? 'green' : status === 'pending' ? 'orange' : 'red'}
          icon={status === 'paid' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        >
          {status === 'paid' ? 'PAID' : status === 'pending' ? 'PENDING' : 'UNPAID'}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong type={amount > 0 ? "danger" : "success"}>
          <DollarOutlined /> ETB {amount > 0 ? amount.toFixed(2) : '0.00'}
        </Text>
      ),
    },
    {
      title: 'Registered By',
      dataIndex: 'registered_by',
      key: 'registered_by',
      render: (by) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {by}
        </Text>
      ),
    },
  ];

  // ================= DUE STUDENTS TABLE COLUMNS =================
  const dueStudentsColumns = [
    {
      title: 'Student ID',
      dataIndex: 'student_id',
      key: 'student_id',
      render: (text) => <Text strong>{text || 'N/A'}</Text>,
    },
    {
      title: 'Student Name',
      dataIndex: 'student_name',
      key: 'student_name',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Room',
      dataIndex: 'room_number',
      key: 'room_number',
      render: (room) => (
        <Tag color="blue">
          <HomeOutlined /> {room || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || 'No description',
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date) => {
        if (!date) return 'N/A';
        return (
          <Space>
            <CalendarOutlined />
            {date}
            {dayjs(date).isBefore(dayjs()) && (
              <Tag color="red" size="small">OVERDUE</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (!status) return <Tag color="default">UNKNOWN</Tag>;
        const statusText = String(status);
        return (
          <Tag 
            color={statusText === 'overdue' ? 'red' : 'orange'}
            icon={statusText === 'overdue' ? <WarningOutlined /> : <ClockCircleOutlined />}
          >
            {statusText.toUpperCase().replace('_', ' ')}
          </Tag>
        );
      }
    },
    {
      title: 'Payment Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status) => {
        if (!status) return <Tag color="default">UNKNOWN</Tag>;
        const statusText = String(status);
        const colorMap = {
          'paid': 'green',
          'pending': 'orange',
          'unpaid': 'red',
          'unknown': 'default'
        };
        const color = colorMap[statusText] || 'default';
        return (
          <Tag color={color}>
            {statusText.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => {
        const amountValue = parseFloat(amount || 0);
        return (
          <Text strong type={amountValue > 0 ? "danger" : "success"}>
            <DollarOutlined /> ETB {amountValue.toFixed(2)}
          </Text>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (!record) return null;
        return (
          <Space>
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  const selectedItems = record.items || [];
                  setDamageChecklist(prev => prev.map(item => ({
                    ...item,
                    selected: selectedItems.includes(item.key)
                  })));
                  
                  form.setFieldsValue({
                    student_id: record.student_id || '',
                    student_name: record.student_name || '',
                    room_number: record.room_number || '',
                    description: record.description || '',
                    amount: record.amount || 0,
                    due_date: record.due_date ? dayjs(record.due_date) : dayjs()
                  });
                  setEditingDue(record);
                  setRegisterDueModal(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  if (record && record.id) {
                    deleteDue(record.id);
                  }
                }}
              />
            </Tooltip>
            {record.payment_status === 'pending' && (
              <Tooltip title="Verify Payment">
                <Button
                  type="link"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => verifyPayment(record.id, 'verify')}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // ================= PENDING PAYMENTS COLUMNS =================
  const pendingPaymentsColumns = [
    {
      title: 'Student ID',
      dataIndex: 'student_id',
      key: 'student_id',
    },
    {
      title: 'Student Name',
      dataIndex: 'student_name',
      key: 'student_name',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong type="success">ETB {parseFloat(amount).toFixed(2)}</Text>
      ),
    },
    {
      title: 'Payment Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPayment(record);
              setPaymentVerificationModal(true);
            }}
          >
            Verify
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => verifyPayment(record.id, 'verify')}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            onClick={() => verifyPayment(record.id, 'reject')}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  // ================= RENDER FORM CARD =================
  const renderFormCard = (form) => {
    const isPending = form.status === "approved_studentaffairs";
    const hasDue = checkIfStudentHasDue(form.id_number);
    const studentDues = getStudentDueDetails(form.id_number);
    const totalDue = getStudentTotalDues(form.id_number);
    const existingRoom = chatRooms.find(r => r.student_id === (form.student_id || form.id_number));
    
    return (
      <Card
        key={form.id}
        hoverable
        onClick={() => {
          if (batchMode && isPending) {
            toggleSelectForm(form.id);
          } else {
            viewFormDetails(form);
          }
        }}
        style={{
          marginBottom: 15,
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderLeft: `5px solid ${
            form.status === "approved_dormitory" ? "#52c41a" :
            form.status === "requires_dormitory_payment" ? "#faad14" :
            form.status === "rejected" ? "#ff4d4f" :
            hasDue ? "#ff4d4f" : "#1890ff"
          }`,
          transition: 'all 0.3s',
          cursor: 'pointer',
          background: hasDue ? '#fff2f0' : 'white',
          opacity: isPending ? 1 : 0.8
        }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              {batchMode && isPending && (
                <Checkbox
                  checked={selectedForms.includes(form.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelectForm(form.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <UserOutlined />
              <Text strong style={{ fontSize: '16px' }}>{form.full_name}</Text>
              {hasDue && (
                <Tooltip title={`Student has unpaid dormitory dues - ETB ${totalDue}`}>
                  <WarningOutlined style={{ color: '#ff4d4f' }} />
                </Tooltip>
              )}
            </Space>
            {renderStatus(form.status, form.dormitory_note)}
          </div>
        }
        extra={
          <Space>
            <Tooltip title="Chat with Student">
              <Button 
                type="link" 
                icon={<MessageOutlined />}
                style={{ color: '#722ed1' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (existingRoom) {
                    openChatWithStudent(
                      form.student_id || form.id_number,
                      form.full_name,
                      existingRoom.id
                    );
                  } else {
                    startChatWithStudent(
                      form.student_id || form.id_number,
                      form.full_name
                    ).then(() => {
                      openChatWithStudent(
                        form.student_id || form.id_number,
                        form.full_name
                      );
                    });
                  }
                }}
              />
            </Tooltip>
            <Tooltip title="View Details">
              <Button 
                type="link" 
                icon={<EyeOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  viewFormDetails(form);
                }}
              />
            </Tooltip>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" size="small">
              <Text>
                <IdcardOutlined /> ID: {form.id_number}
              </Text>
              <Text>
                <MailOutlined /> Email: {form.student_email || 'N/A'}
              </Text>
              <Text>
                <FileTextOutlined /> Dept: {form.department_name}
              </Text>
              {form.building && (
                <Text>
                  <HomeOutlined /> Building: {form.building.name || 'N/A'}
                </Text>
              )}
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size="small">
              <Text>
                Year/Semester: {form.year} / {form.semester}
              </Text>
              <Text>
                Program: {form.program_level}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <HistoryOutlined /> Submitted: {dayjs(form.created_at).format('MMM D, YYYY HH:mm')}
              </Text>
            </Space>
          </Col>
        </Row>
        
        {hasDue && (
          <Alert
            message="Unpaid Dormitory Dues"
            description={
              <Space direction="vertical" size={2}>
                <Text>
                  Student has {studentDues.length} unpaid due(s) totaling ETB {totalDue.toFixed(2)}
                </Text>
                <Text type="secondary">
                  <strong>Note:</strong> This is from manual registry. Must verify payment.
                </Text>
              </Space>
            }
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginTop: 10 }}
          />
        )}
        
        {renderClearanceFlow(form)}
        
        {form.cafeteria_note && (
          <Alert
            message="Cafeteria Note"
            description={form.cafeteria_note}
            type="info"
            showIcon
            style={{ marginTop: 15 }}
          />
        )}
        
        {isPending && !batchMode && (
          <Space style={{ marginTop: 15, width: '100%', justifyContent: 'center' }}>
            <Tooltip title="Chat with Student">
              <Button
                icon={<MessageOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (existingRoom) {
                    openChatWithStudent(
                      form.student_id || form.id_number,
                      form.full_name,
                      existingRoom.id
                    );
                  } else {
                    startChatWithStudent(
                      form.student_id || form.id_number,
                      form.full_name
                    ).then(() => {
                      openChatWithStudent(
                        form.student_id || form.id_number,
                        form.full_name
                      );
                    });
                  }
                }}
                style={{ background: "#722ed1", borderColor: "#722ed1", color: 'white' }}
              >
                Chat
              </Button>
            </Tooltip>
            
            <Tooltip title="Check Dormitory Dues Registry">
              <Button
                type="primary"
                icon={<HomeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  checkDormitoryDues(form.id_number, form.id);
                }}
                loading={checkingDues && selectedStudentId === form.id_number}
                style={{ background: "#1890ff", borderColor: "#1890ff" }}
              >
                Check Dues Registry
              </Button>
            </Tooltip>
            
            
            <Popconfirm
              title="Dormitory Dues Verification Required"
              description="Have you verified this student's dormitory dues/damages status?"
              onConfirm={(e) => {
                e?.stopPropagation();
                approveForm(form.id, form.id_number);
              }}
              okText="Yes, I've verified - Approve"
              cancelText="No, Check First"
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={(e) => e.stopPropagation()}
                loading={actionLoading[form.id]}
                style={{ 
                  background: hasDue ? "#ff4d4f" : "#52c41a", 
                  borderColor: hasDue ? "#ff4d4f" : "#52c41a"
                }}
                disabled={hasDue}
              >
                {hasDue ? "Has Unpaid Dues" : "Approve"}
              </Button>
            </Popconfirm>
            
            <Popconfirm
              title="Reject Clearance"
              description="Are you sure you want to reject and return to student?"
              onConfirm={(e) => {
                e?.stopPropagation();
                openRejectModal(form.id, form.id_number);
              }}
              okText="Yes, Reject"
              cancelText="Cancel"
            >
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={(e) => e.stopPropagation()}
                style={{ background: "#ff4d4f", borderColor: "#ff4d4f", color: 'white' }}
              >
                Reject
              </Button>
            </Popconfirm>
          </Space>
        )}
        
        {form.dormitory_note && (
          <Alert
            message="Dormitory Action"
            description={form.dormitory_note}
            type={form.status === "rejected" ? "error" : form.status === "requires_dormitory_payment" ? "warning" : "success"}
            showIcon
            style={{ marginTop: 10 }}
          />
        )}
      </Card>
    );
  };

  // ================= RENDER CHAT TAB =================
  const renderChatTab = () => {
    return (
      <div style={{ padding: '20px 0' }}>
        <Row gutter={24}>
          <Col span={8}>
            <Card 
              title={
                <Space>
                  <MessageOutlined />
                  <span>Students Who Have Messaged You</span>
                  <Tag color="blue">{chatRooms.length} active chats</Tag>
                </Space>
              }
              style={{ 
                borderRadius: 10,
                height: '70vh',
                overflow: 'auto',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              extra={
                <Button 
                  type="link" 
                  icon={<ReloadOutlined />} 
                  onClick={loadChatRooms}
                  loading={loadingChats}
                >
                  Refresh
                </Button>
              }
            >
              {loadingChats ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                  <p style={{ marginTop: 10 }}>Loading chats...</p>
                </div>
              ) : chatRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <MessageOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <Title level={5} type="secondary" style={{ marginTop: 20 }}>
                    No active chats
                  </Title>
                  <Text type="secondary">
                    When students message you, they will appear here
                  </Text>
                  <div style={{ marginTop: 20 }}>
                    <Button 
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() => {
                        setChatModalVisible(false);
                        loadStudentsForChat();
                        Modal.info({
                          title: 'Start a New Chat',
                          content: (
                            <div>
                              <p>Select a student to start chatting:</p>
                              <Select
                                showSearch
                                style={{ width: '100%', marginTop: 10 }}
                                placeholder="Search for a student"
                                optionFilterProp="children"
                                onSelect={(value, option) => {
                                  Modal.destroyAll();
                                  startChatWithStudent(value, option.children);
                                }}
                              >
                                {studentsList.map(student => (
                                  <Option key={student.id} value={student.id}>
                                    {student.full_name} ({student.id_number})
                                  </Option>
                                ))}
                              </Select>
                            </div>
                          ),
                          onOk() {},
                          width: 500
                        });
                      }}
                    >
                      Start New Chat
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {chatRooms.map(room => {
                    const otherParticipant = room.other_participant || {};
                    
                    return (
                      <Card
                        key={room.id}
                        size="small"
                        hoverable
                        style={{
                          borderLeft: `5px solid ${room.unread_count > 0 ? '#1890ff' : '#d9d9d9'}`,
                          background: selectedRoom?.id === room.id ? '#e6f7ff' : 'white',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setSelectedRoom(room);
                          setSelectedStudentForChat({
                            id: otherParticipant.id,
                            name: otherParticipant.full_name || otherParticipant.username
                          });
                          loadChatMessages(room.id);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: '#1890ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 18
                          }}>
                            {(otherParticipant.full_name || otherParticipant.username || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong>{otherParticipant.full_name || otherParticipant.username || 'Student'}</Text>
                              {room.unread_count > 0 && (
                                <Badge count={room.unread_count} style={{ background: '#ff4d4f' }} />
                              )}
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {room.last_message_time ? formatMessageTime(room.last_message_time) : 'No messages'}
                            </Text>
                            <div style={{ 
                              fontSize: 12, 
                              color: '#666', 
                              marginTop: 4,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '200px'
                            }}>
                              {room.last_message || 'No messages yet'}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </Col>
          
          <Col span={16}>
            <Card 
              title={
                selectedRoom ? (
                  <Space>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: '#1890ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {(selectedRoom.other_participant?.full_name || 
                        selectedRoom.other_participant?.username || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Text strong>
                        {selectedRoom.other_participant?.full_name || 
                         selectedRoom.other_participant?.username || 'Student'}
                      </Text>
                      <div>
                        <Tag color="blue" style={{ fontSize: 11 }}>
                          Student
                        </Tag>
                      </div>
                    </div>
                  </Space>
                ) : (
                  <Space>
                    <MessageOutlined />
                    <span>Select a student to start messaging</span>
                  </Space>
                )
              }
              style={{ 
                borderRadius: 10,
                height: '70vh',
                display: 'flex',
                flexDirection: 'column'
              }}
              bodyStyle={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                padding: '20px 0',
                height: 'calc(70vh - 60px)',
                overflow: 'hidden'
              }}
              extra={
                selectedRoom && (
                  <Space>
                    <Tooltip title="Refresh Messages">
                      <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => loadChatMessages(selectedRoom.id)}
                        size="small"
                      />
                    </Tooltip>
                    <Tooltip title="Close Chat">
                      <Button 
                        icon={<CloseOutlined />} 
                        onClick={() => {
                          setSelectedRoom(null);
                          setSelectedStudentForChat(null);
                          setChatMessages([]);
                        }}
                        size="small"
                        danger
                      />
                    </Tooltip>
                  </Space>
                )
              }
            >
              {selectedRoom ? (
                <>
                  <div 
                    id="chat-messages-container"
                    style={{ 
                      flex: 1, 
                      overflowY: 'auto', 
                      padding: '0 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16
                    }}
                  >
                    {chatMessages.length === 0 ? (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        padding: 40
                      }}>
                        <MessageOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 20 }} />
                        <Title level={5} type="secondary">
                          No messages yet
                        </Title>
                        <Text type="secondary">
                          Send a message to start the conversation
                        </Text>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isOwnMessage = msg.sender?.id === user?.id;
                        
                        return (
                          <div
                            key={msg.id}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                              width: '100%'
                            }}
                          >
                            <div
                              style={{
                                maxWidth: '70%',
                                padding: '10px 16px',
                                borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                background: isOwnMessage ? '#1890ff' : '#f0f2f5',
                                color: isOwnMessage ? 'white' : '#333',
                                wordBreak: 'break-word'
                              }}
                            >
                              {msg.message_type === 'text' && (
                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                              )}
                              
                              {msg.message_type === 'image' && msg.image_file && (
                                <img 
                                  src={msg.image_file} 
                                  alt="Shared"
                                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                                  onClick={() => window.open(msg.image_file, '_blank')}
                                />
                              )}
                              
                              {msg.message_type === 'audio' && msg.audio_file && (
                                <audio controls style={{ maxWidth: '100%' }}>
                                  <source src={msg.audio_file} />
                                </audio>
                              )}
                              
                              {msg.message_type === 'video' && msg.video_file && (
                                <video controls style={{ maxWidth: '100%', maxHeight: 200 }}>
                                  <source src={msg.video_file} />
                                </video>
                              )}
                              
                              {msg.message_type === 'file' && msg.file && (
                                <div 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 8,
                                    background: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                                    padding: 8,
                                    borderRadius: 8,
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => downloadFile(msg.id, msg.file_name)}
                                >
                                  <PaperClipOutlined />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold' }}>{msg.file_name}</div>
                                    <div style={{ fontSize: 11 }}>{msg.file_size ? `${(msg.file_size / 1024).toFixed(1)} KB` : ''}</div>
                                  </div>
                                  <DownloadOutlined />
                                </div>
                              )}
                              
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 4,
                                fontSize: 11,
                                opacity: 0.7
                              }}>
                                <span>{formatMessageTime(msg.created_at)}</span>
                                {isOwnMessage && (
                                  <DeleteIcon 
                                    style={{ cursor: 'pointer', marginLeft: 8 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMessage(msg.id);
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div id="chat-messages-end" style={{ height: 1 }} />
                  </div>
                  
                  <div style={{ 
                    borderTop: '1px solid #f0f0f0', 
                    padding: '20px 20px 0 20px',
                    marginTop: 'auto'
                  }}>
                    <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                      <Tooltip title="Send Image">
                        <Button 
                          icon={<FileImageOutlined />} 
                          onClick={() => handleFileUpload('image')}
                          disabled={sendingMessage}
                        />
                      </Tooltip>
                      <Tooltip title="Send Audio">
                        <Button 
                          icon={<SoundOutlined />} 
                          onClick={() => handleFileUpload('audio')}
                          disabled={sendingMessage}
                        />
                      </Tooltip>
                      <Tooltip title="Send Video">
                        <Button 
                          icon={<VideoCameraOutlined />} 
                          onClick={() => handleFileUpload('video')}
                          disabled={sendingMessage}
                        />
                      </Tooltip>
                      <Tooltip title="Send File">
                        <Button 
                          icon={<PaperClipOutlined />} 
                          onClick={() => handleFileUpload('file')}
                          disabled={sendingMessage}
                        />
                      </Tooltip>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Input.TextArea
                        rows={2}
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onPressEnter={(e) => {
                          if (!e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                        disabled={sendingMessage}
                        style={{
                          borderRadius: 8,
                          resize: 'none'
                        }}
                      />
                      <Button 
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={sendChatMessage}
                        loading={sendingMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        style={{ 
                          height: 'auto',
                          padding: '0 24px',
                          background: '#1890ff',
                          borderRadius: 8
                        }}
                      >
                        Send
                      </Button>
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#999', 
                      marginTop: 8,
                      textAlign: 'right'
                    }}>
                      Press Enter to send, Shift+Enter for new line
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  padding: 40
                }}>
                  <MessageOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 20 }} />
                  <Title level={4} type="secondary">
                    Select a conversation
                  </Title>
                  <Text type="secondary" style={{ textAlign: 'center' }}>
                    Choose a student from the list to view your chat history
                  </Text>
                  {studentsList.length > 0 && (
                    <Button 
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() => {
                        setChatModalVisible(false);
                        Modal.info({
                          title: 'Start a New Chat',
                          content: (
                            <div>
                              <p>Select a student to start chatting:</p>
                              <Select
                                showSearch
                                style={{ width: '100%', marginTop: 10 }}
                                placeholder="Search for a student"
                                optionFilterProp="children"
                                onSelect={(value, option) => {
                                  Modal.destroyAll();
                                  startChatWithStudent(value, option.children);
                                }}
                              >
                                {studentsList.map(student => (
                                  <Option key={student.id} value={student.id}>
                                    {student.full_name} ({student.id_number})
                                  </Option>
                                ))}
                              </Select>
                            </div>
                          ),
                          onOk() {},
                          width: 500
                        });
                      }}
                      style={{ marginTop: 20 }}
                    >
                      Start New Chat
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // ================= MAIN RENDER =================
  return (
    <div style={{ padding: 30, maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* ================= HEADER ================= */}
      <Card 
        style={{ 
          marginBottom: 30,
          borderRadius: 15,
          background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
          color: 'white',
          boxShadow: '0 8px 25px rgba(114, 46, 209, 0.3)'
        }}
        bodyStyle={{ padding: '20px 30px' }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                <HomeOutlined /> Dormitory Clearance System
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
                Welcome, {user?.username || 'Dormitory Manager'}
              </Text>
              {assignedBuildings.length > 0 && (
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginTop: 5 }}>
                  Managing: {assignedBuildings.map(b => b.name).join(', ')}
                </Text>
              )}
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              <Badge count={unreadCount} offset={[-5, 5]} style={{ background: '#ff4d4f' }}>
                <Button 
                  icon={<MessageOutlined />}
                  onClick={() => setChatModalVisible(true)}
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    border: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Chats {unreadCount > 0 && `(${unreadCount})`}
                </Button>
              </Badge>
              
              <Button 
                icon={<UserOutlined />}
                onClick={() => navigate("/profile")}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  border: 'none'
                }}
              >
                My Profile
              </Button>
              
              <Button 
                icon={<DollarOutlined />}
                onClick={() => navigate("/dormitory/payments")}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Payment Verification
              </Button>
              
              <Button 
                icon={<DatabaseOutlined />}
                onClick={() => setRegisterDueModal(true)}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
              >
                Due Registry
              </Button>
              
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => {
                  loadForms(token);
                  loadDueStudents();
                  loadChatRooms();
                }}
                loading={loading}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ================= STATS ================= */}
      <div style={{ marginBottom: 20, overflow: 'auto' }}>
        <Space size={8} wrap style={{ display: 'flex', flexWrap: 'wrap' }}>
          <Card 
            size="small"
            hoverable 
            style={{ 
              width: 130,
              textAlign: 'center', 
              borderRadius: 6,
              border: '1px solid #722ed1',
              background: 'white'
            }}
            bodyStyle={{ padding: '8px 4px' }}
            onClick={() => setSearchTerm('')}
          >
            <Statistic 
              title={<span style={{ fontSize: '11px', fontWeight: 'normal' }}>Total</span>}
              value={stats.total} 
              valueStyle={{ color: '#722ed1', fontSize: '16px', fontWeight: 'bold' }}
              prefix={<FileTextOutlined style={{ fontSize: '12px' }} />}
            />
          </Card>
          
          <Card 
            size="small"
            hoverable 
            style={{ 
              width: 130,
              textAlign: 'center', 
              borderRadius: 6,
              border: '1px solid #faad14',
              background: 'white'
            }}
            bodyStyle={{ padding: '8px 4px' }}
          >
            <Statistic 
              title={<span style={{ fontSize: '11px', fontWeight: 'normal' }}>Pending</span>}
              value={stats.pending} 
              valueStyle={{ color: '#faad14', fontSize: '16px', fontWeight: 'bold' }}
              prefix={<ClockCircleOutlined style={{ fontSize: '12px' }} />}
            />
          </Card>
          
          <Card 
            size="small"
            hoverable 
            style={{ 
              width: 130,
              textAlign: 'center', 
              borderRadius: 6,
              border: '1px solid #52c41a',
              background: 'white'
            }}
            bodyStyle={{ padding: '8px 4px' }}
          >
            <Statistic 
              title={<span style={{ fontSize: '11px', fontWeight: 'normal' }}>Approved</span>}
              value={stats.approved} 
              valueStyle={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}
              prefix={<CheckCircleOutlined style={{ fontSize: '12px' }} />}
            />
          </Card>
          
          <Card 
            size="small"
            hoverable 
            style={{ 
              width: 130,
              textAlign: 'center', 
              borderRadius: 6,
              border: '1px solid #ff4d4f',
              background: 'white'
            }}
            bodyStyle={{ padding: '8px 4px' }}
          >
            <Statistic 
              title={<span style={{ fontSize: '11px', fontWeight: 'normal' }}>Payment Req</span>}
              value={stats.payment_required} 
              valueStyle={{ color: '#ff4d4f', fontSize: '16px', fontWeight: 'bold' }}
              prefix={<DollarCircleOutlined style={{ fontSize: '12px' }} />}
            />
          </Card>
          
          <Card 
            size="small"
            hoverable 
            style={{ 
              width: 130,
              textAlign: 'center', 
              borderRadius: 6,
              border: '1px solid #faad14',
              background: 'white'
            }}
            bodyStyle={{ padding: '8px 4px' }}
          >
            <Statistic 
              title={<span style={{ fontSize: '11px', fontWeight: 'normal' }}>With Dues</span>}
              value={stats.withDues} 
              valueStyle={{ color: '#faad14', fontSize: '16px', fontWeight: 'bold' }}
              prefix={<WarningOutlined style={{ fontSize: '12px' }} />}
            />
          </Card>
        </Space>
      </div>

      {/* ================= TABS ================= */}
      <Tabs 
        defaultActiveKey="forms"
        style={{ marginBottom: 20 }}
        onChange={(key) => {
          if (key === 'chats') {
            loadChatRooms();
          }
        }}
      >
        <TabPane tab={<span><HomeOutlined /> Clearance Forms</span>} key="forms">
          {/* ================= BATCH PROCESSING CONTROLS ================= */}
          <Card style={{ marginBottom: 20, borderRadius: 10, background: '#f9f0ff' }}>
            <Row align="middle" gutter={16}>
              <Col flex="auto">
                <Space size="large">
                  <Button
                    type={batchMode ? "primary" : "default"}
                    icon={<AppstoreOutlined />}
                    onClick={() => setBatchMode(!batchMode)}
                  >
                    {batchMode ? "Exit Batch Mode" : "Batch Mode"}
                  </Button>
                  
                  {batchMode && (
                    <>
                      <Checkbox 
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        indeterminate={selectedForms.length > 0 && selectedForms.length < getFilteredByCriteria().length}
                      >
                        Select All ({selectedForms.length} / {getFilteredByCriteria().length})
                      </Checkbox>
                      
                      <Button 
                        icon={<CheckOutlined />} 
                        type="primary" 
                        style={{ background: "#722ed1" }}
                        onClick={() => openBatchModal('approve')}
                        disabled={selectedForms.length === 0}
                      >
                        Batch Approve ({selectedForms.length})
                      </Button>
                      
                      <Button 
                        icon={<CloseOutlined />} 
                        danger
                        onClick={() => openBatchModal('reject')}
                        disabled={selectedForms.length === 0}
                      >
                        Batch Reject ({selectedForms.length})
                      </Button>
                      
                      <Button 
                        icon={<DeleteOutlined />} 
                        onClick={clearSelection}
                        disabled={selectedForms.length === 0}
                      >
                        Clear Selection
                      </Button>
                    </>
                  )}
                </Space>
              </Col>
              
              <Col>
                <Space>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item key="dept">
                          <Space><FilterIcon /> Filter by Department</Space>
                        </Menu.Item>
                        <Menu.Item key="dues" onClick={() => setFilterCriteria(prev => ({ ...prev, hasDues: !prev.hasDues }))}>
                          <Space><WarningOutlined /> {filterCriteria.hasDues ? "Show All" : "Show Only With Dues"}</Space>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button icon={<FilterIcon />}>Filter</Button>
                  </Dropdown>
                  
                  <Input
                    placeholder="Search forms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<SearchOutlined />}
                    allowClear
                    style={{ width: 250 }}
                  />
                </Space>
              </Col>
            </Row>
            
            {/* Active Filters Display */}
            {Object.values(filterCriteria).some(v => v) && (
              <div style={{ marginTop: 15 }}>
                <Space wrap>
                  <Text type="secondary">Active Filters:</Text>
                  {filterCriteria.department && (
                    <Tag closable onClose={() => setFilterCriteria(prev => ({ ...prev, department: '' }))}>
                      Dept: {filterCriteria.department}
                    </Tag>
                  )}
                  {filterCriteria.hasDues && (
                    <Tag closable onClose={() => setFilterCriteria(prev => ({ ...prev, hasDues: false }))}>
                      With Dues Only
                    </Tag>
                  )}
                  <Button type="link" size="small" onClick={() => setFilterCriteria({
                    department: '',
                    hasDues: false,
                    dateRange: null
                  })}>
                    Clear All
                  </Button>
                </Space>
              </div>
            )}
          </Card>

          {/* ================= MANUAL VERIFICATION ALERT ================= */}
          <Alert
            message="DORMITORY VERIFICATION REQUIRED"
            description={
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong>No automatic checking - Dormitory manager must verify</strong></li>
                <li>Check the due registry for any unpaid dormitory dues</li>
                <li>Verify if student has any room damages</li>
                <li>If damages found, require payment</li>
                <li>Update the registry if needed</li>
              </ol>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 20, borderRadius: 10 }}
          />

          {/* ================= SEARCH ================= */}
          <Card 
            style={{ 
              marginBottom: 20, 
              borderRadius: 10,
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <Input
              placeholder="Search by Name, ID, Department, or Email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              size="large"
              style={{ width: '100%' }}
            />
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">
                Showing {filteredForms.length} of {forms.length} forms
              </Text>
              <Button 
                type="link" 
                onClick={() => loadForms(token)}
                icon={<ReloadOutlined />}
                loading={loading}
              >
                Refresh List
              </Button>
            </div>
          </Card>

          {/* ================= FORM LIST ================= */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Spin size="large" />
              <p style={{ marginTop: 20, fontSize: '16px', color: '#666' }}>
                Loading clearance forms from student affairs...
              </p>
            </div>
          ) : filteredForms.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 60, borderRadius: 10, background: 'white' }}>
              <div style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: 20 }}>
                <FileTextOutlined />
              </div>
              <Title level={4} type="secondary">
                {searchTerm ? `No results for "${searchTerm}"` : "No forms awaiting dormitory clearance"}
              </Title>
              <Text type="secondary">
                All student affairs-approved forms have been processed
              </Text>
              {assignedBuildings.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <Text type="secondary">Your assigned buildings: </Text>
                  {assignedBuildings.map(b => (
                    <Tag key={b.id} color="purple" style={{ margin: '0 5px' }}>
                      {b.name}
                    </Tag>
                  ))}
                </div>
              )}
            </Card>
          ) :filteredForms.length === 0 ? (
  <Card style={{ textAlign: 'center', padding: 60, borderRadius: 10, background: 'white' }}>
    <div style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: 20 }}>
      <FileTextOutlined />
    </div>
    <Title level={4} type="secondary">
      {searchTerm ? `No results for "${searchTerm}"` : "No forms match current filters"}
    </Title>
    <Text type="secondary">
      Try adjusting your search or filter criteria
    </Text>
  </Card>
) : (
            <>
              {batchMode && (
                <div style={{ marginBottom: 20, textAlign: 'right' }}>
                  <Text type="secondary">
                    {selectedForms.length} form(s) selected for batch processing
                  </Text>
                </div>
              )}
              {filteredForms.map(renderFormCard)}
            </>
          )}
        </TabPane>
        
        <TabPane tab={<span><DatabaseOutlined /> Manual Due Registry</span>} key="dues">
          <Card 
            style={{ 
              marginBottom: 20, 
              borderRadius: 10,
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Input
                  placeholder="Search by Student ID"
                  value={dueSearchId}
                  onChange={(e) => setDueSearchId(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                  size="large"
                />
              </Col>
              <Col span={8}>
                <Input
                  placeholder="Search by Student Name"
                  value={dueSearchName}
                  onChange={(e) => setDueSearchName(e.target.value)}
                  prefix={<UserOutlined />}
                  allowClear
                  size="large"
                />
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Space>
                  <Button 
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingDue(null);
                      form.resetFields();
                      resetChecklist();
                      setRegisterDueModal(true);
                    }}
                    style={{ background: '#722ed1', borderColor: '#722ed1' }}
                  >
                    Register New Due
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={loadDueStudents}
                    loading={loadingDues}
                  >
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
          <Table
            columns={dueStudentsColumns}
            dataSource={searchDueStudents()}
            rowKey="id"
            loading={loadingDues}
            pagination={{ pageSize: 10 }}
            style={{ background: 'white', borderRadius: 10 }}
            title={() => (
              <Space>
                <DatabaseOutlined />
                <Text strong>Due Registry</Text>
                <Tag color="red">Total: {searchDueStudents().length} records</Tag>
                <Tag color="orange">
                  Total Amount: ETB {searchDueStudents().reduce((sum, due) => sum + due.amount, 0).toFixed(2)}
                </Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  This is a registry. Not connected to automatic systems.
                </Text>
              </Space>
            )}
          />
        </TabPane>

        <TabPane 
          tab={
            <span>
              <MessageOutlined /> 
              Chats 
              {unreadCount > 0 && (
                <Badge count={unreadCount} style={{ marginLeft: 8, background: '#ff4d4f' }} />
              )}
            </span>
          } 
          key="chats"
        >
          {renderChatTab()}
        </TabPane>

        <TabPane tab={<span><BarChartOutlined /> Reports</span>} key="reports">
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={reportsData.revenueStats.total}
                  prefix="ETB "
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress 
                  percent={Math.round((reportsData.revenueStats.collected / reportsData.revenueStats.total) * 100)} 
                  status="active" 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Pending Collection"
                  value={reportsData.revenueStats.pending}
                  prefix="ETB "
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Collected"
                  value={reportsData.revenueStats.collected}
                  prefix="ETB "
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>
          
          <Card title="Monthly Statistics" style={{ marginTop: 24 }}>
            <Timeline>
              {reportsData.monthlyStats.map((stat, index) => (
                <Timeline.Item key={index} color={stat.payments > 40000 ? 'green' : 'blue'}>
                  <Space>
                    <Text strong>{stat.month}</Text>
                    <Text>Forms: {stat.forms}</Text>
                    <Text type="success">Revenue: ETB {stat.payments}</Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
          
          <Card title="Top Damages" style={{ marginTop: 24 }}>
            <List
              dataSource={reportsData.topDamages}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ background: ['#ff4d4f', '#faad14', '#52c41a', '#1890ff', '#722ed1'][index % 5] }}>
                        {index + 1}
                      </Avatar>
                    }
                    title={item.name}
                    description={`${item.count} cases • ETB ${item.amount}`}
                  />
                  <Progress 
                    percent={Math.round((item.amount / reportsData.topDamages[0].amount) * 100)} 
                    style={{ width: 200 }}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* ================= VIEW FORM MODAL ================= */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Clearance Form Details</span>
            {selectedForm && renderStatus(selectedForm.status, selectedForm.dormitory_note)}
          </Space>
        }
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewModal(false)}>
            Close
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {selectedForm && (
          <div style={{ maxHeight: '60vh', overflow: 'auto', padding: '0 10px' }}>
            <Descriptions 
              column={2} 
              bordered 
              size="middle"
              labelStyle={{ fontWeight: 'bold', background: '#fafafa' }}
            >
              <Descriptions.Item label="Full Name" span={2}>
                <Space>
                  <UserOutlined />
                  <Text strong>{selectedForm.full_name}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="ID Number">
                <Space>
                  <IdcardOutlined />
                  {selectedForm.id_number}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Student Email">
                <Space>
                  <MailOutlined />
                  {selectedForm.student_email || 'N/A'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="College">
                {selectedForm.college}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedForm.department_name}
              </Descriptions.Item>
              <Descriptions.Item label="Program Level">
                {selectedForm.program_level}
              </Descriptions.Item>
              {selectedForm.building && (
                <Descriptions.Item label="Building">
                  {selectedForm.building.name} ({selectedForm.building.code})
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Clearance Reason" span={2}>
                <Card 
                  size="small" 
                  style={{ background: '#f6ffed', marginTop: 5 }}
                  bodyStyle={{ padding: '12px' }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedForm.reason}
                  </div>
                </Card>
              </Descriptions.Item>
              <Descriptions.Item label="Submitted Date" span={2}>
                <Space>
                  <CalendarOutlined />
                  {dayjs(selectedForm.created_at).format('MMMM D, YYYY HH:mm:ss')}
                </Space>
              </Descriptions.Item>
              {selectedForm.cafeteria_note && (
                <Descriptions.Item label="Cafeteria Action" span={2}>
                  <Alert
                    message="Cafeteria Note"
                    description={selectedForm.cafeteria_note}
                    type="info"
                    showIcon
                  />
                </Descriptions.Item>
              )}
              {selectedForm.dormitory_note && (
                <Descriptions.Item label="Dormitory Action" span={2}>
                  <Alert
                    message={selectedForm.status === "approved_dormitory" ? "Approval Note" : 
                            selectedForm.status === "requires_dormitory_payment" ? "Payment Required Note" : "Rejection Note"}
                    description={selectedForm.dormitory_note}
                    type={selectedForm.status === "approved_dormitory" ? "success" : 
                          selectedForm.status === "requires_dormitory_payment" ? "warning" : "error"}
                    showIcon
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
            {selectedForm.status === "approved_studentaffairs" && (
              <div style={{ marginTop: 20, padding: '20px', background: '#f6f8fa', borderRadius: 8 }}>
                <Title level={5} style={{ marginBottom: 15 }}>
                  <HomeOutlined /> Dormitory Verification Required
                </Title>
                <Alert
                  message="No Automatic Checking"
                  description="You must verify the student's dormitory dues/damages status. Check the registry for reference."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 15 }}
                />
                <Space size="large">
                  <Button
                    type="primary"
                    icon={<HomeOutlined />}
                    onClick={() => checkDormitoryDues(selectedForm.student_id || selectedForm.id_number, selectedForm.id)}
                    loading={checkingDues}
                    style={{ background: '#722ed1', borderColor: '#722ed1' }}
                  >
                    Check Registry
                  </Button>
                  <Button
                    type="default"
                    icon={<MessageOutlined />}
                    onClick={() => {
                      setViewModal(false);
                      const existingRoom = chatRooms.find(r => r.student_id === (selectedForm.student_id || selectedForm.id_number));
                      if (existingRoom) {
                        openChatWithStudent(
                          selectedForm.student_id || selectedForm.id_number,
                          selectedForm.full_name,
                          existingRoom.id
                        );
                      } else {
                        startChatWithStudent(
                          selectedForm.student_id || selectedForm.id_number,
                          selectedForm.full_name
                        ).then(() => {
                          openChatWithStudent(
                            selectedForm.student_id || selectedForm.id_number,
                            selectedForm.full_name
                          );
                        });
                      }
                    }}
                    style={{ color: '#722ed1', borderColor: '#722ed1' }}
                  >
                    Chat with Student
                  </Button>
                  <Text type="secondary">
                    Reference only. Must verify.
                  </Text>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ================= REJECT MODAL ================= */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Reject Clearance Form</span>
          </Space>
        }
        open={rejectModal}
        onOk={handleRejectForm}
        onCancel={() => {
          setRejectModal(false);
          setRejectNote("");
          setRejectAction('reject_only');
          setPaymentAmount("");
          setPaymentReason("");
          setSelectedFormId(null);
          setSelectedStudentId(null);
        }}
        okText={rejectAction === 'require_payment' ? "Require Payment" : "Reject & Return to Student"}
        okButtonProps={{ 
          danger: true,
          icon: rejectAction === 'require_payment' ? <DollarOutlined /> : <CloseOutlined />
        }}
        cancelText="Cancel"
        width={600}
      >
        <Alert
          message="Verification Required"
          description="This action is based on your verification of dormitory dues/damages status."
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
        
        <div style={{ marginBottom: 20 }}>
          <Radio.Group 
            value={rejectAction} 
            onChange={(e) => setRejectAction(e.target.value)}
            style={{ width: '100%' }}
          >
            <Radio value="reject_only" style={{ display: 'block', marginBottom: 8 }}>
              <Space>
                <CloseCircleOutlined />
                <span>Reject Permanently (Form cannot continue)</span>
              </Space>
            </Radio>
            <Radio value="require_payment" style={{ display: 'block' }}>
              <Space>
                <DollarOutlined />
                <span>Reject but Allow Payment to Continue</span>
              </Space>
            </Radio>
          </Radio.Group>
        </div>
        
        {rejectAction === 'require_payment' && (
          <div style={{ marginBottom: 20, padding: 16, background: '#f6ffed', borderRadius: 6 }}>
            <Form layout="vertical">
              <Form.Item 
                label="Required Payment Amount (ETB)"
                required
              >
                <InputNumber
                  value={paymentAmount}
                  onChange={setPaymentAmount}
                  placeholder="Enter amount"
                  min={1}
                  step={0.01}
                  style={{ width: '100%' }}
                  prefix="ETB"
                />
              </Form.Item>
              <Form.Item 
                label="Payment Reason"
                required
              >
                <Input.TextArea
                  value={paymentReason}
                  onChange={(e) => setPaymentReason(e.target.value)}
                  placeholder="Why is payment required? (e.g., Dormitory damages, unpaid dues, etc.)"
                  rows={2}
                  maxLength={200}
                  showCount
                />
              </Form.Item>
            </Form>
          </div>
        )}
        
        <Form.Item
          label="Rejection Reason"
          required
        >
          <Input.TextArea
            rows={4}
            placeholder="Enter detailed reason for rejection..."
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            maxLength={500}
            showCount
            autoFocus
          />
        </Form.Item>
        
        <Alert
          message="Note for Student"
          description={
            rejectAction === 'require_payment' 
              ? "Student will be asked to make payment to continue. They'll receive a payment link."
              : "Form will be permanently rejected. Student must resubmit if needed."
          }
          type="info"
          showIcon
        />
      </Modal>

      {/* ================= DORMITORY DUES MODAL ================= */}
      <Modal
        title={
          <Space>
            <HomeOutlined />
            <span>Dormitory Dues Registry Check</span>
            {dormDues.student_info && (
              <Tag color="blue">
                {dormDues.student_info.student_name || dormDues.student_info.id_number}
              </Tag>
            )}
          </Space>
        }
        open={dormDuesModal}
        onCancel={() => setDormDuesModal(false)}
        footer={[
          <Button key="close" onClick={() => setDormDuesModal(false)}>
            Close
          </Button>,
          <Button 
            key="chat" 
            icon={<MessageOutlined />}
            onClick={() => {
              setDormDuesModal(false);
              const existingRoom = chatRooms.find(r => r.student_id === dormDues.student_info?.id_number);
              if (existingRoom) {
                openChatWithStudent(
                  dormDues.student_info.id_number,
                  dormDues.student_info.student_name,
                  existingRoom.id
                );
              } else {
                startChatWithStudent(
                  dormDues.student_info.id_number,
                  dormDues.student_info.student_name
                ).then(() => {
                  openChatWithStudent(
                    dormDues.student_info.id_number,
                    dormDues.student_info.student_name
                  );
                });
              }
            }}
            style={{ background: '#722ed1', borderColor: '#722ed1', color: 'white' }}
          >
            Chat with Student
          </Button>,
          <Button 
            key="approve" 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Confirm Verification',
                content: 'Have you verified this student has no dormitory dues/damages?',
                onOk: () => {
                  const note = "Approved by Dormitory after manual dues/damages verification";
                  setForms(prev => prev.map(f => 
                    f.id === dormDues.form_id ? { 
                      ...f, 
                      status: "approved_dormitory",
                      dormitory_note: note
                    } : f
                  ));
                  message.success("Form approved successfully!");
                  setDormDuesModal(false);
                }
              });
            }}
            disabled={!dormDues.form_id || dormDues.has_dorm_dues}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Approve (Verified)
          </Button>
        ]}
        width={800}
      >
        {dormDues.student_info && (
          <Alert
            message="Registry Check Only"
            description="This is from the manual registry. You must verify."
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}
        
        <div style={{ marginBottom: 20 }}>
          <Alert
            message={dormDues.has_dorm_dues ? "REGISTERED DORMITORY DUES/DAMAGES" : "NO REGISTERED DUES/DAMAGES"}
            description={
              dormDues.has_dorm_dues 
                ? `Student has ${dormDues.dues.length} registered dormitory due(s) in registry.`
                : "No dormitory dues/damages found in manual registry. Still requires verification."
            }
            type={dormDues.has_dorm_dues ? "warning" : "info"}
            showIcon
            icon={
              dormDues.has_dorm_dues ? <WarningOutlined /> : <InfoCircleOutlined />
            }
          />
        </div>
        
        {dormDues.dues.length > 0 ? (
          <>
            <Table 
              columns={duesColumns} 
              dataSource={dormDues.dues} 
              pagination={false}
              rowKey="id"
              style={{ marginBottom: 20 }}
              title={() => (
                <Text type="secondary">
                  Registry Records • Last checked: {dormDues.checked_at}
                </Text>
              )}
            />
            
            {dormDues.has_dorm_dues && (
              <Card 
                title={<><DollarOutlined /> Registered Dues Summary</>}
                size="small"
                style={{ background: '#fff2f0' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Total Dues"
                      value={dormDues.total_amount || 0}
                      prefix="ETB "
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Number of Dues"
                      value={dormDues.dues.length}
                    />
                  </Col>
                </Row>
              </Card>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }}>
              <DatabaseOutlined />
            </div>
            <Title level={4} type="secondary">
              No Records in Registry
            </Title>
            <Text type="secondary">
              This student has no dormitory due/damage records in the manual registry.
              <br />
              You must still verify.
            </Text>
          </div>
        )}
      </Modal>

      {/* ================= REGISTER DUE MODAL ================= */}
      <Modal
        title={
          <Space>
            <DatabaseOutlined />
            <span>{editingDue ? 'Edit Dormitory Due Record' : 'Register New Dormitory Due'}</span>
          </Space>
        }
        open={registerDueModal}
        onCancel={() => {
          setRegisterDueModal(false);
          setEditingDue(null);
          form.resetFields();
          resetChecklist();
        }}
        footer={null}
        width={700}
      >
        <Alert
          message="Manual Registry Only"
          description="This registry is for record keeping. Not connected to automatic systems."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={editingDue ? updateDue : registerNewDue}
          initialValues={{
            amount: 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="student_id"
                label="Student ID"
                rules={[{ required: true, message: 'Please enter student ID' }]}
              >
                <Input 
                  placeholder="Enter student ID" 
                  prefix={<IdcardOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="student_name"
                label="Student Name"
                rules={[{ required: true, message: 'Please enter student name' }]}
              >
                <Input 
                  placeholder="Enter student name" 
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="room_number"
                label="Room Number"
              >
                <Input 
                  placeholder="Enter room number" 
                  prefix={<HomeOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="due_date"
                label="Due Date"
                rules={[{ required: true, message: 'Please select due date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="Select due date"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Due Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea 
              placeholder="Enter description (e.g., 'Broken door and window damage', 'Room damages', etc.)" 
              rows={3}
            />
          </Form.Item>
          
          <Form.Item
            label="Damaged Items (Check all that apply)"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {damageChecklist.map(item => (
                <Card
                  key={item.id}
                  hoverable
                  onClick={() => toggleChecklistItem(item.key)}
                  style={{
                    border: item.selected ? '2px solid #722ed1' : '1px solid #f0f0f0',
                    background: item.selected ? '#f9f0ff' : 'white',
                    cursor: 'pointer',
                    padding: '12px',
                    transition: 'all 0.3s'
                  }}
                >
                  <Space>
                    <Checkbox checked={item.selected} />
                    {item.icon}
                    <Text>{item.name}</Text>
                    <Tag color="purple">ETB {item.price}</Tag>
                  </Space>
                </Card>
              ))}
            </div>
          </Form.Item>
          
          <Form.Item
            name="amount"
            label="Total Amount (ETB)"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter total amount"
              prefix={<DollarOutlined />}
              min={0}
              step={0.01}
              precision={2}
            />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setRegisterDueModal(false);
                setEditingDue(null);
                form.resetFields();
                resetChecklist();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" style={{ background: '#722ed1', borderColor: '#722ed1' }}>
                {editingDue ? 'Update Record' : 'Register Record'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ================= BATCH PROCESSING MODAL ================= */}
      <Modal
        title={
          <Space>
            <RocketOutlined style={{ color: '#722ed1' }} />
            <span>Batch {batchAction === 'approve' ? 'Approval' : 'Rejection'}</span>
            <Tag color={batchAction === 'approve' ? 'green' : 'red'}>
              {selectedForms.length} Forms Selected
            </Tag>
          </Space>
        }
        open={batchModal}
        onCancel={closeBatchModal}
        footer={null}
        width={700}
      >
        {batchProgress.status === 'idle' && (
          <>
            <Alert
              message={`You are about to ${batchAction} ${selectedForms.length} clearance forms`}
              type={batchAction === 'approve' ? 'info' : 'warning'}
              showIcon
              style={{ marginBottom: 20 }}
            />

            <Form form={batchForm} layout="vertical">
              <Form.Item 
                name="notes" 
                label="Batch Notes (Optional)"
                help="This note will be applied to all selected forms"
              >
                <Input.TextArea 
                  rows={3} 
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder={`Enter reason for batch ${batchAction}...`}
                />
              </Form.Item>

              {batchAction === 'reject' && (
                <>
                  <Divider>Payment Requirements (Optional)</Divider>
                  
                  <Form.Item name="requirePayment">
                    <Checkbox
                      checked={batchPaymentRequired}
                      onChange={(e) => setBatchPaymentRequired(e.target.checked)}
                    >
                      Require Payment for These Forms
                    </Checkbox>
                  </Form.Item>

                  {batchPaymentRequired && (
                    <Card style={{ background: '#f6f8fa', marginBottom: 20 }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item 
                            name="paymentAmount" 
                            label="Payment Amount"
                            required={batchPaymentRequired}
                          >
                            <InputNumber
                              style={{ width: '100%' }}
                              prefix="ETB"
                              min={0}
                              value={batchPaymentAmount}
                              onChange={setBatchPaymentAmount}
                              placeholder="Enter amount"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item 
                            name="paymentReason" 
                            label="Reason"
                            required={batchPaymentRequired}
                          >
                            <Input
                              value={batchPaymentReason}
                              onChange={(e) => setBatchPaymentReason(e.target.value)}
                              placeholder="e.g., Dormitory damages"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Text type="secondary">Note: This will be added to any existing student dues</Text>
                    </Card>
                  )}
                </>
              )}

              <Divider />

              <div style={{ textAlign: 'center' }}>
                <Space size="large">
                  <Button onClick={closeBatchModal}>Cancel</Button>
                  <Button
                    type="primary"
                    onClick={processBatchApproval}
                    danger={batchAction === 'reject'}
                    style={batchAction === 'approve' ? { background: '#722ed1' } : {}}
                    icon={batchAction === 'approve' ? <CheckOutlined /> : <CloseOutlined />}
                  >
                    Confirm Batch {batchAction === 'approve' ? 'Approval' : 'Rejection'}
                  </Button>
                </Space>
              </div>
            </Form>
          </>
        )}

        {batchProgress.status === 'processing' && (
          <div style={{ textAlign: 'center', padding: 30 }}>
            <Progress
              type="circle"
              percent={Math.round((batchProgress.current / batchProgress.total) * 100)}
              status="active"
            />
            <Title level={4} style={{ marginTop: 20 }}>
              Processing Form {batchProgress.current} of {batchProgress.total}
            </Title>
            <Text type="secondary">Please wait while we process your request...</Text>
          </div>
        )}

        {batchProgress.status === 'completed' && (
          <div>
            <Result
              status={batchResults.failed.length === 0 ? "success" : "warning"}
              title={`Batch Processing Complete`}
              subTitle={`Successfully processed ${batchResults.success.length} out of ${selectedForms.length} forms`}
            />

            {batchResults.success.length > 0 && (
              <Card size="small" style={{ marginBottom: 20, background: '#f6ffed' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18, marginRight: 8 }} />
                  <Text strong>Successfully Processed ({batchResults.success.length})</Text>
                </div>
                <List
                  size="small"
                  dataSource={batchResults.success}
                  renderItem={item => (
                    <List.Item>
                      <Text>{item.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.message}</Text>
                      {item.dues > 0 && (
                        <Tag color="purple" style={{ marginLeft: 8 }}>Dues: ETB {item.dues}</Tag>
                      )}
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {batchResults.failed.length > 0 && (
              <Card size="small" style={{ background: '#fff2f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18, marginRight: 8 }} />
                  <Text strong>Failed ({batchResults.failed.length})</Text>
                </div>
                <List
                  size="small"
                  dataSource={batchResults.failed}
                  renderItem={item => (
                    <List.Item>
                      <div>
                        <Text>{item.name}</Text>
                        <br />
                        <Text type="danger" style={{ fontSize: 12 }}>{item.reason}</Text>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button onClick={closeBatchModal}>Close</Button>
                <Button type="primary" onClick={() => {
                  closeBatchModal();
                  loadForms(token);
                }}>
                  Refresh Forms
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= PAYMENT VERIFICATION MODAL ================= */}
      <Modal
        title={
          <Space>
            <CheckSquareOutlined />
            <span>Payment Verification</span>
            {selectedPayment && (
              <Tag color="blue">Transaction: {selectedPayment.transaction_id}</Tag>
            )}
          </Space>
        }
        open={paymentVerificationModal}
        onCancel={() => {
          setPaymentVerificationModal(false);
          setSelectedPayment(null);
        }}
        footer={[
          <Button key="close" onClick={() => setPaymentVerificationModal(false)}>
            Close
          </Button>,
          <Button 
            key="reject" 
            danger 
            icon={<CloseOutlined />}
            onClick={() => {
              verifyPayment(selectedPayment?.id, 'reject');
              setPaymentVerificationModal(false);
            }}
          >
            Reject Payment
          </Button>,
          <Button 
            key="approve" 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={() => {
              verifyPayment(selectedPayment?.id, 'verify');
              setPaymentVerificationModal(false);
            }}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Verify Payment
          </Button>
        ]}
        width={600}
      >
        {selectedPayment && (
          <div>
            <Alert
              message="Payment Details"
              description="Review the payment details before verification."
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />
            
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Student Name">
                {selectedPayment.student_name}
              </Descriptions.Item>
              <Descriptions.Item label="Student ID">
                {selectedPayment.student_id}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                <Text strong type="success">ETB {parseFloat(selectedPayment.amount).toFixed(2)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Date">
                {dayjs(selectedPayment.payment_date).format('MMMM D, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Transaction ID">
                {selectedPayment.transaction_id}
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Image
                src="https://via.placeholder.com/400x200/722ed1/ffffff?text=Payment+Receipt+Image"
                alt="Payment Receipt"
                style={{ maxWidth: '100%', borderRadius: 8 }}
                preview={false}
              />
              <Text type="secondary" style={{ display: 'block', marginTop: 10 }}>
                Payment receipt/screenshot
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= CHAT MODAL ================= */}
      <Modal
        title={
          <Space>
            <MessageOutlined />
            <span>Chat with {selectedStudentForChat?.name}</span>
          </Space>
        }
        open={chatModalVisible}
        onCancel={closeChatModal}
        footer={null}
        width={800}
        style={{ top: 20 }}
        destroyOnClose={true}
      >
        {selectedRoom ? (
          <div style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
            {/* Messages Container */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <MessageOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                  <Title level={5} type="secondary" style={{ marginTop: 20 }}>
                    No messages yet
                  </Title>
                  <Text type="secondary">
                    Send a message to start the conversation
                  </Text>
                </div>
              ) : (
                chatMessages.map(msg => {
                  const isOwnMessage = msg.sender?.id === user?.id;
                  
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                        marginBottom: 8
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '10px 16px',
                          borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isOwnMessage ? '#722ed1' : '#f0f2f5',
                          color: isOwnMessage ? 'white' : '#333'
                        }}
                      >
                        {msg.message_type === 'text' && (
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                        )}
                        
                        {msg.message_type === 'image' && msg.image_file && (
                          <img 
                            src={msg.image_file} 
                            alt="Shared"
                            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                            onClick={() => window.open(msg.image_file, '_blank')}
                          />
                        )}
                        
                        {msg.message_type === 'audio' && msg.audio_file && (
                          <audio controls style={{ maxWidth: '100%' }}>
                            <source src={msg.audio_file} />
                          </audio>
                        )}
                        
                        {msg.message_type === 'video' && msg.video_file && (
                          <video controls style={{ maxWidth: '100%', maxHeight: 200 }}>
                            <source src={msg.video_file} />
                          </video>
                        )}
                        
                        {msg.message_type === 'file' && msg.file && (
                          <div 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 8,
                              background: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                              padding: 8,
                              borderRadius: 8,
                              cursor: 'pointer'
                            }}
                            onClick={() => downloadFile(msg.id, msg.file_name)}
                          >
                            <PaperClipOutlined />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold' }}>{msg.file_name}</div>
                              <div style={{ fontSize: 11 }}>{msg.file_size ? `${(msg.file_size / 1024).toFixed(1)} KB` : ''}</div>
                            </div>
                            <DownloadOutlined />
                          </div>
                        )}
                        
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 4,
                          fontSize: 11,
                          opacity: 0.7
                        }}>
                          <span>{formatMessageTime(msg.created_at)}</span>
                          {isOwnMessage && (
                            <DeleteIcon 
                              style={{ cursor: 'pointer', marginLeft: 8 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMessage(msg.id);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div id="chat-messages-end" />
            </div>
            
            {/* Message Input */}
            <div style={{ 
              borderTop: '1px solid #f0f0f0', 
              padding: '20px 20px 0 20px'
            }}>
              <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                <Tooltip title="Send Image">
                  <Button 
                    icon={<FileImageOutlined />} 
                    onClick={() => handleFileUpload('image')}
                    disabled={sendingMessage}
                  />
                </Tooltip>
                <Tooltip title="Send Audio">
                  <Button 
                    icon={<SoundOutlined />} 
                    onClick={() => handleFileUpload('audio')}
                    disabled={sendingMessage}
                  />
                </Tooltip>
                <Tooltip title="Send Video">
                  <Button 
                    icon={<VideoCameraOutlined />} 
                    onClick={() => handleFileUpload('video')}
                    disabled={sendingMessage}
                  />
                </Tooltip>
                <Tooltip title="Send File">
                  <Button 
                    icon={<PaperClipOutlined />} 
                    onClick={() => handleFileUpload('file')}
                    disabled={sendingMessage}
                  />
                </Tooltip>
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <Input.TextArea
                  rows={2}
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  disabled={sendingMessage}
                />
                <Button 
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sendChatMessage}
                  loading={sendingMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  style={{ height: 'auto', padding: '0 24px', background: '#722ed1' }}
                >
                  Send
                </Button>
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <p style={{ marginTop: 20 }}>Loading chat...</p>
          </div>
        )}
      </Modal>

      {/* ================= FOOTER ================= */}
      <div style={{ 
        marginTop: 40, 
        padding: '20px 0', 
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Text type="secondary">
          Dormitory Clearance System • Verification Only • {new Date().getFullYear()} • 
          <span style={{ marginLeft: 8, color: '#722ed1' }}>
            Total Forms: {stats.total} • Records: {dueStudents.length} • Chats: {chatRooms.length}
          </span>
        </Text>
        <div style={{ marginTop: 10 }}>
          <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
            Note: This system requires verification by dormitory manager. No automatic checking.
          </Text>
        </div>
      </div>
    </div>
  );
}