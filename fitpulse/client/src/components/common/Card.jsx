import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glow = null, // 'emerald' | 'amber' | 'cyan'
  ...props
}) => {
  let glowClass = '';
  if (glow === 'emerald') glowClass = 'hover:border-emerald-500/50 hover:shadow-emerald-500/10';
  if (glow === 'amber') glowClass = 'hover:border-amber-500/50 hover:shadow-amber-500/10';
  if (glow === 'cyan') glowClass = 'hover:border-cyan-500/50 hover:shadow-cyan-500/10';

  return (
    <div
      className={`bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl transition-all duration-300 ${
        hoverEffect ? 'hover:translate-y-[-2px] hover:border-slate-700/90' : ''
      } ${glowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
