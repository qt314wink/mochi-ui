# MOCHI UI — CLI HANDOFF DOCUMENT
## v2.0 Enhancement Brief: From Design System to Immersive Web Experience

---

## EXECUTIVE SUMMARY

**Current State:** Mochi UI v1.0 is a functional claymorphism design system with 13 components, spring physics, and Figma compatibility.

**Target State:** Mochi UI v2.0 — A living, breathing digital ecosystem with spatial audio, procedural motion graphics, haptic-synchronized sound design, and emotionally intelligent micro-interactions.

**Success Metric:** Users should feel like they're interacting with physical clay that responds to touch, sound, and motion — not clicking web elements.

---

## 1. VISUAL ENHANCEMENT PIPELINE

### 1.1 Procedural Clay Textures (GLSL Shaders)

**Requirement:** Replace CSS box-shadows with WebGL/Three.js procedural clay shaders for authentic material appearance.

```bash
# Install dependencies
npm install three @react-three/fiber @react-three/drei glsl-noise glsl-aastep
```

**Implementation:**
- Create `ClayMaterial` component using custom GLSL shaders
- Implement subsurface scattering for translucent clay appearance
- Add specular highlights that follow cursor position (fake caustics)
- Generate procedural surface imperfections (fingerprints, tool marks)

**Shader Specifications:**
```glsl
// clay.vert — Vertex displacement for soft deformation
uniform float uTime;
uniform float uSquish; // 0.0-1.0 compression state
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 pos = position;
  // Organic displacement based on noise
  float noise = snoise(vec3(pos.xy * 2.0, uTime * 0.1));
  pos.z += noise * 0.02 * (1.0 - uSquish);
  // Squish deformation on press
  pos.y *= mix(1.0, 0.85, uSquish);
  pos.x *= mix(1.0, 1.05, uSquish);
  vPosition = pos;
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// clay.frag — Subsurface scattering clay
uniform vec3 uBaseColor;      // Pastel tint
uniform vec3 uHighlightColor;   // Warm highlight
uniform vec3 uShadowColor;      // Cool shadow
uniform float uRoughness;       // 0.3-0.7 for clay
uniform vec3 uLightPosition;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(uLightPosition - vPosition);
  vec3 viewDir = normalize(cameraPosition - vPosition);

  // Subsurface scattering (translucency)
  float subsurface = max(0.0, dot(-normal, lightDir)) * 0.3;
  vec3 subsurfaceColor = uBaseColor * 1.2 + subsurface * uHighlightColor;

  // Specular (soft clay sheen)
  vec3 halfDir = normalize(lightDir + viewDir);
  float specAngle = max(0.0, dot(normal, halfDir));
  float specular = pow(specAngle, 32.0) * (1.0 - uRoughness) * 0.4;

  // Rim light (clay edge glow)
  float rim = 1.0 - max(0.0, dot(viewDir, normal));
  rim = pow(rim, 3.0) * 0.3;

  vec3 color = subsurfaceColor + specular * vec3(1.0) + rim * uHighlightColor;
  gl_FragColor = vec4(color, 1.0);
}
```

**Fallback:** CSS `backdrop-filter` + `filter` chain for non-WebGL browsers.

---

### 1.2 Dynamic Gradient Mesh Backgrounds

**Requirement:** Living backgrounds that respond to cursor, time, and audio.

```bash
npm install simplex-noise
```

**Implementation:**
- Create `AtmosphereCanvas` component
- Use Simplex noise to generate slow-moving color fields
- Colors shift based on time of day (warm mornings, cool evenings)
- Cursor creates "ripples" in the gradient field
- Audio reactivity: bass frequencies pulse the background brightness

**Specification:**
```typescript
// AtmosphereCanvas.tsx
interface AtmosphereConfig {
  baseHue: number;        // 0-360, shifts with time
  saturation: number;       // 0.3-0.6 (pastel range)
  lightness: number;        // 0.8-0.95
  noiseScale: number;       // 0.001-0.01
  animationSpeed: number;   // 0.0001-0.001
  cursorInfluence: number;  // 0-1, how much cursor affects field
  audioReactivity: number;  // 0-1, bass response
}
```

---

### 1.3 Particle Clay System

**Requirement:** Micro-particles that emanate from interactions, settling like clay dust.

**Implementation:**
- Use Canvas 2D (not WebGL — too heavy for particles) with `requestAnimationFrame`
- On button press: emit 20-50 particles from press point
- Particles have clay colors, soft edges, gravity, and air resistance
- They settle on "surfaces" (other UI elements) and fade over 2-3 seconds
- GPU-composited via `will-change: transform` + `translate3d`

