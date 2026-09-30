import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600',
    accent:
      'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5 font-medium',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
