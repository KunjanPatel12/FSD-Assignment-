import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">{text}</p>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <p className="text-xs font-medium text-slate-500">{text}</p>
    </div>
  );
};
