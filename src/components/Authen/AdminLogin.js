import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Alert,
  Space,
  Divider,
  Row,
  Col
} from "antd";
import { 
  LockOutlined, 
  UserOutlined, 
  SafetyOutlined,
  LoginOutlined,
  HomeOutlined,
  SecurityScanOutlined // Changed from ShieldOutlined to SecurityScanOutlined
} from "@ant-design/icons";
import { apiFetch, setSession } from "../../utils/api";

const { Title, Text } = Typography;

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if already logged in as admin
  useEffect(() => {
    const stored = sessionStorage.getItem("ucs_current");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.role === "admin") {
          navigate("/admin");
        }
      } catch (e) {
        // Invalid session
      }
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        username: values.username,
        password: values.password,
        role: "admin"
      };

      const res = await apiFetch("login/", {
        method: "POST",
        body: payload,
      });

      // Verify it's actually an admin
      if (res.user.role !== "admin") {
        throw new Error("Access denied. Admin credentials required.");
      }

      // Save session
      setSession({ ...res.user, token: res.token });
      
      message.success("Admin login successful!");
      
      // Redirect to admin dashboard
      navigate("/admin");

    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || "Invalid admin credentials");
      message.error("Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #42b7c2 0%, #764ba2 100%)",
      padding: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Row justify="center" align="middle" style={{ width: "100%" }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              border: "none",
              overflow: "hidden"
            }}
            bodyStyle={{ padding: "40px 30px" }}
          >
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <Space direction="vertical" size="middle">
                <div>
                  <SafetyOutlined style={{ 
                    fontSize: 48, 
                    color: "#1890ff",
                    background: "#e6f7ff",
                    padding: 16,
                    borderRadius: "50%",
                    marginBottom: 16
                  }} />
                  <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                    Admin Portal
                  </Title>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    University Clearance System
                  </Text>
                </div>
                <Divider style={{ margin: "16px 0" }}>
                  <SecurityScanOutlined style={{ color: "#1890ff" }} /> {/* Changed here */}
                </Divider>
                <Text strong style={{ fontSize: 16, color: "#666" }}>
                  Restricted Administrator Access
                </Text>
              </Space>
            </div>

            {error && (
              <Alert
                message="Login Error"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 24, borderRadius: 8 }}
              />
            )}

            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Admin Username"
                name="username"
                rules={[{ 
                  required: true, 
                  message: "Please enter admin username" 
                }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: "#1890ff" }} />} 
                  placeholder="Enter admin username" 
                  size="large"
                  autoFocus
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ 
                  required: true, 
                  message: "Please enter password" 
                }]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: "#1890ff" }} />} 
                  placeholder="Enter password" 
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block 
                  size="large"
                  icon={<LoginOutlined />}
                  style={{ 
                    height: 48, 
                    fontSize: 16,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #1890ff 0%, #0050b3 100%)",
                    border: "none",
                    borderRadius: 8,
                    marginTop: 8
                  }}
                >
                  Access Admin Dashboard
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: "20px 0" }} />

            <div style={{ textAlign: "center" }}>
              <Space direction="vertical" size="small">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ⚠️ This portal is restricted to authorized administrators only.
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  All login attempts are logged and monitored.
                </Text>
                <Space>
                  <Button 
                    type="link" 
                    onClick={() => navigate("/")}
                    icon={<HomeOutlined />}
                    style={{ marginTop: 8 }}
                  >
                    Back to Main Site
                  </Button>
                  <Button 
                    type="link" 
                    onClick={() => navigate("/login")}
                    style={{ fontSize: 12 }}
                  >
                    Student/Staff Login
                  </Button>
                </Space>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}