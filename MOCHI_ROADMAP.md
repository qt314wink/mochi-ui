# Mochi UI — Component Library Roadmap

> Last updated: 2026-06-24

---

## Phase 0 — Token Foundation ✅ COMPLETE
- [x] Full token pass on all 13 clay primitives
- [x] `src/components/clay/index.ts` barrel (16 components)
- [x] `src/index.ts` package root barrel
- [x] `scripts/build-tokens.cjs` → Figma export

## Phase 1 — Motion Layer ✅ COMPLETE
- [x] `useCountUp`, `useReducedMotion`
- [x] `CursorOrb`, `SectionReveal`, `StaggerGrid`, `MochiBounce`
- [x] All motion wired into `EnhancedShowcasePage`

## Phase 2 — New Components ✅ COMPLETE
- [x] `ClayToast` + `useToast`
- [x] `ClayCommandPalette`
- [x] `ClayDataTable`

## Phase 3 — Theme System ✅ COMPLETE
- [x] `MochiThemeProvider`, `useMochiTheme`, `createMochiTheme`
- [x] `DarkModeToggle`
- [x] `localStorage` persistence, `data-theme` on `<html>`
- [ ] Figma contrast audit script (WCAG AA)

## Phase 4 — Documentation Site 🔄 IN PROGRESS
- [x] GitHub Pages deploy workflow (Astro → `actions/deploy-pages`)
- [x] `EnhancedShowcasePage` — full motion, theme, command palette
- [ ] Storybook with clay theme
- [ ] Per-component prop tables from TypeScript types
- [ ] Live playground
- [ ] Copy-to-clipboard code examples
- [ ] Design token reference page

## Phase 5 — Package Release 🔄 IN PROGRESS
- [x] `package.json` as `@mochi-ui/react` with full exports map
- [x] `tsup.config.ts` — ESM + CJS dual build, `.d.ts` declarations
- [x] `release.yml` — auto-publish to npm on `v*.*.*` tag
- [x] `CHANGELOG.md` — v0.1.0 documented
- [x] `LICENSE` — MIT
- [ ] Add `NPM_TOKEN` secret to repo Settings
- [ ] Push tag `v0.1.0` to trigger first publish
- [ ] Verify package on npmjs.com

---

## Architecture Invariants
1. **Token-first** — no hardcoded color, radius, or spacing. Everything is `var(--*)`.
2. **44px touch targets** — every interactive element.
3. **ARIA-complete** — correct roles, labels, keyboard handlers by default.
4. **Reduced-motion aware** — all animation respects `prefers-reduced-motion`.
5. **Idempotent codegen** — `build-tokens.cjs` is deterministic.
