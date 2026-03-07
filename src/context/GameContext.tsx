import { createContext, useContext, useState, ReactNode } from 'react';
import { GameCard, ChestData, PlayerProfile, ClanData, getStarterDeck, defaultChests, defaultProfile, defaultClan } from '@/data/cards';
import { useAuth } from '@/context/AuthContext';

interface GameState {
  screen: string;
  setScreen: (s: string) => void;
  profile: PlayerProfile;
  setProfile: (p: PlayerProfile | ((prev: PlayerProfile) => PlayerProfile)) => void;
  deck: GameCard[];
  setDeck: (d: GameCard[]) => void;
  chests: ChestData[];
  setChests: (c: ChestData[]) => void;
  clan: ClanData;
  battleResult: 'win' | 'lose' | null;
  setBattleResult: (r: 'win' | 'lose' | null) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
}

const GameContext = createContext<GameState | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { username } = useAuth();
  const [screen, setScreen] = useState('menu');
  const [profile, setProfile] = useState<PlayerProfile>({
    ...defaultProfile,
    name: username || 'Warrior',
  });
  const [deck, setDeck] = useState<GameCard[]>(getStarterDeck());
  const [chests, setChests] = useState<ChestData[]>(defaultChests);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [activeTab, setActiveTab] = useState('battle');

  // Keep profile name in sync with username
  const currentProfile = { ...profile, name: username || profile.name };

  return (
    <GameContext.Provider value={{
      screen, setScreen,
      profile: currentProfile, setProfile,
      deck, setDeck,
      chests, setChests,
      clan: defaultClan,
      battleResult, setBattleResult,
      activeTab, setActiveTab,
    }}>
      {children}
    </GameContext.Provider>
  );
};
