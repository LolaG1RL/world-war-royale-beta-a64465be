import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { t, tRarity } from '@/lib/i18n';
import { shopItems, allCards } from '@/data/cards';
import { X, Loader2, Check, Gift } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { allEmotes, getOwnedEmotes, addOwnedEmote } from '@/data/emotes';
import {
  allBackgrounds, allEmblems, allBadges,
  getOwnedBackgrounds, getOwnedEmblems, getOwnedBadges,
  addOwnedBackground, addOwnedEmblem, addOwnedBadge,
  getUnlockedAchievementBadges,
} from '@/data/banners';
import { BottomNav } from './BottomNav';
// Stripe price IDs for real-money items
const STRIPE_PRICES: Record<string, string> = {
  'shop-10': 'price_1T8c8YF8KfKkJquq45NfyNTG',
  'shop-11': 'price_1T8c8dF8KfKkJquqIXEugeJM',
  'shop-13': 'price_1TA3ZWF8KfKkJquqEA5Euloo',
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

// Emote daily deals
function getDailyEmoteDeals() {
  const today = new Date();
  const seed = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) * 13;
  const owned = getOwnedEmotes();
  const unowned = allEmotes.filter(e => !owned.includes(e.id));
  const shuffled = [...unowned];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 6).map(e => ({
    emote: e,
    cost: e.rarity === 'legendary' ? 250 : e.rarity === 'epic' ? 100 : e.rarity === 'rare' ? 50 : 25,
    currency: 'gems' as const,
  }));
}

function getEmoteDealsPurchased(): Set<number> {
  try {
    const stored = localStorage.getItem('emote_deals_purchased');
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    if (parsed.date !== getTodayKey()) return new Set();
    return new Set(parsed.indices as number[]);
  } catch { return new Set(); }
}

function saveEmoteDealPurchased(index: number) {
  const current = getEmoteDealsPurchased();
  current.add(index);
  localStorage.setItem('emote_deals_purchased', JSON.stringify({ date: getTodayKey(), indices: Array.from(current) }));
}

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

function getDailyBgDeals(owned: Set<string>) {
  const today = new Date();
  const seed = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) * 17;
  const pool = allBackgrounds.filter(b => b.cost > 0 && !owned.has(b.id));
  const shuffled = [...pool];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 4).map(item => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const discountPct = s % 100 < 30 ? (s % 3 + 1) * 10 : 0;
    return { item, discountPct };
  });
}

function getDailyEmbDeals(owned: Set<string>) {
  const today = new Date();
  const seed = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) * 23;
  const pool = allEmblems.filter(e => e.cost > 0 && !owned.has(e.id));
  const shuffled = [...pool];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 4).map(item => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const discountPct = s % 100 < 30 ? (s % 3 + 1) * 10 : 0;
    return { item, discountPct };
  });
}

// Badges are NOT purchasable - only earned via achievements

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

function getFreebiesClaimed(): Set<number> {
  try {
    const stored = localStorage.getItem('daily_freebies_claimed');
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    if (parsed.date !== getTodayKey()) return new Set();
    return new Set(parsed.indices as number[]);
  } catch { return new Set(); }
}

function saveFreebieClaimedIndex(index: number) {
  const current = getFreebiesClaimed();
  current.add(index);
  localStorage.setItem('daily_freebies_claimed', JSON.stringify({ date: getTodayKey(), indices: Array.from(current) }));
}

function getDailyFreebieCards(arenaId: number) {
  const today = new Date();
  const seed = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) * 7;
  let s = seed;
  const arenaPool = allCards.filter(c => c.unlockArena <= arenaId);
  const pool = arenaPool.length > 0 ? arenaPool : allCards;
  const pick = (arr: typeof pool) => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return arr[s % arr.length];
  };
  const results: { emoji: string; name: string; amount: number; rarity: string }[] = [];
  const commons = pool.filter(c => c.rarity === 'common');
  for (let i = 0; i < 2; i++) {
    const card = pick(commons.length > 0 ? commons : pool);
    results.push({ emoji: card.emoji, name: card.name, amount: 2 + (s % 3), rarity: 'common' });
  }
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  const rareRoll = s % 100;
  const rarePool = rareRoll < 80 ? pool.filter(c => c.rarity === 'rare') : pool.filter(c => c.rarity === 'epic');
  const finalPool = rarePool.length > 0 ? rarePool : pool;
  const card = pick(finalPool);
  results.push({ emoji: card.emoji, name: card.name, amount: 1, rarity: card.rarity });
  return results;
}

