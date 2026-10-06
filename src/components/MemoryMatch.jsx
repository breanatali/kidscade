import { useState, useRef } from 'react';

const PAIRS = ['🐶', '🐱', '🐸', '🦆', '🐵', '🦁'];

// Build a shuffled deck: two of each emoji, mixed up (Fisher-Yates shuffle)
function shuffledDeck() {
  const deck = [...PAIRS, ...PAIRS].map((emoji, i) => ({ id: i, emoji }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function MemoryMatch({ onBack }) {
  const [cards, setCards] = useState(shuffledDeck);
  const [flipped, setFlipped] = useState([]); // ids of the (max 2) face-up cards
  const [matched, setMatched] = useState([]); // ids of solved pairs
  const [moves, setMoves] = useState(0);
  const audioRef = useRef(null);

  const won = matched.length === cards.length && cards.length > 0;

  // Happy little chime when a pair matches (C-E-G, a major arpeggio)
  const playChime = () => {
    if (!audioRef.current) {
      audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle'; // soft, bell-like tone
      const gain = ctx.createGain();
      const when = now + i * 0.12; // notes cascade, not all at once
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

  const flipCard = (card) => {
    // Ignore taps on: won game, already 2 flipped, this card flipped/matched
    if (won || flipped.length === 2 || flipped.includes(card.id) || matched.includes(card.id)) return;
    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped.map((id) => cards.find((c) => c.id === id));
      if (a.emoji === b.emoji) {
        playChime();
        setTimeout(() => {
          setMatched((m) => [...m, a.id, b.id]);
          setFlipped([]);
        }, 600);
      } else {
        setTimeout(() => setFlipped([]), 1000); // peek, then flip back
      }
    }
  };

  const playAgain = () => {
    setCards(shuffledDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="score">🔁 {moves}</div>
      </div>
      <p className="game-hint">Find the matching pairs! 🃏</p>
      <div className="memory-grid">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          const isMatched = matched.includes(card.id);
          return (
            <button
              key={card.id}
              className={`memory-card${isFlipped ? ' flipped' : ''}${isMatched ? ' matched' : ''}`}
              onClick={() => flipCard(card)}
              aria-label={isFlipped ? card.emoji : 'Hidden card'}
            >
              <div className="memory-inner">
                <div className="memory-face memory-front">⭐</div>
                <div className="memory-face memory-back">{card.emoji}</div>
              </div>
            </button>
          );
        })}
      </div>
      {won && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="win-emoji">🎉</div>
            <h2>You did it!</h2>
            <p>{moves} tries</p>
            <button className="play-again-btn" onClick={playAgain}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoryMatch;