**Particle Spec:**
```typescript
interface ClayParticle {
  x: number; y: number;           // Position
  vx: number; vy: number;         // Velocity
  radius: number;                 // 2-6px
  color: string;                  // Pastel from palette
  opacity: number;                // 0.6-1.0, fades to 0
  life: number;                   // 0-1, normalized lifetime
  gravity: number;                // 0.1-0.3
  friction: number;               // 0.95-0.99
}
```

---

## 2. MOTION GRAPHICS & ADVANCED ANIMATION

### 2.1 Morphing Clay Shapes (SVG + GSAP MorphSVG)

**Requirement:** Elements that physically morph between states, not just fade/scale.

```bash
npm install gsap @gsap/react
```

**Implementation:**
- Define SVG paths for each component's states (default, hover, active)
- Use GSAP MorphSVG to interpolate between path shapes
- Button morphs from rounded rectangle to squished ellipse on press
- Cards "breathe" by morphing their corner radii slightly
- Toggle track morphs width when activated (elastic stretch)

**Example:**
```typescript
// ClayMorph.tsx
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(MorphSVGPlugin);

const defaultPath = "M20,0 Q40,0 40,20 Q40,40 20,40 Q0,40 0,20 Q0,0 20,0";
const squishedPath = "M20,0 Q38,0 38,20 Q38,38 20,38 Q2,38 2,20 Q2,0 20,0"; // Compressed

useEffect(() => {
  if (isPressed) {
    gsap.to(pathRef.current, {
      duration: 0.15,
      morphSVG: squishedPath,
      ease: "power2.in"
    });
  } else {
    gsap.to(pathRef.current, {
      duration: 0.4,
      morphSVG: defaultPath,
      ease: "elastic.out(1, 0.5)" // Clay rebound
    });
  }
}, [isPressed]);
```

---

### 2.2 Layout Transitions (FLIP + Shared Element)

**Requirement:** Seamless page transitions where elements physically move between layouts.

```bash
npm install @motion/react-layout
```

**Implementation:**
- Use Motion's `layoutId` for shared element transitions
- When navigating, cards physically animate to their new positions
- Bento grid items "shuffle" with spring physics when reordered
- Page transitions: current page compresses, new page expands from a card

**Transition Spec:**
```typescript
interface PageTransition {
  type: 'compress-expand' | 'card-zoom' | 'slide-clay';
  duration: number;           // 400-800ms
  spring: SpringConfig;
  sharedElements: string[]; // layoutIds to animate
}
```

---

### 2.3 Scroll-Driven Clay Deformation

**Requirement:** Elements deform based on scroll velocity and position.

**Implementation:**
- Use `useScroll` + `useTransform` from Motion
- Cards "lean" in the direction of scroll (skewX based on velocity)
- Elements at viewport edges compress slightly (perspective foreshortening)
- Parallax depth: background elements move slower, foreground faster
- Scroll snap points with spring physics (not abrupt)

```typescript
const scrollVelocity = useVelocity(scrollY);
const skewX = useTransform(scrollVelocity, [-1000, 1000], [-5, 5]);
const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
```

---

## 3. SOUND & AUDIO EXPANSION

### 3.1 Web Audio API Sound Design System

**Requirement:** Every interaction produces satisfying, physical audio feedback.

```bash
npm install howler  # Fallback for complex sounds
# OR pure Web Audio API (preferred for procedural)
```

**Implementation:**
Create `ClayAudioEngine` class using Web Audio API:

```typescript
// ClayAudioEngine.ts
class ClayAudioEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private reverb: ConvolverNode; // Simulated room acoustics

  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3; // Subtle by default

    // Create synthetic reverb impulse
    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.createReverbImpulse(2.0, 0.5);

    this.masterGain.connect(this.reverb);
    this.reverb.connect(this.ctx.destination);
  }

  // Procedural clay "pop" sound
  playPop(intensity: 'soft' | 'medium' | 'firm' = 'soft') {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Frequency based on intensity
    const freqs = { soft: 800, medium: 600, firm: 400 };
    osc.frequency.setValueAtTime(freqs[intensity], this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

    // Filter for "muffled" clay sound
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    // Envelope
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Clay "squish" sound for press/hold
  playSquish(duration: number = 0.3) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate pink noise for squish texture
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 300;
    filter.Q.value = 0.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }

  // Ambient clay workshop atmosphere
  playAmbient() {
    // Very subtle background: occasional distant "thuds" and "scrapes"
    // Random intervals 10-30 seconds
    // Volume: barely perceptible (0.05-0.1)
  }
}
```

**Sound Event Mapping:**

| UI Event | Sound | Parameters |
|----------|-------|-----------|
| Button hover | Soft "wind" | 100ms, 200Hz sine, fade in/out |
| Button press | Clay "pop" | Intensity based on press speed |
| Button release | Clay "boing" | Spring physics mapped to pitch |
| Toggle on | Sharp "click" + reverb | 50ms, 1kHz, decay 0.3s |
| Toggle off | Dull "thud" | 80ms, 400Hz, no reverb |
| Slider drag | Granular "scraping" | Continuous, pitch follows position |
| Slider snap | "Tick" | 30ms, 800Hz, very short |
| Card hover | Subtle "whoosh" | 200ms, filtered noise |
| Page transition | "Swoosh" + reverb | 400ms, rising pitch |
| Error state | "Crack" | 100ms, noise burst, 200Hz |
| Success | "Chime" | 300ms, major triad, shimmer |

---

### 3.2 Haptic-Audio Synchronization

**Requirement:** Sound and vibration are perfectly synchronized for multi-sensory feedback.

```typescript
interface MultiSensoryEvent {
  visual: AnimationConfig;    // Spring physics
  audio: AudioConfig;       // Web Audio API
  haptic: VibrationPattern; // Navigator.vibrate
  delay: number;            // ms offset between modalities
}

const playMultiSensory = (event: MultiSensoryEvent) => {
  // Start all modalities simultaneously
  const now = performance.now();

  // Visual
  requestAnimationFrame(() => animateVisual(event.visual));

  // Audio (with tiny delay for processing)
  setTimeout(() => playAudio(event.audio), event.delay);

  // Haptic (must be triggered by user gesture)
  if (navigator.vibrate) {
    navigator.vibrate(event.haptic);
  }
};
```

---

### 3.3 Spatial Audio for 3D Layouts

**Requirement:** Audio positioned in 3D space matching visual layout.

```typescript
// For cards in a grid, sounds come from their visual position
const createSpatialAudio = (x: number, y: number, z: number) => {
  const panner = audioContext.createPanner();
  panner.positionX.value = x;
  panner.positionY.value = y;
  panner.positionZ.value = z;
  panner.rolloffFactor = 0.5; // Gentle distance falloff
  return panner;
};
```

---

## 4. RESPONSIVE & ADAPTIVE SYSTEMS

### 4.1 Breakpoint-Aware Clay Physics

**Requirement:** Physics feel different on different devices.

```typescript
const devicePhysics = {
  mobile: {
    bounce: 0.6,      // More playful on small screens
    duration: 250,    // Faster for touch immediacy
    haptic: true,     // Always on mobile
    particleCount: 15 // Fewer particles for performance
  },
  tablet: {
    bounce: 0.4,
    duration: 300,
    haptic: true,
    particleCount: 30
  },
  desktop: {
    bounce: 0.3,      // More subtle on large screens
    duration: 350,    // Slower, more luxurious
    haptic: false,    // Most desktops lack haptics
    particleCount: 50
  },
  reducedMotion: {
    bounce: 0,
    duration: 100,    // Instant, no spring
    haptic: false,
    particles: 0
  }
};
```

---

### 4.2 Container Query Clay Scaling

**Requirement:** Components adapt their "clay-ness" based on container size, not just viewport.

```css
@container (max-width: 200px) {
  .clay-card {
    border-radius: 16px; /* Less rounding in small spaces */
    box-shadow: var(--shadow-lift-sm); /* Subtler shadow */
  }
}

@container (min-width: 600px) {
  .clay-card {
    border-radius: 32px; /* More rounding in spacious layouts */
    box-shadow: var(--shadow-lift-lg); /* Dramatic shadow */
  }
}
```

---

## 5. UNIQUE DESIGN SYSTEM TOKEN LANGUAGE

### 5.1 Semantic Token Naming Convention

Replace generic names with **sensory-mapped semantics**:

| Old Token | New Token | Meaning |
|-----------|-----------|---------|
| `--color-mint` | `--clay-fresh` | "Just molded" feeling |
| `--shadow-lift` | `--clay-breathe` | Ambient floating |
| `--radius-card` | `--clay-roundness` | Organic curvature |
| `--spring-bounce` | `--clay-elasticity` | How much it squishes |
| `--duration-fast` | `--clay-snappy` | Quick rebound |
| `--duration-slow` | `--clay-luxurious` | Slow elegance |

