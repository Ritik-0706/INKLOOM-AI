import React from 'react';
import { motion } from 'framer-motion';

export const FloatingShapes: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Primary Violet Orb */}
      <motion.div
        animate={{
          x: [0, 25, -20, 0],
          y: [0, -35, 15, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-[15%] w-72 h-72 rounded-full bg-gradient-to-tr from-inkloom-primary/25 to-inkloom-secondary/20 blur-3xl"
      />

      {/* Electric Blue Orb */}
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 40, -25, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-48 right-[10%] w-80 h-80 rounded-full bg-gradient-to-bl from-inkloom-secondary/25 to-inkloom-highlight/20 blur-3xl"
      />

      {/* Coral Glow Accent */}
      <motion.div
        animate={{
          x: [0, 20, -15, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 left-[25%] w-64 h-64 rounded-full bg-gradient-to-r from-inkloom-accent/20 to-pink-400/20 blur-3xl"
      />

      {/* Subtle Floating Geometric Chips */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/4 left-[8%] w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md border border-inkloom-border/80 shadow-card-soft"
      />

      <motion.div
        animate={{ y: [15, -15, 15], rotate: [0, -90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 right-[7%] w-10 h-10 rounded-full bg-gradient-to-tr from-inkloom-highlight to-emerald-400 opacity-60 shadow-lg"
      />

      <motion.div
        animate={{ y: [-8, 12, -8], rotate: [45, 90, 45] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/3 right-[20%] w-8 h-8 rounded-lg bg-gradient-to-br from-inkloom-accent to-pink-500 opacity-50 shadow-md"
      />
    </div>
  );
};
