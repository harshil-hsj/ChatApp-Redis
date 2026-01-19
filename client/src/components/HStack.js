import React from 'react';
import './Stack.css';

const HStack = ({ children, className = '', ...props }) => {
  return (
    <div className={`hstack ${className}`} {...props}>
      {children}
    </div>
  );
};

export default HStack;