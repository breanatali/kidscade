import { games } from '../data/games.js';

// The arcade menu: big colorful cards, one per game.
// onSelectGame is a function from App.jsx that switches the screen.
function Home({ onSelectGame }) {
  return (
    <div className="home">
      <h1 className="app-title">🎮 KidsCade</h1>
      <p className="app-subtitle">Pick a game!</p>
      <div className="game-grid">
        {games.map((game) => (
          <button
            key={game.id}
            className="game-card"
            style={{ backgroundColor: game.color }}
            onClick={() => onSelectGame(game.id)}
          >
            <span className="game-emoji">{game.emoji}</span>
            <span className="game-name">{game.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
