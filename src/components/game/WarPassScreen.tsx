import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Crown, Check, Gift, Gem, Coins } from 'lucide-react';

interface PassReward {
  tier: number;
  crownsNeeded: number;
  free: { type: 'gold' | 'gems' | 'cards' | 'chest'; amount: number; emoji: string; label: string };
  paid: { type: 'gold' | 'gems' | 'cards' | 'chest' | 'emote'; amount: number; emoji: string; label: string };
}

const WAR_PASS_REWARDS: PassReward[] = [
  { tier: 1, crownsNeeded: 5, free: { type: 'gold', amount: 200, emoji: '💰', label: '200 Gold' }, paid: { type: 'gems', amount: 10, emoji: '💎', label: '10 Gems' } },
  { tier: 2, crownsNeeded: 10, free: { type: 'cards', amount: 3, emoji: '🃏', label: '3 Cards' }, paid: { type: 'gold', amount: 500, emoji: '💰', label: '500 Gold' } },
  { tier: 3, crownsNeeded: 20, free: { type: 'gold', amount: 500, emoji: '💰', label: '500 Gold' }, paid: { type: 'chest', amount: 1, emoji: '📦', label: 'Silver Chest' } },
  { tier: 4, crownsNeeded: 30, free: { type: 'gems', amount: 5, emoji: '💎', label: '5 Gems' }, paid: { type: 'gold', amount: 1000, emoji: '💰', label: '1000 Gold' } },
  { tier: 5, crownsNeeded: 45, free: { type: 'chest', amount: 1, emoji: '📦', label: 'Gold Chest' }, paid: { type: 'gems', amount: 25, emoji: '💎', label: '25 Gems' } },
  { tier: 6, crownsNeeded: 60, free: { type: 'gold', amount: 1000, emoji: '💰', label: '1K Gold' }, paid: { type: 'cards', amount: 5, emoji: '🃏', label: '5 Rare Cards' } },
  { tier: 7, crownsNeeded: 80, free: { type: 'cards', amount: 5, emoji: '🃏', label: '5 Cards' }, paid: { type: 'chest', amount: 1, emoji: '✨', label: 'Magic Chest' } },
  { tier: 8, crownsNeeded: 100, free: { type: 'gems', amount: 10, emoji: '💎', label: '10 Gems' }, paid: { type: 'gold', amount: 2000, emoji: '💰', label: '2K Gold' } },
  { tier: 9, crownsNeeded: 130, free: { type: 'gold', amount: 2000, emoji: '💰', label: '2K Gold' }, paid: { type: 'gems', amount: 50, emoji: '💎', label: '50 Gems' } },
  { tier: 10, crownsNeeded: 160, free: { type: 'chest', amount: 1, emoji: '👑', label: 'Legendary Chest' }, paid: { type: 'emote', amount: 1, emoji: '🎭', label: 'Exclusive Emote' } },
];

