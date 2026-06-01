import React from 'react';
import { motion } from 'motion/react';

export interface BentoGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export interface BentoItemProps {
  children: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
  delay?: number;
}

// Bento Grid - Japanese bento box inspired layout
export const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  columns = 4,
  gap = 24,
  className = '',
}) => {
  return (
    <motion.div
      className={`bento-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridAutoRows: 'minmax(120px, auto)',
        gap,
        padding: gap,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

// Bento Item with entrance animation
export const BentoItem: React.FC<BentoItemProps> = ({
  children,
  colSpan = 1,
  rowSpan = 1,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      className={className}
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        minHeight: rowSpan > 1 ? 240 : 120,
      }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
};

// Predefined bento layouts
export const BentoLayouts = {
  // Dashboard layout from document
  dashboard: [
    { colSpan: 1, rowSpan: 2 },  // Overview Stats (tall)
    { colSpan: 2, rowSpan: 1 },  // Header & Search (wide)
    { colSpan: 1, rowSpan: 1 },  // Upcoming Events
    { colSpan: 1, rowSpan: 1 },  // Recent Notifications
  ],

  // Gallery layout
  gallery: [
    { colSpan: 2, rowSpan: 2 },  // Hero image
    { colSpan: 1, rowSpan: 1 },
    { colSpan: 1, rowSpan: 1 },
    { colSpan: 2, rowSpan: 1 },  // Wide caption
  ],

  // Stats layout
  stats: [
    { colSpan: 1, rowSpan: 1 },
    { colSpan: 1, rowSpan: 1 },
    { colSpan: 1, rowSpan: 1 },
    { colSpan: 1, rowSpan: 1 },
    { colSpan: 2, rowSpan: 2 },  // Main chart
    { colSpan: 2, rowSpan: 1 },  // Summary
  ],
};

export default BentoGrid;
