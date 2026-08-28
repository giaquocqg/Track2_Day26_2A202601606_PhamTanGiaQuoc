// kit/arena_ui/core/sounds.js
//
// COLOSSEUM — 8-bit sound effects synthesis using Web Audio API
// Phase 3: Audio System
//
// This module provides minimal 8-bit style sound effects for the arena UI.
// All sounds are synthesized using Web Audio API oscillators - no external audio files needed.
//
// Usage:
//   import { playSound, setVolume, initAudio } from './core/sounds.js';
//   playSound('hit');      // Play hit/slash sound
//   playSound('victory'); // Play victory fanfare
//   setVolume(0.5);       // Set volume to 50%
//
// Sound types:
//   'hit'      - Sharp slash sound for verified claims
//   'miss'     - Low buzz for false claims
//   'damage'   - Thud for HP loss
//   'critical' - Alarm for critical HP
//   'victory'  - Triumphant fanfare for winning
//   'defeat'   - Sad descending tone for losing
//   'roundStart' - Bell for round transitions
//   'ko'       - Explosion for KO
//   'deny'     - Shield clang for gateway denial
//   'claim'    - Chime for claim filing
//   'button'   - Click for UI buttons

let audioContext = null;
let masterVolume = 0.3; // Default 30% volume
let audioInitialized = false;

// ---------------------------------------------------------------------------
// Audio Context initialization
// ---------------------------------------------------------------------------

/**
 * Initialize the audio context. Must be called from a user gesture (click/tap)
 * to comply with browser autoplay policies.
 * @returns {AudioContext} The audio context
 */
export function initAudio() {
  if (audioContext) {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    audioInitialized = true;
    return audioContext;
  }

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioInitialized = true;
    return audioContext;
  } catch (e) {
    console.warn('[arena_ui/sounds] Web Audio API not supported:', e);
    return null;
  }
}

/**
 * Check if audio is initialized and ready
 * @returns {boolean}
 */
export function isAudioReady() {
  return audioInitialized && audioContext && audioContext.state === 'running';
}

// ---------------------------------------------------------------------------
// Volume control
// ---------------------------------------------------------------------------

/**
 * Set master volume (0.0 to 1.0)
 * @param {number} vol - Volume level
 */
export function setVolume(vol) {
  masterVolume = Math.max(0, Math.min(1, vol));
}

/**
 * Get current master volume
 * @returns {number}
 */
export function getVolume() {
  return masterVolume;
}

// ---------------------------------------------------------------------------
// Sound synthesis helpers
// ---------------------------------------------------------------------------

/**
 * Create an oscillator with envelope
 * @param {string} type - Oscillator type ('square', 'sawtooth', 'triangle', 'sine')
 * @param {number} frequency - Starting frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume (0-1)
 * @param {object} options - Additional options
 * @returns {void}
 */
function playTone(type, frequency, duration, volume, options = {}) {
  if (!audioContext) {
    initAudio();
    if (!audioContext) return;
  }

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

  // Apply frequency slide if specified
  if (options.frequencyEnd) {
    osc.frequency.exponentialRampToValueAtTime(
      options.frequencyEnd,
      audioContext.currentTime + duration
    );
  }

  // Envelope
  const vol = volume * masterVolume;
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(vol, audioContext.currentTime + (options.attack || 0.01));
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + duration);
}

/**
 * Play a noise burst (for impact/explosion sounds)
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume (0-1)
 */
function playNoise(duration, volume) {
  if (!audioContext) return;

  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  noise.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, audioContext.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + duration);

  const vol = volume * masterVolume;
  gain.gain.setValueAtTime(vol, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  noise.start();
  noise.stop(audioContext.currentTime + duration);
}

/**
 * Play a chord (multiple frequencies)
 * @param {string} type - Oscillator type
 * @param {number[]} frequencies - Array of frequencies
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume (0-1)
 */
function playChord(type, frequencies, duration, volume) {
  frequencies.forEach((freq, i) => {
    playTone(type, freq, duration + i * 0.05, volume / frequencies.length);
  });
}

// ---------------------------------------------------------------------------
// Sound effects
// ---------------------------------------------------------------------------

