# MOCHI UI — CLI HANDOFF DOCUMENT
## v2.0 Enhanced Experience Upgrade

---

## 🎯 PROJECT VISION

Transform Mochi UI from a static component library into a **living, breathing, multi-sensory web experience** that feels like interacting with physical clay in a digital space.

### Core Pillars
| Pillar | Current State | Target State |
|--------|--------------|--------------|
| **Visuals** | Pastel shadows | 3D SDF shaders, glassmorphism fusion, particle systems |
| **Motion** | Spring physics | Procedural animation, scroll-driven, cursor-reactive |
| **Audio** | None | Spatial haptic audio, UI sound design |
| **Responsive** | Basic breakpoints | Fluid typography, container queries, motion-reduced |
| **Tokens** | W3C static | Dynamic, semantic, context-aware |
| **UX Flows** | Component showcase | Guided journeys, progressive disclosure |

---

## 📋 EXECUTION CHECKLIST

### Phase 1: Foundation Upgrade (Week 1)

#### 1.1 Design Token Language Expansion
```bash
# Run token expansion
npm run tokens:expand

# Generates:
# - Semantic tokens (action, feedback, emphasis)
# - Context tokens (resting, hovering, pressing, disabled)
# - Spatial tokens (elevation, depth, z-index)
# - Temporal tokens (duration, delay, stagger)
# - Sonic tokens (pitch, timbre, envelope)
```

**New Token Categories:**
```json
{
  "semantic": {
    "action": { "primary": "...", "secondary": "...", "destructive": "..." },
    "feedback": { "success": "...", "warning": "...", "error": "...", "info": "..." },
    "emphasis": { "high": "...", "medium": "...", "low": "..." }
  },
  "context": {
    "resting": { "shadow": "...", "scale": 1, "filter": "..." },
    "hovering": { "shadow": "...", "scale": 1.02, "lift": "-4px" },
    "pressing": { "shadow": "...", "scale": 0.95, "squish": "0.9" },
    "dragging": { "shadow": "...", "scale": 1.05, "rotate": "5deg" },
    "settling": { "spring": "...", "bounce": 0.4 }
  },
  "spatial": {
    "elevation": { "1": "...", "2": "...", "3": "...", "4": "..." },
    "depth": { "surface": 0, "floating": 1, "overlay": 2, "modal": 3 }
  },
  "temporal": {
    "instant": "50ms",
    "fast": "150ms",
    "normal": "300ms",
    "slow": "500ms",
    "luxurious": "800ms"
  },
  "sonic": {
    "click": { "frequency": 800, "duration": 50, "waveform": "sine" },
    "hover": { "frequency": 400, "duration": 30, "waveform": "triangle" },
    "success": { "sequence": [523, 659, 784], "duration": 200 },
    "error": { "sequence": [400, 200], "duration": 300 }
  }
}
```

#### 1.2 Responsive Architecture
```bash
npm install @radix-ui/react-use-media-query
```

**Breakpoints (Fluid):**
```css
/* Container query-based, not viewport */
@container (min-width: 0px) { /* Micro */ }
@container (min-width: 320px) { /* Mobile */ }
@container (min-width: 640px) { /* Tablet */ }
@container (min-width: 1024px) { /* Desktop */ }
@container (min-width: 1440px) { /* Wide */ }
@container (min-width: 1920px) { /* Ultra-wide */ }
```

**Fluid Typography:**
```css
:root {
  --font-fluid-sm: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
  --font-fluid-base: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --font-fluid-lg: clamp(1.25rem, 1rem + 1vw, 2rem);
  --font-fluid-xl: clamp(1.5rem, 1rem + 2vw, 3rem);
  --font-fluid-display: clamp(2rem, 1rem + 4vw, 5rem);
}
```

---

### Phase 2: Visual Enhancement (Week 2)

#### 2.1 3D SDF Shader Effects
```bash
npm install three @react-three/fiber @react-three/drei
npm install @react-three/postprocessing
```

