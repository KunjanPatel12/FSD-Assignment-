import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/fitpulse-logo.png';

export const Logo = ({
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  showText = true,
  to = '/',
  className = '',
  textClassName = '',
}) => {
  const sizeMap = {
    sm: {
      img: 'w-8 h-8 rounded-lg',
      text: 'text-lg',
    },
    md: {
      img: 'w-9 h-9 rounded-lg',
      text: 'text-xl',
    },
    lg: {
      img: 'w-14 h-14 rounded-xl',
      text: 'text-2xl',
    },
    xl: {
      img: 'w-16 h-16 rounded-xl',
      text: 'text-3xl',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src={logoImg}
        alt="FitPulse logo"
        className={`${currentSize.img} object-contain bg-black shadow-sm shrink-0`}
        loading="eager"
      />
      {showText && (
        <span
          className={`font-bold text-slate-900 tracking-tight ${currentSize.text} ${textClassName}`}
        >
          FitPulse
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
