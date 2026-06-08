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
  Tooltip,
  FormItem,
  Collapse
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
const { Panel } = Collapse;

export default function StudentPaymentPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
    { value: 'dormitory', label: ' Dormitory', icon: '🏠', color: 'purple' },
    { value: 'psychology', label: ' Psychology', icon: '🧠', color: 'magenta' },
    { value: 'sportmaster', label: ' Sport Master', icon: '🏆', color: 'orange' },
    { value: 'campuspolice', label: 'Campus Police', icon: '👮', color: 'red' },
    { value: 'cooperationsharing', label: ' Cooperation Sharing', icon: '🤝', color: 'cyan' },
    { value: 'dopcordinator', label: 'DOP Cordinator', icon: '📋', color: 'gold' },
    { value: 'studentaffairs', label: 'Student Affairs', icon: '👥', color: 'lime' }
  ];

  // Map department values to display info
  const DEPARTMENT_INFO = ALL_DEPARTMENTS.reduce((acc, dept) => {
    acc[dept.value] = dept;
    return acc;
  }, {});

  useEffect(() => {
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

    setUser(parsed);
    setToken(parsed.token);
    loadData(parsed.token);
  }, [navigate]);

  const loadData = useCallback(
    async (authToken) => {
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
    },
    []
  );

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

  // Calculate statistics from student's own payments (including all departments)
  const calculateStats = () => {
    const totalAmount = payments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount || 0);
    }, 0);

    const pendingCount = payments.filter(p => p.status === 'pending').length;
    const verifiedCount = payments.filter(p => p.status === 'verified').length;
    const rejectedCount = payments.filter(p => p.status === 'rejected').length;

    // Count by department (including all departments)
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
          <Step 
            title="Select Payment Method" 
            description="Choose your preferred payment method from the list"
            icon={<BankOutlined />}
          />
          <Step 
            title="Copy Account Details" 
            description="Copy the account number/phone number provided above"
            icon={<CopyOutlined />}
          />
          <Step 
            title="Make Payment" 
            description="Use your bank app or mobile money to make payment"
            icon={<CreditCardOutlined />}
          />
          <Step 
            title="Fill Payment Form" 
            description="Enter transaction details and upload receipt"
            icon={<IdcardOutlined />}
          />
          <Step 
            title="Submit for Verification" 
            description="Wait for department verification (24-48 hours)"
            icon={<CheckCircleOutlined />}
          />
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

      // VALIDATION: Check if payment method is selected
      if (!selectedMethod || selectedMethod === "undefined" || isNaN(Number(selectedMethod))) {
        message.error("Please select a valid payment method before submitting");
        setSubmitting(false);
        return;
      }

      // VALIDATION: Check if we have the payment method details
      if (!selectedMethodDetails) {
        message.error("Payment method details not found. Please select a payment method again.");
        setSubmitting(false);
        return;
      }

      // VALIDATION: Check if file is uploaded
      if (!fileList.length || !fileList[0]?.originFileObj) {
        message.error("Please upload a receipt");
        setSubmitting(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      
      // Use the correct field name and ensure it's a number
      const paymentMethodId = Number(selectedMethod);
      
      formData.append("payment_method_id", paymentMethodId);
      formData.append("department_type", paymentData.department_type || values.department_type);
      formData.append("transaction_id", paymentData.transaction_id || values.transaction_id);
      formData.append("amount", parseFloat(paymentData.amount || values.amount));
      formData.append(
        "payment_date",
        (paymentData.payment_date || values.payment_date).format("YYYY-MM-DD")
      );
      
      // Add optional fields
      if (paymentData.phone_number || values.phone_number) {
        formData.append("phone_number", paymentData.phone_number || values.phone_number);
      }
      if (paymentData.account_last_digits || values.account_last_digits) {
        formData.append("account_last_digits", paymentData.account_last_digits || values.account_last_digits);
      }
      
      // Add receipt file
      formData.append("receipt_file", fileList[0].originFileObj);

      const response = await axios.post(`${API_BASE}payment/submit/`, formData, {
        headers: { 
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success(response.data.message || "Payment submitted successfully!");

      // Reset everything
      setShowPaymentModal(false);
      form.resetFields();
      setFileList([]);
      setCurrentStep(0);
      setPaymentData({});
      setSelectedMethod(null);
      setSelectedMethodDetails(null);
      
      // Refresh data
      await loadPayments(token);
      
    } catch (err) {
      console.error("Payment submission error:", err);
      console.error("Error response:", err.response?.data);
      
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
      case "pending":
        return "orange";
      case "verified":
        return "green";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case "verified":
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case "rejected":
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getDepartmentName = (dept) => {
    return DEPARTMENT_INFO[dept]?.label || dept;
  };

  const getDepartmentIcon = (dept) => {
    return DEPARTMENT_INFO[dept]?.icon || '📋';
  };

  const getDepartmentColor = (dept) => {
    return DEPARTMENT_INFO[dept]?.color || 'blue';
  };

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "transaction_id",
      key: "transaction_id",
      render: (text) => (
        <Text strong style={{ fontFamily: 'monospace', fontSize: '14px' }}>
          {text}
        </Text>
      )
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
      filters: ALL_DEPARTMENTS.map(dept => ({
        text: dept.label,
        value: dept.value
      })),
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
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => viewReceipt(record)}
            size="small"
            style={{ padding: 0 }}
          >
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

  // Calculate statistics from payments
  const stats = calculateStats();

  // Render department breakdown cards for all departments
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
            <Button 
              type="primary" 
              onClick={() => setShowPaymentModal(true)}
              icon={<CreditCardOutlined />}
            >
              New Payment
            </Button>
          </Space>
        }
      >
        {/* Payment Statistics */}
        <Card title="Payment Statistics" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Total Payments"
                value={stats.total_payments}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Total Amount"
                value={stats.total_amount}
                prefix="ETB"
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Pending"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Verified"
                value={stats.verified}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
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
          
          {/* Department Breakdown - ALL DEPARTMENTS */}
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
                          <Alert
                            message={record.rejection_reason}
                            type="error"
                            showIcon
                            style={{ marginTop: 8 }}
                          />
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
                <Button 
                  type="primary" 
                  block
                  icon={<CreditCardOutlined />}
                  onClick={() => setShowPaymentModal(true)}
                >
                  Make New Payment
                </Button>
                <Button 
                  block
                  icon={<ReloadOutlined />}
                  onClick={() => loadData(token)}
                  loading={loading}
                >
                  Refresh Data
                </Button>
                {stats.pending > 0 && (
                  <Button 
                    block
                    type="dashed"
                    icon={<ClockCircleOutlined />}
                    onClick={() => {
                      message.info(`You have ${stats.pending} pending payment(s) awaiting verification`);
                    }}
                  >
                    View Pending ({stats.pending})
                  </Button>
                )}
              </Space>
            </Card>
            
            {renderPaymentSteps()}
          </Col>
        </Row>
      </Card>

      {/* Payment Modal */}
      <Modal
        title={
          <Space>
            <CreditCardOutlined />
            <span>Submit Payment</span>
            {selectedMethodDetails && (
              <Tag color="blue">{selectedMethodDetails.name}</Tag>
            )}
          </Space>
        }
        open={showPaymentModal}
        footer={null}
        width={800}
        onCancel={() => {
          setShowPaymentModal(false);
          form.resetFields();
          setCurrentStep(0);
          setFileList([]);
          setSelectedMethod(null);
          setSelectedMethodDetails(null);
        }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Steps current={currentStep} direction="vertical" style={{ marginBottom: 24 }}>
              <Step 
                title="Select Method" 
                description="Choose payment method"
              />
              <Step 
                title="Copy Details" 
                description="Copy account information"
              />
              <Step 
                title="Make Payment" 
                description="Complete transaction"
              />
              <Step 
                title="Upload Receipt" 
                description="Submit proof"
              />
              <Step 
                title="Review & Submit" 
                description="Final verification"
              />
            </Steps>
            
            {currentStep === 0 && (
              <div>
                <Form.Item
                  name="payment_method_id"
                  label="Select Payment Method"
                  rules={[{ 
                    required: true, 
                    message: "Please select payment method",
                    validator: (_, value) => {
                      if (value && !isNaN(Number(value))) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Please select a valid payment method'));
                    }
                  }]}
                >
                  <Select 
                    placeholder="Choose payment method"
                    size="large"
                    onChange={handleMethodSelect}
                    value={selectedMethod}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    allowClear
                  >
                    {paymentMethods.map((method) => (
                      <Option key={method.id} value={method.id}>
                        <Space>
                          {method.name.toLowerCase().includes('telebirr') || method.name.toLowerCase().includes('mobile') ? 
                            <PhoneOutlined /> : <BankOutlined />}
                          <span>{method.name}</span>
                          {method.bank_name && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              ({method.bank_name})
                            </Text>
                          )}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                {selectedMethodDetails && (
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={async () => {
                      try {
                        if (!selectedMethod || isNaN(Number(selectedMethod))) {
                          message.error("Please select a valid payment method");
                          return;
                        }
                        
                        await form.validateFields(['payment_method_id']);
                        setCurrentStep(1);
                      } catch (error) {
                        console.log('Validation failed:', error);
                      }
                    }}
                    style={{ marginTop: 16 }}
                  >
                    Next: View Account Details
                  </Button>
                )}
              </div>
            )}
            
            {currentStep === 1 && (
              <div>
                {renderPaymentMethodDetails()}
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={() => setCurrentStep(2)}
                  style={{ marginTop: 16 }}
                >
                  Next: Fill Payment Form
                </Button>
              </div>
            )}
            
            {currentStep >= 2 && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmitPayment}
                initialValues={{ 
                  department_type: "library",
                  transaction_id: `PAY-${Date.now().toString(36).toUpperCase()}`,
                  payment_date: dayjs()
                }}
              >
                {currentStep === 2 && (
                  <>
                    <Form.Item
                      name="department_type"
                      label="Department"
                      rules={[{ required: true, message: "Please select department" }]}
                    >
                      <Select placeholder="Select department" size="large">
                        {ALL_DEPARTMENTS.map(dept => (
                          <Option key={dept.value} value={dept.value}>
                            <Space>
                              <span>{dept.icon}</span>
                              <span>{dept.label}</span>
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="transaction_id"
                      label="Transaction ID"
                      rules={[{ required: true, message: "Please enter transaction ID" }]}
                    >
                      <Input 
                        placeholder="Enter transaction ID from your payment" 
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item 
                      name="amount" 
                      label="Amount (ETB)" 
                      rules={[{ 
                        required: true, 
                        message: "Please enter amount",
                        validator: (_, value) => {
                          if (value && value > 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Amount must be greater than 0'));
                        }
                      }]}
                    >
                      <Input 
                        type="number" 
                        min={1} 
                        step={0.01} 
                        size="large"
                        prefix="ETB"
                      />
                    </Form.Item>
                    <Form.Item
                      name="payment_date"
                      label="Payment Date"
                      rules={[{ required: true, message: "Please select payment date" }]}
                    >
                      <DatePicker 
                        format="YYYY-MM-DD" 
                        style={{ width: "100%" }} 
                        size="large"
                      />
                    </Form.Item>
                    
                    {selectedMethodDetails?.name.toLowerCase().includes('telebirr') && (
                      <Form.Item
                        name="phone_number"
                        label="Your Phone Number"
                        rules={[
                          { required: true, message: "Please enter your phone number" },
                          { pattern: /^09\d{8}$/, message: 'Invalid Ethiopian phone number (e.g., 0912345678)' }
                        ]}
                      >
                        <Input 
                          placeholder="0912345678" 
                          size="large"
                          prefix={<PhoneOutlined />}
                        />
                      </Form.Item>
                    )}
                    
                    {!selectedMethodDetails?.name.toLowerCase().includes('telebirr') && (
                      <Form.Item
                        name="account_last_digits"
                        label="Last 4 Digits of Account"
                        rules={[
                          { required: true, message: "Please enter last 4 digits" },
                          { pattern: /^\d{4}$/, message: 'Must be exactly 4 digits' }
                        ]}
                      >
                        <Input 
                          placeholder="1234" 
                          maxLength={4} 
                          size="large"
                        />
                      </Form.Item>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button onClick={() => setCurrentStep(1)}>
                        Back
                      </Button>
                      <Button 
                        type="primary" 
                        onClick={async () => {
                          try {
                            const values = await form.validateFields([
                              'department_type', 'transaction_id', 'amount', 'payment_date',
                              'phone_number', 'account_last_digits'
                            ]);
                            setPaymentData(prev => ({ ...prev, ...values }));
                            setCurrentStep(3);
                          } catch (error) {
                            console.log('Step 2 validation failed:', error);
                          }
                        }}
                      >
                        Next: Upload Receipt
                      </Button>
                    </div>
                  </>
                )}
                
                {currentStep === 3 && (
                  <>
                    <Form.Item
                      label="Upload Payment Receipt/Screenshot"
                      required
                      extra="Upload clear image or PDF of payment confirmation (max 10MB)"
                    >
                      <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleFileChange}
                        beforeUpload={beforeUpload}
                        maxCount={1}
                        accept="image/*,.pdf"
                      >
                        {fileList.length < 1 && (
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button onClick={() => setCurrentStep(2)}>
                        Back
                      </Button>
                      <Button 
                        type="primary" 
                        onClick={() => setCurrentStep(4)}
                        disabled={!fileList.length}
                      >
                        Next: Review & Submit
                      </Button>
                    </div>
                  </>
                )}
                
                {currentStep === 4 && (
                  <>
                    <Card title="Payment Summary" size="small">
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Payment Method">
                          <Space>
                            {selectedMethodDetails?.name.toLowerCase().includes('telebirr') ? 
                              <PhoneOutlined /> : <BankOutlined />}
                            <Text strong>{selectedMethodDetails?.name}</Text>
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Department">
                          {getDepartmentIcon(paymentData.department_type)} {getDepartmentName(paymentData.department_type)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Transaction ID">
                          {paymentData.transaction_id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Amount">
                          <Text strong type="success">
                            ETB {paymentData.amount}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment Date">
                          {paymentData.payment_date?.format("YYYY-MM-DD")}
                        </Descriptions.Item>
                        {paymentData.phone_number && (
                          <Descriptions.Item label="Phone Number">
                            {paymentData.phone_number}
                          </Descriptions.Item>
                        )}
                        {paymentData.account_last_digits && (
                          <Descriptions.Item label="Account Last Digits">
                            ****{paymentData.account_last_digits}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Card>
                    
                    <Alert
                      message="Verification Process"
                      description="Your payment will be verified by the department within 24-48 hours. You'll receive notification once verified."
                      type="info"
                      showIcon
                      style={{ marginTop: 16, marginBottom: 16 }}
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button onClick={() => setCurrentStep(3)}>
                        Back
                      </Button>
                      <Space>
                        <Button onClick={() => setShowPaymentModal(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="primary" 
                          loading={submitting}
                          onClick={() => form.submit()}
                        >
                          Submit Payment
                        </Button>
                      </Space>
                    </div>
                  </>
                )}
              </Form>
            )}
          </Col>
          
          <Col xs={24} lg={12}>
            {/* Right column shows method details and steps */}
            {selectedMethodDetails && currentStep >= 1 && (
              <>
                {renderPaymentMethodDetails()}
                {renderPaymentSteps()}
              </>
            )}
            
            {!selectedMethodDetails && currentStep === 0 && (
              <Card title="How to Pay" style={{ height: '100%' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Alert
                    message="Select a Payment Method"
                    description="Choose your preferred payment method from the dropdown to view account details."
                    type="info"
                    showIcon
                  />
                  <List
                    size="small"
                    dataSource={[
                      'Bank Transfer - Transfer to provided account',
                      'Telebirr - Send to provided phone number',
                      'CBE - Use Commercial Bank of Ethiopia',
                      'Awash Bank - Use Awash Bank account'
                    ]}
                    renderItem={(item, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Tag color={index % 2 === 0 ? 'blue' : 'green'}>
                              {index + 1}
                            </Tag>
                          }
                          title={<Text>{item}</Text>}
                        />
                      </List.Item>
                    )}
                  />
                </Space>
              </Card>
            )}
          </Col>
        </Row>
      </Modal>

      {/* Receipt Modal */}
      <Modal 
        title="Payment Receipt" 
        open={receiptModal} 
        footer={null} 
        onCancel={() => {
          setReceiptModal(false);
          setReceiptImage("");
        }}
        width={600}
      >
        {receiptImage && (
          <Image
            src={receiptImage}
            alt="Receipt"
            style={{ width: '100%', borderRadius: 8 }}
          />
        )}
      </Modal>
    </div>
  );
}