**Clay SDF Material:**
```tsx
// components/effects/ClayMaterial.tsx
const ClayMaterial = () => {
  const shader = {
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#A3E635') },
      uRoughness: { value: 0.4 },
      uSubsurface: { value: 0.6 },
    },
    vertexShader: clayVertexShader, // SDF-based displacement
    fragmentShader: clayFragmentShader, // Subsurface scattering
  };
  return <shaderMaterial {...shader} />;
};
```

**Features:**
- Subsurface scattering (light penetrates surface)
- Soft body deformation (cursor proximity)
- Specular highlights (anisotropic)
- Ambient occlusion (self-shadowing)

#### 2.2 Glassmorphism Fusion
```css
.clay-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    /* Clay lift */
    0 8px 32px rgba(0,0,0,0.1),
    /* Glass reflection */
    inset 0 1px 0 rgba(255,255,255,0.3),
    /* Clay volume */
    inset -10px -10px 20px rgba(0,0,0,0.05);
}
```

#### 2.3 Particle Systems
```bash
npm install @tsparticles/react @tsparticles/slim
```

**Ambient Particles:**
- Floating dust motes (respond to cursor)
- Clay crumbs on interaction
- Success confetti (spring-physics)
- Loading spinner (orbiting spheres)

---

### Phase 3: Motion Graphics (Week 3)

#### 3.1 Scroll-Driven Animations
```bash
npm install @gsap/react gsap
```

**ScrollTrigger Config:**
```tsx
// Pin sections, scrub animations
useGSAP(() => {
  gsap.to('.clay-section', {
    scrollTrigger: {
      trigger: '.clay-section',
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      pin: true,
    },
    scale: 1.1,
    rotateY: 15,
  });
});
```

#### 3.2 Cursor-Reactive Effects
```tsx
// components/effects/CursorClay.tsx
const CursorClay = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Magnetic pull on nearby elements
  const magneticStrength = useTransform(
    [mouseX, mouseY],
    ([x, y]) => calculateMagneticPull(x, y)
  );

  // Clay deformation at cursor
  const deformation = useTransform(
    [mouseX, mouseY],
    ([x, y]) => calculateSDFDeformation(x, y)
  );

  return <div className="cursor-clay-field" />;
};
```

#### 3.3 Page Transitions
```tsx
// AnimatePresence with shared layout
<AnimatePresence mode="wait">
  <motion.div
    key={route}
    initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

---

### Phase 4: Audio Expansion (Week 4)

#### 4.1 Web Audio API Integration
```bash
npm install howler
```

**Audio Manager:**
```tsx
// systems/AudioEngine.ts
class AudioEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private reverb: ConvolverNode;

  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.reverb = this.ctx.createConvolver();
    // Load impulse response for room reverb
  }

  playClayClick(intensity: 'soft' | 'medium' | 'firm') {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Synthesize clay "thock" sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(
      intensity === 'soft' ? 800 : intensity === 'medium' ? 600 : 400,
      this.ctx.currentTime
    );
    osc.frequency.exponentialRampToValueAtTime(
      100, this.ctx.currentTime + 0.1
    );

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    osc.connect(filter).connect(gain).connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playClaySquish() {
    // Noise burst with bandpass for squish sound
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.3);
    filter.Q.value = 2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    noise.connect(filter).connect(gain).connect(this.masterGain);
    noise.start();
  }
}
```

#### 4.2 Spatial Audio
```tsx
// Audio follows cursor position
const panner = this.ctx.createPanner();
panner.panningModel = 'HRTF';
panner.distanceModel = 'inverse';
panner.refDistance = 1;
panner.maxDistance = 10;
panner.rolloffFactor = 1;
panner.coneInnerAngle = 360;
panner.coneOuterAngle = 0;
panner.coneOuterGain = 0;

