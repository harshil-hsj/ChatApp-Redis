import React from 'react';
import './Input.css';

const Input = ({ type, placeholder, value, onChange, className = '', ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`input ${className}`}
      {...props}
    />
  );
};

export default Input;