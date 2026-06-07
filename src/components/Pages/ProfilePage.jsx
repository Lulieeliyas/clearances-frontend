import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  Row,
  Col,
  Avatar,
  Button,
  Form,
  Input,
  Upload,
  message,
  Divider,
  Descriptions,
  Tag,
  Statistic,
  Progress,
  Tabs,
  Space,
  Modal,
  Alert,
  Spin
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CameraOutlined,
  LockOutlined,
  SaveOutlined,
  DeleteOutlined,
  EditOutlined,
  SecurityScanOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const API_BASE = "http://127.0.0.1:8000/api/";

// Token management utilities
const tokenManager = {
  // Store token after login
  setToken: (token, userData) => {
    if (!token) return;
    
    console.log('Storing token:', token.substring(0, 10) + '...');
    
    // Store token in multiple formats for compatibility
    sessionStorage.setItem('ucs_token', token);
    sessionStorage.setItem('token', token);
    localStorage.setItem('ucs_token', token);
    
    // Store user data
    const sessionData = {
      token: token,
      user: userData,
      timestamp: new Date().getTime()
    };
    sessionStorage.setItem('ucs_current', JSON.stringify(sessionData));
    
    // Also store in axios defaults
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  },
  
  // Get token
  getToken: () => {
    // Check all possible locations
    const tokenSources = [
      sessionStorage.getItem('ucs_token'),
      sessionStorage.getItem('token'),
      localStorage.getItem('ucs_token'),
      localStorage.getItem('token'),
      () => {
        const current = sessionStorage.getItem('ucs_current');
        if (current) {
          try {
            return JSON.parse(current).token;
          } catch (e) {
            return null;
          }
        }
        return null;
      }
    ];
    
    for (const source of tokenSources) {
      let token;
      if (typeof source === 'function') {
        token = source();
      } else {
        token = source;
      }
      
      if (token && token.trim() !== '' && token !== 'null' && token !== 'undefined') {
        console.log('Found token:', token.substring(0, 10) + '...');
        return token.trim();
      }
    }
    
    console.warn('No token found');
    return null;
  },
  
  // Clear all tokens
  clearTokens: () => {
    const items = ['ucs_token', 'token', 'auth_token', 'ucs_current', 'user'];
    items.forEach(item => {
      sessionStorage.removeItem(item);
      localStorage.removeItem(item);
    });
    delete axios.defaults.headers.common['Authorization'];
  },
  
  // Debug tokens
  debugTokens: () => {
    console.log('=== TOKEN DEBUG ===');
    console.log('Session Storage:');
    Object.keys(sessionStorage).forEach(key => {
      console.log(`${key}: ${sessionStorage.getItem(key)?.substring(0, 50)}...`);
    });
    console.log('Local Storage:');
    Object.keys(localStorage).forEach(key => {
      console.log(`${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
    });
    console.log('Axios headers:', axios.defaults.headers.common);
    console.log('=== END DEBUG ===');
  }
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Debug current tokens
      tokenManager.debugTokens();
      
      const token = tokenManager.getToken();
      
      if (!token) {
        message.error('No authentication token found. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      console.log('Attempting to load profile with token:', token.substring(0, 15) + '...');
      
      // First test with debug endpoint
      try {
        const debugRes = await axios.get(`${API_BASE}debug-auth/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Debug auth successful:', debugRes.data);
      } catch (debugErr) {
        console.error('Debug auth failed:', debugErr.response?.data || debugErr.message);
        message.error('Authentication failed. Please login again.');
        tokenManager.clearTokens();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      // Now load profile
      const res = await axios.get(`${API_BASE}profile/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile loaded successfully:', res.data);
      setUser(res.data.user);
      setProfile(res.data);
      form.setFieldsValue(res.data.user);
      message.success('Profile loaded');
      
    } catch (err) {
      console.error('Profile load error:', err);
      
      if (err.response) {
        console.log('Response status:', err.response.status);
        console.log('Response data:', err.response.data);
        
        if (err.response.status === 401) {
          message.error('Session expired. Please login again.');
          tokenManager.clearTokens();
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          message.error(`Failed to load profile: ${err.response.status}`);
        }
      } else if (err.request) {
        message.error('Network error. Please check your connection.');
      } else {
        message.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (values) => {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        message.error('Authentication required. Please login again.');
        return;
      }
      
      const res = await axios.patch(
        `${API_BASE}profile/update/`,
        values,
        { 
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      setUser(res.data.user);
      message.success('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      console.error('Update error:', err);
      if (err.response?.status === 401) {
        message.error('Session expired. Please login again.');
        tokenManager.clearTokens();
      } else {
        message.error(err.response?.data?.error || 'Update failed');
      }
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        message.error('Authentication required. Please login again.');
        return;
      }
      
      await axios.post(
        `${API_BASE}profile/password/`,
        values,
        { 
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      message.success('Password changed successfully');
      setPasswordModal(false);
      passwordForm.resetFields();
      
    } catch (err) {
      console.error('Password change error:', err);
      if (err.response?.status === 401) {
        message.error('Session expired. Please login again.');
        tokenManager.clearTokens();
      } else {
        const errorMsg = err.response?.data?.error || 'Password change failed';
        message.error(errorMsg);
      }
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    try {
      setUploading(true);
      const token = tokenManager.getToken();
      if (!token) {
        message.error('Authentication required. Please login again.');
        return false;
      }
      
      const res = await axios.post(
        `${API_BASE}profile/picture/upload/`,
        formData,
        {
          headers: {
            'Authorization': `Token ${token}`
          }
        }
      );
      
      setUser(prev => ({ ...prev, profile_picture_url: res.data.profile_picture_url }));
      message.success('Profile picture updated');
      loadProfile();
    } catch (err) {
      console.error('Image upload error:', err);
      if (err.response?.status === 401) {
        message.error('Session expired. Please login again.');
        tokenManager.clearTokens();
      } else {
        message.error(err.response?.data?.error || 'Failed to upload image');
      }
    } finally {
      setUploading(false);
    }
    
    return false;
  };

  const removeProfilePicture = async () => {
    Modal.confirm({
      title: 'Remove Profile Picture',
      content: 'Are you sure you want to remove your profile picture?',
      onOk: async () => {
        try {
          const token = tokenManager.getToken();
          if (!token) {
            message.error('Authentication required. Please login again.');
            return;
          }
          
          const res = await axios.delete(`${API_BASE}profile/picture/remove/`, {
            headers: { 
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          setUser(prev => ({ ...prev, profile_picture_url: res.data.profile_picture_url }));
          message.success('Profile picture removed');
          loadProfile();
        } catch (err) {
          console.error('Remove picture error:', err);
          if (err.response?.status === 401) {
            message.error('Session expired. Please login again.');
            tokenManager.clearTokens();
          } else {
            message.error(err.response?.data?.error || 'Failed to remove picture');
          }
        }
      }
    });
  };

  const renderRoleTag = (role) => {
    if (!role) return null;
    
    const roleColors = {
      'student': 'blue',
      'departmenthead': 'red',
      'librarian': 'green',
      'cafeteria': 'orange',
      'dormitory': 'purple',
      'registrar': 'cyan',
      'admin': 'gold'
    };
    
    const roleNames = {
      'student': 'Student',
      'departmenthead': 'Department Head',
      'librarian': 'Librarian',
      'cafeteria': 'Cafeteria',
      'dormitory': 'Dormitory',
      'registrar': 'Registrar',
      'admin': 'Admin'
    };
    
    return (
      <Tag color={roleColors[role] || 'default'}>
        {roleNames[role] || role}
      </Tag>
    );
  };

  // Debug component to check authentication
  const DebugPanel = () => (
    <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}>
      <Alert
        message="Debug Information"
        description={
          <div>
            <p>Token: {tokenManager.getToken() ? '✓ Present' : '✗ Missing'}</p>
            <p>User: {user ? user.username : 'Not loaded'}</p>
            <Button size="small" onClick={tokenManager.debugTokens}>
              Debug Tokens
            </Button>
            <Button size="small" onClick={loadProfile} style={{ marginLeft: 8 }}>
              Reload Profile
            </Button>
          </div>
        }
        type="info"
        showIcon
      />
    </Card>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="Loading profile..." />
        <div style={{ marginTop: 20 }}>
          <Button onClick={loadProfile}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 50, maxWidth: 600, margin: '0 auto' }}>
        <DebugPanel />
        <Alert 
          type="error" 
          message="Failed to load profile" 
          description={
            <div>
              <p>Unable to load your profile information.</p>
              <Space style={{ marginTop: 16 }}>
                <Button type="primary" onClick={loadProfile} icon={<ReloadOutlined />}>
                  Try Again
                </Button>
                <Button onClick={() => window.location.href = '/login'}>
                  Go to Login
                </Button>
                <Button onClick={() => {
                  tokenManager.clearTokens();
                  window.location.href = '/login';
                }}>
                  Clear Tokens & Login
                </Button>
              </Space>
            </div>
          }
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <DebugPanel />
      
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card
            title="Profile"
            extra={
              <Space>
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  onClick={loadProfile}
                  size="small"
                />
              </Space>
            }
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={120}
                src={user.profile_picture_url}
                icon={<UserOutlined />}
                style={{ marginBottom: 16, border: '2px solid #f0f0f0' }}
              />
              
              <Space wrap style={{ marginBottom: 16 }}>
                <Upload
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  accept="image/*"
                  disabled={uploading}
                >
                  <Button
                    type="primary"
                    icon={<CameraOutlined />}
                    loading={uploading}
                  >
                    Change Photo
                  </Button>
                </Upload>
                
                {user.profile_picture_url && !user.profile_picture_url.includes('ui-avatars.com') && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={removeProfilePicture}
                  >
                    Remove
                  </Button>
                )}
              </Space>
              
              <h2 style={{ marginTop: 16, marginBottom: 4 }}>
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.username
                }
              </h2>
              
              <div style={{ marginBottom: 8 }}>
                {renderRoleTag(user.role)}
              </div>
              
              <Progress
                percent={profile?.profile_completion || 0}
                size="small"
                style={{ maxWidth: 200, margin: '0 auto' }}
              />
              <small>Profile Complete</small>
            </div>
            
            <Divider />
            
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Username">
                {user.username}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {user.phone || 'Not set'}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {user.department_name || 'Not assigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Joined">
                {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Login">
                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          
          <Card style={{ marginTop: 24 }}>
            <Button
              type="primary"
              icon={<LockOutlined />}
              block
              onClick={() => setPasswordModal(true)}
            >
              Change Password
            </Button>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Overview" key="overview">
              <Card title="Account Overview">
                {profile?.stats && Object.keys(profile.stats).length > 0 ? (
                  <Row gutter={16}>
                    {Object.entries(profile.stats).map(([key, value]) => (
                      <Col xs={12} sm={8} md={6} key={key}>
                        <Statistic
                          title={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          value={value}
                          style={{ textAlign: 'center' }}
                        />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert
                    message="No statistics available"
                    description="Your account statistics will appear here once you start using the system."
                    type="info"
                    showIcon
                  />
                )}
              </Card>
              
              <Card title="Recent Activity" style={{ marginTop: 24 }}>
                {profile?.recent_activities?.length > 0 ? (
                  <div>
                    {profile.recent_activities.map((activity, index) => (
                      <div key={index} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: index < profile.recent_activities.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <strong>{activity.title}</strong>
                        <div style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>
                          {activity.description}
                        </div>
                        <small style={{ color: '#999', display: 'block', marginTop: 4 }}>
                          {activity.date ? new Date(activity.date).toLocaleString() : 'Recently'}
                        </small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                    No recent activity found
                  </div>
                )}
              </Card>
            </TabPane>
            
            <TabPane tab="Edit Profile" key="edit">
              <Card title="Edit Profile Information">
                <Alert
                  message="Edit Mode"
                  description={editMode 
                    ? "You are now editing your profile information. Click 'Save Changes' to update."
                    : "Click the 'Edit' button in the profile card to enable editing."
                  }
                  type={editMode ? "info" : "warning"}
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleProfileUpdate}
                  initialValues={user}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="first_name"
                        label="First Name"
                      >
                        <Input 
                          prefix={<UserOutlined />} 
                          disabled={!editMode}
                          placeholder="Enter first name"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="last_name"
                        label="Last Name"
                      >
                        <Input 
                          prefix={<UserOutlined />} 
                          disabled={!editMode}
                          placeholder="Enter last name"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Email is required' },
                      { type: 'email', message: 'Invalid email format' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      disabled={!editMode}
                      placeholder="Enter email address"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      disabled={!editMode}
                      placeholder="Enter phone number"
                    />
                  </Form.Item>
                  
                  {editMode && (
                    <Form.Item>
                      <Space>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                        >
                          Save Changes
                        </Button>
                        <Button onClick={() => setEditMode(false)}>
                          Cancel
                        </Button>
                      </Space>
                    </Form.Item>
                  )}
                </Form>
              </Card>
            </TabPane>
            
            <TabPane tab="Security" key="security">
              <Card title="Security Settings">
                <Alert
                  message="Authentication Status"
                  description={`You are logged in as ${user.username} (${user.role})`}
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Alert
                  message="Last Password Change"
                  description={
                    user.last_password_change 
                      ? new Date(user.last_password_change).toLocaleString()
                      : 'Never changed'
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Button
                  type="primary"
                  icon={<SecurityScanOutlined />}
                  onClick={() => setPasswordModal(true)}
                >
                  Change Password
                </Button>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
      
      <Modal
        title="Change Password"
        open={passwordModal}
        onCancel={() => {
          setPasswordModal(false);
          passwordForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="current_password"
            label="Current Password"
            rules={[{ required: true, message: 'Current password is required' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>
          
          <Form.Item
            name="new_password"
            label="New Password"
            rules={[
              { required: true, message: 'New password is required' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          
          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setPasswordModal(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Change Password
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}