// Update position based on cursor
panner.positionX.setValueAtTime(mouseX / window.innerWidth * 10 - 5, this.ctx.currentTime);
panner.positionY.setValueAtTime(-(mouseY / window.innerHeight * 10 - 5), this.ctx.currentTime);
```

---

### Phase 5: UX Flows & Screens (Week 5)

#### 5.1 Onboarding Journey
```
Screen 1: Welcome
  - Animated clay logo morphing
  - "Touch the clay" prompt
  - Haptic feedback on first interaction

Screen 2: Physics Playground
  - Interactive spring demo
  - Real-time parameter adjustment
  - "Feel the bounce" with audio

Screen 3: Color Explorer
  - Swatch cards with 3D tilt
  - Color mixing (like paint)
  - Accessibility contrast checker

Screen 4: Component Builder
  - Drag-and-drop builder
  - Live preview with all states
  - Code export

Screen 5: Export
  - Figma sync
  - Code generation
  - Documentation
```

#### 5.2 Interactive States Demo
```tsx
// pages/states.tsx
const StatesDemo = () => {
  const [activeState, setActiveState] = useState('default');

  const states = ['default', 'hover', 'pressed', 'dragging', 'settling', 'disabled'];

  return (
    <div className="states-showcase">
      <ClayCard className="stage">
        <motion.div
          animate={getStateAnimation(activeState)}
          transition={{ type: 'spring', ...physicsPresets.clay }}
        >
          <ClayButton>Interactive Element</ClayButton>
        </motion.div>
      </ClayCard>

      <div className="state-controls">
        {states.map(state => (
          <ClayButton
            key={state}
            colorway={activeState === state ? 'mint' : 'neutral'}
            onClick={() => {
              setActiveState(state);
              audioEngine.playClayClick('soft');
            }}
          >
            {state}
          </ClayButton>
        ))}
      </div>

      <div className="state-inspector">
        <pre>{JSON.stringify(getStateTokens(activeState), null, 2)}</pre>
      </div>
    </div>
  );
};
```

#### 5.3 Design System Documentation
```tsx
// pages/docs.tsx - Interactive documentation
const ComponentDocs = () => {
  return (
    <div className="docs-layout">
      <nav className="docs-nav">
        {/* Animated sidebar with clay cards */}
      </nav>

      <main className="docs-content">
        <section className="component-preview">
          {/* Live component with all variants */}
          <VariantMatrix component="ClayButton" />
        </section>

        <section className="interaction-playground">
          {/* Try all states */}
          <StatePlayground component="ClayButton" />
        </section>

        <section className="token-explorer">
          {/* Visual token reference */}
          <TokenVisualizer tokens={buttonTokens} />
        </section>

        <section className="code-export">
          {/* Copy-paste ready code */}
          <CodeBlock language="tsx" code={generateCode('ClayButton')} />
        </section>
      </main>
    </div>
  );
};
```

---

## 🔧 CLI COMMANDS

```bash
# Development
mochi dev              # Start dev server with hot reload
mochi dev --audio      # Enable audio engine
mochi dev --shaders    # Enable WebGL shaders

# Building
mochi build            # Production build
mochi build --analyze  # Bundle analysis
mochi preview          # Preview production build

# Tokens
mochi tokens           # Export to all formats
mochi tokens --figma   # Export to Figma only
mochi tokens --css     # Export CSS variables only
mochi tokens --watch   # Watch for changes

# Components
mochi component        # Scaffold new component
mochi component --name ClayNew --type primitive
mochi component --name ClayEffect --type animation

# Testing
mochi test             # Run test suite
mochi test --visual    # Visual regression tests
mochi test --a11y      # Accessibility tests
mochi test --motion    # Motion/animation tests

# Documentation
mochi docs             # Build documentation
mochi docs --serve     # Serve docs locally
mochi storybook        # Start Storybook

