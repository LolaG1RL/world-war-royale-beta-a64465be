import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Crown, Check, Loader2 } from 'lucide-react';
import { BottomNav } from './ShopScreen';
import { toast } from 'sonner';
import { allCards } from '@/data/cards';
import { addCards } from '@/data/cardInventory';

interface RewardItem { emoji: string; name: string; count: number; rarity: string; }

const generateChestContents = (chestLabel: string): { gold: number; gems: number; items: RewardItem[] } => {
  const isLegendary = chestLabel.toLowerCase().includes('legendary');
  const isLightning = chestLabel.toLowerCase().includes('lightning');
  const isMagic = chestLabel.toLowerCase().includes('magic');
  const isGold = chestLabel.toLowerCase().includes('gold');

  let gold = 0, gems = 0;
  let commonCount = 0, rareCount = 0, epicCount = 0, legendaryCount = 0;

  if (isLegendary) { gold = 2000 + Math.floor(Math.random() * 1000); gems = 20 + Math.floor(Math.random() * 15); rareCount = 2; epicCount = 1; legendaryCount = 1; }
  else if (isLightning) { gold = 1200 + Math.floor(Math.random() * 600); gems = 8 + Math.floor(Math.random() * 8); commonCount = 3; rareCount = 2; epicCount = 1; }
  else if (isMagic) { gold = 800 + Math.floor(Math.random() * 400); gems = 5 + Math.floor(Math.random() * 6); commonCount = 4; rareCount = 3; epicCount = 1; }
  else if (isGold) { gold = 400 + Math.floor(Math.random() * 200); gems = 2 + Math.floor(Math.random() * 4); commonCount = 3; rareCount = 1; }
  else { gold = 150 + Math.floor(Math.random() * 100); gems = 1 + Math.floor(Math.random() * 2); commonCount = 2; rareCount = 1; }

  const items: RewardItem[] = [];
  items.push({ emoji: '💰', name: `${gold} Gold`, count: gold, rarity: 'common' });
  if (gems > 0) items.push({ emoji: '💎', name: `${gems} Gems`, count: gems, rarity: 'rare' });

  const pickCards = (rarity: string, count: number) => {
    const pool = allCards.filter(c => c.rarity === rarity);
    for (let i = 0; i < count; i++) {
      const card = pool[Math.floor(Math.random() * pool.length)];
      if (card) {
        const amt = rarity === 'common' ? 2 + Math.floor(Math.random() * 4) : rarity === 'rare' ? 1 + Math.floor(Math.random() * 2) : 1;
        items.push({ emoji: card.emoji, name: card.name, count: amt, rarity });
      }
    }
  };
  pickCards('common', commonCount);
  pickCards('rare', rareCount);
  pickCards('epic', epicCount);
  pickCards('legendary', legendaryCount);

  return { gold, gems, items };
};

const STRIPE_WAR_PASS_PRICE = 'price_1T8c8eF8KfKkJquqBrjotFic';

interface PassReward {
  tier: number;
  crownsNeeded: number;
  free: { type: string; amount: number; emoji: string; label: string };
  paid: { type: string; amount: number; emoji: string; label: string };
}

