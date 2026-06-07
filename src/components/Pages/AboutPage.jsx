import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Button, Space } from "antd";
import {
  BulbOutlined,
  RocketOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FormOutlined,
  NotificationOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const slides = [
  { 
    title: "One Place for Every Office", 
    text: "Submit your clearance form once and track approvals from all departments in a single platform.", 
    icon: <ApartmentOutlined />
  },
  { 
    title: "Faster Processing", 
    text: "Save time and avoid paperwork with our automated clearance workflow system.", 
    icon: <RocketOutlined />
  },
  { 
    title: "Real-time Tracking", 
    text: "See approvals and feedback in real-time from all departments including Library and Registrar.", 
    icon: <NotificationOutlined />
  },
];

export default function AboutPage() {
  const [index, setIndex] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="about-splash">
        <img src="/images/MAU.jpg" alt="MAU Logo" className="splash-logo" />
        <h1>Welcome to Online University Clearance System</h1>
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  return (
    <div className="about-page">

      {/* HERO SECTION */}
     <section className="about-hero full-screen-hero">
<div className="hero-overlay"></div>
<div className="hero-content">
<div className="hero-logo-container">
</div>
<div className="hero-text-content">
<h1 className="hero-title">
University Online Clearance System
</h1>
<p className="hero-subtitle">
Digital clearance made fast, transparent, and paperless for students and staff.
</p>
<div className="hero-buttons">
<Button
type="primary"
size="large"
icon={<RocketOutlined />}
onClick={() => navigate("/register")}
className="hero-btn-primary"
>
Get Started
</Button>
</div>
</div>
</div>
</section>

      {/* SLIDES SECTION */}
      <section className="about-slides">
        <div className="section-header">
          <Title level={2} className="section-title">How Our System Works</Title>
          <Paragraph className="section-subtitle">
            Experience a seamless clearance process designed for modern universities
          </Paragraph>
        </div>
        
        <div className="slides-container">
          {slides.map((slide, i) => (
            <div 
              key={i} 
              className={`slide-card ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            >
              <div className="slide-icon">{slide.icon}</div>
              <Title level={3} className="slide-title">{slide.title}</Title>
              <Paragraph className="slide-text">{slide.text}</Paragraph>
            </div>
          ))}
        </div>
        
        <div className="slides-indicator">
          {slides.map((_, i) => (
            <span 
              key={i} 
              className={`slide-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            ></span>
          ))}
        </div>
      </section>

      {/* INFO CARDS SECTION */}
      <section className="info-section">
        <div className="section-header">
          <Title level={2} className="section-title">System Overview</Title>
          <Paragraph className="section-subtitle">
            Everything you need to know about our clearance system
          </Paragraph>
        </div>

        <div className="info-cards-grid">
          <Card className="info-card">
            <div className="info-card-header">
              <BulbOutlined className="info-icon" />
              <Title level={3} className="info-card-title">What is the Clearance System?</Title>
            </div>
            <Paragraph className="info-card-text">
              A fully digital clearance workflow that replaces traditional paperwork, tracking every department approval in real-time with complete transparency.
            </Paragraph>
          </Card>

          <Card className="info-card">
            <div className="info-card-header">
              <ClockCircleOutlined className="info-icon" />
              <Title level={3} className="info-card-title">How It Works</Title>
            </div>
            <ul className="info-card-list">
              <li><FormOutlined /> Submit clearance form online</li>
              <li><CheckCircleOutlined /> Department approval process</li>
              <li><NotificationOutlined /> Real-time status updates</li>
              <li><FileDoneOutlined /> Registrar final clearance</li>
            </ul>
          </Card>

          <Card className="info-card">
            <div className="info-card-header">
              <CheckCircleOutlined className="info-icon" />
              <Title level={3} className="info-card-title">Key Benefits</Title>
            </div>
            <ul className="info-card-list">
              <li>📄 Paperless workflow</li>
              <li>🔔 Instant notifications</li>
              <li>👁️ Complete transparency</li>
              <li>⚡ Fast approvals</li>
              <li>📱 Mobile-friendly access</li>
            </ul>
          </Card>

          <Card className="info-card">
            <div className="info-card-header">
              <TeamOutlined className="info-icon" />
              <Title level={3} className="info-card-title">About University</Title>
            </div>
            <Paragraph className="info-card-text">
              A leading institution in Ethiopia embracing digital innovation and technology to enhance academic administration and student experience.
            </Paragraph>
          </Card>

          <Card className="info-card">
            <div className="info-card-header">
              <ApartmentOutlined className="info-icon" />
              <Title level={3} className="info-card-title">System Components</Title>
            </div>
            <ul className="info-card-list">
              <li>🧑‍🎓 Student Dashboard</li>
              <li>🏢 Department Head Portal</li>
              <li>📚 Library Portal</li>
              <li>🏠 Dormitory Portal</li>
              <li>🍽️ Cafeteria Portal</li>
              <li>🎓 Registrar Portal</li>
            </ul>
          </Card>

          <Card className="info-card">
            <div className="info-card-header">
              <RocketOutlined className="info-icon" />
              <Title level={3} className="info-card-title">Our Mission</Title>
            </div>
            <Paragraph className="info-card-text">
              To make the clearance process simple, automated, fast, and accessible for all students and staff, eliminating paperwork and reducing processing time.
            </Paragraph>
          </Card>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-content">
          <Title level={2} className="cta-title">Ready to Get Started?</Title>
          <Paragraph className="cta-text">
            Join thousands of students and staff who are already using our system for faster, more transparent clearance processing.
          </Paragraph>
          <Space size="large">
<Button 
  size="large"
  onClick={() => navigate("/learn-more")}
  className="cta-btn-secondary"
>
  Learn More
</Button>
          </Space>
        </div>
      </section>
    </div>
  );
}