function getDailyDiscountedCards(arenaId: number) {
  const today = new Date();
  const seed = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) * 31;
  let s = seed;
  const arenaPool = allCards.filter(c => c.unlockArena <= arenaId);
  const pool = arenaPool.length > 0 ? arenaPool : allCards;
  const results: { card: typeof allCards[0]; amount: number; originalCost: number; discountedCost: number; currency: 'gold' | 'gems' }[] = [];
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  for (let i = 0; i < Math.min(6, shuffled.length); i++) {
    const c = shuffled[i];
    const amount = c.rarity === 'common' ? 5 + (s % 6) : c.rarity === 'rare' ? 2 + (s % 3) : c.rarity === 'epic' ? 1 + (s % 2) : 1;
    const baseCost = c.rarity === 'common' ? 10 * amount : c.rarity === 'rare' ? 100 * amount : c.rarity === 'epic' ? 500 * amount : 2000;
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const discountPct = 20 + (s % 31); // 20-50% off
    const discountedCost = Math.max(1, Math.round(baseCost * (1 - discountPct / 100)));
    results.push({ card: c, amount, originalCost: baseCost, discountedCost, currency: 'gold' });
  }
  return results;
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

// Rarity labels now use i18n - see getRarityLabel helper below

// Reward item type
interface RewardItem {
  emoji: string;
  name: string;
  count: number;
  rarity: string;
}

// Reward reveal modal
const RewardReveal = ({ rewards, onClose, language }: { rewards: RewardItem[]; onClose: () => void; language: import('@/lib/i18n').Language }) => (
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

      <h2 className="font-display font-bold text-lg text-primary text-center mb-4">{t('shop.you_got', language)}</h2>
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
        {t('shop.collect', language)}
      </motion.button>
    </motion.div>
  </motion.div>
);

