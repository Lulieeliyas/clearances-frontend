import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000/api/";

const ChatSystem = ({ roomId, user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (roomId && user?.token) {
      loadChatMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(loadChatMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [roomId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE}chat/messages/${roomId}/`, {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      setMessages(response.data.messages);
      setRoomInfo(response.data);
      
      // Find other participant
      if (response.data.participants) {
        const other = response.data.participants.find(p => p.id !== user.id);
        setOtherParticipant(other);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      
      const response = await axios.post(`${API_BASE}chat/send/`, {
        room_id: roomId,
        content: newMessage
      }, {
        headers: {
          'Authorization': `Token ${user.token}`
        }
      });
      
      // Add new message to list
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
      
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message: ' + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="chat-system">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          {otherParticipant && (
            <>
              <div className="participant-avatar">
                {otherParticipant.profile_picture ? (
                  <img src={otherParticipant.profile_picture} alt={otherParticipant.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {otherParticipant.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="participant-details">
                <h3>{otherParticipant.name}</h3>
                <p className="participant-role">{otherParticipant.role?.replace('departmenthead', 'Department Head').replace('_', ' ').toUpperCase()}</p>
              </div>
            </>
          )}
        </div>
        {onClose && (
          <button className="chat-close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`message ${msg.is_own ? 'own-message' : 'other-message'}`}
            >
              <div className="message-content">
                <p>{msg.content}</p>
                {msg.file && (
                  <a href={msg.file} target="_blank" rel="noopener noreferrer" className="file-link">
                    📎 Attachment
                  </a>
                )}
                <span className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="message-input-area">
        <div className="input-wrapper">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            rows={3}
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="send-btn"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      <style jsx>{`
        .chat-system {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .participant-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(255,255,255,0.3);
        }

        .participant-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: white;
        }

        .participant-details h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .participant-role {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .chat-close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }

        .chat-close-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .messages-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f5f7fb;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .message {
          max-width: 70%;
          display: flex;
          flex-direction: column;
        }

        .own-message {
          align-self: flex-end;
        }

        .other-message {
          align-self: flex-start;
        }

        .message-content {
          padding: 12px 18px;
          border-radius: 18px;
          position: relative;
          word-wrap: break-word;
        }

        .own-message .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .other-message .message-content {
          background: white;
          color: #333;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .message-content p {
          margin: 0 0 8px 0;
          line-height: 1.5;
        }

        .file-link {
          display: inline-block;
          margin-top: 8px;
          padding: 4px 12px;
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
          color: inherit;
          text-decoration: none;
          font-size: 12px;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.8;
          display: block;
          text-align: right;
        }

        .no-messages {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .message-input-area {
          padding: 20px;
          border-top: 1px solid #e0e0e0;
          background: white;
        }

        .input-wrapper {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .input-wrapper textarea {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          min-height: 60px;
          max-height: 120px;
          transition: border-color 0.3s;
        }

        .input-wrapper textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .input-wrapper textarea:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .send-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
          min-width: 80px;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-hint {
          font-size: 12px;
          color: #999;
          text-align: center;
        }

        .chat-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatSystem;