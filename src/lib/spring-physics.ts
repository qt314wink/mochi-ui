/**
 * MOCHI UI — Spring Physics Engine v2.0
 *
 * Real mass-spring-damper physics for all animations.
 * Integrates with React via useSpring hook.
 */

export interface SpringConfig {
  /** Mass of the object. Higher = heavier, slower response. Default: 1 */
  mass: number;
  /** Spring stiffness. Higher = snappier. Default: 280 */
  tension: number;
  /** Damping coefficient. Higher = less oscillation. Default: 24 */
  friction: number;
  /** Precision threshold for stopping. Default: 0.001 */
  precision?: number;
  /** Initial velocity. Default: 0 */
  initialVelocity?: number;
  /** Clamp output to prevent extreme overshoot. Default: false */
  clamp?: boolean;
}

export interface SpringState {
  value: number;
  velocity: number;
}

export const DEFAULT_SPRING: Required<SpringConfig> = {
  mass: 1,
  tension: 280,
  friction: 24,
  precision: 0.001,
  initialVelocity: 0,
  clamp: false,
};

export const SPRING_PRESETS = {
  gentle:    { mass: 1.5, tension: 120, friction: 28 },
  snappy:    { mass: 0.8, tension: 400, friction: 22 },
  bouncy:    { mass: 1.2, tension: 350, friction: 14 },
  heavy:     { mass: 2.5, tension: 200, friction: 32 },
  quick:     { mass: 0.5, tension: 500, friction: 30 },
  dramatic:  { mass: 3.0, tension: 100, friction: 20 },
} as const;

export type SpringPresetName = keyof typeof SPRING_PRESETS;

export class SpringPhysics {
  private config: Required<SpringConfig>;
  private state: SpringState;
  private target: number = 0;
  private animationId: number | null = null;
  private callbacks = new Set<(value: number, velocity: number) => void>();
  public isAnimating = false;

  constructor(config: Partial<SpringConfig> = {}) {
    this.config = { ...DEFAULT_SPRING, ...config };
    this.state = { value: 0, velocity: this.config.initialVelocity };
  }

  animateTo(target: number, immediate = false): void {
    this.target = target;
    if (immediate) {
      this.state = { value: target, velocity: 0 };
      this.notify();
      return;
    }
    if (!this.isAnimating) this.start();
  }

  setValue(value: number): void {
    this.state = { value, velocity: 0 };
    this.notify();
  }

  getValue(): number { return this.state.value; }
  getVelocity(): number { return this.state.velocity; }

  subscribe(cb: (value: number, velocity: number) => void): () => void {
    this.callbacks.add(cb);
    cb(this.state.value, this.state.velocity);
    return () => this.callbacks.delete(cb);
  }

  updateConfig(config: Partial<SpringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  stop(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.animationId = null;
    this.isAnimating = false;
  }

  /**
   * Compute spring position analytically at time t.
   * Useful for pre-computing keyframes or gesture projection.
   */
  static computeAtTime(t: number, from: number, to: number, config: SpringConfig): number {
    const { mass, tension, friction } = { ...DEFAULT_SPRING, ...config };
    const d = from - to;
    const dampingRatio = friction / (2 * Math.sqrt(mass * tension));
    const w0 = Math.sqrt(tension / mass);

    if (dampingRatio < 1) {
      const wd = w0 * Math.sqrt(1 - dampingRatio ** 2);
      const env = Math.exp(-dampingRatio * w0 * t);
      return to + env * d * (Math.cos(wd * t) + (dampingRatio * w0 / wd) * Math.sin(wd * t));
    } else if (dampingRatio === 1) {
      return to + Math.exp(-w0 * t) * d * (1 + w0 * t);
    } else {
      const r1 = -w0 * (dampingRatio - Math.sqrt(dampingRatio ** 2 - 1));
      const r2 = -w0 * (dampingRatio + Math.sqrt(dampingRatio ** 2 - 1));
      const c2 = (d * r1) / (r1 - r2);
      const c1 = d - c2;
      return to + c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
    }
  }

  private notify(): void {
    this.callbacks.forEach(cb => cb(this.state.value, this.state.velocity));
  }

  private start(): void {
    this.isAnimating = true;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.064);
      lastTime = now;

      const { mass, tension, friction, precision } = this.config;
      const displacement = this.state.value - this.target;
      const acceleration = (-tension * displacement - friction * this.state.velocity) / mass;

      this.state.velocity += acceleration * dt;
      this.state.value += this.state.velocity * dt;

      this.notify();

      if (Math.abs(displacement) < precision && Math.abs(this.state.velocity) < precision) {
        this.state = { value: this.target, velocity: 0 };
        this.notify();
        this.isAnimating = false;
        this.animationId = null;
        return;
      }

      this.animationId = requestAnimationFrame(tick);
    };

    this.animationId = requestAnimationFrame(tick);
  }
}

/**
 * React hook for spring-animated values.
 *
 * @example
 * const scale = useSpring(isPressed ? 0.95 : 1, SPRING_PRESETS.snappy);
 */
import { useEffect, useRef, useState } from 'react';

export function useSpring(target: number, config: Partial<SpringConfig> = {}): number {
  const springRef = useRef<SpringPhysics | null>(null);
  const [value, setValue] = useState(target);

  if (!springRef.current) {
    springRef.current = new SpringPhysics(config);
    springRef.current.setValue(target);
  }

  useEffect(() => {
    const spring = springRef.current!;
    spring.updateConfig(config);
    spring.animateTo(target);
    return spring.subscribe((v) => setValue(v));
  }, [target]);

  return value;
}

/**
 * React hook for spring-animated 2D points (e.g. cursor tracking).
 */
export function useSpring2D(
  target: { x: number; y: number },
  config: Partial<SpringConfig> = {}
): { x: number; y: number } {
  const x = useSpring(target.x, config);
  const y = useSpring(target.y, config);
  return { x, y };
}
