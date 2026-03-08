import { useGame } from '@/context/GameContext';
import { shopItems, allCards } from '@/data/cards';
import { ShoppingBag, Swords, Users, Crown, Zap, X, Loader2, Check, Gift } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Stripe price IDs for real-money items
const STRIPE_PRICES: Record<string, string> = {
  'shop-10': 'price_1T8c8YF8KfKkJquq45NfyNTG',
  'shop-11': 'price_1T8c8dF8KfKkJquqIXEugeJM',
  'shop-12': 'price_1T8c8eF8KfKkJquqBrjotFic',
};

const DAILY_DEAL_POOL = [
  { name: 'Roman Legionary', emoji: '🛡️', type: 'card' as const, rarity: 'common' as const, amount: 10, cost: 5, currency: 'gold' as const },
  { name: 'Egyptian Archer', emoji: '🏹', type: 'card' as const, rarity: 'common' as const, amount: 10, cost: 5, currency: 'gold' as const },
  { name: 'Skeleton Horde', emoji: '💀', type: 'card' as const, rarity: 'common' as const, amount: 10, cost: 5, currency: 'gold' as const },
  { name: 'Viking Raider', emoji: '⚔️', type: 'card' as const, rarity: 'common' as const, amount: 10, cost: 5, currency: 'gold' as const },
  { name: 'Samurai', emoji: '🗡️', type: 'card' as const, rarity: 'rare' as const, amount: 4, cost: 50, currency: 'gold' as const },
  { name: 'Mongol Cavalry', emoji: '🐴', type: 'card' as const, rarity: 'rare' as const, amount: 4, cost: 50, currency: 'gold' as const },
  { name: 'War Elephant', emoji: '🐘', type: 'card' as const, rarity: 'rare' as const, amount: 4, cost: 50, currency: 'gold' as const },
  { name: 'Dragon Warrior', emoji: '🐲', type: 'card' as const, rarity: 'epic' as const, amount: 2, cost: 500, currency: 'gold' as const },
  { name: 'Orc Berserker', emoji: '👹', type: 'card' as const, rarity: 'epic' as const, amount: 2, cost: 500, currency: 'gold' as const },
  { name: 'Zeus', emoji: '⚡', type: 'card' as const, rarity: 'legendary' as const, amount: 1, cost: 40000, currency: 'gold' as const },
  { name: 'Silver Chest', emoji: '🪙', type: 'chest' as const, rarity: 'common' as const, amount: 1, cost: 50, currency: 'gold' as const },
  { name: 'Gold Chest', emoji: '💰', type: 'chest' as const, rarity: 'rare' as const, amount: 1, cost: 150, currency: 'gold' as const },
  { name: 'Magical Chest', emoji: '✨', type: 'chest' as const, rarity: 'epic' as const, amount: 1, cost: 250, currency: 'gems' as const },
  { name: '500 Gold', emoji: '💰', type: 'gold' as const, rarity: 'common' as const, amount: 500, cost: 25, currency: 'gems' as const },
  { name: '1500 Gold', emoji: '💰', type: 'gold' as const, rarity: 'rare' as const, amount: 1500, cost: 60, currency: 'gems' as const },
  { name: '10 Gems', emoji: '💎', type: 'gems' as const, rarity: 'common' as const, amount: 10, cost: 200, currency: 'gold' as const },
];

function getDailyDeals() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const shuffled = [...DAILY_DEAL_POOL];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 6);
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getPurchasedDeals(): Set<number> {
  try {
    const stored = localStorage.getItem('daily_deals_purchased');
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    if (parsed.date !== getTodayKey()) return new Set();
    return new Set(parsed.indices as number[]);
  } catch { return new Set(); }
}

function savePurchasedDeal(index: number) {
  const current = getPurchasedDeals();
  current.add(index);
  localStorage.setItem('daily_deals_purchased', JSON.stringify({ date: getTodayKey(), indices: Array.from(current) }));
}

function getFreebiesClaimed(): boolean {
  try {
    const stored = localStorage.getItem('daily_freebies_claimed');
    if (!stored) return false;
    return JSON.parse(stored).date === getTodayKey();
  } catch { return false; }
}

function setFreebiesClaimedStorage() {
  localStorage.setItem('daily_freebies_claimed', JSON.stringify({ date: getTodayKey() }));
}

function generateDailyFreebies(): RewardItem[] {
  const rewards: RewardItem[] = [];
  const roll = () => {
    const r = Math.random();
    if (r < 0.60) return allCards.filter(c => c.rarity === 'common');
    if (r < 0.85) return allCards.filter(c => c.rarity === 'rare');
    if (r < 0.97) return allCards.filter(c => c.rarity === 'epic');
    return allCards.filter(c => c.rarity === 'legendary');
  };
  for (let i = 0; i < 3; i++) {
    const pool = roll();
    const card = pool[Math.floor(Math.random() * pool.length)];
    const count = card.rarity === 'common' ? 2 + Math.floor(Math.random() * 3) :
                  card.rarity === 'rare' ? 1 + Math.floor(Math.random() * 2) : 1;
    rewards.push({ emoji: card.emoji, name: card.name, count, rarity: card.rarity });
  }
  rewards.push({ emoji: '💰', name: 'Gold', count: 15 + Math.floor(Math.random() * 35), rarity: 'common' });
  return rewards;
}

function useCountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'border-muted-foreground/40',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-primary',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

// Reward item type
interface RewardItem {
  emoji: string;
  name: string;
  count: number;
  rarity: string;
}

// Reward reveal modal
const RewardReveal = ({ rewards, onClose }: { rewards: RewardItem[]; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      onClick={e => e.stopPropagation()}
      className="w-[90%] max-w-sm bg-card border border-border rounded-2xl p-5 relative"
    >
      {/* Light burst */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-xl pointer-events-none"
      />

      <h2 className="font-display font-bold text-lg text-primary text-center mb-4">YOU GOT!</h2>
      <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
        {rewards.map((r, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
            className={`bg-background border rounded-xl p-3 text-center ${
              r.rarity === 'legendary' ? 'border-primary/50 shadow-[0_0_10px_hsl(38,90%,50%,0.3)]' :
              r.rarity === 'epic' ? 'border-purple-400/40' :
              r.rarity === 'rare' ? 'border-blue-400/40' :
              'border-border'
            }`}
          >
            <span className="text-2xl">{r.emoji}</span>
            <div className="text-[8px] font-bold text-foreground mt-1">{r.name}</div>
            <div className={`text-[10px] font-bold mt-0.5 ${
              r.rarity === 'legendary' ? 'text-primary' :
              r.rarity === 'epic' ? 'text-purple-400' :
              r.rarity === 'rare' ? 'text-blue-400' :
              'text-foreground'
            }`}>x{r.count}</div>
          </motion.div>
        ))}
      </div>
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rewards.length * 0.12 + 0.3 }}
        onClick={onClose}
        className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase"
      >
        Collect
      </motion.button>
    </motion.div>
  </motion.div>
);

