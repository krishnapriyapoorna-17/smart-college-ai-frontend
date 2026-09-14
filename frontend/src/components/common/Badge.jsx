import React from 'react';

const Badge = ({
  children,
  variant = 'neutral', // 'pending' | 'processing' | 'completed' | 'action' | 'neutral'
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