const WarPassScreen = () => {
  const { setScreen, profile, setProfile } = useGame();
  const [crowns, setCrowns] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [claimedFree, setClaimedFree] = useState<Set<number>>(new Set());
  const [claimedPaid, setClaimedPaid] = useState<Set<number>>(new Set());

  // Load from localStorage
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

  // Save to localStorage
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

    // Grant reward
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
  };

  const buyPass = () => {
    if (profile.gems < 500) return;
    setProfile(p => ({ ...p, gems: p.gems - 500 }));
    setHasPaid(true);
    save(crowns, true, claimedFree, claimedPaid);
  };

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
          <span className="text-[10px] font-bold text-primary">{crowns} Crowns</span>
        </div>
      </div>

      {/* Buy pass banner */}
      {!hasPaid && (
        <div className="bg-gradient-to-r from-[hsl(280,40%,15%)] to-[hsl(320,40%,15%)] border-b border-[hsl(280,30%,25%)] px-3 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[hsl(280,60%,75%)]">🔥 Unlock Paid Track</div>
            <div className="text-[8px] text-muted-foreground">Get exclusive rewards alongside the free track</div>
          </div>
          <button
            onClick={buyPass}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
              profile.gems >= 500
                ? 'bg-[hsl(280,50%,45%)] text-foreground hover:bg-[hsl(280,50%,50%)] border border-[hsl(280,50%,55%)]'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            💎 500
          </button>
        </div>
      )}

      {/* Crown progress bar */}
      <div className="px-3 py-2 bg-[hsl(220,20%,11%)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] text-muted-foreground">Crown Progress</span>
          <span className="text-[9px] text-primary font-bold ml-auto">{crowns} / {WAR_PASS_REWARDS[WAR_PASS_REWARDS.length - 1].crownsNeeded}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-[hsl(38,90%,60%)] rounded-full transition-all"
            style={{ width: `${Math.min(100, (crowns / WAR_PASS_REWARDS[WAR_PASS_REWARDS.length - 1].crownsNeeded) * 100)}%` }}
          />
        </div>
      </div>

      {/* Reward tracks */}
      <div className="flex-1 overflow-y-auto">
        {/* Column headers */}
        <div className="sticky top-0 z-10 flex bg-[hsl(220,20%,10%)] border-b border-border">
          <div className="flex-1 text-center py-1.5 text-[9px] font-bold text-[hsl(120,40%,55%)] uppercase tracking-wider">Free Track</div>
          <div className="w-12" />
          <div className="flex-1 text-center py-1.5 text-[9px] font-bold text-[hsl(280,60%,65%)] uppercase tracking-wider">
            {hasPaid ? '⭐ Paid Track' : '🔒 Paid Track'}
          </div>
        </div>

        {WAR_PASS_REWARDS.map((reward) => {
          const unlocked = crowns >= reward.crownsNeeded;
          const freeClaimable = unlocked && !claimedFree.has(reward.tier);
          const freeClaimed = claimedFree.has(reward.tier);
          const paidClaimable = unlocked && hasPaid && !claimedPaid.has(reward.tier);
          const paidClaimed = claimedPaid.has(reward.tier);

          return (
            <div key={reward.tier} className={`flex items-stretch border-b border-border ${unlocked ? 'bg-[hsl(220,15%,12%)]' : 'bg-background opacity-70'}`}>
              {/* Free reward */}
              <div className="flex-1 p-2">
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

              {/* Center tier indicator */}
              <div className="w-12 flex flex-col items-center justify-center relative">
                <div className={`w-0.5 absolute top-0 bottom-0 ${unlocked ? 'bg-primary/40' : 'bg-border'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 text-[10px] font-black border-2 ${
                  unlocked ? 'bg-primary/20 border-primary text-primary' : 'bg-muted border-border text-muted-foreground'
                }`}>
                  {reward.crownsNeeded}
                </div>
              </div>

              {/* Paid reward */}
              <div className="flex-1 p-2">
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
      className={`w-full rounded-lg border p-2 flex flex-col items-center gap-1 transition-colors relative ${
        claimed ? 'bg-muted/30 border-border' :
        claimable ? `${bg} ring-1 ring-primary/50 shadow-[0_0_10px_hsl(38,90%,50%,0.15)]` :
        `${bg} opacity-60`
      }`}
    >
      {showLock && !claimed && (
        <Lock className="w-3 h-3 text-muted-foreground absolute top-1 right-1" />
      )}
      <span className={`text-lg ${claimed ? 'grayscale opacity-40' : ''}`}>{emoji}</span>
      <span className={`text-[8px] font-bold ${claimed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{label}</span>
      {claimed && <Check className="w-3 h-3 text-[hsl(120,50%,50%)]" />}
      {claimable && !claimed && (
        <span className="text-[7px] font-bold text-primary animate-pulse">TAP TO CLAIM</span>
      )}
    </motion.button>
  );
};

export default WarPassScreen;
