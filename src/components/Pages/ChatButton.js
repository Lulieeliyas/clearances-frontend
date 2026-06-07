import React, { useState, useEffect } from 'react';
import { Badge, Button, Dropdown, List, Avatar, message } from 'antd';
import { MessageOutlined, UserOutlined, BellOutlined } from '@ant-design/icons';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000/api/";

const ChatButton = ({ user, token }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_BASE}chat/unread_count/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadRecentChats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}chat/recent/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to load recent chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const dropdownContent = (
    <div style={{ width: 320 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <strong>Recent Chats</strong>
      </div>
      <List
        loading={loading}
        dataSource={rooms}
        renderItem={room => (
          <List.Item 
            style={{ 
              padding: '12px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
            onClick={() => window.open(`/chat/${room.id}`, '_blank')}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={room.name}
              description={room.last_message?.substring(0, 40) + '...'}
            />
            {room.unread_count > 0 && (
              <Badge count={room.unread_count} style={{ backgroundColor: '#ff4d4f' }} />
            )}
          </List.Item>
        )}
      />
      <div style={{ padding: '12px 16px', textAlign: 'center' }}>
        <Button 
          type="link" 
          onClick={() => window.open('/chat', '_blank')}
        >
          View All Chats
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown 
      overlay={dropdownContent} 
      trigger={['click']}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          icon={<MessageOutlined />}
          style={{ color: 'white' }}
          shape="circle"
        />
      </Badge>
    </Dropdown>
  );
};

export default ChatButton;