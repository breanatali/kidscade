import { useState, useEffect } from 'react';

const NOTE_FREQ = {
  C3: 130.81, F3: 174.61, G3: 196.0,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0, C6: 1046.5,
};

// Gentle 16-step music-box loop (null = rest). Pentatonic, so it harmonizes
// with the Music Maker xylophone no matter what the kid plays over it.
const MELODY = [
  'E5', 'G5', 'A5', 'G5',
  'E5', 'D5', 'C5', null,
  'E5', 'G5', 'A5', 'C6',
  'A5', 'G5', 'E5', 'D5',
];
const BASS = ['C3', 'F3', 'C3', 'G3']; // one soft root note per bar
const STEP = 0.45; // seconds between melody notes

// --- Module-level music engine: one shared instance for the whole app ---
let ctx = null;
let timerId = null;
let nextTime = 0;
let step = 0;

function ensureCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function pluck(freq, when, vol, decay) {
  const osc = ctx.createOscillator();
  osc.type = 'triangle'; // soft, music-box-like
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(vol, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, when + decay);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + decay + 0.1);
}

// Lookahead scheduler: every 200ms, schedule any notes due in the next 0.6s.
// This keeps timing steady even if the browser gets busy.
function schedule() {
  while (nextTime < ctx.currentTime + 0.6) {
    const note = MELODY[step];
    if (note) pluck(NOTE_FREQ[note], nextTime, 0.05, 1.0); // soft melody
    if (step % 4 === 0) pluck(NOTE_FREQ[BASS[step / 4]], nextTime, 0.035, 1.6); // softer bass
    nextTime += STEP;
    step = (step + 1) % MELODY.length; // loop forever
  }
  timerId = setTimeout(schedule, 200);
}

export function startMusic() {
  if (timerId) return; // already playing
  ensureCtx();
  nextTime = ctx.currentTime + 0.1;
  step = 0;
  schedule();
}

export function stopMusic() {
  clearTimeout(timerId);
  timerId = null;
}

function MusicToggle() {
  const [on, setOn] = useState(() => localStorage.getItem('kidscadeMusic') !== 'off');

  // Browsers require a user gesture before audio — start on the first tap anywhere
  useEffect(() => {
    const kickoff = () => {
      if (localStorage.getItem('kidscadeMusic') !== 'off') startMusic();
      window.removeEventListener('pointerdown', kickoff);
    };
    window.addEventListener('pointerdown', kickoff);
    return () => window.removeEventListener('pointerdown', kickoff);
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem('kidscadeMusic', next ? 'on' : 'off');
    if (next) startMusic();
    else stopMusic();
  };

  return (
    <button
      className="music-toggle"
      onClick={toggle}
      aria-label={on ? 'Mute background music' : 'Play background music'}
    >
      {on ? '🎵' : '🔇'}
    </button>
  );
}

export default MusicToggle;
