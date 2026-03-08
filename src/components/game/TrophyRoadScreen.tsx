import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { BottomNav } from './BottomNav';
import { trophyRoadRewards, arenas, getArenaForTrophies, allCards } from '@/data/cards';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Lock, Check, Trophy, Gift } from 'lucide-react';
import { addCards } from '@/data/cardInventory';
import RevealScreen, { RevealItem } from './RevealScreen';

const TrophyRoadScreen = () => {
  const { setScreen, profile, setProfile } = useGame();
  const currentArena = getArenaForTrophies(profile.trophies);
  const [claimedRewards, setClaimedRewards] = useState<Set<number>>(new Set());
  const [revealItems, setRevealItems] = useState<RevealItem[] | null>(null);
  const [revealTitle, setRevealTitle] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('trophy_road_claimed');
    if (saved) {
      try { setClaimedRewards(new Set(JSON.parse(saved))); } catch {}
    }
  }, []);

  const saveClaimed = (next: Set<number>) => {
    setClaimedRewards(next);
    localStorage.setItem('trophy_road_claimed', JSON.stringify([...next]));
  };

  const generateChestRewards = (chestType: string): RevealItem[] => {
    const items: RevealItem[] = [];
    let numCards = 3;
    let goldAmount = 100;

    if (chestType.includes('Gold')) { numCards = 6; goldAmount = 300; }
    else if (chestType.includes('Giant')) { numCards = 8; goldAmount = 500; }
    else if (chestType.includes('Magical') || chestType.includes('Magic')) { numCards = 12; goldAmount = 600; }
    else if (chestType.includes('Legendary')) { numCards = 1; goldAmount = 1000; }
    else if (chestType.includes('Mega') || chestType.includes('Lightning')) { numCards = 15; goldAmount = 1500; }
    else if (chestType.includes('Starter')) { numCards = 4; goldAmount = 150; }

    for (let i = 0; i < numCards; i++) {
      const card = allCards[Math.floor(Math.random() * allCards.length)];
      const existing = items.find(r => r.name === card.name);
      if (existing) { existing.count += 1; }
      else { items.push({ emoji: card.emoji, name: card.name, count: 1, rarity: card.rarity }); }
    }

    items.push({ emoji: '💰', name: 'Gold', count: goldAmount + Math.floor(Math.random() * goldAmount), rarity: 'common' });
    return items;
  };

  const generateCardRewards = (amount: number): RevealItem[] => {
    const items: RevealItem[] = [];
    for (let i = 0; i < amount; i++) {
      const card = allCards[Math.floor(Math.random() * allCards.length)];
      const existing = items.find(r => r.name === card.name);
      if (existing) { existing.count += 1; }
      else { items.push({ emoji: card.emoji, name: card.name, count: 1, rarity: card.rarity }); }
    }
    return items;
  };

  const claimReward = (trophies: number) => {
    const reward = trophyRoadRewards.find(r => r.trophies === trophies);
    if (!reward || claimedRewards.has(trophies)) return;

    let items: RevealItem[] = [];

    if (reward.type === 'gold') {
      setProfile(p => ({ ...p, gold: p.gold + reward.amount }));
      items = [{ emoji: '💰', name: 'Gold', count: reward.amount, rarity: 'common' }];
    } else if (reward.type === 'gems') {
      setProfile(p => ({ ...p, gems: p.gems + reward.amount }));
      items = [{ emoji: '💎', name: 'Gems', count: reward.amount, rarity: 'epic' }];
    } else if (reward.type === 'chest') {
      items = generateChestRewards(reward.name);
      const goldItem = items.find(i => i.name === 'Gold');
      if (goldItem) setProfile(p => ({ ...p, gold: p.gold + goldItem.count }));
    } else if (reward.type === 'cards') {
      items = generateCardRewards(reward.amount);
    }

    // Grant card inventory
    items.forEach(item => {
      const card = allCards.find(c => c.name === item.name);
      if (card) addCards(card.id, item.count);
    });

    setRevealItems(items);
    setRevealTitle(reward.name);

    const next = new Set(claimedRewards);
    next.add(trophies);
    saveClaimed(next);
  };
  };

  const rarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-[hsl(38,90%,55%)]';
      case 'epic': return 'text-[hsl(280,60%,65%)]';
      case 'rare': return 'text-[hsl(210,70%,60%)]';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <button onClick={() => setScreen('menu')} className="text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">Trophy Road</h2>
        <div className="trophy-badge text-xs">
          <Trophy className="w-3 h-3" />
          {profile.trophies}
        </div>
      </div>

      {/* Arena display */}
      <div className="bg-gradient-to-r from-[hsl(220,25%,14%)] to-[hsl(220,20%,18%)] p-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentArena.emoji}</span>
          <div>
            <div className="text-xs font-display font-bold text-foreground">{currentArena.name}</div>
            <div className="text-[9px] text-muted-foreground">Arena {currentArena.id} • {currentArena.trophies}+ trophies</div>
          </div>
        </div>
      </div>

      {/* Trophy road - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {[...arenas].reverse().map((arena, ai) => {
          const arenaRewards = trophyRoadRewards.filter(r => r.trophies >= arena.trophies && r.trophies < (arenas[arenas.length - 1 - ai + 1]?.trophies || 99999));
          const isCurrentArena = arena.id === currentArena.id;
          const isFuture = arena.trophies > profile.trophies;

          return (
            <div key={arena.id} className={`border-b border-border ${isCurrentArena ? 'bg-primary/5' : ''}`}>
              <div className={`flex items-center gap-2 px-3 py-2 ${isFuture ? 'opacity-50' : ''}`}>
                <span className="text-lg">{arena.emoji}</span>
                <div className="flex-1">
                  <div className="text-[10px] font-display font-bold text-foreground">{arena.name}</div>
                  <div className="text-[8px] text-muted-foreground">{arena.trophies} trophies</div>
                </div>
                {isCurrentArena && <span className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">CURRENT</span>}
                {isFuture && <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>

              {arenaRewards.length > 0 && (
                <div className="px-3 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {arenaRewards.map((reward, ri) => {
                      const claimed = claimedRewards.has(reward.trophies);
                      const claimable = !claimed && reward.trophies <= profile.trophies;

                      return (
                        <motion.button
                          key={ri}
                          whileTap={claimable ? { scale: 0.95 } : {}}
                          onClick={claimable ? () => claimReward(reward.trophies) : undefined}
                          disabled={!claimable}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[8px] transition-colors ${
                            claimed
                              ? 'bg-muted/30 border-border text-muted-foreground'
                              : claimable
                              ? 'bg-primary/10 border-primary/30 text-primary font-bold ring-1 ring-primary/40 shadow-[0_0_8px_hsl(38,90%,50%,0.15)]'
                              : 'bg-muted/10 border-border/50 text-muted-foreground/50'
                          }`}
                        >
                          {claimed ? <Check className="w-2.5 h-2.5" /> : claimable ? <Gift className="w-2.5 h-2.5 animate-pulse" /> : <span>{reward.emoji}</span>}
                          <span>{reward.name}</span>
                          <span className="text-[7px] opacity-70">@{reward.trophies}</span>
                          {claimable && !claimed && (
                            <span className="text-[6px] font-bold text-primary animate-pulse ml-0.5">CLAIM</span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {revealItems && (
          <RevealScreen
            items={revealItems}
            title={`🎁 ${revealTitle}`}
            subtitle="You received:"
            onClose={() => setRevealItems(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav active="battle" setScreen={setScreen} />
    </div>
  );
};

export default TrophyRoadScreen;