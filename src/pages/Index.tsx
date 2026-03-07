import { useState, useCallback } from 'react';
import { GameCard, getStarterDeck } from '@/data/cards';
import MainMenu from '@/components/game/MainMenu';
import BattleArena from '@/components/game/BattleArena';
import BattleResult from '@/components/game/BattleResult';
import CardCollection from '@/components/game/CardCollection';

type Screen = 'menu' | 'battle' | 'result' | 'deck';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [deck, setDeck] = useState<GameCard[]>(getStarterDeck());
  const [trophies, setTrophies] = useState(1250);
  const [battleResult, setBattleResult] = useState<'win' | 'lose'>('win');
  const [playerName] = useState('Warrior');

  const handleBattleEnd = useCallback((result: 'win' | 'lose') => {
    setBattleResult(result);
    setScreen('result');
    setTrophies(prev => result === 'win' ? prev + 30 : Math.max(0, prev - 15));
  }, []);

  if (screen === 'battle') {
    return <BattleArena deck={deck} onBattleEnd={handleBattleEnd} />;
  }

  if (screen === 'result') {
    return (
      <BattleResult
        result={battleResult}
        trophyChange={battleResult === 'win' ? 30 : -15}
        onContinue={() => setScreen('menu')}
      />
    );
  }

  if (screen === 'deck') {
    return (
      <CardCollection
        deck={deck}
        onDeckChange={setDeck}
        onBack={() => setScreen('menu')}
      />
    );
  }

  return (
    <MainMenu
      trophies={trophies}
      playerName={playerName}
      deck={deck}
      onBattle={() => setScreen('battle')}
      onDeck={() => setScreen('deck')}
    />
  );
};

export default Index;