# Audio
mochi audio            # Generate audio assets
mochi audio --preview  # Preview all sounds
mochi audio --export   # Export audio sprites
```

---

## 📦 DEPENDENCIES TO ADD

```json
{
  "dependencies": {
    "three": "^0.165.0",
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^10.0.0",
    "@react-three/postprocessing": "^3.0.0",
    "gsap": "^3.13.0",
    "@gsap/react": "^2.1.0",
    "howler": "^2.2.4",
    "@tsparticles/react": "^3.0.0",
    "@tsparticles/slim": "^3.0.0",
    "lenis": "^1.1.0",
    "split-type": "^0.3.4"
  },
  "devDependencies": {
    "@types/three": "^0.165.0",
    "@types/howler": "^2.2.11",
    "storybook": "^8.0.0",
    "@storybook/react": "^8.0.0",
    "@storybook/addon-a11y": "^8.0.0",
    "@storybook/addon-interactions": "^8.0.0",
    "lighthouse": "^12.0.0"
  }
}
```

---

## 🎨 UNIQUE DESIGN SYSTEM LANGUAGE

### Semantic Naming Convention
```
[context]-[property]-[variant]-[state]

Examples:
  surface-clay-resting-default
  surface-clay-hovering-elevated
  surface-clay-pressing-compressed
  action-button-primary-resting
  action-button-primary-hovering
  action-button-primary-pressing
  feedback-success-glow-pulsing
  feedback-error-shake-vibrating
```

### Temporal Tokens
```
  temporal-instant: 50ms   (micro-interactions)
  temporal-fast: 150ms    (button presses)
  temporal-normal: 300ms  (state transitions)
  temporal-slow: 500ms    (page transitions)
  temporal-luxurious: 800ms (hero animations)
  temporal-ambient: 4000ms (breathing/floating)
```

### Sonic Tokens
```
  sonic-click-soft: { freq: 800, duration: 50, decay: exponential }
  sonic-click-firm: { freq: 400, duration: 100, decay: linear }
  sonic-squish: { noise: true, filter: bandpass, duration: 300 }
  sonic-pop: { freq: 1200, duration: 80, harmonics: [2, 3] }
  sonic-slide: { glissando: true, from: 400, to: 800 }
```

---

## 🧪 TESTING STRATEGY

| Test Type | Tool | Coverage |
|-----------|------|----------|
| Unit | Vitest | Components, hooks, utilities |
| Visual | Chromatic | All component states |
| Motion | Lottie + pixelmatch | Animation accuracy |
| Audio | Web Audio API tests | Frequency, timing |
| Accessibility | axe-core + Lighthouse | WCAG 2.1 AA |
| Performance | Lighthouse CI | LCP < 2.5s, CLS < 0.1 |
| Responsive | Playwright | All breakpoints |

---

## 📊 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Lighthouse Score | > 95 | Performance + A11y + Best Practices |
| First Contentful Paint | < 1.5s | Chrome DevTools |
| Time to Interactive | < 3.5s | Web Vitals |
| Animation Frame Rate | 60fps | Chrome FPS meter |
| Audio Latency | < 50ms | Web Audio API timestamp |
| Token Coverage | 100% | Design token audit |
| Component Reuse | > 80% | Code analysis |

---

## 🚀 DEPLOYMENT

```bash
# Static hosting (Vercel/Netlify)
mochi build
vercel --prod

# With edge functions
mochi build --edge

# Docker
mochi build --docker
docker build -t mochi-ui .
docker run -p 3000:3000 mochi-ui
```

---

## 📞 HANDOFF CHECKLIST

- [ ] All source files committed
- [ ] Design tokens exported to Figma
- [ ] Storybook stories written
- [ ] Audio assets generated
- [ ] Documentation complete
- [ ] Performance budget met
- [ ] Accessibility audit passed
- [ ] Browser testing complete (Chrome, Safari, Firefox, Edge)
- [ ] Mobile testing complete (iOS Safari, Android Chrome)
- [ ] README updated with setup instructions
- [ ] CLI commands documented
- [ ] Team training session scheduled

---

**Prepared by:** Mochi UI Team  
**Version:** 2.0 Enhanced Experience  
**Date:** 2026-04-03
