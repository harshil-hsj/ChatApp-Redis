import React from 'react';
import './Stack.css';

const VStack = ({ children, className = '', ...props }) => {
  return (
    <div className={`vstack ${className}`} {...props}>
      {children}
    </div>
  );
};

export default VStack;