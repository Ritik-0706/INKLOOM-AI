import React from 'react';
import { IssueSeverity, ContentStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: IssueSeverity | ContentStatus | 'primary' | 'secondary' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantStyles: Record<string, string> = {
    // Severities
    critical: 'bg-red-50 text-inkloom-error border-red-200/80 font-bold',
    high: 'bg-amber-50 text-amber-700 border-amber-200/80 font-semibold',
    medium: 'bg-blue-50 text-inkloom-secondary border-blue-200/80 font-medium',
    low: 'bg-emerald-50 text-inkloom-success border-emerald-200/80 font-medium',
    informational: 'bg-slate-100 text-inkloom-muted border-slate-200 font-medium',
    
    // Content Statuses
    draft: 'bg-slate-100 text-inkloom-muted border-slate-200',
    in_review: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold animate-pulse',
    changes_requested: 'bg-purple-50 text-inkloom-primary border-purple-200 font-semibold',
    approved: 'bg-emerald-50 text-inkloom-success border-emerald-200 font-bold',
    rejected: 'bg-red-50 text-inkloom-error border-red-200',
    archived: 'bg-gray-100 text-gray-500 border-gray-200',

    // Themes
    primary: 'bg-purple-50 text-inkloom-primary border-purple-200',
    secondary: 'bg-blue-50 text-inkloom-secondary border-blue-200',
    neutral: 'bg-slate-100 text-inkloom-text border-slate-200'
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border tracking-tight ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};