**Full Token Structure:**
```json
{
  "clay": {
    "touch": {
      "soft": { "$value": "hsl(142deg 76% 85%)" },
      "warm": { "$value": "hsl(25deg 95% 85%)" },
      "cool": { "$value": "hsl(200deg 90% 90%)" }
    },
    "depth": {
      "float": { "$value": "0 8px 16px rgba(0,0,0,0.1)" },
      "sink": { "$value": "inset 0 4px 8px rgba(0,0,0,0.15)" },
      "press": { "$value": "inset 0 2px 4px rgba(0,0,0,0.2)" }
    },
    "motion": {
      "squish": { "$value": { "bounce": 0.8, "duration": 200 } },
      "rebound": { "$value": { "bounce": 0.4, "duration": 400 } },
      "settle": { "$value": { "bounce": 0.1, "duration": 600 } }
    },
    "sound": {
      "pop": { "$value": { "freq": 800, "decay": 0.1, "type": "sine" } },
      "squish": { "$value": { "freq": 300, "decay": 0.3, "type": "noise" } },
      "tick": { "$value": { "freq": 1200, "decay": 0.05, "type": "sine" } }
    }
  }
}
```

---

### 5.2 Theme Variants (Mood-Based)

```typescript
const clayMoods = {
  morning: {
    // Warm, energetic
    base: '#FFF5E6',
    accent: '#FB923C',
    shadow: 'warm',
    audio: 'bright',
    particles: 'gold-dust'
  },
  afternoon: {
    // Balanced, focused
    base: '#F0F9FF',
    accent: '#38BDF8',
    shadow: 'neutral',
    audio: 'clear',
    particles: 'blue-motes'
  },
  evening: {
    // Calm, reflective
    base: '#1E1E2E',
    accent: '#A78BFA',
    shadow: 'deep',
    audio: 'muffled',
    particles: 'purple-haze'
  },
  playful: {
    // High bounce, bright colors
    base: '#FEF3C7',
    accent: '#A3E635',
    shadow: 'bouncy',
    audio: 'poppy',
    particles: 'confetti'
  },
  serious: {
    // Minimal motion, muted
    base: '#F5F5F5',
    accent: '#6B7280',
    shadow: 'subtle',
    audio: 'none',
    particles: 'none'
  }
};
```

---

## 6. INTUITIVE USER EXPERIENCE FLOWS

### 6.1 Onboarding Flow: "The Clay Workshop"

**Concept:** User enters a virtual clay workshop where they learn by doing.

**Screens:**

1. **Welcome** — Floating clay blob morphs into logo
   - Sound: Soft "thud" as blob lands
   - Interaction: Click blob to "squish" it into shape

2. **Touch Tutorial** — Press, hold, release
   - Visual: Large clay button responds to pressure
   - Audio: Pitch rises with pressure, "pop" on release
   - Haptic: Intensity increases with hold duration

3. **Physics Playground** — Adjust bounce/duration
   - Visual: Real-time preview of spring settings
   - Audio: Each setting has characteristic sound
   - Reward: Unlock "jelly" preset by finding sweet spot

4. **Color Mixing** — Blend pastels like paint
   - Visual: Two colors swirl together when dragged
   - Audio: "Squish" sound during mix, "chime" when complete
   - Save: Named custom colorway added to palette

5. **First Creation** — Build a bento grid
   - Drag clay cards from "tray" onto grid
   - Cards "snap" with satisfying click
   - Final grid "bakes" (slight color shift, permanent shadows)

---

### 6.2 Micro-Interaction Library

**Every interaction must have:**

| Element | Visual | Audio | Haptic | Duration |
|---------|--------|-------|--------|----------|
| Hover | Lift + glow | Soft wind | None | 200ms |
| Press | Compress + darken | Pop onset | 10ms tick | 100ms |
| Hold | Deep compress + wobble | Rising tone | Intensifying | Variable |
| Release | Overshoot + settle | Boing | 15ms + 10ms | 400ms |
| Drag | Trail particles | Scraping | 5ms granular | Continuous |
| Drop | Snap to grid | Click | 20ms firm | 150ms |
| Error | Shake + crack | Crack sound | 50ms buzz | 300ms |
| Success | Pulse + sparkle | Chime | 30ms soft | 500ms |
| Loading | Breathing + shimmer | Subtle hum | None | Continuous |

---

### 6.3 Gesture Language

