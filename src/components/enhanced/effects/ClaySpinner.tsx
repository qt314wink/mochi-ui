import React from 'react';
import { motion } from 'motion/react';

export const ClaySpinner: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div style={{
      height: '100%',
      minHeight: 300,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      color: 'var(--text-secondary)',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: `var(--mochi-${['mint', 'baby-blue', 'lavender'][i]})`,
              boxShadow: 'var(--shadow-clay)',
            }}
            animate={{
              y: [0, -16, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ fontSize: 14, fontWeight: 500 }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export default ClaySpinner;
