import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { allCards, GameCard } from '@/data/cards';
import { BottomNav } from './ShopScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Swords, Shield, Zap, Trophy, Anchor, Clock, Medal, ChevronRight, Check, X, Shuffle, Ship } from 'lucide-react';
import { toast } from 'sonner';

// --- TYPES ---
interface BoatData {
  clanName: string;
  clanEmoji: string;
  medals: number;
  position: number; // 0–10000
  color: string;
  isPlayer: boolean;
  defenses: BoatDefense[];
  finished: boolean;
}

interface BoatDefense {
  id: number;
  hp: number;
  maxHp: number;
  cards: string[]; // card ids
  destroyed: boolean;
}

interface WarDeck {
  cards: GameCard[];
  usedToday: boolean;
}

type RiverMode = 'map' | 'battle-select' | 'war-decks' | 'boat-defense' | 'boat-attack' | 'battle-result';
type BattleType = '1v1' | 'duel' | 'boat' | 'special';

const FINISH_LINE = 10000;
const MEDAL_WIN_1V1 = 200;
const MEDAL_LOSS_1V1 = 50;
const MEDAL_WIN_DUEL = 700;
const MEDAL_LOSS_DUEL = 150;
const MEDAL_SPECIAL = 250;
const MEDAL_BOAT_WIN = 150;

const RIVAL_CLANS = [
  { name: 'Iron Wolves', emoji: '🐺', color: 'hsl(0,60%,45%)' },
  { name: 'Storm Legion', emoji: '⛈️', color: 'hsl(210,60%,45%)' },
  { name: 'Shadow Hawks', emoji: '🦅', color: 'hsl(280,50%,45%)' },
  { name: 'Golden Horde', emoji: '🐎', color: 'hsl(45,70%,45%)' },
];

const SPECIAL_MODES = [
  { name: 'Double Elixir', emoji: '⚡', desc: '2x elixir generation' },
  { name: 'Sudden Death', emoji: '💀', desc: 'First tower wins' },
  { name: 'Triple Elixir', emoji: '⚡⚡⚡', desc: '3x elixir chaos' },
  { name: 'Rage Battle', emoji: '😤', desc: 'Everything is enraged' },
];

const getStoredRiverData = () => {
  const saved = localStorage.getItem('river_race_data');
  if (saved) {
    try {
      const d = JSON.parse(saved);
      const weekStart = d.weekStart || Date.now();
      const daysPassed = (Date.now() - weekStart) / (1000 * 60 * 60 * 24);
      if (daysPassed >= 7) {
        // New week — reset
        return null;
      }
      return d;
    } catch { return null; }
  }
  return null;
};

