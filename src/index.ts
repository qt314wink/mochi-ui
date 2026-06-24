// ── Clay Primitives ──────────────────────────────────────────────────────────
export { ClayButton }           from './components/clay/ClayButton';
export type { ClayButtonProps } from './components/clay/ClayButton';

export { ClayCard }             from './components/clay/ClayCard';
export type { ClayCardProps }   from './components/clay/ClayCard';

export { ClayModal }            from './components/clay/ClayModal';
export type { ClayModalProps }  from './components/clay/ClayModal';

export { ClaySkeleton }             from './components/clay/ClaySkeleton';
export type { ClaySkeletonProps }   from './components/clay/ClaySkeleton';

export { ClayTooltip }              from './components/clay/ClayTooltip';
export type { ClayTooltipProps }    from './components/clay/ClayTooltip';

export { ClaySlider }               from './components/clay/ClaySlider';
export type { ClaySliderProps }     from './components/clay/ClaySlider';

export { ClayToggle }               from './components/clay/ClayToggle';
export type { ClayToggleProps }     from './components/clay/ClayToggle';

export { ClayInput }                from './components/clay/ClayInput';
export type { ClayInputProps }      from './components/clay/ClayInput';

export { ClayBadge }                from './components/clay/ClayBadge';
export type { ClayBadgeProps }      from './components/clay/ClayBadge';

export { ClayAvatar }               from './components/clay/ClayAvatar';
export type { ClayAvatarProps }     from './components/clay/ClayAvatar';

export { ClayProgress }             from './components/clay/ClayProgress';
export type { ClayProgressProps }   from './components/clay/ClayProgress';

export { ClaySegmentedControl }             from './components/clay/ClaySegmentedControl';
export type { ClaySegmentedControlProps }   from './components/clay/ClaySegmentedControl';

export { ClayChartBar }             from './components/clay/ClayChartBar';
export type { ClayChartBarProps }   from './components/clay/ClayChartBar';

// ── Phase 2 Components ───────────────────────────────────────────────────────
export { ClayToast, useToast }      from './components/clay/ClayToast';
export type { ToastItem, ToastVariant, ClayToastProps } from './components/clay/ClayToast';

export { ClayCommandPalette }       from './components/clay/ClayCommandPalette';
export type { CommandItem, ClayCommandPaletteProps } from './components/clay/ClayCommandPalette';

export { ClayDataTable }            from './components/clay/ClayDataTable';
export type { TableColumn, ClayDataTableProps } from './components/clay/ClayDataTable';

// ── Motion ───────────────────────────────────────────────────────────────────
export { CursorOrb }                from './components/motion/CursorOrb';
export { SectionReveal }            from './components/motion/SectionReveal';
export { StaggerGrid }              from './components/motion/StaggerGrid';
export { MochiBounce }              from './components/motion/MochiBounce';

// ── Theme System ─────────────────────────────────────────────────────────────
export { MochiThemeProvider, useMochiTheme, createMochiTheme } from './components/theme/MochiThemeProvider';
export type { MochiTheme, ColorMode, MochiTokenOverrides } from './components/theme/MochiThemeProvider';
export { DarkModeToggle }           from './components/theme/DarkModeToggle';

// ── Hooks ────────────────────────────────────────────────────────────────────
export { useCountUp }               from './hooks/useCountUp';
export { useReducedMotion }         from './hooks/useReducedMotion';
export { useToast as useClayToast } from './hooks/useToast';
