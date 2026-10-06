import { useState } from 'react';
import Home from './components/Home.jsx';
import BalloonPop from './components/BalloonPop.jsx';
import AnimalSounds from './components/AnimalSounds.jsx';
import MemoryMatch from './components/MemoryMatch.jsx';
import ColorFind from './components/ColorFind.jsx';
import MusicMaker from './components/MusicMaker.jsx';
import ShapeFind from './components/ShapeFind.jsx';
import Counting from './components/Counting.jsx';
import MusicToggle from './components/MusicToggle.jsx';
import './App.css';

function App() {
  // screen is 'home' or a game id like 'balloon-pop'
  const [screen, setScreen] = useState('home');

  return (
    <div className="app">
      {screen === 'home' && <Home onSelectGame={setScreen} />}
      {screen === 'balloon-pop' && <BalloonPop onBack={() => setScreen('home')} />}
      {screen === 'animal-sounds' && <AnimalSounds onBack={() => setScreen('home')} />}
      {screen === 'memory-match' && <MemoryMatch onBack={() => setScreen('home')} />}
      {screen === 'color-find' && <ColorFind onBack={() => setScreen('home')} />}
      {screen === 'music-maker' && <MusicMaker onBack={() => setScreen('home')} />}
      {screen === 'shape-find' && <ShapeFind onBack={() => setScreen('home')} />}
      {screen === 'counting' && <Counting onBack={() => setScreen('home')} />}
      <MusicToggle />
    </div>
  );
}

export default App;