| Gesture | Action | Feedback |
|---------|--------|----------|
| Single tap | Activate | Pop + haptic |
| Long press | Context menu | Deep compress + rising tone |
| Double tap | Favorite/like | Heart morph + chime |
| Swipe left | Dismiss | Slide off + "whoosh" |
| Swipe right | Complete | Slide on + "ding" |
| Pinch | Zoom | Scale + pitch shift |
| Spread | Expand | Scale + brightness |
| Shake | Undo | Wobble + "crack" |
| Tilt (mobile) | Parallax | Spatial audio shift |

---

## 7. PERFORMANCE & ACCESSIBILITY

### 7.1 Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | Inline critical CSS, lazy shaders |
| Time to Interactive | < 3s | Defer audio context, lazy particles |
| Animation frame rate | 60fps | GPU layers, `will-change`, `transform` |
| Audio latency | < 50ms | Pre-synthesize sounds, AudioWorklet |
| Bundle size | < 150KB | Tree-shake, code-split by route |

### 7.2 Accessibility Requirements

```typescript
interface A11yConfig {
  reducedMotion: boolean;      // Disable springs, use fades
  reducedSound: boolean;       // Mute all audio
  highContrast: boolean;        // Increase shadow contrast
  screenReader: boolean;        // Add descriptive labels
  keyboardOnly: boolean;        // Full keyboard navigation
}

// When reducedMotion: true
// - Replace spring with 150ms ease-out
// - Disable particles
// - Static shadows (no animation)
// - No parallax

// When reducedSound: true
// - All audio muted
// - Visual indicators enhanced (pulses, color flashes)
// - Haptic still active if available
```

---

## 8. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Three.js/React Three Fiber environment
- [ ] Implement `ClayMaterial` shader
- [ ] Create `ClayAudioEngine` with Web Audio API
- [ ] Build `AtmosphereCanvas` background system

### Phase 2: Components (Week 3-4)
- [ ] Upgrade all 13 components to use shaders + audio
- [ ] Implement particle system
- [ ] Add GSAP MorphSVG shape morphing
- [ ] Build gesture recognition layer

### Phase 3: Flows (Week 5)
- [ ] Build "Clay Workshop" onboarding
- [ ] Implement mood-based theming
- [ ] Create micro-interaction library
- [ ] Add page transition system

### Phase 4: Polish (Week 6)
- [ ] Performance optimization (GPU profiling)
- [ ] Accessibility audit
- [ ] Cross-device testing
- [ ] Sound design finalization

### Phase 5: Launch (Week 7)
- [ ] Documentation
- [ ] Figma plugin update with audio specs
- [ ] Demo deployment
- [ ] Community release

---

## 9. FILE STRUCTURE (Target)

```
mochi-ui-v2/
├── src/
│   ├── components/
│   │   ├── clay/              # 13 upgraded components
│   │   ├── animations/
│   │   │   ├── SpringPhysics.tsx
│   │   │   ├── ClayRebound.tsx
│   │   │   ├── FloatingContainer.tsx
│   │   │   ├── MorphSVG.tsx       # NEW
│   │   │   └── PageTransition.tsx  # NEW
│   │   ├── audio/
│   │   │   ├── ClayAudioEngine.ts  # NEW
│   │   │   ├── SoundLibrary.ts     # NEW
│   │   │   └── SpatialAudio.ts     # NEW
│   │   ├── shaders/
│   │   │   ├── ClayMaterial.tsx    # NEW
│   │   │   ├── AtmosphereCanvas.tsx # NEW
│   │   │   └── ParticleSystem.tsx   # NEW
│   │   ├── layout/
│   │   └── flows/
│   │       ├── Onboarding.tsx      # NEW
│   │       └── MicroInteractions.tsx # NEW
│   ├── styles/
│   ├── tokens/
│   └── pages/
├── public/
│   └── audio/                 # Synthesized sound assets
├── figma-export/
└── docs/
    └── audio-specs.md         # Sound design documentation
```

---

## 10. SUCCESS CRITERIA

**The system is complete when:**

1. ✅ A user can navigate the entire app without reading — sound + motion guide them
2. ✅ Every interaction produces satisfying multi-sensory feedback
3. ✅ The app feels like a physical object, not a website
4. ✅ Users smile when they press buttons (intentional delight)
5. ✅ Performance stays at 60fps on mid-tier mobile devices
6. ✅ Accessibility is not an afterthought — it's core to the experience
7. ✅ The design token language is so intuitive that non-designers can use it

---

**Document Version:** 2.0
**Last Updated:** 2026-05-25
**Status:** Ready for implementation
