import { useState, useRef, useEffect } from 'react';

const SHAPES = [
  { name: 'Circle', className: 'shape-circle' },
  { name: 'Square', className: 'shape-square' },
  { name: 'Triangle', className: 'shape-triangle' },
  { name: 'Star', className: 'shape-star' },
  { name: 'Diamond', className: 'shape-diamond' },
];

// One color per round so the game is about SHAPE, not color
const ROUND_COLORS = ['#9775fa', '#ff6b9d', '#4dabf7', '#ffa94d'];

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRound() {
  const target = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const others = shuffled(SHAPES.filter((s) => s.name !== target.name)).slice(0, 3);
  return {
    target,
    options: shuffled([target, ...others]),
    color: ROUND_COLORS[Math.floor(Math.random() * ROUND_COLORS.length)],
  };
}

function ShapeFind({ onBack }) {
  const [round, setRound] = useState(pickRound);
  const [score, setScore] = useState(0);
  const [celebrating, setCelebrating] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const audioRef = useRef(null);

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
      u.pitch = 1.7;
      window.speechSynthesis.speak(u);
    }
  };

  useEffect(() => {
    speak(`Find the ${round.target.name.toLowerCase()}!`);
  }, [round]);

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

  const tapShape = (shape) => {
    if (celebrating) return;
    if (shape.name === round.target.name) {
      playChime();
      setCelebrating(shape.name);
      setScore((s) => s + 1);
      setTimeout(() => {
        setRound(pickRound());
        setCelebrating(null);
      }, 1200);
    } else {
      setWrongId(shape.name);
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
        <span className="prompt-color">{round.target.name}</span>
        <button
          className="replay-btn"
          onClick={() => speak(`Find the ${round.target.name.toLowerCase()}!`)}
          aria-label="Hear it again"
        >
          🔊
        </button>
      </div>
      <div className="color-grid">
        {round.options.map((shape) => (
          <button
            key={shape.name}
            className={`shape-btn${celebrating === shape.name ? ' correct' : ''}${wrongId === shape.name ? ' wrong' : ''}`}
            onClick={() => tapShape(shape)}
            aria-label={shape.name}
          >
            <div className={`shape ${shape.className}`} style={{ backgroundColor: round.color }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ShapeFind;
