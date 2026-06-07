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
} from "@ant-design/icons";
import "./AboutPage.css";

const { Title, Paragraph } = Typography;

// 🎞️ Slides content
const slides = [
  {
    title: "One Place for Every Office",
    text: "Submit your clearance form once and track approvals from all departments.",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=60",
  },
  {
    title: "Faster Processing",
    text: "Save time and avoid paperwork with our automated clearance workflow.",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=60",
  },
  {
    title: "Track Your Progress",
    text: "See approvals and feedback in real-time from Department, Library, and Registrar.",
    img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1600&q=60",
  },
];

export default function AboutPage() {
  const [index, setIndex] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  // 🌊 Auto slide transition
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 🕓 Splash screen delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="about-splash">
        <img src="../images/logo11.jpg" alt="MAU" className="splash-logo" />
        <h1>Welcome to  Online University Clearance System</h1>
        <div className="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    );
  }

  return (
    <div className="about-page">
      {/* 🌟 HERO SECTION */}
      <section
        className="about-hero"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=60')",
        }}
      >
        <div className="overlay"></div>
        <div className="hero-text">
          <h1>About Online University Clearance System</h1>
          <p>
            A smart, digital solution to manage your clearance faster, safer, and
            more transparently  connecting students and departments in one place.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/register")}
            className="hero-btn"
          >
            Get Started 🚀
          </Button>
        </div>
      </section>

      {/* 🎞️ SLIDER */}
      <section className="about-slides">
        <Card className="slide-card">
          <div
            className="slides-container"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${index * (100 / slides.length)}%)`,
            }}
          >
            {slides.map((slide, i) => (
              <div key={i} className="slide-item">
                <img src={slide.img} alt={slide.title} />
                <Title level={3}>{slide.title}</Title>
                <Paragraph>{slide.text}</Paragraph>
              </div>
            ))}
          </div>

          {/* 🟣 Dots */}
          <Space className="dots">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === index ? "active" : ""}`}
              ></span>
            ))}
          </Space>
        </Card>
      </section>

      {/* 💡 MAIN CONTENT */}
      <section className="info">
       <div className="clearance-card">
  <div className="clearance-header">
    <BulbOutlined className="clearance-icon" />
    <h2>💡 What is the Clearance System?</h2>
  </div>
  <p className="clearance-text">
    The Online Clearance System enables students to complete clearance
    digitally, replacing manual paperwork with a faster, more transparent
    digital process.
  </p>
</div>


  <div className="howitworks-card">
  <div className="howitworks-header">
    <ClockCircleOutlined className="howitworks-icon" />
    <h2>⚙️ How It Works</h2>
  </div>
  <ul className="howitworks-list">
    <li>Students submit clearance forms via their dashboard.</li>
    <li>Each department reviews and approves.</li>
    <li>Status updates are shown in real-time.</li>
    <li>Registrar grants the final clearance.</li>
  </ul>
</div>

<div className="benefits-card">
  <div className="benefits-header">
    <CheckCircleOutlined className="benefits-icon" />
    <h2>🎯 Benefits</h2>
  </div>
  <ul className="benefits-list">
    <li>Fully paperless workflow</li>
    <li>Instant notifications</li>
    <li>Transparency for all parties</li>
    <li>Faster turnaround time</li>
  </ul>
</div>


<div className="about-university-card">
  <div className="about-header">
    <TeamOutlined className="about-icon" />
    <h2>🏛️ About University</h2>
  </div>
  <p className="about-description">
    University is an institution of innovation and excellence, dedicated to academic and technological advancement in Ethiopia. The clearance system supports its digital transformation.
  </p>
</div>


<div className="info-cards">
  <div className="info-header">
    <ApartmentOutlined className="info-icon" />
    <h2>🧩 System Components</h2>
  </div>
  <ul className="component-list">
    <li>Student Dashboard</li>
    <li>Department Head Portal</li>
    <li>Library Portal</li>
    <li>Dormitory Portal</li>
    <li>Cafeteria Portal</li>
    <li>Registrar Portal</li>
  </ul>
</div>


<div className="mission-card">
  <div className="mission-header">
    <RocketOutlined className="mission-icon" />
    <h2>🎓 Our Mission</h2>
  </div>
  <p className="mission-text">
    To simplify, automate, and digitize the clearance process, making it
    faster, eco-friendly, and accessible for all students and staff.
  </p>
</div>

      </section>
    </div>
  );
}
