import { useState, useRef } from 'react';

// Real animal recordings from Wikimedia Commons (free to use).
// Streamed from the web for now — later we can download them into
// public/sounds/ so the game works offline.
const ANIMALS = [
  { id: 'elephant', name: 'Elephant', emoji: '🐘', color: '#a9b7c6', sound: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Elephant_voice_-_trumpeting.ogg' },
  { id: 'dog', name: 'Dog', emoji: '🐶', color: '#ffa94d', sound: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Barking_of_a_dog.ogg' },
  { id: 'cat', name: 'Cat', emoji: '🐱', color: '#f783ac', sound: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Meow.ogg' },
  { id: 'cow', name: 'Cow', emoji: '🐮', color: '#74c0fc', sound: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Single_Cow_Moo.ogg' },
  { id: 'duck', name: 'Duck', emoji: '🦆', color: '#ffd43b', sound: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Anas_platyrhynchos_-_Mallard_-_XC62258.ogg' },
  { id: 'frog', name: 'Frog', emoji: '🐸', color: '#69db7c', sound: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Single_Frog_Croak.oga' },
];

function AnimalSounds({ onBack }) {
  const audioRef = useRef(null);
  const [bouncing, setBouncing] = useState(null);

  const playAnimal = (animal) => {
    // Stop the previous sound so rapid taps don't pile up
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(animal.sound);
    audioRef.current = audio;
    audio.play().catch(() => {}); // ignore if the browser blocks it
    // Little bounce for fun
    setBouncing(animal.id);
    setTimeout(() => setBouncing(null), 600);
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
      <p className="game-hint">Tap an animal to hear it! 🐾</p>
      <div className="animal-grid">
        {ANIMALS.map((animal) => (
          <button
            key={animal.id}
            className={`animal-card${bouncing === animal.id ? ' bouncing' : ''}`}
            style={{ backgroundColor: animal.color }}
            onClick={() => playAnimal(animal)}
          >
            <span className="animal-emoji">{animal.emoji}</span>
            <span className="animal-name">{animal.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AnimalSounds;
