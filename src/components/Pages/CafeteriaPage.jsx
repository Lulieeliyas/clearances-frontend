import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
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
  Dropdown,
  Menu,
  Checkbox,
  Progress,
  List,
  Avatar,
  Divider,
  Radio,
  Upload,
  Result,
  Timeline
} from "antd";
import { 
  CheckOutlined, 
  CloseOutlined, 
  SearchOutlined,
  MessageOutlined,
  EyeOutlined,
  ReloadOutlined,
  CoffeeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  HistoryOutlined,
  DollarOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  DollarCircleOutlined,
  CheckSquareOutlined,
  CloudUploadOutlined,
  FilterOutlined,
  RiseOutlined,
  FallOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  RocketOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DownloadOutlined,
  UploadOutlined,
  PrinterOutlined,
  FundOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  HeartOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Option } = Select;
const { confirm } = Modal;
const API_BASE = "http://127.0.0.1:8000/api/";

export default function CafeteriaPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

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
  
  // ================= MULTI-SELECT & BATCH PROCESSING =================
  const [selectedForms, setSelectedForms] = useState([]);
  const [batchMode, setBatchMode] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [batchModal, setBatchModal] = useState(false);
  const [batchAction, setBatchAction] = useState('approve');
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, status: 'idle' });
  const [batchResults, setBatchResults] = useState({ success: [], failed: [] });
  const [batchNotes, setBatchNotes] = useState("");
  const [batchPaymentRequired, setBatchPaymentRequired] = useState(false);
  const [batchPaymentAmount, setBatchPaymentAmount] = useState("");
  const [batchPaymentReason, setBatchPaymentReason] = useState("");
  
  // ================= QUEUE MANAGEMENT SYSTEM =================
  const [processingQueue, setProcessingQueue] = useState([]);
  const [queueStatus, setQueueStatus] = useState('idle'); // idle, processing, paused, completed
  const [queueProgress, setQueueProgress] = useState({ current: 0, total: 0 });
  const [queueResults, setQueueResults] = useState({ success: [], failed: [] });
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [autoProcess, setAutoProcess] = useState(false);
  const [bufferSize, setBufferSize] = useState(5);
  const [processingSpeed, setProcessingSpeed] = useState(1000); // ms between batches
  const [queueMetrics, setQueueMetrics] = useState({
    avgProcessingTime: 0,
    successRate: 100,
    queueLength: 0,
    estimatedTimeRemaining: 0,
    processedToday: 0,
    throughput: 0
  });

  // ================= FILTER SYSTEM =================
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    program: '',
    hasDue: false,
    dateRange: null
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // ================= CHAT SYSTEM =================
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // ================= STATISTICS =================
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    withDues: 0
  });
  
  // ================= MEAL DUES REGISTRY =================
  const [duesModal, setDuesModal] = useState(false);
  const [mealDues, setMealDues] = useState({
    has_meal_dues: false,
    dues: [],
    total_amount: 0,
    can_approve: true,
    student_info: null
  });
  const [checkingDues, setCheckingDues] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  
  // ================= MEAL DUES REGISTRATION SYSTEM =================
  const [duesRegistrationModal, setDuesRegistrationModal] = useState(false);
  const [dueStudents, setDueStudents] = useState([]);
  const [dueSearchId, setDueSearchId] = useState("");
  const [dueSearchName, setDueSearchName] = useState("");
  const [loadingDues, setLoadingDues] = useState(false);
  const [registerDueModal, setRegisterDueModal] = useState(false);
  const [editingDue, setEditingDue] = useState(null);

  // ================= PAYMENT VERIFICATION =================
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  // ================= UNIQUE VALUES FOR FILTERS =================
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [programs, setPrograms] = useState([]);

  // ================= AUTH =================
  useEffect(() => {
    const stored = sessionStorage.getItem("ucs_current");
    if (!stored) {
      message.error("Please login first");
      navigate("/login");
      return;
    }
    
    const parsed = JSON.parse(stored);
    if (parsed.role !== "cafeteria") {
      message.error("Access denied. Cafeteria only.");
      navigate("/login");
      return;
    }
    
    setUser(parsed);
    setToken(parsed.token);
    loadForms(parsed.token);
    loadDueStudents();
    loadChatRooms();
    loadPendingPaymentsCount();
  }, [navigate]);

  // ================= LOAD FORMS =================
  const loadForms = async (authToken) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}cafeteria/forms/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      if (res.data && Array.isArray(res.data)) {
        // Add selected flag and due info to each form
        const formsWithFlags = res.data.map(form => ({
          ...form,
          selected: false,
          hasDue: checkIfStudentHasDue(form.id_number),
          dueAmount: calculateTotalAmount(form.id_number)
        }));
        
        setForms(formsWithFlags);
        calculateStats(formsWithFlags);
        
        // Extract unique values for filters
        const depts = [...new Set(formsWithFlags.map(f => f.department_name).filter(Boolean))];
        const yrs = [...new Set(formsWithFlags.map(f => f.year).filter(Boolean))];
        const progs = [...new Set(formsWithFlags.map(f => f.program_level).filter(Boolean))];
        
        setDepartments(depts);
        setYears(yrs);
        setPrograms(progs);
      } else {
        setForms([]);
        calculateStats([]);
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

  // ================= CALCULATE STATS =================
  const calculateStats = (formsList) => {
    const stats = {
      total: formsList.length,
      pending: formsList.filter(f => f.status === "approved_library").length,
      approved: formsList.filter(f => f.status === "approved_cafeteria").length,
      rejected: formsList.filter(f => f.status === "rejected" && f.cafeteria_note).length,
      withDues: formsList.filter(f => checkIfStudentHasDue(f.id_number)).length
    };
    setStats(stats);
  };

  // ================= LOAD PENDING PAYMENTS COUNT =================
  const loadPendingPaymentsCount = async () => {
    if (!token) return;
    
    try {
      const res = await axios.get(`${API_BASE}payment/pending/`, {
        headers: { Authorization: `Token ${token}` }
      });
      if (res.data && Array.isArray(res.data)) {
        const cafeteriaPayments = res.data.filter(payment => 
          payment.department_type === 'cafeteria'
        );
        setPendingPaymentsCount(cafeteriaPayments.length);
      }
    } catch (err) {
      console.error("Error loading pending payments count:", err);
      setPendingPaymentsCount(0);
    }
  };

  // ================= LOAD DUE STUDENTS FROM LOCAL STORAGE =================
  const loadDueStudents = async () => {
    try {
      setLoadingDues(true);
      const savedDues = localStorage.getItem("cafeteria_due_students");
      if (savedDues) {
        setDueStudents(JSON.parse(savedDues));
      } else {
        setDueStudents([]);
      }
    } catch (err) {
      console.error("Error loading due students:", err);
      message.error("Failed to load due students list.");
      setDueStudents([]);
    } finally {
      setLoadingDues(false);
    }
  };

  // ================= SAVE DUE STUDENTS =================
  const saveDueStudents = (dues) => {
    localStorage.setItem("cafeteria_due_students", JSON.stringify(dues));
    setDueStudents(dues);
  };

  // ================= CHECK IF STUDENT HAS DUE =================
  const checkIfStudentHasDue = (studentId) => {
    return dueStudents.some(due => 
      due.student_id === studentId && 
      (due.status === 'overdue' || due.status === 'due_soon')
    );
  };

  // ================= GET STUDENT DUE DETAILS =================
  const getStudentDueDetails = (studentId) => {
    return dueStudents.filter(due => due.student_id === studentId);
  };

  // ================= CALCULATE TOTAL AMOUNT =================
  const calculateTotalAmount = (studentId) => {
    const studentDues = getStudentDueDetails(studentId);
    return studentDues.reduce((total, due) => total + due.amount, 0);
  };

  // ================= REGISTER NEW DUE =================
  const registerNewDue = async (values) => {
    try {
      const newDue = {
        id: Date.now(),
        student_id: values.student_id,
        student_name: values.student_name,
        description: values.description,
        amount: values.amount || 0,
        due_date: values.due_date.format('YYYY-MM-DD'),
        status: dayjs(values.due_date).isBefore(dayjs()) ? 'overdue' : 'due_soon',
        registered_date: dayjs().format('YYYY-MM-DD'),
        registered_by: user?.username || 'cafeteria'
      };

      const updatedDues = [...dueStudents, newDue];
      saveDueStudents(updatedDues);
      
      message.success("Meal due registered successfully!");
      setRegisterDueModal(false);
      form.resetFields();
      
      // Update forms with new due info
      setForms(prev => prev.map(f => ({
        ...f,
        hasDue: checkIfStudentHasDue(f.id_number),
        dueAmount: calculateTotalAmount(f.id_number)
      })));
      
    } catch (err) {
      console.error("Error registering due:", err);
      message.error("Failed to register due.");
    }
  };

  // ================= UPDATE DUE =================
  const updateDue = async (values) => {
    try {
      const updatedDue = {
        ...editingDue,
        student_id: values.student_id,
        student_name: values.student_name,
        description: values.description,
        amount: values.amount || 0,
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
      
      // Update forms with new due info
      setForms(prev => prev.map(f => ({
        ...f,
        hasDue: checkIfStudentHasDue(f.id_number),
        dueAmount: calculateTotalAmount(f.id_number)
      })));
      
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
        
        // Update forms with new due info
        setForms(prev => prev.map(f => ({
          ...f,
          hasDue: checkIfStudentHasDue(f.id_number),
          dueAmount: calculateTotalAmount(f.id_number)
        })));
      }
    });
  };

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

  // ================= CHECK MEAL DUES =================
  const checkMealDues = async (studentId, formId) => {
    try {
      setCheckingDues(true);
      setSelectedStudentId(studentId);
      setSelectedFormId(formId);
      
      const studentDues = getStudentDueDetails(studentId);
      const hasDueInRegistry = checkIfStudentHasDue(studentId);
      const totalAmount = calculateTotalAmount(studentId);
      
      let duesData = {
        has_meal_dues: hasDueInRegistry,
        dues: studentDues.map(due => ({
          id: due.id,
          description: due.description,
          amount: due.amount,
          due_date: due.due_date,
          status: due.status,
          registered_by: due.registered_by,
          registered_date: due.registered_date
        })),
        total_amount: totalAmount,
        can_approve: !hasDueInRegistry,
        student_info: {
          student_name: forms.find(f => f.id_number === studentId)?.full_name || studentId,
          id_number: studentId,
          email: forms.find(f => f.id_number === studentId)?.student_email || 'N/A'
        },
        check_source: "manual_registry",
        checked_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        checked_by: user?.username
      };
      
      setMealDues({
        ...duesData,
        form_id: formId
      });
      setDuesModal(true);
      
      notification.info({
        message: 'Meal Dues Check',
        description: hasDueInRegistry 
          ? `Found ${studentDues.length} due(s) totaling $${totalAmount.toFixed(2)}`
          : 'No meal dues found in registry',
        duration: 5,
      });
      
      return duesData;
      
    } catch (err) {
      console.error("Check meal dues error:", err);
      message.error("Could not check meal dues from registry.");
      return null;
    } finally {
      setCheckingDues(false);
    }
  };

  // ================= CHAT FUNCTIONS =================
