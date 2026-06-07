import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Button, Tooltip } from "antd";
import { StarFilled } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/about"); // ✅ Goes to description page
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6b8ce3 100%)",
        backgroundSize: "400% 400%",
        animation: "backgroundMove 10s ease-in-out infinite alternate",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 650,
          borderRadius: "20px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          textAlign: "center",
          overflow: "hidden",
          padding: "45px 35px",
          background: "linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)",
        }}
        hoverable
      >
        {/* University Logo (Clickable) */}
        <Tooltip title="Click to learn more about this system">
          <div
            style={{
              marginBottom: "25px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src="../images/MAU.jpg"
              alt="University Logo"
              onClick={handleLogoClick}
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #667eea",
                boxShadow: "0 6px 20px rgba(102,126,234,0.5)",
                animation: "floatLogo 3s ease-in-out infinite",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(118,75,162,0.6)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(102,126,234,0.5)";
              }}
            />
          </div>
        </Tooltip>

        {/* Marquee Section */}
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            marginBottom: "35px",
            padding: "14px 0",
            background: "#f0f2f5",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              animation: "marquee 18s linear infinite",
            }}
          >
            {[...Array(3)].map((_, i) => (
              <React.Fragment key={i}>
                <StarFilled
                  className="pulsing-star"
                  style={{
                    fontSize: "30px",
                    marginRight: "12px",
                    color: "#fadb14",
                  }}
                />
                <Text
                  strong
                  style={{
                    fontSize: "22px",
                    color: "#4e54c8",
                    fontWeight: 800,
                    marginRight: "40px",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  እንኳን ወደ ዩኒቨርሲቲ ክሊራንስ ሲስተም ደህና መጡ!! 🌟
                  <br />
                  Welcome to the University Clearance System 🎓
                </Text>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Title */}
        <Title
          level={2}
          style={{
            color: "#4e54c8",
            marginBottom: "18px",
            fontWeight: "900",
            textShadow: "0 3px 8px rgba(78,84,200,0.3)",
          }}
        >
          University Clearance System
        </Title>

        {/* Description */}
        <Paragraph
          style={{
            fontSize: "17px",
            color: "#555",
            lineHeight: "1.7",
            marginBottom: "30px",
          }}
        >
          A modern digital platform that simplifies student clearance across all
          university departments — faster, smarter, and paperless.
        </Paragraph>

        {/* Next Button */}
        <div style={{ marginTop: "30px" }}>
          <Text
            type="secondary"
            style={{
              display: "block",
              marginBottom: "14px",
              fontSize: "15px",
              color: "#888",
            }}
          >
            Click below to begin your quick tour
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/intro")}
            style={{
              borderRadius: "8px",
              padding: "0 45px",
              height: "45px",
              fontWeight: "600",
              background: "linear-gradient(90deg, #667eea, #764ba2)",
              boxShadow: "0 8px 20px rgba(102,126,234,0.4)",
            }}
          >
            Next →
          </Button>
        </div>
      </Card>

      {/* CSS Animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes pulse {
          0% { transform: scale(1); color: #fadb14; }
          50% { transform: scale(1.6); color: #ff4d4f; }
          100% { transform: scale(1); color: #52c41a; }
        }
        @keyframes backgroundMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes floatLogo {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .pulsing-star {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
