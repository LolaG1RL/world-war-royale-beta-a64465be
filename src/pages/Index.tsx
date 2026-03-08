import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GameProvider, useGame } from '@/context/GameContext';
import DeafIDLogin from '@/components/auth/DeafIDLogin';
import UsernamePicker from '@/components/auth/UsernamePicker';
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
import DeafMode from '@/components/game/DeafMode';

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

const AuthGate = () => {
  const { user, loading, needsUsername } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full max-w-md mx-auto flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-float">⚔️</div>
          <p className="text-xs text-muted-foreground font-display tracking-widest">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!user) return <DeafIDLogin />;
  if (needsUsername) return <UsernamePicker />;

  return (
    <GameProvider>
      <GameRouter />
      <DeafMode />
    </GameProvider>
  );
};

const Index = () => (
  <AuthProvider>
    <AuthGate />
  </AuthProvider>
);

export default Index;
