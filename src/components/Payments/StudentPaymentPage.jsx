// components/Payments/StudentPaymentPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Card,
  Button,
  Table,
  Tag,
  Modal,
  Image,
  message,
  Alert,
  Descriptions,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Input,
  Steps,
  Upload,
  Form,
  DatePicker,
  Select,
  Divider,
  List,
  Tooltip
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  UploadOutlined,
  PhoneOutlined,
  BankOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  DollarOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  SafetyOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import copy from 'copy-to-clipboard';
import { API_BASE } from '../../utils/api';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

export default function StudentPaymentPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [receiptModal, setReceiptModal] = useState(false);
  const [receiptImage, setReceiptImage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [paymentData, setPaymentData] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedMethodDetails, setSelectedMethodDetails] = useState(null);

  // ALL department roles that can receive payments
  const ALL_DEPARTMENTS = [
    { value: 'library', label: 'Library', icon: '📚', color: 'blue' },
    { value: 'cafeteria', label: 'Cafeteria', icon: '🍽️', color: 'green' },
    { value: 'dormitory', label: 'Dormitory', icon: '🏠', color: 'purple' },
    { value: 'psychology', label: 'Psychology', icon: '🧠', color: 'magenta' },
    { value: 'sportmaster', label: 'Sport Master', icon: '🏆', color: 'orange' },
    { value: 'campuspolice', label: 'Campus Police', icon: '👮', color: 'red' },
    { value: 'cooperationsharing', label: 'Cooperation Sharing', icon: '🤝', color: 'cyan' },
    { value: 'dopcordinator', label: 'DOP Cordinator', icon: '📋', color: 'gold' },
    { value: 'studentaffairs', label: 'Student Affairs', icon: '👥', color: 'lime' }
  ];

  // Map department values to display info
  const DEPARTMENT_INFO = ALL_DEPARTMENTS.reduce((acc, dept) => {
    acc[dept.value] = dept;
    return acc;
  }, {});

  useEffect(() => {
    const initialize = async () => {
      const stored = sessionStorage.getItem("ucs_current");
      if (!stored) {
        message.error("Please login first");
        navigate("/login");
        return;
      }

      const parsed = JSON.parse(stored);
      if (parsed.role !== "student") {
        message.error("Access denied. Student only.");
        navigate("/login");
        return;
      }

      setToken(parsed.token);
      await loadData(parsed.token);
    };
    
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadData = useCallback(async (authToken) => {
    try {
      setLoading(true);
      await Promise.all([
        loadPayments(authToken),
        loadPaymentMethods(authToken)
      ]);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPayments = async (authToken) => {
    try {
      const res = await axios.get(`${API_BASE}payment/student/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      setPayments(res.data);
    } catch (err) {
      console.error("Error loading payments:", err);
      message.error("Failed to load payments");
    }
  };

  const loadPaymentMethods = async (authToken) => {
    try {
      const res = await axios.get(`${API_BASE}payment/methods/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      setPaymentMethods(res.data);
    } catch (err) {
      console.error("Error loading payment methods:", err);
      message.error("Failed to load payment methods");
    }
  };

  // Calculate statistics from student's own payments
  const calculateStats = () => {
    const totalAmount = payments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount || 0);
    }, 0);

    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const verifiedCount = payments.filter(p => p.status === 'verified').length;
    const rejectedCount = payments.filter(p => p.status === 'rejected').length;

    const byDepartment = {};
    ALL_DEPARTMENTS.forEach(dept => {
      byDepartment[dept.value] = payments.filter(p => p.department_type === dept.value).length;
    });

    return {
      total_payments: payments.length,
      total_amount: totalAmount.toFixed(2),
      pending: pendingCount,
      verified: verifiedCount,
      rejected: rejectedCount,
      by_department: byDepartment
    };
  };

  const handleMethodSelect = (value) => {
    const method = paymentMethods.find(m => m.id === value);
    setSelectedMethod(value);
    setSelectedMethodDetails(method);
  };

  const copyToClipboard = (text) => {
    if (copy(text)) {
      message.success('Copied to clipboard!');
    } else {
      message.error('Failed to copy');
    }
  };

  const renderPaymentMethodDetails = () => {
    if (!selectedMethodDetails) return null;

    return (
      <Card 
        title={
          <Space>
            <BankOutlined />
            <span>Payment Method Details</span>
          </Space>
        }
        size="small"
        style={{ 
          marginBottom: 16, 
          border: '2px solid #1890ff',
          borderRadius: 8
        }}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Method Name">
            <Space>
              <Tag color="blue">{selectedMethodDetails.name}</Tag>
              {selectedMethodDetails.bank_name && (
                <Text type="secondary">({selectedMethodDetails.bank_name})</Text>
              )}
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="Account Name">
            <Space>
              <Text strong>{selectedMethodDetails.account_name}</Text>
              <Tooltip title="Copy">
                <Button 
                  type="link" 
                  size="small" 
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(selectedMethodDetails.account_name)}
                />
              </Tooltip>
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="Account Number">
            <Space>
              <Text strong style={{ fontFamily: 'monospace', fontSize: '16px' }}>
                {selectedMethodDetails.account_number}
              </Text>
              <Tooltip title="Copy">
                <Button 
                  type="link" 
                  size="small" 
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(selectedMethodDetails.account_number)}
                />
              </Tooltip>
            </Space>
          </Descriptions.Item>
          
          {selectedMethodDetails.phone_number && (
            <Descriptions.Item label="Phone Number">
              <Space>
                <PhoneOutlined />
                <Text strong>{selectedMethodDetails.phone_number}</Text>
                <Tooltip title="Copy">
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(selectedMethodDetails.phone_number)}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
          )}
          
          {selectedMethodDetails.bank_name && (
            <Descriptions.Item label="Bank Name">
              <Text strong>{selectedMethodDetails.bank_name}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
        
        {selectedMethodDetails.instructions && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ marginTop: 8 }}>
              <Text strong>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                Payment Instructions:
              </Text>
              <div 
                style={{ 
                  backgroundColor: '#f6ffed', 
                  padding: 12, 
                  borderRadius: 4,
                  marginTop: 8,
                  whiteSpace: 'pre-line'
                }}
              >
                {selectedMethodDetails.instructions}
              </div>
            </div>
          </>
        )}
        
        <Divider style={{ margin: '12px 0' }} />
        <Alert
          message="Important"
          description="Make payment using the details above. Keep the transaction receipt for verification."
          type="info"
          showIcon
        />
      </Card>
    );
  };

  const renderPaymentSteps = () => {
    return (
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          <SafetyOutlined /> Payment Steps
        </Title>
        <Steps direction="vertical" size="small">
          <Step title="Select Payment Method" description="Choose your preferred payment method from the list" icon={<BankOutlined />} />
          <Step title="Copy Account Details" description="Copy the account number/phone number provided above" icon={<CopyOutlined />} />
          <Step title="Make Payment" description="Use your bank app or mobile money to make payment" icon={<CreditCardOutlined />} />
          <Step title="Fill Payment Form" description="Enter transaction details and upload receipt" icon={<IdcardOutlined />} />
          <Step title="Submit for Verification" description="Wait for department verification (24-48 hours)" icon={<CheckCircleOutlined />} />
        </Steps>
      </div>
    );
  };

  const viewReceipt = async (payment) => {
    try {
      const response = await axios.get(
        `${API_BASE}payment/${payment.id}/receipt/`,
        {
          headers: { Authorization: `Token ${token}` },
          responseType: "blob"
        }
      );
      const blob = new Blob([response.data], {
        type: response.headers["content-type"]
      });
      const url = window.URL.createObjectURL(blob);
      setReceiptImage(url);
      setReceiptModal(true);
    } catch (err) {
      console.error("Error loading receipt:", err);
      message.error("Failed to load receipt");
    }
  };

  const handleSubmitPayment = async (values) => {
    try {
      setSubmitting(true);

      if (!selectedMethod || selectedMethod === "undefined" || isNaN(Number(selectedMethod))) {
        message.error("Please select a valid payment method before submitting");
        setSubmitting(false);
        return;
      }

      if (!selectedMethodDetails) {
        message.error("Payment method details not found. Please select a payment method again.");
        setSubmitting(false);
        return;
      }

      if (!fileList.length || !fileList[0]?.originFileObj) {
        message.error("Please upload a receipt");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      const paymentMethodId = Number(selectedMethod);
      
      formData.append("payment_method_id", paymentMethodId);
      formData.append("department_type", paymentData.department_type || values.department_type);
      formData.append("transaction_id", paymentData.transaction_id || values.transaction_id);
      formData.append("amount", parseFloat(paymentData.amount || values.amount));
      formData.append("payment_date", (paymentData.payment_date || values.payment_date).format("YYYY-MM-DD"));
      
      if (paymentData.phone_number || values.phone_number) {
        formData.append("phone_number", paymentData.phone_number || values.phone_number);
      }
      if (paymentData.account_last_digits || values.account_last_digits) {
        formData.append("account_last_digits", paymentData.account_last_digits || values.account_last_digits);
      }
      
      formData.append("receipt_file", fileList[0].originFileObj);

      const response = await axios.post(`${API_BASE}payment/submit/`, formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success(response.data.message || "Payment submitted successfully!");

      setShowPaymentModal(false);
      form.resetFields();
      setFileList([]);
      setCurrentStep(0);
      setPaymentData({});
      setSelectedMethod(null);
      setSelectedMethodDetails(null);
      
      await loadPayments(token);
      
    } catch (err) {
      console.error("Payment submission error:", err);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.detail || 
                      err.response?.data?.message ||
                      "Payment submission failed. Please try again.";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "orange";
      case "verified": return "green";
      case "rejected": return "red";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case "verified": return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case "rejected": return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getDepartmentName = (dept) => DEPARTMENT_INFO[dept]?.label || dept;
  const getDepartmentIcon = (dept) => DEPARTMENT_INFO[dept]?.icon || '📋';
  const getDepartmentColor = (dept) => DEPARTMENT_INFO[dept]?.color || 'blue';

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
      render: (text) => <Text strong style={{ fontFamily: 'monospace', fontSize: '14px' }}>{text}</Text>
    },
    {
      title: "Department",
      dataIndex: "department_type",
      key: "department",
      render: (dept) => (
        <Tag color={getDepartmentColor(dept)} style={{ fontWeight: 500 }}>
          {getDepartmentIcon(dept)} {getDepartmentName(dept)}
        </Tag>
      ),
      filters: ALL_DEPARTMENTS.map(dept => ({ text: dept.label, value: dept.value })),
      onFilter: (value, record) => record.department_type === value,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <Space>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <Text strong type="success" style={{ fontSize: '15px' }}>
            {parseFloat(amount).toFixed(2)} ETB
          </Text>
        </Space>
      ),
      sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
    },
    {
      title: "Method",
      dataIndex: ["payment_method", "name"],
      key: "method",
      render: (method) => (
        <Tag color={method?.toLowerCase().includes('telebirr') ? 'green' : 'blue'}>
          {method || 'N/A'}
        </Tag>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Space>
          {getStatusIcon(status)}
          <Tag color={getStatusColor(status)} style={{ fontWeight: 600 }}>
            {status?.toUpperCase()}
          </Tag>
        </Space>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Verified', value: 'verified' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "date",
      render: (date) => (
        <Text type="secondary">
          {dayjs(date).format("MMM D, YYYY")}
          <br />
          <small>{dayjs(date).format("HH:mm")}</small>
        </Text>
      ),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => viewReceipt(record)} size="small" style={{ padding: 0 }}>
            Receipt
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              danger
              size="small"
              style={{ padding: 0, fontSize: '12px' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Cancel Payment?',
                  content: 'Are you sure you want to cancel this pending payment?',
                  onOk: async () => {
                    try {
                      await axios.delete(`${API_BASE}payment/${record.id}/cancel/`, {
                        headers: { Authorization: `Token ${token}` }
                      });
                      message.success('Payment cancelled successfully');
                      loadPayments(token);
                    } catch (err) {
                      message.error('Failed to cancel payment');
                    }
                  }
                });
              }}
            >
              Cancel
            </Button>
          )}
        </Space>
      )
    }
  ];

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";
    if (!isImage && !isPDF) {
      message.error("You can only upload JPG, PNG, or PDF files!");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 10) {
      message.error("File must be smaller than 10MB!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const stats = calculateStats();

  const renderDepartmentBreakdown = () => {
    return (
      <Row gutter={[8, 8]}>
        {ALL_DEPARTMENTS.map(dept => (
          <Col xs={12} sm={8} md={6} key={dept.value}>
            <Card size="small" style={{ textAlign: 'center', background: `${dept.color}10` }}>
              <div style={{ fontSize: '24px', marginBottom: 8 }}>{dept.icon}</div>
              <Text strong>{stats.by_department[dept.value] || 0}</Text>
              <div><Text type="secondary" style={{ fontSize: '12px' }}>{dept.label}</Text></div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Card
        title={
          <Space>
            <DollarOutlined />
            <span>My Payments</span>
            <Tag color="green">Student</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => loadData(token)} loading={loading}>
              Refresh
            </Button>
            <Button type="primary" onClick={() => setShowPaymentModal(true)} icon={<CreditCardOutlined />}>
              New Payment
            </Button>
          </Space>
        }
      >
        <Card title="Payment Statistics" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic title="Total Payments" value={stats.total_payments} prefix={<DollarOutlined />} valueStyle={{ color: '#1890ff' }} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic title="Total Amount" value={stats.total_amount} prefix="ETB" valueStyle={{ color: '#52c41a' }} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic title="Pending" value={stats.pending} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic title="Verified" value={stats.verified} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Col>
          </Row>
          
          {stats.pending > 0 && (
            <Alert
              message={`You have ${stats.pending} pending payment(s)`}
              description="These payments are awaiting verification by department staff."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
          
          <Divider orientation="left">Payments by Department</Divider>
          {renderDepartmentBreakdown()}
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Table
              columns={columns}
              dataSource={payments}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ margin: 0 }}>
                    <Descriptions column={2} size="small" bordered>
                      <Descriptions.Item label="Payment Method">
                        {record.payment_method?.name || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Submitted">
                        {dayjs(record.created_at).format('MMM D, YYYY HH:mm:ss')}
                      </Descriptions.Item>
                      {record.verified_at && (
                        <Descriptions.Item label="Verified At">
                          {dayjs(record.verified_at).format('MMM D, YYYY HH:mm')}
                        </Descriptions.Item>
                      )}
                      {record.verified_by && (
                        <Descriptions.Item label="Verified By">
                          {record.verified_by?.username || 'Staff'}
                        </Descriptions.Item>
                      )}
                      {record.rejection_reason && (
                        <Descriptions.Item label="Rejection Reason" span={2}>
                          <Alert message={record.rejection_reason} type="error" showIcon style={{ marginTop: 8 }} />
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </div>
                ),
              }}
            />
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Quick Actions" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" block icon={<CreditCardOutlined />} onClick={() => setShowPaymentModal(true)}>
                  Make New Payment
                </Button>
                <Button block icon={<ReloadOutlined />} onClick={() => loadData(token)} loading={loading}>
                  Refresh Data
                </Button>
                {stats.pending > 0 && (
                  <Button block type="dashed" icon={<ClockCircleOutlined />} onClick={() => {
                    message.info(`You have ${stats.pending} pending payment(s) awaiting verification`);
                  }}>
                    View Pending ({stats.pending})
                  </Button>
                )}
              </Space>
            </Card>
            {renderPaymentSteps()}
          </Col>
        </Row>
      </Card>

      {/* Payment Modal - Rest of your modal code remains the same */}
    </div>
  );
}