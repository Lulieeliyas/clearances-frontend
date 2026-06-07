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
  CalendarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  DollarCircleOutlined,
  CheckSquareOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  FilterOutlined,
  RocketOutlined,
  TeamOutlined,
  FlagOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Option } = Select;
const { confirm } = Modal;
const API_BASE = "http://127.0.0.1:8000/api/";

export default function SportMasterPage() {
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
    sportType: '',
    dateRange: null
  });
  
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
    sportIssues: 0
  });
  
  const [actionLoading, setActionLoading] = useState({});
  
  // ================= SPORT MASTER SPECIFIC STATE =================
  const [sportRegistry, setSportRegistry] = useState([]);
  const [registrySearchId, setRegistrySearchId] = useState("");
  const [registrySearchName, setRegistrySearchName] = useState("");
  const [loadingRegistry, setLoadingRegistry] = useState(false);
  const [registerRecordModal, setRegisterRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("ucs_current");
    if (!stored) {
      message.error("Please login first");
      navigate("/login");
      return;
    }
    
    const parsed = JSON.parse(stored);
    if (parsed.role !== "sportmaster") {
      message.error("Access denied. Sport Master only.");
      navigate("/login");
      return;
    }
    
    setUser(parsed);
    setToken(parsed.token);
    loadForms(parsed.token);
    loadSportRegistry();
  }, [navigate]);

  const loadPendingPaymentsCount = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}payment/pending/`, {
        headers: { Authorization: `Token ${token}` }
      });
      if (res.data && Array.isArray(res.data)) {
        const sportPayments = res.data.filter(payment => payment.department_type === 'sportmaster');
        setPendingPaymentsCount(sportPayments.length);
      }
    } catch (err) {
      setPendingPaymentsCount(0);
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
        .filter(f => f.status === "approved_psychology")
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

  const checkStudentSportIssues = (studentId) => {
    return sportRegistry.some(record => 
      record.student_id === studentId && 
      record.status === 'pending'
    );
  };

  const getStudentSportIssues = (studentId) => {
    return sportRegistry.filter(record => record.student_id === studentId);
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
          
          // Check if student has sport issues
          const hasIssues = checkStudentSportIssues(form.id_number);
          
          if (hasIssues && batchAction === 'approve') {
            results.failed.push({
              id: formId,
              name: form.full_name,
              reason: 'Student has pending sport issues'
            });
            continue;
          }
          
          const payload = {
            action: batchAction,
            note: batchNotes || `Batch ${batchAction} by Sport Master`
          };
          
          if (batchAction === 'reject' && batchPaymentRequired) {
            payload.requires_payment = true;
            payload.payment_amount = parseFloat(batchPaymentAmount);
            payload.payment_reason = batchPaymentReason || 'Sport fee required';
          }
          
          const res = await axios.patch(
            `${API_BASE}sportmaster/action/${formId}/`,
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
              const newStatus = batchAction === 'approve' ? 'approved_sportmaster' : 'rejected';
              return { 
                ...f, 
                status: newStatus,
                sportmaster_note: batchNotes || f.sportmaster_note
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

  const getFilteredByCriteria = () => {
    let filtered = forms.filter(f => f.status === "approved_psychology");
    
    if (filterCriteria.department) {
      filtered = filtered.filter(f => f.department_name === filterCriteria.department);
    }
    
    if (filterCriteria.sportType) {
      filtered = filtered.filter(f => {
        const issues = getStudentSportIssues(f.id_number);
        return issues.some(i => i.sport_type === filterCriteria.sportType);
      });
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

  const getUniqueSportTypes = () => {
    const types = new Set(sportRegistry.map(r => r.sport_type).filter(Boolean));
    return Array.from(types);
  };

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
      const response = await axios.get(`${API_BASE}chat/sportmaster/students/`, {
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
      const response = await axios.get(`${API_BASE}chat/sportmaster/messages/${roomId}/`, {
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
      const response = await axios.post(`${API_BASE}chat/sportmaster/start/`, 
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
      message.error(err.response?.data?.error || 'Failed to start chat');
    }
  };

  const sendChatMessage = async () => {
    if (!newChatMessage.trim() || !selectedChatRoom) return;
    
    try {
      const response = await axios.post(`${API_BASE}chat/sportmaster/send/`, {
        room_id: selectedChatRoom.id,
        content: newChatMessage
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setChatMessages(prev => [...prev, response.data]);
      setNewChatMessage('');
    } catch (err) {
      message.error('Failed to send message');
    }
  };

  useEffect(() => {
    if (token) loadChatRooms();
  }, [token]);

  useEffect(() => {
    if (selectedChatRoom) {
      loadChatMessages(selectedChatRoom.id);
      const interval = setInterval(() => loadChatMessages(selectedChatRoom.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChatRoom]);

  const paymentVerificationMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === "payment-verification") {
          sessionStorage.setItem("payment_verification_dept", "sportmaster");
          navigate("/staff/payments");
        }
        if (key === "clearance-forms") loadForms(token);
        if (key === "sport-registry") setRegisterRecordModal(true);
      }}
      items={[
        {
          key: 'payment-verification',
          label: (
            <Space>
              <CheckSquareOutlined />
              <span>Payment Verification</span>
              {pendingPaymentsCount > 0 && <Badge count={pendingPaymentsCount} size="small" />}
            </Space>
          ),
        },
        {
          key: 'clearance-forms',
          label: (
            <Space>
              <FileTextOutlined />
              <span>Clearance Forms</span>
              {stats.pending > 0 && <Badge count={stats.pending} size="small" />}
            </Space>
          ),
        },
        {
          key: 'sport-registry',
          label: (
            <Space>
              <DatabaseOutlined />
              <span>Sport Registry</span>
              {sportRegistry.length > 0 && <Badge count={sportRegistry.length} size="small" />}
            </Space>
          ),
        },
      ]}
    />
  );

  const loadForms = async (authToken) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}sportmaster/forms/`, {
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
      }
      setForms([]);
      calculateStats([]);
    } finally {
      setLoading(false);
      loadPendingPaymentsCount();
    }
  };

  const loadSportRegistry = async () => {
    try {
      setLoadingRegistry(true);
      const savedRegistry = localStorage.getItem("sport_registry");
      if (savedRegistry) {
        setSportRegistry(JSON.parse(savedRegistry));
      } else {
        setSportRegistry([]);
      }
    } catch (err) {
      console.error("Error loading registry:", err);
      setSportRegistry([]);
    } finally {
      setLoadingRegistry(false);
    }
  };

  const saveSportRegistry = (registry) => {
    localStorage.setItem("sport_registry", JSON.stringify(registry));
    setSportRegistry(registry);
  };

  const registerNewRecord = async (values) => {
    try {
      const newRecord = {
        id: Date.now(),
        student_id: values.student_id,
        student_name: values.student_name,
        sport_type: values.sport_type,
        description: values.description,
        status: values.status,
        registered_date: dayjs().format('YYYY-MM-DD'),
        registered_by: user?.username || 'sportmaster'
      };

      const updatedRegistry = [...sportRegistry, newRecord];
      saveSportRegistry(updatedRegistry);
      message.success("Sport record registered successfully!");
      setRegisterRecordModal(false);
      form.resetFields();
      calculateStats(forms);
    } catch (err) {
      message.error("Failed to register record.");
    }
  };

  const updateRecord = async (values) => {
    try {
      const updatedRecord = {
        ...editingRecord,
        student_id: values.student_id,
        student_name: values.student_name,
        sport_type: values.sport_type,
        description: values.description,
        status: values.status
      };

      const updatedRegistry = sportRegistry.map(record => 
        record.id === editingRecord.id ? updatedRecord : record
      );
      saveSportRegistry(updatedRegistry);
      message.success("Record updated successfully!");
      setRegisterRecordModal(false);
      setEditingRecord(null);
      form.resetFields();
      calculateStats(forms);
    } catch (err) {
      message.error("Failed to update record.");
    }
  };

  const deleteRecord = (id) => {
    Modal.confirm({
      title: 'Delete Record',
      content: 'Are you sure you want to delete this record?',
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: () => {
        const updatedRegistry = sportRegistry.filter(record => record.id !== id);
        saveSportRegistry(updatedRegistry);
        message.success("Record deleted successfully!");
        calculateStats(forms);
      }
    });
  };

  const searchRegistry = () => {
    if (!registrySearchId.trim() && !registrySearchName.trim()) {
      return sportRegistry;
    }
    return sportRegistry.filter(record => 
      (registrySearchId && record.student_id.toLowerCase().includes(registrySearchId.toLowerCase())) ||
      (registrySearchName && record.student_name.toLowerCase().includes(registrySearchName.toLowerCase()))
    );
  };

  const viewFormDetails = (form) => {
    setSelectedForm(form);
    setViewModal(true);
  };

  const approveForm = async (formId, studentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [formId]: true }));
      
      confirm({
        title: 'Confirm Sport Clearance',
        content: 'Have you verified this student has no sport-related issues?',
        okText: 'Yes, Approve',
        onOk: async () => {
          try {
            const note = "Approved by Sport Master - No issues";
            const res = await axios.patch(
              `${API_BASE}sportmaster/action/${formId}/`,
              { action: "approve", note: note },
              { headers: { Authorization: `Token ${token}` } }
            );
            
            setForms(prev => prev.map(f => 
              f.id === formId ? { ...f, status: "approved_sportmaster", sportmaster_note: res.data.note } : f
            ));
            
            message.success("Form has approved successfully!");
            notification.success({
              message: 'Success',
              description: 'The Clearance form has been no any problems .',
            });
            
            setTimeout(() => loadForms(token), 1000);
          } catch (apiErr) {
            message.error(apiErr.response?.data?.error || "Approval failed.");
          }
        }
      });
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setActionLoading(prev => ({ ...prev, [formId]: false }));
    }
  };

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
        `${API_BASE}sportmaster/action/${selectedFormId}/`,
        payload,
        { headers: { Authorization: `Token ${token}` } }
      );
      
      message.success(res.data.message || "Form rejected successfully");
      
      setForms(prev => prev.map(f => {
        if (f.id === selectedFormId) {
          return { 
            ...f, 
            status: res.data.status || "rejected",
            sportmaster_note: res.data.note || rejectNote.trim()
          };
        }
        return f;
      }));
      
      setRejectModal(false);
      setRejectNote("");
      setRejectAction('reject_only');
      setPaymentAmount("");
      setPaymentReason("");
      setSelectedFormId(null);
      setSelectedStudentId(null);
      
      setTimeout(() => loadForms(token), 1000);
    } catch (err) {
      message.error(err.response?.data?.error || "Rejection failed");
    }
  };

  const calculateStats = (formsList) => {
    const stats = {
      total: formsList.length,
      pending: formsList.filter(f => f.status === "approved_psychology").length,
      approved: formsList.filter(f => f.status === "approved_sportmaster").length,
      rejected: formsList.filter(f => f.status === "rejected" && f.sportmaster_note).length,
      sportIssues: formsList.filter(f => checkStudentSportIssues(f.id_number)).length
    };
    setStats(stats);
  };

  const filteredForms = forms.filter((f) =>
    f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStatus = (status) => {
    switch(status) {
      case "approved_sportmaster":
        return <Badge status="success" text={<Space><CheckCircleOutlined /> APPROVED <Tag color="green">Sent to the forms</Tag></Space>} />;
      case "rejected":
        return <Badge status="error" text={<Space><CloseCircleOutlined /> REJECTED</Space>} />;
      case "approved_psychology":
        return <Badge status="processing" text={<Space><ClockCircleOutlined /> PENDING <Tag color="orange">Sport Master Review</Tag></Space>} />;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const renderClearanceFlow = (form) => {
    const currentStep = form.status === "approved_psychology" ? 4 : form.status === "approved_sportmaster" ? 5 : 0;
    return (
      <Steps size="small" current={currentStep} style={{ marginTop: 20 }}>
        <Step title="Dept. Head" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Library" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Cafeteria" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Psychology" description="Approved" icon={<CheckCircleOutlined />} />
        <Step title="Sport Master" description={form.status === "approved_sportmaster" ? "Approved" : "Review"} icon={form.status === "approved_sportmaster" ? <CheckCircleOutlined /> : <TrophyOutlined />} />
        <Step title="Campus Police" description="Waiting" icon={<HomeOutlined />} />
      </Steps>
    );
  };

  const registryColumns = [
    { title: 'Student ID', dataIndex: 'student_id', key: 'student_id', render: (text) => <Text strong>{text}</Text> },
    { title: 'Student Name', dataIndex: 'student_name', key: 'student_name' },
    { title: 'Sport Type', dataIndex: 'sport_type', key: 'sport_type', render: (type) => <Tag color="green">{type}</Tag> },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { 
      title: 'Status', dataIndex: 'status', key: 'status', 
      render: (status) => <Tag color={status === 'cleared' ? 'green' : 'orange'}>{status === 'cleared' ? 'CLEARED' : 'PENDING'}</Tag>
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit"><Button type="link" icon={<EditOutlined />} onClick={() => {
            form.setFieldsValue({
              student_id: record.student_id,
              student_name: record.student_name,
              sport_type: record.sport_type,
              description: record.description,
              status: record.status
            });
            setEditingRecord(record);
            setRegisterRecordModal(true);
          }} /></Tooltip>
          <Tooltip title="Delete"><Button type="link" danger icon={<DeleteOutlined />} onClick={() => deleteRecord(record.id)} /></Tooltip>
        </Space>
      ),
    },
  ];

  const renderFormCard = (form) => {
    const isPending = form.status === "approved_psychology";
    const isApproved = form.status === "approved_sportmaster";
    const hasSportIssues = checkStudentSportIssues(form.id_number);
    const sportIssues = getStudentSportIssues(form.id_number);
    
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
            hasSportIssues ? "#faad14" : 
            isPending ? "#1890ff" : "#ff4d4f"
          }`,
          cursor: 'pointer',
          background: hasSportIssues ? '#fff7e6' : 'white',
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
              <Text strong>{form.full_name}</Text>
              {hasSportIssues && (
                <Tooltip title={`Student has ${sportIssues.length} pending sport issue(s)`}>
                  <WarningOutlined style={{ color: '#faad14' }} />
                </Tooltip>
              )}
            </Space>
            {renderStatus(form.status)}
          </div>
        }
        extra={
          <Button type="link" icon={<EyeOutlined />} onClick={(e) => { 
            e.stopPropagation(); 
            viewFormDetails(form); 
          }} />
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            <Text><IdcardOutlined /> ID: {form.id_number}</Text><br />
            <Text><MailOutlined /> Email: {form.student_email || 'N/A'}</Text><br />
            <Text><FileTextOutlined /> Dept: {form.department_name}</Text>
          </Col>
          <Col span={12}>
            <Text>Year/Semester: {form.year} / {form.semester}</Text><br />
            <Text>Program: {form.program_level}</Text><br />
            <Text type="secondary"><HistoryOutlined /> Submitted: {dayjs(form.created_at).format('MMM D, YYYY HH:mm')}</Text>
          </Col>
        </Row>
        
        {hasSportIssues && (
          <Alert
            message="Pending Sport Issues"
            description={
              <div>
                <p>Student has {sportIssues.length} pending sport issue(s):</p>
                <ul>
                  {sportIssues.map(issue => (
                    <li key={issue.id}>
                      {issue.sport_type}: {issue.description}
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
        
        {form.psychology_note && <Alert message="Psychology Note" description={form.psychology_note} type="info" showIcon style={{ marginTop: 15 }} />}
        
        {isPending && !batchMode && (
          <Space style={{ marginTop: 15, width: '100%', justifyContent: 'center' }}>
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={() => approveForm(form.id, form.student_id || form.id_number)} 
              loading={actionLoading[form.id]} 
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
              disabled={hasSportIssues}
            >
              Approve
            </Button>
            <Popconfirm title="Reject this form?" onConfirm={() => openRejectModal(form.id, form.student_id || form.id_number)}>
              <Button danger icon={<CloseOutlined />}>Reject</Button>
            </Popconfirm>
          </Space>
        )}
        
        {form.sportmaster_note && (
          <Alert
            message="Sport Master Action"
            description={form.sportmaster_note}
            type={form.status === "rejected" ? "error" : "success"}
            showIcon
            style={{ marginTop: 10 }}
          />
        )}
      </Card>
    );
  };

  return (
    <div style={{ padding: 30, maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ marginBottom: 30, borderRadius: 15, background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', color: 'white' }} bodyStyle={{ padding: '20px 30px' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ color: 'white', margin: 0 }}><TrophyOutlined /> Sport Master Clearance</Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>Welcome, {user?.username || 'Sport Master'}</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<UserOutlined />} onClick={() => navigate("/profile")} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>Profile</Button>
              <Dropdown overlay={paymentVerificationMenu}>
                <Button type="primary" icon={<DollarCircleOutlined />} style={{ background: '#722ed1', border: 'none' }}>
                  <Space>Actions {pendingPaymentsCount > 0 && <Badge count={pendingPaymentsCount} />}</Space>
                </Button>
              </Dropdown>
              <Button onClick={() => setRegisterRecordModal(true)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                <DatabaseOutlined /> Registry {sportRegistry.length > 0 && <Badge count={sportRegistry.length} />}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => { loadForms(token); loadPendingPaymentsCount(); }} loading={loading} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }} />
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 30 }}>
        <Col xs={24} sm={12} md={6}><Card hoverable style={{ textAlign: 'center', border: '2px solid #52c41a' }}><Statistic title="Total Forms" value={stats.total} valueStyle={{ color: '#52c41a' }} prefix={<FileTextOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card hoverable style={{ textAlign: 'center', border: '2px solid #1890ff' }}><Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#1890ff' }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card hoverable style={{ textAlign: 'center', border: '2px solid #52c41a' }}><Statistic title="Approved" value={stats.approved} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card hoverable style={{ textAlign: 'center', border: '2px solid #faad14' }}><Statistic title="Sport Issues" value={stats.sportIssues} valueStyle={{ color: '#faad14' }} prefix={<FlagOutlined />} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="1">
        <TabPane 
          tab={
            <span>
              <TrophyOutlined /> Clearance Forms 
              {stats.pending > 0 && <Badge count={stats.pending} style={{ marginLeft: 8 }} />}
            </span>
          } 
          key="1"
        >
          {/* Batch Processing Controls */}
          <Card style={{ marginBottom: 20, borderRadius: 10, background: '#f6ffed' }}>
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
                        <Menu.Item key="dept" onClick={() => {}}>
                          <Space><FilterOutlined /> Filter by Department</Space>
                        </Menu.Item>
                        <Menu.Item key="sport" onClick={() => {}}>
                          <Space><TrophyOutlined /> Filter by Sport Type</Space>
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
          </Card>

          <Alert 
            message="SPORT MASTER CLEARANCE" 
            description="Verify student sport participation, equipment returns, and sport-related obligations." 
            type="info" 
            showIcon 
            style={{ marginBottom: 20 }} 
          />
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Spin size="large" />
              <p style={{ marginTop: 20 }}>Loading forms from Psychology...</p>
            </div>
          ) : filteredForms.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 60 }}>
              <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
              <Title level={4}>No forms awaiting sport clearance</Title>
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

        <TabPane tab={<span><MessageOutlined /> Live Chat</span>} key="chat">
          <div style={{ display: 'flex', gap: '20px', minHeight: '600px' }}>
            <div style={{ width: '350px', background: 'white', borderRadius: '10px', padding: '15px' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { loadStudentsForChat(); setShowChatModal(true); }} style={{ marginBottom: '15px', width: '100%' }}>Start Chat</Button>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {chatRooms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}><MessageOutlined style={{ fontSize: '40px' }} /><p>No active chats</p></div>
                ) : (
                  chatRooms.map(room => (
                    <Card key={room.id} size="small" style={{ marginBottom: '10px', cursor: 'pointer', background: selectedChatRoom?.id === room.id ? '#f6ffed' : 'white' }} onClick={() => setSelectedChatRoom(room)}>
                      <div><Text strong>{room.student?.full_name || 'Student'}</Text>{room.unread_count > 0 && <Badge count={room.unread_count} style={{ backgroundColor: '#52c41a' }} />}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>{room.last_message || 'No messages'}</div>
                    </Card>
                  ))
                )}
              </div>
            </div>
            <div style={{ flex: 1, background: 'white', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
              {selectedChatRoom ? (
                <>
                  <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '20px' }}>
                    <Title level={5}>Chat with {selectedChatRoom.student?.full_name}</Title>
                    <Text type="secondary">ID: {selectedChatRoom.student?.id_number}</Text>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    {loadingChat ? <Spin /> : chatMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}><MessageOutlined style={{ fontSize: '40px' }} /><p>No messages</p></div>
                    ) : (
                      chatMessages.map(msg => (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: msg.is_own ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                          <div style={{ maxWidth: '70%', padding: '10px 15px', borderRadius: '15px', background: msg.is_own ? '#52c41a' : '#f0f0f0', color: msg.is_own ? 'white' : '#333' }}>
                            <div>{msg.content}</div>
                            <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.7 }}>{new Date(msg.created_at).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <Input.TextArea rows={2} value={newChatMessage} onChange={(e) => setNewChatMessage(e.target.value)} onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); sendChatMessage(); } }} placeholder="Type message..." />
                    <Button type="primary" onClick={sendChatMessage} disabled={!newChatMessage.trim()}>Send</Button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                  <MessageOutlined style={{ fontSize: '60px' }} />
                  <Title level={4}>Select a chat</Title>
                </div>
              )}
            </div>
          </div>
          <Modal title="Start Chat" open={showChatModal} onCancel={() => setShowChatModal(false)} footer={null} width={600}>
            <Input placeholder="Search students..." prefix={<SearchOutlined />} style={{ marginBottom: '20px' }} />
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {loadingStudents ? <Spin /> : studentsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}><UserOutlined style={{ fontSize: '40px' }} /><p>No students</p></div>
              ) : (
                studentsList.map(student => (
                  <Card key={student.id} size="small" style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => {
                    if (student.has_existing_chat) {
                      const existingRoom = chatRooms.find(r => r.id === student.chat_room_id);
                      if (existingRoom) setSelectedChatRoom(existingRoom);
                    } else {
                      startChatWithStudent(student.id);
                    }
                    setShowChatModal(false);
                  }}>
                    <div><Text strong>{student.full_name}</Text><div style={{ fontSize: '12px', color: '#666' }}>ID: {student.id_number}</div></div>
                  </Card>
                ))
              )}
            </div>
          </Modal>
        </TabPane>

        <TabPane tab={<span><DatabaseOutlined /> Sport Registry</span>} key="2">
          <Card style={{ marginBottom: 20 }}>
            <Row gutter={16}>
              <Col span={8}><Input placeholder="Search by ID" value={registrySearchId} onChange={(e) => setRegistrySearchId(e.target.value)} prefix={<SearchOutlined />} /></Col>
              <Col span={8}><Input placeholder="Search by Name" value={registrySearchName} onChange={(e) => setRegistrySearchName(e.target.value)} prefix={<UserOutlined />} /></Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Space>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRecord(null); form.resetFields(); setRegisterRecordModal(true); }}>New Record</Button>
                  <Button icon={<ReloadOutlined />} onClick={loadSportRegistry} loading={loadingRegistry}>Refresh</Button>
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
            style={{ background: 'white' }}
            title={() => (
              <Space>
                <DatabaseOutlined />
                <Text strong>Sport Registry</Text>
                <Tag color="green">Total: {searchRegistry().length}</Tag>
                <Tag color="orange">Pending: {searchRegistry().filter(r => r.status === 'pending').length}</Tag>
                <Tag color="green">Cleared: {searchRegistry().filter(r => r.status === 'cleared').length}</Tag>
              </Space>
            )}
          />
        </TabPane>
      </Tabs>

      {/* Batch Processing Modal */}
      <Modal
        title={
          <Space>
            <RocketOutlined style={{ color: '#52c41a' }} />
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
                            label="Payment Reason"
                            required={batchPaymentRequired}
                          >
                            <Input
                              value={batchPaymentReason}
                              onChange={(e) => setBatchPaymentReason(e.target.value)}
                              placeholder="e.g., Sport equipment fee"
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

      <Modal title="Form Details" open={viewModal} onCancel={() => setViewModal(false)} footer={<Button onClick={() => setViewModal(false)}>Close</Button>} width={800}>
        {selectedForm && (
          <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Name" span={2}>{selectedForm.full_name}</Descriptions.Item>
              <Descriptions.Item label="ID">{selectedForm.id_number}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedForm.student_email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Department">{selectedForm.department_name}</Descriptions.Item>
              <Descriptions.Item label="Program">{selectedForm.program_level}</Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}><Card>{selectedForm.reason}</Card></Descriptions.Item>
            </Descriptions>
            
            {selectedForm.status === "approved_psychology" && (
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      setViewModal(false);
                      approveForm(selectedForm.id, selectedForm.student_id || selectedForm.id_number);
                    }}
                    style={{ background: "#52c41a" }}
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

      <Modal title="Reject Form" open={rejectModal} onOk={handleRejectForm} onCancel={() => setRejectModal(false)} okText={rejectAction === 'require_payment' ? "Require Payment" : "Reject"} okButtonProps={{ danger: true }} width={600}>
        <Alert message="Rejection Reason" type="warning" showIcon style={{ marginBottom: 20 }} />
        <Select style={{ width: '100%', marginBottom: 20 }} value={rejectAction} onChange={setRejectAction}>
          <Option value="reject_only">Reject Only</Option>
          <Option value="require_payment">Require Payment</Option>
        </Select>
        {rejectAction === 'require_payment' && (
          <div style={{ marginBottom: 20, padding: 15, background: '#f6f8fa' }}>
            <Input placeholder="Amount" prefix="$" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} style={{ marginBottom: 10 }} />
            <Input.TextArea placeholder="Reason" value={paymentReason} onChange={(e) => setPaymentReason(e.target.value)} rows={2} />
          </div>
        )}
        <Input.TextArea rows={4} placeholder="Rejection reason..." value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
      </Modal>

      <Modal title={editingRecord ? 'Edit Record' : 'New Record'} open={registerRecordModal} onCancel={() => { setRegisterRecordModal(false); setEditingRecord(null); form.resetFields(); }} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={editingRecord ? updateRecord : registerNewRecord}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="student_id" label="Student ID" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="student_name" label="Student Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="sport_type" label="Sport Type" rules={[{ required: true }]}>
            <Select><Option value="football">Football</Option><Option value="basketball">Basketball</Option><Option value="athletics">Athletics</Option><Option value="other">Other</Option></Select>
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select><Option value="pending">Pending</Option><Option value="cleared">Cleared</Option></Select>
          </Form.Item>
          <Form.Item><Space style={{ width: '100%', justifyContent: 'flex-end' }}><Button onClick={() => setRegisterRecordModal(false)}>Cancel</Button><Button type="primary" htmlType="submit">{editingRecord ? 'Update' : 'Register'}</Button></Space></Form.Item>
        </Form>
      </Modal>

      <div style={{ marginTop: 40, textAlign: 'center', borderTop: '1px solid #f0f0f0', padding: '20px 0' }}>
        <Text type="secondary">
          Sport Master Clearance • {new Date().getFullYear()} • 
          <span style={{ marginLeft: 8, color: '#52c41a' }}>
            Pending: {stats.pending} • Approved: {stats.approved}
          </span>
        </Text>
      </div>
    </div>
  );
}