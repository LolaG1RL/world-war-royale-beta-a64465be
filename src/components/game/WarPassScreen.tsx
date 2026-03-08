import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Crown, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
];

const WarPassScreen = () => {
  const { setScreen, profile, setProfile } = useGame();
  const [crowns, setCrowns] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [claimedFree, setClaimedFree] = useState<Set<number>>(new Set());
  const [claimedPaid, setClaimedPaid] = useState<Set<number>>(new Set());
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('war_pass_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCrowns(data.crowns || 0);
        setHasPaid(data.hasPaid || false);
        setClaimedFree(new Set(data.claimedFree || []));
        setClaimedPaid(new Set(data.claimedPaid || []));
      } catch {}
    }
  }, []);

  const save = (c: number, paid: boolean, cf: Set<number>, cp: Set<number>) => {
    localStorage.setItem('war_pass_data', JSON.stringify({
      crowns: c, hasPaid: paid,
      claimedFree: [...cf], claimedPaid: [...cp],
    }));
  };

  const claimReward = (tier: number, track: 'free' | 'paid') => {
    const reward = WAR_PASS_REWARDS.find(r => r.tier === tier);
    if (!reward) return;
    const r = track === 'free' ? reward.free : reward.paid;

    if (r.type === 'gold') setProfile(p => ({ ...p, gold: p.gold + r.amount }));
    else if (r.type === 'gems') setProfile(p => ({ ...p, gems: p.gems + r.amount }));

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
    toast.success(`Claimed: ${r.label}!`);
  };

  const handleBuyPass = async () => {
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { priceId: STRIPE_WAR_PASS_PRICE },
      });
      if (error) throw error;
      if (data?.url) {
        // Mark as paid optimistically (Stripe redirect will confirm)
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
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background">
      {/* Header */}
      <div className="bg-[hsl(220,25%,10%)] border-b border-border px-3 py-2.5 flex items-center gap-3">
        <button onClick={() => setScreen('menu')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Crown className="w-5 h-5 text-primary" />
        <h1 className="font-display font-bold text-sm text-foreground flex-1">War Pass</h1>
        <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
          <span className="text-xs">👑</span>
          <span className="text-[10px] font-bold text-primary">{crowns}</span>
        </div>
      </div>

      {/* Buy pass banner */}
      {!hasPaid && (
        <div className="bg-gradient-to-r from-[hsl(340,60%,18%)] to-[hsl(280,50%,18%)] border-b border-[hsl(280,30%,30%)] px-3 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[hsl(340,70%,70%)]">🔥 Unlock Paid Track</div>
            <div className="text-[8px] text-muted-foreground">Get exclusive rewards all season long</div>
          </div>
          <button
            onClick={handleBuyPass}
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
          <span className="text-[10px] font-bold text-[hsl(280,60%,70%)]">⭐ War Pass Active</span>
        </div>
      )}

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
            {hasPaid ? '⭐ Paid' : '🔒 Paid'}
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
                <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 text-[9px] font-black border-2 ${
                  unlocked ? 'bg-primary/20 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'
                }`}>
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
      className={`w-full rounded-lg border p-1.5 flex flex-col items-center gap-0.5 transition-colors relative ${
        claimed ? 'bg-muted/30 border-border' :
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