const RiverRaceScreen = () => {
  const { setScreen, profile, setProfile, clan, deck } = useGame();
  const { user } = useAuth();

  const [mode, setMode] = useState<RiverMode>('map');
  const [boats, setBoats] = useState<BoatData[]>([]);
  const [warDecks, setWarDecks] = useState<WarDeck[]>([]);
  const [editingDeck, setEditingDeck] = useState<number | null>(null);
  const [dayNumber, setDayNumber] = useState(1); // 1-7
  const [isTrainingDay, setIsTrainingDay] = useState(true);
  const [battleType, setBattleType] = useState<BattleType>('1v1');
  const [selectedDeckIndex, setSelectedDeckIndex] = useState(0);
  const [battleResult, setBattleResult] = useState<'win' | 'loss' | null>(null);
  const [duelRound, setDuelRound] = useState(0);
  const [duelScore, setDuelScore] = useState([0, 0]);
  const [attackingBoat, setAttackingBoat] = useState<number | null>(null);
  const [specialMode, setSpecialMode] = useState(SPECIAL_MODES[0]);
  const [battleGold, setBattleGold] = useState(0);
  const [battleMedals, setBattleMedals] = useState(0);

  // Init
  useEffect(() => {
    const stored = getStoredRiverData();
    if (stored) {
      setBoats(stored.boats || []);
      setWarDecks(stored.warDecks?.map((wd: any) => ({
        ...wd,
        cards: wd.cards.map((id: string) => allCards.find(c => c.id === id) || allCards[0]),
      })) || []);
      setDayNumber(stored.dayNumber || 1);
    } else {
      initRace();
    }
    setSpecialMode(SPECIAL_MODES[Math.floor(Math.random() * SPECIAL_MODES.length)]);
  }, []);

  useEffect(() => {
    setIsTrainingDay(dayNumber <= 3);
  }, [dayNumber]);

  const initRace = () => {
    const playerBoat: BoatData = {
      clanName: clan?.name || 'Your Clan',
      clanEmoji: '⚔️',
      medals: 0,
      position: 0,
      color: 'hsl(38,90%,50%)',
      isPlayer: true,
      finished: false,
      defenses: Array.from({ length: 3 }, (_, i) => ({
        id: i,
        hp: 1000,
        maxHp: 1000,
        cards: [],
        destroyed: false,
      })),
    };

    const rivalBoats: BoatData[] = RIVAL_CLANS.map(rc => ({
      clanName: rc.name,
      clanEmoji: rc.emoji,
      medals: 0,
      position: 0,
      color: rc.color,
      isPlayer: false,
      finished: false,
      defenses: Array.from({ length: 3 }, (_, i) => ({
        id: i,
        hp: 1000,
        maxHp: 1000,
        cards: allCards.slice(Math.floor(Math.random() * 20), Math.floor(Math.random() * 20) + 4).map(c => c.id),
        destroyed: false,
      })),
    }));

    setBoats([playerBoat, ...rivalBoats]);

    // Init 4 war decks from player's cards
    const available = [...allCards];
    const decks: WarDeck[] = [];
    for (let d = 0; d < 4; d++) {
      const deckCards: GameCard[] = [];
      for (let c = 0; c < 8; c++) {
        if (available.length > 0) {
          const idx = Math.floor(Math.random() * Math.min(available.length, 30));
          deckCards.push(available.splice(idx, 1)[0]);
        }
      }
      decks.push({ cards: deckCards, usedToday: false });
    }
    setWarDecks(decks);
    setDayNumber(1);
    saveRaceData([playerBoat, ...rivalBoats], decks, 1);
  };

  const saveRaceData = (b: BoatData[], wd: WarDeck[], day: number) => {
    localStorage.setItem('river_race_data', JSON.stringify({
      boats: b,
      warDecks: wd.map(d => ({ ...d, cards: d.cards.map(c => c.id) })),
      dayNumber: day,
      weekStart: getStoredRiverData()?.weekStart || Date.now(),
    }));
  };

  // Simulate rival progress each "day"
  const simulateRivals = useCallback((currentBoats: BoatData[]): BoatData[] => {
    return currentBoats.map(b => {
      if (b.isPlayer) return b;
      const gain = 800 + Math.floor(Math.random() * 1200);
      const newPos = Math.min(FINISH_LINE, b.position + gain);
      return { ...b, position: newPos, medals: b.medals + gain, finished: newPos >= FINISH_LINE };
    });
  }, []);

  const advanceDay = () => {
    if (dayNumber >= 7) {
      toast.info('Race is over! Rewards distributed.');
      return;
    }
    const newDay = dayNumber + 1;
    const newBoats = simulateRivals(boats).map(b => b.isPlayer ? b : b);
    // Reset deck usage
    const newDecks = warDecks.map(d => ({ ...d, usedToday: false }));
    setDayNumber(newDay);
    setBoats(simulateRivals(newBoats));
    setWarDecks(newDecks);
    saveRaceData(simulateRivals(newBoats), newDecks, newDay);
    toast.success(`Day ${newDay} started! ${newDay <= 3 ? '(Training Day)' : '(Battle Day)'}`);
  };

  const startBattle = (type: BattleType, deckIdx: number) => {
    if (warDecks[deckIdx]?.usedToday) {
      toast.error('This deck is on cooldown until tomorrow!');
      return;
    }
    setBattleType(type);
    setSelectedDeckIndex(deckIdx);
    setBattleResult(null);
    if (type === 'duel') {
      setDuelRound(1);
      setDuelScore([0, 0]);
    }
    if (type === 'boat') {
      // Pick a random non-player boat to attack
      const rivalIdx = 1 + Math.floor(Math.random() * 4);
      setAttackingBoat(rivalIdx);
    }
    setMode('battle-result');
    // Simulate battle outcome
    setTimeout(() => {
      const win = Math.random() > 0.4;
      resolveBattle(win, type, deckIdx);
    }, 1500);
  };

  const resolveBattle = (win: boolean, type: BattleType, deckIdx: number) => {
    let medals = 0;
    let gold = 0;

    if (type === '1v1') {
      medals = win ? MEDAL_WIN_1V1 : MEDAL_LOSS_1V1;
      gold = win ? 150 : 30;
    } else if (type === 'duel') {
      medals = win ? MEDAL_WIN_DUEL : MEDAL_LOSS_DUEL;
      gold = win ? 450 : 90;
    } else if (type === 'special') {
      medals = win ? MEDAL_SPECIAL : 75;
      gold = win ? 200 : 40;
    } else if (type === 'boat') {
      medals = win ? MEDAL_BOAT_WIN : 30;
      gold = win ? 100 : 20;
      if (win && attackingBoat != null) {
        // Damage rival boat
        const newBoats = [...boats];
        const rival = newBoats[attackingBoat];
        const intact = rival.defenses.find(d => !d.destroyed);
        if (intact) {
          intact.hp -= 400 + Math.floor(Math.random() * 300);
          if (intact.hp <= 0) {
            intact.destroyed = true;
            intact.hp = 0;
          }
        }
        setBoats(newBoats);
      }
    }

    // Training days: only gold, no medals
    if (isTrainingDay) medals = 0;

    setBattleResult(win ? 'win' : 'loss');
    setBattleGold(gold);
    setBattleMedals(medals);

    // Update player boat
    const newBoats = boats.map(b => {
      if (!b.isPlayer) return b;
      const newPos = Math.min(FINISH_LINE, b.position + medals);
      return { ...b, medals: b.medals + medals, position: newPos, finished: newPos >= FINISH_LINE };
    });
    setBoats(newBoats);

    // Mark deck used
    const newDecks = [...warDecks];
    newDecks[deckIdx] = { ...newDecks[deckIdx], usedToday: true };
    setWarDecks(newDecks);

    // Grant gold
    setProfile(p => ({ ...p, gold: p.gold + gold, warDayWins: win ? p.warDayWins + 1 : p.warDayWins }));

    saveRaceData(newBoats, newDecks, dayNumber);
  };

  const randomizeDeck = (deckIndex: number) => {
    const usedCards = new Set<string>();
    warDecks.forEach((wd, i) => {
      if (i !== deckIndex) wd.cards.forEach(c => usedCards.add(c.id));
    });
    const available = allCards.filter(c => !usedCards.has(c.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const newCards = shuffled.slice(0, 8);
    const newDecks = [...warDecks];
    newDecks[deckIndex] = { ...newDecks[deckIndex], cards: newCards };
    setWarDecks(newDecks);
    saveRaceData(boats, newDecks, dayNumber);
    toast.success('Deck randomized!');
  };

  const getPlacement = (): { place: number; boats: BoatData[] } => {
    const sorted = [...boats].sort((a, b) => b.position - a.position);
    const playerIdx = sorted.findIndex(b => b.isPlayer);
    return { place: playerIdx + 1, boats: sorted };
  };

  const playerBoat = boats.find(b => b.isPlayer);
  const sortedBoats = [...boats].sort((a, b) => b.position - a.position);

  if (!clan) {
    return (
      <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
          <button onClick={() => setScreen('social')} className="text-muted-foreground"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="font-display font-bold text-foreground text-sm">River Race</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Ship className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <div className="text-sm font-display font-bold text-foreground mb-1">Join a Clan First!</div>
          <div className="text-xs text-muted-foreground text-center mb-4">You need to be in a clan to participate in River Race.</div>
          <button onClick={() => setScreen('social')} className="btn-battle text-xs px-6 py-2">Go to Social</button>
        </div>
        <BottomNav active="social" setScreen={setScreen} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-[hsl(220,25%,10%)] border-b border-border px-3 py-2 flex items-center gap-2">
        <button onClick={() => mode === 'map' ? setScreen('social') : setMode('map')} className="text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Ship className="w-4 h-4 text-[hsl(200,70%,55%)]" />
        <h1 className="font-display font-bold text-sm text-foreground flex-1">River Race</h1>
        <div className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${isTrainingDay ? 'bg-[hsl(45,80%,30%)] text-[hsl(45,90%,80%)]' : 'bg-[hsl(0,60%,30%)] text-[hsl(0,80%,85%)]'}`}>
          {isTrainingDay ? '⛵ Training' : '⚔️ Battle'} Day {dayNumber}/7
        </div>
      </div>

      {/* MAP VIEW */}
      {mode === 'map' && (
        <div className="flex-1 overflow-y-auto">
          {/* River visualization */}
          <div className="bg-gradient-to-b from-[hsl(200,40%,18%)] to-[hsl(200,30%,12%)] p-3">
            <div className="text-center mb-2">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">🏁 Finish Line: {FINISH_LINE.toLocaleString()} pts</div>
            </div>

            {/* Boat standings */}
            <div className="space-y-1.5">
              {sortedBoats.map((boat, i) => {
                const progress = Math.min(100, (boat.position / FINISH_LINE) * 100);
                return (
                  <motion.div
                    key={boat.clanName}
                    layout
                    className={`rounded-xl p-2 border ${boat.isPlayer ? 'bg-primary/10 border-primary/30' : 'bg-[hsl(220,15%,14%)] border-border'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black w-4 text-center" style={{ color: boat.color }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </span>
                      <span className="text-sm">{boat.clanEmoji}</span>
                      <span className={`text-[10px] font-bold flex-1 ${boat.isPlayer ? 'text-primary' : 'text-foreground'}`}>
                        {boat.clanName} {boat.isPlayer && '(You)'}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{boat.position.toLocaleString()}</span>
                      {boat.finished && <Check className="w-3 h-3 text-[hsl(120,50%,50%)]" />}
                    </div>
                    <div className="h-2 bg-[hsl(0,0%,0%,0.4)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: boat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    {/* Boat defenses indicator */}
                    <div className="flex gap-1 mt-1">
                      {boat.defenses.map(def => (
                        <div key={def.id} className={`h-1 flex-1 rounded-full ${def.destroyed ? 'bg-destructive/40' : 'bg-[hsl(120,40%,40%)]'}`} />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-3 space-y-2">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">⚔️ River Tasks</div>

            {/* 1v1 */}
            <button onClick={() => { setBattleType('1v1'); setMode('battle-select'); }}
              className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[hsl(210,50%,25%)] flex items-center justify-center">
                <Swords className="w-5 h-5 text-[hsl(210,70%,60%)]" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-bold text-foreground">1v1 Battle</div>
                <div className="text-[8px] text-muted-foreground">Use 1 War Deck • {isTrainingDay ? 'Gold only' : `${MEDAL_WIN_1V1} medals (win)`}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Duel */}
            <button onClick={() => { setBattleType('duel'); setMode('battle-select'); }}
              className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[hsl(280,40%,25%)] flex items-center justify-center">
                <span className="text-lg">⚔️</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-bold text-foreground">Duel (Best of 3)</div>
                <div className="text-[8px] text-muted-foreground">Uses 3 War Decks • {isTrainingDay ? 'Gold only' : `${MEDAL_WIN_DUEL} medals (win)`}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Special mode */}
            <button onClick={() => { setBattleType('special'); setMode('battle-select'); }}
              className="w-full bg-card border border-[hsl(45,50%,25%)] rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[hsl(45,50%,20%)] flex items-center justify-center">
                <span className="text-lg">{specialMode.emoji}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-bold text-foreground">{specialMode.name}</div>
                <div className="text-[8px] text-muted-foreground">{specialMode.desc} • {isTrainingDay ? 'Gold only' : `${MEDAL_SPECIAL} medals`}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Boat battle */}
            {!isTrainingDay && (
              <button onClick={() => { setBattleType('boat'); setMode('battle-select'); }}
                className="w-full bg-gradient-to-r from-[hsl(0,40%,15%)] to-[hsl(20,40%,15%)] border border-[hsl(0,40%,25%)] rounded-xl p-3 flex items-center gap-3 hover:border-accent/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[hsl(0,50%,20%)] flex items-center justify-center">
                  <Anchor className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs font-bold text-foreground">Boat Battle</div>
                  <div className="text-[8px] text-muted-foreground">Attack rival boat defenses • {MEDAL_BOAT_WIN} medals</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            )}

            {/* War Decks / Boat Defense */}
            <div className="flex gap-2 mt-2">
              <button onClick={() => setMode('war-decks')}
                className="flex-1 py-2 bg-[hsl(220,15%,16%)] border border-border rounded-lg text-[10px] font-bold text-foreground flex items-center justify-center gap-1">
                🃏 War Decks
              </button>
              <button onClick={() => setMode('boat-defense')}
                className="flex-1 py-2 bg-[hsl(220,15%,16%)] border border-border rounded-lg text-[10px] font-bold text-foreground flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Boat Defense
              </button>
            </div>

            {/* Advance day (dev) */}
            <button onClick={advanceDay}
              className="w-full py-2 bg-secondary border border-border rounded-lg text-[9px] text-muted-foreground font-bold flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Advance to Day {dayNumber + 1}
            </button>
          </div>
        </div>
      )}

      {/* BATTLE SELECT — pick deck */}
      {mode === 'battle-select' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-center mb-3">
            <div className="text-sm font-display font-bold text-foreground">
              {battleType === '1v1' ? '1v1 Battle' : battleType === 'duel' ? 'Duel (Best of 3)' : battleType === 'boat' ? 'Boat Battle' : specialMode.name}
            </div>
            <div className="text-[9px] text-muted-foreground">Select a War Deck to use</div>
          </div>

          <div className="space-y-2">
            {warDecks.map((wd, i) => (
              <button
                key={i}
                onClick={() => !wd.usedToday && startBattle(battleType, i)}
                disabled={wd.usedToday}
                className={`w-full bg-card border rounded-xl p-3 text-left transition-colors ${
                  wd.usedToday ? 'border-border/30 opacity-40' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-foreground">War Deck {i + 1}</span>
                  {wd.usedToday && (
                    <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> Cooldown
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-8 gap-0.5">
                  {wd.cards.map(card => (
                    <div key={card.id} className="aspect-square bg-[hsl(220,15%,18%)] rounded border border-border flex items-center justify-center">
                      <span className="text-xs">{card.emoji}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* WAR DECKS EDITOR */}
      {mode === 'war-decks' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-sm font-display font-bold text-foreground mb-2">War Decks</div>
          <div className="text-[8px] text-muted-foreground mb-3">4 decks with 32 unique cards. No card repeats across decks!</div>

          <div className="space-y-3">
            {warDecks.map((wd, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-foreground">Deck {i + 1}</span>
                  <div className="flex gap-1">
                    <button onClick={() => randomizeDeck(i)}
                      className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold flex items-center gap-0.5">
                      <Shuffle className="w-2.5 h-2.5" /> Random
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {wd.cards.map(card => (
                    <div key={card.id} className="aspect-square bg-[hsl(220,15%,16%)] rounded-lg border border-border flex flex-col items-center justify-center p-0.5">
                      <span className="text-sm">{card.emoji}</span>
                      <span className="text-[5px] text-muted-foreground leading-none truncate w-full text-center">{card.name.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[7px] text-muted-foreground">
                    Avg Elixir: {(wd.cards.reduce((s, c) => s + c.elixir, 0) / wd.cards.length).toFixed(1)}
                  </span>
                  {wd.usedToday && <span className="text-[7px] text-accent font-bold">⏳ On Cooldown</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOAT DEFENSE */}
      {mode === 'boat-defense' && playerBoat && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-sm font-display font-bold text-foreground mb-1">⛵ Your Boat Defenses</div>
          <div className="text-[8px] text-muted-foreground mb-3">Intact defenses earn bonus movement points daily!</div>

          <div className="space-y-3">
            {playerBoat.defenses.map((def, i) => (
              <div key={def.id} className={`bg-card border rounded-xl p-3 ${def.destroyed ? 'border-destructive/30 opacity-50' : 'border-border'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className={`w-4 h-4 ${def.destroyed ? 'text-destructive' : 'text-[hsl(120,50%,50%)]'}`} />
                  <span className="text-[10px] font-bold text-foreground">Defense Tower {i + 1}</span>
                  {def.destroyed ? (
                    <span className="text-[8px] text-destructive font-bold ml-auto">DESTROYED</span>
                  ) : (
                    <span className="text-[8px] text-[hsl(120,50%,50%)] font-bold ml-auto">{def.hp}/{def.maxHp} HP</span>
                  )}
                </div>
                {!def.destroyed && (
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[hsl(120,50%,45%)] rounded-full" style={{ width: `${(def.hp / def.maxHp) * 100}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rival boats status */}
          <div className="mt-4">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Enemy Boats</div>
            {boats.filter(b => !b.isPlayer).map((rival, i) => (
              <div key={i} className="bg-[hsl(220,15%,14%)] border border-border rounded-lg p-2 mb-1.5 flex items-center gap-2">
                <span className="text-sm">{rival.clanEmoji}</span>
                <span className="text-[10px] font-bold text-foreground flex-1">{rival.clanName}</span>
                <div className="flex gap-0.5">
                  {rival.defenses.map(d => (
                    <div key={d.id} className={`w-2 h-2 rounded-full ${d.destroyed ? 'bg-destructive/40' : 'bg-[hsl(120,40%,40%)]'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BATTLE RESULT */}
      {mode === 'battle-result' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {battleResult === null ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Swords className="w-12 h-12 text-primary" />
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <div className="text-5xl mb-4">{battleResult === 'win' ? '🏆' : '💀'}</div>
              <div className={`text-2xl font-display font-black mb-2 ${battleResult === 'win' ? 'text-primary' : 'text-destructive'}`}>
                {battleResult === 'win' ? 'VICTORY!' : 'DEFEAT'}
              </div>

              <div className="bg-card border border-border rounded-xl p-4 mt-4 space-y-2 w-64">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Gold earned</span>
                  <span className="text-[10px] font-bold text-foreground">💰 +{battleGold}</span>
                </div>
                {!isTrainingDay && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Medals earned</span>
                    <span className="text-[10px] font-bold text-primary">🏅 +{battleMedals}</span>
                  </div>
                )}
                {isTrainingDay && (
                  <div className="text-[8px] text-[hsl(45,80%,60%)] text-center">Training Day — no medals earned</div>
                )}
              </div>

              <button onClick={() => setMode('map')} className="mt-4 btn-battle text-xs px-8 py-2">
                Continue
              </button>
            </motion.div>
          )}
        </div>
      )}

      <BottomNav active="social" setScreen={setScreen} />
    </div>
  );
};

export default RiverRaceScreen;