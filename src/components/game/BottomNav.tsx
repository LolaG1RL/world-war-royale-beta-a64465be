import { ShoppingBag, Swords, Users, Crown, Zap } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { t } from '@/lib/i18n';

interface BottomNavProps {
  active: 'shop' | 'cards' | 'battle' | 'social' | 'events';
  setScreen: (screen: string) => void;
  badges?: { shop?: number; cards?: number; battle?: number; social?: number; events?: number };
}

export const BottomNav = ({ active, setScreen, badges }: BottomNavProps) => {
  const { language } = useSettings();
  return (
    <div className="relative z-20 shrink-0 flex items-stretch bg-card border-t-2 border-primary/20">
      <BNavTab icon={<ShoppingBag className="w-4 h-4" />} label={t('nav.shop', language)} active={active === 'shop'} onClick={() => setScreen('shop')} badge={badges?.shop} />
      <BNavTab icon={<Crown className="w-4 h-4" />} label={t('nav.cards', language)} active={active === 'cards'} onClick={() => setScreen('deck')} badge={badges?.cards} />
      <BNavTab icon={<Swords className="w-4 h-4" />} label={t('nav.battle', language)} active={active === 'battle'} onClick={() => setScreen('menu')} badge={badges?.battle} />
      <BNavTab icon={<Users className="w-4 h-4" />} label={t('nav.social', language)} active={active === 'social'} onClick={() => setScreen('social')} badge={badges?.social} />
      <BNavTab icon={<Zap className="w-4 h-4" />} label={t('nav.events', language)} active={active === 'events'} onClick={() => setScreen('events')} badge={badges?.events} />
    </div>
  );
};

const BNavTab = ({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
}) => (
  <button onClick={onClick} className={`nav-tab flex-1 relative ${active ? 'active' : ''}`}>
    <div className={`relative ${active ? 'text-primary' : 'text-muted-foreground'}`}>
      {icon}
      {badge && badge > 0 && (
        <div className="absolute -top-1.5 -right-2.5 w-3.5 h-3.5 bg-accent rounded-full flex items-center justify-center">
          <span className="text-[6px] font-black text-accent-foreground">{badge > 9 ? '!' : badge}</span>
        </div>
      )}
    </div>
    <span className={`text-[9px] ${active ? 'text-primary' : ''}`}>{label}</span>
    {active && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />}
  </button>
);
