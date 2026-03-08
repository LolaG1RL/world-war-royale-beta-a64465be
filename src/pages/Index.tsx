import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GameProvider, useGame } from '@/context/GameContext';
import { SettingsProvider } from '@/context/SettingsContext';
import DeafIDLogin from '@/components/auth/DeafIDLogin';
import UsernamePicker from '@/components/auth/UsernamePicker';
import MainMenu from '@/components/game/MainMenu';
import BattleArena from '@/components/game/BattleArena';
import BoatBattleArena from '@/components/game/BoatBattleArena';
import BattleResult from '@/components/game/BattleResult';
import CardCollection from '@/components/game/CardCollection';
import ShopScreen from '@/components/game/ShopScreen';
import SocialScreen from '@/components/game/SocialScreen';
import TrophyRoadScreen from '@/components/game/TrophyRoadScreen';
import EventsScreen from '@/components/game/EventsScreen';
import ProfileScreen from '@/components/game/ProfileScreen';
import ChestOpenScreen from '@/components/game/ChestOpenScreen';
import MailboxScreen from '@/components/game/MailboxScreen';
import WarPassScreen from '@/components/game/WarPassScreen';
import RiverRaceScreen from '@/components/game/RiverRaceScreen';
import DeafMode from '@/components/game/DeafMode';
import SettingsScreen from '@/components/game/SettingsScreen';

const GameRouter = () => {
  const { screen } = useGame();

  switch (screen) {
    case 'battle': return <BattleArena />;
    case 'boat-battle': return <BoatBattleArena />;
    case 'result': return <BattleResult />;
    case 'deck': return <CardCollection />;
    case 'shop': return <ShopScreen />;
    case 'social': return <SocialScreen />;
    case 'trophy-road': return <TrophyRoadScreen />;
    case 'events': return <EventsScreen />;
    case 'profile': return <ProfileScreen />;
    case 'chest-open': return <ChestOpenScreen />;
    case 'mailbox': return <MailboxScreen />;
    case 'war-pass': return <WarPassScreen />;
    case 'river-race': return <RiverRaceScreen />;
    case 'settings': return <SettingsScreen />;
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
          <p className="text-xs text-muted-foreground font-display tracking-widest">⚔️ LOADING...</p>
        </div>
      </div>
    );
  }

  if (!user) return <DeafIDLogin />;
  if (needsUsername) return <UsernamePicker />;

  return (
    <SettingsProvider>
      <GameProvider>
        <GameRouter />
        <DeafMode />
      </GameProvider>
    </SettingsProvider>
  );
};

const Index = () => (
  <AuthProvider>
    <AuthGate />
  </AuthProvider>
);

export default Index;
