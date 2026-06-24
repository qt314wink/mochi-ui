# Changelog

All notable changes to `@mochiui/react` will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.1.0] — 2026-06-24

### Added

**Clay Primitives**
- `ClayButton` — Triple-shadow, 6 colorways, 3 sizes, compression physics
- `ClayCard` — 4-layer shadow, 3D tilt on hover, shine effect
- `ClayToggle` — Spring knob, track recess, haptic tick
- `ClaySlider` — Tactile knob, granular feedback, fill animation
- `ClayInput` — Inset recess, glow focus, validation states
- `ClayChartBar` — 3D cylinder, volumetric shadow, tooltip
- `ClayBadge` — Pulse animation, micro-float
- `ClayAvatar` — Status indicator, rotation on hover
- `ClayTooltip` — Spring entrance, arrow pointer
- `ClayModal` — Backdrop blur, spring open/close
- `ClaySkeleton` — Shimmer animation
- `ClayProgress` — Spring fill, milestone pops
- `ClaySegmentedControl` — Sliding indicator, haptic selection

**Animation Systems**
- `PhysicsProvider` + `usePhysics` — Global spring physics configuration
- `physicsPresets` — 6 presets: `jelly`, `clay`, `firm`, `snappy`, `luxurious`, `bouncy`
- `ClayRebound` — 3-phase animation wrapper
- `FloatingContainer` / `FloatingGroup` — Ambient breathing animations
- `ParallaxLayer` — Mouse-driven depth parallax
- `triggerHaptic` — Programmatic haptic feedback

**Layout**
- `BentoGrid` / `BentoItem` / `BentoLayouts` — Responsive bento-style grid system

**Design Tokens**
- W3C-format tokens with Figma Variables, Tokens Studio, and CSS custom properties export
