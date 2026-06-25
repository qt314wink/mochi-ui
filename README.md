# Mochi UI 🍡

> A **Claymorphism Design System** built with Astro, React 19, and Motion v12 — featuring spring physics, tactile haptic feedback, scroll typography, and Figma-native design tokens.

[![CI](https://github.com/qt314wink/mochi-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/qt314wink/mochi-ui/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/demo-mochi--ui--two.vercel.app-5ee7b0)](https://mochi-ui-two.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-c9a7f5.svg)](LICENSE)

![Mochi UI](public/assets/og-image.png)

## ✨ Philosophy

**If it looks like clay, animates like clay, it must feel like clay.**

Mochi UI implements the complete tactile web playbook:
- **Pastel Psychology** — Reduced cognitive load through curated tints
- **Shadow Matrix** — 4-layer depth system (Base → Lift → Volume → Reflection)
- **Spring Physics** — Reactive `PhysicsProvider` drives all component transitions from a single preset
- **Haptic Synchronization** — Device hardware feedback mapped to visual states
- **Bento Grids** — Japanese bento-inspired compartmentalization

## 🚀 Quick Start

```bash
# Clone and install
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# TypeScript type-check
npm run typecheck

# Export design tokens to Figma
npm run tokens
```

## 🧩 Component Library

### Clay Primitives (15)

| Component | Description | Physics |
|-----------|-------------|---------|
| `ClayButton` | 6 colorways, 3 sizes, icon slots | Compression → Overshoot → Settle |
| `ClayCard` | 4 variants, tilt on hover | Floating parallax |
| `ClayToggle` | Spring knob, haptic tick | Elastic snap |
| `ClaySlider` | Tactile knob, fill animation | Drag + release |
| `ClayInput` | Inset recess, glow focus, validation | Scale pulse |
| `ClayChartBar` | 3D cylinder, volumetric shadow | Grow from bottom |
| `ClayBadge` | Pulse animation, micro-float | Scale bounce |
| `ClayAvatar` | Status indicator, rotation on hover | Tilt + scale |
| `ClayTooltip` | 4 positions, spring entrance | Scale + fade |
| `ClayModal` | 3 sizes, focus trap, Escape key | Spring in/out |
| `ClaySkeleton` | pulse + wave variants | — |
| `ClayProgress` | Animated fill, size variants | Spring fill |
| `ClaySegmentedControl` | Sliding indicator | Spring slide |
| `ClaySelect` | Keyboard nav, ARIA combobox | Spring dropdown |
| `ClayDrawer` | left/right/bottom, body lock | Spring slide |

### Notifications

```tsx
import { ClayNotificationProvider, useNotification } from './components';

// Wrap your app
<ClayNotificationProvider position="bottom-right">
  <App />
</ClayNotificationProvider>

// Use anywhere inside
const { notify } = useNotification();
notify({ message: 'Saved!', type: 'success', duration: 3000 });
notify({ message: 'Something went wrong', type: 'error' });
notify({ message: 'Update available', type: 'info', action: { label: 'Reload', onClick: () => location.reload() } });
```

### Animation Systems

| System | Purpose |
|--------|---------|
| `PhysicsProvider` | Reactive spring config — changing preset updates all children instantly |
| `ClayRebound` | 3-phase animation (Compression → Overshoot → Settle) |
| `FloatingContainer` | Ambient breathing animation |
| `FloatingGroup` | Staggered floating elements |
| `FloatingParallaxLayer` | Mouse-driven depth parallax |

### Scroll Typography & Motion

| Primitive | Purpose |
|-----------|---------|
| `ScrollReveal` | Fade-up on scroll with spring |
| `SplitText` | Word-by-word stagger reveal (a11y-safe) |
| `ParallaxLayer` | Scroll-speed parallax with spring smoothing |
| `ScrollProgressBar` | Fixed top reading progress indicator |
| `TextRevealBlock` | Wipe-in text reveal with color sweep |

### Layout

| Component | Purpose |
|-----------|---------|
| `BentoGrid` | Responsive bento grid |
| `BentoItem` | Individual bento cell with span support |

## 🎯 Physics Presets

```tsx
import { physicsPresets, PhysicsProvider } from './components';

// PhysicsProvider is reactive — changing config prop re-renders all consumers
<PhysicsProvider config={physicsPresets.jelly}>
  <App />
</PhysicsProvider>

// Available presets
// jelly      — bounce: 0.8, duration: 500ms  (max elasticity)
// clay       — bounce: 0.4, duration: 300ms  (default)
// firm       — bounce: 0.15, duration: 200ms (minimal bounce)
// snappy     — bounce: 0.2, duration: 150ms  (quick response)
// luxurious  — bounce: 0.5, duration: 600ms  (slow elegance)
// bouncy     — bounce: 0.9, duration: 400ms  (playful)
```

## 🗓️ Architecture

```
mochi-ui/
├── src/
│   ├── components/
│   │   ├── clay/           # 15 primitive components
│   │   ├── animations/     # SpringPhysics, ClayRebound, FloatingContainer
│   │   ├── hero/           # ClayHero3D (Spline + clay blob fallback)
│   │   ├── motion/         # ScrollTypography primitives
│   │   ├── playground/     # ClayPlayground + SpringGraph
│   │   ├── layout/         # BentoGrid
│   │   ├── enhanced/       # AudioEngine, SmoothScroll, AtmosphereCanvas
│   │   └── index.ts        # Single barrel export
│   ├── styles/
│   │   ├── tokens.css      # CSS custom properties
│   │   └── clay.css        # Component base styles
│   ├── tokens/           # W3C design tokens
│   └── pages/
│       └── index.astro     # Main entry → EnhancedShowcasePage
├── .github/workflows/
│   ├── ci.yml           # Typecheck + build on every push
│   └── main.yml         # Token export (manual trigger)
└── package.json
```

## 🎨 Design Tokens (W3C Format)

```json
{
  "mochi.color.rainbow.mint": { "$type": "color", "$value": "#A3E635" },
  "mochi.shadow.lift.md":     { "$type": "shadow", "$value": { "..." } },
  "mochi.motion.spring.bounce": { "$type": "number", "$value": 0.4 }
}
```

| Export Format | Use Case |
|--------------|----------|
| `tokens-studio.json` | Tokens Studio Figma plugin |
| `figma-variables.json` | Native Figma Variables API |
| `variables.css` | CSS custom properties |
| `component-specs.json` | Component anatomy docs |

## 🌗 Dark Mode

| Mode | Base | Surface | Card |
|------|------|---------|------|
| Light | `#F5E6D3` | `#FFF8F0` | `#FFFFFF` |
| Dark | `#1E1E2E` | `#2D2D44` | `#252538` |

## 📱 Haptic Feedback

```tsx
import { triggerHaptic } from './components';

triggerHaptic({ enabled: true, intensity: 'soft' });   // Button press
triggerHaptic({ enabled: true, intensity: 'medium' }); // Toggle
triggerHaptic({ enabled: true, intensity: 'firm' });   // Deep press
```

## 📄 License

MIT © 2026 Mochi UI
