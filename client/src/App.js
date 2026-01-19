import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatRoomPage from './pages/ChatRoomPage';
import './App.css'; // Keep some basic global styles if needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/chat" element={<ChatRoomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
