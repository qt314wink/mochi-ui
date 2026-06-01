import React from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'motion/react';

export interface FloatingContainerProps {
  children: React.ReactNode;
  amplitude?: number;      // Floating height range
  frequency?: number;      // Speed of float
  rotation?: number;       // Subtle rotation range
  delay?: number;          // Animation delay
  className?: string;
}

// Ambient floating animation - "breathing" clay effect
export const FloatingContainer: React.FC<FloatingContainerProps> = ({
  children,
  amplitude = 8,
  frequency = 0.5,
  rotation = 2,
  delay = 0,
  className = '',
}) => {
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  // Custom animation frame for smooth, organic floating
  useAnimationFrame((time) => {
    const t = (time / 1000 + delay) * frequency;

    // Sine wave for vertical float
    const floatY = Math.sin(t * Math.PI * 2) * amplitude;
    y.set(floatY);

    // Subtle rotation offset
    const rot = Math.sin(t * Math.PI * 2 * 0.7) * rotation;
    rotate.set(rot);
  });

  // Shadow gets lighter when floating higher
  const shadowOpacity = useTransform(
    y,
    [-amplitude, amplitude],
    [0.15, 0.05]
  );

  const shadowY = useTransform(
    y,
    [-amplitude, amplitude],
    [20, 4]
  );

  const boxShadow = useTransform(
    [shadowOpacity, shadowY],
    ([opacity, sy]) => `
      0 ${sy}px ${(sy as number) * 2}px rgba(0,0,0,${opacity}),
      inset -10px -10px 20px rgba(0,0,0,0.05),
      inset 10px 10px 20px rgba(255,255,255,0.8)
    `
  );

  return (
    <motion.div
      className={className}
      style={{
        y,
        rotate,
        boxShadow,
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  );
};

// Staggered floating group for multiple elements
export interface FloatingGroupProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  baseAmplitude?: number;
  className?: string;
}

export const FloatingGroup: React.FC<FloatingGroupProps> = ({
  children,
  staggerDelay = 0.2,
  baseAmplitude = 6,
  className = '',
}) => {
  return (
    <div className={className} style={{ display: 'flex', gap: 24 }}>
      {React.Children.map(children, (child, index) => (
        <FloatingContainer
          amplitude={baseAmplitude + (index % 2 === 0 ? 2 : -2)}
          frequency={0.4 + (index * 0.1)}
          rotation={1 + (index * 0.5)}
          delay={index * staggerDelay}
        >
          {child}
        </FloatingContainer>
      ))}
    </div>
  );
};

// Parallax clay layer for depth
export interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;  // 0 = static, 1 = moves with mouse
  className?: string;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed = 0.5,
  className = '',
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const x = useTransform(mouseX, (val) => val * speed);
  const y = useTransform(mouseY, (val) => val * speed);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / 20);
    mouseY.set((e.clientY - centerY) / 20);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

export default FloatingContainer;
