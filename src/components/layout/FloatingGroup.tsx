import React from 'react';
import { FloatingContainer, FloatingContainerProps } from './FloatingContainer';

export interface FloatingGroupProps {
  children: React.ReactNode[];
  phaseOffset?: number;
  amplitude?: number;
  frequency?: number;
  style?: React.CSSProperties;
  className?: string;
}

export const FloatingGroup: React.FC<FloatingGroupProps> = ({
  children,
  phaseOffset = 0.3,
  amplitude = 6,
  frequency = 0.6,
  style,
  className,
}) => (
  <div style={{ display: 'contents', ...style }} className={className}>
    {React.Children.map(children, (child, i) => (
      <FloatingContainer
        key={i}
        amplitude={amplitude}
        frequency={frequency + i * phaseOffset * 0.1}
      >
        {child}
      </FloatingContainer>
    ))}
  </div>
);

export default FloatingGroup;
