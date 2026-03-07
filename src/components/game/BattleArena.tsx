import { useState, useEffect, useCallback } from 'react';
import { GameCard, getStarterDeck } from '@/data/cards';
import CardComponent from './CardComponent';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleArenaProps {
  deck: GameCard[];
  onBattleEnd: (result: 'win' | 'lose') => void;
}

const BattleArena = ({ deck, onBattleEnd }: BattleArenaProps) => {
  const [elixir, setElixir] = useState(5);
  const [maxElixir] = useState(10);
  const [timer, setTimer] = useState(180);
  const [hand, setHand] = useState<GameCard[]>([]);
  const [nextCard, setNextCard] = useState<GameCard | null>(null);
  const [playerTowerHP, setPlayerTowerHP] = useState({ king: 4000, left: 2500, right: 2500 });
  const [enemyTowerHP, setEnemyTowerHP] = useState({ king: 4000, left: 2500, right: 2500 });
  const [deployedUnits, setDeployedUnits] = useState<{ id: string; card: GameCard; x: number; y: number; side: 'player' | 'enemy'; key: number }[]>([]);
  const [unitCounter, setUnitCounter] = useState(0);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  // Initialize hand
  useEffect(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setHand(shuffled.slice(0, 4));
    setNextCard(shuffled[4] || shuffled[0]);
  }, [deck]);

  // Elixir regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setElixir(prev => Math.min(prev + 0.5, maxElixir));
    }, 1000);
    return () => clearInterval(interval);
  }, [maxElixir]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          const playerCrowns = (enemyTowerHP.left <= 0 ? 1 : 0) + (enemyTowerHP.right <= 0 ? 1 : 0) + (enemyTowerHP.king <= 0 ? 1 : 0);
          const enemyCrowns = (playerTowerHP.left <= 0 ? 1 : 0) + (playerTowerHP.right <= 0 ? 1 : 0) + (playerTowerHP.king <= 0 ? 1 : 0);
          onBattleEnd(playerCrowns >= enemyCrowns ? 'win' : 'lose');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [enemyTowerHP, playerTowerHP, onBattleEnd]);

  // Enemy AI - deploys units periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const availableCards = deck.filter(c => c.type === 'troop');
      if (availableCards.length === 0) return;
      const card = availableCards[Math.floor(Math.random() * availableCards.length)];
      const x = 20 + Math.random() * 60;
      const y = 10 + Math.random() * 30;
      setUnitCounter(prev => {
        setDeployedUnits(units => [...units, { id: `enemy-${prev}`, card, x, y, side: 'enemy', key: prev }]);
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [deck]);

  // Simulate combat
  useEffect(() => {
    const interval = setInterval(() => {
      setDeployedUnits(units => {
        const moving = units.map(u => ({
          ...u,
          y: u.side === 'player' ? u.y - 0.5 : u.y + 0.5,
        }));

        // Check if units reached towers
        const surviving = moving.filter(u => {
          if (u.side === 'player' && u.y <= 5) {
            setEnemyTowerHP(prev => {
              const target = u.x < 50 ? 'left' : 'right';
              return { ...prev, [target]: Math.max(0, prev[target] - u.card.damage) };
            });
            return false;
          }
          if (u.side === 'enemy' && u.y >= 95) {
            setPlayerTowerHP(prev => {
              const target = u.x < 50 ? 'left' : 'right';
              return { ...prev, [target]: Math.max(0, prev[target] - u.card.damage) };
            });
            return false;
          }
          return true;
        });

        return surviving;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const deployCard = useCallback((arenaX: number, arenaY: number) => {
    if (selectedCard === null) return;
    const card = hand[selectedCard];
    if (!card || elixir < card.elixir) return;

    setElixir(prev => prev - card.elixir);
    setUnitCounter(prev => {
      setDeployedUnits(units => [...units, { id: `player-${prev}`, card, x: arenaX, y: arenaY, side: 'player', key: prev }]);
      return prev + 1;
    });

    // Replace card in hand
    setHand(prev => {
      const newHand = [...prev];
      newHand[selectedCard] = nextCard!;
      return newHand;
    });
    const remaining = deck.filter(c => !hand.includes(c) && c.id !== nextCard?.id);
    setNextCard(remaining[Math.floor(Math.random() * remaining.length)] || deck[0]);
    setSelectedCard(null);
  }, [selectedCard, hand, elixir, nextCard, deck]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const playerCrowns = (enemyTowerHP.left <= 0 ? 1 : 0) + (enemyTowerHP.right <= 0 ? 1 : 0) + (enemyTowerHP.king <= 0 ? 1 : 0);
  const enemyCrowns = (playerTowerHP.left <= 0 ? 1 : 0) + (playerTowerHP.right <= 0 ? 1 : 0) + (playerTowerHP.king <= 0 ? 1 : 0);

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col arena-field relative overflow-hidden">
      {/* Top bar - timer & scores */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
          <span className="text-tower-blue font-bold font-display text-sm">YOU</span>
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <span key={i} className={`text-xs ${i < playerCrowns ? 'text-primary' : 'text-muted-foreground/30'}`}>👑</span>
            ))}
          </div>
        </div>
        <div className="bg-muted px-3 py-1 rounded-full font-display font-bold text-sm text-primary">
          {formatTime(timer)}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[0, 1, 2].map(i => (
              <span key={i} className={`text-xs ${i < enemyCrowns ? 'text-accent' : 'text-muted-foreground/30'}`}>👑</span>
            ))}
          </div>
          <span className="text-tower-red font-bold font-display text-sm">FOE</span>
        </div>
      </div>

      {/* Arena */}
      <div
        className="flex-1 relative"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          if (y > 50) deployCard(x, y);
        }}
      >
        {/* Arena background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,12%)] via-[hsl(220,20%,15%)] to-[hsl(220,25%,12%)]" />

        {/* River */}
        <div className="absolute left-0 right-0 top-[48%] h-[4%] bg-arena-river/60 backdrop-blur-sm" />

        {/* Bridge left */}
        <div className="absolute left-[20%] top-[47%] w-[15%] h-[6%] bg-[hsl(30,30%,25%)] rounded-sm border border-[hsl(30,20%,35%)]" />
        {/* Bridge right */}
        <div className="absolute right-[20%] top-[47%] w-[15%] h-[6%] bg-[hsl(30,30%,25%)] rounded-sm border border-[hsl(30,20%,35%)]" />

        {/* Enemy towers */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 tower">
          <div className="w-14 h-14 rounded-lg bg-tower-red/80 border-2 border-tower-red flex flex-col items-center justify-center">
            <span className="text-lg">🏰</span>
            <span className="text-[8px] font-bold text-foreground">{enemyTowerHP.king}</span>
          </div>
        </div>
        <div className="absolute top-[18%] left-[15%] tower">
          <div className="w-10 h-10 rounded-lg bg-tower-red/60 border-2 border-tower-red/80 flex flex-col items-center justify-center">
            <span className="text-sm">🗼</span>
            <span className="text-[7px] font-bold text-foreground">{enemyTowerHP.left}</span>
          </div>
        </div>
        <div className="absolute top-[18%] right-[15%] tower">
          <div className="w-10 h-10 rounded-lg bg-tower-red/60 border-2 border-tower-red/80 flex flex-col items-center justify-center">
            <span className="text-sm">🗼</span>
            <span className="text-[7px] font-bold text-foreground">{enemyTowerHP.right}</span>
          </div>
        </div>

        {/* Player towers */}
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 tower">
          <div className="w-14 h-14 rounded-lg bg-tower-blue/80 border-2 border-tower-blue flex flex-col items-center justify-center">
            <span className="text-lg">🏰</span>
            <span className="text-[8px] font-bold text-foreground">{playerTowerHP.king}</span>
          </div>
        </div>
        <div className="absolute bottom-[18%] left-[15%] tower">
          <div className="w-10 h-10 rounded-lg bg-tower-blue/60 border-2 border-tower-blue/80 flex flex-col items-center justify-center">
            <span className="text-sm">🗼</span>
            <span className="text-[7px] font-bold text-foreground">{playerTowerHP.left}</span>
          </div>
        </div>
        <div className="absolute bottom-[18%] right-[15%] tower">
          <div className="w-10 h-10 rounded-lg bg-tower-blue/60 border-2 border-tower-blue/80 flex flex-col items-center justify-center">
            <span className="text-sm">🗼</span>
            <span className="text-[7px] font-bold text-foreground">{playerTowerHP.right}</span>
          </div>
        </div>

        {/* Deployed units */}
        <AnimatePresence>
          {deployedUnits.map(unit => (
            <motion.div
              key={unit.key}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute z-10"
              style={{ left: `${unit.x}%`, top: `${unit.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${unit.side === 'player' ? 'bg-tower-blue/70 border border-tower-blue' : 'bg-tower-red/70 border border-tower-red'}`}>
                {unit.card.emoji}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Deploy zone indicator */}
        {selectedCard !== null && (
          <div className="absolute bottom-0 left-0 right-0 top-1/2 border-t-2 border-dashed border-primary/30 bg-primary/5 pointer-events-none z-5" />
        )}
      </div>

      {/* Elixir bar */}
      <div className="px-4 py-2 bg-secondary/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-elixir font-bold text-sm font-display">{Math.floor(elixir)}</span>
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full elixir-bar rounded-full transition-all duration-300"
              style={{ width: `${(elixir / maxElixir) * 100}%` }}
            />
          </div>
          <span className="text-muted-foreground text-xs">/{maxElixir}</span>
        </div>
      </div>

      {/* Card hand */}
      <div className="px-2 py-3 bg-card/95 backdrop-blur-sm border-t border-border flex items-end justify-center gap-2">
        {nextCard && (
          <div className="mr-2 opacity-50">
            <div className="text-[7px] text-muted-foreground text-center mb-1">NEXT</div>
            <CardComponent card={nextCard} size="sm" />
          </div>
        )}
        {hand.map((card, i) => (
          <motion.div
            key={card.id + i}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCard(selectedCard === i ? null : i)}
          >
            <div className={`${selectedCard === i ? 'ring-2 ring-primary -translate-y-2' : ''} transition-all rounded-lg`}>
              <CardComponent
                card={card}
                size="md"
                disabled={elixir < card.elixir}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BattleArena;
