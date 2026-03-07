import { useState, useEffect, useCallback } from 'react';
import { GameCard } from '@/data/cards';
import { useGame } from '@/context/GameContext';
import CardComponent from './CardComponent';
import { motion, AnimatePresence } from 'framer-motion';

const BattleArena = () => {
  const { deck, setScreen, setBattleResult, setProfile } = useGame();
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
  const [isDoubleElixir, setIsDoubleElixir] = useState(false);

  useEffect(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setHand(shuffled.slice(0, 4));
    setNextCard(shuffled[4] || shuffled[0]);
  }, [deck]);

  // Elixir regen
  useEffect(() => {
    const rate = isDoubleElixir ? 0.5 : 1;
    const interval = setInterval(() => {
      setElixir(prev => Math.min(prev + 0.5, maxElixir));
    }, 1000 * rate);
    return () => clearInterval(interval);
  }, [maxElixir, isDoubleElixir]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 60 && !isDoubleElixir) setIsDoubleElixir(true);
        if (prev <= 0) {
          const pCrowns = (enemyTowerHP.left <= 0 ? 1 : 0) + (enemyTowerHP.right <= 0 ? 1 : 0) + (enemyTowerHP.king <= 0 ? 1 : 0);
          const eCrowns = (playerTowerHP.left <= 0 ? 1 : 0) + (playerTowerHP.right <= 0 ? 1 : 0) + (playerTowerHP.king <= 0 ? 1 : 0);
          const result = pCrowns >= eCrowns ? 'win' : 'lose';
          setBattleResult(result);
          setProfile(prev => ({ ...prev, trophies: result === 'win' ? prev.trophies + 30 : Math.max(0, prev.trophies - 15), wins: result === 'win' ? prev.wins + 1 : prev.wins, losses: result === 'lose' ? prev.losses + 1 : prev.losses }));
          setScreen('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [enemyTowerHP, playerTowerHP, isDoubleElixir]);

  // Enemy AI
  useEffect(() => {
    const interval = setInterval(() => {
      const troops = deck.filter(c => c.type === 'troop');
      if (!troops.length) return;
      const card = troops[Math.floor(Math.random() * troops.length)];
      setUnitCounter(prev => {
        setDeployedUnits(u => [...u, { id: `e-${prev}`, card, x: 20 + Math.random() * 60, y: 10 + Math.random() * 30, side: 'enemy', key: prev }]);
        return prev + 1;
      });
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [deck]);

  // Combat sim
  useEffect(() => {
    const interval = setInterval(() => {
      setDeployedUnits(units => {
        const moved = units.map(u => ({ ...u, y: u.side === 'player' ? u.y - 0.4 : u.y + 0.4 }));
        return moved.filter(u => {
          if (u.side === 'player' && u.y <= 8) {
            setEnemyTowerHP(p => ({ ...p, [u.x < 50 ? 'left' : 'right']: Math.max(0, p[u.x < 50 ? 'left' : 'right'] - u.card.damage) }));
            return false;
          }
          if (u.side === 'enemy' && u.y >= 92) {
            setPlayerTowerHP(p => ({ ...p, [u.x < 50 ? 'left' : 'right']: Math.max(0, p[u.x < 50 ? 'left' : 'right'] - u.card.damage) }));
            return false;
          }
          return true;
        });
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const deployCard = useCallback((ax: number, ay: number) => {
    if (selectedCard === null) return;
    const card = hand[selectedCard];
    if (!card || elixir < card.elixir) return;
    setElixir(p => p - card.elixir);
    setUnitCounter(prev => {
      setDeployedUnits(u => [...u, { id: `p-${prev}`, card, x: ax, y: ay, side: 'player', key: prev }]);
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
  }, [selectedCard, hand, elixir, nextCard, deck]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const pCrowns = (enemyTowerHP.left <= 0 ? 1 : 0) + (enemyTowerHP.right <= 0 ? 1 : 0) + (enemyTowerHP.king <= 0 ? 1 : 0);
  const eCrowns = (playerTowerHP.left <= 0 ? 1 : 0) + (playerTowerHP.right <= 0 ? 1 : 0) + (playerTowerHP.king <= 0 ? 1 : 0);

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col arena-field relative overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[hsl(220,20%,10%,0.95)] z-20 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-[hsl(210,60%,55%)] font-bold font-display text-[10px]">YOU</span>
          <div className="flex gap-0.5">{[0,1,2].map(i => <span key={i} className={`text-[10px] ${i < pCrowns ? 'text-primary' : 'text-muted-foreground/20'}`}>⭐</span>)}</div>
        </div>
        <div className={`px-3 py-0.5 rounded-full font-display font-bold text-sm ${isDoubleElixir ? 'bg-accent/20 text-accent' : 'bg-muted text-primary'}`}>
          {fmt(timer)}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">{[0,1,2].map(i => <span key={i} className={`text-[10px] ${i < eCrowns ? 'text-accent' : 'text-muted-foreground/20'}`}>⭐</span>)}</div>
          <span className="text-[hsl(0,65%,55%)] font-bold font-display text-[10px]">FOE</span>
        </div>
      </div>

      {isDoubleElixir && (
        <div className="bg-accent/20 text-center py-0.5 text-[8px] font-bold text-accent uppercase tracking-widest">⚡ Double Elixir ⚡</div>
      )}

      {/* Arena */}
      <div className="flex-1 relative" onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        if (y > 50) deployCard(x, y);
      }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,28%,10%)] via-[hsl(120,20%,14%)] to-[hsl(220,28%,10%)]" />
        
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({length: 8}).map((_, i) => <div key={i} className="absolute left-0 right-0 border-t border-foreground" style={{top: `${(i+1)*12.5}%`}} />)}
        </div>

        {/* River */}
        <div className="absolute left-0 right-0 top-[47%] h-[6%] bg-arena-river/40">
          <div className="absolute inset-0 bg-gradient-to-b from-arena-river/20 via-arena-river/50 to-arena-river/20" />
        </div>
        {/* Bridges */}
        <div className="absolute left-[18%] top-[46%] w-[14%] h-[8%] bg-[hsl(30,25%,22%)] rounded border border-[hsl(30,20%,30%)] z-10" />
        <div className="absolute right-[18%] top-[46%] w-[14%] h-[8%] bg-[hsl(30,25%,22%)] rounded border border-[hsl(30,20%,30%)] z-10" />

        {/* Enemy towers */}
        <Tower x="50%" y="4%" size="lg" color="red" hp={enemyTowerHP.king} maxHp={4000} label="👑" />
        <Tower x="20%" y="17%" size="sm" color="red" hp={enemyTowerHP.left} maxHp={2500} label="🗼" />
        <Tower x="80%" y="17%" size="sm" color="red" hp={enemyTowerHP.right} maxHp={2500} label="🗼" />

        {/* Player towers */}
        <Tower x="50%" y="88%" size="lg" color="blue" hp={playerTowerHP.king} maxHp={4000} label="👑" />
        <Tower x="20%" y="75%" size="sm" color="blue" hp={playerTowerHP.left} maxHp={2500} label="🗼" />
        <Tower x="80%" y="75%" size="sm" color="blue" hp={playerTowerHP.right} maxHp={2500} label="🗼" />

        {/* Units */}
        <AnimatePresence>
          {deployedUnits.map(u => (
            <motion.div key={u.key} initial={{scale:0}} animate={{scale:1}} exit={{scale:0,opacity:0}} className="absolute z-20" style={{left:`${u.x}%`,top:`${u.y}%`,transform:'translate(-50%,-50%)'}}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg ${u.side==='player'?'bg-[hsl(210,60%,35%)] border border-[hsl(210,70%,50%)]':'bg-[hsl(0,60%,35%)] border border-[hsl(0,70%,50%)]'}`}>
                {u.card.emoji}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {selectedCard !== null && (
          <div className="absolute bottom-0 left-0 right-0 top-1/2 border-t-2 border-dashed border-primary/20 bg-primary/5 pointer-events-none" />
        )}
      </div>

      {/* Elixir bar */}
      <div className="px-3 py-1.5 bg-[hsl(220,20%,10%,0.95)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-elixir/20 border border-elixir/40 flex items-center justify-center">
            <span className="text-xs font-black text-elixir">{Math.floor(elixir)}</span>
          </div>
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden relative">
            <div className="h-full elixir-bar rounded-full transition-all duration-200" style={{width:`${(elixir/maxElixir)*100}%`}} />
            {/* Tick marks */}
            {Array.from({length:9}).map((_,i) => (
              <div key={i} className="absolute top-0 bottom-0 w-px bg-[hsl(0,0%,0%,0.3)]" style={{left:`${(i+1)*10}%`}} />
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
          <motion.div key={card.id+i} whileTap={{scale:0.95}} onClick={() => setSelectedCard(selectedCard===i?null:i)}>
            <div className={`transition-all duration-150 rounded-lg ${selectedCard===i?'ring-2 ring-primary -translate-y-3 shadow-[0_0_15px_hsl(38,90%,50%,0.3)]':''}`}>
              <CardComponent card={card} size="sm" disabled={elixir<card.elixir} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Tower = ({ x, y, size, color, hp, maxHp, label }: { x: string; y: string; size: 'sm' | 'lg'; color: 'red' | 'blue'; hp: number; maxHp: number; label: string }) => {
  const isBlue = color === 'blue';
  const destroyed = hp <= 0;
  return (
    <div className="absolute z-10" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
      <div className={`${size==='lg'?'w-12 h-12':'w-9 h-9'} rounded-lg flex flex-col items-center justify-center ${destroyed ? 'bg-muted/30 border border-muted-foreground/20' : isBlue ? 'bg-[hsl(210,50%,30%)] border-2 border-[hsl(210,60%,45%)]' : 'bg-[hsl(0,50%,30%)] border-2 border-[hsl(0,60%,45%)]'} shadow-lg`}>
        <span className={`${size==='lg'?'text-base':'text-xs'} ${destroyed?'grayscale opacity-30':''}`}>{label}</span>
        {!destroyed && (
          <div className={`${size==='lg'?'w-8':'w-6'} h-1 bg-[hsl(0,0%,0%,0.4)] rounded-full overflow-hidden mt-0.5`}>
            <div className={`h-full rounded-full transition-all ${hp/maxHp > 0.5 ? 'bg-hp-green' : hp/maxHp > 0.25 ? 'bg-primary' : 'bg-hp-red'}`} style={{width:`${(hp/maxHp)*100}%`}} />
          </div>
        )}
      </div>
      {!destroyed && <div className="text-[7px] font-bold text-foreground text-center mt-0.5 drop-shadow">{hp}</div>}
    </div>
  );
};

export default BattleArena;
