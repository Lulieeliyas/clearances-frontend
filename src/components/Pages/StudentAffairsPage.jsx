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
  Divider,
  Result
} from "antd";
import { 
  CheckOutlined, 
  CloseOutlined, 
  SearchOutlined,
  MessageOutlined,
  EyeOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  HistoryOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DatabaseOutlined,
  DollarCircleOutlined,
  CheckSquareOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  FilterOutlined,
  RocketOutlined,
  DislikeOutlined,
  BulbOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Option } = Select;
const { confirm } = Modal;
const API_BASE = "http://127.0.0.1:8000/api/";

export default function StudentAffairsPage() {
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
    issueType: '',
    hasIssues: false,
    dateRange: null
  });
  
  // Chat states
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    withIssues: 0,
    pendingIssues: 0
  });
  
  const [actionLoading, setActionLoading] = useState({});
  
  // ================= STUDENT AFFAIRS SPECIFIC STATE =================
  const [affairsRegistry, setAffairsRegistry] = useState([]);
  const [registrySearchId, setRegistrySearchId] = useState("");
  const [registrySearchName, setRegistrySearchName] = useState("");
  const [loadingRegistry, setLoadingRegistry] = useState(false);
  const [registerRecordModal, setRegisterRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  // ================= AUTH =================
  useEffect(() => {
    const stored = sessionStorage.getItem("ucs_current");
    if (!stored) {
      message.error("Please login first");
      navigate("/login");
      return;
    }
    
    const parsed = JSON.parse(stored);
    if (parsed.role !== "studentaffairs") {
      message.error("Access denied. Student Affairs only.");
      navigate("/login");
      return;
    }
    
    setUser(parsed);
    setToken(parsed.token);
    loadForms(parsed.token);
    loadAffairsRegistry();
  }, [navigate]);

  // ================= LOAD PENDING PAYMENTS COUNT =================
  const loadPendingPaymentsCount = async () => {
    if (!token) return;
    
    try {
      const res = await axios.get(`${API_BASE}payment/pending/`, {
        headers: { Authorization: `Token ${token}` }
      });
      if (res.data && Array.isArray(res.data)) {
        const affairsPayments = res.data.filter(payment => 
          payment.department_type === 'studentaffairs'
        );
        setPendingPaymentsCount(affairsPayments.length);
      }
    } catch (err) {
      console.error("Error loading pending payments count:", err);
      setPendingPaymentsCount(0);
    }
  };

  // ================= LOAD CHAT ROOMS =================
  const loadChatRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE}chat/rooms/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setChatRooms(response.data);
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
    }
  };

  const loadStudentsForChat = async () => {
    try {
      setLoadingStudents(true);
      const response = await axios.get(`${API_BASE}chat/studentaffairs/students/`, {
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
      const response = await axios.get(`${API_BASE}chat/studentaffairs/messages/${roomId}/`, {
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
      const response = await axios.post(`${API_BASE}chat/studentaffairs/start/`, 
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
      const response = await axios.post(`${API_BASE}chat/studentaffairs/send/`, {
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

  useEffect(() => {
    if (token) {
      loadChatRooms();
    }
  }, [token]);

  useEffect(() => {
    if (selectedChatRoom) {
      loadChatMessages(selectedChatRoom.id);
      const interval = setInterval(() => {
        loadChatMessages(selectedChatRoom.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChatRoom]);

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
        .filter(f => f.status === "approved_dopcordinator")
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

  const checkStudentAffairsIssues = (studentId) => {
    return affairsRegistry.some(record => 
      record.student_id === studentId && 
      record.status === 'pending'
    );
  };

  const getStudentAffairsIssues = (studentId) => {
    return affairsRegistry.filter(record => record.student_id === studentId);
  };

  const getStudentPendingIssuesCount = (studentId) => {
    return affairsRegistry.filter(record => 
      record.student_id === studentId && record.status === 'pending'
    ).length;
  };

  const processBatchApproval = async () => {
    try {
      setBatchProgress({ current: 0, total: selectedForms.length, status: 'processing' });
      setBatchResults({ success: [], failed: [] });
      
      const results = { success: [], failed: [] };
      let totalIssues = 0;
      
      for (let i = 0; i < selectedForms.length; i++) {
        const formId = selectedForms[i];
        const form = forms.find(f => f.id === formId);
        
        try {
          setBatchProgress(prev => ({ ...prev, current: i + 1 }));
          
          // Check if student has affairs issues
          const hasIssues = checkStudentAffairsIssues(form.id_number);
          const pendingIssues = getStudentPendingIssuesCount(form.id_number);
          
          if (hasIssues && batchAction === 'approve') {
            results.failed.push({
              id: formId,
              name: form.full_name,
              reason: `Student has ${pendingIssues} pending student affairs issues`
            });
            continue;
          }
          
          const payload = {
            action: batchAction,
            note: batchNotes || `Batch ${batchAction} by Student Affairs`
          };
          
          if (batchAction === 'reject' && batchPaymentRequired) {
            payload.requires_payment = true;
            payload.payment_amount = parseFloat(batchPaymentAmount);
            payload.payment_reason = batchPaymentReason || 'Student services fees required';
            totalIssues += pendingIssues;
          }
          
          const res = await axios.patch(
            `${API_BASE}studentaffairs/action/${formId}/`,
            payload,
            { headers: { Authorization: `Token ${token}` } }
          );
          
          results.success.push({
            id: formId,
            name: form.full_name,
            message: res.data.message || `${batchAction} successful`,
            issues: pendingIssues
          });
          
          // Update local state
          setForms(prev => prev.map(f => {
            if (f.id === formId) {
              const newStatus = batchAction === 'approve' ? 'approved_studentaffairs' : 'rejected';
              return { 
                ...f, 
                status: newStatus,
                studentaffairs_note: batchNotes || f.studentaffairs_note
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
            {totalIssues > 0 && (
              <p><BulbOutlined /> Total Pending Issues: {totalIssues}</p>
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
    let filtered = forms.filter(f => f.status === "approved_dopcordinator");
    
    if (filterCriteria.department) {
      filtered = filtered.filter(f => f.department_name === filterCriteria.department);
    }
    
    if (filterCriteria.issueType) {
      filtered = filtered.filter(f => {
        const issues = getStudentAffairsIssues(f.id_number);
        return issues.some(i => i.issue_type === filterCriteria.issueType);
      });
    }
    
    if (filterCriteria.hasIssues) {
      filtered = filtered.filter(f => getStudentPendingIssuesCount(f.id_number) > 0);
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

  const getUniqueIssueTypes = () => {
    const types = new Set(affairsRegistry.map(r => r.issue_type).filter(Boolean));
    return Array.from(types);
  };

  // ================= PAYMENT VERIFICATION DROPDOWN MENU =================
  const paymentVerificationMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === "payment-verification") {
          sessionStorage.setItem("payment_verification_dept", "studentaffairs");
          navigate("/staff/payments");
        }
        if (key === "clearance-forms") {
          loadForms(token);
        }
        if (key === "affairs-registry") {
          setRegisterRecordModal(true);
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
          key: 'affairs-registry',
          label: (
            <Space>
              <DatabaseOutlined />
              <span>Affairs Registry</span>
              {affairsRegistry.length > 0 && (
                <Badge count={affairsRegistry.length} size="small" />
              )}
            </Space>
          ),
        },
      ]}
    />
  );

  // ================= LOAD FORMS =================
  const loadForms = async (authToken) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}studentaffairs/forms/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      if (res.data && Array.isArray(res.data)) {
        setForms(res.data);
        calculateStats(res.data);
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
      loadPendingPaymentsCount();
    }
  };

  // ================= LOAD AFFAIRS REGISTRY =================
  const loadAffairsRegistry = async () => {
    try {
      setLoadingRegistry(true);
      const savedRegistry = localStorage.getItem("studentaffairs_registry");
      if (savedRegistry) {
        setAffairsRegistry(JSON.parse(savedRegistry));
      } else {
        setAffairsRegistry([]);
      }
    } catch (err) {
      console.error("Error loading registry:", err);
      setAffairsRegistry([]);
    } finally {
      setLoadingRegistry(false);
    }
  };

  const saveAffairsRegistry = (registry) => {
    localStorage.setItem("studentaffairs_registry", JSON.stringify(registry));
    setAffairsRegistry(registry);
  };

  const registerNewRecord = async (values) => {
    try {
      const newRecord = {
        id: Date.now(),
        student_id: values.student_id,
        student_name: values.student_name,
        issue_type: values.issue_type,
        description: values.description,
        status: values.status,
        resolution_date: values.resolution_date?.format('YYYY-MM-DD') || null,
        registered_date: dayjs().format('YYYY-MM-DD'),
        registered_by: user?.username || 'studentaffairs'
      };

      const updatedRegistry = [...affairsRegistry, newRecord];
      saveAffairsRegistry(updatedRegistry);
      
      message.success("Student affairs record registered successfully!");
      setRegisterRecordModal(false);
      form.resetFields();
      
      calculateStats(forms);
      
    } catch (err) {
      console.error("Error registering record:", err);
      message.error("Failed to register record.");
    }
  };

  const updateRecord = async (values) => {
    try {
      const updatedRecord = {
        ...editingRecord,
        student_id: values.student_id,
        student_name: values.student_name,
        issue_type: values.issue_type,
        description: values.description,
        status: values.status,
        resolution_date: values.resolution_date?.format('YYYY-MM-DD') || null
      };

      const updatedRegistry = affairsRegistry.map(record => 
        record.id === editingRecord.id ? updatedRecord : record
      );
      saveAffairsRegistry(updatedRegistry);
      
      message.success("Record updated successfully!");
      setRegisterRecordModal(false);
      setEditingRecord(null);
      form.resetFields();
      
      calculateStats(forms);
      
    } catch (err) {
      console.error("Error updating record:", err);
      message.error("Failed to update record.");
    }
  };

  const deleteRecord = (id) => {
    Modal.confirm({
      title: 'Delete Record',
      content: 'Are you sure you want to delete this record?',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        const updatedRegistry = affairsRegistry.filter(record => record.id !== id);
        saveAffairsRegistry(updatedRegistry);
        message.success("Record deleted successfully!");
        calculateStats(forms);
      }
    });
  };

  const searchRegistry = () => {
    if (!registrySearchId.trim() && !registrySearchName.trim()) {
      return affairsRegistry;
    }
    
    return affairsRegistry.filter(record => 
      (registrySearchId && record.student_id.toLowerCase().includes(registrySearchId.toLowerCase())) ||
      (registrySearchName && record.student_name.toLowerCase().includes(registrySearchName.toLowerCase()))
    );
  };

  const checkIfStudentHasIssue = (studentId) => {
    return affairsRegistry.some(record => 
      record.student_id === studentId && 
      record.status === 'pending'
    );
  };

  const getStudentIssues = (studentId) => {
    return affairsRegistry.filter(record => record.student_id === studentId);
  };

  const getStudentIssuesList = (studentId) => {
    return affairsRegistry.filter(record => 
      record.student_id === studentId && record.status === 'pending'
    );
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
        title: 'Confirm Student Affairs Clearance',
        content: (
          <div>
            <p>Have you verified all student affairs requirements?</p>
            <Alert
              message="Important:"
              description="Check if student has any pending disciplinary issues, housing matters, or student services obligations."
              type="warning"
              showIcon
              style={{ marginTop: 10 }}
            />
          </div>
        ),
        okText: 'Yes, Verified - Approve',
        cancelText: 'No, Check First',
        onOk: async () => {
          try {
            const note = "Approved by Student Affairs - All requirements met";
            const res = await axios.patch(
              `${API_BASE}studentaffairs/action/${formId}/`,
              { action: "approve", note: note },
              { headers: { Authorization: `Token ${token}` } }
            );
            
            setForms(prev => prev.map(f => 
              f.id === formId ? { ...f, status: "approved_studentaffairs", studentaffairs_note: res.data.note } : f
            ));
            
            message.success("Form approved successfully!");
            
            notification.success({
              message: 'Approved successfully',
              description: 'Clearance form has correct and approved success.',
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
        `${API_BASE}studentaffairs/action/${selectedFormId}/`,
        payload,
        { headers: { Authorization: `Token ${token}` } }
      );
      
      message.success(res.data.message || "Form rejected successfully");
      
      setForms(prev => prev.map(f => {
        if (f.id === selectedFormId) {
          return { 
            ...f, 
            status: res.data.status || "rejected",
            studentaffairs_note: res.data.note || rejectNote.trim()
          };
        }
        return f;
      }));
      
      if (rejectAction === 'require_payment') {
        notification.info({
          message: 'Payment Required',
          description: 'Student will receive payment instructions for student services fees.',
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

  // ================= LOGOUT =================
  const logout = () => {
    sessionStorage.clear();
    localStorage.removeItem("ucs_user");
    message.success("Logged out successfully");
    navigate("/login");
  };

  // ================= CALCULATE STATS =================
  const calculateStats = (formsList) => {
    const pendingIssues = formsList.reduce((total, form) => {
      return total + getStudentPendingIssuesCount(form.id_number);
    }, 0);
    
    const stats = {
      total: formsList.length,
      pending: formsList.filter(f => f.status === "approved_dopcordinator").length,
      approved: formsList.filter(f => f.status === "approved_studentaffairs").length,
      rejected: formsList.filter(f => f.status === "rejected" && f.studentaffairs_note).length,
      withIssues: formsList.filter(f => checkIfStudentHasIssue(f.id_number)).length,
      pendingIssues: pendingIssues
    };
    setStats(stats);
  };

  // ================= FILTERED FORMS =================
  const filteredForms = forms.filter((f) =>
    f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= RENDER STATUS =================
  const renderStatus = (status) => {
    switch(status) {
      case "approved_studentaffairs":
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
      case "approved_dopcordinator":
        return (
          <Badge 
            status="processing" 
            text={
              <Space>
                <ClockCircleOutlined />
                <span style={{ fontWeight: 'bold' }}>PENDING</span>
                <Tag color="orange">Student Affairs Review</Tag>
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
    const currentStep = form.status === "approved_dopcordinator" ? 8 : 
                      form.status === "approved_studentaffairs" ? 9 : 0;
    
    return (
      <Steps size="small" current={currentStep} style={{ marginTop: 20 }}>
        <Step title="Dept. Head" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Library" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Cafeteria" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Psychology" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Sport Master" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Campus Police" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Cooperation" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="DOP Cordinator" description="Approved" icon={<CheckCircleOutlined />} />
        <Step 
          title="Student Affairs" 
          description={
            form.status === "approved_studentaffairs" ? "Approved" : 
            form.status === "rejected" ? "Rejected" : "Review Needed"
          } 
          icon={
            form.status === "approved_studentaffairs" ? <CheckCircleOutlined /> : 
            form.status === "rejected" ? <CloseCircleOutlined /> : <SafetyOutlined />
          }
        />
        <Step title="Dormitory" description="Waiting" icon={<HomeOutlined />} />
      </Steps>
    );
  };

  // ================= REGISTRY TABLE COLUMNS =================
  const registryColumns = [
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
      title: 'Issue Type',
      dataIndex: 'issue_type',
      key: 'issue_type',
      render: (type) => <Tag color="volcano">{type}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Resolution Date',
      dataIndex: 'resolution_date',
      key: 'resolution_date',
      render: (date) => date ? dayjs(date).format('MMM D, YYYY') : 'Not resolved',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'resolved' ? 'green' : 'orange'}>
          {status === 'resolved' ? 'RESOLVED' : 'PENDING'}
        </Tag>
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
                  issue_type: record.issue_type,
                  description: record.description,
                  status: record.status,
                  resolution_date: record.resolution_date ? dayjs(record.resolution_date) : null
                });
                setEditingRecord(record);
                setRegisterRecordModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteRecord(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ================= RENDER FORM CARD =================
  const renderFormCard = (form) => {
    const isPending = form.status === "approved_dopcordinator";
    const isApproved = form.status === "approved_studentaffairs";
    const isRejected = form.status === "rejected";
    
    const hasIssue = checkIfStudentHasIssue(form.id_number);
    const studentIssues = getStudentIssues(form.id_number);
    const pendingIssuesCount = getStudentPendingIssuesCount(form.id_number);
    const issuesList = getStudentIssuesList(form.id_number);
    
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
            isApproved ? "#52c41a" :
            isRejected ? "#ff4d4f" :
            hasIssue ? "#faad14" : "#fa8c16"
          }`,
          transition: 'all 0.3s',
          cursor: 'pointer',
          background: hasIssue ? '#fff7e6' : 'white',
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
              {hasIssue && (
                <Tooltip title={`Student has ${pendingIssuesCount} pending student affairs issue(s)`}>
                  <WarningOutlined style={{ color: '#faad14' }} />
                </Tooltip>
              )}
            </Space>
            {renderStatus(form.status)}
          </div>
        }
        extra={
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} onClick={(e) => {
              e.stopPropagation();
              viewFormDetails(form);
            }} />
          </Tooltip>
        }
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
        
        {hasIssue && (
          <Alert
            message="Pending Student Affairs Issues"
            description={
              <div>
                <p>Student has {pendingIssuesCount} pending student affairs issue(s):</p>
                <ul>
                  {issuesList.map(issue => (
                    <li key={issue.id}>
                      {issue.issue_type}: {issue.description}
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
        
        {form.dopcordinator_note && (
          <Alert message="DOP Cordinator Note" description={form.dopcordinator_note} type="info" showIcon style={{ marginTop: 15 }} />
        )}
        
        {isPending && !batchMode && (
          <Space style={{ marginTop: 15, width: '100%', justifyContent: 'center' }}>
            <Popconfirm
              title="Verify Student Affairs Requirements"
              description="Have you verified all student affairs requirements for this student?"
              onConfirm={() => approveForm(form.id, form.student_id || form.id_number)}
              okText="Yes, Approve"
              cancelText="Cancel"
              disabled={hasIssue}
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={actionLoading[form.id]}
                style={{ background: "#fa8c16", borderColor: "#fa8c16" }}
                disabled={hasIssue}
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
        
        {form.studentaffairs_note && (
          <Alert
            message="Student Affairs Action"
            description={form.studentaffairs_note}
            type={isRejected ? "error" : "success"}
            showIcon
            style={{ marginTop: 10 }}
          />
        )}
      </Card>
    );
  };

  return (
    <div style={{ padding: 30, maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <Card 
        style={{ 
          marginBottom: 30,
          borderRadius: 15,
          background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
          color: 'white',
          boxShadow: '0 8px 25px rgba(250, 140, 22, 0.3)'
        }}
        bodyStyle={{ padding: '20px 30px' }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                <SafetyOutlined /> Student Affairs Clearance
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
                Welcome, {user?.username || 'Student Affairs Officer'}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space size="middle">
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
                    {pendingPaymentsCount > 0 && (
                      <Badge count={pendingPaymentsCount} size="small" style={{ backgroundColor: '#ff4d4f' }} />
                    )}
                  </Space>
                </Button>
              </Dropdown>
              
              <Button 
                onClick={() => setRegisterRecordModal(true)}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
              >
                <Space>
                  <DatabaseOutlined />
                  <span>Affairs Registry</span>
                  {affairsRegistry.length > 0 && (
                    <Badge count={affairsRegistry.length} size="small" style={{ backgroundColor: '#ff4d4f' }} />
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

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 30 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: 'center', borderRadius: 10, border: '2px solid #fa8c16' }}>
            <Statistic title="Total Forms" value={stats.total} valueStyle={{ color: '#fa8c16' }} prefix={<FileTextOutlined />} />
            <Text type="secondary">From DOP Cordinator</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: 'center', borderRadius: 10, border: '2px solid #1890ff' }}>
            <Statistic title="Pending Review" value={stats.pending} valueStyle={{ color: '#1890ff' }} prefix={<ClockCircleOutlined />} />
            <Text type="secondary">Need affairs check</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: 'center', borderRadius: 10, border: '2px solid #52c41a' }}>
            <Statistic title="Approved" value={stats.approved} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ textAlign: 'center', borderRadius: 10, border: '2px solid #faad14' }}>
            <Statistic title="With Issues" value={stats.withIssues} valueStyle={{ color: '#faad14' }} prefix={<WarningOutlined />} />
            <Text type="secondary">Pending issues</Text>
            {stats.pendingIssues > 0 && (
              <div><Tag color="volcano">Total Issues: {stats.pendingIssues}</Tag></div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs defaultActiveKey="1" style={{ marginBottom: 20 }}>
        <TabPane 
          tab={
            <span>
              <SafetyOutlined /> Clearance Forms 
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
                        indeterminate={selectedForms.length > 0 && selectedForms.length < getFilteredByCriteria().length}
                      >
                        Select All ({selectedForms.length} / {getFilteredByCriteria().length})
                      </Checkbox>
                      
                      <Button 
                        icon={<CheckOutlined />} 
                        type="primary" 
                        style={{ background: "#fa8c16" }}
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
                          <Space><FilterOutlined /> Filter by Department</Space>
                        </Menu.Item>
                        <Menu.Item key="issue">
                          <Space><DislikeOutlined /> Filter by Issue Type</Space>
                        </Menu.Item>
                        <Menu.Item key="issues" onClick={() => setFilterCriteria(prev => ({ ...prev, hasIssues: !prev.hasIssues }))}>
                          <Space><BulbOutlined /> {filterCriteria.hasIssues ? "Show All" : "Show Only With Issues"}</Space>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button icon={<FilterOutlined />}>Filter</Button>
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
                  {filterCriteria.issueType && (
                    <Tag closable onClose={() => setFilterCriteria(prev => ({ ...prev, issueType: '' }))}>
                      Issue: {filterCriteria.issueType}
                    </Tag>
                  )}
                  {filterCriteria.hasIssues && (
                    <Tag closable onClose={() => setFilterCriteria(prev => ({ ...prev, hasIssues: false }))}>
                      With Issues Only
                    </Tag>
                  )}
                  <Button type="link" size="small" onClick={() => setFilterCriteria({
                    department: '',
                    issueType: '',
                    hasIssues: false,
                    dateRange: null
                  })}>
                    Clear All
                  </Button>
                </Space>
              </div>
            )}
          </Card>

          <Alert
            message="STUDENT AFFAIRS CLEARANCE REQUIRED"
            description={
              <Space direction="vertical" size={8}>
                <Paragraph>
                  <ol>
                    <li>Check disciplinary records and conduct issues</li>
                    <li>Verify housing and accommodation status</li>
                    <li>Review student services obligations</li>
                    <li>Check for any outstanding student affairs matters</li>
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
              <p style={{ marginTop: 20 }}>Loading forms from DOP cordinator...</p>
            </div>
          ) : filteredForms.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 60 }}>
              <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
              <Title level={4} type="secondary">No forms awaiting student affairs clearance</Title>
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
                        borderColor: selectedChatRoom?.id === room.id ? '#fa8c16' : '#f0f0f0'
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
                          <Badge count={room.unread_count} style={{ backgroundColor: '#fa8c16' }} />
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
                            background: msg.is_own ? '#fa8c16' : '#f0f0f0',
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

          {/* Start New Chat Modal */}
          <Modal title="Start New Chat with Student" open={showChatModal} onCancel={() => setShowChatModal(false)} footer={null} width={600}>
            <Input placeholder="Search students..." prefix={<SearchOutlined />} style={{ marginBottom: '20px' }} />
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
        </TabPane>

        <TabPane tab={<span><DatabaseOutlined /> Affairs Registry</span>} key="2">
          <Card style={{ marginBottom: 20, borderRadius: 10 }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Input
                  placeholder="Search by Student ID"
                  value={registrySearchId}
                  onChange={(e) => setRegistrySearchId(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Col>
              <Col span={8}>
                <Input
                  placeholder="Search by Student Name"
                  value={registrySearchName}
                  onChange={(e) => setRegistrySearchName(e.target.value)}
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
                      setEditingRecord(null);
                      form.resetFields();
                      setRegisterRecordModal(true);
                    }}
                  >
                    Register New Record
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={loadAffairsRegistry} loading={loadingRegistry}>
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Table
            columns={registryColumns}
            dataSource={searchRegistry()}
            rowKey="id"
            loading={loadingRegistry}
            pagination={{ pageSize: 10 }}
            style={{ background: 'white', borderRadius: 10 }}
            title={() => (
              <Space>
                <DatabaseOutlined />
                <Text strong>Student Affairs Registry</Text>
                <Tag color="volcano">Total Records: {searchRegistry().length}</Tag>
                <Tag color="orange">Pending: {searchRegistry().filter(r => r.status === 'pending').length}</Tag>
                <Tag color="green">Resolved: {searchRegistry().filter(r => r.status === 'resolved').length}</Tag>
              </Space>
            )}
          />
        </TabPane>
      </Tabs>

      {/* Batch Processing Modal */}
      <Modal
        title={
          <Space>
            <RocketOutlined style={{ color: '#fa8c16' }} />
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
                            label="Reason"
                            required={batchPaymentRequired}
                          >
                            <Input
                              value={batchPaymentReason}
                              onChange={(e) => setBatchPaymentReason(e.target.value)}
                              placeholder="e.g., Student services fees"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Text type="secondary">Note: This will be added to any existing student obligations</Text>
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
                    style={batchAction === 'approve' ? { background: '#fa8c16' } : {}}
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
                      {item.issues > 0 && (
                        <Tag color="volcano" style={{ marginLeft: 8 }}>Issues: {item.issues}</Tag>
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
              {selectedForm.dopcordinator_note && (
                <Descriptions.Item label="DOP Cordinator Note" span={2}>
                  <Alert message={selectedForm.dopcordinator_note} type="info" showIcon />
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedForm.status === "approved_dopcordinator" && (
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      setViewModal(false);
                      approveForm(selectedForm.id, selectedForm.student_id || selectedForm.id_number);
                    }}
                    style={{ background: "#fa8c16" }}
                    disabled={checkIfStudentHasIssue(selectedForm.id_number)}
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
            <Option value="require_payment">Require Payment (Student Services Fees)</Option>
          </Select>
        </div>
        
        {rejectAction === 'require_payment' && (
          <div style={{ marginBottom: 20, padding: 15, background: '#f6f8fa', borderRadius: 8 }}>
            <Title level={5}><DollarOutlined /> Payment Details</Title>
            <Input placeholder="Payment Amount" prefix="$" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} style={{ marginBottom: 10 }} />
            <Input.TextArea placeholder="Payment Reason" value={paymentReason} onChange={(e) => setPaymentReason(e.target.value)} rows={2} />
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

      {/* Register Record Modal */}
      <Modal
        title={<Space><DatabaseOutlined /><span>{editingRecord ? 'Edit Affairs Record' : 'Register New Affairs Record'}</span></Space>}
        open={registerRecordModal}
        onCancel={() => {
          setRegisterRecordModal(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Alert message="Student Affairs Registry" description="Track student disciplinary issues, housing matters, and other affairs." type="info" showIcon style={{ marginBottom: 20 }} />
        
        <Form form={form} layout="vertical" onFinish={editingRecord ? updateRecord : registerNewRecord}>
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
          
          <Form.Item name="issue_type" label="Issue Type" rules={[{ required: true }]}>
            <Select placeholder="Select issue type">
              <Option value="disciplinary">Disciplinary Issue</Option>
              <Option value="housing">Housing Matter</Option>
              <Option value="conduct">Student Conduct</Option>
              <Option value="services">Student Services</Option>
              <Option value="counseling">Counseling Referral</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Enter detailed description..." />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="resolution_date" label="Resolution Date">
                <DatePicker style={{ width: '100%' }} placeholder="Select resolution date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select>
                  <Option value="pending">Pending</Option>
                  <Option value="resolved">Resolved</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
              <Button onClick={() => {
                setRegisterRecordModal(false);
                setEditingRecord(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? 'Update Record' : 'Register Record'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Footer */}
      <div style={{ marginTop: 40, padding: '20px 0', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
        <Text type="secondary">
          Student Affairs Clearance System • {new Date().getFullYear()} • 
          <span style={{ marginLeft: 8, color: '#fa8c16' }}>
            Total Forms: {stats.total} • Pending: {stats.pending} • Records: {affairsRegistry.length}
          </span>
        </Text>
      </div>
    </div>
  );
}