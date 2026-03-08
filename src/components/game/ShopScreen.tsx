import { useGame } from '@/context/GameContext';
import { shopItems, allCards } from '@/data/cards';
import { ShoppingBag, Swords, Users, Crown, Zap, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Stripe price IDs for real-money items
const STRIPE_PRICES: Record<string, string> = {
  'shop-10': 'price_1T8c8YF8KfKkJquq45NfyNTG',  // 80 Gems - $4.99
  'shop-11': 'price_1T8c8dF8KfKkJquqIXEugeJM',  // 500 Gems - $14.99
  'shop-12': 'price_1T8c8eF8KfKkJquqBrjotFic',  // War Pass - $4.99
};

const ShopScreen = () => {
  const { setScreen, profile, setProfile, setDeck, deck } = useGame();
  const [tab, setTab] = useState<'featured' | 'cards' | 'chests' | 'gems'>('featured');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const filtered = tab === 'featured' ? shopItems :
    tab === 'cards' ? shopItems.filter(i => i.type === 'card') :
    tab === 'chests' ? shopItems.filter(i => i.type === 'chest') :
    shopItems.filter(i => i.type === 'gems' || i.type === 'gold');

  const handlePurchase = async (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    setPurchasing(itemId);

    // Real money purchase via Stripe
    if (item.currency === 'real') {
      const priceId = STRIPE_PRICES[itemId];
      if (!priceId) {
        toast.error('Item not available for purchase');
        setPurchasing(null);
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: { priceId },
        });
        if (error) throw error;
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      } catch (err: any) {
        toast.error(err.message || 'Payment failed');
      }
      setPurchasing(null);
      return;
    }

    // In-game currency purchase
    const currency = item.currency === 'gold' ? profile.gold : profile.gems;
    if (currency < item.cost) {
      toast.error(`Not enough ${item.currency}!`);
      setPurchasing(null);
      return;
    }

    // Deduct currency
    const newProfile = { ...profile };
    if (item.currency === 'gold') {
      newProfile.gold -= item.cost;
    } else {
      newProfile.gems -= item.cost;
    }

    // Grant rewards
    switch (item.type) {
      case 'chest': {
        // Grant random cards based on chest type
        const cardCount = item.name.includes('Legendary') ? 1 : item.name.includes('Magical') ? 12 : item.name.includes('Gold') ? 6 : 3;
        toast.success(`Opened ${item.name}! Got ${cardCount} cards`);
        break;
      }
      case 'card': {
        const card = allCards.find(c => c.name === item.name);
        if (card && !deck.find(c => c.id === card.id)) {
          toast.success(`Got ${item.name}!`);
        } else {
          toast.success(`Got cards for ${item.name}!`);
        }
        break;
      }
      case 'gold': {
        const goldAmount = parseInt(item.description.replace(/[^0-9]/g, ''));
        newProfile.gold += goldAmount;
        toast.success(`Got ${goldAmount.toLocaleString()} Gold!`);
        break;
      }
    }

    setProfile(newProfile);
    setPurchasing(null);
  };

  const handleWarPassPurchase = async () => {
    setPurchasing('war-pass');
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { priceId: STRIPE_PRICES['shop-12'] },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    }
    setPurchasing(null);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <button onClick={() => setScreen('menu')} className="text-muted-foreground"><X className="w-4 h-4" /></button>
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">Shop</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px]">💰 {profile.gold.toLocaleString()}</span>
          <span className="text-[10px]">💎 {profile.gems}</span>
        </div>
      </div>

      {/* Shop tabs */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        {(['featured', 'cards', 'chests', 'gems'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Daily deals banner */}
      {tab === 'featured' && (
        <div className="mx-3 mt-3 bg-gradient-to-r from-[hsl(38,80%,25%)] to-[hsl(28,90%,20%)] rounded-xl p-3 border border-primary/30">
          <div className="text-[10px] text-primary font-bold uppercase tracking-wider">Daily Deals</div>
          <div className="text-[8px] text-foreground/70 mt-0.5">Refreshes in 12:34:56</div>
        </div>
      )}

      {/* Shop items grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2">
          {filtered.map(item => {
            const canAfford = item.currency === 'real' ? true :
              item.currency === 'gold' ? profile.gold >= item.cost : profile.gems >= item.cost;

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePurchase(item.id)}
                disabled={!canAfford || purchasing === item.id}
                className={`bg-card border rounded-xl p-2 flex flex-col items-center gap-1 transition-colors ${canAfford ? 'border-border hover:border-primary/30' : 'border-border/30 opacity-50'}`}
              >
                {purchasing === item.id ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mt-1" />
                ) : (
                  <span className="text-2xl mt-1">{item.emoji}</span>
                )}
                <span className="text-[9px] font-bold text-foreground text-center leading-tight">{item.name}</span>
                <span className="text-[7px] text-muted-foreground text-center">{item.description}</span>
                <div className={`mt-auto w-full py-1 rounded-lg text-[9px] font-bold text-center ${
                  item.currency === 'gold' ? 'bg-primary/20 text-primary' :
                  item.currency === 'gems' ? 'bg-elixir/20 text-elixir' :
                  'bg-hp-green/20 text-hp-green'
                }`}>
                  {item.currency === 'real' ? `$${item.cost}` : `${item.currency === 'gold' ? '💰' : '💎'} ${item.cost}`}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* War Pass section */}
        <div className="mt-4 bg-gradient-to-r from-[hsl(340,60%,25%)] to-[hsl(280,50%,22%)] rounded-xl p-4 border border-[hsl(340,60%,40%)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎖️</span>
            <div>
              <div className="text-xs font-display font-bold text-foreground">WAR PASS</div>
              <div className="text-[8px] text-muted-foreground">Unlock premium rewards all season</div>
            </div>
          </div>
          <div className="flex gap-2">
            {['👑', '✨', '💎', '🏆'].map((e, i) => (
              <div key={i} className="flex-1 bg-[hsl(0,0%,0%,0.3)] rounded-lg p-1.5 flex items-center justify-center text-lg">
                {e}
              </div>
            ))}
          </div>
          <button
            onClick={handleWarPassPurchase}
            disabled={purchasing === 'war-pass'}
            className="w-full mt-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {purchasing === 'war-pass' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Buy War Pass - $4.99
          </button>
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav active="shop" setScreen={setScreen} />
    </div>
  );
};

export const BottomNav = ({ active, setScreen }: { active: string; setScreen: (s: string) => void }) => (
  <div className="flex items-stretch bg-[hsl(220,20%,10%)] border-t-2 border-primary/20">
    <BNavTab icon={<ShoppingBag className="w-4 h-4" />} label="Shop" active={active === 'shop'} onClick={() => setScreen('shop')} />
    <BNavTab icon={<Crown className="w-4 h-4" />} label="Cards" active={active === 'cards'} onClick={() => setScreen('deck')} />
    <BNavTab icon={<Swords className="w-4 h-4" />} label="Battle" active={active === 'battle'} onClick={() => setScreen('menu')} />
    <BNavTab icon={<Users className="w-4 h-4" />} label="Social" active={active === 'social'} onClick={() => setScreen('social')} />
    <BNavTab icon={<Zap className="w-4 h-4" />} label="Events" active={active === 'events'} onClick={() => setScreen('events')} />
  </div>
);

const BNavTab = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`nav-tab flex-1 relative ${active ? 'active' : ''}`}>
    <div className={`${active ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</div>
    <span className={`text-[9px] ${active ? 'text-primary' : ''}`}>{label}</span>
    {active && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />}
  </button>
);

export default ShopScreen;
