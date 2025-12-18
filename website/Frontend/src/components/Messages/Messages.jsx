import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { messageAPI } from '../../services/api';
import StudentSidebar from '../Shared/StudentSidebar';
import TutorSidebar from '../Shared/TutorSidebar';
import { useUser } from '../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './Messages.css';

const Messages = () => {
  const { isTutor } = useUser();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchConversations();

    // Check if we need to open a specific conversation
    if (location.state?.otherUserId && location.state?.bookingId) {
      openConversationWithUser(location.state.otherUserId, location.state.bookingId);
    }
  }, [location.state]);

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
      setError('Failed to load conversations');
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
      // Refresh conversations to update unread count
      await fetchConversations();
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
            
            {!loading && conversations.length === 0 && (
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
          <div className="message-thread">
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
                    return (
                      <div
                        key={msg.id}
                        className={`message-bubble ${isSentByMe ? 'sent' : 'received'}`}
                      >
                        {!isSentByMe && (
                          <div className="message-sender">{msg.senderName}</div>
                        )}
                        <div className="message-content">{msg.content}</div>
                        <div className="message-time">{formatMessageTime(msg.createdAt)}</div>
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

