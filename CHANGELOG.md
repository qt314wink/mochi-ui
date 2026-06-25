# Changelog

All notable changes to Mochi UI are documented here.

## [2.0.1] — 2026-06-25

### Fixed
- `sass-embedded` added to `devDependencies` — resolves Vite CSS preprocessor build failure
- CI workflow now uses `npm install` instead of `npm ci` to pick up new devDependencies without requiring lockfile regeneration
- `PhysicsProvider` now uses `useMemo` instead of `useState` so config prop changes propagate reactively to all consumers
- `SplitText` accessibility: outer element carries `aria-label` with full text; word spans are `aria-hidden` to prevent AT stuttering
- `ClayHero3D` removed non-existent `useSpringTransform` import; blob uses `whileHover`/`whileTap` directly

### Added
- `ClaySelect` — custom dropdown with keyboard navigation (Arrow/Enter/Escape), ARIA combobox/listbox/option roles, spring-driven list entrance, focus ring keyed to active colorway
- `ClayDrawer` — slides from left/right/bottom with spring physics, body scroll lock, Escape key, drag handle for bottom variant
- `ClayNotificationProvider` + `useNotification` — ephemeral toast system with success/error/warning/info types, action buttons, auto-dismiss, spring entrance/exit
- `ClayPlayground` copy button now shows `✓ Copied!` confirmation for 1.5 s with scale bounce
- `ScrollProgressBar`, `ScrollReveal`, `SplitText`, `ParallaxLayer`, `TextRevealBlock` scroll typography primitives
- `ClayHero3D` two-column hero with lazy Spline loader and animated clay blob fallback
- `SpringGraph` canvas-based spring curve visualiser (underdamped / critical / overdamped)
- `useSpringTransform` hook added to `SpringPhysics.tsx`
- `og:image` and `twitter:image` meta tags added to `Layout.astro` with configurable `ogImage` prop
- CI workflow (`.github/workflows/ci.yml`) — TypeScript type-check + Astro build on every push to main
- `@splinetool/react-spline` declared as optional peer dependency
- `typecheck` npm script (`tsc --noEmit`)

### Changed
- `ClayButton`, `ClayCard`, `ClaySlider` now read spring config from `PhysicsProvider` via `useContext(PhysicsContext)` — preset selector in header changes component feel site-wide
- README updated: correct component count (15), new primitives documented, architecture diagram updated, CI badge added
- `package.json` version bumped to `2.0.1`

## [2.0.0] — 2026-06-07

### Added
- 13 clay primitive components with spring physics
- 3D WebGL shader scene (ClayScene)
- Spatial audio engine (AudioEngine)
- Smooth scroll via GSAP ScrollTrigger + Lenis
- Dynamic gradient mesh background (AtmosphereCanvas)
- Bento grid layouts with floating animations
- Physics presets: jelly, clay, firm, snappy, luxurious, bouncy
- Theme switching (light/dark) with localStorage persistence
- `prefers-reduced-motion` support across all animated components
- Figma-compatible W3C design tokens
