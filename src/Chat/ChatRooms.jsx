import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000/api/";

const ChatRooms = ({ user, onSelectRoom, selectedRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.token) {
      loadChatRooms();
    }
  }, [user]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const endpoint = user.role === 'student' 
        ? 'student/chat/rooms/'
        : 'department-head/chat/rooms/';
      
      const response = await axios.get(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      setRooms(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
      setError('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="chat-rooms-loading">
        <div className="loading-spinner"></div>
        <p>Loading chats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-rooms-error">
        <p>{error}</p>
        <button onClick={loadChatRooms}>Retry</button>
      </div>
    );
  }

  return (
    <div className="chat-rooms">
      {rooms.length === 0 ? (
        <div className="no-chat-rooms">
          <p>No active chats</p>
          <p className="hint">Start a new chat from the departments list</p>
        </div>
      ) : (
        <div className="rooms-list">
          {rooms.map(room => (
            <div
              key={room.id}
              className={`room-item ${selectedRoom?.id === room.id ? 'selected' : ''}`}
              onClick={() => onSelectRoom(room)}
            >
              <div className="room-avatar">
                {user.role === 'student' ? (
                  room.staff_role === 'librarian' ? '📚' :
                  room.staff_role === 'cafeteria' ? '🍽️' :
                  room.staff_role === 'dormitory' ? '🏠' :
                  room.staff_role === 'registrar' ? '📋' :
                  room.staff_role === 'departmenthead' ? '👨‍🏫' : '💬'
                ) : (
                  '👤'
                )}
              </div>
              <div className="room-details">
                <div className="room-header">
                  <h4 className="room-name">
                    {user.role === 'student' ? room.staff_name : room.student_name}
                    {room.unread_count > 0 && (
                      <span className="unread-badge">{room.unread_count}</span>
                    )}
                  </h4>
                  <span className="room-time">{formatTime(room.last_message_time)}</span>
                </div>
                <p className="room-last-message" title={room.last_message}>
                  {room.last_message || 'No messages yet'}
                </p>
                {user.role === 'student' && (
                  <span className="room-role">{room.staff_role}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .chat-rooms {
          height: 100%;
        }

        .chat-rooms-loading,
        .no-chat-rooms,
        .chat-rooms-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
          color: #666;
        }

        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        .hint {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 5px;
        }

        .chat-rooms-error button {
          margin-top: 10px;
          padding: 6px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .rooms-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .room-item {
          display: flex;
          gap: 15px;
          padding: 15px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s;
          border: 1px solid #e0e0e0;
          background: white;
        }

        .room-item:hover {
          background: #f8f9ff;
          transform: translateX(5px);
        }

        .room-item.selected {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-color: #667eea;
        }

        .room-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          flex-shrink: 0;
        }

        .room-details {
          flex: 1;
          min-width: 0;
        }

        .room-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 5px;
        }

        .room-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .unread-badge {
          background: #ff4757;
          color: white;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
        }

        .room-time {
          font-size: 12px;
          color: #999;
          white-space: nowrap;
        }

        .room-last-message {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .room-role {
          display: inline-block;
          font-size: 12px;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatRooms;