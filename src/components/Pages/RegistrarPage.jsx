import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Card, Button, Typography, Input, message, Spin, Modal, 
  Table, Tag, Statistic, Row, Col, Descriptions, Alert,
  Space, Tooltip, Badge, Progress, Steps, Divider, Checkbox,
  List, Form, Radio, Select, DatePicker, Result, Dropdown, Menu
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  UserOutlined,
  HomeOutlined,
  BookOutlined,
  CoffeeOutlined,
  ReloadOutlined,
  FileTextOutlined,
  BankOutlined,
  AppstoreOutlined,
  RocketOutlined,
  FilterOutlined,
  DeleteOutlined,
SearchOutlined,
CloseCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { confirm } = Modal;
const API_BASE = "http://127.0.0.1:8000/api/";

export default function RegistrarPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ 
    total: 0, 
    cleared: 0, 
    pending: 0, 
    waiting: 0,
    completion_rate: 0
  });
  
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
    status: '',
    dateRange: null
  });
  
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Get token and user info
  useEffect(() => {
    const stored = sessionStorage.getItem("ucs_current");
    if (!stored) {
      message.error("Please login first");
      window.location.href = "/login";
      return;
    }

    const parsed = JSON.parse(stored);
    if (parsed.role !== "registrar") {
      message.error("Access denied. Registrar only.");
      window.location.href = "/login";
      return;
    }

    setUser(parsed);
    setToken(parsed.token);
    loadForms(parsed.token);
    loadStatistics(parsed.token);
  }, []);

  // ---------------- Load forms ----------------
  const loadForms = async (authToken) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}registrar/forms/`, {
        headers: { 
          Authorization: `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data && Array.isArray(res.data)) {
        setForms(res.data);
      } else {
        console.error("Invalid response format:", res.data);
        setForms([]);
      }
      
    } catch (err) {
      console.error("Error loading forms:", err);
      if (err.response?.status === 401) {
        message.error("Session expired. Please login again.");
        sessionStorage.clear();
        window.location.href = "/login";
      } else {
        message.error(`Failed to load forms: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Load statistics ----------------
  const loadStatistics = async (authToken) => {
    try {
      setLoadingStats(true);
      const res = await axios.get(`${API_BASE}registrar/statistics/`, {
        headers: { 
          Authorization: `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data) {
        setStats({
          total: res.data.total || 0,
          cleared: res.data.cleared || 0,
          pending: res.data.pending || 0,
          waiting: res.data.waiting || 0,
          completion_rate: res.data.completion_rate || 0
        });
      }
    } catch (err) {
      console.error("Error loading statistics:", err);
      calculateStats();
    } finally {
      setLoadingStats(false);
    }
  };

  // ---------------- Calculate statistics (fallback) ----------------
  const calculateStats = () => {
    const total = forms.length;
    const cleared = forms.filter(f => f.status === "Cleared by Registrar").length;
    const pending = forms.filter(f => f.status === "approved_dormitory").length;
    const waiting = total - cleared - pending;
    const completion_rate = total > 0 ? (cleared / total) * 100 : 0;
    
    setStats({ 
      total, 
      cleared, 
      pending, 
      waiting,
      completion_rate
    });
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
        .filter(f => f.status === "approved_dormitory")
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
          
          // Check if form is ready for clearance
          if (batchAction === 'approve' && form.status !== "approved_dormitory") {
            results.failed.push({
              id: formId,
              name: form.full_name,
              reason: 'Form not ready for clearance - missing department approvals'
            });
            continue;
          }
          
          const payload = {
            action: batchAction === 'approve' ? 'approve' : 'reject',
            note: batchNotes || `Batch ${batchAction} by Registrar`
          };
          
          const res = await axios.patch(
            `${API_BASE}registrar/action/${formId}/`,
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
            message: res.data.message || `${batchAction} successful`
          });
          
          // Update local state
          setForms(prev => prev.map(f => {
            if (f.id === formId) {
              const newStatus = batchAction === 'approve' ? 'Cleared by Registrar' : 'rejected';
              return { 
                ...f, 
                status: newStatus,
                registrar_note: batchNotes || f.registrar_note
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
      message.info({
        content: (
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
      loadStatistics(token);
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
    let filtered = forms;
    
    if (filterCriteria.department) {
      filtered = filtered.filter(f => f.department_name === filterCriteria.department);
    }
    
    if (filterCriteria.status) {
      filtered = filtered.filter(f => f.status === filterCriteria.status);
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

  // ---------------- Get approval status based on form status ----------------
  const getApprovalStatus = (form) => {
    if (!form) return [];
    
    const statusMap = {
      "approved_department": {
        department: "Approved",
        library: "Pending",
        cafeteria: "Pending",
        dormitory: "Pending"
      },
      "approved_library": {
        department: "Approved",
        library: "Approved",
        cafeteria: "Pending",
        dormitory: "Pending"
      },
      "approved_cafeteria": {
        department: "Approved",
        library: "Approved",
        cafeteria: "Approved",
        dormitory: "Pending"
      },
      "approved_dormitory": {
        department: "Approved",
        library: "Approved",
        cafeteria: "Approved",
        dormitory: "Approved"
      },
      "Cleared by Registrar": {
        department: "Approved",
        library: "Approved",
        cafeteria: "Approved",
        dormitory: "Approved",
        registrar: "Approved"
      }
    };
    
    const status = statusMap[form.status] || {
      department: "Pending",
      library: "Pending",
      cafeteria: "Pending",
      dormitory: "Pending"
    };
    
    const approvals = [
      { 
        department: "Department Head", 
        status: status.department === "Approved", 
        note: status.department,
        icon: <UserOutlined />,
        color: status.department === "Approved" ? "green" : "orange"
      },
      { 
        department: "Librarian", 
        status: status.library === "Approved", 
        note: status.library,
        icon: <BookOutlined />,
        color: status.library === "Approved" ? "green" : "orange"
      },
      { 
        department: "Cafeteria", 
        status: status.cafeteria === "Approved", 
        note: status.cafeteria,
        icon: <CoffeeOutlined />,
        color: status.cafeteria === "Approved" ? "green" : "orange"
      },
      { 
        department: "Dormitory", 
        status: status.dormitory === "Approved", 
        note: status.dormitory,
        icon: <HomeOutlined />,
        color: status.dormitory === "Approved" ? "green" : "orange"
      },
    ];
    
    return approvals;
  };

  const isReadyForClearance = (form) => {
    return form.status === "approved_dormitory";
  };

  // ---------------- Finalize ----------------
  const finalizeForm = async (formId) => {
    try {
      setActionLoading(prev => ({ ...prev, [formId]: true }));
      
      const form = forms.find(f => f.id === formId);
      if (!form) {
        message.error("Form not found");
        return;
      }

      if (!isReadyForClearance(form)) {
        message.error("Form must be approved by dormitory first");
        return;
      }

      const res = await axios.patch(`${API_BASE}registrar/action/${formId}/`, 
        { 
          action: "approve", 
          note: "Cleared by Registrar" 
        },
        { 
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      message.success("✅ Form cleared and finalized");
      loadForms(token);
      loadStatistics(token);
    } catch (err) {
      console.error("Error finalizing form:", err);
      if (err.response?.status === 400) {
        message.error(err.response.data?.error || "Cannot approve this form");
      } else {
        message.error("Failed to finalize form");
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [formId]: false }));
    }
  };
  // ---------------- View Form Details ----------------
  const viewFormDetails = (form) => {
    setSelectedForm(form);
    setViewModalVisible(true);
  };

  // ---------------- Render clearance flow ----------------
  const renderClearanceFlow = (form) => {
    const approvals = getApprovalStatus(form);
    
    return (
      <Steps size="small" style={{ marginTop: 20 }}>
        {approvals.map((approval, index) => (
          <Step
            key={index}
            title={approval.department}
            description={approval.status ? "Approved" : "Pending"}
            icon={approval.status ? 
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
              <ClockCircleOutlined style={{ color: '#faad14' }} />}
          />
        ))}
        <Step
          title="Registrar"
          description={form.status === "Cleared by Registrar" ? "Cleared" : "Waiting"}
          icon={form.status === "Cleared by Registrar" ? 
            <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
            <FileTextOutlined />}
        />
      </Steps>
    );
  };

  // ---------------- Logout ----------------
  const logout = () => {
    sessionStorage.clear();
    message.success("Logged out successfully");
    window.location.href = "/login";
  };

  // ---------------- Medium Stats Row ----------------
  // ---------------- Medium Stats Row (with decreased width) ----------------
  const renderMediumStats = () => (
    <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
      <Col xs={12} sm={8} md={4}>
        <Card 
          hoverable 
          size="small"
          style={{ 
            textAlign: 'center', 
            borderRadius: 8,
            border: '1px solid #722ed1',
            background: 'white'
          }}
          bodyStyle={{ padding: '12px 6px' }}
        >
          <Statistic 
            title={<span style={{ fontSize: '12px', fontWeight: '500' }}>Total</span>}
            value={stats.total} 
            valueStyle={{ color: '#722ed1', fontSize: '20px', fontWeight: 'bold' }}
            prefix={<FileTextOutlined style={{ fontSize: '16px' }} />}
            loading={loadingStats}
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
            background: 'white'
          }}
          bodyStyle={{ padding: '12px 6px' }}
        >
          <Statistic 
            title={<span style={{ fontSize: '12px', fontWeight: '500' }}>Cleared</span>}
            value={stats.cleared} 
            valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
            prefix={<CheckCircleOutlined style={{ fontSize: '16px' }} />}
            loading={loadingStats}
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
            border: '1px solid #1890ff',
            background: 'white'
          }}
          bodyStyle={{ padding: '12px 6px' }}
        >
          <Statistic 
            title={<span style={{ fontSize: '12px', fontWeight: '500' }}>Ready</span>}
            value={stats.pending} 
            valueStyle={{ color: '#1890ff', fontSize: '20px', fontWeight: 'bold' }}
            prefix={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
            loading={loadingStats}
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
            background: 'white'
          }}
          bodyStyle={{ padding: '12px 6px' }}
        >
          <Statistic 
            title={<span style={{ fontSize: '12px', fontWeight: '500' }}>Waiting</span>}
            value={stats.waiting} 
            valueStyle={{ color: '#faad14', fontSize: '20px', fontWeight: 'bold' }}
            prefix={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
            loading={loadingStats}
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
            border: '1px solid #13c2c2',
            background: 'white'
          }}
          bodyStyle={{ padding: '12px 6px' }}
        >
          <Statistic 
            title={<span style={{ fontSize: '12px', fontWeight: '500' }}>Rate</span>}
            value={stats.completion_rate} 
            valueStyle={{ color: '#13c2c2', fontSize: '20px', fontWeight: 'bold' }}
            prefix={<BankOutlined style={{ fontSize: '16px' }} />}
            suffix="%"
            loading={loadingStats}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ minHeight: '100vh', padding: 20, background: '#f0f2f5' }}>
      {/* Header */}
      <Card style={{ marginBottom: 20, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <BankOutlined /> Registrar Clearance System
            </Title>
            <Text type="secondary">
              Welcome, {user?.username || 'Registrar Officer'}
            </Text>
          </Col>
          <Col>
            <Space size="middle">
              <Button 
                icon={<UserOutlined />}
                onClick={() => navigate("/profile")}
              >
                My Profile
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => {
                  loadForms(token);
                  loadStatistics(token);
                }}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Medium Statistics Row */}
      {renderMediumStats()}

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
                    indeterminate={selectedForms.length > 0 && selectedForms.length < getFilteredByCriteria().filter(f => f.status === "approved_dormitory").length}
                  >
                    Select All ({selectedForms.length} / {getFilteredByCriteria().filter(f => f.status === "approved_dormitory").length})
                  </Checkbox>
                  
                  <Button 
                    icon={<CheckOutlined />} 
                    type="primary" 
                    style={{ background: "#52c41a" }}
                    onClick={() => openBatchModal('approve')}
                    disabled={selectedForms.length === 0}
                  >
                    Batch Clear ({selectedForms.length})
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
                    <Menu.Item key="status">
                      <Space><ClockCircleOutlined /> Filter by Status</Space>
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
              {filterCriteria.status && (
                <Tag closable onClose={() => setFilterCriteria(prev => ({ ...prev, status: '' }))}>
                  Status: {filterCriteria.status}
                </Tag>
              )}
              <Button type="link" size="small" onClick={() => setFilterCriteria({
                department: '',
                status: '',
                dateRange: null
              })}>
                Clear All
              </Button>
            </Space>
          </div>
        )}
      </Card>

      {/* Forms List */}
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            <span>Pending Clearance Forms</span>
            <Tag color="blue">{forms.length} forms</Tag>
            {batchMode && (
              <Tag color="purple">{selectedForms.length} selected</Tag>
            )}
          </Space>
        } 
        style={{ marginBottom: 20, borderRadius: 10 }}
        extra={
          <Button 
            type="link" 
            icon={<ReloadOutlined />} 
            onClick={() => {
              loadForms(token);
              loadStatistics(token);
            }}
            loading={loading}
          >
            Refresh List
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="Loading forms..." size="large" />
          </div>
        ) : forms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} type="secondary">No forms ready for clearance</Title>
            <Text type="secondary">
              {stats.waiting > 0 
                ? `There are ${stats.waiting} forms waiting for department approvals.`
                : "All forms have been processed."}
            </Text>
          </div>
        ) : (
          forms.map(form => {
            const ready = isReadyForClearance(form);
            const cleared = form.status === "Cleared by Registrar";
            
            return (
              <Card 
                key={form.id} 
                style={{ 
                  marginBottom: 20, 
                  borderRadius: 10,
                  borderLeft: `5px solid ${cleared ? '#52c41a' : ready ? '#1890ff' : '#faad14'}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  background: selectedForms.includes(form.id) ? '#f0f5ff' : 'white'
                }}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      {batchMode && ready && !cleared && (
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
                      <Title level={5} style={{ margin: 0 }}>{form.full_name}</Title>
                      <Badge count="ID" style={{ backgroundColor: '#1890ff' }} />
                      <Text strong>{form.id_number}</Text>
                    </Space>
                    <Space>
                      {cleared ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>CLEARED</Tag>
                      ) : ready ? (
                        <Tag color="blue" icon={<ClockCircleOutlined />}>READY FOR CLEARANCE</Tag>
                      ) : (
                        <Tag color="orange" icon={<ClockCircleOutlined />}>WAITING FOR APPROVALS</Tag>
                      )}
                      <Button 
                        type="link" 
                        icon={<EyeOutlined />} 
                        onClick={() => viewFormDetails(form)}
                      >
                        View Details
                      </Button>
                    </Space>
                  </div>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Descriptions size="small" column={4}>
                      <Descriptions.Item label="College">{form.college}</Descriptions.Item>
                      <Descriptions.Item label="Department">{form.department_name}</Descriptions.Item>
                      <Descriptions.Item label="Program">{form.program_level}</Descriptions.Item>
                      <Descriptions.Item label="Submitted">
                        {new Date(form.created_at).toLocaleDateString()}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  
                  <Col span={24}>
                    {renderClearanceFlow(form)}
                  </Col>
                  
                  <Col span={24}>
                    <Divider style={{ margin: '16px 0' }} />
                    <div style={{ textAlign: 'center' }}>
                      <Space size="large">
                        {cleared ? (
                          <Alert
                            message="Cleared"
                            description="This form has been cleared and sent to student."
                            type="success"
                            showIcon
                            style={{ width: '100%' }}
                          />
                        ) : (
                          <>
                            <Tooltip title={ready ? "Finalize and clear this form" : "Wait for all departments to approve"}>
                              <Button 
                                type="primary" 
                                icon={<CheckOutlined />} 
                                onClick={() => finalizeForm(form.id)} 
                                disabled={!ready}
                                loading={actionLoading[form.id]}
                                style={{ 
                                  background: ready ? '#1890ff' : '#d9d9d9',
                                  borderColor: ready ? '#1890ff' : '#d9d9d9',
                                  cursor: ready ? 'pointer' : 'not-allowed'
                                }}
                              >
                                Finalize & Clear
                              </Button>
                            </Tooltip>
                            
                          </>
                        )}
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Card>
            );
          })
        )}
      </Card>

      {/* Batch Processing Modal */}
      <Modal
        title={
          <Space>
            <RocketOutlined style={{ color: '#1890ff' }} />
            <span>Batch {batchAction === 'approve' ? 'Clearance' : 'Rejection'}</span>
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
                    style={batchAction === 'approve' ? { background: '#1890ff' } : {}}
                    icon={batchAction === 'approve' ? <CheckOutlined /> : <CloseOutlined />}
                  >
                    Confirm Batch {batchAction === 'approve' ? 'Clearance' : 'Rejection'}
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
                  loadStatistics(token);
                }}>
                  Refresh Forms
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* View Form Details Modal */}
      <Modal
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
        style={{ top: 20 }}
        title={
          <Space>
            <FileTextOutlined />
            <span>Clearance Form Details - {selectedForm?.full_name}</span>
            {selectedForm && (
              <Tag color={selectedForm.status === "Cleared by Registrar" ? "green" : "blue"}>
                {selectedForm.status}
              </Tag>
            )}
          </Space>
        }
      >
        {selectedForm && (
          <div style={{ maxHeight: '70vh', overflow: 'auto', padding: '0 10px' }}>
            <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: 'bold', background: '#fafafa' }}>
              <Descriptions.Item label="Student Information">
                <Space direction="vertical">
                  <Text strong>{selectedForm.full_name}</Text>
                  <Text>ID: {selectedForm.id_number}</Text>
                  <Text type="secondary">
                    Submitted: {new Date(selectedForm.created_at).toLocaleString()}
                  </Text>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Academic Information">
                <Space direction="vertical">
                  <Text>College: {selectedForm.college}</Text>
                  <Text>Department: {selectedForm.department_name}</Text>
                  <Text>Program: {selectedForm.program_level}</Text>
                  <Text>Year/Semester: {selectedForm.year}/{selectedForm.semester}</Text>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Clearance Reason">
                <Card size="small" style={{ background: '#f6ffed', marginTop: 5 }}>
                  <div style={{ whiteSpace: 'pre-wrap', padding: '8px' }}>
                    {selectedForm.reason}
                  </div>
                </Card>
              </Descriptions.Item>
              
              <Descriptions.Item label="Current Status">
                <Alert
                  message={selectedForm.status}
                  description="Form progress through departments"
                  type={
                    selectedForm.status === "Cleared by Registrar" ? "success" :
                    selectedForm.status === "approved_dormitory" ? "info" :
                    "warning"
                  }
                  showIcon
                />
              </Descriptions.Item>
              
              {isReadyForClearance(selectedForm) && (
                <Descriptions.Item label="Action Required">
                  <Alert
                    message="Ready for Final Clearance"
                    description="All departments have approved this form. You can now finalize it."
                    type="success"
                    showIcon
                    style={{ marginTop: 15 }}
                    action={
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => {
                          finalizeForm(selectedForm.id);
                          setViewModalVisible(false);
                        }}
                      >
                        Finalize Now
                      </Button>
                    }
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
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
          Registrar Clearance System • {new Date().getFullYear()} • 
          <span style={{ marginLeft: 8, color: '#1890ff' }}>
            Total Cleared: {stats.cleared} • Ready: {stats.pending}
          </span>
        </Text>
      </div>
    </div>
  );
}