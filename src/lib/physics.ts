// Mochi UI Physics Engine
// Spring physics, state-driven animations, and haptic simulation

export interface SpringConfig {
  bounce: number;        // 0-100: elasticity
  duration: number;      // ms: perceptual duration
  tension?: number;      // auto-derived
  friction?: number;     // auto-derived
}

export interface ClayState {
  scale: number;
  shadowY: number;
  shadowBlur: number;
  translateY: number;
  rotateX: number;
  rotateY: number;
}

export const DEFAULT_SPRING: SpringConfig = {
  bounce: 40,
  duration: 400
};

// Derive physics parameters from designer-friendly inputs
export function derivePhysics(config: Partial<SpringConfig> = {}): Required<SpringConfig> {
  const bounce = config.bounce ?? DEFAULT_SPRING.bounce;
  const duration = config.duration ?? DEFAULT_SPRING.duration;

  return {
    bounce,
    duration,
    tension: config.tension ?? (300 - (bounce * 2)),
    friction: config.friction ?? (1000 / duration)
  };
}

// State machine for clay interaction lifecycle
export type ClayPhase = 'resting' | 'hovering' | 'pressing' | 'compressing' | 'releasing' | 'overshooting' | 'settling';

export interface StateTransition {
  from: ClayPhase;
  to: ClayPhase;
  duration: number;
  easing: string;
}

export const STATE_MACHINE: Record<ClayPhase, StateTransition[]> = {
  resting: [
    { from: 'resting', to: 'hovering', duration: 200, easing: 'ease-out' }
  ],
  hovering: [
    { from: 'hovering', to: 'pressing', duration: 100, easing: 'ease-in' },
    { from: 'hovering', to: 'resting', duration: 300, easing: 'ease-out' }
  ],
  pressing: [
    { from: 'pressing', to: 'compressing', duration: 50, easing: 'linear' }
  ],
  compressing: [
    { from: 'compressing', to: 'releasing', duration: 0, easing: 'none' } // Triggered on mouse up
  ],
  releasing: [
    { from: 'releasing', to: 'overshooting', duration: 150, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
  ],
  overshooting: [
    { from: 'overshooting', to: 'settling', duration: 250, easing: 'cubic-bezier(0.39, 0.24, 0.3, 1)' }
  ],
  settling: [
    { from: 'settling', to: 'resting', duration: 200, easing: 'ease-out' }
  ]
};

// Visual state targets for each phase
export const PHASE_TARGETS: Record<ClayPhase, Partial<ClayState>> = {
  resting: {
    scale: 1,
    shadowY: 8,
    shadowBlur: 16,
    translateY: 0,
    rotateX: 0,
    rotateY: 0
  },
  hovering: {
    scale: 1.02,
    shadowY: 12,
    shadowBlur: 24,
    translateY: -4,
    rotateX: -2,
    rotateY: 0
  },
  pressing: {
    scale: 0.98,
    shadowY: 2,
    shadowBlur: 4,
    translateY: 1,
    rotateX: 0,
    rotateY: 0
  },
  compressing: {
    scale: 0.92,
    shadowY: 0,
    shadowBlur: 0,
    translateY: 2,
    rotateX: 0,
    rotateY: 0
  },
  releasing: {
    scale: 0.95,
    shadowY: 4,
    shadowBlur: 8,
    translateY: -2,
    rotateX: 0,
    rotateY: 0
  },
  overshooting: {
    scale: 1.05,
    shadowY: 16,
    shadowBlur: 32,
    translateY: -8,
    rotateX: -1,
    rotateY: 0
  },
  settling: {
    scale: 1.01,
    shadowY: 10,
    shadowBlur: 20,
    translateY: -2,
    rotateX: 0,
    rotateY: 0
  }
};

// Haptic pattern generator
export interface HapticPattern {
  type: 'soft' | 'granular' | 'deep' | 'tick';
  intensity: number;     // 0-1
  duration: number;      // ms
  frequency?: number;    // Hz for granular
}

export function generateHaptic(phase: ClayPhase): HapticPattern | null {
  switch (phase) {
    case 'pressing':
      return { type: 'soft', intensity: 0.3, duration: 10 };
    case 'compressing':
      return { type: 'deep', intensity: 0.6, duration: 20 };
    case 'releasing':
      return { type: 'soft', intensity: 0.2, duration: 5 };
    case 'overshooting':
      return { type: 'soft', intensity: 0.4, duration: 15 };
    default:
      return null;
  }
}

// Shadow matrix builder
export function buildShadowMatrix(
  elevation: number,
  pressed: boolean = false,
  darkMode: boolean = false
): string {
  const opacity = darkMode ? 0.3 : 0.1;
  const reflectionOpacity = darkMode ? 0.05 : 0.8;

  if (pressed) {
    return `
      inset -10px -10px 20px rgba(0,0,0,${opacity * 2}),
      inset 0 4px 8px rgba(0,0,0,${opacity * 1.5}),
      inset 10px 10px 20px rgba(255,255,255,${reflectionOpacity * 0.5})
    `;
  }

  return `
    ${elevation}px ${elevation}px ${elevation * 2}px rgba(0,0,0,${opacity}),
    inset -10px -10px 20px rgba(0,0,0,${opacity / 2}),
    inset 10px 10px 20px rgba(255,255,255,${reflectionOpacity})
  `;
}

// Easing functions
export const EASINGS = {
  claySpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  claySettle: 'cubic-bezier(0.39, 0.24, 0.3, 1)',
  clayCompress: 'cubic-bezier(0.4, 0, 0.2, 1)',
  clayBreathe: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)'
};

