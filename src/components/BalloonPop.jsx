import { useState, useEffect, useRef } from 'react';

const COLORS = ['#ff1f6d', '#ff1744', '#ff6b00', '#ffea00', '#00e676', '#00cfff', '#2979ff', '#9d00ff'];

function BalloonPop({ onBack }) {
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const audioRef = useRef(null);

  // Builds the shared AudioContext + a pre-made "noise burst" once, then reuses them.
  const getAudio = () => {
    if (!audioRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // A 0.15s burst of random noise shaped like a pop: loud instantly, gone fast.
      // The Math.pow(..., 2) makes the fade-out curve steeper = punchier.
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
      }
      audioRef.current = { ctx, popBuffer: buffer };
    }
    return audioRef.current;
  };

  // A lively balloon "POP!": crisp snap + noise bang + low thump,
  // with slight random variation so no two pops sound identical.
  const playPop = () => {
    const { ctx, popBuffer } = getAudio();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const jitter = () => 0.9 + Math.random() * 0.2; // ±10% random variation

    // 1. The snap — a crisp high blip right at the attack (only 30ms)
    const snap = ctx.createOscillator();
    snap.type = 'square';
    const snapGain = ctx.createGain();
    snap.frequency.setValueAtTime(900 + Math.random() * 600, now);
    snapGain.gain.setValueAtTime(0.15 * jitter(), now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    snap.connect(snapGain);
    snapGain.connect(ctx.destination);
    snap.start(now);
    snap.stop(now + 0.05);

    // 2. The bang — the pre-built noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = popBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6 * jitter(), now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 3. The thump — low sine with a slightly randomized pitch drop
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(280 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.14);
    oscGain.gain.setValueAtTime(0.5 * jitter(), now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  };

  // Spawn a new balloon every 900ms
  useEffect(() => {
    const id = setInterval(() => {
      const balloon = {
        id: Date.now() + Math.random(),
        left: 5 + Math.random() * 80, // horizontal position, in %
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        duration: 4 + Math.random() * 3, // seconds to float up
        size: 60 + Math.random() * 40, // width in px
      };
      // slice(-14) keeps max 15 balloons so the screen never floods
      setBalloons((prev) => [...prev.slice(-14), balloon]);
    }, 900);
    return () => clearInterval(id); // stop spawning when we leave the game
  }, []);

  const removeBalloon = (id) => {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
  };

  const popBalloon = (id) => {
    playPop();
    removeBalloon(id);
    setScore((s) => s + 1);
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="score">⭐ {score}</div>
      </div>
      <div className="balloon-area">
        {balloons.map((b) => (
          <button
            key={b.id}
            className="balloon"
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size * 1.25,
              // glossy highlight fading into the vivid base color
              background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 45%), ${b.color}`,
              color: b.color, // the little knot uses currentColor
              animationDuration: `${b.duration}s`,
            }}
            onClick={() => popBalloon(b.id)}
            onAnimationEnd={() => removeBalloon(b.id)} // floated off-screen
            aria-label="Pop the balloon"
          />
        ))}
      </div>
      <p className="game-hint">Tap the balloons! 🎈</p>
    </div>
  );
}

export default BalloonPop;
