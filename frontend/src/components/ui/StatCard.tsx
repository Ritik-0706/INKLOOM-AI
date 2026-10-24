import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  gradient: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  gradient
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-inkloom-border shadow-card-soft hover:shadow-card-hover transition-all duration-300 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-inkloom-muted uppercase tracking-wider block mb-1">
            {label}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-inkloom-text tracking-tight">
            {value}
          </div>
          {change && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
              <span className={trend === 'up' ? 'text-inkloom-success' : trend === 'down' ? 'text-inkloom-error' : 'text-inkloom-muted'}>
                {change}
              </span>
              <span className="text-[11px] text-inkloom-muted font-normal">vs last month</span>
            </div>
          )}
        </div>

        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Decorative subtle background wave */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-tr ${gradient} opacity-5 blur-xl pointer-events-none`} />
    </div>
  );
};
