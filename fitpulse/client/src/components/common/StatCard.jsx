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
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'text-emerald-700',
    },
    cyan: {
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
      badge: 'text-teal-700',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: 'text-amber-700',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'text-purple-700',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <Card className="relative">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
            {trend && (
              <span className={`text-xs font-medium ${scheme.badge}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
};
