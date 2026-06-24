// Spring physics
export { SPRING_PRESETS, DEFAULT_CONFIG } from './spring-physics';
export type { SpringConfig, SpringState } from './spring-physics';

// Spring hooks (all Framer Motion powered)
export {
  useSpring,
  useSprings,
  useSpringTransform,
  useScrollSpring,
  useMagnetic,
  useSquish,
  useStaggeredReveal,
  useReducedMotion,
} from './spring-hooks';
export type { SpringHandle, TransformState, SpringTransformResult } from './spring-hooks';

// Utility hooks
export { useCountUp }      from './useCountUp';
export { useActiveSection } from './useActiveSection';
export { useToast }        from './useToast';
