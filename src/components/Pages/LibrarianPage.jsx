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
  Checkbox,
  Progress,
  Divider,
  List,
  Empty,
  Pagination,
  Result,

} from "antd";
import { 
  CheckOutlined, 
  CloseOutlined, 
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  BookOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  HistoryOutlined,
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  HomeOutlined,
  MessageOutlined, 
  SendOutlined,
  PaperClipOutlined,
  FileImageOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  DeleteOutlined as DeleteIcon,
  DownloadOutlined,
  FilterOutlined,
  CheckSquareOutlined,
  AppstoreOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Option } = Select;
const { confirm } = Modal;
const API_BASE = "http://127.0.0.1:8000/api/";

export default function LibrarianPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
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
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    withDues: 0,
    today: 0,
    thisWeek: 0,
    efficiency: 0
  });
  const [bookModal, setBookModal] = useState(false);
  const [bookDetails, setBookDetails] = useState({
    has_borrowed_books: false,
    has_due_books: false,
    books: [],
    total_fines: 0,
    can_approve: true,
    student_info: null
  });
  const [checkingBooks, setCheckingBooks] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  
  // ================= MULTI-APPROVAL BATCH PROCESSING =================
  const [selectedForms, setSelectedForms] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchModal, setBatchModal] = useState(false);
  const [batchAction, setBatchAction] = useState('approve');
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, status: 'idle' });
  const [batchResults, setBatchResults] = useState({ success: [], failed: [] });
  const [batchNotes, setBatchNotes] = useState("");
  const [batchPaymentRequired, setBatchPaymentRequired] = useState(false);
  const [batchPaymentAmount, setBatchPaymentAmount] = useState("");
  const [batchPaymentReason, setBatchPaymentReason] = useState("");
  
  const [filters, setFilters] = useState({
    department: 'all',
    year: 'all',
    program: 'all',
    hasDue: 'all'
  });
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showFilters, setShowFilters] = useState(false);
  
  // ================= DUE REGISTRATION SYSTEM =================
  const [dueRegistrationModal, setDueRegistrationModal] = useState(false);
  const [dueStudents, setDueStudents] = useState([]);
  const [dueSearchId, setDueSearchId] = useState("");
  const [dueSearchName, setDueSearchName] = useState("");
  const [loadingDues, setLoadingDues] = useState(false);
  const [registerDueModal, setRegisterDueModal] = useState(false);
  const [editingDue, setEditingDue] = useState(null);

  // ================= CHAT SYSTEM =================
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedStudentForChat, setSelectedStudentForChat] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chatRefreshInterval, setChatRefreshInterval] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ================= AUTH =================
  useEffect(() => {
    const stored = sessionStorage.getItem("ucs_current");
    if (!stored) {
      message.error("Please login first");
      navigate("/login");
      return;
    }
    
    const parsed = JSON.parse(stored);
    if (parsed.role !== "librarian") {
      message.error("Access denied. Librarian only.");
      navigate("/login");
      return;
    }
    
    setUser(parsed);
    setToken(parsed.token);
    loadForms(parsed.token);
    loadDueStudents();
    loadChatRooms();
    loadStudentsForChat();
  }, [navigate]);

  // ================= LOAD FORMS =================
  const loadForms = async (authToken) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}librarian/forms/`, {
        headers: { 
          Authorization: `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data && Array.isArray(res.data)) {
        const formsWithFlags = res.data.map(form => {
          const requiresPayment = form.status.includes('requires_') && 
                                 (form.status.includes('library') || 
                                  form.status.includes('cafeteria') || 
                                  form.status.includes('dormitory'));
          
          return {
            ...form,
            requires_payment: requiresPayment,
            payment_amount: form.note?.match(/Payment required: ([\d.]+)/)?.[1] || '',
            payment_reason: form.note?.match(/Reason: (.+?)(?:\n|$)/)?.[1] || '',
            selected: false
          };
        });
        
        setForms(formsWithFlags);
        calculateStats(formsWithFlags);
        
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
    const today = dayjs().format('YYYY-MM-DD');
    const todayForms = formsList.filter(f => 
      dayjs(f.created_at).format('YYYY-MM-DD') === today
    ).length;
    const thisWeek = formsList.filter(f => 
      dayjs(f.created_at).isSame(dayjs(), 'week')
    ).length;
    
    const total = formsList.length;
    const pending = formsList.filter(f => f.status === "approved_department").length;
    const approved = formsList.filter(f => f.status === "approved_library").length;
    const rejected = formsList.filter(f => f.status === "rejected" && f.library_note).length;
    const withDues = formsList.filter(f => checkIfStudentHasDue(f.id_number)).length;
    const efficiency = total > 0 ? Math.round(((approved) / (approved + pending)) * 100) : 0;
    
    setStats({
      total,
      pending,
      approved,
      rejected,
      withDues,
      today: todayForms,
      thisWeek,
      efficiency: isNaN(efficiency) ? 0 : efficiency
    });
  };

  // ================= FILTER FUNCTIONS =================
  const applyFilters = (formsList) => {
    return formsList.filter(f => {
      const matchesSearch = searchTerm === "" ||
        f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.student_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filters.department !== 'all' && f.department_name !== filters.department) {
        return false;
      }
      
      if (filters.year !== 'all' && f.year !== filters.year) {
        return false;
      }
      
      if (filters.program !== 'all' && f.program_level !== filters.program) {
        return false;
      }
      
      if (filters.hasDue !== 'all') {
        const hasDue = checkIfStudentHasDue(f.id_number);
        if (filters.hasDue === 'yes' && !hasDue) return false;
        if (filters.hasDue === 'no' && hasDue) return false;
      }
      
      return f.status === "approved_department";
    });
  };

  const filteredForms = applyFilters(forms);
  
  const paginatedForms = filteredForms.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ================= MULTI-SELECT FUNCTIONS =================
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
      const pendingForms = filteredForms
        .filter(f => f.status === "approved_department")
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
      let totalFines = 0;
      
      for (let i = 0; i < selectedForms.length; i++) {
        const formId = selectedForms[i];
        const form = forms.find(f => f.id === formId);
        
        try {
          setBatchProgress(prev => ({ ...prev, current: i + 1 }));
          
          const hasDues = checkIfStudentHasDue(form.id_number);
          const studentDues = getStudentTotalFines(form.id_number);
          
          if (hasDues && batchAction === 'approve') {
            results.failed.push({
              id: formId,
              name: form.full_name,
              reason: `Student has unpaid library fines (Amount: ETB ${studentDues})`
            });
            continue;
          }
          
          const payload = {
            action: batchAction,
            note: batchNotes || `Batch ${batchAction} by Librarian`
          };
          
          if (batchAction === 'reject' && batchPaymentRequired) {
            payload.requires_payment = true;
            payload.payment_amount = parseFloat(batchPaymentAmount) + studentDues;
            payload.payment_reason = batchPaymentReason || 'Library fines required';
            totalFines += parseFloat(batchPaymentAmount) + studentDues;
          }
          
          const res = await axios.patch(
            `${API_BASE}librarian/action/${formId}/`,
            payload,
            { headers: { Authorization: `Token ${token}` } }
          );
          
          results.success.push({
            id: formId,
            name: form.full_name,
            message: res.data.message || `${batchAction} successful`,
            fines: studentDues
          });
          
          setForms(prev => prev.map(f => {
            if (f.id === formId) {
              const newStatus = batchAction === 'approve' ? 'approved_library' : 'rejected';
              return { 
                ...f, 
                status: newStatus,
                library_note: batchNotes || f.library_note
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
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setBatchResults(results);
      setBatchProgress({ current: selectedForms.length, total: selectedForms.length, status: 'completed' });
      
      notification.info({
        message: 'Batch Processing Complete',
        description: (
          <div>
            <p>✅ Successful: {results.success.length}</p>
            <p>❌ Failed: {results.failed.length}</p>
            {totalFines > 0 && (
              <p><DollarOutlined /> Total Fines: ETB {totalFines.toFixed(2)}</p>
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

  // ================= DUE REGISTRATION FUNCTIONS =================
  const loadDueStudents = async () => {
    try {
      setLoadingDues(true);
      const savedDues = localStorage.getItem("library_due_students");
      if (savedDues) {
        setDueStudents(JSON.parse(savedDues));
      } else {
        setDueStudents([]);
      }
    } catch (err) {
      console.error("Error loading due students:", err);
      setDueStudents([]);
    } finally {
      setLoadingDues(false);
    }
  };

  const saveDueStudents = (dues) => {
    localStorage.setItem("library_due_students", JSON.stringify(dues));
    setDueStudents(dues);
  };

  const registerNewDue = async (values) => {
    try {
      const newDue = {
        id: Date.now(),
        student_id: values.student_id,
        student_name: values.student_name,
        book_title: values.book_title,
        book_id: values.book_id,
        borrow_date: values.borrow_date.format('YYYY-MM-DD'),
        due_date: values.due_date.format('YYYY-MM-DD'),
        fine_amount: values.fine_amount || 0,
        status: dayjs(values.due_date).isBefore(dayjs()) ? 'overdue' : 'due_soon',
        registered_date: dayjs().format('YYYY-MM-DD'),
        registered_by: user?.username || 'librarian'
      };

      const updatedDues = [...dueStudents, newDue];
      saveDueStudents(updatedDues);
      
      message.success("Due registered successfully!");
      setRegisterDueModal(false);
      form.resetFields();
      
    } catch (err) {
      console.error("Error registering due:", err);
      message.error("Failed to register due.");
    }
  };

  const updateDue = async (values) => {
    try {
      const updatedDue = {
        ...editingDue,
        student_id: values.student_id,
        student_name: values.student_name,
        book_title: values.book_title,
        book_id: values.book_id,
        borrow_date: values.borrow_date.format('YYYY-MM-DD'),
        due_date: values.due_date.format('YYYY-MM-DD'),
        fine_amount: values.fine_amount || 0,
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
      
    } catch (err) {
      console.error("Error updating due:", err);
      message.error("Failed to update due.");
    }
  };

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

  const searchDueStudents = () => {
    if (!dueSearchId.trim() && !dueSearchName.trim()) {
      return dueStudents;
    }
    
    return dueStudents.filter(due => 
      (dueSearchId && due.student_id.toLowerCase().includes(dueSearchId.toLowerCase())) ||
      (dueSearchName && due.student_name.toLowerCase().includes(dueSearchName.toLowerCase()))
    );
  };

  // ================= CHECK BOOK STATUS =================
  const checkIfStudentHasDue = (studentId) => {
    return dueStudents.some(due => 
      due.student_id === studentId && 
      (due.status === 'overdue' || due.status === 'due_soon')
    );
  };

  const getStudentTotalFines = (studentId) => {
    return dueStudents
      .filter(due => due.student_id === studentId && (due.status === 'overdue' || due.status === 'due_soon'))
      .reduce((total, due) => total + due.fine_amount, 0);
  };

  const checkBookStatus = async (studentId, formId) => {
    try {
      setCheckingBooks(true);
      setSelectedStudentId(studentId);
      setSelectedFormId(formId);
      
      const studentDues = dueStudents.filter(due => due.student_id === studentId);
      const hasDueInRegistry = studentDues.some(due => 
        due.status === 'overdue' || due.status === 'due_soon'
      );
      const totalFines = studentDues.reduce((total, due) => total + due.fine_amount, 0);
      
      let bookData = {
        has_borrowed_books: studentDues.length > 0,
        has_due_books: hasDueInRegistry,
        books: studentDues.map(due => ({
          id: due.id,
          title: due.book_title,
          book_id: due.book_id,
          borrow_date: due.borrow_date,
          due_date: due.due_date,
          status: due.status,
          fine: due.fine_amount,
          registered_by: due.registered_by,
          registered_date: due.registered_date
        })),
        total_fines: totalFines,
        can_approve: !hasDueInRegistry,
        student_info: {
          student_name: forms.find(f => f.id_number === studentId)?.full_name || studentId,
          id_number: studentId,
          email: forms.find(f => f.id_number === studentId)?.student_email || 'N/A'
        },
        check_source: "Due-registry",
        checked_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        checked_by: user?.username,
        form_id: formId
      };
      
      setBookDetails(bookData);
      setBookModal(true);
      
      let notificationMessage = "";
      let notificationType = "info";
      
      if (!bookData.has_borrowed_books) {
        notificationMessage = 'No books found. Verify.';
        notificationType = "info";
      } else if (bookData.has_borrowed_books && !bookData.has_due_books) {
        notificationMessage = 'Books found in registry but no dues. Can APPROVE if verified.';
        notificationType = "success";
      } else if (bookData.has_due_books) {
        notificationMessage = 'Due books found in registry. Must check and possibly REJECT.';
        notificationType = "warning";
      }
      
      notification[notificationType]({
        message: 'Book Check',
        description: notificationMessage,
        duration: 5,
      });
      
      return bookData;
      
    } catch (err) {
      console.error("Check book status error:", err);
      message.error("Could not check book status from registry.");
      return null;
    } finally {
      setCheckingBooks(false);
    }
  };

  // ================= VIEW FORM DETAILS =================
  const viewFormDetails = (form) => {
    setSelectedForm(form);
    setViewModal(true);
  };

  // ================= SINGLE APPROVAL =================
  const approveForm = async (formId, studentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [formId]: true }));
      
      const studentDues = dueStudents.filter(due => due.student_id === studentId);
      const hasDueInRegistry = studentDues.some(due => 
        due.status === 'overdue' || due.status === 'due_soon'
      );
      
      confirm({
        title: 'Confirm Book Check',
        content: (
          <div>
            <p>Have you checked this student's book status?</p>
            <Alert
              message="Important:"
              description="As the librarian, you must verify if the student has any borrowed or due books."
              type="warning"
              showIcon
              style={{ marginTop: 10 }}
            />
            {hasDueInRegistry && (
              <Alert
                message="Warning: Student has dues in registry"
                description="This student has registered due books. Please verify before approving."
                type="error"
                showIcon
                style={{ marginTop: 10 }}
              />
            )}
          </div>
        ),
        okText: 'Yes, I have checked - Approve',
        cancelText: 'No, Check First',
        onOk: async () => {
          try {
            const note = "Approved by Librarian";
            const res = await axios.patch(
              `${API_BASE}librarian/action/${formId}/`,
              { action: "approve", note },
              { headers: { Authorization: `Token ${token}` } }
            );
            
            setForms(prev => prev.map(f => 
              f.id === formId ? { 
                ...f, 
                status: "approved_library",
                library_note: res.data.note
              } : f
            ));
            
            message.success("Form approved!");
            
            notification.success({
              message: 'Clearance Approved',
              description: 'Form has been verified.',
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
        }
      });
      
    } catch (err) {
      console.error("Approve error:", err);
      message.error("An error occurred. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [formId]: false }));
    }
  };

  // ================= OPEN REJECT MODAL =================
  const openRejectModal = (formId, studentId) => {
    setSelectedFormId(formId);
    setSelectedStudentId(studentId);
    setRejectNote("");
    setRejectAction('reject_only');
    setPaymentAmount("");
    setPaymentReason("");
    setRejectModal(true);
  };

  // ================= HANDLE REJECT FORM =================
  const handleRejectForm = async () => {
    try {
      if (!rejectNote.trim()) {
        message.error("Please provide a rejection reason");
        return;
      }
      
      if (rejectAction === 'require_payment') {
        if (!paymentAmount || paymentAmount <= 0) {
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
        `${API_BASE}librarian/action/${selectedFormId}/`,
        payload,
        { headers: { Authorization: `Token ${token}` } }
      );
      
      message.success(res.data.message);
      
      setForms(prev => prev.map(f => {
        if (f.id === selectedFormId) {
          const updatedForm = { 
            ...f, 
            status: res.data.status,
            library_note: res.data.note
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
          description: 'Student will receive payment instructions.',
          duration: 5,
        });
      } else {
        notification.error({
          message: 'Form Rejected',
          description: 'Form has been rejected.',
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

  // ================= QUICK APPROVE AFTER BOOK CHECK =================
  const quickApproveAfterBookCheck = async (note) => {
    if (!bookDetails.form_id || !selectedStudentId) return;
    
    confirm({
      title: 'Confirm Approval',
      content: `Are you sure you want to approve this form with note: "${note}"?`,
      onOk: async () => {
        try {
          const res = await axios.patch(
            `${API_BASE}librarian/action/${bookDetails.form_id}/`,
            { action: "approve", note },
            { headers: { Authorization: `Token ${token}` } }
          );
          
          setForms(prev => prev.map(f => 
            f.id === bookDetails.form_id ? { 
              ...f, 
              status: "approved_library",
              library_note: res.data.note
            } : f
          ));
          
          message.success("Form approved successfully!");
          setBookModal(false);
          
          notification.success({
            message: 'Sent success',
            description: 'Clearance form has been approved successfully.',
            icon: <ShopOutlined />,
            duration: 4,
          });
          
          setTimeout(() => loadForms(token), 1000);
          
        } catch (err) {
          console.error("Quick approve error:", err);
          message.error("Failed to approve. Please try again.");
        }
      }
    });
  };

  // ================= CHAT FUNCTIONS =================
  const loadChatRooms = async () => {
    if (!token) return;
    
    try {
      setLoadingChats(true);
      const response = await axios.get(`${API_BASE}chat/rooms/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setChatRooms(response.data || []);
      
      const totalUnread = (response.data || []).reduce((sum, room) => sum + (room.unread_count || 0), 0);
      setUnreadCount(totalUnread);
      
    } catch (err) {
      console.error("Failed to load chat rooms:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadChatMessages = async (roomId) => {
    if (!token || !roomId) return;
    
    try {
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
      
      if (!Array.isArray(messages)) {
        messages = [];
      }
      
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content || '',
        message_type: msg.message_type || 'text',
        image_file: msg.image_file || msg.image,
        audio_file: msg.audio_file || msg.audio,
        video_file: msg.video_file || msg.video,
        file: msg.file,
        file_name: msg.file_name || '',
        file_size: msg.file_size || 0,
        duration: msg.duration,
        created_at: msg.created_at,
        is_read: msg.is_read || false,
        sender: msg.sender || {
          id: msg.sender_id,
          name: msg.sender_name,
          username: msg.sender_username
        }
      }));
      
      setChatMessages(formattedMessages);
      
      await axios.post(`${API_BASE}chat/mark-read/`, 
        { room_id: roomId },
        { headers: { Authorization: `Token ${token}` } }
      );
      
    } catch (err) {
      console.error("Failed to load messages:", err);
      setChatMessages([]);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      
      const response = await axios.post(`${API_BASE}chat/send/`, {
        room_id: selectedRoom.id,
        content: newMessage.trim(),
        message_type: 'text'
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setChatMessages(prev => [...prev, response.data]);
      setNewMessage("");
      
      setTimeout(() => {
        const messagesEnd = document.getElementById('chat-messages-end');
        if (messagesEnd) messagesEnd.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      console.error("Failed to send message:", err);
      message.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

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
    }
    
    try {
      setSendingMessage(true);
      
      const response = await axios.post(`${API_BASE}chat/send/`, formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setChatMessages(prev => [...prev, response.data]);
      
    } catch (err) {
      console.error("Failed to send file:", err);
      message.error("Failed to send file");
    } finally {
      setSendingMessage(false);
    }
  };

  const loadStudentsForChat = async () => {
    if (!token) return;
    
    try {
      setLoadingStudents(true);
      const response = await axios.get(`${API_BASE}librarian/students/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setStudentsList(response.data.students || []);
      
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const startChatWithStudent = async (studentId, studentName) => {
    try {
      const response = await axios.post(`${API_BASE}librarian/start-chat/`, {
        student_id: studentId
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      
      await loadChatRooms();
      
      const newRoom = response.data.chat_room || response.data;
      setSelectedRoom(newRoom);
      setSelectedStudentForChat({
        id: studentId,
        name: studentName
      });
      
      await loadChatMessages(newRoom.id);
      
      message.success(`Chat started with ${studentName}`);
      
    } catch (err) {
      console.error("Failed to start chat:", err);
      
      if (err.response?.data?.chat_room_id) {
        const existingRoomId = err.response.data.chat_room_id;
        const existingRoom = chatRooms.find(r => r.id === existingRoomId);
        if (existingRoom) {
          setSelectedRoom(existingRoom);
          setSelectedStudentForChat({
            id: studentId,
            name: studentName
          });
          await loadChatMessages(existingRoomId);
          message.info("Chat already exists");
        }
      } else {
        message.error("Failed to start chat");
      }
    }
  };

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

  const closeChatModal = () => {
    setChatModalVisible(false);
    setSelectedRoom(null);
    setSelectedStudentForChat(null);
    setChatMessages([]);
    setNewMessage("");
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API_BASE}chat/message/${messageId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
      message.success("Message deleted");
      
    } catch (err) {
      console.error("Failed to delete message:", err);
      message.error("Failed to delete message");
    }
  };

  const downloadFile = async (messageId, fileName) => {
    try {
      const response = await axios.get(`${API_BASE}chat/download/${messageId}/`, {
        headers: { Authorization: `Token ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      console.error("Failed to download file:", err);
      message.error("Failed to download file");
    }
  };

  // Initialize chat on component mount
  useEffect(() => {
    if (token && user?.role === 'librarian') {
      loadChatRooms();
      loadStudentsForChat();
      
      const interval = setInterval(() => {
        loadChatRooms();
        if (selectedRoom) {
          loadChatMessages(selectedRoom.id);
        }
      }, 10000);
      
      setChatRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [token, user]);

  // Update unread count when chat rooms change
  useEffect(() => {
    const totalUnread = chatRooms.reduce((sum, room) => sum + (room.unread_count || 0), 0);
    setUnreadCount(totalUnread);
  }, [chatRooms]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      const messagesEnd = document.getElementById('chat-messages-end');
      if (messagesEnd) messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [chatMessages]);

  // ================= LOGOUT =================
  const logout = () => {
    sessionStorage.clear();
    localStorage.removeItem("ucs_user");
    message.success("Logged out successfully");
    navigate("/login");
  };

  // ================= RENDER FUNCTIONS =================
  const renderStatus = (status, libraryNote) => {
    switch(status) {
      case "approved_library":
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
                {libraryNote && (
                  <Tooltip title={libraryNote}>
                    <WarningOutlined style={{ color: '#ff4d4f' }} />
                  </Tooltip>
                )}
              </Space>
            }
          />
        );
      case "approved_department":
        return (
          <Badge 
            status="processing" 
            text={
              <Space>
                <ClockCircleOutlined />
                <span style={{ fontWeight: 'bold' }}>PENDING</span>
                <Tag color="blue">Library Review</Tag>
              </Space>
            }
          />
        );
      case "requires_library_payment":
        return (
          <Badge 
            status="warning" 
            text={
              <Space>
                <DollarOutlined />
                <span style={{ fontWeight: 'bold' }}>PAYMENT REQUIRED</span>
                <Tag color="orange">Library Fines</Tag>
              </Space>
            }
          />
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const renderClearanceFlow = (form) => {
    let currentStep = 0;
    let steps = [];
    
    if (form.status === "approved_department") {
      currentStep = 1;
      steps = [
        { title: "Dept. Head", status: "finish", icon: <CheckCircleOutlined /> },
        { title: "Library", status: "process", icon: <ClockCircleOutlined /> },
        { title: "Cafeteria", status: "wait", icon: <ShopOutlined /> },
        { title: "Dormitory", status: "wait", icon: <HomeOutlined /> },
        { title: "Completed", status: "wait", icon: <CheckCircleOutlined /> }
      ];
    } else if (form.status === "approved_library") {
      currentStep = 2;
      steps = [
        { title: "Dept. Head", status: "finish", icon: <CheckCircleOutlined /> },
        { title: "Library", status: "finish", icon: <CheckCircleOutlined /> },
        { title: "Cafeteria", status: "process", icon: <ClockCircleOutlined /> },
        { title: "Dormitory", status: "wait", icon: <HomeOutlined /> },
        { title: "Completed", status: "wait", icon: <CheckCircleOutlined /> }
      ];
    } else if (form.status === "rejected") {
      currentStep = 1;
      steps = [
        { title: "Dept. Head", status: "finish", icon: <CheckCircleOutlined /> },
        { title: "Library", status: "error", icon: <CloseCircleOutlined /> },
        { title: "Cafeteria", status: "wait", icon: <ShopOutlined /> },
        { title: "Dormitory", status: "wait", icon: <HomeOutlined /> },
        { title: "Completed", status: "wait", icon: <CheckCircleOutlined /> }
      ];
    } else if (form.status === "requires_library_payment") {
      currentStep = 1;
      steps = [
        { title: "Dept. Head", status: "finish", icon: <CheckCircleOutlined /> },
        { title: "Library", status: "process", icon: <DollarOutlined /> },
        { title: "Cafeteria", status: "wait", icon: <ShopOutlined /> },
        { title: "Dormitory", status: "wait", icon: <HomeOutlined /> },
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

  const renderFormCard = (form) => {
    const isPending = form.status === "approved_department";
    const isApproved = form.status === "approved_library";
    const isRejected = form.status === "rejected";
    const requiresPayment = form.status === "requires_library_payment" || form.requires_payment;
    const hasDue = checkIfStudentHasDue(form.id_number);
    const studentFines = getStudentTotalFines(form.id_number);
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
            isApproved ? "#52c41a" :
            isRejected ? "#ff4d4f" :
            requiresPayment ? "#faad14" :
            hasDue ? "#ff4d4f" : "#1890ff"
          }`,
          transition: 'all 0.3s',
          cursor: 'pointer',
          background: selectedForms.includes(form.id) ? '#e6f7ff' : (hasDue ? '#fff2f0' : 'white'),
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
                <Tooltip title={`Student has due books - Fines: ETB ${studentFines}`}>
                  <WarningOutlined style={{ color: '#ff4d4f' }} />
                </Tooltip>
              )}
            </Space>
            {renderStatus(form.status, form.library_note)}
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
            message="Due Books in Registry"
            description={
              <div>
                <p>Student has due books. Fines: ETB {studentFines}</p>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginTop: 10 }}
          />
        )}
        
        {requiresPayment && (
          <Alert
            message="Payment Required"
            description={
              <div>
                <p><strong>Amount:</strong> ETB {form.payment_amount || 'N/A'}</p>
                <p><strong>Reason:</strong> {form.payment_reason || form.note}</p>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginTop: 10 }}
          />
        )}
        
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
            
            <Tooltip title="Check Manual Book Registry">
              <Button
                type="primary"
                icon={<BookOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  checkBookStatus(form.student_id || form.id_number, form.id);
                }}
                loading={checkingBooks && selectedStudentId === (form.student_id || form.id_number)}
                style={{ background: "#1890ff", borderColor: "#1890ff" }}
              >
                Check Registry
              </Button>
            </Tooltip>
            
            <Popconfirm
              title="Book Verification Required"
              description="Have you verified this student's book status?"
              onConfirm={(e) => {
                e?.stopPropagation();
                approveForm(form.id, form.student_id || form.id_number);
              }}
              okText="Yes, I've checked - Approve"
              cancelText="No, Check First"
              disabled={hasDue}
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={(e) => e.stopPropagation()}
                loading={actionLoading[form.id]}
                style={{ 
                  background: hasDue ? "#faad14" : "#52c41a", 
                  borderColor: hasDue ? "#faad14" : "#52c41a"
                }}
                disabled={hasDue}
              >
                {hasDue ? "Has Dues" : "Approve"}
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
        
        {form.library_note && (
          <Alert
            message="Librarian Action"
            description={form.library_note}
            type={isRejected ? "error" : "success"}
            showIcon
            style={{ marginTop: 10 }}
          />
        )}
      </Card>
    );
  };

  const renderBulkActionBar = () => {
    if (selectedForms.length === 0) return null;
    
    return (
      <Card 
        style={{ 
          marginBottom: 20, 
          borderRadius: 10,
          background: '#e6f7ff',
          border: '2px solid #1890ff'
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <CheckSquareOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {selectedForms.length} Form{selectedForms.length > 1 ? 's' : ''} Selected
                </Text>
                <div>
                  <Text type="secondary">
                    Ready for batch action
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<CheckCircleOutlined />}
                type="primary"
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => openBatchModal('approve')}
              >
                Batch Approve ({selectedForms.length})
              </Button>
              <Button 
                icon={<CloseCircleOutlined />}
                danger
                onClick={() => openBatchModal('reject')}
              >
                Batch Reject
              </Button>
              <Button 
                icon={<CloseOutlined />}
                onClick={clearSelection}
              >
                Clear
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderFilters = () => {
    return (
      <Card 
        style={{ 
          marginBottom: 20, 
          borderRadius: 10,
          background: '#fafafa'
        }}
        size="small"
        title={
          <Space>
            <FilterOutlined />
            <span>Filter Forms</span>
            <Tag color="blue">{filteredForms.length} pending forms</Tag>
          </Space>
        }
        extra={
          <Button 
            type="link" 
            onClick={() => setShowFilters(!showFilters)}
            icon={showFilters ? <CloseOutlined /> : <FilterOutlined />}
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        }
      >
        {showFilters && (
          <Form
            form={filterForm}
            layout="inline"
            style={{ marginTop: 15 }}
            onValuesChange={(_, allValues) => {
              setFilters(allValues);
              setCurrentPage(1);
            }}
          >
            <Form.Item name="department" label="Department" initialValue="all">
              <Select style={{ width: 200 }} allowClear>
                <Option value="all">All Departments</Option>
                {departments.map(dept => (
                  <Option key={dept} value={dept}>{dept}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item name="year" label="Year" initialValue="all">
              <Select style={{ width: 120 }} allowClear>
                <Option value="all">All Years</Option>
                {years.map(year => (
                  <Option key={year} value={year}>{year}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item name="program" label="Program" initialValue="all">
              <Select style={{ width: 150 }} allowClear>
                <Option value="all">All Programs</Option>
                {programs.map(prog => (
                  <Option key={prog} value={prog}>{prog}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item name="hasDue" label="Due Status" initialValue="all">
              <Select style={{ width: 150 }}>
                <Option value="all">All</Option>
                <Option value="yes">Has Dues</Option>
                <Option value="no">No Dues</Option>
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Button 
                onClick={() => {
                  filterForm.resetFields();
                  setFilters({
                    department: 'all',
                    year: 'all',
                    program: 'all',
                    hasDue: 'all'
                  });
                }}
              >
                Reset
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    );
  };

  // ================= RENDER COMPACT STATS =================
  const renderCompactStats = () => (
    <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
      <Col xs={12} sm={8} md={4}>
        <Card 
          hoverable 
          size="small"
          style={{ 
            textAlign: 'center', 
            borderRadius: 8,
            border: '1px solid #1890ff',
            background: 'white',
            cursor: 'pointer'
          }}
          bodyStyle={{ padding: '12px 6px' }}
          onClick={() => {
            setSearchTerm('');
            setFilters(prev => ({ ...prev, status: '' }));
          }}
        >
          <Statistic 
            title={<span style={{ fontSize: '12px', fontWeight: '500' }}>Total</span>}
            value={stats.total} 
            valueStyle={{ color: '#1890ff', fontSize: '20px', fontWeight: 'bold' }}
            prefix={<FileTextOutlined style={{ fontSize: '16px' }} />}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={8} md={4}>
        <Card 
          hoverable 
          size="small"
          style={{ 
            textAlign: 'center', 
            borderRadius: 8,
            border: '1px solid #faad14',
            background: 'white',
            cursor: 'pointer'
          }}
          bodyStyle={{ padding: '12px 6px' }}
          onClick={() => {
            setSearchTerm('');
            setFilters(prev => ({ ...prev, status: 'pending' }));
          }}
        >
          <Statistic 
            title={<span style={{ fontSize: '12px', fontWeight: '500' }}>Pending</span>}
            value={stats.pending} 
            valueStyle={{ color: '#faad14', fontSize: '20px', fontWeight: 'bold' }}
            prefix={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={8} md={4}>
        <Card 
          hoverable 
          size="small"
          style={{ 
            textAlign: 'center', 
            borderRadius: 8,
            border: '1px solid #52c41a',
            background: 'white',
            cursor: 'pointer'
          }}
          bodyStyle={{ padding: '12px 6px' }}
          onClick={() => {
            setSearchTerm('');
            setFilters(prev => ({ ...prev, status: 'approved' }));
          }}
        >
          <Statistic 
            title={<span style={{ fontSize: '12px', fontWeight: '500' }}>Approved</span>}
            value={stats.approved} 
            valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
            prefix={<CheckCircleOutlined style={{ fontSize: '16px' }} />}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={8} md={4}>
        <Card 
          hoverable 
          size="small"
          style={{ 
            textAlign: 'center', 
            borderRadius: 8,
            border: '1px solid #ff4d4f',
            background: 'white',
            cursor: 'pointer'
          }}
          bodyStyle={{ padding: '12px 6px' }}
          onClick={() => {
            setSearchTerm('');
            setFilters(prev => ({ ...prev, status: 'rejected' }));
          }}
        >
          <Statistic 
            title={<span style={{ fontSize: '12px', fontWeight: '500' }}>Rejected</span>}
            value={stats.rejected} 
            valueStyle={{ color: '#ff4d4f', fontSize: '20px', fontWeight: 'bold' }}
            prefix={<CloseCircleOutlined style={{ fontSize: '16px' }} />}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={8} md={4}>
        <Card 
          hoverable 
          size="small"
          style={{ 
            textAlign: 'center', 
            borderRadius: 8,
            border: '1px solid #722ed1',
            background: 'white',
            cursor: 'pointer'
          }}
          bodyStyle={{ padding: '12px 6px' }}
          onClick={() => {
            setSearchTerm('');
            setFilters(prev => ({ ...prev, hasDue: 'yes' }));
          }}
        >
          <Statistic 
            title={<span style={{ fontSize: '12px', fontWeight: '500' }}>With Dues</span>}
            value={stats.withDues} 
            valueStyle={{ color: '#722ed1', fontSize: '20px', fontWeight: 'bold' }}
            prefix={<WarningOutlined style={{ fontSize: '16px' }} />}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: 30, maxWidth: 1400, margin: '0 auto', minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
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
                <BookOutlined /> Library Clearance System
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px' }}>
                Welcome, {user?.username || 'Librarian'} - Library Manager
              </Text>
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
                onClick={() => navigate("/librarian/payments")}
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
                onClick={() => setDueRegistrationModal(true)}
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

      {/* Compact Statistics Row */}
      {renderCompactStats()}

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
                    indeterminate={selectedForms.length > 0 && selectedForms.length < filteredForms.length}
                  >
                    Select All ({selectedForms.length} / {filteredForms.length})
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
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                type={showFilters ? "primary" : "default"}
              >
                Filters
              </Button>
              
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
      </Card>

      {/* Filters */}
      {renderFilters()}

      {/* Bulk Action Bar */}
      {renderBulkActionBar()}

      {/* Main Content */}
      <Card>
        {/* Manual Verification Alert */}
        <Alert
          message="BOOK VERIFICATION REQUIRED"
          description={
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>No automatic checking - Librarian must verify</strong></li>
              <li>Check the due registry for reference</li>
              <li>Verify if student has borrowed books</li>
              <li>Check if any books are overdue or have fines</li>
              <li>Update the registry if needed</li>
            </ol>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 20, borderRadius: 10 }}
        />
        
        {/* Form List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <Spin size="large" />
            <p style={{ marginTop: 20, fontSize: '16px', color: '#666' }}>
              Loading clearance forms from departments...
            </p>
          </div>
        ) : filteredForms.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {searchTerm ? `No results for "${searchTerm}"` : "No forms awaiting library clearance"}
              </span>
            }
          >
            <Button type="primary" onClick={() => {
              setSearchTerm("");
              filterForm.resetFields();
              setFilters({
                department: 'all',
                year: 'all',
                program: 'all',
                hasDue: 'all'
              });
            }}>
              Clear Filters
            </Button>
          </Empty>
        ) : (
          <>
            {paginatedForms.map(renderFormCard)}
            
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredForms.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger
                onShowSizeChange={(current, size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                pageSizeOptions={['20', '50', '100', '200']}
                showTotal={(total) => `Total ${total} pending forms`}
              />
            </div>
          </>
        )}
      </Card>

      {/* Book Check Modal */}
      <Modal
        title={
          <Space>
            <BookOutlined />
            <span>Book Status Check</span>
            {bookDetails.student_info && (
              <Tag color="blue">
                {bookDetails.student_info.student_name}
              </Tag>
            )}
          </Space>
        }
        open={bookModal}
        onCancel={() => setBookModal(false)}
        footer={[
          <Button key="close" onClick={() => setBookModal(false)}>
            Close
          </Button>,
          <Button 
            key="approve" 
            type="primary" 
            icon={<CheckCircleOutlined />}
            onClick={() => quickApproveAfterBookCheck("Approved after book check")}
            disabled={bookDetails.has_due_books}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Approve (Verified)
          </Button>
        ]}
        width={700}
      >
        <Alert
          message="Registry Check Only"
          description="This is from the manual registry. You must verify."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />
        
        <div style={{ marginBottom: 20 }}>
          <Alert
            message={bookDetails.has_due_books ? "DUE BOOKS FOUND" : "NO DUE BOOKS FOUND"}
            description={
              bookDetails.has_due_books 
                ? `Student has ${bookDetails.books.length} due book(s) in registry.`
                : "No due books found in manual registry. Still requires verification."
            }
            type={bookDetails.has_due_books ? "warning" : "info"}
            showIcon
            icon={bookDetails.has_due_books ? <WarningOutlined /> : <InfoCircleOutlined />}
          />
        </div>
        
        {bookDetails.books.length > 0 && (
          <Table 
            dataSource={bookDetails.books} 
            pagination={false}
            rowKey="id"
            size="small"
          >
            <Table.Column title="Book Title" dataIndex="title" key="title" />
            <Table.Column title="Book ID" dataIndex="book_id" key="book_id" />
            <Table.Column title="Due Date" dataIndex="due_date" key="due_date" />
            <Table.Column title="Fine" dataIndex="fine" key="fine" render={(fine) => `ETB ${fine}`} />
            <Table.Column title="Status" dataIndex="status" key="status" render={(status) => (
              <Tag color={status === 'overdue' ? 'red' : 'orange'}>{status.toUpperCase()}</Tag>
            )} />
          </Table>
        )}
        
        {bookDetails.total_fines > 0 && (
          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <Text strong type="danger">
              Total Fines: ETB {bookDetails.total_fines}
            </Text>
          </div>
        )}
      </Modal>

      {/* Batch Processing Modal */}
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

              {batchAction === 'reject' && (
                <>
                  <Divider>Fine Requirements (Optional)</Divider>
                  
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
                            label="Fine Amount"
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
                              placeholder="e.g., Overdue books"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Text type="secondary">Note: This will be added to any existing student fines</Text>
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
                      {item.fines > 0 && (
                        <Tag color="gold" style={{ marginLeft: 8 }}>Fines: ETB {item.fines}</Tag>
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
                <Card size="small" style={{ background: '#e6f7ff' }}>{selectedForm.reason}</Card>
              </Descriptions.Item>
              {selectedForm.department_note && (
                <Descriptions.Item label="Department Note" span={2}>
                  <Alert message={selectedForm.department_note} type="info" showIcon />
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedForm.status === "approved_department" && (
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
            <Option value="require_payment">Require Payment (Library Fines)</Option>
          </Select>
        </div>
        
        {rejectAction === 'require_payment' && (
          <div style={{ marginBottom: 20, padding: 15, background: '#f6f8fa', borderRadius: 8 }}>
            <Title level={5}><DollarOutlined /> Fine Details</Title>
            <Input placeholder="Fine Amount" prefix="ETB" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} style={{ marginBottom: 10 }} />
            <Input.TextArea placeholder="Fine Reason" value={paymentReason} onChange={(e) => setPaymentReason(e.target.value)} rows={2} />
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

      {/* Due Registration Modal */}
      <Modal
        title={<Space><DatabaseOutlined /><span>Due Registry</span></Space>}
        open={dueRegistrationModal}
        onCancel={() => setDueRegistrationModal(false)}
        footer={null}
        width={1000}
      >
        <div style={{ marginBottom: 20 }}>
          <Row gutter={16}>
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
        </div>

        <Table
          dataSource={searchDueStudents()}
          rowKey="id"
          loading={loadingDues}
          pagination={{ pageSize: 10 }}
        >
          <Table.Column title="Student ID" dataIndex="student_id" key="student_id" />
          <Table.Column title="Student Name" dataIndex="student_name" key="student_name" />
          <Table.Column title="Book Title" dataIndex="book_title" key="book_title" />
          <Table.Column title="Book ID" dataIndex="book_id" key="book_id" />
          <Table.Column title="Borrow Date" dataIndex="borrow_date" key="borrow_date" />
          <Table.Column title="Due Date" dataIndex="due_date" key="due_date" render={(date) => (
            <Space>
              {date}
              {dayjs(date).isBefore(dayjs()) && <Tag color="red">OVERDUE</Tag>}
            </Space>
          )} />
          <Table.Column title="Fine" dataIndex="fine_amount" key="fine_amount" render={(fine) => fine > 0 ? `ETB ${fine}` : 'None'} />
          <Table.Column title="Status" dataIndex="status" key="status" render={(status) => (
            <Tag color={status === 'overdue' ? 'red' : 'orange'}>{status.toUpperCase()}</Tag>
          )} />
          <Table.Column title="Actions" key="actions" render={(_, record) => (
            <Space>
              <Tooltip title="Edit">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => {
                    form.setFieldsValue({
                      student_id: record.student_id,
                      student_name: record.student_name,
                      book_title: record.book_title,
                      book_id: record.book_id,
                      borrow_date: dayjs(record.borrow_date),
                      due_date: dayjs(record.due_date),
                      fine_amount: record.fine_amount
                    });
                    setEditingDue(record);
                    setRegisterDueModal(true);
                    setDueRegistrationModal(false);
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
          )} />
        </Table>
      </Modal>

      {/* Register Due Modal */}
      <Modal
        title={<Space><DatabaseOutlined /><span>{editingDue ? 'Edit Due Record' : 'Register New Due'}</span></Space>}
        open={registerDueModal}
        onCancel={() => {
          setRegisterDueModal(false);
          setEditingDue(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
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
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="book_title" label="Book Title" rules={[{ required: true }]}>
                <Input placeholder="Enter book title" prefix={<BookOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="book_id" label="Book ID" rules={[{ required: true }]}>
                <Input placeholder="Enter book ID" prefix={<IdcardOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="borrow_date" label="Borrow Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="due_date" label="Due Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="fine_amount" label="Fine Amount (ETB)">
            <InputNumber style={{ width: '100%' }} placeholder="Enter fine amount if applicable" min={0} step={0.01} />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setRegisterDueModal(false);
                setEditingDue(null);
                form.resetFields();
                setDueRegistrationModal(true);
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

      {/* Chat Modal */}
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
                          background: isOwnMessage ? '#1890ff' : '#f0f2f5',
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
                  style={{ height: 'auto', padding: '0 24px', background: '#1890ff' }}
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

      {/* Footer */}
      <div style={{ 
        marginTop: 40, 
        padding: '20px 0', 
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Text type="secondary">
          Library Clearance System • {new Date().getFullYear()} • 
          <span style={{ marginLeft: 8, color: '#1890ff' }}>
            Total: {stats.total} • Pending: {stats.pending} • Approved: {stats.approved} • Records: {dueStudents.length}
          </span>
        </Text>
      </div>
    </div>
  );
}