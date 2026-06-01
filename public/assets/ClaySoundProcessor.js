
// ClaySoundProcessor.js - AudioWorklet for procedural clay audio
// Runs on dedicated audio thread for glitch-free synthesis

class ClaySoundProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // State for continuous synthesis
    this.phase = 0;
    this.noisePhase = 0;
    this.envelope = 0;
    this.envelopeState = 'idle'; // idle, attack, decay, release
    this.attackRate = 0.1;
    this.decayRate = 0.98;
    this.releaseRate = 0.95;

    // Handle messages from main thread
    this.port.onmessage = (event) => {
      const { type, sound, intensity, position } = event.data;

      if (type === 'trigger') {
        this.triggerSound(sound, intensity, position);
      }
    };
  }

  triggerSound(sound, intensity, position) {
    this.soundType = sound;
    this.intensity = intensity || 0.5;
    this.position = position || { x: 0.5, y: 0.5 };
    this.envelope = 0.001;
    this.envelopeState = 'attack';
    this.phase = 0;
    this.noisePhase = Math.random() * 1000;

    // Set parameters based on sound type
    switch (sound) {
      case 'click':
        this.attackRate = 0.3;
        this.decayRate = 0.92;
        this.baseFreq = 800 - (this.intensity * 400);
        this.harmonics = [1, 1.5, 2.5];
        break;
      case 'squish':
        this.attackRate = 0.1;
        this.decayRate = 0.97;
        this.baseFreq = 400;
        this.harmonics = [1, 1.2, 1.7];
        break;
      case 'pop':
        this.attackRate = 0.5;
        this.decayRate = 0.88;
        this.baseFreq = 1200;
        this.harmonics = [1, 2, 3];
        break;
      case 'hover':
        this.attackRate = 0.2;
        this.decayRate = 0.95;
        this.baseFreq = 400;
        this.harmonics = [1];
        break;
    }
  }

  // Simplex-like noise for organic texture
  noise(x) {
    const n = Math.sin(x * 12.9898 + this.noisePhase) * 43758.5453;
    return n - Math.floor(n);
  }

  // Band-limited sawtooth for warmth
  sawtooth(phase, harmonics) {
    let sum = 0;
    for (let h = 1; h <= harmonics; h++) {
      sum += Math.sin(phase * h) / h;
    }
    return sum * 2 / Math.PI;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channelCount = output.length;
    const blockSize = output[0].length;

    for (let i = 0; i < blockSize; i++) {
      // Update envelope
      if (this.envelopeState === 'attack') {
        this.envelope += this.attackRate;
        if (this.envelope >= 1) {
          this.envelope = 1;
          this.envelopeState = 'decay';
        }
      } else if (this.envelopeState === 'decay') {
        this.envelope *= this.decayRate;
        if (this.envelope < 0.01) {
          this.envelope = 0;
          this.envelopeState = 'idle';
        }
      }

      // Generate sound
      let sample = 0;

      if (this.envelope > 0.001) {
        // Frequency modulation for clay-like texture
        const freq = this.baseFreq * (1 + this.noise(this.phase * 0.1) * 0.05);

        // Main oscillator
        this.phase += freq / sampleRate;

        if (this.soundType === 'squish') {
          // Noise-based for squish
          sample = (this.noise(this.phase) * 2 - 1) * 0.3;
          // Bandpass effect via sine multiplication
          sample *= Math.sin(this.phase * 0.5);
        } else {
          // Harmonic synthesis
          for (let h = 0; h < this.harmonics.length; h++) {
            const harmonicFreq = freq * this.harmonics[h];
            sample += Math.sin(this.phase * this.harmonics[h]) * (1 / (h + 1));
          }
          sample *= 0.5;
        }

        // Apply envelope
        sample *= this.envelope;

        // Spatial positioning (simple pan)
        const pan = (this.position?.x || 0.5) * 2 - 1; // -1 to 1
        const leftGain = Math.max(0, 1 - pan) * 0.5;
        const rightGain = Math.max(0, 1 + pan) * 0.5;

        // Output to all channels
        for (let ch = 0; ch < channelCount; ch++) {
          const panGain = ch === 0 ? leftGain : rightGain;
          output[ch][i] = sample * panGain * this.intensity;
        }
      } else {
        // Silence
        for (let ch = 0; ch < channelCount; ch++) {
          output[ch][i] = 0;
        }
      }
    }

    return true; // Keep processor alive
  }
}

registerProcessor('clay-sound-processor', ClaySoundProcessor);
