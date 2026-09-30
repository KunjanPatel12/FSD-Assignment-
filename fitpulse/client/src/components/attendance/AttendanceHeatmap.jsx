import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Check, Dumbbell, X, Calendar } from 'lucide-react';

export const AttendanceHeatmap = ({ dailyHistory = [], title = '30-Day Attendance Grid' }) => {
  if (!dailyHistory || dailyHistory.length === 0) {
    return null;
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h4 className="text-base font-bold text-white">{title}</h4>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span>Attended & Lifted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-600/70" />
            <span>Attended Gym</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
            <span>Rest / Open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-950 border border-dashed border-slate-800" />
            <span>Gym Closed</span>
          </div>
        </div>
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2 pt-2">
        {dailyHistory.map((day) => {
          let bg = 'bg-slate-800/80 border-slate-700/80 text-slate-400';
          let tooltip = `${day.dateKey} - Rest day`;

          if (!day.isGymOpen) {
            bg = 'bg-slate-950/60 border-slate-800/50 text-slate-600 border-dashed';
            tooltip = `${day.dateKey} - Gym Closed / Holiday`;
          } else if (day.attended && day.workedOut) {
            bg = 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/30';
            tooltip = `${day.dateKey} - Attended & Completed Workout`;
          } else if (day.attended) {
            bg = 'bg-teal-600 text-white border-teal-500';
            tooltip = `${day.dateKey} - Attended Gym`;
          }

          const dayNumber = day.dateKey.split('-')[2];

          return (
            <div
              key={day.dateKey}
              title={tooltip}
              className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-default hover:scale-105 ${bg}`}
            >
              <span className="text-[10px] font-mono font-medium opacity-80">
                {daysOfWeek[day.dayOfWeek]}
              </span>
              <span className="text-xs font-bold mt-0.5">{dayNumber}</span>
              {day.attended && (
                <Check className="w-3 h-3 mt-0.5" strokeWidth={3} />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
