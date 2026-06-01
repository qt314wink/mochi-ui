import React, { createContext, useContext, useRef, useCallback } from 'react';

// Audio Engine for Mochi UI
// Synthesizes clay-like sounds procedurally using Web Audio API
// No external audio files needed - everything is generated in real-time

interface AudioContextType {
  playClick: (intensity: 'soft' | 'medium' | 'firm') => void;
  playSquish: () => void;
  pop: () => void;
  slide: (from: number, to: number) => void;
  success: () => void;
  error: () => void;
  hover: () => void;
  enable: () => void;
  disable: () => void;
  isEnabled: boolean;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useMochiAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useMochiAudio must be used within AudioProvider');
  return ctx;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Master gain
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = 0.3;
      masterGainRef.current.connect(audioCtxRef.current.destination);

      // Simple reverb using impulse response
      reverbRef.current = audioCtxRef.current.createConvolver();
      const rate = audioCtxRef.current.sampleRate;
      const length = rate * 0.5; // 0.5 seconds
      const impulse = audioCtxRef.current.createBuffer(2, length, rate);

      for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          // Exponential decay
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (rate * 0.1));
        }
      }

      reverbRef.current.buffer = impulse;
      reverbRef.current.connect(masterGainRef.current);
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playClick = useCallback((intensity: 'soft' | 'medium' | 'firm' = 'soft') => {
    if (!enabledRef.current) return;
    initAudio();
    const ctx = audioCtxRef.current!;

    // Synthesize clay "thock" - two oscillators for body and snap
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    const baseFreq = intensity === 'soft' ? 800 : intensity === 'medium' ? 600 : 400;

    // Body oscillator (triangle for warmth)
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    // Snap oscillator (sine for clarity)
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);

    // Envelopes
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    // Lowpass to soften
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;

    // Connect
    osc1.connect(gain1).connect(filter);
    osc2.connect(gain2).connect(filter);
    filter.connect(masterGainRef.current!);

    // Play
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.2);
  }, [initAudio]);

  const playSquish = useCallback(() => {
    if (!enabledRef.current) return;
    initAudio();
    const ctx = audioCtxRef.current!;

    // Noise burst for squish sound
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter for "wet" squish character
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);
    filter.Q.value = 3;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    noise.connect(filter).connect(gain).connect(masterGainRef.current!);
    noise.start();
  }, [initAudio]);

  const pop = useCallback(() => {
    if (!enabledRef.current) return;
    initAudio();
    const ctx = audioCtxRef.current!;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain).connect(masterGainRef.current!);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, [initAudio]);

  const slide = useCallback((from: number, to: number) => {
    if (!enabledRef.current) return;
    initAudio();
    const ctx = audioCtxRef.current!;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(to, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);

    osc.connect(gain).connect(masterGainRef.current!);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, [initAudio]);

  const success = useCallback(() => {
    if (!enabledRef.current) return;
    initAudio();
    const ctx = audioCtxRef.current!;
    const now = ctx.currentTime;

    // Major chord arpeggio: C - E - G
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

      osc.connect(gain).connect(masterGainRef.current!);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }, [initAudio]);

  const error = useCallback(() => {
    if (!enabledRef.current) return;
    initAudio();
    const ctx = audioCtxRef.current!;
    const now = ctx.currentTime;

    // Dissonant interval
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.value = 200;
    osc2.type = 'square';
    osc2.frequency.value = 207; // Slightly detuned for dissonance

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGainRef.current!);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }, [initAudio]);

  const hover = useCallback(() => {
    if (!enabledRef.current) return;
    initAudio();
    const ctx = audioCtxRef.current!;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 400;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain).connect(masterGainRef.current!);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, [initAudio]);

  const value: AudioContextType = {
    playClick,
    playSquish,
    pop,
    slide,
    success,
    error,
    hover,
    enable: () => { enabledRef.current = true; },
    disable: () => { enabledRef.current = false; },
    isEnabled: enabledRef.current,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;
