import React from 'react';
import { Activity, ShieldAlert, Heart, Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 mt-auto text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">FitPulse</p>
            <p className="text-[11px] text-slate-500">
              Personalized Gym & Fitness Consistency Management Platform
            </p>
          </div>
        </div>

        {/* Educational disclaimer notice */}
        <div className="max-w-xl text-center md:text-left text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span className="font-semibold text-amber-400 inline-flex items-center gap-1 mr-1">
            <ShieldAlert className="w-3.5 h-3.5 inline" /> Educational Project Notice:
          </span>
          FitPulse workout routines and nutrition listings are algorithmically generated for
          educational tracking. Always consult a qualified medical or healthcare professional before
          beginning any rigorous physical exercise program or dietary supplementation.
        </div>

        <div className="text-center md:text-right text-[11px] text-slate-400">
          <p>College Capstone Engineering Project</p>
          <p className="mt-1 text-slate-400 font-mono">React • Node.js • MongoDB • Tailwind</p>
        </div>
      </div>
    </footer>
  );
};
