import { ShoppingBag, Swords, Users, Crown, Zap } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { t } from '@/lib/i18n';

interface BottomNavProps {
  active: 'shop' | 'cards' | 'battle' | 'social' | 'events';
  setScreen: (screen: string) => void;
}

export const BottomNav = ({ active, setScreen }: BottomNavProps) => {
  const { language } = useSettings();
  return (
    <div className="relative z-20 shrink-0 flex items-stretch bg-card border-t-2 border-primary/20">
      <BNavTab icon={<ShoppingBag className="w-4 h-4" />} label={t('nav.shop', language)} active={active === 'shop'} onClick={() => setScreen('shop')} />
      <BNavTab icon={<Crown className="w-4 h-4" />} label={t('nav.cards', language)} active={active === 'cards'} onClick={() => setScreen('deck')} />
      <BNavTab icon={<Swords className="w-4 h-4" />} label={t('nav.battle', language)} active={active === 'battle'} onClick={() => setScreen('menu')} />
      <BNavTab icon={<Users className="w-4 h-4" />} label={t('nav.social', language)} active={active === 'social'} onClick={() => setScreen('social')} />
      <BNavTab icon={<Zap className="w-4 h-4" />} label={t('nav.events', language)} active={active === 'events'} onClick={() => setScreen('events')} />
    </div>
  );
};

const BNavTab = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button onClick={onClick} className={`nav-tab flex-1 relative ${active ? 'active' : ''}`}>
    <div className={`${active ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</div>
    <span className={`text-[9px] ${active ? 'text-primary' : ''}`}>{label}</span>
    {active && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />}
  </button>
);
