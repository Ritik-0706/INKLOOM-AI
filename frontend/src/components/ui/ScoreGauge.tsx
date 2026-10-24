import React from 'react';
import { motion } from 'framer-motion';

export const ScoreGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 120 }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 90) return { stroke: '#239C78', bg: 'text-emerald-500', glow: 'rgba(35, 156, 120, 0.25)' }; // Emerald
    if (s >= 75) return { stroke: '#478BFF', bg: 'text-blue-500', glow: 'rgba(71, 139, 255, 0.25)' };   // Blue
    if (s >= 60) return { stroke: '#F4B740', bg: 'text-amber-500', glow: 'rgba(244, 183, 64, 0.25)' };  // Amber
    return { stroke: '#E85C69', bg: 'text-rose-500', glow: 'rgba(232, 92, 105, 0.25)' };                // Coral Red
  };

  const { stroke, bg, glow } = getColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8E4F7"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Foreground animated score meter */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-inkloom-text leading-none tracking-tight">
          {score.toFixed(0)}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-inkloom-muted mt-0.5">
          Compliance
        </span>
      </div>
    </div>
  );
};
