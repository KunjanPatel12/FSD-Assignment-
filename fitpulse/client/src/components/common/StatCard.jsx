import React from 'react';
import { Card } from './Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'emerald', // emerald | cyan | amber | purple
}) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badge: 'text-emerald-400',
    },
    cyan: {
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      badge: 'text-cyan-400',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      badge: 'text-amber-400',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      badge: 'text-purple-400',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <Card hoverEffect className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {trend && (
              <span className={`text-xs font-medium ${scheme.badge}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${scheme.bg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};
