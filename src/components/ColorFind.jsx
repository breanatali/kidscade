import { useState, useRef, useEffect } from 'react';

const COLORS = [
  { name: 'Red', value: '#ff4d4d' },
  { name: 'Orange', value: '#ff922b' },
  { name: 'Yellow', value: '#ffd43b' },
  { name: 'Green', value: '#51cf66' },
  { name: 'Blue', value: '#4dabf7' },
  { name: 'Purple', value: '#b197fc' },
  { name: 'Pink', value: '#f783ac' },
];

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// One round: a target color + 3 random others, all mixed up
function pickRound() {
  const target = COLORS[Math.floor(Math.random() * COLORS.length)];
  const others = shuffled(COLORS.filter((c) => c.name !== target.name)).slice(0, 3);
  return { target, options: shuffled([target, ...others]) };
}

function ColorFind({ onBack }) {
  const [round, setRound] = useState(pickRound);
  const [score, setScore] = useState(0);
  const [celebrating, setCelebrating] = useState(null); // name of the correct pick
  const [wrongId, setWrongId] = useState(null); // name of a wrong pick (for the shake)
  const audioRef = useRef(null);

  // Say the color out loud using the device's built-in voice.
  // The voice itself comes from the device — we just pick the friendliest
  // one available and pitch it up high so it sounds young and cartoonish.
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const kidVoice =
        voices.find((v) => /child|kid|junior/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en') && /female|samantha|zira/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (kidVoice) u.voice = kidVoice;
      u.rate = 0.95;
      u.pitch = 1.7; // high pitch = younger sounding (max is 2)
      window.speechSynthesis.speak(u);
    }
  };

  // Announce each new round (and the first one when the game opens)
  useEffect(() => {
    speak(`Find the ${round.target.name} one!`);
  }, [round]);

  // Happy chime for a correct pick (same C-E-G arpeggio as Memory Match)
  const playChime = () => {
    if (!audioRef.current) {
      audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      const gain = ctx.createGain();
      const when = now + i * 0.12;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(0.4, when + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(when);
      osc.stop(when + 0.35);
    });
  };

  const tapColor = (color) => {
    if (celebrating) return; // pause taps during the celebration
    if (color.name === round.target.name) {
      playChime();
      setCelebrating(color.name);
      setScore((s) => s + 1);
      setTimeout(() => {
        setRound(pickRound());
        setCelebrating(null);
      }, 1200);
    } else {
      // gentle shake, no punishment — toddlers don't lose
      setWrongId(color.name);
      setTimeout(() => setWrongId(null), 500);
    }
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="score">⭐ {score}</div>
      </div>
      <div className="color-prompt">
        <span>Find the</span>
        <span className="prompt-color" style={{ color: round.target.value }}>
          {round.target.name}
        </span>
        <span>one!</span>
        <button
          className="replay-btn"
          onClick={() => speak(`Find the ${round.target.name} one!`)}
          aria-label="Hear it again"
        >
          🔊
        </button>
      </div>
      <div className="color-grid">
        {round.options.map((color) => (
          <button
            key={color.name}
            className={`color-btn${celebrating === color.name ? ' correct' : ''}${wrongId === color.name ? ' wrong' : ''}`}
            style={{ backgroundColor: color.value }}
            onClick={() => tapColor(color)}
            aria-label={color.name}
          />
        ))}
      </div>
    </div>
  );
}

export default ColorFind;
