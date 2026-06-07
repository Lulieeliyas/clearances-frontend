import React from "react";
import { Card, Typography, Row, Col, Steps, Statistic, Button, Avatar } from "antd";
import {
  UserOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  FileTextOutlined,
  GithubOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./LearnMorePage.css";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

export default function LearnMorePage() {
  const navigate = useNavigate();

  return (
    <div className="learnmore-page">

      {/* HEADER */}
      <section className="learnmore-header">
        <img src="/images/123.jpg" alt="System Banner" />
        <div className="header-overlay">
          <Title>Online University Clearance System</Title>
          <Paragraph>
            A complete digital solution designed to simplify and accelerate university clearance processes.
          </Paragraph>
        </div>
      </section>

      {/* HOW SYSTEM WORKS */}
      <section className="learnmore-section">
        <Title level={2}>How the System is Used</Title>

        <Steps direction="vertical">
          <Step
            title="Student Registration & Login"
            description="Students create an account and log in to their personal dashboard."
            icon={<UserOutlined />}
          />
          <Step
            title="Submit Clearance Form"
            description="Student fills and submits the online clearance form once."
            icon={<FileTextOutlined />}
          />
          <Step
            title="Department Reviews"
            description="Library, Cafeteria, Dormitory, and Department Heads review requests."
            icon={<ApartmentOutlined />}
          />
          <Step
            title="Real-time Tracking"
            description="Students track approvals and feedback instantly."
            icon={<RocketOutlined />}
          />
          <Step
            title="Final Registrar Approval"
            description="Registrar gives final clearance confirmation."
            icon={<CheckCircleOutlined />}
          />
        </Steps>
      </section>

      {/* SYSTEM USERS */}
      <section className="learnmore-section">
        <Title level={2}>System Users</Title>

<Row gutter={16}>
<Col xs={24} md={6}><Card><Statistic title="Students" value={12000} suffix="+" /></Card></Col>
<Col xs={24} md={6}><Card><Statistic title="Department Staff" value={350} suffix="+" /></Card></Col>
<Col xs={24} md={6}><Card><Statistic title="Administrators" value={50} suffix="+" /></Card></Col>
<Col xs={24} md={6}><Card><Statistic title="Active Departments" value={8} suffix="+" /></Card></Col>
</Row>
      </section>

      {/* SYSTEM STRENGTH */}
      <section className="learnmore-section">
        <Title level={2}>System Strengths</Title>

        <Row gutter={16}>
          {[
            ["⚡ Fast Processing", "Eliminates paperwork delays."],
            ["🔍 Transparency", "Students see approval status clearly."],
            ["📱 Accessible Anywhere", "Works on all devices like Mobile,Desktop,Tablet."],
            ["🔔 Instant Notifications", "Automatic status alerts."],
            ["🛡️ Secure System", "Role-based secure access."],
            ["📊 Centralized Data", "All records stored safely."],
          ].map((item, i) => (
            <Col xs={24} md={8} key={i}>
              <Card>
                <Title level={4}>{item[0]}</Title>
                <Paragraph>{item[1]}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* DEVELOPER SECTION */}
      <section className="developer-section">
        <Title level={2}>System Developer</Title>

        <Card className="developer-card">
          <Avatar
            size={120}
            src="../images/12345.png"
            icon={<UserOutlined />}
          />

          <Title level={3}>Lulie Eliyas</Title>
          <Text type="secondary">Full-Stack Developer (React & Django)</Text>

          <Paragraph className="developer-desc">
            This system was designed and developed to modernize university clearance
            processes, improve transparency, and eliminate paperwork through
            secure digital automation.
          </Paragraph>

          <div className="developer-actions">
           <Button
  icon={<MailOutlined />}
  href="mailto:lulieeliyas@gmail.com"
>
  lulieeliyas@gmail.com
</Button>
<Button
  icon={<GithubOutlined />}
  href="https://github.com/Lulieeliyas"
  target="_blank"
>
  @Lulieeliyas
</Button>
          </div>
        </Card>
      </section>

      {/* BACK BUTTON */}
      <section className="back-section">
        <Button type="primary" size="large" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </section>
    </div>
  );
}