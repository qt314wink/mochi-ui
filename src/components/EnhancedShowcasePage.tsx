import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
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
  ClaySkeleton,
  BentoGrid,
  BentoItem,
  FloatingContainer,
  FloatingGroup,
  ClayRebound,
  PhysicsProvider,
  physicsPresets,
} from './index';
import { ClayCommandPalette } from './clay/ClayCommandPalette';
import { CursorOrb } from './motion/CursorOrb';
import { SectionReveal } from './motion/SectionReveal';
import { StaggerGrid } from './motion/StaggerGrid';
import { useCountUp } from '../hooks/useCountUp';
import { AudioProvider, useMochiAudio } from './enhanced/audio/AudioEngine';
import { SmoothScrollProvider } from './enhanced/effects/SmoothScroll';
import { AtmosphereCanvas } from './enhanced/effects/AtmosphereCanvas';
import { useActiveSection } from '../hooks/useActiveSection';
import { useResponsive } from './enhanced/responsive/ResponsiveSystem';
import { ErrorBoundary } from './ErrorBoundary';

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
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Layers: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Code: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Figma: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 23H12v-7H8.5A3.5 3.5 0 0 1 5 19.5z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg>,
  Accessibility: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>,
  Palette: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.01 17.461 2 12 2z"/></svg>,
  Command: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>,
};

const sectionIds = ['hero', 'about', 'features', 'components', 'teams', 'start'];

const sectionLabels: Record<string, string> = {
  hero: 'Home',
  about: 'About',
  features: 'Features',
  components: 'Components',
  teams: 'Teams',
  start: 'Get Started',
};

// Command palette items
const commandItems = [
  { id: 'hero',       label: 'Go to Home',        category: 'Navigation', icon: '🏠', shortcut: '1' },
  { id: 'about',      label: 'Go to About',       category: 'Navigation', icon: '📖', shortcut: '2' },
  { id: 'features',   label: 'Go to Features',    category: 'Navigation', icon: '⚡', shortcut: '3' },
  { id: 'components', label: 'Go to Components',  category: 'Navigation', icon: '🧩', shortcut: '4' },
  { id: 'teams',      label: 'Go to Teams',       category: 'Navigation', icon: '👥', shortcut: '5' },
  { id: 'start',      label: 'Get Started',       category: 'Navigation', icon: '🚀', shortcut: '6' },
  { id: 'github',     label: 'Open GitHub',       category: 'Links',      icon: '🐙' },
  { id: 'theme',      label: 'Toggle Dark Mode',  category: 'Settings',   icon: '🌙', shortcut: 'T' },
  { id: 'audio',      label: 'Toggle Audio',      category: 'Settings',   icon: '🔊', shortcut: 'A' },
];

