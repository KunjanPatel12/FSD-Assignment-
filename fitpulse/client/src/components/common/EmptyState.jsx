import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
      {Icon && (
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-400 mb-4">
          <Icon className="w-10 h-10" />
        </div>
      )}
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};
