import React from 'react';

export const Badge = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
}) => {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cyan: 'bg-teal-50 text-teal-700 border-teal-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variants[variant] || variants.slate} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
