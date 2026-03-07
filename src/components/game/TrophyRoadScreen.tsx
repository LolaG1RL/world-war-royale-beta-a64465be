import { useGame } from '@/context/GameContext';
import { BottomNav } from './ShopScreen';
import { trophyRoadRewards, arenas, getArenaForTrophies } from '@/data/cards';
import { motion } from 'framer-motion';
import { ChevronLeft, Lock, Check, Trophy } from 'lucide-react';

const TrophyRoadScreen = () => {
  const { setScreen, profile } = useGame();
  const currentArena = getArenaForTrophies(profile.trophies);

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
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
        {/* Arena sections */}
        {[...arenas].reverse().map((arena, ai) => {
          const arenaRewards = trophyRoadRewards.filter(r => r.trophies >= arena.trophies && r.trophies < (arenas[arenas.length - 1 - ai + 1]?.trophies || 99999));
          const isCurrentArena = arena.id === currentArena.id;
          const isPast = arena.trophies < currentArena.trophies;
          const isFuture = arena.trophies > profile.trophies;

          return (
            <div key={arena.id} className={`border-b border-border ${isCurrentArena ? 'bg-primary/5' : ''}`}>
              {/* Arena header */}
              <div className={`flex items-center gap-2 px-3 py-2 ${isFuture ? 'opacity-50' : ''}`}>
                <span className="text-lg">{arena.emoji}</span>
                <div className="flex-1">
                  <div className="text-[10px] font-display font-bold text-foreground">{arena.name}</div>
                  <div className="text-[8px] text-muted-foreground">{arena.trophies} trophies</div>
                </div>
                {isCurrentArena && <span className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">CURRENT</span>}
                {isFuture && <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>

              {/* Rewards in this arena */}
              {arenaRewards.length > 0 && (
                <div className="px-3 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {arenaRewards.map((reward, ri) => (
                      <motion.div
                        key={ri}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[8px] ${
                          reward.claimed
                            ? 'bg-muted/30 border-border text-muted-foreground'
                            : reward.trophies <= profile.trophies
                            ? 'bg-primary/10 border-primary/30 text-primary font-bold'
                            : 'bg-muted/10 border-border/50 text-muted-foreground/50'
                        }`}
                      >
                        {reward.claimed ? <Check className="w-2.5 h-2.5" /> : <span>{reward.emoji}</span>}
                        <span>{reward.name}</span>
                        <span className="text-[7px] opacity-70">@{reward.trophies}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav active="battle" setScreen={setScreen} />
    </div>
  );
};

export default TrophyRoadScreen;
