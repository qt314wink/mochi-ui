# MOCHI UI v2.0 — QUICK START IMPLEMENTATION

## Step 1: Install Dependencies

```bash
cd mochi-ui
npm install three @react-three/fiber @react-three/drei gsap @gsap/react howler simplex-noise
npm install -D @types/three @types/howler
```

## Step 2: Create Audio Engine

```typescript
// src/audio/ClayAudioEngine.ts
// [See full implementation in CLI_HANDOFF_v2.md Section 3.1]
```

## Step 3: Create Shader Material

```typescript
// src/shaders/ClayMaterial.tsx
// [See full GLSL in CLI_HANDOFF_v2.md Section 1.1]
```

## Step 4: Upgrade Components

Replace CSS shadows with `<Canvas>` + `<ClayMaterial>` in each component.

## Step 5: Add Sound Events

```typescript
// In ClayButton.tsx
import { clayAudio } from '../audio/ClayAudioEngine';

const handlePress = () => {
  clayAudio.playPop('soft');
  clayAudio.playSquish(0.2);
  // ... existing animation
};
```

## Step 6: Test & Iterate

```bash
npm run dev
# Open http://localhost:4321
# Test all interactions with sound on
# Profile performance with Chrome DevTools
```

---

**Full specifications:** See `CLI_HANDOFF_v2.md`
