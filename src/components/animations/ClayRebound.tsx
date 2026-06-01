import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform, type SpringOptions } from 'motion/react';
import { usePhysics, toSpringConfig, type PhysicsConfig } from './SpringPhysics';
import ClayButton from '../clay/ClayButton';

// The Perfect Clay Rebound Animation
// Implements the 3-phase motion from the document:
// 1. COMPRESSION → Initial press (squish down)
// 2. OVERSHOOT → Release bounce (elastic rebound past target)
// 3. SETTLE → Final rest (damped oscillation to rest)

export interface ClayReboundProps {
  children: React.ReactNode;
  physics?: Partial<PhysicsConfig>;
  onComplete?: () => void;
  trigger?: boolean;  // When true, triggers the rebound animation
}

// Rebound phase visualization (for debugging/showcase)
export const ReboundVisualizer: React.FC<{ physics?: Partial<PhysicsConfig> }> = ({ 
  physics: override 
}) => {
  const basePhysics = usePhysics();
  const physics = { ...basePhysics, ...override };
  const springConfig = toSpringConfig(physics);

  const progress = useMotionValue(0);
  const y = useSpring(0, springConfig);

  // Simulate the 3 phases
  const [phase, setPhase] = useState<'idle' | 'compression' | 'overshoot' | 'settle'>('idle');

  const triggerRebound = () => {
    // Phase 1: Compression (squish down)
    setPhase('compression');
    y.set(20); // Push down

    setTimeout(() => {
      // Phase 2: Overshoot (bounce past rest)
      setPhase('overshoot');
      y.set(-15); // Bounce up past rest

      setTimeout(() => {
        // Phase 3: Settle (damped to rest)
        setPhase('settle');
        y.set(0); // Return to rest

        setTimeout(() => setPhase('idle'), physics.duration);
      }, physics.duration * 0.4);
    }, physics.duration * 0.3);
  };

  // Generate SVG path for the rebound curve
  const curveY = useTransform(y, (latest) => latest);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 16, fontWeight: 600 }}>
        Phase: <span style={{ color: 'var(--mochi-mint)' }}>{phase}</span>
      </div>

      {/* Animated clay block */}
      <motion.div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'var(--mochi-mint)',
          y: curveY,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          marginBottom: 32,
        }}
      />

      {/* Rebound curve visualization */}
      <svg width="400" height="200" viewBox="0 0 400 200">
        {/* Resting line */}
        <line x1="0" y1="100" x2="400" y2="100" stroke="#ddd" strokeDasharray="5,5" />

        {/* Phase labels */}
        <text x="50" y="180" fontSize="12" fill="#666">Compression</text>
        <text x="180" y="180" fontSize="12" fill="#666">Overshoot</text>
        <text x="320" y="180" fontSize="12" fill="#666">Settle</text>

        {/* Animated curve */}
        <motion.path
          d="M 0 100 Q 50 150 100 100 Q 150 50 200 100 Q 250 80 300 100 Q 350 95 400 100"
          fill="none"
          stroke="var(--mochi-mint)"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{
            pathLength: phase === 'idle' ? 0 : 1,
          }}
          transition={{ duration: physics.duration / 1000 }}
        />
      </svg>

      <ClayButton onClick={triggerRebound} colorway="mint">
        Trigger Rebound
      </ClayButton>
    </div>
  );
};

// Main ClayRebound wrapper component
export const ClayRebound: React.FC<ClayReboundProps> = ({
  children,
  physics: override,
  onComplete,
  trigger = false,
}) => {
  const basePhysics = usePhysics();
  const physics = { ...basePhysics, ...override };
  const springConfig = toSpringConfig(physics);

  const scaleY = useSpring(1, springConfig);
  const scaleX = useSpring(1, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    if (trigger) {
      // Compression: squish vertically, expand horizontally
      scaleY.set(0.85);
      scaleX.set(1.05);
      y.set(4);

      const timer1 = setTimeout(() => {
        // Overshoot: stretch vertically, compress horizontally
        scaleY.set(1.08);
        scaleX.set(0.96);
        y.set(-6);

        const timer2 = setTimeout(() => {
          // Settle: return to normal
          scaleY.set(1);
          scaleX.set(1);
          y.set(0);
          onComplete?.();
        }, physics.duration * 0.5);

        return () => clearTimeout(timer2);
      }, physics.duration * 0.3);

      return () => clearTimeout(timer1);
    }
  }, [trigger, physics, scaleY, scaleX, y, onComplete]);

  return (
    <motion.div
      style={{
        scaleY,
        scaleX,
        y,
        originY: 0.5,
        originX: 0.5,
      }}
    >
      {children}
    </motion.div>
  );
};

export default ClayRebound;
