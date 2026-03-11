import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { messageAPI } from '../../services/api';
import StudentSidebar from '../Shared/StudentSidebar';
import TutorSidebar from '../Shared/TutorSidebar';
import { useUser } from '../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowLeft, faEdit, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Messages.css';

const POLL_MESSAGES_INTERVAL = 3000;
const POLL_CONVERSATIONS_INTERVAL = 10000;

const Messages = () => {
  const { isTutor } = useUser();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const messagesRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const pollMessages = useCallback(async () => {
    const conv = selectedConversationRef.current;
    if (!conv) return;
    try {
      const response = await messageAPI.getConversationMessages(conv.id);
      const newMessages = response.data;
      const hadNewMessages = newMessages.length !== messagesRef.current.length;
      setMessages(newMessages);
      if (hadNewMessages) {
        await messageAPI.markAsRead(conv.id);
      }
    } catch (err) {
      // Silent fail on poll — don't disrupt UI
    }
  }, []);

  const pollConversations = useCallback(async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data);
    } catch (err) {
      // Silent fail on poll
    }
  }, []);

  useEffect(() => {
    fetchConversations();

    if (location.state?.otherUserId && location.state?.bookingId) {
      openConversationWithUser(location.state.otherUserId, location.state.bookingId);
    }

    const convInterval = setInterval(pollConversations, POLL_CONVERSATIONS_INTERVAL);
    return () => clearInterval(convInterval);
  }, [location.state, pollConversations]);

  useEffect(() => {
    if (!selectedConversation) return;
    const msgInterval = setInterval(pollMessages, POLL_MESSAGES_INTERVAL);
    return () => clearInterval(msgInterval);
  }, [selectedConversation, pollMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversations();
      setConversations(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching conversations:', err);
      if (err.response?.status === 401 || err.response?.status === 403 || !localStorage.getItem('token')) {
        setError('SESSION_EXPIRED');
      } else {
        setError('Failed to load conversations');
      }
    } finally {
      setLoading(false);
    }
  };

  const openConversationWithUser = async (otherUserId, bookingId) => {
    try {
      const response = await messageAPI.getOrCreateConversation(otherUserId, bookingId);
      const conversation = response.data;
      setSelectedConversation(conversation);
      await loadConversationMessages(conversation.id);
    } catch (err) {
      console.error('Error opening conversation:', err);
      setError('Failed to open conversation');
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const response = await messageAPI.getConversationMessages(conversationId);
      setMessages(response.data);
      await messageAPI.markAsRead(conversationId);
      await pollConversations();
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadConversationMessages(conversation.id);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await messageAPI.sendMessage(
        selectedConversation.otherUserId,
        newMessage,
        selectedConversation.bookingId
      );
      
      setNewMessage('');
      // Reload messages
      await loadConversationMessages(selectedConversation.id);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const startEditingMessage = (msg) => {
    setEditingMessageId(msg.id);
    setEditedContent(msg.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditedContent('');
  };

  const saveEditedMessage = async (messageId) => {
    if (!editedContent.trim()) {
      alert('Message cannot be empty');
      return;
    }

    try {
      await messageAPI.editMessage(messageId, editedContent);
      // Refresh messages
      await loadConversationMessages(selectedConversation.id);
      setEditingMessageId(null);
      setEditedContent('');
    } catch (err) {
      console.error('Error editing message:', err);
      alert('Failed to edit message: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await messageAPI.deleteMessage(messageId);
      // Refresh messages
      await loadConversationMessages(selectedConversation.id);
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatConversationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const Sidebar = isTutor ? TutorSidebar : StudentSidebar;

  return (
    <div className="messages-page">
      <Sidebar />
      
      <div className="messages-container">
        <div className="messages-header">
          <h1>Messages</h1>
        </div>

        <div className="messages-content">
          {/* Conversations List */}
          <div className="conversations-list">
            {loading && <div className="loading">Loading conversations...</div>}
            
            {!loading && error === 'SESSION_EXPIRED' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '15px' }}>🔒</div>
                <h3 style={{ color: '#333', marginBottom: '8px' }}>Session Expired</h3>
                <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>Please log back in to continue.</p>
                <button 
                  onClick={() => { localStorage.clear(); navigate('/login'); }}
                  style={{ padding: '10px 20px', backgroundColor: '#1A803D', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Log Back In
                </button>
              </div>
            )}

            {!loading && error && error !== 'SESSION_EXPIRED' && (
              <div className="error-message">{error}</div>
            )}
            
            {!loading && !error && conversations.length === 0 && (
              <div className="no-conversations">
                <p>No messages yet</p>
                <p className="hint">Start a conversation by clicking "Message {isTutor ? 'Student' : 'Tutor'}" on a lesson</p>
              </div>
            )}

            {!loading && conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => selectConversation(conv)}
              >
                <div className="conversation-avatar">
                  {conv.otherUserName.charAt(0).toUpperCase()}
                </div>
                <div className="conversation-details">
                  <div className="conversation-header-row">
                    <div className="conversation-name">{conv.otherUserName}</div>
                    <div className="conversation-time">
                      {formatConversationTime(conv.lastMessageTime || conv.createdAt)}
                    </div>
                  </div>
                  <div className="conversation-preview">
                    {conv.lastMessage || 'No messages yet'}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="unread-badge">{conv.unreadCount}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Thread */}
          <div className={`message-thread ${selectedConversation ? 'active' : ''}`}>
            {!selectedConversation ? (
              <div className="no-conversation-selected">
                <p>Select a conversation to start messaging</p>
              </div>
            ) : (
              <>
                <div className="thread-header">
                  <button 
                    className="back-button-mobile"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  <div className="thread-avatar">
                    {selectedConversation.otherUserName.charAt(0).toUpperCase()}
                  </div>
                  <div className="thread-info">
                    <div className="thread-name">{selectedConversation.otherUserName}</div>
                    <div className="thread-role">{selectedConversation.otherUserRole}</div>
                  </div>
                </div>

                <div className="messages-list">
                  {messages.map((msg) => {
                    const currentUserId = parseInt(localStorage.getItem('userId'));
                    const isSentByMe = msg.senderId === currentUserId;
                    const isEditing = editingMessageId === msg.id;
                    const isHovered = hoveredMessageId === msg.id;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`message-bubble ${isSentByMe ? 'sent' : 'received'}`}
                        onMouseEnter={() => setHoveredMessageId(msg.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                      >
                        {!isSentByMe && (
                          <div className="message-sender">{msg.senderName}</div>
                        )}
                        
                        {isEditing ? (
                          <div className="message-edit-mode">
                            <textarea
                              className="message-edit-input"
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  saveEditedMessage(msg.id);
                                } else if (e.key === 'Escape') {
                                  cancelEditing();
                                }
                              }}
                              autoFocus
                            />
                            <div className="message-edit-buttons">
                              <button 
                                className="message-edit-btn save-btn" 
                                onClick={() => saveEditedMessage(msg.id)}
                                title="Save (Enter)"
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                              <button 
                                className="message-edit-btn cancel-btn" 
                                onClick={cancelEditing}
                                title="Cancel (Esc)"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="message-content">{msg.content}</div>
                            <div className="message-footer">
                              <div className="message-time">
                                {formatMessageTime(msg.createdAt)}
                                {msg.isEdited && <span className="edited-indicator"> (edited)</span>}
                              </div>
                              {isSentByMe && isHovered && (
                                <div className="message-actions">
                                  <button 
                                    className="message-action-btn edit-btn" 
                                    onClick={() => startEditingMessage(msg)}
                                    title="Edit message"
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </button>
                                  <button 
                                    className="message-action-btn delete-btn" 
                                    onClick={() => deleteMessage(msg.id)}
                                    title="Delete message"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form className="message-input-form" onSubmit={sendMessage}>
                  <input
                    type="text"
                    className="message-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

