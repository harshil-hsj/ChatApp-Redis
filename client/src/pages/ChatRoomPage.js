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
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const username = localStorage.getItem('username');
  const id = localStorage.getItem('id');
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!username || !id) {
      navigate('/');
      return;
    }
  
    const loadInitialMessages = async () => {
      try {
        console.log("ehh")
        const response = await chatService.getMessages(0);
        const msgs = response.data.messages;
  
        setMessages(msgs);
  
        if (msgs.length > 0) {
          setLastTimestamp(msgs[msgs.length - 1].timestamp);
        }
      } catch (err) {
        console.error("Initial fetch failed", err);
      }
    };
  
    loadInitialMessages();
  }, [username, id]);

  useEffect(() => {
    if (!lastTimestamp) return;
  
    const interval = setInterval(async () => {
      try {
        const response = await chatService.getMessages(lastTimestamp);
        const newMessages = response.data.messages;
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
          setLastTimestamp(newMessages[newMessages.length-1].timestamp);
        }
      } catch (err) {
        console.error("Polling failed", err);
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [lastTimestamp]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && username) {
      try {
        await chatService.postMessage({ id, username, message: newMessage.trim() });
        setNewMessage('');
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
          localStorage.removeItem('id');
          navigate('/');
        }}>Logout</Button>
      </HStack>
      <VStack className="messages-container">
        {messages.map((msg, index) => (
          <Message key={index} username={msg.username} text={msg.message} isCurrentUser={msg.username === username && id === msg.id}  timestamp={new Date(msg.timestamp).toLocaleString()}/>
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