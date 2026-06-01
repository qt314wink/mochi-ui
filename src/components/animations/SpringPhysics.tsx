import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SpringOptions } from 'motion/react';

// Spring Physics Configuration System
// Based on document: Bounce (elasticity) + Perceptual Duration (speed)
// Using Motion v12 API (formerly Framer Motion)

export interface PhysicsConfig {
  bounce: number;      // 0-1, how elastic the clay feels
  duration: number;    // ms, how fast interaction resolves
  mass?: number;       // default 1
}

const defaultPhysics: PhysicsConfig = {
  bounce: 0.4,
  duration: 300,
  mass: 1,
};

const PhysicsContext = createContext<PhysicsConfig>(defaultPhysics);

export const PhysicsProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<PhysicsConfig>;
}> = ({ children, config }) => {
  const [physics] = useState({ ...defaultPhysics, ...config });
  return (
    <PhysicsContext.Provider value={physics}>
      {children}
    </PhysicsContext.Provider>
  );
};

export const usePhysics = () => useContext(PhysicsContext);

// Convert Mochi physics to Motion spring config
export const toSpringConfig = (physics: PhysicsConfig): SpringOptions => ({
  stiffness: Math.max(50, 300 - (physics.bounce * 250)),
  damping: Math.max(5, 1000 / physics.duration),
  mass: physics.mass || 1,
});

// Preset physics configurations
export const physicsPresets = {
  // High elasticity - jelly-like
  jelly: { bounce: 0.8, duration: 500, mass: 1.2 },

  // Medium elasticity - standard clay
  clay: { bounce: 0.4, duration: 300, mass: 1 },

  // Low elasticity - firm clay
  firm: { bounce: 0.15, duration: 200, mass: 0.8 },

  // Snappy - quick response
  snappy: { bounce: 0.2, duration: 150, mass: 0.6 },

  // Luxurious - slow, elegant
  luxurious: { bounce: 0.5, duration: 600, mass: 1.5 },

  // Bouncy - playful
  bouncy: { bounce: 0.9, duration: 400, mass: 1 },
};

export type PhysicsPreset = keyof typeof physicsPresets;

// Haptic feedback system
export interface HapticConfig {
  enabled: boolean;
  intensity: 'soft' | 'medium' | 'firm' | 'custom';
  pattern?: number[];
}

export const triggerHaptic = (config: HapticConfig = { enabled: true, intensity: 'soft' }) => {
  if (!config.enabled || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  const patterns = {
    soft: [10],
    medium: [15, 5, 10],
    firm: [20, 5, 15, 5, 10],
    custom: config.pattern || [10],
  };

  navigator.vibrate(patterns[config.intensity]);
};

// State machine for clay interactions
export type ClayState = 'default' | 'hover' | 'pressed' | 'dragging' | 'settling';

export const useClayState = (initial: ClayState = 'default') => {
  const [state, setState] = useState<ClayState>(initial);
  const [previousState, setPreviousState] = useState<ClayState>(initial);

  const transition = useCallback((newState: ClayState) => {
    setPreviousState(state);
    setState(newState);
  }, [state]);

  return {
    state,
    previousState,
    transition,
    is: (s: ClayState) => state === s,
  };
};

export default PhysicsContext;
