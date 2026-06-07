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
  VerifiedOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "./RegisterPage.css";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

// API base URL
const API_BASE = "http://127.0.0.1:8000/api/";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [buildingsLoading, setBuildingsLoading] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Steps for the registration process
  const steps = [
    {
      title: "Verify ID",
      content: "Enter your Student ID",
    },
    {
      title: "Create Account",
      content: "Set up your account",
    },
    {
      title: "Complete",
      content: "Registration successful",
    },
  ];

  // Fetch colleges, departments, and buildings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collegeRes, deptRes, buildingRes] = await Promise.all([
          fetch(`${API_BASE}public/colleges/`),
          fetch(`${API_BASE}public/departments/`),
          fetch(`${API_BASE}buildings/active/`),
        ]);
        
        if (collegeRes.ok) setColleges(await collegeRes.json());
        if (deptRes.ok) setDepartments(await deptRes.json());
        if (buildingRes.ok) {
          const buildingData = await buildingRes.json();
          setBuildings(buildingData.buildings || buildingData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        message.error("Failed to load colleges, departments, or buildings");
      }
    };
    fetchData();
  }, []);

  // Filter departments when college is selected
  useEffect(() => {
    if (selectedCollege) {
      setFilteredDepartments(
        departments.filter((d) => d.college === selectedCollege)
      );
    } else {
      setFilteredDepartments([]);
    }
  }, [selectedCollege, departments]);

  // Step 1: Verify student by ID only
  const onVerifyStudentID = async () => {
    const id_number = form.getFieldValue("id_number");
    
    if (!id_number) {
      message.error("Please enter your Student ID");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}verify-student-by-id/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_number }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save verified student info
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
        
        // Pre-fill form with student data
        form.setFieldsValue({
          first_name: data.student.first_name,
          last_name: data.student.last_name,
          id_number: data.student.id_number,
          email: data.student.email || "",
        });
        
        // Set college if available
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
        message.error(data.error || "Student verification failed");
        
        // Show detailed error modal
        if (data.details) {
          Modal.error({
            title: "Verification Failed",
            content: (
              <div>
                <p><strong>Reason:</strong> {data.error}</p>
                <p><strong>Details:</strong> {data.details}</p>
                {data.suggestions && <p><strong>Suggestions:</strong> {data.suggestions}</p>}
              </div>
            ),
          });
        }
      }
    } catch (error) {
      message.error("Network error. Please try again.");
      console.error("Verification error:", error);
    } finally {
      setVerifying(false);
    }
  };

  // Step 2: Create account
  const onCreateAccount = async (values) => {
    setLoading(true);
    try {
      const payload = {
        role: "student",
        ...values,
        // Include verified student data
        first_name: verifiedStudent.first_name,
        last_name: verifiedStudent.last_name,
        id_number: verifiedStudent.id_number,
      };

      console.log("Submitting registration:", payload);

      const res = await fetch(`${API_BASE}register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        message.success("🎉 Account created successfully!");
        setCurrentStep(2); // Move to success step
        
        // Store login info
        localStorage.setItem("registration_success", JSON.stringify({
          email: values.email,
          student_name: verifiedStudent.full_name,
        }));
      } else if (data.error?.includes("already registered")) {
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
      } else {
        // Show validation errors
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
          message.error(errorMessages || data.message || "Registration failed");
        } else {
          message.error(data.message || "Registration failed");
        }
      }
    } catch (error) {
      message.error("Server error. Please try again.");
      console.error("Registration error:", error);
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

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Step 1: ID Verification
        return (
          <div className="verification-step">
            <Title level={3} className="step-title">
              <IdcardOutlined /> Enter Your Student ID
            </Title>
            
            <Alert
              message="Verification Required"
              description="Please enter your Student ID exactly as it appears in the university records. Your name will be automatically retrieved."
              type="info"
              showIcon
              className="verification-alert"
            />

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
                message="Important Information"
                description={
                  <ul>
                    <li>Enter your Student ID exactly as provided by the university</li>
                    <li>Example formats: AAA1234, STU001, 2024CS001</li>
                    <li>If verification fails, contact your department administrator</li>
                    <li>Already registered? <Button type="link" onClick={() => navigate("/login")}>Login here</Button></li>
                  </ul>
                }
                type="warning"
                showIcon
              />
            </div>
          </div>
        );

      case 1: // Step 2: Create Account
        return (
          <div className="account-step">
            <Title level={3} className="step-title">
              <UserOutlined /> Create Your Account
            </Title>
            
            {/* Display verified student info */}
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
              description="Complete your registration by creating a personal email and password, and selecting your college, department, and dormitory building."
              type="info"
              showIcon
              className="account-alert"
            />

            <Form 
              form={form} 
              layout="vertical" 
              onFinish={onCreateAccount}
              className="account-form"
              initialValues={{
                building: null,
              }}
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
                  placeholder="Select your college"
                  size="large"
                  allowClear
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
                  placeholder="Select your department"
                  size="large"
                  disabled={!selectedCollege}
                  allowClear
                >
                  {filteredDepartments.map((d) => (
                    <Option key={d.id} value={d.name}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Building Selection Component */}
              <Form.Item
                label="Dormitory Building"
                name="building"
                rules={[{ required: true, message: 'Please select your dormitory building' }]}
                tooltip="Select the building where you currently reside"
              >
                <Select 
                  placeholder="Select your dormitory building"
                  loading={buildingsLoading}
                  size="large"
                  allowClear
                  disabled={buildings.length === 0}
                  notFoundContent={buildings.length === 0 ? "No buildings available" : null}
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

      case 2: // Step 3: Success
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
                  {form.getFieldValue("department") || "Not selected"}
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

  if (verifying && currentStep === 0) {
    return (
      <div className="register-page-container">
        <Card className="register-card loading-card">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Verifying your student ID..."
            size="large"
          >
            <div style={{ padding: '50px', textAlign: 'center' }}>
              <p>Please wait while we verify your information...</p>
            </div>
          </Spin>
        </Card>
      </div>
    );
  }

  return (
    <div className="register-page-container">
      <Card className="register-card">
        <Title level={2} className="register-title">
          🎓 Student Registration
        </Title>
        <Text className="register-subtitle">
          Verify with Student ID • Create Your Account
        </Text>

        <Divider />

        {/* Progress Steps */}
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

        {/* Step Content */}
        <div className="step-content-container">
          {renderStepContent()}
        </div>
      </Card>
    </div>
  );
}