import { useState, useEffect, useCallback } from 'react';
import { GameCard } from '@/data/cards';
import { allCards } from '@/data/cards';
import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import CardComponent from './CardComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { t } from '@/lib/i18n';

/**
 * Boat Battle Arena — PvE mode
 * Player attacks 3 defense towers on a rival boat.
 * Each tower has its own HP and assigned cards that auto-deploy as defenders.
 * Player wins by destroying all 3 towers. Loses if timer runs out.
 * Damage not fully destroying a tower is partially healed (1/4 HP restored).
 */

interface DefenseTower {
  id: number;
  hp: number;
  maxHp: number;
  cards: string[];
  destroyed: boolean;
}

const BoatBattleArena = () => {
  const { deck, setScreen, setBattleResult, setProfile } = useGame();
  const { language } = useSettings();

  // Load boat battle context
  const [context] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('river_race_battle') || '{}');
    } catch { return {}; }
  });

  // Load target defenses from river race data
  const [towers, setTowers] = useState<DefenseTower[]>(() => {
    try {
      const raceData = JSON.parse(localStorage.getItem('river_race_data') || '{}');
      const boats = raceData.boats || [];
      const targetBoat = boats[context.attackingBoatIdx];
      if (targetBoat?.defenses) {
        return targetBoat.defenses.filter((d: DefenseTower) => !d.destroyed).map((d: DefenseTower) => ({
          ...d,
          hp: d.hp,
          maxHp: d.maxHp,
        }));
      }
    } catch {}
    return [
      { id: 0, hp: 1000, maxHp: 1000, cards: [], destroyed: false },
      { id: 1, hp: 1000, maxHp: 1000, cards: [], destroyed: false },
      { id: 2, hp: 1000, maxHp: 1000, cards: [], destroyed: false },
    ];
  });

  const [elixir, setElixir] = useState(5);
  const [timer, setTimer] = useState(120); // 2 minutes for boat battle
  const [hand, setHand] = useState<GameCard[]>([]);
  const [nextCard, setNextCard] = useState<GameCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [targetTower, setTargetTower] = useState<number | null>(null);
  const [deployedUnits, setDeployedUnits] = useState<{ id: string; card: GameCard; towerId: number; key: number; hp: number }[]>([]);
  const [defenderUnits, setDefenderUnits] = useState<{ id: string; card: GameCard; towerId: number; key: number; hp: number }[]>([]);
  const [unitCounter, setUnitCounter] = useState(0);
  const [battleOver, setBattleOver] = useState(false);

  const rivalName = (() => {
    try {
      const raceData = JSON.parse(localStorage.getItem('river_race_data') || '{}');
      return raceData.boats?.[context.attackingBoatIdx]?.clanName || 'Rival Clan';
    } catch { return 'Rival Clan'; }
  })();

  // Init hand
  useEffect(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setHand(shuffled.slice(0, 4));
    setNextCard(shuffled[4] || shuffled[0]);
  }, [deck]);

  // Elixir regen
  useEffect(() => {
    const interval = setInterval(() => {
      setElixir(prev => Math.min(prev + 0.5, 10));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Defense towers auto-deploy defenders
  useEffect(() => {
    const interval = setInterval(() => {
      if (battleOver) return;
      towers.forEach(tower => {
        if (tower.destroyed || tower.cards.length === 0) return;
        // 30% chance per tick to spawn a defender
        if (Math.random() > 0.3) return;
        const cardId = tower.cards[Math.floor(Math.random() * tower.cards.length)];
        const card = allCards.find(c => c.id === cardId);
        if (!card) return;
        setUnitCounter(prev => {
          setDefenderUnits(u => [...u, {
            id: `def-${prev}`,
            card,
            towerId: tower.id,
            key: prev + 50000,
            hp: card.hp || 300,
          }]);
          return prev + 1;
        });
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [towers, battleOver]);

  // Combat: player units damage towers, defender units fight player units
  useEffect(() => {
    const interval = setInterval(() => {
      if (battleOver) return;

      // Player units attack towers
      setDeployedUnits(units => {
        const remaining: typeof units = [];
        units.forEach(u => {
          const tower = towers.find(t => t.id === u.towerId && !t.destroyed);
          if (tower) {
            tower.hp -= u.card.damage * 0.3; // scaled damage per tick
            if (tower.hp <= 0) {
              tower.hp = 0;
              tower.destroyed = true;
            }
          }
          // Units persist for a while, take damage from defenders
          u.hp -= 50;
          if (u.hp > 0) remaining.push(u);
        });
        setTowers([...towers]);
        return remaining;
      });

      // Defender units damage player units
      setDefenderUnits(defs => {
        return defs.map(d => ({ ...d, hp: d.hp - 30 })).filter(d => d.hp > 0);
      });

      // Check win: all intact towers destroyed
      const allDestroyed = towers.every(t => t.destroyed);
      if (allDestroyed && !battleOver) {
        endBattle(true);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [towers, battleOver]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (battleOver) return;
      setTimer(prev => {
        if (prev <= 0) {
          // Time's up — count destroyed towers
          const destroyed = towers.filter(t => t.destroyed).length;
          endBattle(destroyed > 0); // win if at least 1 tower destroyed
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [battleOver, towers]);

  const endBattle = useCallback((win: boolean) => {
    if (battleOver) return;
    setBattleOver(true);

    // Save crowns
    const towersDestroyed = towers.filter(t => t.destroyed).length;
    const netCrowns = win ? towersDestroyed : 0;
    const saved = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
    saved.crowns = Math.max(0, (saved.crowns || 0) + netCrowns);
    localStorage.setItem('war_pass_data', JSON.stringify(saved));
    localStorage.setItem('last_battle_crowns', String(netCrowns));

    // Update battle context
    const rb = JSON.parse(localStorage.getItem('river_race_battle') || '{}');
    localStorage.setItem('river_race_battle', JSON.stringify({
      ...rb,
      completed: true,
      result: win ? 'win' : 'loss',
      towersDestroyed,
    }));

    setBattleResult(win ? 'win' : 'lose');
    // No trophy changes for river race
    setTimeout(() => setScreen('result'), 500);
  }, [battleOver, towers, setBattleResult, setScreen]);

  const deployCard = (towerId: number) => {
    if (selectedCard === null) return;
    const card = hand[selectedCard];
    if (!card || elixir < card.elixir) return;
    const tower = towers.find(t => t.id === towerId && !t.destroyed);
    if (!tower) return;

    setElixir(p => p - card.elixir);
    setUnitCounter(prev => {
      setDeployedUnits(u => [...u, {
        id: `p-${prev}`,
        card,
        towerId,
        key: prev,
        hp: card.hp || 500,
      }]);
      return prev + 1;
    });

    setHand(prev => {
      const n = [...prev];
      n[selectedCard] = nextCard!;
      return n;
    });
    const rem = deck.filter(c => !hand.includes(c) && c.id !== nextCard?.id);
    setNextCard(rem[Math.floor(Math.random() * rem.length)] || deck[0]);
    setSelectedCard(null);
    setTargetTower(null);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const totalTowersDestroyed = towers.filter(t => t.destroyed).length;

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[hsl(220,20%,10%,0.95)] z-20 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-accent font-bold font-display text-[10px]">⚓ BOAT BATTLE</span>
        </div>
        <div className="px-3 py-0.5 rounded-full font-display font-bold text-sm bg-accent/20 text-accent">
          {fmt(timer)}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground">{rivalName}</span>
        </div>
      </div>

      {/* Battle info */}
      <div className="bg-[hsl(0,30%,12%)] px-3 py-1 flex items-center justify-between border-b border-border">
        <span className="text-[8px] text-muted-foreground">Towers destroyed: {totalTowersDestroyed}/{towers.length}</span>
        <span className="text-[8px] text-accent font-bold">
          {selectedCard !== null ? '👆 Tap a tower to attack!' : 'Select a card first'}
        </span>
      </div>

      {/* Defense Towers Arena */}
      <div className="flex-1 relative bg-gradient-to-b from-[hsl(200,30%,15%)] via-[hsl(220,20%,12%)] to-[hsl(200,30%,10%)]">
        {/* Water effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[hsl(200,50%,30%)] to-transparent" />
        </div>

        {/* Boat shape background */}
        <div className="absolute inset-x-4 top-4 bottom-4 border-2 border-[hsl(30,20%,25%)] rounded-3xl bg-[hsl(30,15%,12%,0.3)]" />

        {/* Defense towers */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 p-6">
          {towers.map((tower, idx) => {
            const towerCards = tower.cards.map(id => allCards.find(c => c.id === id)).filter(Boolean);
            const activeDefenders = defenderUnits.filter(d => d.towerId === tower.id);
            const attackers = deployedUnits.filter(u => u.towerId === tower.id);

            return (
              <motion.button
                key={tower.id}
                onClick={() => {
                  if (selectedCard !== null && !tower.destroyed) {
                    deployCard(tower.id);
                  }
                }}
                disabled={tower.destroyed}
                className={`w-full max-w-xs rounded-2xl p-3 border-2 transition-all relative ${
                  tower.destroyed
                    ? 'bg-destructive/10 border-destructive/20 opacity-50'
                    : selectedCard !== null
                      ? 'bg-[hsl(0,30%,15%)] border-accent/50 hover:border-accent shadow-[0_0_20px_hsl(0,50%,40%,0.2)]'
                      : 'bg-[hsl(220,15%,14%)] border-border'
                }`}
              >
                {/* Tower header */}
                <div className="flex items-center gap-2 mb-2">
                  <Shield className={`w-5 h-5 ${tower.destroyed ? 'text-destructive/40' : 'text-accent'}`} />
                  <span className="text-[10px] font-bold text-foreground">{t('boat.defense_tower', language)} {idx + 1}</span>
                  {tower.destroyed ? (
                    <span className="text-[8px] text-destructive font-bold ml-auto">{t('battle.destroyed', language)}</span>
                  ) : (
                    <span className="text-[8px] text-accent font-bold ml-auto">{Math.max(0, Math.round(tower.hp))}/{tower.maxHp} HP</span>
                  )}
                </div>

                {/* HP bar */}
                {!tower.destroyed && (
                  <div className="h-3 bg-[hsl(0,0%,0%,0.5)] rounded-full overflow-hidden mb-2">
                    <motion.div
                      className={`h-full rounded-full ${
                        tower.hp / tower.maxHp > 0.5 ? 'bg-[hsl(120,50%,45%)]' :
                        tower.hp / tower.maxHp > 0.25 ? 'bg-primary' : 'bg-destructive'
                      }`}
                      animate={{ width: `${Math.max(0, (tower.hp / tower.maxHp) * 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Defense cards */}
                {!tower.destroyed && (
                  <div className="flex gap-1 justify-center mb-1">
                    {towerCards.map((card, ci) => card && (
                      <div key={ci} className="w-8 h-8 bg-[hsl(0,30%,18%)] rounded-lg border border-accent/20 flex items-center justify-center">
                        <span className="text-sm">{card.emoji}</span>
                      </div>
                    ))}
                    {towerCards.length === 0 && (
                      <span className="text-[7px] text-muted-foreground">No defense cards</span>
                    )}
                  </div>
                )}

                {/* Active units on this tower */}
                <AnimatePresence>
                  {attackers.length > 0 && !tower.destroyed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-0.5 justify-center mt-1">
                      {attackers.slice(0, 4).map(u => (
                        <motion.div key={u.key} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          className="w-6 h-6 rounded-full bg-[hsl(210,50%,35%)] border border-[hsl(210,60%,50%)] flex items-center justify-center">
                          <span className="text-[8px]">{u.card.emoji}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  {activeDefenders.length > 0 && !tower.destroyed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-0.5 justify-center mt-0.5">
                      {activeDefenders.slice(0, 3).map(d => (
                        <motion.div key={d.key} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          className="w-5 h-5 rounded-full bg-[hsl(0,50%,35%)] border border-[hsl(0,60%,50%)] flex items-center justify-center">
                          <span className="text-[7px]">{d.card.emoji}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Elixir bar */}
      <div className="px-3 py-1.5 bg-[hsl(220,20%,10%,0.95)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-elixir/20 border border-elixir/40 flex items-center justify-center">
            <span className="text-xs font-black text-elixir">{Math.floor(elixir)}</span>
          </div>
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden relative">
            <div className="h-full elixir-bar rounded-full transition-all duration-200" style={{ width: `${(elixir / 10) * 100}%` }} />
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0 w-px bg-[hsl(0,0%,0%,0.3)]" style={{ left: `${(i + 1) * 10}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Card hand */}
      <div className="px-1.5 py-2 bg-[hsl(220,20%,9%)] border-t border-border flex items-end justify-center gap-1">
        {nextCard && (
          <div className="mr-1.5">
            <div className="text-[6px] text-muted-foreground text-center mb-0.5 uppercase tracking-wider">Next</div>
            <CardComponent card={nextCard} size="xs" showElixir={false} />
          </div>
        )}
        {hand.map((card, i) => (
          <motion.div key={card.id + i} whileTap={{ scale: 0.95 }} onClick={() => setSelectedCard(selectedCard === i ? null : i)}>
            <div className={`transition-all duration-150 rounded-lg ${selectedCard === i ? 'ring-2 ring-accent -translate-y-3 shadow-[0_0_15px_hsl(0,60%,50%,0.3)]' : ''}`}>
              <CardComponent card={card} size="sm" disabled={elixir < card.elixir} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BoatBattleArena;
