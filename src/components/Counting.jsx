import { useState, useRef, useEffect } from 'react';

const FRUITS = [
  { emoji: '🍎', one: 'apple', many: 'apples' },
  { emoji: '🍊', one: 'orange', many: 'oranges' },
  { emoji: '🍇', one: 'grape', many: 'grapes' },
  { emoji: '🍓', one: 'strawberry', many: 'strawberries' },
  { emoji: '🍌', one: 'banana', many: 'bananas' },
];

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRound() {
  const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
  const count = 1 + Math.floor(Math.random() * 5); // 1 to 5
  const others = shuffled([1, 2, 3, 4, 5].filter((n) => n !== count)).slice(0, 2);
  return { fruit, count, options: shuffled([count, ...others]) };
}

function Counting({ onBack }) {
  const [round, setRound] = useState(pickRound);
  const [score, setScore] = useState(0);
  const [celebrating, setCelebrating] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const audioRef = useRef(null);

  const fruitWord = round.count === 1 ? round.fruit.one : round.fruit.many;

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
    speak(`How many ${fruitWord}?`);
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const tapNumber = (n) => {
    if (celebrating) return;
    if (n === round.count) {
      playChime();
      setCelebrating(n);
      setScore((s) => s + 1);
      setTimeout(() => {
        setRound(pickRound());
        setCelebrating(null);
      }, 1200);
    } else {
      setWrongId(n);
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
        <span>How many {fruitWord}?</span>
        <button
          className="replay-btn"
          onClick={() => speak(`How many ${fruitWord}?`)}
          aria-label="Hear it again"
        >
          🔊
        </button>
      </div>
      <div className="count-fruits">
        {Array.from({ length: round.count }).map((_, i) => (
          <span key={i}>{round.fruit.emoji}</span>
        ))}
      </div>
      <div className="count-answers">
        {round.options.map((n) => (
          <button
            key={n}
            className={`count-btn${celebrating === n ? ' correct' : ''}${wrongId === n ? ' wrong' : ''}`}
            onClick={() => tapNumber(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Counting;