// Animation sequencer
export class ClayAnimator {
  private element: HTMLElement;
  private currentPhase: ClayPhase = 'resting';
  private config: Required<SpringConfig>;
  private rafId: number | null = null;

  constructor(element: HTMLElement, config?: SpringConfig) {
    this.element = element;
    this.config = derivePhysics(config);
  }

  transition(to: ClayPhase): void {
    const transitions = STATE_MACHINE[this.currentPhase];
    const validTransition = transitions.find(t => t.to === to);

    if (!validTransition && this.currentPhase !== to) {
      console.warn(`Invalid transition: ${this.currentPhase} -> ${to}`);
      return;
    }

    this.currentPhase = to;
    const target = PHASE_TARGETS[to];

    // Apply haptic
    const haptic = generateHaptic(to);
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(haptic.duration);
    }

    // Animate to target
    this.animateTo(target, validTransition?.duration ?? 300);
  }

  private animateTo(target: Partial<ClayState>, duration: number): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);

    const start = performance.now();
    const initial = this.getCurrentState();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.springEasing(progress);

      const state: ClayState = {
        scale: this.lerp(initial.scale, target.scale ?? initial.scale, eased),
        shadowY: this.lerp(initial.shadowY, target.shadowY ?? initial.shadowY, eased),
        shadowBlur: this.lerp(initial.shadowBlur, target.shadowBlur ?? initial.shadowBlur, eased),
        translateY: this.lerp(initial.translateY, target.translateY ?? initial.translateY, eased),
        rotateX: this.lerp(initial.rotateX, target.rotateX ?? initial.rotateX, eased),
        rotateY: this.lerp(initial.rotateY, target.rotateY ?? initial.rotateY, eased)
      };

      this.applyState(state);

      if (progress < 1) {
        this.rafId = requestAnimationFrame(tick);
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private springEasing(t: number): number {
    const { tension, friction } = this.config;
    const damping = friction / (2 * Math.sqrt(tension));
    const frequency = Math.sqrt(tension - damping * damping);

    return 1 - Math.exp(-damping * t) * Math.cos(frequency * t);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private getCurrentState(): ClayState {
    const style = getComputedStyle(this.element);
    const transform = style.transform;

    // Parse transform matrix
    let scale = 1, translateY = 0, rotateX = 0, rotateY = 0;

    if (transform && transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/);
      if (matrix) {
        const values = matrix[1].split(',').map(Number);
        scale = Math.sqrt(values[0] * values[0] + values[1] * values[1]);
      }
    }

    return { scale, shadowY: 8, shadowBlur: 16, translateY, rotateX, rotateY };
  }

  private applyState(state: ClayState): void {
    const shadow = buildShadowMatrix(state.shadowY, state.scale < 0.98);

    this.element.style.transform = `
      perspective(1000px)
      translateY(${state.translateY}px)
      rotateX(${state.rotateX}deg)
      rotateY(${state.rotateY}deg)
      scale(${state.scale})
    `;
    this.element.style.boxShadow = shadow;
  }

  destroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}

// Gesture recognizer for 3D tilt
export function attachTiltEffect(element: HTMLElement, intensity: number = 10): () => void {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    element.style.transform = `
      perspective(1000px)
      rotateY(${x * intensity}deg)
      rotateX(${-y * intensity}deg)
      scale(1.02)
    `;
  };

  const handleMouseLeave = () => {
    element.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
    element.style.transition = 'transform 0.5s cubic-bezier(0.39, 0.24, 0.3, 1)';
  };

  const handleMouseEnter = () => {
    element.style.transition = 'transform 0.1s ease-out';
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);
  element.addEventListener('mouseenter', handleMouseEnter);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
    element.removeEventListener('mouseenter', handleMouseEnter);
  };
}

// Ambient floating animation
export function createAmbientFloat(
  element: HTMLElement, 
  amplitude: number = 8, 
  period: number = 6000
): () => void {
  let startTime = performance.now();
  let rafId: number;

  const animate = (now: number) => {
    const elapsed = now - startTime;
    const progress = (elapsed % period) / period;

    const y = Math.sin(progress * Math.PI * 2) * amplitude;
    const rotate = Math.sin(progress * Math.PI * 2 + Math.PI / 4) * 0.5;

    element.style.transform = `translateY(${y}px) rotate(${rotate}deg)`;

    rafId = requestAnimationFrame(animate);
  };

  rafId = requestAnimationFrame(animate);

  return () => cancelAnimationFrame(rafId);
}
