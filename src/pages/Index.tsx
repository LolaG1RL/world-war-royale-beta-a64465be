import { useGame } from '@/context/GameContext';
import { GameProvider } from '@/context/GameContext';
import MainMenu from '@/components/game/MainMenu';
import BattleArena from '@/components/game/BattleArena';
import BattleResult from '@/components/game/BattleResult';
import CardCollection from '@/components/game/CardCollection';
import ShopScreen from '@/components/game/ShopScreen';
import SocialScreen from '@/components/game/SocialScreen';
import TrophyRoadScreen from '@/components/game/TrophyRoadScreen';
import EventsScreen from '@/components/game/EventsScreen';
import ProfileScreen from '@/components/game/ProfileScreen';
import ChestOpenScreen from '@/components/game/ChestOpenScreen';

const GameRouter = () => {
  const { screen } = useGame();

  switch (screen) {
    case 'battle': return <BattleArena />;
    case 'result': return <BattleResult />;
    case 'deck': return <CardCollection />;
    case 'shop': return <ShopScreen />;
    case 'social': return <SocialScreen />;
    case 'trophy-road': return <TrophyRoadScreen />;
    case 'events': return <EventsScreen />;
    case 'profile': return <ProfileScreen />;
    case 'chest-open': return <ChestOpenScreen />;
    default: return <MainMenu />;
  }
};

// World War Royale V1.0
const Index = () => (
  <GameProvider>
    <GameRouter />
  </GameProvider>
);

export default Index;