const ShowcaseContent: React.FC = () => {
  const [theme, setTheme] = useState('light');
  const [sliderValue, setSliderValue] = useState(65);
  const [toggleChecked, setToggleChecked] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [reboundTrigger, setReboundTrigger] = useState(false);
  const [physicsPreset, setPhysicsPreset] = useState<keyof typeof physicsPresets>('clay');
  const [showModal, setShowModal] = useState(false);
  const [progressValue, setProgressValue] = useState(72);
  const [segmentValue, setSegmentValue] = useState('design');
  const [cmdOpen, setCmdOpen] = useState(false);

  const audio = useMochiAudio();
  const { prefersReducedMotion } = useResponsive();
  const { activeId, scrollTo } = useActiveSection(sectionIds);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // ── useCountUp — stat cards animate on scroll entry ──
  const revenue   = useCountUp({ to: 48.2,  decimals: 1, prefix: '$', suffix: 'K', duration: 1400 });
  const users     = useCountUp({ to: 2847,  decimals: 0, duration: 1600 });
  const uptime    = useCountUp({ to: 99.9,  decimals: 1, suffix: '%', duration: 1200 });

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K → open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
        return;
      }
      // Number keys 1–6 → scroll to section (only when palette is closed)
      if (!cmdOpen) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= sectionIds.length) scrollTo(sectionIds[num - 1]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [scrollTo, cmdOpen]);

  const toggleTheme = useCallback(() => {
    audio.success();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme, audio]);

  const triggerRebound = useCallback(() => {
    audio.playClick('soft');
    setReboundTrigger(true);
    setTimeout(() => setReboundTrigger(false), 600);
  }, [audio]);

  const toggleAudio = useCallback(() => {
    if (audio.isEnabled) audio.disable();
    else audio.enable();
  }, [audio]);

  // Command palette action resolver
  const resolvedCommands = commandItems.map(item => ({
    ...item,
    onSelect: () => {
      if (item.id === 'github')  { window.open('https://github.com/qt314wink/mochi-ui', '_blank'); return; }
      if (item.id === 'theme')   { toggleTheme(); return; }
      if (item.id === 'audio')   { toggleAudio(); return; }
      scrollTo(item.id);
    },
  }));

  const chartData = [
    { value: 45, label: 'Q1', colorway: 'lavender' as const },
    { value: 70, label: 'Q2', colorway: 'peach'    as const },
    { value: 55, label: 'Q3', colorway: 'mint'     as const },
    { value: 85, label: 'Q4', colorway: 'blue'     as const },
  ];

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', background: 'var(--bg-base)', transition: 'background 0.3s' }}>

      {/* Ambient desktop cursor orb */}
      <CursorOrb size={36} hoverSize={56} />

      {/* ⌘K Command Palette */}
      <ClayCommandPalette
        items={resolvedCommands}
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        placeholder="Search pages, components, settings…"
      />

      {/* Scroll progress bar */}
      <motion.div style={{
        position: 'fixed', top: 0, left: 0,
        height: 3, background: 'var(--mochi-mint)',
        zIndex: 1000, width: progressBarWidth,
      }} />

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(var(--bg-surface-rgb, 255, 248, 240), 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FloatingContainer amplitude={4} frequency={0.8}>
              <motion.div
                data-cursor-color="mint"
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--mochi-mint), var(--mochi-sage))',
                  boxShadow: 'var(--shadow-clay)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: 'white', fontSize: 18, cursor: 'pointer',
                }}
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollTo('hero')}
              >M</motion.div>
            </FloatingContainer>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Mochi UI</h1>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Claymorphism Design System</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* ⌘K trigger button */}
            <ClayTooltip content="Command palette (⌘K)">
              <ClayButton size="sm" colorway="neutral" onClick={() => setCmdOpen(true)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icons.Command />
                  <kbd style={{ fontSize: 10, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>⌘K</kbd>
                </span>
              </ClayButton>
            </ClayTooltip>

            <ClayTooltip content={audio.isEnabled ? 'Audio On' : 'Audio Off'}>
              <ClayButton size="sm" colorway={audio.isEnabled ? 'mint' : 'neutral'} onClick={toggleAudio}>
                {audio.isEnabled ? <Icons.Audio /> : <Icons.VolumeOff />}
              </ClayButton>
            </ClayTooltip>

            <select
              value={physicsPreset}
              onChange={(e) => setPhysicsPreset(e.target.value as keyof typeof physicsPresets)}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none',
                background: 'var(--bg-card)', boxShadow: 'var(--shadow-clay)',
                fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer',
              }}
            >
              {Object.keys(physicsPresets).map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>

            <ClayButton size="sm" colorway="neutral" onClick={toggleTheme}>
              {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
            </ClayButton>
          </div>
        </div>

        {/* Section nav */}
        <nav style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 24px 12px',
          display: 'flex', gap: 8,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {sectionIds.map((id) => (
            <motion.button
              key={id}
              onClick={() => scrollTo(id)}
              aria-label={`Go to ${sectionLabels[id]} section`}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none',
                background: activeId === id ? 'var(--mochi-mint)' : 'transparent',
                color: activeId === id ? 'white' : 'var(--text-secondary)',
                fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >{sectionLabels[id]}</motion.button>
          ))}
        </nav>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section id="hero" style={{ padding: 'var(--section-padding-y, 96px) 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <SectionReveal>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <FloatingContainer amplitude={6} frequency={0.5}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 100,
                background: 'var(--bg-card)', boxShadow: 'var(--shadow-clay)',
                fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mochi-mint)' }} />
                v2.0 Now Available — Open Source
              </div>
            </FloatingContainer>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800, lineHeight: 1.1,
              marginBottom: 20, color: 'var(--text-primary)',
            }}>
              The{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--mochi-mint), var(--mochi-baby-blue))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Claymorphism</span>{' '}
              Design System
            </h1>

            <p style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              margin: '0 auto 36px', maxWidth: 560, lineHeight: 1.6,
            }}>
              Mochi UI is a modern React UI component library built around claymorphism —
              soft, tactile interfaces with spring physics, haptic feedback, and accessible
              design tokens. Ship faster with components that feel alive.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <ClayButton
                data-cursor-color="mint"
                colorway="mint" size="lg"
                onClick={() => { audio.playClick('soft'); scrollTo('components'); }}
              >
                Explore Components
              </ClayButton>
              <ClayButton
                data-cursor-color="lavender"
                colorway="neutral" size="lg"
                onClick={() => { audio.playSquish(); window.open('https://github.com/qt314wink/mochi-ui', '_blank'); }}
              >
                View on GitHub
              </ClayButton>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '32px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <SectionReveal>
          <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Built for modern product teams with
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              {['Astro', 'React 19', 'Motion', 'TypeScript', 'Three.js', 'Web Audio API'].map((tech) => (
                <span key={tech} style={{
                  padding: '6px 14px', borderRadius: 100,
                  background: 'var(--bg-card)', boxShadow: 'var(--shadow-clay)',
                  fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
                }}>{tech}</span>
              ))}
            </div>
          </div>
        </SectionReveal>
      </section>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px' }}>

        {/* ── ABOUT ──────────────────────────────────────────────────────────── */}
        <section id="about" style={{ padding: '80px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
            <SectionReveal>
              <div>
                <div style={{ marginBottom: 16 }}><ClayBadge colorway="mint">What is Claymorphism?</ClayBadge></div>
                <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  Soft UI that responds to touch
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                  Claymorphism is the evolution of neumorphism — it replaces harsh shadows
                  with soft, organic depth that mimics real clay. Every element in Mochi UI
                  has physical presence: buttons compress when pressed, cards lift on hover,
                  and inputs recess into the surface.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Unlike flat design or glassmorphism, claymorphism creates interfaces that
                  feel <strong>tactile and responsive</strong>. It is the perfect middle ground
                  for product teams who want personality without sacrificing usability.
                </p>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <StaggerGrid staggerDelay={0.1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { colorway: 'mint',  icon: <Icons.Zap />,           iconBg: 'var(--mochi-mint)',     title: 'Spring Physics',      desc: 'Every interaction uses real mass and damping' },
                  { colorway: 'blue',  icon: <Icons.Accessibility />, iconBg: 'var(--mochi-sky-blue)', title: 'Accessibility First', desc: 'WCAG 2.1 AA compliant with reduced motion support' },
                  { colorway: 'pink',  icon: <Icons.Palette />,       iconBg: 'var(--mochi-blossom)',  title: 'Design Tokens',      desc: 'Figma-ready variables with automatic dark mode' },
                ].map((card) => (
                  <ClayCard key={card.title} colorway={card.colorway as any} interactive={false}
                    data-cursor-color={card.colorway}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        {card.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{card.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{card.desc}</div>
                      </div>
                    </div>
                  </ClayCard>
                ))}
              </StaggerGrid>
            </SectionReveal>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
        <section id="features" style={{ padding: '80px 0' }}>
          <SectionReveal>
            <div style={{ marginBottom: 32 }}>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}
              >Everything you need to ship faster</motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}
              >Mochi UI combines a comprehensive component library with production-ready tooling for design systems, product teams, and indie developers.</motion.p>
            </div>
          </SectionReveal>

          <StaggerGrid
            staggerDelay={0.08}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}
          >
            {[
              { icon: <Icons.Zap />,           title: 'Spring Physics',   desc: 'Mass-spring-damper physics power every animation. No cubic-bezier guessing.',        color: 'mint' },
              { icon: <Icons.Layers />,         title: '30+ Components',   desc: 'Buttons, cards, inputs, toggles, sliders, charts, modals, tooltips, and more.',      color: 'blue' },
              { icon: <Icons.Figma />,          title: 'Figma Compatible', desc: 'Design tokens map 1:1 between Figma variables and CSS custom properties.',           color: 'pink' },
              { icon: <Icons.Accessibility />,  title: 'A11y Built-In',    desc: 'ARIA labels, keyboard navigation, focus rings, and reduced-motion support.',         color: 'lavender' },
              { icon: <Icons.Code />,           title: 'TypeScript Native', desc: 'Fully typed props, strict inference, and IntelliSense-friendly APIs.',              color: 'peach' },
              { icon: <Icons.Palette />,        title: 'Dark Mode',         desc: 'Automatic theme switching with CSS custom properties and localStorage persistence.', color: 'neutral' },
            ].map((feature) => (
              <ClayCard key={feature.title} colorway={feature.color as any} interactive={false}
                data-cursor-color={feature.color !== 'neutral' ? feature.color : undefined}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--bg-base)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-primary)', marginBottom: 12,
                  boxShadow: 'var(--shadow-clay)',
                }}>{feature.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{feature.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{feature.desc}</p>
              </ClayCard>
            ))}
          </StaggerGrid>
        </section>

        {/* ── COMPONENTS ────────────────────────────────────────────────────────── */}
        <section id="components" style={{ padding: '80px 0' }}>
          <SectionReveal>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Production-ready components</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>Not just demos — real components you can drop into your next project. Every element is optimized for performance, accessibility, and delightful interaction.</p>
            </div>
          </SectionReveal>

          {/* Dashboard Card Demo — useCountUp wired to stats */}
          <SectionReveal delay={0.1}>
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 16 }}>Dashboard Widget</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

                <ClayCard colorway="mint" data-cursor-color="mint">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <ClayBadge colorway="mint">Revenue</ClayBadge>
                    <ClayAvatar size="sm" fallback="JD" colorway="mint" />
                  </div>
                  {/* useCountUp — animates from 0 to $48.2K on scroll entry */}
                  <div
                    ref={revenue.ref as React.RefCallback<HTMLDivElement>}
                    style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--mochi-mint-vivid)', marginBottom: 4 }}
                  >
                    {revenue.display}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Monthly recurring revenue</p>
                  <ClaySlider value={72} onChange={() => {}} colorway="mint" showTicks label="Goal progress" />
                </ClayCard>

                <ClayCard colorway="blue" data-cursor-color="blue">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <ClayBadge colorway="blue">Users</ClayBadge>
                    <div style={{ fontSize: 24 }}>👥</div>
                  </div>
                  {/* useCountUp — animates from 0 to 2,847 */}
                  <div
                    ref={users.ref as React.RefCallback<HTMLDivElement>}
                    style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--mochi-sky-blue)', marginBottom: 4 }}
                  >
                    {users.display}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Active subscribers this month</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icons.Chart />
                    <span style={{ fontSize: 13, color: 'var(--mochi-mint)', fontWeight: 600 }}>+12.5% from last month</span>
                  </div>
                </ClayCard>

                <ClayCard colorway="lavender" variant="stats" data-cursor-color="lavender">
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>System Health</h4>
                  {/* useCountUp on uptime — animates to 99.9% */}
                  <div
                    ref={uptime.ref as React.RefCallback<HTMLDivElement>}
                    style={{ fontSize: 28, fontWeight: 700, color: 'var(--mochi-mint-vivid)', marginBottom: 12, marginTop: 4 }}
                  >
                    {uptime.display}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'API',      value: 99.9 },
                      { label: 'Database', value: 98.2 },
                      { label: 'CDN',      value: 99.5 },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span>{item.label}</span>
                          <span style={{ fontWeight: 600 }}>{item.value}%</span>
                        </div>
                        <ClayProgress
                          value={item.value} size="sm" showValue={false}
                          colorway={item.value > 99 ? 'mint' : 'peach'}
                          scrollTrigger
                        />
                      </div>
                    ))}
                  </div>
                </ClayCard>
              </div>
            </div>
          </SectionReveal>

          {/* Settings Form */}
          <SectionReveal delay={0.15}>
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 16 }}>Settings Form</h3>
              <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <ClayInput placeholder="your@company.com" type="email" label="Work Email" icon={<Icons.Message />} />
                <ClayInput placeholder="Enter password" type="password" label="Password" />
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <ClayToggle colorway="mint" label="Enable notifications" checked={toggleChecked} onChange={(v) => { audio.pop(); setToggleChecked(v); }} />
                  <ClayToggle colorway="blue" label="Dark mode" checked={theme === 'dark'} onChange={toggleTheme} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <ClayButton colorway="mint" data-cursor-color="mint">Save Changes</ClayButton>
                  <ClayButton colorway="neutral">Cancel</ClayButton>
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* Buttons & Controls */}
          <SectionReveal delay={0.2}>
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 16 }}>Buttons &amp; Controls</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                {(['mint', 'blue', 'pink', 'lavender', 'peach', 'neutral'] as const).map(cw => (
                  <ClayButton key={cw} colorway={cw} data-cursor-color={cw !== 'neutral' ? cw : undefined} onClick={triggerRebound}>
                    {cw.charAt(0).toUpperCase() + cw.slice(1)}
                  </ClayButton>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <ClayButton colorway="mint" icon={<Icons.Search />} iconPosition="leading">Search</ClayButton>
                <ClayButton colorway="blue" icon={<Icons.Bell />} iconPosition="trailing">Notify</ClayButton>
                <ClayRebound trigger={reboundTrigger}>
                  <ClayButton colorway="lavender" data-cursor-color="lavender" onClick={triggerRebound}>Rebound</ClayButton>
                </ClayRebound>
              </div>
            </div>
          </SectionReveal>

          {/* Data Viz — ClayChartBar scroll-triggered via its own IntersectionObserver */}
          <SectionReveal delay={0.1}>
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 16 }}>Data Visualization</h3>
              <ClayCard colorway="neutral">
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 240, gap: 24, padding: '0 16px' }}>
                  {chartData.map((bar, i) => (
                    <ClayChartBar key={bar.label} value={bar.value} label={bar.label} colorway={bar.colorway} delay={i * 150} />
                  ))}
                </div>
              </ClayCard>
              <div style={{ marginTop: 24 }}>
                <ClaySlider value={sliderValue} onChange={(v) => { audio.slide(sliderValue, v); setSliderValue(v); }} colorway="mint" showTicks label="Adjust projection" />
              </div>
            </div>
          </SectionReveal>

          {/* Tooltips */}
          <SectionReveal delay={0.1}>
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 16 }}>Tooltips</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                <ClayTooltip content="Top tooltip" position="top"><ClayButton colorway="mint" size="sm">Hover Top</ClayButton></ClayTooltip>
                <ClayTooltip content="Bottom tooltip" position="bottom"><ClayButton colorway="blue" size="sm">Hover Bottom</ClayButton></ClayTooltip>
                <ClayTooltip content="Left tooltip" position="left"><ClayButton colorway="lavender" size="sm">Hover Left</ClayButton></ClayTooltip>
                <ClayTooltip content="Right tooltip" position="right"><ClayButton colorway="peach" size="sm">Hover Right</ClayButton></ClayTooltip>
              </div>
            </div>
          </SectionReveal>

          {/* Segmented Control */}
          <SectionReveal delay={0.15}>
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 16 }}>Segmented Control</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                <ClaySegmentedControl
                  options={[
                    { value: 'design', label: 'Design' },
                    { value: 'code',   label: 'Code' },
                    { value: 'docs',   label: 'Docs' },
                  ]}
                  value={segmentValue}
                  onChange={(v) => { audio.pop(); setSegmentValue(v); }}
                  colorway="mint"
                />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  Selected: <strong style={{ color: 'var(--text-primary)' }}>{segmentValue}</strong>
                </p>
              </div>
            </div>
          </SectionReveal>

          {/* Skeleton Loading */}
          <SectionReveal delay={0.2}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 16 }}>Skeleton Loading</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                <ClayCard colorway="neutral">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <ClaySkeleton variant="circular" width={40} height={40} animation="pulse" />
                    <div style={{ flex: 1 }}>
                      <ClaySkeleton variant="text" width="60%" animation="pulse" />
                      <ClaySkeleton variant="text" width="40%" animation="pulse" />
                    </div>
                  </div>
                  <ClaySkeleton variant="rounded" height={80} animation="wave" />
                </ClayCard>
                <ClayCard colorway="neutral">
                  <ClaySkeleton variant="rectangular" height={120} animation="pulse" />
                  <div style={{ marginTop: 12 }}>
                    <ClaySkeleton variant="text" width="80%" animation="wave" />
                    <ClaySkeleton variant="text" width="50%" animation="wave" />
                  </div>
                </ClayCard>
              </div>
            </div>
          </SectionReveal>
        </section>

        {/* ── FOR TEAMS ────────────────────────────────────────────────────────── */}
        <section id="teams" style={{ padding: '80px 0' }}>
          <SectionReveal>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Built for every team</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>Whether you are a designer sketching in Figma or a developer shipping to production, Mochi UI fits your workflow.</p>
            </div>
          </SectionReveal>
          <StaggerGrid
            staggerDelay={0.12}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}
          >
            {[
              {
                colorway: 'blue', iconBg: 'var(--mochi-sky-blue)', icon: <Icons.Figma />,
                title: 'For Designers',
                items: [
                  'Figma variable library with 1:1 token mapping',
                  'Auto-layout components that mirror React props',
                  'Dark mode preview baked into every frame',
                  'Accessibility annotations for WCAG compliance',
                ],
              },
              {
                colorway: 'mint', iconBg: 'var(--mochi-mint)', icon: <Icons.Code />,
                title: 'For Developers',
                items: [
                  'Tree-shakeable ESM exports with zero runtime overhead',
                  'TypeScript-native with strict prop inference',
                  'CSS custom properties for instant theming',
                  'SSR-friendly with Astro, Next.js, and Remix',
                ],
              },
            ].map((team) => (
              <ClayCard key={team.title} colorway={team.colorway as any} data-cursor-color={team.colorway}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: team.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    {team.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{team.title}</h3>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, listStyle: 'none' }}>
                  {team.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--mochi-mint)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </ClayCard>
            ))}
          </StaggerGrid>
        </section>

        {/* ── GET STARTED ───────────────────────────────────────────────────────── */}
        <section id="start" style={{ padding: '80px 0' }}>
          <SectionReveal>
            <div style={{
              maxWidth: 640, margin: '0 auto', textAlign: 'center',
              padding: '64px 32px',
              borderRadius: 'var(--radius-squircle-xl)',
              background: 'var(--bg-card)', boxShadow: 'var(--shadow-clay)',
            }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
                Ready to build something soft?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
                Install Mochi UI in seconds and start building claymorphic interfaces
                with spring physics, haptic feedback, and accessible components.
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px',
                borderRadius: 'var(--radius-squircle-sm)',
                background: 'var(--bg-surface)',
                boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.06), inset -3px -3px 6px rgba(255,255,255,0.8)',
                fontFamily: 'var(--font-mono)', fontSize: 14,
                color: 'var(--text-primary)',
                marginBottom: 32, textAlign: 'left',
                justifyContent: 'space-between',
              }}>
                <code>npm install @mochi-ui/react</code>
                <button
                  onClick={() => { navigator.clipboard.writeText('npm install @mochi-ui/react'); audio.success(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}
                >Copy</button>
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <ClayButton
                  colorway="mint" size="lg"
                  data-cursor-color="mint"
                  onClick={() => { audio.playClick('soft'); window.open('https://github.com/qt314wink/mochi-ui', '_blank'); }}
                >Get Started</ClayButton>
                <ClayButton
                  colorway="neutral" size="lg"
                  onClick={() => { audio.playSquish(); setShowModal(true); }}
                >Read Docs</ClayButton>
              </div>
            </div>
          </SectionReveal>
        </section>

        <ClayModal
          isOpen={showModal}
          onClose={() => { audio.pop(); setShowModal(false); }}
          title="Coming Soon" size="md"
        >
          <div style={{ padding: 24 }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Full documentation is currently in development. For now, explore the
              component source code on GitHub or inspect the examples on this page.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <ClayButton colorway="neutral" onClick={() => { audio.pop(); setShowModal(false); }}>Close</ClayButton>
              <ClayButton colorway="mint" onClick={() => { audio.success(); window.open('https://github.com/qt314wink/mochi-ui', '_blank'); }}>View GitHub</ClayButton>
            </div>
          </div>
        </ClayModal>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────────── */}
      <footer style={{
        marginTop: 64, padding: '48px 24px 32px',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            {['Home', 'About', 'Features', 'Components', 'GitHub'].map((link) => (
              <a
                key={link}
                href={link === 'GitHub' ? 'https://github.com/qt314wink/mochi-ui' : `#${link.toLowerCase()}`}
                target={link === 'GitHub' ? '_blank' : undefined}
                rel={link === 'GitHub' ? 'noopener noreferrer' : undefined}
                style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              >{link}</a>
            ))}
          </div>
          <p style={{ marginBottom: 8 }}>Mochi UI — A claymorphism design system built with Astro, React, and Motion.</p>
          <p style={{ fontSize: 12, opacity: 0.7 }}>© {new Date().getFullYear()} Mochi UI. Open source under MIT License.</p>
        </div>
      </footer>
    </div>
  );
};

const EnhancedShowcasePage: React.FC = () => {
  const { prefersReducedMotion } = useResponsive();
  return (
    <AudioProvider>
      <SmoothScrollProvider>
        <ErrorBoundary fallback={
          <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.5,
            background: 'linear-gradient(135deg, rgb(220,235,250) 0%, rgb(240,230,245) 50%, rgb(230,245,235) 100%)' }}
          />
        }>
          <AtmosphereCanvas reducedMotion={prefersReducedMotion} />
        </ErrorBoundary>
        <ShowcaseContent />
      </SmoothScrollProvider>
    </AudioProvider>
  );
};

export default EnhancedShowcasePage;
