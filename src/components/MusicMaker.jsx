import { useRef, useState } from 'react';

// C major pentatonic: every combination of these notes sounds good,
// so toddlers can smash away freely and it always sounds like music.
const NOTES = [
  { name: 'C', freq: 261.63, color: '#ff4d4d' },
  { name: 'D', freq: 293.66, color: '#ff922b' },
  { name: 'E', freq: 329.63, color: '#ffd43b' },
  { name: 'G', freq: 392.0, color: '#51cf66' },
  { name: 'A', freq: 440.0, color: '#4dabf7' },
  { name: 'C5', freq: 523.25, color: '#b197fc' },
];

function MusicMaker({ onBack }) {
  const audioRef = useRef(null);
  const [active, setActive] = useState(null); // which pad is lit up

  const playNote = (note) => {
    if (!audioRef.current) {
      audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle'; // soft, xylophone-like tone
    const gain = ctx.createGain();
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // long ring
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.3);
    // Light the pad up briefly
    setActive(note.name);
    setTimeout(() => setActive(null), 300);
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
      <p className="game-hint">Make some music! 🎵</p>
      <div className="music-pads">
        {NOTES.map((note, i) => (
          <button
            key={note.name}
            className={`music-pad${active === note.name ? ' active' : ''}`}
            style={{
              backgroundColor: note.color,
              height: `${230 - i * 18}px`, // taller bars for lower notes, like a xylophone
            }}
            onClick={() => playNote(note)}
            aria-label={`Play ${note.name}`}
          >
            <span className="music-note">♪</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MusicMaker;