const loadChatRooms = async (retryCount = 0) => {
  try {
    console.log("Loading chat rooms with token:", token ? "Token exists" : "No token");
    
    if (!token) {
      console.error("No token available");
      // Try to get token from session storage again
      const stored = sessionStorage.getItem("ucs_current");
      if (stored) {
        const parsed = JSON.parse(stored);
        setToken(parsed.token);
        // Retry with new token
        setTimeout(() => loadChatRooms(), 500);
      }
      return;
    }
    
    const response = await axios.get(`${API_BASE}chat/cafeteria/rooms/`, {
      headers: { Authorization: `Token ${token}` }
    });
    
    setChatRooms(response.data);
  } catch (err) {
    console.error('Failed to load chat rooms:', err);
    
    // Retry logic for 401 errors
    if (err.response?.status === 401 && retryCount < 3) {
      console.log(`Retrying chat rooms load (attempt ${retryCount + 1})...`);
      setTimeout(() => loadChatRooms(retryCount + 1), 1000);
    }
  }
};

const loadStudentsForChat = async () => {
  try {
    setLoadingStudents(true);
    const response = await axios.get(`${API_BASE}chat/cafeteria/students/`, {
      headers: { Authorization: `Token ${token}` }
    });
    setStudentsList(response.data.students || []);
  } catch (err) {
    console.error('Failed to load students:', err);
  } finally {
    setLoadingStudents(false);
  }
};
const loadChatMessages = async (roomId) => {
  try {
    setLoadingChat(true);
    const response = await axios.get(`${API_BASE}chat/cafeteria/messages/${roomId}/`, {
      headers: { Authorization: `Token ${token}` }
    });
    setChatMessages(response.data.messages || []);
  } catch (err) {
    console.error('Failed to load messages:', err);
  } finally {
    setLoadingChat(false);
  }
};
const startChatWithStudent = async (studentId) => {
  try {
    const response = await axios.post(`${API_BASE}chat/cafeteria/start/`, 
      { student_id: studentId },
      { headers: { Authorization: `Token ${token}` } }
    );
    
    if (response.data.chat_room) {
      setChatRooms(prev => [response.data.chat_room, ...prev]);
      setSelectedChatRoom(response.data.chat_room);
      await loadChatMessages(response.data.chat_room.id);
      message.success('Chat started successfully');
    }
  } catch (err) {
    console.error('Failed to start chat:', err);
    message.error(err.response?.data?.error || 'Failed to start chat');
  }
};
const sendChatMessage = async () => {
  if (!newChatMessage.trim() || !selectedChatRoom) return;
  
  try {
    const response = await axios.post(`${API_BASE}chat/cafeteria/send/`, {
      room_id: selectedChatRoom.id,
      content: newChatMessage
    }, {
      headers: { Authorization: `Token ${token}` }
    });
    
    setChatMessages(prev => [...prev, response.data]);
    setNewChatMessage('');
  } catch (err) {
    console.error('Failed to send message:', err);
    message.error('Failed to send message');
  }
};



  // Load chat rooms when component mounts
  useEffect(() => {
    if (token) {
      loadChatRooms();
    }
  }, [token]);




  // Load messages when room is selected
  useEffect(() => {
    if (selectedChatRoom) {
      loadChatMessages(selectedChatRoom.id);
      const interval = setInterval(() => {
        loadChatMessages(selectedChatRoom.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChatRoom]);


useEffect(() => {
  calculateStats(forms);
}, [forms, dueStudents]);
  // ================= MULTI-SELECT FUNCTIONS =================
  const toggleSelectForm = (formId) => {
    setSelectedForms(prev => {
      if (prev.includes(formId)) {
        return prev.filter(id => id !== formId);
      } else {
        return [...prev, formId];
      }
    });
    
    // Update form selected flag
    setForms(prev => prev.map(f => 
      f.id === formId ? { ...f, selected: !f.selected } : f
    ));
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedForms([]);
      setSelectAll(false);
      setForms(prev => prev.map(f => ({ ...f, selected: false })));
    } else {
      const pendingForms = filteredForms
        .filter(f => f.status === "approved_library")
        .map(f => f.id);
      setSelectedForms(pendingForms);
      setSelectAll(true);
      setForms(prev => prev.map(f => 
        f.status === "approved_library" ? { ...f, selected: true } : f
      ));
    }
  };

  const clearSelection = () => {
    setSelectedForms([]);
    setSelectAll(false);
    setForms(prev => prev.map(f => ({ ...f, selected: false })));
  };

  // ================= QUEUE MANAGEMENT FUNCTIONS =================
  const addToQueue = (formIds) => {
    const formsToAdd = forms.filter(f => formIds.includes(f.id));
    setProcessingQueue(prev => [...prev, ...formsToAdd]);
    setQueueProgress({ current: 0, total: processingQueue.length + formsToAdd.length });
    
    message.success(`${formsToAdd.length} form(s) added to processing queue`);
    
    if (autoProcess && queueStatus === 'idle') {
      startQueueProcessing();
    }
  };

  const removeFromQueue = (formId) => {
    setProcessingQueue(prev => prev.filter(f => f.id !== formId));
    updateQueueMetrics();
  };

  const clearQueue = () => {
    setProcessingQueue([]);
    setQueueProgress({ current: 0, total: 0 });
    setQueueResults({ success: [], failed: [] });
    setQueueStatus('idle');
  };

  const startQueueProcessing = () => {
    if (processingQueue.length === 0) {
      message.warning("Queue is empty");
      return;
    }
    
    setQueueStatus('processing');
    setQueueProgress({ current: 0, total: processingQueue.length });
    setQueueResults({ success: [], failed: [] });
    
    processNextQueueBatch();
  };

  const pauseQueueProcessing = () => {
    setQueueStatus('paused');
  };

  const resumeQueueProcessing = () => {
    setQueueStatus('processing');
    processNextQueueBatch();
  };

  const stopQueueProcessing = () => {
    setQueueStatus('idle');
  };

  const processNextQueueBatch = () => {
    if (queueStatus !== 'processing') return;
    
    const batch = processingQueue.slice(0, bufferSize);
    
    if (batch.length === 0) {
      setQueueStatus('completed');
      updateQueueMetrics();
      notification.success({
        message: 'Queue Processing Complete',
        description: `Successfully processed ${queueResults.success.length} forms, ${queueResults.failed.length} failed.`,
        duration: 5
      });
      return;
    }
    
    setQueueProgress(prev => ({
      ...prev,
      current: prev.total - processingQueue.length + batch.length
    }));
    
    Promise.all(batch.map(form => processQueueItem(form)))
      .then(() => {
        setProcessingQueue(prev => prev.slice(batch.length));
        
        if (queueStatus === 'processing') {
          setTimeout(processNextQueueBatch, processingSpeed);
        }
      });
  };

  const processQueueItem = async (form) => {
    try {
      const hasDue = checkIfStudentHasDue(form.id_number);
      
      if (hasDue) {
        const res = await axios.patch(
          `${API_BASE}cafeteria/action/${form.id}/`,
          { 
            action: "reject", 
            note: "Auto-rejected by queue: Student has outstanding meal dues"
          },
          { headers: { Authorization: `Token ${token}` } }
        );
        
        setQueueResults(prev => ({
          ...prev,
          failed: [...prev.failed, { 
            id: form.id, 
            name: form.full_name,
            error: "Has outstanding dues"
          }]
        }));
        
        setForms(prev => prev.map(f => 
          f.id === form.id ? { 
            ...f, 
            status: "rejected", 
            cafeteria_note: res.data.note,
            selected: false 
          } : f
        ));
        
      } else {
        const res = await axios.patch(
          `${API_BASE}cafeteria/action/${form.id}/`,
          { 
            action: "approve", 
            note: "Auto-approved via queue processing - No meal dues found"
          },
          { headers: { Authorization: `Token ${token}` } }
        );
        
        setQueueResults(prev => ({
          ...prev,
          success: [...prev.success, { id: form.id, name: form.full_name }]
        }));
        
        setForms(prev => prev.map(f => 
          f.id === form.id ? { 
            ...f, 
            status: "approved_cafeteria", 
            cafeteria_note: res.data.note,
            selected: false 
          } : f
        ));
      }
      
    } catch (err) {
      setQueueResults(prev => ({
        ...prev,
        failed: [...prev.failed, { 
          id: form.id, 
          name: form.full_name,
          error: err.response?.data?.error || err.message
        }]
      }));
    }
    
    updateQueueMetrics();
  };

  const updateQueueMetrics = () => {
    const totalProcessed = queueResults.success.length + queueResults.failed.length;
    const successRate = totalProcessed > 0
      ? (queueResults.success.length / totalProcessed) * 100
      : 100;
    
    const throughput = bufferSize * (60000 / processingSpeed);
    
    setQueueMetrics({
      avgProcessingTime: processingSpeed,
      successRate: successRate,
      queueLength: processingQueue.length,
      estimatedTimeRemaining: (processingQueue.length / bufferSize) * processingSpeed,
      processedToday: totalProcessed,
      throughput: throughput
    });
  };

  // ================= BATCH PROCESSING =================
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
      
      for (let i = 0; i < selectedForms.length; i++) {
        const formId = selectedForms[i];
        const form = forms.find(f => f.id === formId);
        
        try {
          setBatchProgress(prev => ({ ...prev, current: i + 1 }));
          
          // Check if student has dues
          const hasDue = checkIfStudentHasDue(form.id_number);
          
          if (hasDue && batchAction === 'approve') {
            results.failed.push({
              id: formId,
              name: form.full_name,
              reason: 'Student has outstanding meal dues'
            });
            continue;
          }
          
          const payload = {
            action: batchAction,
            note: batchNotes || `Batch ${batchAction} by Cafeteria`
          };
          
          if (batchAction === 'reject' && batchPaymentRequired) {
            payload.requires_payment = true;
            payload.payment_amount = parseFloat(batchPaymentAmount);
            payload.payment_reason = batchPaymentReason || 'Payment required for meal dues';
          }
          
          const res = await axios.patch(
            `${API_BASE}cafeteria/action/${formId}/`,
            payload,
            { headers: { Authorization: `Token ${token}` } }
          );
          
          results.success.push({
            id: formId,
            name: form.full_name,
            message: res.data.message || `${batchAction} successful`
          });
          
          // Update local state
          setForms(prev => prev.map(f => {
            if (f.id === formId) {
              const newStatus = batchAction === 'approve' ? 'approved_cafeteria' : 'rejected';
              return { 
                ...f, 
                status: newStatus,
                cafeteria_note: batchNotes || f.cafeteria_note,
                selected: false
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

  // ================= FILTER FUNCTIONS =================
  const getFilteredForms = () => {
    let filtered = forms;
    
    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.department) {
      filtered = filtered.filter(f => f.department_name === filters.department);
    }
    
    if (filters.year) {
      filtered = filtered.filter(f => f.year === filters.year);
    }
    
    if (filters.program) {
      filtered = filtered.filter(f => f.program_level === filters.program);
    }
    
    if (filters.hasDue) {
      filtered = filtered.filter(f => checkIfStudentHasDue(f.id_number));
    }
    
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(f => {
        const date = dayjs(f.created_at);
        return date.isAfter(filters.dateRange[0]) && date.isBefore(filters.dateRange[1]);
      });
    }
    
    return filtered;
  };

  const filteredForms = getFilteredForms();

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
        title: 'Confirm Meal Dues Verification',
        content: (
          <div>
            <p>Have you verified this student's meal dues status?</p>
            <Alert
              message="Important:"
              description="After approval, this form will be sent to the Psychology department for final clearance."
              type="info"
              showIcon
              style={{ marginTop: 10 }}
            />
          </div>
        ),
        okText: 'Yes, Verified - Approve',
        cancelText: 'No, Check First',
        onOk: async () => {
          try {
            const note = "Approved by Cafeteria - No meal dues";
            const res = await axios.patch(
              `${API_BASE}cafeteria/action/${formId}/`,
              { action: "approve", note: note },
              { headers: { Authorization: `Token ${token}` } }
            );
            
            setForms(prev => prev.map(f => 
              f.id === formId ? { 
                ...f, 
                status: "approved_cafeteria", 
                cafeteria_note: res.data.note,
                selected: false 
              } : f
            ));
            
            message.success("Form approved successfully!.");
            
            notification.success({
              message: 'Approval Complete',
              description: 'Form has been verifid.',
              duration: 5,
            });
            
            setTimeout(() => loadForms(token), 1000);
            
          } catch (apiErr) {
            message.error(apiErr.response?.data?.error || "Approval failed.");
          }
        }
      });
      
    } catch (err) {
      console.error("Approve error:", err);
      message.error("An error occurred.");
    } finally {
      setActionLoading(prev => ({ ...prev, [formId]: false }));
    }
  };

  // ================= OPEN REJECT MODAL =================
  const openRejectModal = (formId, studentId) => {
    setSelectedFormId(formId);
    setSelectedStudentId(studentId);
    setRejectModal(true);
    setRejectAction('reject_only');
    setPaymentAmount("");
    setPaymentReason("");
  };

  // ================= HANDLE REJECT FORM =================
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
        `${API_BASE}cafeteria/action/${selectedFormId}/`,
        payload,
        { headers: { Authorization: `Token ${token}` } }
      );
      
      message.success(res.data.message || "Form rejected successfully");
      
      setForms(prev => prev.map(f => {
        if (f.id === selectedFormId) {
          return { 
            ...f, 
            status: res.data.status || "rejected",
            cafeteria_note: res.data.note || rejectNote.trim(),
            selected: false
          };
        }
        return f;
      }));
      
      if (rejectAction === 'require_payment') {
        notification.info({
          message: 'Payment Required',
          description: 'Student will receive payment instructions.',
        });
      } else {
        notification.error({
          message: 'Form Rejected',
          description: 'Form has been rejected and sent back to student.',
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
      message.error(err.response?.data?.error || "Rejection failed");
    }
  };

  // ================= QUICK APPROVE AFTER DUES CHECK =================
  const quickApproveAfterDuesCheck = async () => {
    if (!mealDues.form_id || !selectedStudentId) return;
    
    try {
      Modal.confirm({
        title: 'Confirm Verification',
        content: 'Have you verified this student has no meal dues? After approval, form goes to Psychology.',
        onOk: async () => {
          const note = "Approved by Cafeteria after manual meal dues verification";
          const res = await axios.patch(
            `${API_BASE}cafeteria/action/${mealDues.form_id}/`,
            { action: "approve", note: note },
            { headers: { Authorization: `Token ${token}` } }
          );
          
          setForms(prev => prev.map(f => 
            f.id === mealDues.form_id ? { 
              ...f, 
              status: "approved_cafeteria",
              cafeteria_note: res.data.note || note,
              selected: false
            } : f
          ));
          
          message.success("Form approved!");
          setDuesModal(false);
          
          notification.success({
            message: 'success',
            description: 'Form has been sent to the approprait Departments.',
            duration: 4,
          });
          
          setTimeout(() => loadForms(token), 1000);
        }
      });
      
    } catch (err) {
      console.error("Quick approve error:", err);
      message.error("Failed to approve. Please try again.");
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    sessionStorage.clear();
    localStorage.removeItem("ucs_user");
    message.success("Logged out successfully");
    navigate("/login");
  };

  // ================= RENDER STATUS =================
  const renderStatus = (status) => {
    switch(status) {
      case "approved_cafeteria":
        return (
          <Badge 
            status="success" 
            text={
              <Space>
                <CheckCircleOutlined />
                <span style={{ fontWeight: 'bold' }}>APPROVED</span>
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
              </Space>
            }
          />
        );
      case "approved_library":
        return (
          <Badge 
            status="processing" 
            text={
              <Space>
                <ClockCircleOutlined />
                <span style={{ fontWeight: 'bold' }}>PENDING</span>
                <Tag color="orange">Cafeteria Check</Tag>
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
    const currentStep = form.status === "approved_library" ? 2 : 
                      form.status === "approved_cafeteria" ? 3 : 0;
    
    return (
      <Steps size="small" current={currentStep} style={{ marginTop: 20 }}>
        <Step title="Dept. Head" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Library" description="Approved" icon={<CheckCircleOutlined />} />
        <Step 
          title="Cafeteria" 
          description={
            form.status === "approved_cafeteria" ? "Verified" : 
            form.status === "rejected" ? "Rejected" : "Check Needed"
          } 
          icon={
            form.status === "approved_cafeteria" ? <CheckCircleOutlined /> : 
            form.status === "rejected" ? <CloseCircleOutlined /> : <CoffeeOutlined />
          }
        />
        <Step 
          title="Psychology" 
          description={form.status === "approved_cafeteria" ? "Waiting" : "Not Yet"} 
          icon={<HeartOutlined />}
        />
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'overdue' ? 'red' : 'orange'}
          icon={status === 'overdue' ? <WarningOutlined /> : <ClockCircleOutlined />}
        >
          {status === 'overdue' ? 'OVERDUE' : 'DUE SOON'}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong type={amount > 0 ? "danger" : "success"}>
          <DollarOutlined /> ${amount.toFixed(2)}
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
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Student Name',
      dataIndex: 'student_name',
      key: 'student_name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'overdue' ? 'red' : 'orange'}
          icon={status === 'overdue' ? <WarningOutlined /> : <ClockCircleOutlined />}
        >
          {status === 'overdue' ? 'OVERDUE' : 'DUE SOON'}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong type="danger">
          <DollarOutlined /> ${amount.toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  student_id: record.student_id,
                  student_name: record.student_name,
                  description: record.description,
                  amount: record.amount,
                  due_date: dayjs(record.due_date)
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
              onClick={() => deleteDue(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ================= RENDER FORM CARD =================
  const renderFormCard = (form) => {
    const isPending = form.status === "approved_library";
    const isApproved = form.status === "approved_cafeteria";
    const isRejected = form.status === "rejected";
    
    const hasDue = checkIfStudentHasDue(form.id_number);
    const studentDues = getStudentDueDetails(form.id_number);
    const totalDue = calculateTotalAmount(form.id_number);
    
    return (
      <Card
        key={form.id}
        hoverable
        style={{
          marginBottom: 15,
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderLeft: `5px solid ${
            isApproved ? "#52c41a" :
            isRejected ? "#ff4d4f" :
            hasDue ? "#faad14" : "#faad14"
          }`,
          transition: 'all 0.3s',
          background: form.selected ? '#e6f7ff' : (hasDue ? '#fff7e6' : 'white'),
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
                <Tooltip title={`Student has ${studentDues.length} meal due(s) totaling $${totalDue.toFixed(2)}`}>
                  <WarningOutlined style={{ color: '#faad14' }} />
                </Tooltip>
              )}
            </Space>
            {renderStatus(form.status)}
          </div>
        }
        extra={
          <Space>
            <Tooltip title="Add to Queue">
              <Button 
                type="link" 
                icon={<CloudUploadOutlined />}
                style={{ color: '#722ed1' }}
                onClick={(e) => {
                  e.stopPropagation();
                  addToQueue([form.id]);
                }}
              />
            </Tooltip>
            <Tooltip title="View Details">
              <Button type="link" icon={<EyeOutlined />} onClick={(e) => {
                e.stopPropagation();
                viewFormDetails(form);
              }} />
            </Tooltip>
          </Space>
        }
        onClick={() => {
          if (batchMode && isPending) {
            toggleSelectForm(form.id);
          } else {
            viewFormDetails(form);
          }
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" size="small">
              <Text><IdcardOutlined /> ID: {form.id_number}</Text>
              <Text><MailOutlined /> Email: {form.student_email || 'N/A'}</Text>
              <Text><FileTextOutlined /> Dept: {form.department_name}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size="small">
              <Text>Year/Semester: {form.year} / {form.semester}</Text>
              <Text>Program: {form.program_level}</Text>
              <Text type="secondary">
                <HistoryOutlined /> Submitted: {dayjs(form.created_at).format('MMM D, YYYY HH:mm')}
              </Text>
            </Space>
          </Col>
        </Row>
        
        {hasDue && (
          <Alert
            message="Registered Meal Dues"
            description={
              <div>
                <p>Student has {studentDues.length} registered meal due(s) totaling ${totalDue.toFixed(2)}</p>
                <ul>
                  {studentDues.map(due => (
                    <li key={due.id}>
                      {due.description} - ${due.amount.toFixed(2)} ({due.status})
                    </li>
                  ))}
                </ul>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginTop: 10 }}
          />
        )}
        
        {renderClearanceFlow(form)}
        
        {form.library_note && (
          <Alert message="Librarian Note" description={form.library_note} type="info" showIcon style={{ marginTop: 15 }} />
        )}
        
        {isPending && !batchMode && (
          <Space style={{ marginTop: 15, width: '100%', justifyContent: 'center' }}>
            <Tooltip title="Check Meal Dues Registry">
              <Button
                type="primary"
                icon={<CoffeeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  checkMealDues(form.student_id || form.id_number, form.id);
                }}
                loading={checkingDues && selectedStudentId === (form.student_id || form.id_number)}
                style={{ background: "#faad14", borderColor: "#faad14" }}
              >
                Check Dues
              </Button>
            </Tooltip>
            
            <Popconfirm
              title="Verify Meal Dues"
              description="After approval, form goes to Psychology. Continue?"
              onConfirm={() => approveForm(form.id, form.student_id || form.id_number)}
              okText="Yes, Approve"
              cancelText="Cancel"
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={actionLoading[form.id]}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                disabled={hasDue}
              >
                Approve
              </Button>
            </Popconfirm>
            
            <Popconfirm
              title="Reject Clearance"
              description="Are you sure you want to reject this form?"
              onConfirm={() => openRejectModal(form.id, form.student_id || form.id_number)}
              okText="Yes, Reject"
              cancelText="Cancel"
            >
              <Button danger icon={<CloseOutlined />}>
                Reject
              </Button>
            </Popconfirm>
          </Space>
        )}
        
        {form.cafeteria_note && (
          <Alert
            message="Cafeteria Action"
            description={form.cafeteria_note}
            type={isRejected ? "error" : "success"}
            showIcon
            style={{ marginTop: 10 }}
          />
        )}
      </Card>
    );
  };

  // ================= RENDER QUEUE MODAL =================
  const renderQueueModal = () => {
    return (
      <Modal
        title={
          <Space>
            <CloudUploadOutlined />
            <span>Queue Management System</span>
            {queueStatus === 'processing' && <Badge status="processing" text="Processing" />}
            {queueStatus === 'paused' && <Badge status="warning" text="Paused" />}
            {queueStatus === 'completed' && <Badge status="success" text="Completed" />}
          </Space>
        }
        open={showQueueModal}
        onCancel={() => setShowQueueModal(false)}
        footer={null}
        width={900}
      >
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Queue Length"
                value={processingQueue.length}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Success Rate"
                value={queueMetrics.successRate}
                precision={1}
                suffix="%"
                prefix={queueMetrics.successRate > 80 ? <RiseOutlined style={{ color: '#52c41a' }} /> : <FallOutlined style={{ color: '#ff4d4f' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Throughput"
                value={queueMetrics.throughput}
                precision={0}
                suffix="/min"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Est. Time"
                value={Math.ceil(queueMetrics.estimatedTimeRemaining / 1000)}
                suffix="sec"
              />
            </Card>
          </Col>
        </Row>

        <Card size="small" style={{ marginBottom: 20 }}>
          <Row gutter={16} align="middle">
            <Col span={12}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={startQueueProcessing}
                  disabled={queueStatus === 'processing' || processingQueue.length === 0}
                >
                  Start
                </Button>
                <Button
                  icon={<PauseCircleOutlined />}
                  onClick={pauseQueueProcessing}
                  disabled={queueStatus !== 'processing'}
                >
                  Pause
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={resumeQueueProcessing}
                  disabled={queueStatus !== 'paused'}
                >
                  Resume
                </Button>
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={stopQueueProcessing}
                  disabled={queueStatus === 'idle'}
                >
                  Stop
                </Button>
              </Space>
            </Col>
            <Col span={12}>
              <Space style={{ float: 'right' }}>
                <Text>Batch Size:</Text>
                <Select 
                  value={bufferSize} 
                  onChange={setBufferSize}
                  style={{ width: 80 }}
                >
                  <Option value={1}>1</Option>
                  <Option value={3}>3</Option>
                  <Option value={5}>5</Option>
                  <Option value={10}>10</Option>
                </Select>
                <Text>Speed:</Text>
                <Select 
                  value={processingSpeed} 
                  onChange={setProcessingSpeed}
                  style={{ width: 100 }}
                >
                  <Option value={500}>Fast</Option>
                  <Option value={1000}>Normal</Option>
                  <Option value={2000}>Slow</Option>
                </Select>
                <Button onClick={clearQueue} danger>
                  Clear
                </Button>
              </Space>
            </Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col span={24}>
              <Checkbox 
                checked={autoProcess}
                onChange={(e) => setAutoProcess(e.target.checked)}
              >
                Auto-start processing when items are added
              </Checkbox>
            </Col>
          </Row>
        </Card>

        {queueProgress.total > 0 && (
          <div style={{ marginBottom: 20 }}>
            <Progress 
              percent={Math.round((queueProgress.current / queueProgress.total) * 100)} 
              status={queueStatus === 'processing' ? "active" : (queueStatus === 'completed' ? "success" : "normal")}
            />
            <div style={{ textAlign: 'center', marginTop: 5 }}>
              <Text type="secondary">
                Processed: {queueProgress.current} of {queueProgress.total}
              </Text>
            </div>
          </div>
        )}

        <Tabs defaultActiveKey="1">
          <TabPane tab={`Queue (${processingQueue.length})`} key="1">
            <List
              size="small"
              bordered
              dataSource={processingQueue}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => removeFromQueue(item.id)}
                    >
                      Remove
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.full_name}
                    description={
                      <Space>
                        <Text type="secondary">{item.id_number}</Text>
                        {checkIfStudentHasDue(item.id_number) && (
                          <Tag color="warning">Has Dues</Tag>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab={`Success (${queueResults.success.length})`} key="2">
            <List
              size="small"
              bordered
              dataSource={queueResults.success}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />}
                    title={item.name}
                  />
                  <Tag color="green">Approved</Tag>
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab={`Failed (${queueResults.failed.length})`} key="3">
            <List
              size="small"
              bordered
              dataSource={queueResults.failed}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} />}
                    title={item.name}
                    description={item.error}
                  />
                  <Tag color="red">Failed</Tag>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  // ================= PAYMENT VERIFICATION DROPDOWN MENU =================
  const paymentVerificationMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === "payment-verification") {
          sessionStorage.setItem("payment_verification_dept", "cafeteria");
          navigate("/staff/payments");
        }
        if (key === "clearance-forms") {
          loadForms(token);
        }
        if (key === "dues-registry") {
          setDuesRegistrationModal(true);
        }
        if (key === "queue-manager") {
          setShowQueueModal(true);
        }
      }}
      items={[
        {
          key: 'payment-verification',
          label: (
            <Space>
              <CheckSquareOutlined />
              <span>Payment Verification</span>
              {pendingPaymentsCount > 0 && (
                <Badge count={pendingPaymentsCount} size="small" />
              )}
            </Space>
          ),
        },
        {
          key: 'clearance-forms',
          label: (
            <Space>
              <FileTextOutlined />
              <span>Clearance Forms</span>
              {stats.pending > 0 && (
                <Badge count={stats.pending} size="small" />
              )}
            </Space>
          ),
        },
        {
          key: 'dues-registry',
          label: (
            <Space>
              <DatabaseOutlined />
              <span>Dues Registry</span>
              {dueStudents.length > 0 && (
                <Badge count={dueStudents.length} size="small" />
              )}
            </Space>
          ),
        },
        {
          key: 'queue-manager',
          label: (
            <Space>
              <CloudUploadOutlined />
              <span>Queue Manager</span>
              {processingQueue.length > 0 && (
                <Badge count={processingQueue.length} size="small" />
              )}
            </Space>
          ),
        },
      ]}
    />
  );

  return (
    <div style={{ padding: 30, maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <Card 
        style={{ 
          marginBottom: 30,
          borderRadius: 15,
          background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
          color: 'white',
          boxShadow: '0 8px 25px rgba(250, 173, 20, 0.3)'
        }}
        bodyStyle={{ padding: '20px 30px' }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                <CoffeeOutlined /> Cafeteria Clearance System
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
                Welcome, {user?.username || 'Cafeteria Officer'}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              <Badge count={processingQueue.length} offset={[-5, 5]} style={{ background: '#722ed1' }}>
                <Button 
                  icon={<CloudUploadOutlined />}
                  onClick={() => setShowQueueModal(true)}
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    border: 'none'
                  }}
                >
                  Queue
                </Button>
              </Badge>
              
              <Button 
                icon={<UserOutlined />}
                onClick={() => navigate("/profile")}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
              >
                My Profile
              </Button>
              
              <Dropdown overlay={paymentVerificationMenu} placement="bottomRight" trigger={['click', 'hover']}>
                <Button
                  type="primary"
                  icon={<DollarCircleOutlined />}
                  style={{ 
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', 
                    borderColor: '#52c41a',
                    fontWeight: 'bold',
                    height: '40px'
                  }}
                >
                  <Space>
                    <CheckSquareOutlined />
                    <span>Actions</span>
                    {(pendingPaymentsCount > 0 || processingQueue.length > 0) && (
                      <Badge 
                        count={pendingPaymentsCount + processingQueue.length} 
                        size="small"
                        style={{ backgroundColor: '#ff4d4f' }}
                      />
                    )}
                  </Space>
                </Button>
              </Dropdown>
              
              <Button 
                onClick={() => setDuesRegistrationModal(true)}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
              >
                <Space>
                  <DatabaseOutlined />
                  <span>Dues Registry</span>
                  {dueStudents.length > 0 && (
                    <Badge count={dueStudents.length} size="small" style={{ backgroundColor: '#ff4d4f' }} />
                  )}
                </Space>
              </Button>
              
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => {
                  loadForms(token);
                  loadPendingPaymentsCount();
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

{/* Stats Cards - Updated Version */}
<Row gutter={16} style={{ marginBottom: 30 }}>
  <Col xs={24} sm={12} md={4}>
    <Card hoverable style={{ textAlign: 'center', borderRadius: 10, border: '2px solid #1890ff' }}>
      <Statistic 
        title="Total Forms" 
        value={stats.total} 
        valueStyle={{ color: '#1890ff', fontSize: '28px' }} 
        prefix={<FileTextOutlined />} 
      />
      <Text type="secondary">All clearance forms</Text>
    </Card>
  </Col>
  
  <Col xs={24} sm={12} md={4}>
    <Card hoverable style={{ textAlign: 'center', borderRadius: 10, border: '2px solid #faad14' }}>
      <Statistic 
        title="Pending Check" 
        value={stats.pending} 
        valueStyle={{ color: '#faad14', fontSize: '28px' }} 
        prefix={<ClockCircleOutlined />} 
      />
      <Text type="secondary">Need meal dues check</Text>
    </Card>
  </Col>
  
  <Col xs={24} sm={12} md={4}>
    <Card hoverable style={{ textAlign: 'center', borderRadius: 10, border: '2px solid #52c41a' }}>
      <Statistic 
        title="Approved" 
        value={stats.approved} 
        valueStyle={{ color: '#52c41a', fontSize: '28px' }} 
        prefix={<CheckCircleOutlined />} 
      />
    </Card>
  </Col>
  
  <Col xs={24} sm={12} md={4}>
    <Card hoverable style={{ textAlign: 'center', borderRadius: 10, border: '2px solid #ff4d4f' }}>
      <Statistic 
        title="Rejected" 
        value={stats.rejected} 
        valueStyle={{ color: '#ff4d4f', fontSize: '28px' }} 
        prefix={<CloseCircleOutlined />} 
      />
      <Text type="secondary">Returned to students</Text>
    </Card>
  </Col>
  
  <Col xs={24} sm={12} md={4}>
    <Card hoverable style={{ textAlign: 'center', borderRadius: 10, border: '2px solid #722ed1' }}>
      <Statistic 
        title="With Dues" 
        value={stats.withDues} 
        valueStyle={{ color: '#722ed1', fontSize: '28px' }} 
        prefix={<WarningOutlined />} 
      />
      <Text type="secondary">Students with meal dues</Text>
    </Card>
  </Col>
</Row>

      {/* Main Tabs */}
      <Tabs defaultActiveKey="1" style={{ marginBottom: 20 }}>
        <TabPane 
          tab={
            <span>
              <CoffeeOutlined /> Clearance Forms 
              {stats.pending > 0 && <Badge count={stats.pending} style={{ marginLeft: 8 }} />}
            </span>
          } 
          key="1"
        >
          {/* Batch Processing Controls */}
          <Card style={{ marginBottom: 20, borderRadius: 10, background: '#fff7e6' }}>
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
                        indeterminate={selectedForms.length > 0 && selectedForms.length < filteredForms.filter(f => f.status === "approved_library").length}
                      >
                        Select All ({selectedForms.length} / {filteredForms.filter(f => f.status === "approved_library").length})
                      </Checkbox>
                      
                      <Button 
                        icon={<CheckOutlined />} 
                        type="primary" 
                        style={{ background: "#52c41a" }}
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
                        icon={<CloudUploadOutlined />}
                        onClick={() => {
                          addToQueue(selectedForms);
                          clearSelection();
                        }}
                        disabled={selectedForms.length === 0}
                        style={{ background: '#722ed1', color: 'white' }}
                      >
                        Add to Queue ({selectedForms.length})
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
                  <Button 
                    icon={<FilterOutlined />}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filters
                  </Button>
                  
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
            
            {/* Filters */}
            {showFilters && (
              <div style={{ marginTop: 20 }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Select
                      placeholder="Filter by Department"
                      style={{ width: '100%' }}
                      allowClear
                      onChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                    >
                      {departments.map(dept => (
                        <Option key={dept} value={dept}>{dept}</Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="Filter by Year"
                      style={{ width: '100%' }}
                      allowClear
                      onChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
                    >
                      {years.map(year => (
                        <Option key={year} value={year}>{year}</Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="Filter by Program"
                      style={{ width: '100%' }}
                      allowClear
                      onChange={(value) => setFilters(prev => ({ ...prev, program: value }))}
                    >
                      {programs.map(prog => (
                        <Option key={prog} value={prog}>{prog}</Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Checkbox
                      onChange={(e) => setFilters(prev => ({ ...prev, hasDue: e.target.checked }))}
                    >
                      Show only students with dues
                    </Checkbox>
                  </Col>
                </Row>
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <Button type="link" onClick={() => setFilters({
                    department: '',
                    year: '',
                    program: '',
                    hasDue: false,
                    dateRange: null
                  })}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Alert
            message="CLEARANCE PROCEDURE"
            description={
              <Space direction="vertical" size={8}>
                <Paragraph>
                  <ol>
                    <li>Check meal dues registry for any outstanding payments</li>
                    <li>Verify student's meal account status</li>
                    <li>Approve only if no meal dues are found</li>
                    <li>Approved forms are automatically sent to Psychology department</li>
                    <li>Use queue system for automated batch processing</li>
                  </ol>
                </Paragraph>
              </Space>
            }
            type="info"
            showIcon
            style={{ marginBottom: 20, borderRadius: 10 }}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Spin size="large" />
              <p style={{ marginTop: 20 }}>Loading forms from library...</p>
            </div>
          ) : filteredForms.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 60 }}>
              <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
              <Title level={4} type="secondary">No forms awaiting cafeteria clearance</Title>
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

        <TabPane tab={<span><MessageOutlined /> Live Chat with Students</span>} key="chat">
          <div style={{ display: 'flex', gap: '20px', minHeight: '600px' }}>
            {/* Left Sidebar */}
            <div style={{ width: '350px', background: 'white', borderRadius: '10px', padding: '15px' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  loadStudentsForChat();
                  setShowChatModal(true);
                }}
                style={{ marginBottom: '15px', width: '100%' }}
              >
                Start New Chat
              </Button>
              
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {chatRooms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                    <MessageOutlined style={{ fontSize: '40px' }} />
                    <p>No active chats</p>
                  </div>
                ) : (
                  chatRooms.map(room => (
                    <Card
                      key={room.id}
                      size="small"
                      style={{ 
                        marginBottom: '10px', 
                        cursor: 'pointer',
                        background: selectedChatRoom?.id === room.id ? '#fff7e6' : 'white',
                        borderColor: selectedChatRoom?.id === room.id ? '#faad14' : '#f0f0f0'
                      }}
                      onClick={() => setSelectedChatRoom(room)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <Text strong>{room.student?.full_name || 'Student'}</Text>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {room.student?.id_number || ''}
                          </div>
                        </div>
                        {room.unread_count > 0 && (
                          <Badge count={room.unread_count} style={{ backgroundColor: '#faad14' }} />
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                        {room.last_message || 'No messages yet'}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              {selectedChatRoom ? (
                <>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        Chat with {selectedChatRoom.student?.full_name || 'Student'}
                      </Title>
                      <Text type="secondary">
                        ID: {selectedChatRoom.student?.id_number || 'N/A'}
                      </Text>
                    </div>
                    <Button icon={<CloseOutlined />} onClick={() => setSelectedChatRoom(null)} />
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {loadingChat ? (
                      <Spin />
                    ) : chatMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <MessageOutlined style={{ fontSize: '40px' }} />
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      chatMessages.map(msg => (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            justifyContent: msg.is_own ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div style={{
                            maxWidth: '70%',
                            padding: '10px 15px',
                            borderRadius: '15px',
                            background: msg.is_own ? '#faad14' : '#f0f0f0',
                            color: msg.is_own ? 'white' : '#333',
                          }}>
                            <div>{msg.content}</div>
                            <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7, textAlign: 'right' }}>
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <Input.TextArea
                      rows={2}
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                      placeholder="Type your message..."
                    />
                    <Button type="primary" onClick={sendChatMessage} disabled={!newChatMessage.trim()}>
                      Send
                    </Button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                  <MessageOutlined style={{ fontSize: '60px' }} />
                  <Title level={4}>Select a chat to start messaging</Title>
                </div>
              )}
            </div>
          </div>
        </TabPane>

        <TabPane tab={<span><DatabaseOutlined /> Meal Dues Registry</span>} key="2">
          <Card style={{ marginBottom: 20, borderRadius: 10 }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Input
                  placeholder="Search by Student ID"
                  value={dueSearchId}
                  onChange={(e) => setDueSearchId(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Col>
              <Col span={8}>
                <Input
                  placeholder="Search by Student Name"
                  value={dueSearchName}
                  onChange={(e) => setDueSearchName(e.target.value)}
                  prefix={<UserOutlined />}
                  allowClear
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
                      setRegisterDueModal(true);
                    }}
                  >
                    Register New Due
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={loadDueStudents} loading={loadingDues}>
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
                <Text strong>Meal Dues Registry</Text>
                <Tag color="orange">Total Records: {searchDueStudents().length}</Tag>
                <Tag color="red">Overdue: {searchDueStudents().filter(r => r.status === 'overdue').length}</Tag>
                <Tag color="gold">Due Soon: {searchDueStudents().filter(r => r.status === 'due_soon').length}</Tag>
              </Space>
            )}
          />
        </TabPane>
      </Tabs>

      {/* Batch Processing Modal */}
      <Modal
        title={
          <Space>
            <RocketOutlined style={{ color: '#faad14' }} />
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
              description={batchAction === 'approve' 
                ? "Approved forms will be sent to Psychology department for final clearance." 
                : "Rejected forms will be returned to students."}
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
                              prefix="$"
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
                            label="Payment Reason"
                            required={batchPaymentRequired}
                          >
                            <Input
                              value={batchPaymentReason}
                              onChange={(e) => setBatchPaymentReason(e.target.value)}
                              placeholder="e.g., Unpaid meal dues"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
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
                    style={batchAction === 'approve' ? { background: '#52c41a' } : {}}
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

      {/* View Form Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Clearance Form Details</span>
            {selectedForm && renderStatus(selectedForm.status)}
          </Space>
        }
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[<Button key="close" onClick={() => setViewModal(false)}>Close</Button>]}
        width={800}
      >
        {selectedForm && (
          <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <Descriptions column={2} bordered size="middle" labelStyle={{ fontWeight: 'bold', background: '#fafafa' }}>
              <Descriptions.Item label="Full Name" span={2}>
                <Space><UserOutlined /><Text strong>{selectedForm.full_name}</Text></Space>
              </Descriptions.Item>
              <Descriptions.Item label="ID Number"><IdcardOutlined /> {selectedForm.id_number}</Descriptions.Item>
              <Descriptions.Item label="Email"><MailOutlined /> {selectedForm.student_email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="College">{selectedForm.college}</Descriptions.Item>
              <Descriptions.Item label="Department">{selectedForm.department_name}</Descriptions.Item>
              <Descriptions.Item label="Program Level">{selectedForm.program_level}</Descriptions.Item>
              <Descriptions.Item label="Enrollment Type">{selectedForm.enrollment_type}</Descriptions.Item>
              <Descriptions.Item label="Year/Semester">{selectedForm.year} / {selectedForm.semester}</Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}>
                <Card size="small" style={{ background: '#fff7e6' }}>{selectedForm.reason}</Card>
              </Descriptions.Item>
              {selectedForm.library_note && (
                <Descriptions.Item label="Library Note" span={2}>
                  <Alert message={selectedForm.library_note} type="info" showIcon />
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedForm.status === "approved_library" && (
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<CoffeeOutlined />}
                    onClick={() => {
                      setViewModal(false);
                      checkMealDues(selectedForm.student_id || selectedForm.id_number, selectedForm.id);
                    }}
                    loading={checkingDues}
                    style={{ background: "#faad14" }}
                  >
                    Check Dues
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      setViewModal(false);
                      approveForm(selectedForm.id, selectedForm.student_id || selectedForm.id_number);
                    }}
                    style={{ background: "#52c41a" }}
                    disabled={checkIfStudentHasDue(selectedForm.id_number)}
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setViewModal(false);
                      openRejectModal(selectedForm.id, selectedForm.student_id || selectedForm.id_number);
                    }}
                  >
                    Reject
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Meal Dues Details Modal */}
      <Modal
        title={
          <Space>
            <CoffeeOutlined />
            <span>Meal Dues Registry Check</span>
            {mealDues.student_info && (
              <Tag color="blue">
                {mealDues.student_info.student_name || mealDues.student_info.id_number}
              </Tag>
            )}
          </Space>
        }
        open={duesModal}
        onCancel={() => setDuesModal(false)}
        footer={[
          <Button key="close" onClick={() => setDuesModal(false)}>
            Close
          </Button>,
          mealDues.can_approve && (
            <Button 
              key="approve" 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={quickApproveAfterDuesCheck}
              disabled={!mealDues.form_id}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Approve & Send to Psychology
            </Button>
          )
        ]}
        width={800}
      >
        {mealDues.dues.length > 0 ? (
          <>
            <Table 
              columns={duesColumns} 
              dataSource={mealDues.dues} 
              pagination={false}
              rowKey="id"
              style={{ marginBottom: 20 }}
              title={() => (
                <Text type="secondary">
                  Registry Records • Checked: {mealDues.checked_at}
                </Text>
              )}
            />
            
            <Card 
              title={<><DollarOutlined /> Registered Dues Summary</>}
              size="small"
              style={{ 
                background: mealDues.has_meal_dues ? '#fff2f0' : '#f6ffed',
                border: mealDues.has_meal_dues ? '1px solid #ffccc7' : '1px solid #b7eb8f'
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Total Dues"
                    value={mealDues.total_amount || 0}
                    prefix="$"
                    valueStyle={{ color: mealDues.has_meal_dues ? '#ff4d4f' : '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Number of Dues"
                    value={mealDues.dues.length}
                  />
                </Col>
              </Row>
            </Card>
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
              This student has no meal due records in the registry.
            </Text>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={<Space><CloseCircleOutlined style={{ color: '#ff4d4f' }} /><span>Reject Clearance Form</span></Space>}
        open={rejectModal}
        onOk={handleRejectForm}
        onCancel={() => {
          setRejectModal(false);
          setRejectNote("");
          setRejectAction('reject_only');
          setPaymentAmount("");
          setPaymentReason("");
        }}
        okText={rejectAction === 'require_payment' ? "Require Payment" : "Reject & Return"}
        okButtonProps={{ danger: true }}
        width={600}
      >
        <Alert message="Rejection Reason" description="This action will be visible to the student." type="warning" showIcon style={{ marginBottom: 20 }} />
        
        <div style={{ marginBottom: 20 }}>
          <Text strong>Rejection Type:</Text>
          <Select style={{ width: '100%', marginTop: 5 }} value={rejectAction} onChange={setRejectAction}>
            <Option value="reject_only">Reject Only (Return to Student)</Option>
            <Option value="require_payment">Require Payment First</Option>
          </Select>
        </div>
        
        {rejectAction === 'require_payment' && (
          <div style={{ marginBottom: 20, padding: 15, background: '#f6f8fa', borderRadius: 8 }}>
            <Title level={5}><DollarOutlined /> Payment Details</Title>
            <Input 
              placeholder="Payment Amount" 
              prefix="$" 
              type="number" 
              value={paymentAmount} 
              onChange={(e) => setPaymentAmount(e.target.value)} 
              style={{ marginBottom: 10 }} 
            />
            <Input.TextArea 
              placeholder="Payment Reason" 
              value={paymentReason} 
              onChange={(e) => setPaymentReason(e.target.value)} 
              rows={2} 
            />
          </div>
        )}
        
        <Input.TextArea
          rows={4}
          placeholder="Enter rejection reason..."
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          maxLength={500}
          showCount
        />
      </Modal>

      {/* Register Due Modal */}
      <Modal
        title={
          <Space>
            <DatabaseOutlined />
            <span>{editingDue ? 'Edit Meal Due Record' : 'Register New Meal Due'}</span>
          </Space>
        }
        open={registerDueModal}
        onCancel={() => {
          setRegisterDueModal(false);
          setEditingDue(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Alert
          message="Manual Registry"
          description="This registry helps track meal dues. Forms will be checked against this registry."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />
        
        <Form form={form} layout="vertical" onFinish={editingDue ? updateDue : registerNewDue}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="student_id" label="Student ID" rules={[{ required: true }]}>
                <Input placeholder="Enter student ID" prefix={<IdcardOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="student_name" label="Student Name" rules={[{ required: true }]}>
                <Input placeholder="Enter student name" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Enter due description..." />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="due_date" label="Due Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  prefix="$"
                  min={0}
                  step={0.01}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
              <Button onClick={() => {
                setRegisterDueModal(false);
                setEditingDue(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingDue ? 'Update Record' : 'Register Record'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Start New Chat Modal */}
      <Modal
        title="Start New Chat with Student"
        open={showChatModal}
        onCancel={() => setShowChatModal(false)}
        footer={null}
        width={600}
      >
        <Input 
          placeholder="Search students..." 
          prefix={<SearchOutlined />} 
          style={{ marginBottom: '20px' }}
        />
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loadingStudents ? (
            <Spin />
          ) : studentsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
              <UserOutlined style={{ fontSize: '40px' }} />
              <p>No students available</p>
            </div>
          ) : (
            studentsList.map(student => (
              <Card
                key={student.id}
                size="small"
                style={{ marginBottom: '10px', cursor: 'pointer' }}
                onClick={() => {
                  if (student.has_existing_chat) {
                    const existingRoom = chatRooms.find(r => r.id === student.chat_room_id);
                    if (existingRoom) setSelectedChatRoom(existingRoom);
                  } else {
                    startChatWithStudent(student.id);
                  }
                  setShowChatModal(false);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>{student.full_name}</Text>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      ID: {student.id_number} • {student.department || 'No department'}
                    </div>
                  </div>
                  {student.has_existing_chat ? (
                    <Tag color="orange">Existing Chat</Tag>
                  ) : (
                    <Button type="link" icon={<MessageOutlined />}>Start</Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </Modal>

      {/* Queue Modal */}
      {renderQueueModal()}

      {/* Footer */}
      <div style={{ marginTop: 40, padding: '20px 0', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
        <Text type="secondary">
          Cafeteria Clearance System • {new Date().getFullYear()} • 
          <span style={{ marginLeft: 8, color: '#faad14' }}>
            Total: {stats.total} • Pending: {stats.pending} • Queue: {processingQueue.length} • Records: {dueStudents.length}
          </span>
        </Text>
      </div>
    </div>
  );
}