const WAR_PASS_REWARDS: PassReward[] = [
  { tier: 1, crownsNeeded: 2, free: { type: 'gold', amount: 100, emoji: '💰', label: '100 Gold' }, paid: { type: 'gems', amount: 5, emoji: '💎', label: '5 Gems' } },
  { tier: 2, crownsNeeded: 4, free: { type: 'cards', amount: 2, emoji: '🃏', label: '2 Cards' }, paid: { type: 'gold', amount: 300, emoji: '💰', label: '300 Gold' } },
  { tier: 3, crownsNeeded: 7, free: { type: 'gold', amount: 200, emoji: '💰', label: '200 Gold' }, paid: { type: 'chest', amount: 1, emoji: '🪙', label: 'Silver Chest' } },
  { tier: 4, crownsNeeded: 10, free: { type: 'gems', amount: 3, emoji: '💎', label: '3 Gems' }, paid: { type: 'gold', amount: 500, emoji: '💰', label: '500 Gold' } },
  { tier: 5, crownsNeeded: 14, free: { type: 'gold', amount: 400, emoji: '💰', label: '400 Gold' }, paid: { type: 'gems', amount: 10, emoji: '💎', label: '10 Gems' } },
  { tier: 6, crownsNeeded: 18, free: { type: 'cards', amount: 3, emoji: '🃏', label: '3 Cards' }, paid: { type: 'chest', amount: 1, emoji: '💰', label: 'Gold Chest' } },
  { tier: 7, crownsNeeded: 22, free: { type: 'chest', amount: 1, emoji: '🪙', label: 'Silver Chest' }, paid: { type: 'gold', amount: 1000, emoji: '💰', label: '1K Gold' } },
  { tier: 8, crownsNeeded: 27, free: { type: 'gold', amount: 600, emoji: '💰', label: '600 Gold' }, paid: { type: 'gems', amount: 15, emoji: '💎', label: '15 Gems' } },
  { tier: 9, crownsNeeded: 32, free: { type: 'gems', amount: 5, emoji: '💎', label: '5 Gems' }, paid: { type: 'cards', amount: 5, emoji: '🃏', label: '5 Rare Cards' } },
  { tier: 10, crownsNeeded: 37, free: { type: 'gold', amount: 800, emoji: '💰', label: '800 Gold' }, paid: { type: 'chest', amount: 1, emoji: '✨', label: 'Magic Chest' } },
  { tier: 11, crownsNeeded: 42, free: { type: 'cards', amount: 4, emoji: '🃏', label: '4 Cards' }, paid: { type: 'gold', amount: 1500, emoji: '💰', label: '1.5K Gold' } },
  { tier: 12, crownsNeeded: 48, free: { type: 'chest', amount: 1, emoji: '💰', label: 'Gold Chest' }, paid: { type: 'gems', amount: 25, emoji: '💎', label: '25 Gems' } },
  { tier: 13, crownsNeeded: 54, free: { type: 'gold', amount: 1000, emoji: '💰', label: '1K Gold' }, paid: { type: 'cards', amount: 3, emoji: '🃏', label: '3 Epic Cards' } },
  { tier: 14, crownsNeeded: 60, free: { type: 'gems', amount: 8, emoji: '💎', label: '8 Gems' }, paid: { type: 'gold', amount: 2000, emoji: '💰', label: '2K Gold' } },
  { tier: 15, crownsNeeded: 67, free: { type: 'gold', amount: 1500, emoji: '💰', label: '1.5K Gold' }, paid: { type: 'chest', amount: 1, emoji: '⚡', label: 'Lightning Chest' } },
  { tier: 16, crownsNeeded: 74, free: { type: 'cards', amount: 5, emoji: '🃏', label: '5 Cards' }, paid: { type: 'gems', amount: 35, emoji: '💎', label: '35 Gems' } },
  { tier: 17, crownsNeeded: 82, free: { type: 'chest', amount: 1, emoji: '✨', label: 'Magic Chest' }, paid: { type: 'gold', amount: 3000, emoji: '💰', label: '3K Gold' } },
  { tier: 18, crownsNeeded: 90, free: { type: 'gems', amount: 10, emoji: '💎', label: '10 Gems' }, paid: { type: 'cards', amount: 2, emoji: '🃏', label: '2 Legendary' } },
  { tier: 19, crownsNeeded: 98, free: { type: 'gold', amount: 2000, emoji: '💰', label: '2K Gold' }, paid: { type: 'gems', amount: 50, emoji: '💎', label: '50 Gems' } },
  { tier: 20, crownsNeeded: 110, free: { type: 'chest', amount: 1, emoji: '👑', label: 'Legendary Chest' }, paid: { type: 'emote', amount: 1, emoji: '🎭', label: 'Exclusive Emote' } },
  { tier: 21, crownsNeeded: 120, free: { type: 'gold', amount: 2500, emoji: '💰', label: '2.5K Gold' }, paid: { type: 'gems', amount: 60, emoji: '💎', label: '60 Gems' } },
  { tier: 22, crownsNeeded: 132, free: { type: 'gems', amount: 12, emoji: '💎', label: '12 Gems' }, paid: { type: 'chest', amount: 1, emoji: '⚡', label: 'Lightning Chest' } },
  { tier: 23, crownsNeeded: 144, free: { type: 'cards', amount: 6, emoji: '🃏', label: '6 Cards' }, paid: { type: 'gold', amount: 4000, emoji: '💰', label: '4K Gold' } },
  { tier: 24, crownsNeeded: 158, free: { type: 'chest', amount: 1, emoji: '💰', label: 'Gold Chest' }, paid: { type: 'gems', amount: 75, emoji: '💎', label: '75 Gems' } },
  { tier: 25, crownsNeeded: 172, free: { type: 'gold', amount: 3000, emoji: '💰', label: '3K Gold' }, paid: { type: 'cards', amount: 3, emoji: '🃏', label: '3 Epic Cards' } },
  { tier: 26, crownsNeeded: 188, free: { type: 'gems', amount: 15, emoji: '💎', label: '15 Gems' }, paid: { type: 'chest', amount: 1, emoji: '✨', label: 'Magic Chest' } },
  { tier: 27, crownsNeeded: 205, free: { type: 'cards', amount: 4, emoji: '🃏', label: '4 Rare Cards' }, paid: { type: 'gold', amount: 5000, emoji: '💰', label: '5K Gold' } },
  { tier: 28, crownsNeeded: 224, free: { type: 'gold', amount: 4000, emoji: '💰', label: '4K Gold' }, paid: { type: 'gems', amount: 100, emoji: '💎', label: '100 Gems' } },
  { tier: 29, crownsNeeded: 245, free: { type: 'chest', amount: 1, emoji: '⚡', label: 'Lightning Chest' }, paid: { type: 'cards', amount: 3, emoji: '🃏', label: '3 Legendary' } },
  { tier: 30, crownsNeeded: 270, free: { type: 'chest', amount: 1, emoji: '👑', label: 'Legendary Chest' }, paid: { type: 'emote', amount: 1, emoji: '👑', label: 'Champion Emote' } },
];

