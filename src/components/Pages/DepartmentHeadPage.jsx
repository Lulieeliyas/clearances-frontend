// DepartmentHeadPage.jsx - PROFESSIONAL UI VERSION WITH CLICKABLE STATS CARDS AND BATCH PROCESSING
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
  Tag,
  Menu,
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
  Progress,
  Divider,
  Upload,
  Avatar,
  Dropdown,
  Timeline,
  List,
  Empty,
  Tabs,
  Checkbox,
  Result
} from "antd";
import {
  LogoutOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  HistoryOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  DeleteOutlined,
  TeamOutlined,
  DashboardOutlined,
  BarChartOutlined,
  BellOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ProfileOutlined,
  MessageOutlined,
  WechatOutlined,
  ThunderboltOutlined,
  PhoneOutlined,
  SaveOutlined,
  SendOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  RiseOutlined,
  DashboardFilled,
  FileDoneOutlined,
  FileProtectOutlined,
  FileSyncOutlined,
  FileExcelOutlined,
  FileSearchOutlined,
  AppstoreOutlined,
  RocketOutlined,
  FilterOutlined,
  DeleteOutlined as DeleteIcon
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";

// Extend dayjs
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

const { Title, Text } = Typography;
const { Step } = Steps;
const { TextArea } = Input;
const { confirm } = Modal;
const API_BASE = "http://127.0.0.1:8000/api/";

export default function DepartmentHeadPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [batchForm] = Form.useForm();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
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
  const [selectAll, setSelectAll] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    department: '',
    year: '',
    dateRange: null
  });
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    efficiency: 0,
    avgResponse: "0h",
    pendingPercentage: 0,
    approvalPercentage: 0,
    rejectionPercentage: 0
  });
  const [profileModal, setProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [actionLoading, setActionLoading] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatMessages, setChatMessages] = useState({});
  const [studentsList, setStudentsList] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [refreshing, setRefreshing] = useState(false);
  const [formFilter, setFormFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  // ================= AUTH =================
  useEffect(() => {
    const stored = sessionStorage.getItem("ucs_current");
    if (!stored) {
      message.error("Please login first");
      navigate("/login");
      return;
    }
    
    const parsed = JSON.parse(stored);
    if (parsed.role !== "departmenthead") {
      message.error("Access denied. Department Head only.");
      navigate("/login");
      return;
    }
    
    setUser(parsed);
    setToken(parsed.token);
    loadDashboardData(parsed.token);
    loadProfileData(parsed.token);
    loadStudentsList(parsed.token);
  }, [navigate]);

  // ================= LOAD DASHBOARD DATA =================
  const loadDashboardData = async (authToken) => {
    try {
      setRefreshing(true);
      const [formsRes, profileRes, chatRes] = await Promise.all([
        axios.get(`${API_BASE}department-head/forms/`, {
          headers: { Authorization: `Token ${authToken}` }
        }),
        axios.get(`${API_BASE}profile/`, {
          headers: { Authorization: `Token ${authToken}` }
        }),
        axios.get(`${API_BASE}department-head/chat-rooms/`, {
          headers: { Authorization: `Token ${authToken}` }
        }).catch(err => ({ data: [] }))
      ]);
      
      if (formsRes.data && Array.isArray(formsRes.data)) {
        const formsData = formsRes.data;
        setForms(formsData);
        
        // Calculate stats
        const total = formsData.length;
        const pending = formsData.filter(f => f.status === "pending_department").length;
        const approved = formsData.filter(f => f.status === "approved_department").length;
        const rejected = formsData.filter(f => f.status === "rejected").length;
        const today = formsData.filter(f => 
          dayjs(f.created_at).isSame(dayjs(), 'day')
        ).length;
        const thisWeek = formsData.filter(f => 
          dayjs(f.created_at).isSame(dayjs(), 'week')
        ).length;
        const thisMonth = formsData.filter(f => 
          dayjs(f.created_at).isSame(dayjs(), 'month')
        ).length;
        
        const pendingPercentage = total > 0 ? (pending / total) * 100 : 0;
        const approvalPercentage = total > 0 ? (approved / total) * 100 : 0;
        const rejectionPercentage = total > 0 ? (rejected / total) * 100 : 0;
        const efficiency = total > 0 ? Math.round((approved / (approved + pending)) * 100) : 0;
        
        setStats({
          total,
          pending,
          approved,
          rejected,
          today,
          thisWeek,
          thisMonth,
          efficiency: isNaN(efficiency) ? 0 : efficiency,
          avgResponse: "2h 15m",
          pendingPercentage: Math.round(pendingPercentage),
          approvalPercentage: Math.round(approvalPercentage),
          rejectionPercentage: Math.round(rejectionPercentage)
        });
      }
      
      // Set profile data
      if (profileRes.data?.user) {
        setProfileData(profileRes.data.user);
      }
      
      // Set chat rooms
      if (chatRes.data && Array.isArray(chatRes.data)) {
        setChatRooms(chatRes.data);
      }
      
    } catch (err) {
      console.error("Load dashboard error:", err);
      if (err.response?.status === 401) {
        message.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        message.error("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ================= LOAD PROFILE DATA =================
  const loadProfileData = async (authToken) => {
    try {
      const res = await axios.get(`${API_BASE}profile/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      setProfileData(res.data?.user || {});
    } catch (err) {
      console.error("Load profile error:", err);
    }
  };

  // ================= LOAD STUDENTS LIST =================
  const loadStudentsList = async (authToken) => {
    try {
      const res = await axios.get(`${API_BASE}department-head/students/`, {
        headers: { Authorization: `Token ${authToken}` }
      }).catch(err => ({ data: [] }));
      
      const students = Array.isArray(res.data) ? res.data : [];
      setStudentsList(students.map(student => ({
        id: student.id || Math.random().toString(36).substr(2, 9),
        full_name: student.full_name || student.name || 'Unknown Student',
        username: student.username || 'unknown',
        email: student.email || `${student.full_name?.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
        id_number: student.id_number || student.student_id || 'N/A',
        program: student.program || student.program_level || 'N/A',
        has_existing_chat: student.has_existing_chat || false,
        chat_room_id: student.chat_room_id || null,
        last_login: student.last_login || null
      })));
      
    } catch (err) {
      console.error("Load students error:", err);
      setStudentsList([]);
    }
  };

  // ================= VIEW FORM DETAILS =================
  const viewFormDetails = (form) => {
    setSelectedForm(form);
    setViewModal(true);
  };

  // ================= APPROVE FORM =================
  const approveForm = async (formId) => {
    try {
      setActionLoading(prev => ({ ...prev, [formId]: true }));
      
      const res = await axios.patch(
        `${API_BASE}department-head/action/${formId}/`,
        { action: "approve" },
        { headers: { Authorization: `Token ${token}` } }
      );
      
      setForms(prev => prev.map(f => 
        f.id === formId ? { 
          ...f, 
          status: "approved_department",
          department_note: res.data.note
        } : f
      ));
      
      message.success("Form approved successfully!");
      
      notification.success({
        message: 'Approval Successful',
        description: 'Form has been approved Successfully .',
        duration: 4,
      });
      
      // Reload stats
      setTimeout(() => loadDashboardData(token), 1000);
      
    } catch (err) {
      console.error("Approve error:", err);
      message.error(err.response?.data?.error || "Approval failed");
    } finally {
      setActionLoading(prev => ({ ...prev, [formId]: false }));
    }
  };

  // ================= OPEN REJECT MODAL =================
  const openRejectModal = (formId, studentId) => {
    setSelectedFormId(formId);
    setSelectedStudentId(studentId);
    setRejectNote("");
    setRejectModal(true);
  };

  // ================= HANDLE REJECT FORM =================
  const handleRejectForm = async () => {
    if (!rejectNote.trim()) {
      message.error("Please provide a rejection reason");
      return;
    }
    
    try {
      const res = await axios.patch(
        `${API_BASE}department-head/action/${selectedFormId}/`,
        { 
          action: "reject", 
          note: rejectNote.trim()
        },
        { headers: { Authorization: `Token ${token}` } }
      );
      
      setForms(prev => prev.map(f => 
        f.id === selectedFormId ? { 
          ...f, 
          status: "rejected",
          department_note: res.data.note
        } : f
      ));
      
      message.success("Form rejected successfully!");
      setRejectModal(false);
      setRejectNote("");
      setSelectedFormId(null);
      setSelectedStudentId(null);
      
      notification.error({
        message: 'Form Rejected',
        description: 'Form has been rejected and returned to student.',
        duration: 4,
      });
      
      // Reload stats
      setTimeout(() => loadDashboardData(token), 1000);
      
    } catch (err) {
      console.error("Reject error:", err);
      message.error(err.response?.data?.error || "Rejection failed");
    }
  };

  // ================= UPDATE PROFILE =================
  const updateProfile = async (values) => {
    try {
      setProfileLoading(true);
      await axios.patch(
        `${API_BASE}profile/update/`,
        values,
        { headers: { Authorization: `Token ${token}` } }
      );
      
      message.success("Profile updated successfully");
      setProfileModal(false);
      loadProfileData(token);
      
    } catch (err) {
      console.error("Update profile error:", err);
      message.error("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // ================= UPLOAD PROFILE PICTURE =================
  const uploadProfilePicture = async (file) => {
    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("profile_picture", file);
      
      await axios.post(
        `${API_BASE}profile/picture/upload/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      message.success("Profile picture updated");
      loadProfileData(token);
      
    } catch (err) {
      console.error("Upload error:", err);
      message.error("Failed to upload picture");
    } finally {
      setUploadingPhoto(false);
    }
    
    return false;
  };

  // ================= DELETE PROFILE PICTURE =================
  const deleteProfilePicture = async () => {
    try {
      await axios.delete(
        `${API_BASE}profile/picture/remove/`,
        {
          headers: { Authorization: `Token ${token}` }
        }
      );
      
      message.success("Profile picture removed");
      loadProfileData(token);
      
    } catch (err) {
      console.error("Delete profile picture error:", err);
      message.error("Failed to remove profile picture");
    }
  };

  // ================= LOAD CHAT MESSAGES =================
  const loadChatMessages = async (roomId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}chat/messages/${roomId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      if (res.data && res.data.messages) {
        setChatMessages(prev => ({
          ...prev,
          [roomId]: res.data.messages
        }));
      }
      
      const selectedRoom = chatRooms.find(room => room.id === roomId);
      setSelectedChat(selectedRoom);
      
    } catch (err) {
      console.error("Load messages error:", err);
      message.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async (roomId) => {
    if (!messageInput.trim()) {
      message.warning("Please enter a message");
      return;
    }
    
    try {
      setSendingMessage(true);
      
      const formData = new FormData();
      formData.append('room_id', roomId);
      formData.append('content', messageInput);
      formData.append('message_type', 'text');
      
      const res = await axios.post(`${API_BASE}chat/send/`, formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data && res.data.data) {
        // Add the new message to the chat
        const newMessage = res.data.data;
        setChatMessages(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), newMessage]
        }));
        
        // Clear input
        setMessageInput("");
        
        // Update chat rooms list with new last message
        setChatRooms(prev => prev.map(room => 
          room.id === roomId ? {
            ...room,
            last_message: messageInput.substring(0, 100),
            last_message_time: new Date().toISOString(),
            unread_count: 0
          } : room
        ));
        
        message.success("Message sent");
      }
      
    } catch (err) {
      console.error("Send message error:", err);
      message.error(err.response?.data?.error || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // ================= START NEW CHAT =================
  const startNewChat = async (studentId) => {
    try {
      const student = studentsList.find(s => s.id === studentId);
      if (!student) {
        message.error("Student not found");
        return;
      }
      
      if (student.has_existing_chat && student.chat_room_id) {
        loadChatMessages(student.chat_room_id);
        message.info("Chat already exists");
        return;
      }
      
      message.warning("Please ask the student to initiate the chat from their dashboard");
      
    } catch (err) {
      console.error("Start chat error:", err);
      message.error("Failed to start chat");
    }
  };

  // ================= EXPORT FORMS =================
  const exportForms = async () => {
    try {
      setExportLoading(true);
      
      // Create CSV content
      const headers = ['ID', 'Student Name', 'ID Number', 'Program Level', 'Department', 'Status', 'Submitted Date', 'Reason'];
      const rows = forms.map(form => [
        form.id,
        form.full_name || 'Unknown',
        form.id_number || 'N/A',
        form.program_level || 'N/A',
        form.department_name || 'N/A',
        form.status,
        dayjs(form.created_at).format('YYYY-MM-DD HH:mm'),
        form.reason || 'N/A'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `department_forms_${dayjs().format('YYYYMMDD')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success("Forms exported successfully");
      
    } catch (err) {
      console.error("Export error:", err);
      message.error("Failed to export forms");
    } finally {
      setExportLoading(false);
    }
  };

  // ================= SORT FORMS =================
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // ================= FILTER FORMS BY STATUS =================
  const filterFormsByStatus = (status) => {
    setFormFilter(status);
    setActiveTab("forms");
  };

  // ================= GET FILTERED & SORTED FORMS =================
  const getFilteredSortedForms = () => {
    let filtered = forms.filter((f) => {
      // First apply search filter
      const searchMatch = 
        f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.student_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Then apply status filter if not 'all'
      if (formFilter === 'all') {
        return searchMatch;
      } else if (formFilter === 'pending') {
        return searchMatch && f.status === "pending_department";
      } else if (formFilter === 'approved') {
        return searchMatch && f.status === "approved_department";
      } else if (formFilter === 'rejected') {
        return searchMatch && f.status === "rejected";
      }
      
      return searchMatch;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }
        
        if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  // ================= REFRESH DATA =================
  const handleRefresh = () => {
    loadDashboardData(token);
    message.loading("Refreshing data...", 1);
  };

  // ================= LOGOUT =================
  const logout = () => {
    sessionStorage.clear();
    message.success("Logged out successfully");
    navigate("/login");
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
      const pendingForms = getFilteredSortedForms()
        .filter(f => f.status === "pending_department")
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
          
          // Check if form is pending
          if (form.status !== "pending_department") {
            results.failed.push({
              id: formId,
              name: form.full_name,
              reason: 'Form is not in pending status'
            });
            continue;
          }
          
          const payload = {
            action: batchAction,
            note: batchNotes || `Batch ${batchAction} by Department Head`
          };
          
          const res = await axios.patch(
            `${API_BASE}department-head/action/${formId}/`,
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
              const newStatus = batchAction === 'approve' ? 'approved_department' : 'rejected';
              return { 
                ...f, 
                status: newStatus,
                department_note: batchNotes || f.department_note
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
        loadDashboardData(token);
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
    let filtered = forms.filter(f => f.status === "pending_department");
    
    if (filterCriteria.department) {
      filtered = filtered.filter(f => f.department_name === filterCriteria.department);
    }
    
    if (filterCriteria.year) {
      filtered = filtered.filter(f => f.year === filterCriteria.year);
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

  const getUniqueYears = () => {
    const years = new Set(forms.map(f => f.year).filter(Boolean));
    return Array.from(years);
  };

  // ================= RENDER STATUS =================
  const renderStatus = (status) => {
    switch(status) {
      case "approved_department":
        return (
          <Badge 
            status="success" 
            text={
              <Space>
                <CheckCircleOutlined />
                <span style={{ fontWeight: 'bold' }}>APPROVED</span>
                <Tag color="green">Sent to Library</Tag>
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
      case "pending_department":
        return (
          <Badge 
            status="processing" 
            text={
              <Space>
                <ClockCircleOutlined />
                <span style={{ fontWeight: 'bold' }}>PENDING</span>
                <Tag color="blue"> Review Required</Tag>
              </Space>
            }
          />
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // ================= RENDER STATS CARDS =================
  const renderStatsCards = () => {
    const cards = [
      {
        title: "Total Forms",
        value: stats.total,
        icon: <FileTextOutlined />,
        color: "#1890ff",
        description: "All clearance forms",
        onClick: () => filterFormsByStatus('all')
      },
      {
        title: "Pending Review",
        value: stats.pending,
        icon: <FileSyncOutlined />,
        color: "#faad14",
        description: "Awaiting your action",
        onClick: () => filterFormsByStatus('pending'),
        progress: {
          percent: stats.pendingPercentage,
          status: 'active',
          strokeColor: '#faad14'
        }
      },
      {
        title: "Approved",
        value: stats.approved,
        icon: <FileDoneOutlined />,
        color: "#52c41a",
        description: "Sent to Library",
        onClick: () => filterFormsByStatus('approved'),
        progress: {
          percent: stats.approvalPercentage,
          status: 'success',
          strokeColor: '#52c41a'
        }
      },
      {
        title: "Rejected",
        value: stats.rejected,
        icon: <FileExcelOutlined />,
        color: "#ff4d4f",
        description: "Returned to students",
        onClick: () => filterFormsByStatus('rejected'),
        progress: {
          percent: stats.rejectionPercentage,
          status: 'exception',
          strokeColor: '#ff4d4f'
        }
      }
    ];

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
        {cards.map((card, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              hoverable
              onClick={card.onClick}
              style={{
                borderRadius: '12px',
                border: `2px solid ${card.color}`,
                background: 'white',
                boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                transition: 'all 0.3s',
                cursor: 'pointer',
                height: '100%'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${card.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {React.cloneElement(card.icon, { 
                    style: { 
                      fontSize: '24px', 
                      color: card.color 
                    } 
                  })}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Title level={3} style={{ 
                    margin: 0, 
                    color: card.color,
                    fontSize: '32px'
                  }}>
                    {card.value}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Forms
                  </Text>
                </div>
              </div>
              
              <Text strong style={{ 
                fontSize: '16px',
                display: 'block',
                marginBottom: '8px'
              }}>
                {card.title}
              </Text>
              
              <Text type="secondary" style={{ 
                fontSize: '12px',
                display: 'block',
                marginBottom: card.progress ? '12px' : '0'
              }}>
                {card.description}
              </Text>
              
              {card.progress && (
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={card.progress.percent} 
                    size="small" 
                    status={card.progress.status}
                    strokeColor={card.progress.strokeColor}
                    showInfo={false}
                  />
                  <Text type="secondary" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {card.progress.percent}% of total
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // ================= RENDER PERFORMANCE METRICS =================
  const renderPerformanceMetrics = () => {
    const metrics = [
      {
        title: "Today's Forms",
        value: stats.today,
        icon: <CalendarOutlined />,
        color: "#722ed1",
        description: "Forms submitted today",
        trend: stats.today > 5 ? "up" : "steady"
      },
      {
        title: "This Week",
        value: stats.thisWeek,
        icon: <HistoryOutlined />,
        color: "#13c2c2",
        description: "Forms this week",
        trend: stats.thisWeek > 20 ? "up" : "steady"
      },
      {
        title: "Efficiency",
        value: stats.efficiency,
        suffix: "%",
        icon: <ThunderboltOutlined />,
        color: "#fa8c16",
        description: "Approval rate",
        trend: stats.efficiency > 80 ? "up" : stats.efficiency > 50 ? "steady" : "down"
      },
      {
        title: "Avg Response",
        value: stats.avgResponse,
        icon: <ClockCircleOutlined />,
        color: "#eb2f96",
        description: "Time to review",
        trend: "steady"
      }
    ];

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
        {metrics.map((metric, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              style={{ 
                borderRadius: '12px',
                border: `1px solid #f0f0f0`,
                background: 'white',
                height: '100%'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${metric.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  {React.cloneElement(metric.icon, { 
                    style: { 
                      fontSize: '20px', 
                      color: metric.color 
                    } 
                  })}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {metric.title}
                  </Text>
                  <Title level={4} style={{ margin: 0, color: metric.color }}>
                    {metric.value}{metric.suffix || ''}
                  </Title>
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {metric.description}
              </Text>
              {metric.trend && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginTop: '8px'
                }}>
                  <RiseOutlined style={{ 
                    color: metric.trend === 'up' ? '#52c41a' : 
                           metric.trend === 'down' ? '#ff4d4f' : '#faad14',
                    marginRight: '4px'
                  }} />
                  <Text style={{ 
                    fontSize: '11px',
                    color: metric.trend === 'up' ? '#52c41a' : 
                           metric.trend === 'down' ? '#ff4d4f' : '#faad14'
                  }}>
                    {metric.trend === 'up' ? 'Good' : 
                     metric.trend === 'down' ? 'Needs improvement' : 'Steady'}
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // ================= RENDER REFRESH BUTTONS =================
  const renderRefreshButtons = () => {
    return (
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Tooltip title="Refresh all data">
          <Button
            type="primary"
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={handleRefresh}
            loading={refreshing}
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh All'}
          </Button>
        </Tooltip>
        
        <Tooltip title="Export to CSV">
          <Button
            icon={<DownloadOutlined />}
            onClick={exportForms}
            loading={exportLoading}
            style={{
              borderColor: '#52c41a',
              color: '#52c41a'
            }}
          >
            Export Data
          </Button>
        </Tooltip>
        
        <Tooltip title="Quick Stats">
          <Button
            icon={<BarChartOutlined />}
            onClick={() => setActiveTab("dashboard")}
            type="text"
          >
            Dashboard
          </Button>
        </Tooltip>
      </Space>
    );
  };

  // ================= RENDER CLEARANCE FLOW =================
  const renderClearanceFlow = (form) => {
    let currentStep = 0;
    let steps = [];
    
    if (form.status === "pending_department") {
      currentStep = 0;
      steps = [
        { title: "Department", status: "process", icon: <ClockCircleOutlined /> },
        { title: "Library", status: "wait", icon: <ShopOutlined /> },
        { title: "Cafeteria", status: "wait", icon: <ShopOutlined /> },
        { title: "Dormitory", status: "wait", icon: <ShopOutlined /> },
        { title: "Completed", status: "wait", icon: <CheckCircleOutlined /> }
      ];
    } else if (form.status === "approved_department") {
      currentStep = 1;
      steps = [
        { title: "Department", status: "finish", icon: <CheckCircleOutlined /> },
        { title: "Library", status: "process", icon: <ClockCircleOutlined /> },
        { title: "Cafeteria", status: "wait", icon: <ShopOutlined /> },
        { title: "Dormitory", status: "wait", icon: <ShopOutlined /> },
        { title: "Completed", status: "wait", icon: <CheckCircleOutlined /> }
      ];
    } else if (form.status === "rejected") {
      currentStep = 0;
      steps = [
        { title: "Department", status: "error", icon: <CloseCircleOutlined /> },
        { title: "Library", status: "wait", icon: <ShopOutlined /> },
        { title: "Cafeteria", status: "wait", icon: <ShopOutlined /> },
        { title: "Dormitory", status: "wait", icon: <ShopOutlined /> },
        { title: "Completed", status: "wait", icon: <CheckCircleOutlined /> }
      ];
    }
    
    return (
      <Steps size="small" current={currentStep} style={{ marginTop: 20 }}>
        {steps.map((step, index) => (
          <Step 
            key={index}
            title={step.title}
            icon={step.icon}
            status={step.status}
          />
        ))}
      </Steps>
    );
  };

  // ================= RENDER FORM CARD =================
  const renderFormCard = (form) => {
    const isPending = form.status === "pending_department";
    
    return (
      <Card
        key={form.id}
        hoverable
        style={{
          marginBottom: 15,
          borderRadius: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          borderLeft: `5px solid ${
            form.status === "approved_department" ? "#52c41a" :
            form.status === "rejected" ? "#ff4d4f" : "#1890ff"
          }`,
          transition: 'all 0.3s',
          cursor: 'pointer',
          background: selectedForms.includes(form.id) ? '#f0f5ff' : 'white'
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
            </Space>
            {renderStatus(form.status)}
          </div>
        }
        extra={
          <Space>
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
              <Text>
                <IdcardOutlined /> ID: {form.id_number}
              </Text>
              <Text>
                <MailOutlined /> Email: {form.student_email || 'N/A'}
              </Text>
              <Text>
                <FileTextOutlined /> Dept: {form.department_name}
              </Text>
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
        
        {renderClearanceFlow(form)}
        
        {form.reason && (
          <Alert
            message="Clearance Reason"
            description={form.reason}
            type="info"
            showIcon
            style={{ marginTop: 15 }}
          />
        )}
        
        {isPending && !batchMode && (
          <Space style={{ marginTop: 15, width: '100%', justifyContent: 'center' }}>
            <Popconfirm
              title="Approve Clearance"
              description="Are you sure you want to approve this form?"
              onConfirm={(e) => {
                e?.stopPropagation();
                approveForm(form.id);
              }}
              okText="Yes, Approve"
              cancelText="Cancel"
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={(e) => e.stopPropagation()}
                loading={actionLoading[form.id]}
                style={{ 
                  background: "#52c41a", 
                  borderColor: "#52c41a"
                }}
              >
                Approve
              </Button>
            </Popconfirm>
            
            <Popconfirm
              title="Reject Clearance"
              description="Are you sure you want to reject and return to student?"
              onConfirm={(e) => {
                e?.stopPropagation();
                openRejectModal(form.id, form.student_id || form.id_number);
              }}
              okText="Yes, Reject"
              cancelText="Cancel"
            >
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={(e) => e.stopPropagation()}
                style={{ background: "#ff4d4f", borderColor: "#ff4d4f" }}
              >
                Reject
              </Button>
            </Popconfirm>
          </Space>
        )}
        
        {form.department_note && (
          <Alert
            message="Department Head Action"
            description={form.department_note}
            type={form.status === "approved_department" ? "success" : "error"}
            showIcon
            style={{ marginTop: 10 }}
          />
        )}
      </Card>
    );
  };

  // ================= RENDER DASHBOARD =================
  const renderDashboard = () => {
    const recentForms = forms.slice(0, 5);
    const todayForms = forms.filter(f => dayjs(f.created_at).isSame(dayjs(), 'day'));

    return (
      <>
        {/* Refresh Button */}
        {renderRefreshButtons()}

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Performance Metrics */}
        {renderPerformanceMetrics()}

        {/* Recent Activity & Today's Forms */}
        <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <HistoryOutlined style={{ color: '#1890ff' }} />
                  <span>Recent Activity</span>
                </Space>
              }
              extra={
                <Button type="link" size="small" onClick={() => setActiveTab("forms")}>
                  View All
                </Button>
              }
              style={{ borderRadius: 10, height: '100%' }}
            >
              <Timeline
                mode="left"
                items={[
                  {
                    label: dayjs().format('HH:mm'),
                    children: 'Approved form from John Doe',
                    color: 'green'
                  },
                  {
                    label: dayjs().subtract(1, 'hour').format('HH:mm'),
                    children: 'Rejected form with feedback',
                    color: 'red'
                  },
                  {
                    label: dayjs().subtract(2, 'hour').format('HH:mm'),
                    children: 'New form submitted by Jane Smith',
                    color: 'blue'
                  },
                  {
                    label: dayjs().subtract(3, 'hour').format('HH:mm'),
                    children: 'Updated department information',
                    color: 'orange'
                  }
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: '#fa8c16' }} />
                  <span>Today's Forms</span>
                  <Badge count={todayForms.length} />
                </Space>
              }
              style={{ borderRadius: 10, height: '100%' }}
            >
              {todayForms.length > 0 ? (
                <List
                  dataSource={todayForms.slice(0, 4)}
                  renderItem={form => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<EyeOutlined />}
                          onClick={() => viewFormDetails(form)}
                          size="small"
                        >
                          View
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={form.full_name}
                        description={`ID: ${form.id_number} • ${form.program_level}`}
                      />
                      {renderStatus(form.status)}
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="No forms submitted today" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Recent Forms */}
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <span>Recent Forms</span>
              <Badge count={recentForms.length} />
            </Space>
          }
          extra={
            <Button type="link" onClick={() => setActiveTab("forms")}>
              View All →
            </Button>
          }
          style={{ borderRadius: 10 }}
        >
          {recentForms.length > 0 ? (
            recentForms.map(renderFormCard)
          ) : (
            <Empty 
              description="No recent forms" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </>
    );
  };

  // ================= RENDER FORMS TAB =================
  const renderFormsTab = () => {
    const filteredForms = getFilteredSortedForms();
    const pendingForms = filteredForms.filter(f => f.status === "pending_department");
    
    // Get the filter status for display
    const getFilterDisplay = () => {
      switch(formFilter) {
        case 'pending': return 'Pending Forms';
        case 'approved': return 'Approved Forms';
        case 'rejected': return 'Rejected Forms';
        default: return 'All Forms';
      }
    };

    // Get the count for the current filter
    const getFilteredCount = () => {
      switch(formFilter) {
        case 'pending': return stats.pending;
        case 'approved': return stats.approved;
        case 'rejected': return stats.rejected;
        default: return stats.total;
      }
    };

    const columns = [
      {
        title: 'Select',
        key: 'select',
        width: 50,
        render: (_, record) => (
          record.status === "pending_department" && batchMode && (
            <Checkbox
              checked={selectedForms.includes(record.id)}
              onChange={(e) => {
                e.stopPropagation();
                toggleSelectForm(record.id);
              }}
            />
          )
        )
      },
      {
        title: 'Student',
        dataIndex: 'full_name',
        key: 'student',
        width: 200,
        render: (text, record) => (
          <Space>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                background: record.status === "approved_department" ? '#52c41a' :
                          record.status === "rejected" ? '#ff4d4f' : '#1890ff'
              }}
            />
            <div>
              <Text strong style={{ fontSize: '14px' }}>{text || 'Unknown'}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  ID: {record.id_number || 'N/A'}
                </Text>
              </div>
            </div>
          </Space>
        )
      },
      {
        title: 'Program',
        dataIndex: 'program_level',
        key: 'program',
        width: 150,
        render: (text, record) => (
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: '13px' }}>{text || 'N/A'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Year {record.year || 'N/A'} • Sem {record.semester || 'N/A'}
            </Text>
          </Space>
        )
      },
      {
        title: 'Department',
        dataIndex: 'department_name',
        key: 'department',
        width: 180,
        render: (text) => (
          <Tag 
            color="blue" 
            style={{ 
              borderRadius: '12px',
              fontSize: '12px'
            }}
          >
            {text || 'N/A'}
          </Tag>
        )
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 180,
        render: renderStatus
      },
      {
        title: 'Submitted',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 140,
        render: (date) => (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: '13px' }}>{dayjs(date).format('MMM D, YYYY')}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {dayjs(date).fromNow()}
            </Text>
          </Space>
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 200,
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                icon={<EyeOutlined />}
                onClick={() => viewFormDetails(record)}
                size="small"
              />
            </Tooltip>
            {record.status === "pending_department" && (
              <>
                <Tooltip title="Approve">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => approveForm(record.id)}
                    loading={actionLoading[record.id]}
                    size="small"
                    style={{ 
                      background: '#52c41a',
                      borderColor: '#52c41a'
                    }}
                  />
                </Tooltip>
                <Tooltip title="Reject">
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => openRejectModal(record.id, record.student_id || record.id_number)}
                    size="small"
                  />
                </Tooltip>
              </>
            )}
          </Space>
        )
      }
    ];

    return (
      <>
        <Alert
          message={`Department Head - ${getFilterDisplay()}`}
          description={
            formFilter === 'pending' 
              ? "Review and take action on pending clearance forms"
              : formFilter === 'approved'
              ? "Forms that have been approved and sent to Library"
              : formFilter === 'rejected'
              ? "Forms that have been rejected and returned to students"
              : "All clearance forms in the system"
          }
          type={
            formFilter === 'pending' ? 'warning' :
            formFilter === 'approved' ? 'success' :
            formFilter === 'rejected' ? 'error' : 'info'
          }
          showIcon
          style={{ marginBottom: 20, borderRadius: 10 }}
        />

        {/* Batch Processing Controls */}
        <Card style={{ marginBottom: 20, borderRadius: 10, background: '#f0f5ff' }}>
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
                      indeterminate={selectedForms.length > 0 && selectedForms.length < pendingForms.length}
                    >
                      Select All ({selectedForms.length} / {pendingForms.length})
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
                      icon={<DeleteIcon />} 
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
                      <Menu.Item key="year">
                        <Space><CalendarOutlined /> Filter by Year</Space>
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button icon={<FilterOutlined />}>Filter</Button>
                </Dropdown>
                
                <Input
                  placeholder="Search forms..."
                  style={{ width: 200 }}
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                {filterCriteria.year && (
                  <Tag closable onClose={() => setFilterCriteria(prev => ({ ...prev, year: '' }))}>
                    Year: {filterCriteria.year}
                  </Tag>
                )}
                <Button type="link" size="small" onClick={() => setFilterCriteria({
                  department: '',
                  year: '',
                  dateRange: null
                })}>
                  Clear All
                </Button>
              </Space>
            </div>
          )}
        </Card>

        {/* Filter Tabs and Search Bar */}
        <Card 
          style={{ 
            marginBottom: 20, 
            borderRadius: 10,
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          {/* Status Filter Tabs */}
          <div style={{ marginBottom: 16 }}>
            <Space size="middle">
              <Button 
                type={formFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setFormFilter('all')}
                style={{
                  background: formFilter === 'all' ? '#1890ff' : 'white',
                  borderColor: formFilter === 'all' ? '#1890ff' : '#d9d9d9'
                }}
              >
                <Space>
                  <FileTextOutlined />
                  All Forms
                  <Badge 
                    count={stats.total} 
                    style={{ 
                      backgroundColor: formFilter === 'all' ? 'white' : '#1890ff',
                      color: formFilter === 'all' ? '#1890ff' : 'white'
                    }} 
                  />
                </Space>
              </Button>
              
              <Button 
                type={formFilter === 'pending' ? 'primary' : 'default'}
                onClick={() => setFormFilter('pending')}
                style={{
                  background: formFilter === 'pending' ? '#faad14' : 'white',
                  borderColor: formFilter === 'pending' ? '#faad14' : '#d9d9d9',
                  color: formFilter === 'pending' ? 'white' : '#faad14'
                }}
              >
                <Space>
                  <ClockCircleOutlined />
                  Pending
                  <Badge 
                    count={stats.pending} 
                    style={{ 
                      backgroundColor: formFilter === 'pending' ? 'white' : '#faad14',
                      color: formFilter === 'pending' ? '#faad14' : 'white'
                    }} 
                  />
                </Space>
              </Button>
              
              <Button 
                type={formFilter === 'approved' ? 'primary' : 'default'}
                onClick={() => setFormFilter('approved')}
                style={{
                  background: formFilter === 'approved' ? '#52c41a' : 'white',
                  borderColor: formFilter === 'approved' ? '#52c41a' : '#d9d9d9',
                  color: formFilter === 'approved' ? 'white' : '#52c41a'
                }}
              >
                <Space>
                  <CheckCircleOutlined />
                  Approved
                  <Badge 
                    count={stats.approved} 
                    style={{ 
                      backgroundColor: formFilter === 'approved' ? 'white' : '#52c41a',
                      color: formFilter === 'approved' ? '#52c41a' : 'white'
                    }} 
                  />
                </Space>
              </Button>
              
              <Button 
                type={formFilter === 'rejected' ? 'primary' : 'default'}
                onClick={() => setFormFilter('rejected')}
                style={{
                  background: formFilter === 'rejected' ? '#ff4d4f' : 'white',
                  borderColor: formFilter === 'rejected' ? '#ff4d4f' : '#d9d9d9',
                  color: formFilter === 'rejected' ? 'white' : '#ff4d4f'
                }}
              >
                <Space>
                  <CloseCircleOutlined />
                  Rejected
                  <Badge 
                    count={stats.rejected} 
                    style={{ 
                      backgroundColor: formFilter === 'rejected' ? 'white' : '#ff4d4f',
                      color: formFilter === 'rejected' ? '#ff4d4f' : 'white'
                    }} 
                  />
                </Space>
              </Button>
            </Space>
          </div>

          {/* Search Bar and Actions */}
          <Row gutter={16} align="middle">
            <Col span={16}>
              <Input
                placeholder={`Search ${getFilterDisplay().toLowerCase()} by Name, ID, Department, or Email`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                size="large"
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={8}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={exportForms}
                  loading={exportLoading}
                  type="primary"
                >
                  Export
                </Button>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={() => loadDashboardData(token)}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">
              Showing {filteredForms.length} of {getFilteredCount()} {getFilterDisplay().toLowerCase()}
              {batchMode && pendingForms.length > 0 && ` • ${selectedForms.length} selected`}
            </Text>
            <Space>
              <Button 
                type="text" 
                icon={<SortAscendingOutlined />}
                onClick={() => handleSort('full_name')}
                size="small"
              >
                Sort A-Z
              </Button>
              <Button 
                type="text" 
                icon={<SortDescendingOutlined />}
                onClick={() => handleSort('created_at')}
                size="small"
              >
                Sort by Date
              </Button>
            </Space>
          </div>
        </Card>

        {/* Forms Table */}
        <Card style={{ borderRadius: 10, background: 'white' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Spin size="large" />
              <p style={{ marginTop: 20, fontSize: '16px', color: '#666' }}>
                Loading clearance forms...
              </p>
            </div>
          ) : filteredForms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Empty 
                description={
                  searchTerm ? `No results for "${searchTerm}" in ${getFilterDisplay().toLowerCase()}` : `No ${getFilterDisplay().toLowerCase()} found`
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredForms}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} ${getFilterDisplay().toLowerCase()}`
              }}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>
      </>
    );
  };

  // ================= RENDER CHAT TAB =================
  const renderChatTab = () => {
    return (
      <Row gutter={16} style={{ height: 'calc(100vh - 300px)' }}>
        {/* Chat Rooms List */}
        <Col xs={24} md={8} style={{ height: '100%' }}>
          <Card
            title={
              <Space>
                <WechatOutlined style={{ color: '#52c41a' }} />
                <span>Active Chats</span>
                {chatRooms?.filter(r => r?.unread_count > 0).length > 0 && (
                  <Badge count={chatRooms.filter(r => r?.unread_count > 0).length} />
                )}
              </Space>
            }
            style={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            bodyStyle={{ 
              flex: 1,
              overflow: 'auto',
              padding: '12px'
            }}
          >
            {Array.isArray(chatRooms) && chatRooms.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chatRooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => loadChatMessages(room.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedChat?.id === room.id ? '#e6f7ff' : 'white',
                      border: selectedChat?.id === room.id ? '1px solid #1890ff' : '1px solid #f0f0f0',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <Badge count={room.unread_count} size="small" overflowCount={9}>
                        <Avatar 
                          icon={<UserOutlined />} 
                          style={{ 
                            backgroundColor: room.unread_count > 0 ? '#1890ff' : '#d9d9d9',
                            flexShrink: 0
                          }}
                        />
                      </Badge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong ellipsis style={{ maxWidth: '150px' }}>
                            {room.student_name || 'Unknown Student'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {room.last_message_time ? dayjs(room.last_message_time).fromNow() : ''}
                          </Text>
                        </div>
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: '12px',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {room.last_message || 'No messages yet'}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty 
                description="No active chats" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        {/* Chat Messages Area */}
        <Col xs={24} md={16} style={{ height: '100%' }}>
          <Card
            style={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            bodyStyle={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '16px'
            }}
          >
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div style={{ 
                  paddingBottom: '16px',
                  borderBottom: '1px solid #f0f0f0',
                  marginBottom: '16px'
                }}>
                  <Space>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>
                        {selectedChat.student_name || 'Unknown Student'}
                      </Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {selectedChat.student_email || 'No email'}
                        </Text>
                      </div>
                    </div>
                  </Space>
                </div>

                {/* Messages Container */}
                <div style={{ 
                  flex: 1,
                  overflow: 'auto',
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <Spin />
                      <p>Loading messages...</p>
                    </div>
                  ) : chatMessages[selectedChat.id]?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {chatMessages[selectedChat.id].map(msg => (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            justifyContent: msg.is_own ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '70%',
                              padding: '10px 16px',
                              borderRadius: msg.is_own ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              backgroundColor: msg.is_own ? '#1890ff' : 'white',
                              color: msg.is_own ? 'white' : 'rgba(0,0,0,0.85)',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                              wordBreak: 'break-word'
                            }}
                          >
                            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                              {msg.content}
                            </div>
                            <div style={{ 
                              fontSize: '11px',
                              textAlign: 'right',
                              color: msg.is_own ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.45)'
                            }}>
                              {dayjs(msg.created_at).format('HH:mm')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty 
                      description="No messages yet" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>

                {/* Message Input */}
                <div style={{ 
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: '16px'
                }}>
                  <Space.Compact style={{ width: '100%' }}>
                    <TextArea
                      placeholder="Type your message here..."
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      onPressEnter={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(selectedChat.id);
                        }
                      }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={() => sendMessage(selectedChat.id)}
                      loading={sendingMessage}
                      style={{ height: 'auto' }}
                    >
                      Send
                    </Button>
                  </Space.Compact>
                </div>
              </>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%'
              }}>
                <Empty
                  description="Select a chat from the list to start messaging"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    );
  };

  // ================= RENDER STUDENTS TAB =================
  const renderStudentsTab = () => {
    const safeStudentsList = Array.isArray(studentsList) ? studentsList : [];
    
    const columns = [
      {
        title: 'Student',
        dataIndex: 'full_name',
        key: 'student',
        width: 200,
        render: (text, record) => (
          <Space>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                background: '#1890ff'
              }}
            />
            <div>
              <Text strong style={{ fontSize: '14px' }}>{text || 'Unknown Student'}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  @{record.username || 'unknown'}
                </Text>
              </div>
            </div>
          </Space>
        )
      },
      {
        title: 'Contact Information',
        key: 'contact',
        width: 250,
        render: (_, record) => (
          <Space direction="vertical" size={2}>
            <Text style={{ fontSize: '13px' }}>{record.email || 'No email'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.id_number || 'N/A'}
            </Text>
          </Space>
        )
      },
      {
        title: 'Program',
        dataIndex: 'program',
        key: 'program',
        width: 150,
        render: (text) => (
          <Tag 
            color="blue" 
            style={{ 
              borderRadius: '12px',
              fontSize: '12px'
            }}
          >
            {text || 'N/A'}
          </Tag>
        )
      },
      {
        title: 'Status',
        key: 'status',
        width: 150,
        render: () => (
          <Space>
            <Badge 
              status="success"
              text={
                <Text style={{ fontSize: '12px' }}>
                  Active
                </Text>
              } 
            />
          </Space>
        )
      },
      {
        title: 'Last Activity',
        dataIndex: 'last_login',
        key: 'last_login',
        width: 150,
        render: (date) => (
          <Space direction="vertical" size={2}>
            <Text style={{ fontSize: '13px' }}>
              {date ? dayjs(date).format('MMM D, YYYY') : 'Never'}
            </Text>
            {date && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {dayjs(date).fromNow()}
              </Text>
            )}
          </Space>
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 150,
        render: (_, record) => (
          <Space>
            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={() => startNewChat(record.id)}
              size="small"
            >
              Message
            </Button>
          </Space>
        )
      }
    ];

    return (
      <>
        <Card 
          style={{ 
            marginBottom: 20, 
            borderRadius: 10,
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    Department Students
                  </Title>
                  <Text type="secondary">
                    Manage and communicate with students in your department
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadStudentsList(token)}
                type="primary"
              >
                Refresh List
              </Button>
            </Col>
          </Row>
        </Card>

        <Card style={{ borderRadius: 10, background: 'white' }}>
          <Table
            columns={columns}
            dataSource={safeStudentsList}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `${total} students in department`
            }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: (
                <Empty 
                  description="No students found" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )
            }}
          />
        </Card>
      </>
    );
  };

  // ================= RENDER PROFILE MODAL =================
  const renderProfileModal = () => {
    return (
      <Modal
        title={
          <Space>
            <ProfileOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontWeight: 600, fontSize: '18px' }}>Profile Settings</span>
          </Space>
        }
        open={profileModal}
        onCancel={() => {
          setProfileModal(false);
          profileForm.resetFields();
        }}
        footer={null}
        width={700}
        bodyStyle={{ padding: '24px' }}
      >
        {profileData && (
          <Form
            form={profileForm}
            layout="vertical"
            initialValues={{
              first_name: profileData.first_name || '',
              last_name: profileData.last_name || '',
              email: profileData.email || '',
              phone: profileData.phone || '',
              username: profileData.username || ''
            }}
            onFinish={updateProfile}
          >
            {/* Profile Picture Section */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Upload
                  name="avatar"
                  listType="picture-circle"
                  showUploadList={false}
                  beforeUpload={uploadProfilePicture}
                  disabled={uploadingPhoto}
                  accept="image/*"
                >
                  {profileData.profile_picture_url ? (
                    <div style={{ position: 'relative' }}>
                      <Avatar
                        size={120}
                        src={profileData.profile_picture_url}
                        icon={<UserOutlined />}
                        style={{ 
                          border: '4px solid #1890ff',
                          boxShadow: '0 4px 20px rgba(24, 144, 255, 0.3)'
                        }}
                      />
                      {uploadingPhoto && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.5)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Spin size="large" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ 
                      width: '120px', 
                      height: '120px',
                      borderRadius: '50%',
                      background: '#f0f0f0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #d9d9d9',
                      cursor: 'pointer'
                    }}>
                      {uploadingPhoto ? (
                        <Spin size="large" />
                      ) : (
                        <>
                          <UserOutlined style={{ fontSize: '32px', color: '#999', marginBottom: '8px' }} />
                          <Text type="secondary">Upload Photo</Text>
                        </>
                      )}
                    </div>
                  )}
                </Upload>
                {profileData.profile_picture_url && !uploadingPhoto && (
                  <div style={{ position: 'absolute', bottom: '0', right: '0' }}>
                    <Button
                      type="primary"
                      danger
                      shape="circle"
                      icon={<DeleteOutlined />}
                      onClick={deleteProfilePicture}
                      size="small"
                    />
                  </div>
                )}
              </div>
              <div style={{ marginTop: '12px' }}>
                <Text type="secondary">Click to upload profile picture (Max 5MB)</Text>
              </div>
            </div>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="first_name"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: '#999' }} />} 
                    placeholder="Enter first name"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="last_name"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input 
                    prefix={<UserOutlined style={{ color: '#999' }} />} 
                    placeholder="Enter last name"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please enter username' }]}
            >
              <Input 
                prefix={<IdcardOutlined style={{ color: '#999' }} />} 
                placeholder="Enter username"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#999' }} />} 
                placeholder="Enter email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
            >
              <Input 
                prefix={<PhoneOutlined style={{ color: '#999' }} />} 
                placeholder="Enter phone number"
                size="large"
              />
            </Form.Item>

            <Divider />

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button 
                  onClick={() => setProfileModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={profileLoading}
                  icon={<SaveOutlined />}
                >
                  Save Changes
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    );
  };

  // ================= RENDER VIEW FORM MODAL =================
  const renderViewFormModal = () => {
    if (!selectedForm) return null;

    return (
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <span style={{ fontWeight: 600, fontSize: '18px' }}>Clearance Form Details</span>
          </Space>
        }
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setViewModal(false)}
          >
            Close
          </Button>,
          selectedForm.status === "pending_department" && (
            <Space key="actions">
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => openRejectModal(selectedForm.id, selectedForm.student_id || selectedForm.id_number)}
              >
                Reject
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => approveForm(selectedForm.id)}
                loading={actionLoading[selectedForm.id]}
                style={{ 
                  background: '#52c41a',
                  borderColor: '#52c41a'
                }}
              >
                Approve
              </Button>
            </Space>
          )
        ]}
        width={900}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {selectedForm.full_name || 'Unknown Student'}
              </Title>
              <Text type="secondary">ID: {selectedForm.id_number || 'N/A'}</Text>
            </div>
            <div>
              {renderStatus(selectedForm.status)}
            </div>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Email">
                  <Text strong>{selectedForm.student_email || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Department">
                  <Tag color="blue">{selectedForm.department_name || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="College">
                  <Text>{selectedForm.college || 'N/A'}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Program Level">
                  <Text strong>{selectedForm.program_level || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Year & Semester">
                  <Text>Year {selectedForm.year || 'N/A'} • Semester {selectedForm.semester || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Enrollment Type">
                  <Text>{selectedForm.enrollment_type || 'N/A'}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          <div>
            <Title level={5} style={{ marginBottom: '8px' }}>
              Clearance Reason
            </Title>
            <Card style={{ background: '#f6ffed' }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {selectedForm.reason || 'No reason provided'}
              </div>
            </Card>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                Submitted
              </Text>
              <Text strong>
                {dayjs(selectedForm.created_at).format('MMMM D, YYYY HH:mm')}
              </Text>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                Last Updated
              </Text>
              <Text strong>
                {dayjs(selectedForm.updated_at).format('MMMM D, YYYY HH:mm')}
              </Text>
            </Col>
          </Row>

          {selectedForm.department_note && (
            <>
              <Divider style={{ margin: '16px 0' }} />
              <Alert
                message="Department Note"
                description={selectedForm.department_note}
                type={
                  selectedForm.status === "approved_department" ? "success" :
                  selectedForm.status === "rejected" ? "error" : "info"
                }
                showIcon
              />
            </>
          )}
        </div>
      </Modal>
    );
  };

  // ================= RENDER REJECT MODAL =================
  const renderRejectModal = () => (
    <Modal
      title={
        <Space>
          <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          <span style={{ fontWeight: 600 }}>Reject Clearance Form</span>
        </Space>
      }
      open={rejectModal}
      onOk={handleRejectForm}
      onCancel={() => {
        setRejectModal(false);
        setRejectNote("");
        setSelectedFormId(null);
        setSelectedStudentId(null);
      }}
      okText="Confirm Rejection"
      okButtonProps={{ 
        danger: true,
        icon: <CloseOutlined />,
        disabled: !rejectNote.trim()
      }}
      cancelText="Cancel"
      width={600}
      bodyStyle={{ padding: '24px' }}
    >
      <Alert
        message="Important Notice"
        description="This form will be rejected and sent back to the student with your feedback. Please provide detailed rejection reason."
        type="warning"
        showIcon
        style={{ marginBottom: '20px' }}
      />
      <TextArea
        rows={4}
        placeholder="Please provide detailed rejection reason..."
        value={rejectNote}
        onChange={e => setRejectNote(e.target.value)}
        autoFocus
      />
      <div style={{ marginTop: '12px' }}>
        <Text type="secondary">
          This note will be visible to the student and recorded in the system history.
        </Text>
      </div>
    </Modal>
  );

  // ================= RENDER BATCH PROCESSING MODAL =================
  const renderBatchModal = () => (
    <Modal
      title={
        <Space>
          <RocketOutlined style={{ color: '#1890ff' }} />
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
                loadDashboardData(token);
              }}>
                Refresh Forms
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div style={{ 
      padding: 30, 
      maxWidth: 1600, 
      margin: '0 auto', 
      minHeight: '100vh', 
      background: '#f0f2f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial'
    }}>
      {/* ================= HEADER ================= */}
      <Card 
        style={{ 
          marginBottom: 30,
          borderRadius: 15,
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          color: 'white',
          boxShadow: '0 8px 25px rgba(24, 144, 255, 0.3)'
        }}
        bodyStyle={{ padding: '20px 30px' }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                <DashboardFilled /> Department Head Dashboard
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
                Welcome, {profileData?.first_name || user?.username || 'Department Head'} - {profileData?.department_name || 'Department'}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              <Badge count={chatRooms.filter(r => r.unread_count > 0).length}>
                <Button 
                  icon={<BellOutlined />}
                  onClick={() => setActiveTab("chat")}
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    border: 'none'
                  }}
                >
                  Messages
                </Button>
              </Badge>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      label: (
                        <Space>
                          <ProfileOutlined />
                          <span>My Profile</span>
                        </Space>
                      ),
                      onClick: () => setProfileModal(true)
                    },
                    {
                      key: 'logout',
                      label: (
                        <Space>
                          <LogoutOutlined />
                          <span>Logout</span>
                        </Space>
                      ),
                      onClick: logout,
                      danger: true
                    }
                  ]
                }}
                placement="bottomRight"
              >
                <Button 
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    color: 'white', 
                    border: 'none',
                    height: '48px',
                    padding: '0 16px'
                  }}
                >
                  <Space>
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />}
                      src={profileData?.profile_picture_url}
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <Text strong style={{ 
                        color: 'white', 
                        display: 'block',
                        fontSize: '14px'
                      }}>
                        {profileData?.first_name || user?.username}
                      </Text>
                      <Text style={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: '12px',
                        display: 'block'
                      }}>
                        Department Head
                      </Text>
                    </div>
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ================= TABS ================= */}
      <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 20 }}
        items={[
          {
            key: 'dashboard',
            label: (
              <Space>
                <DashboardOutlined />
                Dashboard
                {stats.pending > 0 && <Badge count={stats.pending} />}
              </Space>
            ),
            children: renderDashboard()
          },
          {
            key: 'forms',
            label: (
              <Space>
                <FileTextOutlined />
                Clearance Forms
                {stats.pending > 0 && <Badge count={stats.pending} />}
              </Space>
            ),
            children: renderFormsTab()
          },
          {
            key: 'chat',
            label: (
              <Space>
                <WechatOutlined />
                Messaging
                {chatRooms.filter(r => r.unread_count > 0).length > 0 && 
                  <Badge count={chatRooms.filter(r => r.unread_count > 0).length} />}
              </Space>
            ),
            children: renderChatTab()
          },
          {
            key: 'students',
            label: (
              <Space>
                <TeamOutlined />
                Students
              </Space>
            ),
            children: renderStudentsTab()
          }
        ]}
      />

      {/* ================= MODALS ================= */}
      {renderProfileModal()}
      {renderViewFormModal()}
      {renderRejectModal()}
      {renderBatchModal()}

      {/* ================= FOOTER ================= */}
      <div style={{ 
        marginTop: 40, 
        padding: '20px 0', 
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Text type="secondary">
          Department Head Clearance System • {new Date().getFullYear()} • 
          <span style={{ marginLeft: 8, color: '#1890ff' }}>
            Total: {stats.total} | Pending: {stats.pending} | Approved: {stats.approved} | Rejected: {stats.rejected}
          </span>
        </Text>
      </div>
    </div>
  );
}