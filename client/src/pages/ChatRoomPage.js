import React, { useState, useEffect, useRef } from 'react';
import VStack from '../components/VStack';
import HStack from '../components/HStack';
import Button from '../components/Button';
import Input from '../components/Input';
import Message from '../components/Message';
import * as chatService from '../services/chatService';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatRoomPage.css';

const ChatRoomPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }
    fetchMessages();
    // Polling for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [username, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await chatService.getMessages();
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && username) {
      try {
        await chatService.postMessage({ username, message: newMessage.trim() });
        setNewMessage('');
        fetchMessages();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <VStack className="chat-room-page">
      <HStack className="chat-header">
        <h2>Chat Room - {username}</h2>
        <Button onClick={() => {
          localStorage.removeItem('username');
          navigate('/');
        }}>Logout</Button>
      </HStack>
      <VStack className="messages-container">
        {messages.map((msg, index) => (
          <Message key={index} username={msg.username} text={msg.message} isCurrentUser={msg.username === username} />
        ))}
        <div ref={messagesEndRef} />
      </VStack>
      <HStack className="message-input-container">
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </HStack>
    </VStack>
  );
};

export default ChatRoomPage;