import React, { createContext, useContext } from 'react';

export const physicsPresets = {
  clay:    { stiffness: 280, damping: 24, mass: 1.0 },
  bouncy:  { stiffness: 400, damping: 14, mass: 0.8 },
  snappy:  { stiffness: 500, damping: 28, mass: 0.6 },
  gentle:  { stiffness: 140, damping: 20, mass: 1.2 },
  stiff:   { stiffness: 700, damping: 40, mass: 0.5 },
} as const;

export type PhysicsPreset = keyof typeof physicsPresets;

export interface PhysicsConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

const PhysicsContext = createContext<PhysicsConfig>(physicsPresets.clay);

export interface PhysicsProviderProps {
  preset?: PhysicsPreset;
  config?: Partial<PhysicsConfig>;
  children: React.ReactNode;
}

export const PhysicsProvider: React.FC<PhysicsProviderProps> = ({
  preset = 'clay',
  config,
  children,
}) => {
  const base = physicsPresets[preset];
  const value: PhysicsConfig = config ? { ...base, ...config } : base;
  return (
    <PhysicsContext.Provider value={value}>
      {children}
    </PhysicsContext.Provider>
  );
};

export const usePhysics = () => useContext(PhysicsContext);

export default PhysicsProvider;
