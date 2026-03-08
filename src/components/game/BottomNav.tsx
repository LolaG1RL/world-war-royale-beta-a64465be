import { ShoppingBag, Swords, Users, Crown, Zap } from 'lucide-react';

interface BottomNavProps {
  active: 'shop' | 'cards' | 'battle' | 'social' | 'events';
  setScreen: (screen: string) => void;
}

export const BottomNav = ({ active, setScreen }: BottomNavProps) => (
  <div className="relative z-20 shrink-0 flex items-stretch bg-card border-t-2 border-primary/20">
    <BNavTab icon={<ShoppingBag className="w-4 h-4" />} label="Shop" active={active === 'shop'} onClick={() => setScreen('shop')} />
    <BNavTab icon={<Crown className="w-4 h-4" />} label="Cards" active={active === 'cards'} onClick={() => setScreen('deck')} />
    <BNavTab icon={<Swords className="w-4 h-4" />} label="Battle" active={active === 'battle'} onClick={() => setScreen('menu')} />
    <BNavTab icon={<Users className="w-4 h-4" />} label="Social" active={active === 'social'} onClick={() => setScreen('social')} />
    <BNavTab icon={<Zap className="w-4 h-4" />} label="Events" active={active === 'events'} onClick={() => setScreen('events')} />
  </div>
);

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
