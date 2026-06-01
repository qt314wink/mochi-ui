import React, { useRef, useCallback, useEffect } from 'react';

// Spatial Audio Engine with HRTF positioning
// Creates 3D audio field that follows cursor position

interface SpatialAudioConfig {
  panningModel: 'equalpower' | 'HRTF';
  distanceModel: 'linear' | 'inverse' | 'exponential';
  refDistance: number;
  maxDistance: number;
  rolloffFactor: number;
  coneInnerAngle: number;
  coneOuterAngle: number;
  coneOuterGain: number;
}

const defaultConfig: SpatialAudioConfig = {
  panningModel: 'HRTF',        // Head-related transfer function for realistic 3D
  distanceModel: 'inverse',
  refDistance: 1,
  maxDistance: 10000,
  rolloffFactor: 1,
  coneInnerAngle: 360,
  coneOuterAngle: 0,
  coneOuterGain: 0,
};

export class SpatialAudioEngine {
  private ctx: AudioContext;
  private listener: AudioListener;
  private masterGain: GainNode;
  private panner: PannerNode;
  private config: SpatialAudioConfig;

  constructor(config: Partial<SpatialAudioConfig> = {}) {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.config = { ...defaultConfig, ...config };

    // Set up listener (user position)
    this.listener = this.ctx.listener;
    this.setListenerPosition(window.innerWidth / 2, window.innerHeight / 2, 300);

    // Master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);

    // Panner node for 3D positioning
    this.panner = new PannerNode(this.ctx, {
      panningModel: this.config.panningModel,
      distanceModel: this.config.distanceModel,
      positionX: window.innerWidth / 2,
      positionY: window.innerHeight / 2,
      positionZ: 0,
      refDistance: this.config.refDistance,
      maxDistance: this.config.maxDistance,
      rolloffFactor: this.config.rolloffFactor,
      coneInnerAngle: this.config.coneInnerAngle,
      coneOuterAngle: this.config.coneOuterAngle,
      coneOuterGain: this.config.coneOuterGain,
    });

    this.panner.connect(this.masterGain);
  }

  setListenerPosition(x: number, y: number, z: number) {
    this.listener.positionX.value = x;
    this.listener.positionY.value = y;
    this.listener.positionZ.value = z;
  }

  setListenerOrientation(forwardX: number, forwardY: number, forwardZ: number,
                         upX: number, upY: number, upZ: number) {
    this.listener.forwardX.value = forwardX;
    this.listener.forwardY.value = forwardY;
    this.listener.forwardZ.value = forwardZ;
    this.listener.upX.value = upX;
    this.listener.upY.value = upY;
    this.listener.upZ.value = upZ;
  }

  setSourcePosition(x: number, y: number, z: number) {
    this.panner.positionX.value = x;
    this.panner.positionY.value = y;
    this.panner.positionZ.value = z;
  }

  // Play a sound at a specific 3D position
  playAtPosition(x: number, y: number, z: number, sound: 'click' | 'hover' | 'pop') {
    this.setSourcePosition(x, y, z);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (sound) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        break;
      case 'hover':
        osc.type = 'triangle';
        osc.frequency.value = 400;
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        break;
      case 'pop':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        break;
    }

    osc.connect(gain).connect(this.panner);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Update source position based on cursor
  followCursor(clientX: number, clientY: number) {
    this.setSourcePosition(clientX, clientY, 0);
  }

  resume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  destroy() {
    this.ctx.close();
  }
}

// React hook for spatial audio
export const useSpatialAudio = () => {
  const engineRef = useRef<SpatialAudioEngine | null>(null);

  useEffect(() => {
    engineRef.current = new SpatialAudioEngine();

    const handleMouseMove = (e: MouseEvent) => {
      engineRef.current?.followCursor(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      engineRef.current?.destroy();
    };
  }, []);

  const play = useCallback((sound: 'click' | 'hover' | 'pop', x?: number, y?: number) => {
    const posX = x ?? window.innerWidth / 2;
    const posY = y ?? window.innerHeight / 2;
    engineRef.current?.playAtPosition(posX, posY, 0, sound);
  }, []);

  return { play, engine: engineRef };
};

export default SpatialAudioEngine;
