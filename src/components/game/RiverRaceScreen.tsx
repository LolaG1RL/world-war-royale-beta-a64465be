import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { allCards, GameCard } from '@/data/cards';
import { BottomNav } from './ShopScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Swords, Shield, Anchor, Clock, ChevronRight, Check, X, Shuffle, Ship, Plus, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// --- TYPES ---
interface BoatData {
  clanId: string;
  clanName: string;
  clanEmoji: string;
  medals: number;
  position: number;
  color: string;
  isPlayer: boolean;
  defenses: BoatDefense[];
  finished: boolean;
}

interface BoatDefense {
  id: number;
  hp: number;
  maxHp: number;
  cards: string[];
  destroyed: boolean;
}

interface WarDeck {
  cards: GameCard[];
  usedToday: boolean;
}

type RiverMode = 'map' | 'battle-select' | 'war-decks' | 'edit-deck' | 'boat-defense' | 'edit-defense' | 'boat-target';
type BattleType = '1v1' | 'duel' | 'boat' | 'special';

const FINISH_LINE = 10000;
const MEDAL_WIN_1V1 = 200;
const MEDAL_LOSS_1V1 = 50;
const MEDAL_WIN_DUEL = 700;
const MEDAL_LOSS_DUEL = 150;
const MEDAL_SPECIAL = 250;
const MEDAL_BOAT_WIN = 150;

const BOAT_COLORS = [
  'hsl(38,90%,50%)', 'hsl(0,60%,50%)', 'hsl(210,60%,50%)',
  'hsl(280,50%,50%)', 'hsl(120,50%,45%)',
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
      if (daysPassed >= 7) return null;
      return d;
    } catch { return null; }
  }
  return null;
};

