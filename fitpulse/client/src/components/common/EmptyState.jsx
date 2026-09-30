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
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 mb-4">
          <Icon className="w-8 h-8 text-emerald-600" />
        </div>
      )}
      <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};