const WarPassScreen = () => {
  const { setScreen, profile, setProfile } = useGame();
  const [crowns, setCrowns] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [claimedFree, setClaimedFree] = useState<Set<number>>(new Set());
  const [claimedPaid, setClaimedPaid] = useState<Set<number>>(new Set());
  const [purchasing, setPurchasing] = useState(false);
  const [revealItems, setRevealItems] = useState<RewardItem[] | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ label: string; cost: string; onConfirm: () => void } | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem('war_pass_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const seasonStart = data.seasonStart || Date.now();
        const daysSinceSeason = (Date.now() - seasonStart) / (1000 * 60 * 60 * 24);
        if (daysSinceSeason >= 30) {
          const resetData = { crowns: 0, hasPaid: false, claimedFree: [], claimedPaid: [], seasonStart: Date.now(), daysLeft: 30 };
          localStorage.setItem('war_pass_data', JSON.stringify(resetData));
          setCrowns(0);
          setHasPaid(false);
          setClaimedFree(new Set());
          setClaimedPaid(new Set());
          return;
        }
        setCrowns(data.crowns || 0);
        setHasPaid(data.hasPaid || false);
        setClaimedFree(new Set(data.claimedFree || []));
        setClaimedPaid(new Set(data.claimedPaid || []));
      } catch { }
    } else {
      localStorage.setItem('war_pass_data', JSON.stringify({ crowns: 0, hasPaid: false, claimedFree: [], claimedPaid: [], seasonStart: Date.now() }));
    }
  }, []);

  // Listen for Deaf Mode War Pass+ toggle
  useEffect(() => {
    const handler = () => {
      try {
        const data = JSON.parse(localStorage.getItem('war_pass_data') || '{}');
        setHasPaid(!!data.hasPaid);
      } catch {}
    };
    window.addEventListener('war-pass-update', handler);
    return () => window.removeEventListener('war-pass-update', handler);
  }, []);

  const getDaysLeft = () => {
    const saved = localStorage.getItem('war_pass_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const seasonStart = data.seasonStart || Date.now();
        const daysPassed = (Date.now() - seasonStart) / (1000 * 60 * 60 * 24);
        return Math.max(0, Math.ceil(30 - daysPassed));
      } catch { }
    }
    return 30;
  };

  const save = (c: number, paid: boolean, cf: Set<number>, cp: Set<number>) => {
    const saved = localStorage.getItem('war_pass_data');
    let seasonStart = Date.now();
    if (saved) { try { seasonStart = JSON.parse(saved).seasonStart || Date.now(); } catch { } }
    localStorage.setItem('war_pass_data', JSON.stringify({
      crowns: c, hasPaid: paid,
      claimedFree: [...cf], claimedPaid: [...cp],
      seasonStart,
    }));
  };

  const claimReward = (tier: number, track: 'free' | 'paid') => {
    const reward = WAR_PASS_REWARDS.find(r => r.tier === tier);
    if (!reward) return;
    const r = track === 'free' ? reward.free : reward.paid;

    let items: RewardItem[] = [];

    if (r.type === 'chest') {
      const contents = generateChestContents(r.label);
      setProfile(p => ({ ...p, gold: p.gold + contents.gold, gems: p.gems + contents.gems }));
      // Add cards to inventory
      contents.items.forEach(item => {
        if (item.rarity !== 'common' || !item.name.includes('Gold')) {
          const card = allCards.find(c => c.name === item.name);
          if (card) addCards(card.id, item.count);
        }
      });
      items = contents.items;
    } else if (r.type === 'cards') {
      // Pick specific random cards and show them
      const label = r.label.toLowerCase();
      let pool = allCards;
      if (label.includes('legendary')) pool = allCards.filter(c => c.rarity === 'legendary');
      else if (label.includes('epic')) pool = allCards.filter(c => c.rarity === 'epic');
      else if (label.includes('rare')) pool = allCards.filter(c => c.rarity === 'rare');
      else pool = allCards.filter(c => c.rarity === 'common' || c.rarity === 'rare');
      
      for (let i = 0; i < r.amount; i++) {
        const card = pool[Math.floor(Math.random() * pool.length)];
        if (card) {
          const amt = card.rarity === 'common' ? 2 + Math.floor(Math.random() * 4) : card.rarity === 'rare' ? 1 + Math.floor(Math.random() * 2) : 1;
          addCards(card.id, amt);
          items.push({ emoji: card.emoji, name: card.name, count: amt, rarity: card.rarity });
        }
      }
    } else {
      if (r.type === 'gold') setProfile(p => ({ ...p, gold: p.gold + r.amount }));
      else if (r.type === 'gems') setProfile(p => ({ ...p, gems: p.gems + r.amount }));
      const rarity = r.type === 'gems' ? 'rare' : r.type === 'emote' ? 'legendary' : 'common';
      items = [{ emoji: r.emoji, name: r.label, count: r.amount, rarity }];
    }

    if (track === 'free') {
      const next = new Set(claimedFree);
      next.add(tier);
      setClaimedFree(next);
      save(crowns, hasPaid, next, claimedPaid);
    } else {
      const next = new Set(claimedPaid);
      next.add(tier);
      setClaimedPaid(next);
      save(crowns, hasPaid, claimedFree, next);
    }

    setRevealItems(items);
  };

  const handleBuyPass = async () => {
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { priceId: STRIPE_WAR_PASS_PRICE },
      });
      if (error) throw error;
      if (data?.url) {
        setHasPaid(true);
        save(crowns, true, claimedFree, claimedPaid);
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    }
    setPurchasing(false);
  };

  const maxCrowns = WAR_PASS_REWARDS[WAR_PASS_REWARDS.length - 1].crownsNeeded;

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background relative">
      {/* Reward reveal popup - shop style grid */}
      <AnimatePresence>
        {revealItems && revealItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setRevealItems(null)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="w-[90%] max-w-sm bg-card border border-border rounded-2xl p-5 relative"
            >
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-xl pointer-events-none"
              />
              <h2 className="font-display font-bold text-lg text-primary text-center mb-4">YOU GOT!</h2>
              <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
                {revealItems.map((r, i) => (
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
                transition={{ delay: revealItems.length * 0.12 + 0.3 }}
                onClick={() => setRevealItems(null)}
                className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase"
              >
                Collect
              </motion.button>
            </motion.div>
          </motion.div>
        )}
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
              <h3 className="font-display font-bold text-sm text-foreground mb-1">Confirm Purchase</h3>
              <p className="text-[11px] text-muted-foreground mb-1">Buy <span className="text-foreground font-bold">{confirmAction.label}</span>?</p>
              <p className="text-lg font-bold text-primary mb-4">{confirmAction.cost}</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmAction(null)} className="flex-1 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-bold uppercase">Cancel</button>
                <button onClick={confirmAction.onConfirm} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase">Buy</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="bg-[hsl(220,25%,10%)] border-b border-border px-3 py-2.5 flex items-center gap-3">
        <button onClick={() => setScreen('menu')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Crown className="w-5 h-5 text-primary" />
        <h1 className="font-display font-bold text-sm text-foreground flex-1">War Pass</h1>
        <div className="text-[8px] text-muted-foreground mr-2">⏳ {getDaysLeft()}d left</div>
        <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
          <span className="text-xs">👑</span>
          <span className="text-[10px] font-bold text-primary">{crowns}</span>
        </div>
      </div>

      {/* Buy pass banner */}
      {!hasPaid && (
        <div className="bg-gradient-to-r from-[hsl(340,60%,18%)] to-[hsl(280,50%,18%)] border-b border-[hsl(280,30%,30%)] px-3 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[hsl(340,70%,70%)]">🔥 Unlock War Pass+</div>
            <div className="text-[8px] text-muted-foreground">Get exclusive rewards all season long</div>
          </div>
          <button
            onClick={() => setConfirmAction({
              label: 'War Pass+',
              cost: '$4.99',
              onConfirm: () => { handleBuyPass(); setConfirmAction(null); }
            })}
            disabled={purchasing}
            className="px-4 py-2 rounded-lg text-[11px] font-bold bg-gradient-to-r from-[hsl(340,60%,45%)] to-[hsl(280,50%,45%)] text-foreground hover:brightness-110 border border-[hsl(340,50%,55%)] disabled:opacity-50 flex items-center gap-1.5"
          >
            {purchasing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            $4.99
          </button>
        </div>
      )}

      {hasPaid && (
        <div className="bg-gradient-to-r from-[hsl(280,40%,18%)] to-[hsl(320,40%,18%)] border-b border-[hsl(280,30%,30%)] px-3 py-1.5 text-center">
          <span className="text-[10px] font-bold text-[hsl(280,60%,70%)]">⭐ War Pass+ Active</span>
        </div>
      )}

      {/* Skip tier button */}
      {(() => {
        const nextTier = WAR_PASS_REWARDS.find(r => r.crownsNeeded > crowns);
        const canSkip = nextTier && profile.gems >= 50;
        return nextTier ? (
          <div className="px-3 py-2 bg-[hsl(220,20%,11%)] border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-foreground">⏭️ Skip to Tier {nextTier.tier}</div>
              <div className="text-[8px] text-muted-foreground">Jump to {nextTier.crownsNeeded} crowns</div>
            </div>
            <button
              onClick={() => {
                if (!canSkip) { toast.error('Not enough gems!'); return; }
                setConfirmAction({
                  label: `Skip to Tier ${nextTier.tier}`,
                  cost: '💎 50',
                  onConfirm: () => {
                    setProfile(p => ({ ...p, gems: p.gems - 50 }));
                    const newCrowns = nextTier.crownsNeeded;
                    setCrowns(newCrowns);
                    save(newCrowns, hasPaid, claimedFree, claimedPaid);
                    toast.success(`Skipped to Tier ${nextTier.tier}!`);
                    setConfirmAction(null);
                  }
                });
              }}
              disabled={!canSkip}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-primary/20 border border-primary/40 text-primary disabled:opacity-40 flex items-center gap-1"
            >
              💎 50
            </button>
          </div>
        ) : null;
      })()}

      {/* Crown progress */}
      <div className="px-3 py-2 bg-[hsl(220,20%,11%)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] text-muted-foreground">Crown Progress</span>
          <span className="text-[9px] text-primary font-bold ml-auto">{crowns} / {maxCrowns}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-[hsl(38,90%,60%)] rounded-full transition-all"
            style={{ width: `${Math.min(100, (crowns / maxCrowns) * 100)}%` }}
          />
        </div>
      </div>

      {/* Reward tracks */}
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex bg-[hsl(220,20%,10%)] border-b border-border">
          <div className="flex-1 text-center py-1.5 text-[9px] font-bold text-[hsl(120,40%,55%)] uppercase tracking-wider">Free</div>
          <div className="w-10" />
          <div className="flex-1 text-center py-1.5 text-[9px] font-bold text-[hsl(280,60%,65%)] uppercase tracking-wider">
            {hasPaid ? '⭐ Pass+' : '🔒 Pass+'}
          </div>
        </div>

        {WAR_PASS_REWARDS.map((reward) => {
          const unlocked = crowns >= reward.crownsNeeded;
          const freeClaimable = unlocked && !claimedFree.has(reward.tier);
          const freeClaimed = claimedFree.has(reward.tier);
          const paidClaimable = unlocked && hasPaid && !claimedPaid.has(reward.tier);
          const paidClaimed = claimedPaid.has(reward.tier);

          return (
            <div key={reward.tier} className={`flex items-stretch border-b border-border ${unlocked ? 'bg-[hsl(220,15%,12%)]' : 'bg-background opacity-60'}`}>
              <div className="flex-1 p-1.5">
                <RewardCard
                  emoji={reward.free.emoji}
                  label={reward.free.label}
                  claimed={freeClaimed}
                  claimable={freeClaimable}
                  locked={!unlocked}
                  onClaim={() => claimReward(reward.tier, 'free')}
                  variant="free"
                />
              </div>

              <div className="w-10 flex flex-col items-center justify-center relative">
                <div className={`w-0.5 absolute top-0 bottom-0 ${unlocked ? 'bg-primary/40' : 'bg-border'}`} />
                <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 text-[9px] font-black border-2 ${unlocked ? 'bg-primary/20 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                  {reward.crownsNeeded}
                </div>
              </div>

              <div className="flex-1 p-1.5">
                <RewardCard
                  emoji={reward.paid.emoji}
                  label={reward.paid.label}
                  claimed={paidClaimed}
                  claimable={paidClaimable}
                  locked={!unlocked || !hasPaid}
                  onClaim={() => claimReward(reward.tier, 'paid')}
                  variant="paid"
                  showLock={!hasPaid}
                />
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav active="battle" setScreen={setScreen} />
    </div>
  );
};

const RewardCard = ({ emoji, label, claimed, claimable, locked, onClaim, variant, showLock }: {
  emoji: string; label: string; claimed: boolean; claimable: boolean; locked: boolean;
  onClaim: () => void; variant: 'free' | 'paid'; showLock?: boolean;
}) => {
  const bg = variant === 'free'
    ? 'bg-[hsl(120,15%,14%)] border-[hsl(120,20%,22%)]'
    : 'bg-[hsl(280,15%,14%)] border-[hsl(280,20%,22%)]';

  return (
    <motion.button
      whileTap={claimable ? { scale: 0.95 } : {}}
      onClick={claimable ? onClaim : undefined}
      disabled={!claimable}
      className={`w-full rounded-lg border p-1.5 flex flex-col items-center gap-0.5 transition-colors relative ${claimed ? 'bg-muted/30 border-border' :
          claimable ? `${bg} ring-1 ring-primary/50 shadow-[0_0_10px_hsl(38,90%,50%,0.15)]` :
            `${bg} opacity-60`
        }`}
    >
      {showLock && !claimed && (
        <Lock className="w-2.5 h-2.5 text-muted-foreground absolute top-1 right-1" />
      )}
      <span className={`text-base ${claimed ? 'grayscale opacity-40' : ''}`}>{emoji}</span>
      <span className={`text-[7px] font-bold leading-tight text-center ${claimed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{label}</span>
      {claimed && <Check className="w-3 h-3 text-[hsl(120,50%,50%)]" />}
      {claimable && !claimed && (
        <span className="text-[6px] font-bold text-primary animate-pulse">CLAIM</span>
      )}
    </motion.button>
  );
};

export default WarPassScreen;