const RiverRaceScreen = () => {
  const { setScreen, profile, setProfile, clan, setDeck } = useGame();
  const { user } = useAuth();

  const [mode, setMode] = useState<RiverMode>('map');
  const [boats, setBoats] = useState<BoatData[]>([]);
  const [warDecks, setWarDecks] = useState<WarDeck[]>([]);
  const [editingDeckIdx, setEditingDeckIdx] = useState(0);
  const [editingDefenseIdx, setEditingDefenseIdx] = useState(0);
  const [dayNumber, setDayNumber] = useState(1);
  const [isTrainingDay, setIsTrainingDay] = useState(true);
  const [battleType, setBattleType] = useState<BattleType>('1v1');
  const [attackingBoatIdx, setAttackingBoatIdx] = useState<number | null>(null);
  const [specialMode, setSpecialMode] = useState(SPECIAL_MODES[0]);
  const [loadingClans, setLoadingClans] = useState(true);

  // Calculate day from real time
  useEffect(() => {
    const stored = getStoredRiverData();
    const weekStart = stored?.weekStart || Date.now();
    const realDay = Math.min(7, Math.floor((Date.now() - weekStart) / (1000 * 60 * 60 * 24)) + 1);
    setDayNumber(realDay);
    setIsTrainingDay(realDay <= 3);
  }, []);

  // On mount: load clans + check for completed battle
  useEffect(() => {
    const init = async () => {
      setLoadingClans(true);
      const stored = getStoredRiverData();

      const { data: clansData } = await supabase
        .from('clans')
        .select('id, name, icon_id, banner_color')
        .limit(5);

      const realClans = (clansData || []);

      let currentBoats: BoatData[];
      let currentDecks: WarDeck[];
      let currentDay: number;

      if (stored && stored.boats?.length > 0) {
        currentBoats = stored.boats;
        currentDecks = stored.warDecks?.map((wd: any) => ({
          ...wd,
          cards: (wd.cards || []).map((id: string) => allCards.find(c => c.id === id) || allCards[0]),
        })) || initWarDecks();
        currentDay = stored.dayNumber || 1;
      } else {
        const playerClanId = await getPlayerClanId();
        currentBoats = [];
        currentBoats.push({
          clanId: playerClanId || 'player',
          clanName: clan?.name || 'Your Clan',
          clanEmoji: '⚔️',
          medals: 0, position: 0,
          color: BOAT_COLORS[0],
          isPlayer: true, finished: false,
          defenses: makeDefenses(),
        });
        const rivals = realClans.filter(c => c.id !== playerClanId).slice(0, 4);
        rivals.forEach((rc, i) => {
          currentBoats.push({
            clanId: rc.id,
            clanName: rc.name,
            clanEmoji: getClanEmoji(rc.icon_id),
            medals: 0, position: 0,
            color: BOAT_COLORS[i + 1] || BOAT_COLORS[1],
            isPlayer: false, finished: false,
            defenses: makeDefenses(),
          });
        });
        currentDecks = initWarDecks();
        currentDay = 1;
      }

      // Check for completed river race battle
      const rbRaw = localStorage.getItem('river_race_battle');
      if (rbRaw) {
        try {
          const rb = JSON.parse(rbRaw);
          if (rb.completed) {
            const win = rb.result === 'win';
            const type = rb.battleType as BattleType;
            let medals = 0, gold = 0;
            if (type === '1v1') { medals = win ? MEDAL_WIN_1V1 : MEDAL_LOSS_1V1; gold = win ? 150 : 30; }
            else if (type === 'duel') { medals = win ? MEDAL_WIN_DUEL : MEDAL_LOSS_DUEL; gold = win ? 450 : 90; }
            else if (type === 'special') { medals = win ? MEDAL_SPECIAL : 75; gold = win ? 200 : 40; }
            else if (type === 'boat') {
              medals = win ? MEDAL_BOAT_WIN : 30; gold = win ? 100 : 20;
              if (win && rb.attackingBoatIdx != null) {
                const rival = currentBoats[rb.attackingBoatIdx];
                if (rival) {
                  const intact = rival.defenses.find((d: BoatDefense) => !d.destroyed);
                  if (intact) {
                    intact.hp -= 400 + Math.floor(Math.random() * 300);
                    if (intact.hp <= 0) { intact.destroyed = true; intact.hp = 0; }
                  }
                }
              }
            }
            const isTraining = currentDay <= 3;
            if (isTraining) medals = 0;

            // Apply medals to player boat
            currentBoats = currentBoats.map(b => {
              if (!b.isPlayer) return b;
              const newPos = Math.min(FINISH_LINE, b.position + medals);
              return { ...b, medals: b.medals + medals, position: newPos, finished: newPos >= FINISH_LINE };
            });

            // Mark deck as used
            if (rb.deckIdx != null && currentDecks[rb.deckIdx]) {
              currentDecks[rb.deckIdx] = { ...currentDecks[rb.deckIdx], usedToday: true };
            }

            // Apply gold
            setProfile(p => ({ ...p, gold: p.gold + gold, warDayWins: win ? p.warDayWins + 1 : p.warDayWins }));

            // Clear the battle context
            localStorage.removeItem('river_race_battle');
          }
        } catch {}
      }

      setBoats(currentBoats);
      setWarDecks(currentDecks);
      setDayNumber(currentDay);
      saveRaceData(currentBoats, currentDecks, currentDay);
      setLoadingClans(false);
    };
    init();
    setSpecialMode(SPECIAL_MODES[Math.floor(Math.random() * SPECIAL_MODES.length)]);
  }, []);

  const getPlayerClanId = async (): Promise<string | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from('clan_members')
      .select('clan_id')
      .eq('user_id', user.id)
      .maybeSingle();
    return data?.clan_id || null;
  };

  const getClanEmoji = (iconId: string): string => {
    const map: Record<string, string> = {
      swords: '⚔️', shield: '🛡️', crown: '👑', skull: '💀',
      flame: '🔥', star: '⭐', lightning: '⚡', dragon: '🐲',
      wolf: '🐺', eagle: '🦅', lion: '🦁', serpent: '🐍',
    };
    return map[iconId] || '⚔️';
  };

  const makeDefenses = (): BoatDefense[] =>
    Array.from({ length: 3 }, (_, i) => ({ id: i, hp: 1000, maxHp: 1000, cards: [], destroyed: false }));

  const initWarDecks = (): WarDeck[] => {
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
    return decks;
  };

  const saveRaceData = (b: BoatData[], wd: WarDeck[], day: number) => {
    localStorage.setItem('river_race_data', JSON.stringify({
      boats: b,
      warDecks: wd.map(d => ({ ...d, cards: d.cards.map(c => c.id) })),
      dayNumber: day,
      lastPlayedDay: day,
      weekStart: getStoredRiverData()?.weekStart || Date.now(),
    }));
  };

  // --- CARD PICKING HELPERS ---
  const getUsedCardIds = (excludeDeckIdx?: number): Set<string> => {
    const used = new Set<string>();
    warDecks.forEach((wd, i) => {
      if (i !== excludeDeckIdx) wd.cards.forEach(c => used.add(c.id));
    });
    const pb = boats.find(b => b.isPlayer);
    pb?.defenses.forEach(def => def.cards.forEach(id => used.add(id)));
    return used;
  };

  const getAvailableCards = (excludeDeckIdx?: number): GameCard[] => {
    const used = getUsedCardIds(excludeDeckIdx);
    return allCards.filter(c => !used.has(c.id));
  };

  const addCardToDeck = (deckIdx: number, card: GameCard) => {
    const newDecks = [...warDecks];
    if (newDecks[deckIdx].cards.length >= 8) { toast.error('Deck is full (8 cards max)'); return; }
    if (newDecks[deckIdx].cards.find(c => c.id === card.id)) { toast.error('Card already in deck'); return; }
    newDecks[deckIdx] = { ...newDecks[deckIdx], cards: [...newDecks[deckIdx].cards, card] };
    setWarDecks(newDecks);
    saveRaceData(boats, newDecks, dayNumber);
  };

  const removeCardFromDeck = (deckIdx: number, cardId: string) => {
    const newDecks = [...warDecks];
    newDecks[deckIdx] = { ...newDecks[deckIdx], cards: newDecks[deckIdx].cards.filter(c => c.id !== cardId) };
    setWarDecks(newDecks);
    saveRaceData(boats, newDecks, dayNumber);
  };

  const addCardToDefense = (defIdx: number, cardId: string) => {
    const newBoats = [...boats];
    const pb = newBoats.find(b => b.isPlayer);
    if (!pb) return;
    const def = pb.defenses[defIdx];
    if (def.cards.length >= 4) { toast.error('Defense tower full (4 cards max)'); return; }
    if (def.cards.includes(cardId)) return;
    def.cards = [...def.cards, cardId];
    setBoats(newBoats);
    saveRaceData(newBoats, warDecks, dayNumber);
  };

  const removeCardFromDefense = (defIdx: number, cardId: string) => {
    const newBoats = [...boats];
    const pb = newBoats.find(b => b.isPlayer);
    if (!pb) return;
    pb.defenses[defIdx].cards = pb.defenses[defIdx].cards.filter(id => id !== cardId);
    setBoats(newBoats);
    saveRaceData(newBoats, warDecks, dayNumber);
  };

  const randomizeDeck = (deckIndex: number) => {
    const available = getAvailableCards(deckIndex);
    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 8);
    const newDecks = [...warDecks];
    newDecks[deckIndex] = { ...newDecks[deckIndex], cards: shuffled };
    setWarDecks(newDecks);
    saveRaceData(boats, newDecks, dayNumber);
    toast.success('Deck randomized!');
  };

  // Reset deck cooldowns if day changed since last save
  useEffect(() => {
    const stored = getStoredRiverData();
    if (stored?.lastPlayedDay && stored.lastPlayedDay !== dayNumber) {
      const newDecks = warDecks.map(d => ({ ...d, usedToday: false }));
      setWarDecks(newDecks);
      saveRaceData(boats, newDecks, dayNumber);
    }
  }, [dayNumber]);

  // Launch a REAL battle through BattleArena
  const startBattle = (type: BattleType, deckIdx: number) => {
    if (warDecks[deckIdx]?.usedToday) { toast.error('Deck on cooldown!'); return; }
    if (warDecks[deckIdx]?.cards.length < 8) { toast.error('Deck needs 8 cards!'); return; }

    // Save battle context so BattleResult and RiverRaceScreen can pick it up
    localStorage.setItem('river_race_battle', JSON.stringify({
      battleType: type,
      deckIdx,
      attackingBoatIdx: attackingBoatIdx,
      isTrainingDay,
      completed: false,
    }));

    // Save current race state
    saveRaceData(boats, warDecks, dayNumber);

    // Set the war deck as the active deck for BattleArena
    setDeck(warDecks[deckIdx].cards);

    // Navigate to real battle
    setScreen('battle');
  };

  const playerBoat = boats.find(b => b.isPlayer);
  const sortedBoats = [...boats].sort((a, b) => b.position - a.position);
  const rivalBoats = boats.filter(b => !b.isPlayer);

  // --- NO CLAN ---
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
        <button onClick={() => {
          if (mode === 'edit-deck' || mode === 'edit-defense') setMode(mode === 'edit-deck' ? 'war-decks' : 'boat-defense');
          else if (mode === 'boat-target') setMode('battle-select');
          else if (mode === 'map') setScreen('social');
          else setMode('map');
        }} className="text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Ship className="w-4 h-4 text-[hsl(200,70%,55%)]" />
        <h1 className="font-display font-bold text-sm text-foreground flex-1">River Race</h1>
        <div className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${isTrainingDay ? 'bg-[hsl(45,80%,30%)] text-[hsl(45,90%,80%)]' : 'bg-[hsl(0,60%,30%)] text-[hsl(0,80%,85%)]'}`}>
          {isTrainingDay ? '⛵ Training' : '⚔️ Battle'} Day {dayNumber}/7
        </div>
      </div>

      {/* ===== MAP ===== */}
      {mode === 'map' && (
        <div className="flex-1 overflow-y-auto">
          {loadingClans ? (
            <div className="flex items-center justify-center py-12">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Ship className="w-8 h-8 text-primary" />
              </motion.div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-b from-[hsl(200,40%,18%)] to-[hsl(200,30%,12%)] p-3">
                <div className="text-center mb-2">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">🏁 Finish Line: {FINISH_LINE.toLocaleString()} pts</div>
                </div>
                <div className="space-y-1.5">
                  {sortedBoats.map((boat, i) => {
                    const progress = Math.min(100, (boat.position / FINISH_LINE) * 100);
                    return (
                      <motion.div key={boat.clanId} layout
                        className={`rounded-xl p-2 border ${boat.isPlayer ? 'bg-primary/10 border-primary/30' : 'bg-[hsl(220,15%,14%)] border-border'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black w-4 text-center" style={{ color: boat.color }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                          </span>
                          <span className="text-sm">{boat.clanEmoji}</span>
                          <span className={`text-[10px] font-bold flex-1 truncate ${boat.isPlayer ? 'text-primary' : 'text-foreground'}`}>
                            {boat.clanName} {boat.isPlayer && '(You)'}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{boat.position.toLocaleString()}</span>
                          {boat.finished && <Check className="w-3 h-3 text-[hsl(120,50%,50%)]" />}
                        </div>
                        <div className="h-2 bg-[hsl(0,0%,0%,0.4)] rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: boat.color }}
                            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
                        </div>
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

              {/* River Tasks */}
              <div className="p-3 space-y-2">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1">⚔️ River Tasks</div>

                <RiverTaskBtn icon={<Swords className="w-5 h-5 text-[hsl(210,70%,60%)]" />} bg="hsl(210,50%,25%)"
                  title="1v1 Battle" desc={`Use 1 War Deck • ${isTrainingDay ? 'Gold only' : `${MEDAL_WIN_1V1} medals (win)`}`}
                  onClick={() => { setBattleType('1v1'); setMode('battle-select'); }} />

                <RiverTaskBtn icon={<span className="text-lg">⚔️</span>} bg="hsl(280,40%,25%)"
                  title="Duel (Best of 3)" desc={`Uses 3 War Decks • ${isTrainingDay ? 'Gold only' : `${MEDAL_WIN_DUEL} medals (win)`}`}
                  onClick={() => { setBattleType('duel'); setMode('battle-select'); }} />

                <RiverTaskBtn icon={<span className="text-lg">{specialMode.emoji}</span>} bg="hsl(45,50%,20%)"
                  title={specialMode.name} desc={`${specialMode.desc} • ${isTrainingDay ? 'Gold only' : `${MEDAL_SPECIAL} medals`}`}
                  onClick={() => { setBattleType('special'); setMode('battle-select'); }} border="hsl(45,50%,25%)" />

                {!isTrainingDay && (
                  <RiverTaskBtn icon={<Anchor className="w-5 h-5 text-accent" />} bg="hsl(0,50%,20%)"
                    title="Boat Battle" desc={`Attack rival defenses • ${MEDAL_BOAT_WIN} medals`}
                    onClick={() => { setBattleType('boat'); setMode('boat-target'); }} border="hsl(0,40%,25%)" />
                )}

                <div className="flex gap-2 mt-2">
                  <button onClick={() => setMode('war-decks')}
                    className="flex-1 py-2.5 bg-[hsl(220,15%,16%)] border border-border rounded-lg text-[10px] font-bold text-foreground flex items-center justify-center gap-1.5">
                    🃏 War Decks
                  </button>
                  <button onClick={() => setMode('boat-defense')}
                    className="flex-1 py-2.5 bg-[hsl(220,15%,16%)] border border-border rounded-lg text-[10px] font-bold text-foreground flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Boat Defense
                  </button>
                </div>
              </div>

            </>
          )}
        </div>
      )}

      {/* ===== BOAT TARGET (select which rival to attack) ===== */}
      {mode === 'boat-target' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-center mb-3">
            <div className="text-sm font-display font-bold text-foreground">⚓ Select Target Boat</div>
            <div className="text-[9px] text-muted-foreground">Choose a rival clan's boat to attack their defenses</div>
          </div>
          <div className="space-y-2">
            {boats.map((rival, boatIdx) => {
              if (rival.isPlayer) return null;
              const intactDefenses = rival.defenses.filter(d => !d.destroyed).length;
              const allDestroyed = intactDefenses === 0;
              return (
                <button key={rival.clanId}
                  disabled={allDestroyed}
                  onClick={() => { setAttackingBoatIdx(boatIdx); setMode('battle-select'); }}
                  className={`w-full bg-card border rounded-xl p-3 text-left transition-colors ${allDestroyed ? 'border-border/30 opacity-40' : 'border-border hover:border-accent/40'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: rival.color + '33' }}>
                      <span className="text-xl">{rival.clanEmoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-foreground">{rival.clanName}</div>
                      <div className="text-[8px] text-muted-foreground">{rival.position.toLocaleString()} pts</div>
                    </div>
                    <div className="text-right">
                      {allDestroyed ? (
                        <span className="text-[8px] text-destructive font-bold">ALL SUNK</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-accent" />
                          <span className="text-[9px] text-accent font-bold">{intactDefenses} defenses</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Show defense towers */}
                  {!allDestroyed && (
                    <div className="flex gap-2 mt-2">
                      {rival.defenses.map(def => (
                        <div key={def.id} className={`flex-1 rounded-lg p-1.5 border ${def.destroyed ? 'bg-destructive/10 border-destructive/20' : 'bg-[hsl(220,15%,14%)] border-border'}`}>
                          <div className="flex items-center gap-1 mb-1">
                            <Shield className={`w-3 h-3 ${def.destroyed ? 'text-destructive/40' : 'text-[hsl(120,50%,50%)]'}`} />
                            <span className="text-[7px] font-bold text-muted-foreground">T{def.id + 1}</span>
                          </div>
                          {def.destroyed ? (
                            <span className="text-[6px] text-destructive">💀</span>
                          ) : (
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-[hsl(120,50%,45%)] rounded-full" style={{ width: `${(def.hp / def.maxHp) * 100}%` }} />
                            </div>
                          )}
                          {!def.destroyed && (
                            <span className="text-[6px] text-muted-foreground">{def.hp}/{def.maxHp}</span>
                          )}
                          {/* Show defense cards */}
                          {!def.destroyed && def.cards.length > 0 && (
                            <div className="flex gap-0.5 mt-1">
                              {def.cards.map(cId => {
                                const c = allCards.find(x => x.id === cId);
                                return c ? <span key={cId} className="text-[8px]">{c.emoji}</span> : null;
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== BATTLE SELECT (choose war deck) ===== */}
      {mode === 'battle-select' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-center mb-3">
            <div className="text-sm font-display font-bold text-foreground">
              {battleType === '1v1' ? '1v1 Battle' : battleType === 'duel' ? 'Duel (Best of 3)' : battleType === 'boat' ? '⚓ Boat Battle' : specialMode.name}
            </div>
            <div className="text-[9px] text-muted-foreground">
              Select a War Deck to use
              {battleType === 'boat' && attackingBoatIdx != null && (
                <> — Attacking <span className="text-accent font-bold">{boats[attackingBoatIdx]?.clanName}</span></>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {warDecks.map((wd, i) => (
              <button key={i} onClick={() => !wd.usedToday && wd.cards.length === 8 && startBattle(battleType, i)}
                disabled={wd.usedToday || wd.cards.length < 8}
                className={`w-full bg-card border rounded-xl p-3 text-left transition-colors ${wd.usedToday || wd.cards.length < 8 ? 'border-border/30 opacity-40' : 'border-border hover:border-primary/30'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-foreground">War Deck {i + 1}</span>
                  {wd.usedToday && <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Cooldown</span>}
                  {wd.cards.length < 8 && !wd.usedToday && <span className="text-[8px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-bold">Incomplete</span>}
                  <span className="text-[8px] text-muted-foreground ml-auto">{wd.cards.length}/8 cards</span>
                </div>
                <div className="grid grid-cols-8 gap-0.5">
                  {wd.cards.map(card => (
                    <div key={card.id} className="aspect-square bg-[hsl(220,15%,18%)] rounded border border-border flex items-center justify-center">
                      <span className="text-xs">{card.emoji}</span>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 8 - wd.cards.length) }).map((_, j) => (
                    <div key={`empty-${j}`} className="aspect-square bg-muted/10 rounded border border-border/30" />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== WAR DECKS ===== */}
      {mode === 'war-decks' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-sm font-display font-bold text-foreground mb-1">🃏 War Decks</div>
          <div className="text-[8px] text-muted-foreground mb-3">4 decks × 8 unique cards. No card can appear in multiple decks or boat defenses.</div>
          <div className="space-y-3">
            {warDecks.map((wd, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-foreground">Deck {i + 1}</span>
                  <div className="flex gap-1">
                    <button onClick={() => randomizeDeck(i)}
                      className="text-[8px] bg-secondary text-muted-foreground px-2 py-0.5 rounded font-bold flex items-center gap-0.5 border border-border">
                      <Shuffle className="w-2.5 h-2.5" /> Auto
                    </button>
                    <button onClick={() => { setEditingDeckIdx(i); setMode('edit-deck'); }}
                      className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">
                      Edit
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
                  {Array.from({ length: Math.max(0, 8 - wd.cards.length) }).map((_, j) => (
                    <div key={`e-${j}`} className="aspect-square bg-muted/10 rounded-lg border border-dashed border-border/30 flex items-center justify-center">
                      <Plus className="w-2.5 h-2.5 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[7px] text-muted-foreground">
                    {wd.cards.length}/8 • Avg Elixir: {wd.cards.length ? (wd.cards.reduce((s, c) => s + c.elixir, 0) / wd.cards.length).toFixed(1) : '0'}
                  </span>
                  {wd.usedToday && <span className="text-[7px] text-accent font-bold">⏳ On Cooldown</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== EDIT DECK (card picker) ===== */}
      {mode === 'edit-deck' && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 bg-[hsl(220,20%,11%)] border-b border-border">
            <div className="text-[10px] font-bold text-foreground mb-1.5">War Deck {editingDeckIdx + 1} — {warDecks[editingDeckIdx]?.cards.length}/8</div>
            <div className="grid grid-cols-8 gap-1">
              {warDecks[editingDeckIdx]?.cards.map(card => (
                <button key={card.id} onClick={() => removeCardFromDeck(editingDeckIdx, card.id)}
                  className="aspect-square bg-[hsl(220,15%,16%)] rounded-lg border border-primary/30 flex flex-col items-center justify-center p-0.5 relative group">
                  <span className="text-sm">{card.emoji}</span>
                  <span className="text-[5px] text-muted-foreground truncate w-full text-center">{card.name.split(' ')[0]}</span>
                  <div className="absolute inset-0 bg-destructive/20 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <X className="w-3 h-3 text-destructive" />
                  </div>
                </button>
              ))}
              {Array.from({ length: Math.max(0, 8 - (warDecks[editingDeckIdx]?.cards.length || 0)) }).map((_, j) => (
                <div key={j} className="aspect-square bg-muted/10 rounded-lg border border-dashed border-border/30 flex items-center justify-center">
                  <Plus className="w-2.5 h-2.5 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          </div>
          <div className="p-3">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Available Cards (tap to add)</div>
            <div className="grid grid-cols-4 gap-1.5">
              {getAvailableCards(editingDeckIdx).map(card => (
                <button key={card.id} onClick={() => addCardToDeck(editingDeckIdx, card)}
                  className="bg-[hsl(220,15%,14%)] border border-border rounded-lg p-1.5 flex flex-col items-center gap-0.5 hover:border-primary/40 transition-colors">
                  <span className="text-lg">{card.emoji}</span>
                  <span className="text-[7px] font-bold text-foreground truncate w-full text-center">{card.name}</span>
                  <span className={`text-[6px] font-bold ${
                    card.rarity === 'legendary' ? 'text-[hsl(38,90%,55%)]' :
                    card.rarity === 'epic' ? 'text-[hsl(280,60%,65%)]' :
                    card.rarity === 'rare' ? 'text-[hsl(210,70%,60%)]' :
                    card.rarity === 'hero' ? 'text-[hsl(340,70%,60%)]' :
                    'text-muted-foreground'
                  }`}>{card.rarity}</span>
                  <span className="text-[7px] text-primary font-bold">{card.elixir}⚡</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== BOAT DEFENSE ===== */}
      {mode === 'boat-defense' && playerBoat && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-sm font-display font-bold text-foreground mb-1">⛵ Boat Defenses</div>
          <div className="text-[8px] text-muted-foreground mb-3">Set up 4 cards per defense tower. Rivals attack these when they do Boat Battles against you!</div>
          <div className="space-y-3">
            {playerBoat.defenses.map((def, i) => (
              <div key={def.id} className={`bg-card border rounded-xl p-3 ${def.destroyed ? 'border-destructive/30 opacity-50' : 'border-border'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className={`w-4 h-4 ${def.destroyed ? 'text-destructive' : 'text-[hsl(120,50%,50%)]'}`} />
                  <span className="text-[10px] font-bold text-foreground">Defense Tower {i + 1}</span>
                  {def.destroyed ? (
                    <span className="text-[8px] text-destructive font-bold ml-auto">DESTROYED</span>
                  ) : (
                    <>
                      <span className="text-[8px] text-[hsl(120,50%,50%)] font-bold ml-auto">{def.hp}/{def.maxHp} HP</span>
                      <button onClick={() => { setEditingDefenseIdx(i); setMode('edit-defense'); }}
                        className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">Edit</button>
                    </>
                  )}
                </div>
                {!def.destroyed && (
                  <>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-[hsl(120,50%,45%)] rounded-full" style={{ width: `${(def.hp / def.maxHp) * 100}%` }} />
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {def.cards.map(cardId => {
                        const card = allCards.find(c => c.id === cardId);
                        return card ? (
                          <div key={cardId} className="aspect-square bg-[hsl(220,15%,16%)] rounded-lg border border-border flex flex-col items-center justify-center p-0.5">
                            <span className="text-sm">{card.emoji}</span>
                            <span className="text-[5px] text-muted-foreground truncate w-full text-center">{card.name.split(' ')[0]}</span>
                          </div>
                        ) : null;
                      })}
                      {Array.from({ length: Math.max(0, 4 - def.cards.length) }).map((_, j) => (
                        <div key={j} className="aspect-square bg-muted/10 rounded-lg border border-dashed border-border/30 flex items-center justify-center">
                          <Plus className="w-3 h-3 text-muted-foreground/30" />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Rival boat statuses */}
          <div className="mt-4">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Enemy Boats</div>
            {rivalBoats.map((rival, i) => (
              <div key={i} className="bg-[hsl(220,15%,14%)] border border-border rounded-lg p-2 mb-1.5 flex items-center gap-2">
                <span className="text-sm">{rival.clanEmoji}</span>
                <span className="text-[10px] font-bold text-foreground flex-1 truncate">{rival.clanName}</span>
                <div className="flex gap-0.5">
                  {rival.defenses.map(d => (
                    <div key={d.id} className={`w-2.5 h-2.5 rounded-full ${d.destroyed ? 'bg-destructive/40' : 'bg-[hsl(120,40%,40%)]'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== EDIT DEFENSE (card picker) ===== */}
      {mode === 'edit-defense' && playerBoat && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 bg-[hsl(220,20%,11%)] border-b border-border">
            <div className="text-[10px] font-bold text-foreground mb-1.5">
              Defense Tower {editingDefenseIdx + 1} — {playerBoat.defenses[editingDefenseIdx]?.cards.length || 0}/4
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {playerBoat.defenses[editingDefenseIdx]?.cards.map(cardId => {
                const card = allCards.find(c => c.id === cardId);
                if (!card) return null;
                return (
                  <button key={cardId} onClick={() => removeCardFromDefense(editingDefenseIdx, cardId)}
                    className="aspect-square bg-[hsl(220,15%,16%)] rounded-lg border border-primary/30 flex flex-col items-center justify-center p-0.5 relative group">
                    <span className="text-lg">{card.emoji}</span>
                    <span className="text-[6px] text-muted-foreground truncate w-full text-center">{card.name.split(' ')[0]}</span>
                    <div className="absolute inset-0 bg-destructive/20 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <X className="w-3 h-3 text-destructive" />
                    </div>
                  </button>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - (playerBoat.defenses[editingDefenseIdx]?.cards.length || 0)) }).map((_, j) => (
                <div key={j} className="aspect-square bg-muted/10 rounded-lg border border-dashed border-border/30 flex items-center justify-center">
                  <Plus className="w-3 h-3 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          </div>
          <div className="p-3">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Available Cards (tap to add)</div>
            <div className="grid grid-cols-4 gap-1.5">
              {getAvailableCards().filter(c => !playerBoat.defenses[editingDefenseIdx]?.cards.includes(c.id)).map(card => (
                <button key={card.id} onClick={() => addCardToDefense(editingDefenseIdx, card.id)}
                  className="bg-[hsl(220,15%,14%)] border border-border rounded-lg p-1.5 flex flex-col items-center gap-0.5 hover:border-primary/40 transition-colors">
                  <span className="text-lg">{card.emoji}</span>
                  <span className="text-[7px] font-bold text-foreground truncate w-full text-center">{card.name}</span>
                  <span className="text-[7px] text-primary font-bold">{card.elixir}⚡</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav active="social" setScreen={setScreen} />
    </div>
  );
};

// Reusable river task button
const RiverTaskBtn = ({ icon, bg, title, desc, onClick, border }: {
  icon: React.ReactNode; bg: string; title: string; desc: string; onClick: () => void; border?: string;
}) => (
  <button onClick={onClick}
    className={`w-full bg-card border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors`}
    style={{ borderColor: border || undefined }}>
    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
      {icon}
    </div>
    <div className="flex-1 text-left">
      <div className="text-xs font-bold text-foreground">{title}</div>
      <div className="text-[8px] text-muted-foreground">{desc}</div>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </button>
);

export default RiverRaceScreen;
