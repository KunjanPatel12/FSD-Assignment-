import React from 'react';

export const Card = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
