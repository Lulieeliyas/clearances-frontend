import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Select, message, Divider, Space, Avatar } from "antd";
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  CoffeeOutlined,
  HeartOutlined,
  TrophyOutlined,
  SecurityScanOutlined,
  ShareAltOutlined,
  SolutionOutlined,
  SafetyOutlined,
  HomeOutlined,
  TeamOutlined,
  BookOutlined,
  AuditOutlined,
  LoginOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { apiFetch, setSession } from "../../utils/api";
import "./LoginPage.css";

const { Title, Text } = Typography;
const { Option } = Select;

// All roles in the system with icons and display names
const roles = [
  { value: "student", label: "Student", icon: <UserOutlined />, color: "#10b981", bg: "#d1fae5" },
  { value: "departmenthead", label: "Department Head", icon: <TeamOutlined />, color: "#8b5cf6", bg: "#ede9fe" },
  { value: "librarian", label: "Librarian", icon: <BookOutlined />, color: "#f59e0b", bg: "#fef3c7" },
  { value: "cafeteria", label: "Cafeteria", icon: <CoffeeOutlined />, color: "#ef4444", bg: "#fee2e2" },
  { value: "psychology", label: "Psychology", icon: <HeartOutlined />, color: "#ec4899", bg: "#fce7f3" },
  { value: "sportmaster", label: "Sport Master", icon: <TrophyOutlined />, color: "#f97316", bg: "#ffedd5" },
  { value: "campuspolice", label: "Campus Police", icon: <SecurityScanOutlined />, color: "#3b82f6", bg: "#dbeafe" },
  { value: "cooperationsharing", label: "Cooperation Sharing", icon: <ShareAltOutlined />, color: "#14b8a6", bg: "#ccfbf1" },
  { value: "dopcordinator", label: "DOP Cordinator", icon: <SolutionOutlined />, color: "#a855f7", bg: "#f3e8ff" },
  { value: "studentaffairs", label: "Student Affairs", icon: <SafetyOutlined />, color: "#06b6d4", bg: "#cffafe" },
  { value: "dormitory", label: "Dormitory", icon: <HomeOutlined />, color: "#84cc16", bg: "#ecfccb" },
  { value: "registrar", label: "Registrar", icon: <AuditOutlined />, color: "#6366f1", bg: "#e0e7ff" },
  { value: "admin", label: "Admin", icon: <RocketOutlined />, color: "#000000", bg: "#f3f4f6" },
];

