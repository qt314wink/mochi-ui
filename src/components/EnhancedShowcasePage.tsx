import React, { useState, useCallback, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  ClayButton,
  ClayCard,
  ClayToggle,
  ClaySlider,
  ClayInput,
  ClayChartBar,
  ClayBadge,
  ClayAvatar,
  ClayTooltip,
  ClayModal,
  ClayProgress,
  ClaySegmentedControl,
  BentoGrid,
  BentoItem,
  FloatingContainer,
  FloatingGroup,
  ClayRebound,
  PhysicsProvider,
  physicsPresets,
} from './index';
import { AudioProvider, useMochiAudio } from './enhanced/audio/AudioEngine';
import { SmoothScrollProvider } from './enhanced/effects/SmoothScroll';
import { AtmosphereCanvas } from './enhanced/effects/AtmosphereCanvas';

// Lazy load heavy 3D components
const ClayScene = lazy(() => import('./enhanced/shaders/ClayScene'));

// Icons
const Icons = {
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  Chart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Message: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Moon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  Sun: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  Audio: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>,
  VolumeOff: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" x2="17" y1="9" y2="15"/><line x1="17" x2="23" y1="9" y2="15"/></svg>,
};

// Inner page content with audio access
const ShowcaseContent: React.FC = () => {
  const [theme, setTheme] = useState('light');
  const [sliderValue, setSliderValue] = useState(65);
  const [toggleChecked, setToggleChecked] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [activeSection, setActiveSection] = useState('hero');
  const [reboundTrigger, setReboundTrigger] = useState(false);
  const [physicsPreset, setPhysicsPreset] = useState<keyof typeof physicsPresets>('clay');
  const [showModal, setShowModal] = useState(false);
  const [progressValue, setProgressValue] = useState(72);
  const [segmentValue, setSegmentValue] = useState('design');

  const audio = useMochiAudio();

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const toggleTheme = () => {
    audio.success();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const triggerRebound = () => {
    audio.playClick('soft');
    setReboundTrigger(true);
    setTimeout(() => setReboundTrigger(false), 600);
  };

  const toggleAudio = () => {
    if (audio.isEnabled) {
      audio.disable();
    } else {
      audio.enable();
    }
  };

  const chartData = [
    { value: 45, label: 'Q1', colorway: 'lavender' as const },
    { value: 70, label: 'Q2', colorway: 'peach' as const },
    { value: 55, label: 'Q3', colorway: 'mint' as const },
    { value: 85, label: 'Q4', colorway: 'blue' as const },
  ];

  const sections = [
    { id: 'hero', label: 'Hero' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'inputs', label: 'Inputs' },
    { id: 'toggles', label: 'Toggles' },
    { id: 'charts', label: 'Charts' },
    { id: 'bento', label: 'Bento' },
    { id: 'physics', label: 'Physics' },
    { id: 'audio', label: 'Audio' },
    { id: 'threeD', label: '3D' },
  ];

  return (
    <PhysicsProvider config={physicsPresets[physicsPreset]}>
      <div 
        ref={containerRef}
        style={{ 
          minHeight: '100vh', 
          background: 'var(--bg-base)', 
          transition: 'background 0.3s',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
        }}
      >
        {/* Progress Bar at top */}
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'var(--mochi-mint)',
            transformOrigin: 'left',
            scaleX: scrollYProgress,
            zIndex: 1000,
          }}
        />

        {/* Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(var(--bg-surface-rgb), 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FloatingContainer amplitude={4} frequency={0.8}>
                <motion.div 
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, var(--mochi-mint), var(--mochi-sage))',
                    boxShadow: 'var(--shadow-clay)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'white',
                    fontSize: 18,
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  M
                </motion.div>
              </FloatingContainer>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Mochi UI
                </h1>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  v2.0 Enhanced Experience
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Audio Toggle */}
              <ClayTooltip content={audio.isEnabled ? 'Audio On' : 'Audio Off'}>
                <ClayButton 
                  size="sm" 
                  colorway={audio.isEnabled ? 'mint' : 'neutral'}
                  onClick={toggleAudio}
                >
                  {audio.isEnabled ? <Icons.Audio /> : <Icons.VolumeOff />}
                </ClayButton>
              </ClayTooltip>

              {/* Physics Preset */}
              <select
                value={physicsPreset}
                onChange={(e) => setPhysicsPreset(e.target.value as keyof typeof physicsPresets)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-clay)',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {Object.keys(physicsPresets).map(preset => (
                  <option key={preset} value={preset}>
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </option>
                ))}
              </select>

              <ClayButton size="sm" colorway="neutral" onClick={toggleTheme}>
                {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
              </ClayButton>
            </div>
          </div>

          {/* Section Navigation */}
          <nav style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px 12px',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}>
            {sections.map(section => (
              <motion.button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: activeSection === section.id ? 'var(--mochi-mint)' : 'transparent',
                  color: activeSection === section.id ? 'white' : 'var(--text-secondary)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {section.label}
              </motion.button>
            ))}
          </nav>
        </header>

        {/* HERO SECTION with 3D */}
        <section id="hero" style={{ padding: '64px 24px', position: 'relative', overflow: 'hidden' }}>
          <motion.div 
            style={{ 
              maxWidth: 1200, 
              margin: '0 auto', 
              textAlign: 'center',
              scale: heroScale,
              opacity: heroOpacity,
            }}
          >
            <FloatingContainer amplitude={8} frequency={0.5}>
              <h1 style={{ 
                fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                fontWeight: 800, 
                marginBottom: 16,
                background: 'linear-gradient(135deg, var(--mochi-mint), var(--mochi-baby-blue), var(--mochi-lavender))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Touch the Clay
              </h1>
            </FloatingContainer>

            <p style={{ 
              fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
              color: 'var(--text-secondary)', 
              marginBottom: 32,
              maxWidth: 600,
              margin: '0 auto 32px',
            }}>
              A multi-sensory design system with spring physics, 3D shaders, 
              spatial audio, and tactile feedback.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <ClayButton colorway="mint" size="lg" onClick={() => {
                triggerRebound();
                document.getElementById('buttons')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Explore Components
              </ClayButton>
              <ClayButton colorway="neutral" size="lg" onClick={() => { audio.playSquish(); setShowModal(true); }}>
                Open Modal Demo
              </ClayButton>
            </div>
          </motion.div>

          {/* 3D Clay Scene */}
          <div style={{ marginTop: 48, maxWidth: 800, margin: '48px auto 0' }}>
            <Suspense fallback={
              <div style={{ 
                height: 400, 
                borderRadius: 28, 
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-clay)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}>
                Loading 3D Scene...
              </div>
            }>
              <ClayScene />
            </Suspense>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* BUTTONS SECTION */}
              {activeSection === 'buttons' && (
                <section id="buttons" style={{ paddingTop: 32 }}>
                  <ScrollReveal>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>
                      Buttons that Demand to be Pressed
                    </h2>
                  </ScrollReveal>

                  <div style={{ marginBottom: 48 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
                      Colorways
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                      {(['mint', 'blue', 'pink', 'lavender', 'peach', 'neutral'] as const).map(cw => (
                        <ClayRebound key={cw} trigger={reboundTrigger}>
                          <ClayButton colorway={cw} onClick={triggerRebound}>
                            {cw.charAt(0).toUpperCase() + cw.slice(1)}
                          </ClayButton>
                        </ClayRebound>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 48 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
                      Sizes & States
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <ClayButton size="sm" colorway="mint">Small</ClayButton>
                      <ClayButton size="md" colorway="blue">Medium</ClayButton>
                      <ClayButton size="lg" colorway="pink">Large</ClayButton>
                      <ClayButton colorway="mint" disabled>Disabled</ClayButton>
                    </div>
                  </div>

                  <ClaySegmentedControl
                    options={[
                      { value: 'design', label: 'Design' },
                      { value: 'code', label: 'Code' },
                      { value: 'preview', label: 'Preview' },
                    ]}
                    value={segmentValue}
                    onChange={setSegmentValue}
                    colorway="mint"
                  />
                </section>
              )}

              {/* CARDS SECTION */}
              {activeSection === 'cards' && (
                <section id="cards" style={{ paddingTop: 32 }}>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>
                    Clay Cards with 3D Tilt
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    <ScrollReveal delay={0}>
                      <ClayCard colorway="mint" header={<ClayBadge colorway="mint">Stats</ClayBadge>}>
                        <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--mochi-mint)' }}>
                          2,847
                        </div>
                        <ClayProgress value={progressValue} colorway="mint" showValue label="Completion" />
                      </ClayCard>
                    </ScrollReveal>

                    <ScrollReveal delay={0.1}>
                      <ClayCard colorway="blue" header={<ClayBadge colorway="blue">Revenue</ClayBadge>}>
                        <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--mochi-sky-blue)' }}>
                          $48.2K
                        </div>
                        <ClaySlider value={sliderValue} onChange={setSliderValue} colorway="blue" showTicks />
                      </ClayCard>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                      <ClayCard colorway="pink">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <ClayAvatar size="lg" fallback="JD" status="online" />
                          <div>
                            <div style={{ fontWeight: 600 }}>John Doe</div>
                            <ClayBadge colorway="mint" pulse>Active</ClayBadge>
                          </div>
                        </div>
                      </ClayCard>
                    </ScrollReveal>
                  </div>
                </section>
              )}


              {/* INPUTS SECTION */}
              {activeSection === 'inputs' && (
                <section id="inputs" style={{ paddingTop: 32 }}>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>
                    Sculpting Inputs
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 600 }}>
                    Inset shadows create recessed channels. Focus states glow with spring-animated scale and color transitions.
                  </p>
                  <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <ClayInput placeholder="Search anything..." value={inputValue} onChange={setInputValue} icon={<Icons.Search />} label="Search" />
                    <ClayInput type="email" placeholder="your@email.com" label="Email" icon={<Icons.Message />} />
                    <ClayInput type="password" placeholder="Enter password" label="Password" error="Must be at least 8 characters" />
                    <ClayInput placeholder="Type a number..." type="number" label="Amount" />
                  </div>
                </section>
              )}

              {/* TOGGLES SECTION */}
              {activeSection === 'toggles' && (
                <section id="toggles" style={{ paddingTop: 32 }}>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>
                    State Changes: Visualizing the Press
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 600 }}>
                    Three-state lifecycle with spring-animated knob movement. Granular haptic feedback on each state transition.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400 }}>
                    {(['mint', 'blue', 'pink', 'lavender'] as const).map(cw => (
                      <ClayToggle key={cw} colorway={cw} label={cw.charAt(0).toUpperCase() + cw.slice(1) + ' Toggle'} checked={toggleChecked} onChange={(v) => { audio.pop(); setToggleChecked(v); }} />
                    ))}
                  </div>
                  <div style={{ marginTop: 48 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Size Variants</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <ClayToggle size="sm" label="Small" />
                      <ClayToggle size="md" label="Medium" />
                      <ClayToggle size="lg" label="Large" />
                    </div>
                  </div>
                </section>
              )}

              {/* CHARTS SECTION */}
              {activeSection === 'charts' && (
                <section id="charts" style={{ paddingTop: 32 }}>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>
                    Sculpting Data
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 600 }}>
                    Inflated 3D cylinders with volumetric shadows. Bars grow from bottom with spring physics and show tooltips on hover.
                  </p>
                  <ClayCard colorway="neutral" style={{ padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 300, gap: 24 }}>
                      {chartData.map((bar, i) => (
                        <ClayChartBar key={bar.label} value={bar.value} label={bar.label} colorway={bar.colorway} delay={i * 200} />
                      ))}
                    </div>
                  </ClayCard>
                  <div style={{ marginTop: 32 }}>
                    <ClaySlider value={sliderValue} onChange={(v) => { audio.slide(sliderValue, v); setSliderValue(v); }} colorway="mint" showTicks label="Adjust data visualization" />
                  </div>
                </section>
              )}

              {/* BENTO SECTION */}
              {activeSection === 'bento' && (
                <section id="bento" style={{ paddingTop: 32 }}>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>
                    Bento Grid Layout
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 600 }}>
                    Japanese bento box inspired layout. No visible borders—depth defines separation. Soft 3D floating cards provide visual hierarchy.
                  </p>
                  <BentoGrid columns={4} gap={24}>
                    <BentoItem colSpan={1} rowSpan={2} delay={0}>
                      <ClayCard colorway="ivory" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                          <div>
                            <ClayBadge colorway="neutral">Overview</ClayBadge>
                            <div style={{ marginTop: 16 }}><Icons.Chart /></div>
                          </div>
                          <div>
                            <div style={{ fontSize: 36, fontWeight: 700 }}>84%</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Completion rate</div>
                          </div>
                        </div>
                      </ClayCard>
                    </BentoItem>
                    <BentoItem colSpan={2} rowSpan={1} delay={0.1}>
                      <ClayCard colorway="blue">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Dashboard Header</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Search and profile</div>
                          </div>
                          <ClayAvatar size="md" fallback="JD" status="online" />
                        </div>
                        <ClayInput placeholder="Search..." icon={<Icons.Search />} style={{ marginTop: 12 }} />
                      </ClayCard>
                    </BentoItem>
                    <BentoItem colSpan={1} rowSpan={1} delay={0.2}>
                      <ClayCard colorway="pink">
                        <Icons.Calendar />
                        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>Upcoming</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>3 events today</div>
                      </ClayCard>
                    </BentoItem>
                    <BentoItem colSpan={1} rowSpan={1} delay={0.3}>
                      <ClayCard colorway="mint">
                        <Icons.Message />
                        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>Messages</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>12 unread</div>
                      </ClayCard>
                    </BentoItem>
                    <BentoItem colSpan={2} rowSpan={1} delay={0.4}>
                      <ClayCard colorway="lavender">
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <FloatingGroup staggerDelay={0.15} baseAmplitude={4}>
                            <ClayBadge colorway="mint">New</ClayBadge>
                            <ClayBadge colorway="blue">Beta</ClayBadge>
                            <ClayBadge colorway="pink">Hot</ClayBadge>
                          </FloatingGroup>
                        </div>
                      </ClayCard>
                    </BentoItem>
                  </BentoGrid>
                </section>
              )}

              {/* PHYSICS SECTION */}
              {activeSection === 'physics' && (
                <section id="physics" style={{ paddingTop: 32 }}>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>
                    Dialing in the Perfect Clay Rebound
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 600 }}>
                    At 0% bounce, a transition is entirely smooth and rigid. Higher bounce values inject the organic, elastic squish that defines Claymorphism.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                    {Object.entries(physicsPresets).map(([name, config]) => (
                      <ClayCard key={name} colorway={name === 'jelly' ? 'mint' : name === 'bouncy' ? 'pink' : name === 'snappy' ? 'blue' : name === 'luxurious' ? 'lavender' : 'neutral'} onClick={() => setPhysicsPreset(name as keyof typeof physicsPresets)} style={{ border: physicsPreset === name ? '2px solid var(--mochi-mint)' : 'none' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{name.charAt(0).toUpperCase() + name.slice(1)}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Bounce: {config.bounce} | Duration: {config.duration}ms</div>
                        <ClayRebound trigger={physicsPreset === name}>
                          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--mochi-mint)', boxShadow: 'var(--shadow-clay)' }} />
                        </ClayRebound>
                      </ClayCard>
                    ))}
                  </div>
                  <div style={{ marginTop: 48 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Floating Animation Demo</h3>
                    <FloatingGroup staggerDelay={0.2} baseAmplitude={6}>
                      <ClayButton colorway="mint">Float 1</ClayButton>
                      <ClayButton colorway="blue">Float 2</ClayButton>
                      <ClayButton colorway="pink">Float 3</ClayButton>
                      <ClayButton colorway="lavender">Float 4</ClayButton>
                    </FloatingGroup>
                  </div>
                </section>
              )}


              {/* AUDIO SECTION */}
              {activeSection === 'audio' && (
                <section id="audio" style={{ paddingTop: 32 }}>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>
                    Spatial Audio Experience
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                    Move your cursor to experience 3D spatial audio. Sounds originate from 
                    UI element positions using HRTF panning.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {(['click', 'hover', 'pop', 'squish', 'success', 'error'] as const).map((sound, i) => (
                      <ClayCard 
                        key={sound} 
                        colorway={['mint', 'blue', 'pink', 'lavender', 'peach', 'neutral'][i] as any}
                        onClick={() => {
                          if (sound === 'click') audio.playClick('medium');
                          else if (sound === 'hover') audio.hover();
                          else if (sound === 'pop') audio.pop();
                          else if (sound === 'squish') audio.playSquish();
                          else if (sound === 'success') audio.success();
                          else if (sound === 'error') audio.error();
                          triggerRebound();
                        }}
                      >
                        <div style={{ textAlign: 'center', padding: 24 }}>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>🔊</div>
                          <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{sound}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                            {sound === 'click' && '800Hz sine, 50ms'}
                            {sound === 'hover' && '400Hz triangle, 30ms'}
                            {sound === 'pop' && '1200Hz→400Hz, 80ms'}
                            {sound === 'squish' && 'Noise burst, bandpass'}
                            {sound === 'success' && 'C-E-G arpeggio'}
                            {sound === 'error' && 'Dissonant saw+sqr'}
                          </div>
                        </div>
                      </ClayCard>
                    ))}
                  </div>
                </section>
              )}

              {/* 3D SECTION */}
              {activeSection === 'threeD' && (
                <section id="threeD" style={{ paddingTop: 32 }}>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>
                    3D SDF Clay Shaders
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                    Real-time raymarched clay with subsurface scattering, 
                    procedural noise displacement, and soft body physics.
                  </p>

                  <div style={{ height: 500, borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow-clay)' }}>
                    <Suspense fallback={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading WebGL...</div>}>
                      <ClayScene />
                    </Suspense>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Modal Demo */}
        <ClayModal 
          isOpen={showModal} 
          onClose={() => { audio.pop(); setShowModal(false); }}
          title="Clay Modal Demo"
          size="md"
        >
          <p style={{ marginBottom: 24 }}>
            This modal uses spring physics for entrance and exit animations. 
            Try pressing the button below to trigger a clay rebound.
          </p>
          <ClayRebound trigger={reboundTrigger}>
            <ClayButton colorway="mint" onClick={triggerRebound}>
              Trigger Rebound
            </ClayButton>
          </ClayRebound>
        </ClayModal>

        {/* Footer */}
        <footer style={{
          marginTop: 64,
          padding: '32px 24px',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: 13,
        }}>
          <FloatingGroup staggerDelay={0.1} baseAmplitude={3}>
            <span>Mochi UI</span>
            <span>•</span>
            <span>Claymorphism</span>
            <span>•</span>
            <span>Spring Physics</span>
            <span>•</span>
            <span>Spatial Audio</span>
          </FloatingGroup>
          <p style={{ marginTop: 8 }}>Built with Astro + Motion + Three.js + Web Audio API</p>
        </footer>
      </div>
    </PhysicsProvider>
  );
};

// Simple scroll reveal wrapper
const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.6, delay, ease: [0.34, 1.56, 0.64, 1] }}
  >
    {children}
  </motion.div>
);

// Wrap with audio + smooth scroll providers
const EnhancedShowcasePage: React.FC = () => (
  <AudioProvider>
    <SmoothScrollProvider>
      <AtmosphereCanvas />
      <ShowcaseContent />
    </SmoothScrollProvider>
  </AudioProvider>
);

export default EnhancedShowcasePage;
