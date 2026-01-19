import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VStack from '../components/VStack';
import HStack from '../components/HStack';
import Button from '../components/Button';
import Input from '../components/Input';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      navigate('/chat');
    }
  };

  return (
    <VStack className="login-page">
      <h1>Welcome to Chat App</h1>
      <HStack className="login-form">
        <Input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
        />
        <Button onClick={handleLogin}>Join Chat</Button>
      </HStack>
    </VStack>
  );
};

export default LoginPage;