// Role categories for better organization
const roleCategories = [
  {
    title: "👨‍🎓 Students",
    roles: ["student"]
  },
  {
    title: "📚 Academic Departments",
    roles: ["departmenthead", "librarian", "registrar"]
  },
  {
    title: "🍽️ Student Services",
    roles: ["cafeteria", "psychology", "sportmaster", "campuspolice", "dormitory"]
  },
  {
    title: "⚙️ Administration",
    roles: ["cooperationsharing", "dopcordinator", "studentaffairs"]
  }
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  // Preselect role from URL (?role=admin)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qrole = params.get("role");
    if (qrole && roles.some(r => r.value === qrole)) {
      setRole(qrole);
      form.setFieldsValue({ role: qrole });
    }
  }, [location.search, form]);

  const onFinish = async (values) => {
    if (!role) return message.warning("Please select your role");
    setLoading(true);

    try {
      const payload = role === "student"
        ? { email: values.email, password: values.password, role: role }
        : { username: values.username, password: values.password, role: role };

      const res = await apiFetch("login/", {
        method: "POST",
        body: payload,
      });

      setSession({ ...res.user, token: res.token, role: res.user.role });
      message.success("Login successful");

      const routes = {
        student: "/student",
        departmenthead: "/departmenthead",
        librarian: "/librarian",
        cafeteria: "/cafeteria",
        psychology: "/psychology",
        sportmaster: "/sportmaster",
        campuspolice: "/campuspolice",
        cooperationsharing: "/cooperationsharing",
        dopcordinator: "/dopcordinator",
        studentaffairs: "/studentaffairs",
        dormitory: "/dormitory",
        registrar: "/registrar",
        admin: "/admin"
      };

      navigate(routes[res.user.role] || "/login");
    } catch (err) {
      console.error("Login error:", err);
      message.error(err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="login-page">
      {/* Animated background elements */}
      <div className="bg-animation">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        <div className="bg-circle circle-4"></div>
        <div className="bg-circle circle-5"></div>
        <div className="bg-circle circle-6"></div>
      </div>

      {/* Centered Login Card */}
      <div className="login-container-centered">
        <Card className="login-card">
          <div className="login-header">
            <Avatar 
              size={80} 
              icon={<LoginOutlined />} 
              style={{ 
                background: "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)",
                marginBottom: 20,
                boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
              }} 
            />
            <Title level={2} style={{ 
              marginBottom: 8,
              background: "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "32px"
            }}>
              Welcome Back!
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              Sign in to access your dashboard
            </Text>
          </div>

          <Form 
            form={form}
            layout="vertical" 
            onFinish={onFinish}
            initialValues={{ role: role }}
            className="login-form"
          >
            <Form.Item 
              label={
                <Space>
                  <UserOutlined style={{ color: "#ff6b6b" }} />
                  <span style={{ fontWeight: 600 }}>Select Your Role</span>
                </Space>
              }
              name="role"
              rules={[{ required: true, message: "Please select your role" }]}
            >
              <Select 
                placeholder="Choose your role"
                value={role} 
                onChange={setRole}
                size="large"
                showSearch
                optionFilterProp="children"
                dropdownStyle={{ borderRadius: 16 }}
                className="role-select"
              >
                {roleCategories.map(category => (
                  <Select.OptGroup label={category.title} key={category.title}>
                    {roles
                      .filter(role => category.roles.includes(role.value))
                      .map((r) => (
                        <Option key={r.value} value={r.value}>
                          <Space align="center">
                            <span style={{ 
                              color: r.color,
                              fontSize: 18,
                              marginRight: 8
                            }}>
                              {r.icon}
                            </span>
                            <span style={{ fontWeight: 500 }}>{r.label}</span>
                          </Space>
                        </Option>
                      ))}
                  </Select.OptGroup>
                ))}
              </Select>
            </Form.Item>

            {role === "student" ? (
              <Form.Item
                label={
                  <Space>
                    <MailOutlined style={{ color: "#ff6b6b" }} />
                    <span style={{ fontWeight: 600 }}>Email Address</span>
                  </Space>
                }
                name="email"
                rules={[
                  { required: true, type: "email", message: "Valid email is required" },
                  { max: 254, message: "Email too long" }
                ]}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: "#bfbfbf" }} />} 
                  placeholder="Enter your email" 
                  size="large"
                  autoComplete="email"
                  className="custom-input"
                />
              </Form.Item>
            ) : role ? (
              <Form.Item
                label={
                  <Space>
                    <UserOutlined style={{ color: "#ff6b6b" }} />
                    <span style={{ fontWeight: 600 }}>Username</span>
                  </Space>
                }
                name="username"
                rules={[
                  { required: true, message: "Username is required" },
                  { min: 3, message: "Username must be at least 3 characters" }
                ]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />} 
                  placeholder="Enter your username" 
                  size="large"
                  autoComplete="username"
                  className="custom-input"
                />
              </Form.Item>
            ) : null}

            <Form.Item
              label={
                <Space>
                  <LockOutlined style={{ color: "#ff6b6b" }} />
                  <span style={{ fontWeight: 600 }}>Password</span>
                </Space>
              }
              name="password"
              rules={[
                { required: true, message: "Password is required" },
                { min: 6, message: "Password must be at least 6 characters" }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />} 
                placeholder="Enter your password" 
                size="large"
                autoComplete="current-password"
                className="custom-input"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block 
                size="large"
                className="login-btn"
                // icon={<ArrowRightOutlined />}
                disabled={!role}
                style={{
                  height: "50px",
                  borderRadius: "25px",
                  background: "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  boxShadow: "0 10px 20px rgba(255, 107, 107, 0.3)"
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: "24px 0 16px" }}>
            <Text type="secondary" style={{ fontSize: "14px" }}>or</Text>
          </Divider>

          <div className="login-footer">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="link" 
                onClick={() => navigate("/forgot-password")}
                className="forgot-link"
                style={{ color: "#ff6b6b", fontWeight: 500 }}
              >
                Forgot your password?
              </Button>

              <div className="register-section" style={{ textAlign: "center" }}>
                <Text type="secondary">New to the system? </Text>
                <Button 
                  type="link" 
                  onClick={() => navigate("/register")}
                  className="register-link"
                  style={{ 
                    color: "#4ecdc4", 
                    fontWeight: 600,
                    fontSize: "15px"
                  }}
                >
                  Create Student Account
                </Button>
              </div>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
}