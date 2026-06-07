// MaintenancePage.js
import React from 'react';
import { Card, Typography, Button, Alert, Row, Col, Space } from 'antd';
import { WarningOutlined, HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function MaintenancePage() {
  const navigate = useNavigate();
  
  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/check-system-status/');
      const data = await response.json();
      
      if (data.is_open) {
        navigate('/login');
      }
    } catch (err) {
      console.error('Failed to check system status:', err);
    }
  };
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 24
    }}>
      <Card style={{ width: '100%', maxWidth: 600, borderRadius: 12 }}>
        <Alert
          message="System Under Maintenance"
          description="The clearance system is currently unavailable for maintenance. Please try again later."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24 }}
        />
        
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Title level={2} style={{ color: '#faad14' }}>
            <WarningOutlined /> Maintenance Mode
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            We're performing scheduled maintenance to improve your experience.
          </Text>
          
          <div style={{ marginTop: 32 }}>
            <Space>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={checkSystemStatus}
                size="large"
              >
                Check Status
              </Button>
              <Button 
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                size="large"
              >
                Go Home
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
}