/**
 * Hit/Slash sound - sharp attack sound for verified claims
 */
function soundHit() {
  playTone('square', 800, 0.1, 0.3);
  playTone('square', 600, 0.08, 0.2);
}

/**
 * Miss/Buzz sound - low buzzer for false claims
 */
function soundMiss() {
  playTone('sawtooth', 120, 0.3, 0.25);
  playTone('square', 100, 0.3, 0.2);
}

/**
 * Damage/Thud sound - impact for HP loss
 */
function soundDamage() {
  playNoise(0.15, 0.4);
  playTone('sine', 150, 0.2, 0.3);
}

/**
 * Critical alarm - urgent sound for critical HP (<20%)
 */
function soundCritical() {
  playTone('square', 440, 0.1, 0.25);
  playTone('square', 880, 0.1, 0.25);
  playTone('square', 440, 0.1, 0.25);
}

/**
 * Victory fanfare - triumphant ascending tones
 */
function soundVictory() {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  playChord('square', notes, 0.3, 0.25);
  setTimeout(() => playChord('square', [784, 988, 1175], 0.25, 0.2), 200);
}

/**
 * Defeat sound - sad descending tones
 */
function soundDefeat() {
  const notes = [392, 349, 294, 262]; // G4, F4, D4, C4
  notes.forEach((freq, i) => {
    setTimeout(() => playTone('triangle', freq, 0.4, 0.3), i * 150);
  });
}

/**
 * Round start bell - announcement sound
 */
function soundRoundStart() {
  playTone('sine', 880, 0.1, 0.3);
  setTimeout(() => playTone('sine', 1108, 0.15, 0.25), 100);
  setTimeout(() => playTone('sine', 1318, 0.2, 0.2), 200);
}

/**
 * KO explosion - dramatic end sound
 */
function soundKo() {
  playNoise(0.5, 0.5);
  playTone('sawtooth', 200, 0.3, 0.3, { frequencyEnd: 50 });
  playTone('square', 100, 0.4, 0.25);
}

/**
 * Denial shield sound - gateway denial
 */
function soundDeny() {
  playTone('triangle', 300, 0.08, 0.3);
  playTone('triangle', 450, 0.06, 0.2);
}

/**
 * Claim chime - filing a claim
 */
function soundClaim() {
  playTone('sine', 1200, 0.1, 0.2);
  setTimeout(() => playTone('sine', 1500, 0.15, 0.15), 80);
}

/**
 * Button click - UI interaction
 */
function soundButton() {
  playTone('square', 600, 0.05, 0.15);
}

// ---------------------------------------------------------------------------
// Sound registry and play function
// ---------------------------------------------------------------------------

const SOUNDS = {
  hit: soundHit,
  miss: soundMiss,
  damage: soundDamage,
  critical: soundCritical,
  victory: soundVictory,
  defeat: soundDefeat,
  roundStart: soundRoundStart,
  ko: soundKo,
  deny: soundDeny,
  claim: soundClaim,
  button: soundButton,
  // Aliases
  slash: soundHit,
  buzz: soundMiss,
  thud: soundDamage,
  alarm: soundCritical,
  fanfare: soundVictory,
  crash: soundDefeat,
  bell: soundRoundStart,
  explosion: soundKo,
  shield: soundDeny,
  chime: soundClaim,
  click: soundButton,
};

/**
 * Play a sound effect by name.
 * @param {string} name - Sound name (see SOUNDS registry)
 * @param {boolean} autoInit - Auto-initialize audio if not ready (default: true)
 */
export function playSound(name, autoInit = true) {
  const sound = SOUNDS[name];
  if (!sound) {
    console.warn(`[arena_ui/sounds] Unknown sound: ${name}`);
    return;
  }

  if (autoInit && !audioInitialized) {
    initAudio();
  }

  try {
    sound();
  } catch (e) {
    console.warn(`[arena_ui/sounds] Error playing sound "${name}":`, e);
  }
}

/**
 * Get list of available sound names
 * @returns {string[]}
 */
export function getAvailableSounds() {
  return Object.keys(SOUNDS);
}

// Export sound types for type checking
export const SOUND_TYPES = Object.freeze(Object.keys(SOUNDS));