const ShopScreen = () => {
  const { setScreen, profile, setProfile, setDeck, deck } = useGame();
  const [tab, setTab] = useState<'featured' | 'cards' | 'chests' | 'gems'>('featured');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [rewardPopup, setRewardPopup] = useState<RewardItem[] | null>(null);
  const [purchasedDeals, setPurchasedDeals] = useState<Set<number>>(() => getPurchasedDeals());
  const countdown = useCountdownToMidnight();
  const dailyDeals = useMemo(() => getDailyDeals(), []);

  const filtered = tab === 'featured' ? shopItems :
    tab === 'cards' ? shopItems.filter(i => i.type === 'card') :
    tab === 'chests' ? shopItems.filter(i => i.type === 'chest') :
    shopItems.filter(i => i.type === 'gems' || i.type === 'gold');

  const showRewards = useCallback((rewards: RewardItem[]) => {
    setRewardPopup(rewards);
  }, []);

  const handleDailyDealPurchase = (deal: typeof DAILY_DEAL_POOL[0], index: number) => {
    if (purchasedDeals.has(index)) {
      toast.error('Already purchased today!');
      return;
    }
    const currency = deal.currency === 'gold' ? profile.gold : profile.gems;
    if (currency < deal.cost) {
      toast.error(`Not enough ${deal.currency}!`);
      return;
    }
    const newProfile = { ...profile };
    if (deal.currency === 'gold') newProfile.gold -= deal.cost;
    else newProfile.gems -= deal.cost;

    const rewards: RewardItem[] = [];

    if (deal.type === 'gold') {
      newProfile.gold += deal.amount;
      rewards.push({ emoji: '💰', name: 'Gold', count: deal.amount, rarity: 'common' });
    } else if (deal.type === 'gems') {
      newProfile.gems += deal.amount;
      rewards.push({ emoji: '💎', name: 'Gems', count: deal.amount, rarity: 'rare' });
    } else if (deal.type === 'chest') {
      const numCards = deal.name.includes('Magical') ? 12 : deal.name.includes('Gold') ? 6 : 3;
      for (let i = 0; i < numCards; i++) {
        const card = allCards[Math.floor(Math.random() * allCards.length)];
        rewards.push({ emoji: card.emoji, name: card.name, count: 1 + Math.floor(Math.random() * 3), rarity: card.rarity });
      }
      rewards.push({ emoji: '💰', name: 'Gold', count: 50 + Math.floor(Math.random() * 200), rarity: 'common' });
      newProfile.gold += rewards[rewards.length - 1].count;
    } else {
      // card
      rewards.push({ emoji: deal.emoji, name: deal.name, count: deal.amount, rarity: deal.rarity });
    }

    setProfile(newProfile);
    savePurchasedDeal(index);
    setPurchasedDeals(prev => new Set([...prev, index]));
    showRewards(rewards);
  };

  const handlePurchase = async (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    setPurchasing(itemId);

    if (item.currency === 'real') {
      const priceId = STRIPE_PRICES[itemId];
      if (!priceId) { toast.error('Item not available'); setPurchasing(null); return; }
      try {
        const { data, error } = await supabase.functions.invoke('create-payment', { body: { priceId } });
        if (error) throw error;
        if (data?.url) window.open(data.url, '_blank');
      } catch (err: any) { toast.error(err.message || 'Payment failed'); }
      setPurchasing(null);
      return;
    }

    const currency = item.currency === 'gold' ? profile.gold : profile.gems;
    if (currency < item.cost) { toast.error(`Not enough ${item.currency}!`); setPurchasing(null); return; }
    const newProfile = { ...profile };
    if (item.currency === 'gold') newProfile.gold -= item.cost; else newProfile.gems -= item.cost;

    const rewards: RewardItem[] = [];

    switch (item.type) {
      case 'chest': {
        const numCards = item.name.includes('Legendary') ? 1 : item.name.includes('Magical') ? 12 : item.name.includes('Gold') ? 6 : 3;
        for (let i = 0; i < numCards; i++) {
          const card = allCards[Math.floor(Math.random() * allCards.length)];
          rewards.push({ emoji: card.emoji, name: card.name, count: 1 + Math.floor(Math.random() * 5), rarity: card.rarity });
        }
        const goldReward = 100 + Math.floor(Math.random() * 500);
        rewards.push({ emoji: '💰', name: 'Gold', count: goldReward, rarity: 'common' });
        newProfile.gold += goldReward;
        break;
      }
      case 'card': {
        rewards.push({ emoji: item.emoji, name: item.name, count: parseInt(item.description.replace(/[^0-9]/g, '')) || 1, rarity: item.rarity || 'common' });
        break;
      }
      case 'gold': {
        const g = parseInt(item.description.replace(/[^0-9]/g, ''));
        newProfile.gold += g;
        rewards.push({ emoji: '💰', name: 'Gold', count: g, rarity: 'common' });
        break;
      }
    }

    setProfile(newProfile);
    setPurchasing(null);
    showRewards(rewards);
  };

  const handleWarPassPurchase = async () => {
    setPurchasing('war-pass');
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', { body: { priceId: STRIPE_PRICES['shop-12'] } });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) { toast.error(err.message || 'Payment failed'); }
    setPurchasing(null);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Reward popup */}
      <AnimatePresence>
        {rewardPopup && <RewardReveal rewards={rewardPopup} onClose={() => setRewardPopup(null)} />}
      </AnimatePresence>

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

      {/* Shop items */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Daily Deals */}
        {tab === 'featured' && (
          <>
            <div className="mb-3 bg-gradient-to-r from-[hsl(38,80%,25%)] to-[hsl(28,90%,20%)] rounded-xl p-3 border border-primary/30">
              <div className="text-[10px] text-primary font-bold uppercase tracking-wider">Daily Deals</div>
              <div className="text-[8px] text-foreground/70 mt-0.5">Refreshes in {countdown}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {dailyDeals.map((deal, i) => {
                const bought = purchasedDeals.has(i);
                const canAfford = !bought && (deal.currency === 'gold' ? profile.gold >= deal.cost : profile.gems >= deal.cost);
                return (
                  <motion.button
                    key={`deal-${i}`}
                    whileTap={!bought ? { scale: 0.95 } : undefined}
                    onClick={() => handleDailyDealPurchase(deal, i)}
                    disabled={bought || !canAfford}
                    className={`bg-card border-2 ${bought ? 'border-muted-foreground/20 opacity-40' : RARITY_COLORS[deal.rarity]} rounded-xl p-2 flex flex-col items-center gap-1 transition-colors relative ${!bought && canAfford ? 'hover:brightness-110' : ''}`}
                  >
                    {bought && (
                      <div className="absolute inset-0 bg-background/60 rounded-xl flex items-center justify-center z-10">
                        <Check className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <span className="text-2xl mt-1">{deal.emoji}</span>
                    <span className="text-[9px] font-bold text-foreground text-center leading-tight">{deal.name}</span>
                    <span className="text-[7px] text-muted-foreground">x{deal.amount}</span>
                    <span className={`text-[7px] font-bold ${deal.rarity === 'legendary' ? 'text-primary' : deal.rarity === 'epic' ? 'text-purple-400' : deal.rarity === 'rare' ? 'text-blue-400' : 'text-muted-foreground'}`}>
                      {RARITY_LABELS[deal.rarity]}
                    </span>
                    <div className={`mt-auto w-full py-1 rounded-lg text-[9px] font-bold text-center ${
                      deal.currency === 'gold' ? 'bg-primary/20 text-primary' : 'bg-elixir/20 text-elixir'
                    }`}>
                      {bought ? 'SOLD' : `${deal.currency === 'gold' ? '💰' : '💎'} ${deal.cost}`}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

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

        {/* War Pass */}
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
              <div key={i} className="flex-1 bg-[hsl(0,0%,0%,0.3)] rounded-lg p-1.5 flex items-center justify-center text-lg">{e}</div>
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
