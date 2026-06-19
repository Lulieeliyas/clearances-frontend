// RegisterPage.jsx - Fixed Version
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
} from "@ant-design/icons";
import "./RegisterPage.css";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

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
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const steps = [
    { title: "Verify ID", content: "Enter your Student ID" },
    { title: "Create Account", content: "Set up your account" },
    { title: "Complete", content: "Registration successful" },
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        console.log("🔍 Fetching data from:", API_BASE);
        
        const [collegeRes, deptRes, buildingRes] = await Promise.all([
          fetch(`${API_BASE}public/colleges/`),
          fetch(`${API_BASE}public/departments/`),
          fetch(`${API_BASE}buildings/active/`),
        ]);

        let collegeData = [];
        let deptData = [];
        let buildingData = [];

        if (collegeRes.ok) {
          collegeData = await collegeRes.json();
          console.log("📚 Colleges loaded:", collegeData.length);
        }
        if (deptRes.ok) {
          deptData = await deptRes.json();
          console.log("📚 Departments loaded:", deptData.length);
        }
        if (buildingRes.ok) {
          const buildingJson = await buildingRes.json();
          buildingData = buildingJson.buildings || buildingJson || [];
          console.log("🏠 Buildings loaded:", buildingData.length);
        }

        setColleges(Array.isArray(collegeData) ? collegeData : []);
        setDepartments(Array.isArray(deptData) ? deptData : []);
        setBuildings(Array.isArray(buildingData) ? buildingData : []);

      } catch (error) {
        console.error("❌ Failed to load data:", error);
        message.error("Failed to load data. Please refresh.");
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

  // ✅ FIXED: Verify student by ID
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
        message.error(data.error || "Student verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      message.error("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // ✅ FIXED: Create account with proper data format
  const onCreateAccount = async (values) => {
    setLoading(true);
    try {
      // Get the selected building object to get its name
      const selectedBuilding = buildings.find(b => b.id === values.building);
      
      // ✅ Build the payload with proper field names expected by backend
      const payload = {
        username: values.email,  // Use email as username
        email: values.email,
        password: values.password,
        password2: values.confirm_password,
        role: "student",
        first_name: verifiedStudent.first_name,
        last_name: verifiedStudent.last_name,
        student_id: verifiedStudent.id_number,  // Use student_id field
        id_number: verifiedStudent.id_number,   // Also include id_number
        college: values.college,  // College ID
        department: values.department,  // Department ID
        building: values.building,  // Building ID
        building_name: selectedBuilding?.name || "",  // Building name (if needed)
        phone: values.phone || "",
      };

      console.log("📦 Sending payload:", JSON.stringify(payload, null, 2));

      const res = await fetch(`${API_BASE}register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Get response text first
      const responseText = await res.text();
      console.log("📄 Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        throw new Error(`Invalid server response: ${responseText}`);
      }

      if (res.ok) {
        message.success("🎉 Account created successfully!");
        setCurrentStep(2);
        localStorage.setItem("registration_success", JSON.stringify({
          email: values.email,
          student_name: verifiedStudent.full_name,
        }));
      } else {
        // ✅ Show detailed error
        console.error("❌ Registration failed:", data);
        
        let errorMessage = "Registration failed";
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.errors) {
          const errorList = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          errorMessage = errorList;
        }

        Modal.error({
          title: "Registration Failed",
          content: (
            <div>
              <p><strong>Status:</strong> {res.status}</p>
              <p><strong>Error:</strong> {errorMessage}</p>
              <Divider />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Please check your information and try again.
              </Text>
            </div>
          ),
          width: 500,
        });
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      Modal.error({
        title: "Connection Error",
        content: (
          <div>
            <p>Failed to connect to the server.</p>
            <p><strong>Error:</strong> {error.message}</p>
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

            <div className="verification-form-container">
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Student ID"
                  name="id_number"
                  rules={[
                    { required: true, message: "Please enter your Student ID" },
                  ]}
                >
                  <Input 
                    prefix={<IdcardOutlined />} 
                    placeholder="Enter your Student ID"
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
                      <li>Already registered? <Button type="link" onClick={() => navigate("/login")}>Login here</Button></li>
                    </ul>
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
                <Descriptions column={2} bordered size="small">
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
                label="Phone Number"
                name="phone"
              >
                <Input 
                  placeholder="Enter your phone number"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter a password" },
                  { min: 8, message: "Password must be at least 8 characters" },
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