const ShopScreen = () => {
  const { setScreen, profile, setProfile, setDeck, deck } = useGame();
  const { language } = useSettings();
  const [tab, setTab] = useState<'featured' | 'cards' | 'chests' | 'gems' | 'emotes' | 'banners'>('featured');
  const isWarPassActive = (() => {
    try {
      const data = JSON.parse(localStorage.getItem('war_pass_data') || '{}');
      return !!data.hasPaid;
    } catch { return false; }
  })();
  const [ownedBgs, setOwnedBgs] = useState(() => getOwnedBackgrounds());
  const [ownedEmbs, setOwnedEmbs] = useState(() => getOwnedEmblems());
  const [ownedBadgesSet, setOwnedBadgesSet] = useState(() => getOwnedBadges());
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [rewardPopup, setRewardPopup] = useState<RewardItem[] | null>(null);
  const [purchasedDeals, setPurchasedDeals] = useState<Set<number>>(() => getPurchasedDeals());
  const [claimedFreebies, setClaimedFreebies] = useState<Set<number>>(() => getFreebiesClaimed());
  const countdown = useCountdownToMidnight();
  const dailyDeals = useMemo(() => getDailyDeals(), []);
  const dailyFreebies = useMemo(() => getDailyFreebieCards(profile.arena), [profile.arena]);
  const dailyDiscountedCards = useMemo(() => getDailyDiscountedCards(profile.arena), [profile.arena]);
  const [purchasedDiscounts, setPurchasedDiscounts] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem('daily_discounts_purchased');
      if (!stored) return new Set();
      const parsed = JSON.parse(stored);
      if (parsed.date !== getTodayKey()) return new Set();
      return new Set(parsed.indices as number[]);
    } catch { return new Set(); }
  });
  const emoteDeals = useMemo(() => getDailyEmoteDeals(), []);
  // Memoize daily banner/emblem deals on mount so they don't shift when purchased
  const dailyBgDeals = useMemo(() => getDailyBgDeals(new Set()), []);
  const dailyEmbDeals = useMemo(() => getDailyEmbDeals(new Set()), []);
  const [purchasedEmotes, setPurchasedEmotes] = useState<Set<number>>(() => getEmoteDealsPurchased());
  const [ownedEmoteIds, setOwnedEmoteIds] = useState(() => getOwnedEmotes());
  const [confirmAction, setConfirmAction] = useState<{ label: string; cost: string; onConfirm: () => void } | null>(null);

  const filtered = tab === 'featured' ? shopItems :
    tab === 'cards' ? shopItems.filter(i => i.type === 'card') :
    tab === 'chests' ? shopItems.filter(i => i.type === 'chest') :
    tab === 'gems' ? shopItems.filter(i => i.type === 'gems' || i.type === 'gold') :
    [];

  const showRewards = useCallback((rewards: RewardItem[]) => {
    setRewardPopup(rewards);
  }, []);

  const claimFreebie = (index: number) => {
    if (claimedFreebies.has(index)) return;
    const freebie = dailyFreebies[index];
    saveFreebieClaimedIndex(index);
    setClaimedFreebies(prev => new Set([...prev, index]));
    showRewards([{ emoji: freebie.emoji, name: freebie.name, count: freebie.amount, rarity: freebie.rarity }]);
  };

  const handleDailyDealPurchase = (deal: typeof DAILY_DEAL_POOL[0], index: number) => {
    if (purchasedDeals.has(index)) {
      toast.error(t('shop.already_purchased', language));
      return;
    }
    const currency = deal.currency === 'gold' ? profile.gold : profile.gems;
    if (currency < deal.cost) {
      toast.error(`${t('shop.not_enough', language)} ${t(`shop.${deal.currency}`, language)}!`);
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
      const arenaPool = allCards.filter(c => c.unlockArena <= profile.arena);
      const pool = arenaPool.length > 0 ? arenaPool : allCards;
      for (let i = 0; i < numCards; i++) {
        const card = pool[Math.floor(Math.random() * pool.length)];
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
      if (!priceId) { toast.error(t('common.loading', language)); setPurchasing(null); return; }
      try {
        const { data, error } = await supabase.functions.invoke('create-payment', { body: { priceId } });
        if (error) throw error;
        if (data?.url) window.open(data.url, '_blank');
      } catch (err: any) { toast.error(err.message || 'Payment failed'); }
      setPurchasing(null);
      return;
    }

    const currency = item.currency === 'gold' ? profile.gold : profile.gems;
    if (currency < item.cost) { toast.error(`${t('shop.not_enough', language)} ${t(`shop.${item.currency}`, language)}!`); setPurchasing(null); return; }
    const newProfile = { ...profile };
    if (item.currency === 'gold') newProfile.gold -= item.cost; else newProfile.gems -= item.cost;

    const rewards: RewardItem[] = [];

    switch (item.type) {
      case 'chest': {
        const numCards = item.name.includes('Legendary') ? 1 : item.name.includes('Magical') ? 12 : item.name.includes('Gold') ? 6 : 3;
        const arenaPool = allCards.filter(c => c.unlockArena <= profile.arena);
        const pool = arenaPool.length > 0 ? arenaPool : allCards;
        for (let i = 0; i < numCards; i++) {
          const card = pool[Math.floor(Math.random() * pool.length)];
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
        {rewardPopup && <RewardReveal rewards={rewardPopup} onClose={() => setRewardPopup(null)} language={language} />}
      </AnimatePresence>

      {/* Confirm purchase dialog */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-[80%] max-w-xs bg-card border border-border rounded-2xl p-5 text-center"
            >
              <h3 className="font-display font-bold text-sm text-foreground mb-1">{t('shop.confirm_purchase', language)}</h3>
              <p className="text-[11px] text-muted-foreground mb-1">{t('shop.buy', language)} <span className="text-foreground font-bold">{confirmAction.label}</span>?</p>
              <p className="text-lg font-bold text-primary mb-4">{confirmAction.cost}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-bold uppercase"
                >
                  {t('shop.cancel', language)}
                </button>
                <button
                  onClick={confirmAction.onConfirm}
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase"
                >
                  {t('shop.buy', language)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <button onClick={() => setScreen('menu')} className="text-muted-foreground"><X className="w-4 h-4" /></button>
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">{t('shop.title', language)}</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px]">💰 {profile.gold.toLocaleString()}</span>
          <span className="text-[10px]">💎 {profile.gems}</span>
        </div>
      </div>

      {/* Shop tabs */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border overflow-x-auto">
        {(['featured', 'cards', 'chests', 'emotes', 'banners', 'gems'] as const).map(tabKey => {
          const tabLabels: Record<string, string> = { featured: t('shop.featured', language), cards: t('nav.cards', language), chests: t('shop.chests', language), emotes: t('cards.emotes', language), banners: t('cards.banners', language), gems: t('shop.gems', language) };
          return (
          <button key={tabKey} onClick={() => setTab(tabKey)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-2 ${tab === tabKey ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {tabLabels[tabKey]}
          </button>
          )}
        )}
      </div>

      {/* Shop items */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Daily Deals */}
        {tab === 'featured' && (
          <>
            <div className="mb-3 bg-gradient-to-r from-[hsl(38,80%,25%)] to-[hsl(28,90%,20%)] rounded-xl p-3 border border-primary/30">
              <div className="text-[10px] text-primary font-bold uppercase tracking-wider">{t('shop.daily_deals', language)}</div>
              <div className="text-[8px] text-foreground/70 mt-0.5">{t('shop.refreshes_in', language)} {countdown}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {dailyDeals.map((deal, i) => {
                const bought = purchasedDeals.has(i);
                const canAfford = !bought && (deal.currency === 'gold' ? profile.gold >= deal.cost : profile.gems >= deal.cost);
                return (
                  <motion.button
                    key={`deal-${i}`}
                    whileTap={!bought ? { scale: 0.95 } : undefined}
                    onClick={() => setConfirmAction({
                      label: deal.name,
                      cost: `${deal.currency === 'gold' ? '💰' : '💎'} ${deal.cost}`,
                      onConfirm: () => { handleDailyDealPurchase(deal, i); setConfirmAction(null); }
                    })}
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
                      {tRarity(deal.rarity, language)}
                    </span>
                    <div className={`mt-auto w-full py-1 rounded-lg text-[9px] font-bold text-center ${
                      deal.currency === 'gold' ? 'bg-primary/20 text-primary' : 'bg-elixir/20 text-elixir'
                    }`}>
                      {bought ? t('shop.sold', language) : `${deal.currency === 'gold' ? '💰' : '💎'} ${deal.cost}`}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {/* Cards tab: 3 daily freebies + war pass */}
        {tab === 'cards' && (
          <>
            <div className="mb-3 bg-gradient-to-r from-[hsl(140,50%,20%)] to-[hsl(160,50%,18%)] rounded-xl p-3 border border-[hsl(140,50%,35%)]">
              <div className="text-[10px] text-[hsl(140,60%,60%)] font-bold uppercase tracking-wider">{t('shop.daily_free_cards', language)}</div>
              <div className="text-[8px] text-foreground/70 mt-0.5">{t('shop.refreshes_in', language)} {countdown}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {dailyFreebies.map((freebie, i) => {
                const claimed = claimedFreebies.has(i);
                return (
                  <motion.button
                    key={`freebie-${i}`}
                    whileTap={!claimed ? { scale: 0.95 } : undefined}
                    onClick={() => claimFreebie(i)}
                    disabled={claimed}
                    className={`bg-card border-2 ${claimed ? 'border-muted-foreground/20 opacity-40' : RARITY_COLORS[freebie.rarity]} rounded-xl p-2 flex flex-col items-center gap-1 transition-colors relative ${!claimed ? 'hover:brightness-110' : ''}`}
                  >
                    {claimed && (
                      <div className="absolute inset-0 bg-background/60 rounded-xl flex items-center justify-center z-10">
                        <Check className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <span className="text-2xl mt-1">{freebie.emoji}</span>
                    <span className="text-[9px] font-bold text-foreground text-center leading-tight">{freebie.name}</span>
                    <span className="text-[7px] text-muted-foreground">x{freebie.amount}</span>
                    <span className={`text-[7px] font-bold ${freebie.rarity === 'epic' ? 'text-purple-400' : freebie.rarity === 'rare' ? 'text-blue-400' : 'text-muted-foreground'}`}>
                      {tRarity(freebie.rarity, language)}
                    </span>
                    <div className="mt-auto w-full py-1 rounded-lg text-[9px] font-bold text-center bg-[hsl(140,50%,15%)] text-[hsl(140,60%,60%)]">
                      {claimed ? t('shop.claimed', language) : t('shop.free', language)}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Discounted cards */}
            <div className="mb-3 bg-gradient-to-r from-[hsl(38,60%,20%)] to-[hsl(28,70%,18%)] rounded-xl p-3 border border-primary/30">
              <div className="text-[10px] text-primary font-bold uppercase tracking-wider">{t('shop.discounted_cards', language)}</div>
              <div className="text-[8px] text-foreground/70 mt-0.5">{t('shop.refreshes_in', language)} {countdown}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {dailyDiscountedCards.map((deal, i) => {
                const bought = purchasedDiscounts.has(i);
                const canAfford = !bought && profile.gold >= deal.discountedCost;
                return (
                  <motion.button
                    key={`disc-${i}`}
                    whileTap={!bought ? { scale: 0.95 } : undefined}
                    onClick={() => {
                      if (bought || !canAfford) return;
                      setConfirmAction({
                        label: `${deal.card.name} x${deal.amount}`,
                        cost: `💰 ${deal.discountedCost}`,
                        onConfirm: () => {
                          setProfile(p => ({ ...p, gold: p.gold - deal.discountedCost }));
                          const next = new Set(purchasedDiscounts);
                          next.add(i);
                          setPurchasedDiscounts(next);
                          localStorage.setItem('daily_discounts_purchased', JSON.stringify({ date: getTodayKey(), indices: [...next] }));
                          showRewards([{ emoji: deal.card.emoji, name: deal.card.name, count: deal.amount, rarity: deal.card.rarity }]);
                          setConfirmAction(null);
                        }
                      });
                    }}
                    disabled={bought || !canAfford}
                    className={`bg-card border-2 ${bought ? 'border-muted-foreground/20 opacity-40' : RARITY_COLORS[deal.card.rarity]} rounded-xl p-2 flex flex-col items-center gap-1 transition-colors relative ${!bought && canAfford ? 'hover:brightness-110' : ''}`}
                  >
                    {bought && (
                      <div className="absolute inset-0 bg-background/60 rounded-xl flex items-center justify-center z-10">
                        <Check className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <span className="text-2xl mt-1">{deal.card.emoji}</span>
                    <span className="text-[9px] font-bold text-foreground text-center leading-tight">{deal.card.name}</span>
                    <span className="text-[7px] text-muted-foreground">x{deal.amount}</span>
                    <span className={`text-[7px] font-bold ${deal.card.rarity === 'legendary' ? 'text-primary' : deal.card.rarity === 'epic' ? 'text-purple-400' : deal.card.rarity === 'rare' ? 'text-blue-400' : 'text-muted-foreground'}`}>
                      {tRarity(deal.card.rarity, language)}
                    </span>
                    <div className="mt-auto w-full py-1 rounded-lg text-[9px] font-bold text-center bg-primary/20 text-primary">
                      {bought ? t('shop.sold', language) : (
                        <>
                          <span className="line-through text-muted-foreground mr-1">💰{deal.originalCost}</span>
                          💰{deal.discountedCost}
                        </>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {/* Shop items grid - hide on cards tab */}
        {tab !== 'cards' && (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map(item => {
              const canAfford = item.currency === 'real' ? true :
                item.currency === 'gold' ? profile.gold >= item.cost : profile.gems >= item.cost;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmAction({
                    label: item.name,
                    cost: item.currency === 'real' ? `$${item.cost}` : `${item.currency === 'gold' ? '💰' : '💎'} ${item.cost}`,
                    onConfirm: () => { handlePurchase(item.id); setConfirmAction(null); }
                  })}
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
        )}

        {/* Emotes tab */}
        {tab === 'emotes' && (
          <>
            <div className="mb-3 bg-gradient-to-r from-[hsl(38,60%,20%)] to-[hsl(28,70%,18%)] rounded-xl p-3 border border-primary/30">
              <div className="text-[10px] text-primary font-bold uppercase tracking-wider">{t('shop.daily_emote_deals', language)}</div>
              <div className="text-[8px] text-foreground/70 mt-0.5">{t('shop.refreshes_in', language)} {countdown}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {emoteDeals.map((deal, i) => {
                const bought = purchasedEmotes.has(i) || ownedEmoteIds.includes(deal.emote.id);
                const canAfford = !bought && profile.gems >= deal.cost;
                return (
                  <motion.button
                    key={`emote-deal-${i}`}
                    whileTap={!bought ? { scale: 0.95 } : undefined}
                    onClick={() => {
                      if (bought || !canAfford) return;
                      setConfirmAction({
                        label: deal.emote.name,
                        cost: `💎 ${deal.cost}`,
                        onConfirm: () => {
                          setProfile(p => ({ ...p, gems: p.gems - deal.cost }));
                          addOwnedEmote(deal.emote.id);
                          setOwnedEmoteIds(prev => [...prev, deal.emote.id]);
                          saveEmoteDealPurchased(i);
                          setPurchasedEmotes(prev => new Set([...prev, i]));
                          showRewards([{ emoji: '😀', name: deal.emote.name, count: 1, rarity: deal.emote.rarity }]);
                          setConfirmAction(null);
                        }
                      });
                    }}
                    disabled={bought || !canAfford}
                    className={`bg-card border-2 ${bought ? 'border-muted-foreground/20 opacity-40' : deal.emote.rarity === 'legendary' ? 'border-primary' : deal.emote.rarity === 'epic' ? 'border-purple-400' : deal.emote.rarity === 'rare' ? 'border-blue-400' : 'border-muted-foreground/40'} rounded-xl p-2 flex flex-col items-center gap-1 relative`}
                  >
                    {bought && (
                      <div className="absolute inset-0 bg-background/60 rounded-xl flex items-center justify-center z-10">
                        <Check className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="w-10 h-10 mt-1" dangerouslySetInnerHTML={{ __html: deal.emote.svg }} />
                    <span className="text-[9px] font-bold text-foreground text-center leading-tight">{deal.emote.name}</span>
                    <span className={`text-[7px] font-bold ${deal.emote.rarity === 'legendary' ? 'text-primary' : deal.emote.rarity === 'epic' ? 'text-purple-400' : deal.emote.rarity === 'rare' ? 'text-blue-400' : 'text-muted-foreground'}`}>
                      {tRarity(deal.emote.rarity, language)}
                    </span>
                    <div className="mt-auto w-full py-1 rounded-lg text-[9px] font-bold text-center bg-elixir/20 text-elixir">
                      {bought ? t('shop.owned', language) : `💎 ${deal.cost}`}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {/* Banners tab - daily rotating deals (only unowned items) */}
        {tab === 'banners' && (
          <>
            <div className="mb-3 bg-gradient-to-r from-purple-900/50 to-slate-800/50 rounded-xl p-3 border border-purple-400/30">
              <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">{t('shop.daily_banner_deals', language)}</div>
              <div className="text-[8px] text-foreground/70 mt-0.5">{t('shop.refreshes_in', language)} {countdown}</div>
            </div>

            <div className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2">{t('shop.todays_bg', language)}</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {dailyBgDeals.filter(({ item }) => !ownedBgs.has(item.id)).length === 0 ? (
                <div className="col-span-2 text-center text-muted-foreground text-xs py-4">{t('shop.own_all_bgs', language)}</div>
              ) : dailyBgDeals.map(({ item: bg, discountPct }) => {
                const owned = ownedBgs.has(bg.id);
                if (owned) return null;
                const finalCost = Math.round(bg.cost * (1 - discountPct / 100));
                const canAfford = bg.currency === 'gold' ? profile.gold >= finalCost : profile.gems >= finalCost;
                return (
                  <button
                    key={bg.id}
                    onClick={() => {
                      if (!canAfford) { toast.error(`${t('shop.not_enough', language)} ${t(`shop.${bg.currency}`, language)}!`); return; }
                      setConfirmAction({
                        label: bg.name,
                        cost: `${bg.currency === 'gold' ? '💰' : '💎'} ${finalCost}`,
                        onConfirm: () => {
                          setProfile(p => bg.currency === 'gold' ? { ...p, gold: p.gold - finalCost } : { ...p, gems: p.gems - finalCost });
                          addOwnedBackground(bg.id);
                          setOwnedBgs(getOwnedBackgrounds());
                          toast.success(`${bg.name} ${t('shop.unlocked', language)}`);
                          setConfirmAction(null);
                        },
                      });
                    }}
                    className={`relative h-16 rounded-xl overflow-hidden border-2 ${canAfford ? 'border-border hover:border-primary/50' : 'border-border/30 opacity-60'}`}
                    style={{ background: bg.css }}
                  >
                    {bg.animated && bg.animationSvg && <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: bg.animationSvg }} />}
                    {discountPct > 0 && (
                      <div className="absolute top-1 right-1 bg-accent text-accent-foreground text-[7px] font-black px-1 rounded">-{discountPct}%</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5 flex items-center justify-between">
                      <span className="text-[8px] font-bold text-foreground">{bg.name}</span>
                      <span className="text-[7px] text-muted-foreground">{bg.currency === 'gold' ? '💰' : '💎'} {finalCost}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2">{t('shop.todays_emb', language)}</div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {dailyEmbDeals.filter(({ item }) => !ownedEmbs.has(item.id)).length === 0 ? (
                <div className="col-span-4 text-center text-muted-foreground text-xs py-4">{t('shop.own_all_emb', language)}</div>
              ) : dailyEmbDeals.map(({ item: emb, discountPct }) => {
                const owned = ownedEmbs.has(emb.id);
                if (owned) return null;
                const finalCost = Math.round(emb.cost * (1 - discountPct / 100));
                const canAfford = emb.currency === 'gold' ? profile.gold >= finalCost : profile.gems >= finalCost;
                return (
                  <button
                    key={emb.id}
                    onClick={() => {
                      if (!canAfford) { toast.error(`${t('shop.not_enough', language)} ${t(`shop.${emb.currency}`, language)}!`); return; }
                      setConfirmAction({
                        label: emb.name,
                        cost: `${emb.currency === 'gold' ? '💰' : '💎'} ${finalCost}`,
                        onConfirm: () => {
                          setProfile(p => emb.currency === 'gold' ? { ...p, gold: p.gold - finalCost } : { ...p, gems: p.gems - finalCost });
                          addOwnedEmblem(emb.id);
                          setOwnedEmbs(getOwnedEmblems());
                          toast.success(`${emb.name} ${t('shop.unlocked', language)}`);
                          setConfirmAction(null);
                        },
                      });
                    }}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 ${canAfford ? 'border-border hover:border-primary/50 bg-muted/10' : 'border-border/30 bg-muted/5 opacity-60'}`}
                  >
                    {discountPct > 0 && (
                      <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[6px] font-black px-1 rounded z-10">-{discountPct}%</div>
                    )}
                    <span className={`text-xl ${(emb as any).animated ? 'animate-pulse' : ''}`}>{(emb as any).emoji}</span>
                    <span className="text-[7px] font-bold text-foreground">{emb.name}</span>
                    <span className="text-[7px] text-muted-foreground">{emb.currency === 'gold' ? '💰' : '💎'} {finalCost}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-center py-4 text-muted-foreground text-xs whitespace-pre-line">
              <span className="text-lg">🏅</span><br />
              {t('shop.badges_earned', language)}
            </div>
          </>
        )}

        {!isWarPassActive && (
        <div className="mt-4 bg-gradient-to-r from-[hsl(340,60%,25%)] to-[hsl(280,50%,22%)] rounded-xl p-4 border border-[hsl(340,60%,40%)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎖️</span>
            <div>
              <div className="text-xs font-display font-bold text-foreground">{t('shop.war_pass_plus', language)}</div>
              <div className="text-[8px] text-muted-foreground">{t('shop.unlock_premium', language)}</div>
            </div>
          </div>
          <div className="flex gap-2">
            {['👑', '✨', '💎', '🏆'].map((e, i) => (
              <div key={i} className="flex-1 bg-[hsl(0,0%,0%,0.3)] rounded-lg p-1.5 flex items-center justify-center text-lg">{e}</div>
            ))}
          </div>
          <button
            onClick={() => setConfirmAction({
              label: 'War Pass+',
              cost: '$4.99',
              onConfirm: () => { handleWarPassPurchase(); setConfirmAction(null); }
            })}
            disabled={purchasing === 'war-pass'}
            className="w-full mt-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {purchasing === 'war-pass' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t('shop.buy_war_pass', language)}
          </button>
        </div>
        )}
      </div>

      <BottomNav active="shop" setScreen={setScreen} />
    </div>
  );
};

export default ShopScreen;
