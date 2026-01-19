import React from 'react';
import './Message.css';

const Message = ({ username, text, isCurrentUser }) => {
  return (
    <div className={`message ${isCurrentUser ? 'current-user' : 'other-user'}`}>
      <span className="message-username">{username}:</span>
      <span className="message-text">{text}</span>
    </div>
  );
};

export default Message;