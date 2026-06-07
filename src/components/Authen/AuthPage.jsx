import React from "react";
import { Link } from "react-router-dom";
import { Card, Typography, Button, Space } from "antd";
import { ArrowRightOutlined, UserAddOutlined } from "@ant-design/icons";


const { Title, Paragraph } = Typography;

export default function AuthPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #667eea, #764ba2)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
          padding: "20px",
          background: "#fff",
        }}
      >
        <Title level={2}>Welcome Back!</Title>
        <Paragraph>Login or sign up to continue</Paragraph>

        <Space direction="vertical" style={{ width: "100%" }}>
          <Link to="/login">
            <Button
              type="primary"
              block
              size="large"
              icon={<ArrowRightOutlined/>}
            >
              Login
            </Button>
          </Link>

          <Link to="/register">
            <Button
              type="default"
              block
              size="large"
              icon={<UserAddOutlined />}
            >
              Sign Up
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}
