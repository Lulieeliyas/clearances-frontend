// RegisterPage.jsx - Complete Fixed Version with Debugging
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Select,
  Spin,
  Row,
  Col,
  Divider,
  Alert,
  Steps,
  Result,
  Descriptions,
  Tag,
  Modal,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  HomeOutlined,
  ReloadOutlined,
  BugOutlined,
} from "@ant-design/icons";
import "./RegisterPage.css";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

// ✅ Use environment-aware API base URL
const API_BASE = process.env.NODE_ENV === 'production' 
  ? "https://clearances.onrender.com/api/"
  : "http://127.0.0.1:8000/api/";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Steps for the registration process
  const steps = [
    { title: "Verify ID", content: "Enter your Student ID" },
    { title: "Create Account", content: "Set up your account" },
    { title: "Complete", content: "Registration successful" },
  ];

  // Fetch colleges, departments, and buildings
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        console.log("🔍 Fetching data from:", API_BASE);
        
        const endpoints = [
          `${API_BASE}public/colleges/`,
          `${API_BASE}public/departments/`,
          `${API_BASE}buildings/active/`,
        ];
        
        console.log("📡 Testing endpoints:", endpoints);

        const [collegeRes, deptRes, buildingRes] = await Promise.all([
          fetch(endpoints[0]),
          fetch(endpoints[1]),
          fetch(endpoints[2]),
        ]);

        console.log("✅ College response status:", collegeRes.status);
        console.log("✅ Department response status:", deptRes.status);
        console.log("✅ Building response status:", buildingRes.status);

        let collegeData = [];
        let deptData = [];
        let buildingData = [];

        if (collegeRes.ok) {
          collegeData = await collegeRes.json();
          console.log("📚 Colleges loaded:", collegeData.length);
        } else {
          console.warn("⚠️ Failed to load colleges:", await collegeRes.text());
        }

        if (deptRes.ok) {
          deptData = await deptRes.json();
          console.log("📚 Departments loaded:", deptData.length);
        } else {
          console.warn("⚠️ Failed to load departments:", await deptRes.text());
        }

        if (buildingRes.ok) {
          const buildingJson = await buildingRes.json();
          buildingData = buildingJson.buildings || buildingJson || [];
          console.log("🏠 Buildings loaded:", buildingData.length);
        } else {
          console.warn("⚠️ Failed to load buildings:", await buildingRes.text());
        }

        setColleges(Array.isArray(collegeData) ? collegeData : []);
        setDepartments(Array.isArray(deptData) ? deptData : []);
        setBuildings(Array.isArray(buildingData) ? buildingData : []);

        if (collegeData.length === 0) {
          message.warning("No colleges found. Please contact administrator.");
        }
        if (deptData.length === 0) {
          message.warning("No departments found. Please contact administrator.");
        }

      } catch (error) {
        console.error("❌ Failed to load data:", error);
        message.error("Failed to load data. Please refresh the page.");
        setDebugInfo({ error: error.message, stack: error.stack });
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Filter departments when college is selected
  useEffect(() => {
    if (selectedCollege) {
      const filtered = departments.filter((d) => d.college === selectedCollege);
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments([]);
    }
  }, [selectedCollege, departments]);

  // ✅ FIXED: Verify student by ID with better error handling
  const onVerifyStudentID = async () => {
    const id_number = form.getFieldValue("id_number");
    
    if (!id_number) {
      message.error("Please enter your Student ID");
      return;
    }

    setVerifying(true);
    try {
      const url = `${API_BASE}verify-student-by-id/`;
      console.log("🔍 Verifying student at:", url);
      console.log("📝 ID Number:", id_number);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_number }),
      });

      console.log("📡 Response status:", res.status);
      
      // Get response text first for debugging
      const responseText = await res.text();
      console.log("📄 Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("❌ Failed to parse JSON:", e);
        throw new Error(`Invalid server response: ${responseText.substring(0, 100)}...`);
      }

      if (res.ok) {
        console.log("✅ Verification successful:", data);
        setVerifiedStudent({
          id: data.student.id,
          first_name: data.student.first_name,
          last_name: data.student.last_name,
          id_number: data.student.id_number,
          full_name: `${data.student.first_name} ${data.student.last_name}`,
          email: data.student.email || "",
          college: data.student.college || "",
          college_id: data.student.college_id || null,
          department: data.student.department || "",
          department_id: data.student.department_id || null,
        });
        
        form.setFieldsValue({
          first_name: data.student.first_name,
          last_name: data.student.last_name,
          id_number: data.student.id_number,
          email: data.student.email || "",
        });
        
        if (data.student.college_id) {
          setSelectedCollege(data.student.college_id);
          form.setFieldsValue({ college: data.student.college_id });
        }
        
        if (data.student.department_id) {
          form.setFieldsValue({ department: data.student.department_id });
        }
        
        message.success("✓ Student verified successfully!");
        setCurrentStep(1);
      } else {
        console.error("❌ Verification failed:", data);
        message.error(data.error || "Student verification failed");
        
        Modal.error({
          title: "Verification Failed",
          content: (
            <div>
              <p><strong>Status:</strong> {res.status}</p>
              <p><strong>Message:</strong> {data.error || data.message || "Unknown error"}</p>
              {data.details && <p><strong>Details:</strong> {data.details}</p>}
              {data.suggestions && <p><strong>Suggestions:</strong> {data.suggestions}</p>}
              <Divider />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                If this problem persists, please contact the administrator.
              </Text>
            </div>
          ),
          width: 500,
        });
      }
    } catch (error) {
      console.error("❌ Verification error:", error);
      message.error("Network error. Please check your connection.");
      
      Modal.error({
        title: "Connection Error",
        content: (
          <div>
            <p>Failed to connect to the server.</p>
            <p><strong>Error:</strong> {error.message}</p>
            <p><strong>API URL:</strong> {API_BASE}</p>
            <Divider />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Make sure the backend server is running and accessible.
            </Text>
          </div>
        ),
        width: 500,
      });
    } finally {
      setVerifying(false);
    }
  };

  // ✅ FIXED: Create account with better error handling
  const onCreateAccount = async (values) => {
    setLoading(true);
    try {
      const payload = {
        role: "student",
        ...values,
        first_name: verifiedStudent.first_name,
        last_name: verifiedStudent.last_name,
        id_number: verifiedStudent.id_number,
      };

      const url = `${API_BASE}register/`;
      console.log("📝 Registering at:", url);
      console.log("📦 Payload:", payload);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📡 Registration response status:", res.status);
      
      const responseText = await res.text();
      console.log("📄 Raw registration response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("❌ Failed to parse JSON:", e);
        throw new Error(`Invalid server response: ${responseText.substring(0, 100)}...`);
      }

      if (res.ok) {
        console.log("✅ Registration successful:", data);
        message.success("🎉 Account created successfully!");
        setCurrentStep(2);
        
        localStorage.setItem("registration_success", JSON.stringify({
          email: values.email,
          student_name: verifiedStudent.full_name,
        }));
      } else {
        console.error("❌ Registration failed:", data);
        
        // Check if user already exists
        if (data.message?.toLowerCase().includes("already exists") || 
            data.error?.toLowerCase().includes("already exists")) {
          Modal.info({
            title: "Already Registered",
            content: (
              <div>
                <p>This student ID is already registered.</p>
                <p><strong>Name:</strong> {verifiedStudent.full_name}</p>
                <p><strong>Student ID:</strong> {verifiedStudent.id_number}</p>
                <p>Please use the login page to access your account.</p>
              </div>
            ),
            onOk: () => navigate("/login"),
          });
          return;
        }
        
        // Show validation errors
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
          
          Modal.error({
            title: "Registration Failed",
            content: (
              <div>
                <p>Please fix the following errors:</p>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                  {errorMessages}
                </pre>
              </div>
            ),
            width: 500,
          });
        } else {
          Modal.error({
            title: "Registration Failed",
            content: (
              <div>
                <p><strong>Status:</strong> {res.status}</p>
                <p><strong>Message:</strong> {data.message || data.error || "Unknown error"}</p>
                <Divider />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Please check your information and try again.
                </Text>
              </div>
            ),
            width: 500,
          });
        }
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      
      Modal.error({
        title: "Connection Error",
        content: (
          <div>
            <p>Failed to connect to the server.</p>
            <p><strong>Error:</strong> {error.message}</p>
            <p><strong>API URL:</strong> {API_BASE}</p>
            <Divider />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Make sure the backend server is running and accessible.
            </Text>
          </div>
        ),
        width: 500,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset verification
  const resetVerification = () => {
    setVerifiedStudent(null);
    setCurrentStep(0);
    setSelectedCollege(null);
    form.resetFields();
  };

  // Show loading state
  if (loadingData) {
    return (
      <div className="register-page-container">
        <Card className="register-card loading-card">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Loading registration data..."
            size="large"
          >
            <div style={{ padding: '50px', textAlign: 'center' }}>
              <p>Loading colleges, departments, and buildings...</p>
            </div>
          </Spin>
        </Card>
      </div>
    );
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="verification-step">
            <Title level={3} className="step-title">
              <IdcardOutlined /> Enter Your Student ID
            </Title>
            
            <Alert
              message="Verification Required"
              description="Please enter your Student ID exactly as it appears in the university records."
              type="info"
              showIcon
              className="verification-alert"
            />

            {!API_BASE.includes("localhost") && (
              <Alert
                message="Production Mode"
                description={`API URL: ${API_BASE}`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <div className="verification-form-container">
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Student ID"
                  name="id_number"
                  rules={[
                    { required: true, message: "Please enter your Student ID" },
                    { pattern: /^[A-Z0-9]{4,20}$/, message: "Enter a valid Student ID (e.g., AAA1234)" }
                  ]}
                >
                  <Input 
                    prefix={<IdcardOutlined />} 
                    placeholder="Enter your Student ID (e.g., AAA1234)"
                    size="large"
                    disabled={verifying}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={verifying}
                  onClick={onVerifyStudentID}
                  icon={<SearchOutlined />}
                  className="verify-button"
                >
                  {verifying ? "Verifying..." : "Verify Student ID"}
                </Button>
              </Form>
            </div>

            <Divider />

            <div className="verification-help">
              <Alert
                message="Need Help?"
                description={
                  <div>
                    <ul>
                      <li>Enter your Student ID exactly as provided</li>
                      <li>Example formats: AAA1234, STU001, 2024CS001</li>
                      <li>Already registered? <Button type="link" onClick={() => navigate("/login")}>Login here</Button></li>
                    </ul>
                    <Button 
                      type="text" 
                      icon={<BugOutlined />}
                      onClick={() => setShowDebug(!showDebug)}
                      style={{ marginTop: 8 }}
                    >
                      {showDebug ? "Hide Debug Info" : "Show Debug Info"}
                    </Button>
                    {showDebug && (
                      <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4, fontSize: '12px' }}>
                        <p><strong>API URL:</strong> {API_BASE}</p>
                        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
                        {debugInfo && (
                          <pre style={{ whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(debugInfo, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                }
                type="info"
                showIcon
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="account-step">
            <Title level={3} className="step-title">
              <UserOutlined /> Create Your Account
            </Title>
            
            {verifiedStudent && (
              <Card className="verified-info-card" size="small">
                <div className="student-info-header">
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  <Text strong>Verified Student Information</Text>
                </div>
                <Descriptions column={2} bordered size="small" className="student-info-details">
                  <Descriptions.Item label="Full Name" span={2}>
                    <Tag color="green" icon={<UserOutlined />}>
                      {verifiedStudent.full_name}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Student ID">
                    <Tag color="blue">{verifiedStudent.id_number}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color="success">Verified</Tag>
                  </Descriptions.Item>
                </Descriptions>
                <Button 
                  type="link" 
                  onClick={resetVerification}
                  style={{ marginTop: 10 }}
                  icon={<ArrowLeftOutlined />}
                >
                  Not you? Verify different ID
                </Button>
              </Card>
            )}

            <Alert
              message="Account Setup"
              description="Complete your registration by creating a personal email and password."
              type="info"
              showIcon
              className="account-alert"
            />

            <Form 
              form={form} 
              layout="vertical" 
              onFinish={onCreateAccount}
              className="account-form"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="first_name"
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      disabled
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="last_name"
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      disabled
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" }
                ]}
                help="This will be your login username"
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="your.email@example.com"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="College"
                name="college"
                rules={[{ required: true, message: "Please select your college" }]}
              >
                <Select 
                  onChange={setSelectedCollege}
                  placeholder={colleges.length === 0 ? "No colleges available" : "Select your college"}
                  size="large"
                  allowClear
                  disabled={colleges.length === 0}
                >
                  {colleges.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Department"
                name="department"
                rules={[{ required: true, message: "Please select your department" }]}
              >
                <Select 
                  placeholder={filteredDepartments.length === 0 ? "No departments available" : "Select your department"}
                  size="large"
                  disabled={!selectedCollege || filteredDepartments.length === 0}
                  allowClear
                >
                  {filteredDepartments.map((d) => (
                    <Option key={d.id} value={d.id}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Dormitory Building"
                name="building"
                rules={[{ required: true, message: 'Please select your dormitory building' }]}
                tooltip="Select the building where you currently reside"
              >
                <Select 
                  placeholder={buildings.length === 0 ? "No buildings available" : "Select your dormitory building"}
                  size="large"
                  allowClear
                  disabled={buildings.length === 0}
                >
                  {buildings.map(building => (
                    <Option key={building.id} value={building.id}>
                      <HomeOutlined /> {building.name} {building.code ? `(${building.code})` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter a password" },
                  { min: 8, message: "Password must be at least 8 characters" },
                  { 
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 
                    message: "Password must include uppercase, lowercase, and numbers" 
                  }
                ]}
                hasFeedback
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Create a strong password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirm_password"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match"));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Confirm your password"
                  size="large"
                />
              </Form.Item>

              <div className="step-buttons">
                <Button
                  onClick={() => setCurrentStep(0)}
                  icon={<ArrowLeftOutlined />}
                  style={{ marginRight: 10 }}
                >
                  Back to Verification
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<ArrowRightOutlined />}
                  size="large"
                >
                  Create Account
                </Button>
              </div>
            </Form>
          </div>
        );

      case 2:
        const selectedBuilding = buildings.find(b => b.id === form.getFieldValue("building"));
        return (
          <div className="success-step">
            <Result
              status="success"
              title="Registration Successful!"
              subTitle="Your student account has been created successfully."
              extra={[
                <Button 
                  type="primary" 
                  key="login" 
                  onClick={() => navigate("/login")}
                  size="large"
                  icon={<UserOutlined />}
                >
                  Go to Login
                </Button>,
                <Button 
                  key="home" 
                  onClick={() => navigate("/")}
                  size="large"
                >
                  Go to Home
                </Button>,
              ]}
            />
            
            <Card className="account-summary" size="small">
              <Descriptions title="Your Account Details" column={1} bordered>
                <Descriptions.Item label="Full Name">
                  {verifiedStudent?.full_name}
                </Descriptions.Item>
                <Descriptions.Item label="Student ID">
                  {verifiedStudent?.id_number}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {form.getFieldValue("email")}
                </Descriptions.Item>
                <Descriptions.Item label="College">
                  {colleges.find(c => c.id === form.getFieldValue("college"))?.name || "Not selected"}
                </Descriptions.Item>
                <Descriptions.Item label="Department">
                  {departments.find(d => d.id === form.getFieldValue("department"))?.name || "Not selected"}
                </Descriptions.Item>
                <Descriptions.Item label="Dormitory Building">
                  {selectedBuilding ? (
                    <Tag color="purple" icon={<HomeOutlined />}>
                      {selectedBuilding.name} {selectedBuilding.code ? `(${selectedBuilding.code})` : ''}
                    </Tag>
                  ) : "Not assigned"}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="success">Active & Verified</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-page-container">
      <Card className="register-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} className="register-title">
              🎓 Student Registration
            </Title>
            <Text className="register-subtitle">
              Verify with Student ID • Create Your Account
            </Text>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => window.location.reload()}
            type="text"
          >
            Refresh
          </Button>
        </div>

        <Divider />

        <Steps current={currentStep} className="registration-steps">
          {steps.map((step, index) => (
            <Step 
              key={index} 
              title={step.title} 
              description={step.content}
              icon={index < currentStep ? <CheckCircleOutlined /> : undefined}
            />
          ))}
        </Steps>

        <Divider />

        <div className="step-content-container">
          {renderStepContent()}
        </div>
      </Card>
    </div>
  );
}