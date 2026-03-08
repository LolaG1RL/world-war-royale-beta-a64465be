import { useGame } from '@/context/GameContext';
import { allCards } from '@/data/cards';
import CardComponent from './CardComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { GameCard } from '@/data/cards';
import { Gift, Check } from 'lucide-react';

// Daily freebies logic
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getFreebiesClaimed(): boolean {
  try {
    const stored = localStorage.getItem('daily_freebies_claimed');
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed.date === getTodayKey();
  } catch { return false; }
}

function setFreebiesClaimed() {
  localStorage.setItem('daily_freebies_claimed', JSON.stringify({ date: getTodayKey() }));
}

interface RewardItem {
  emoji: string;
  name: string;
  count: number;
  rarity: string;
}

function generateDailyFreebies(): RewardItem[] {
  // Weighted random: mostly commons, small chance rare, tiny chance epic
  const rewards: RewardItem[] = [];
  const roll = () => {
    const r = Math.random();
    if (r < 0.60) return allCards.filter(c => c.rarity === 'common');
    if (r < 0.85) return allCards.filter(c => c.rarity === 'rare');
    if (r < 0.97) return allCards.filter(c => c.rarity === 'epic');
    return allCards.filter(c => c.rarity === 'legendary');
  };
  // 3 card rewards + small gold
  for (let i = 0; i < 3; i++) {
    const pool = roll();
    const card = pool[Math.floor(Math.random() * pool.length)];
    const count = card.rarity === 'common' ? 2 + Math.floor(Math.random() * 3) :
                  card.rarity === 'rare' ? 1 + Math.floor(Math.random() * 2) : 1;
    rewards.push({ emoji: card.emoji, name: card.name, count, rarity: card.rarity });
  }
  rewards.push({ emoji: '💰', name: 'Gold', count: 15 + Math.floor(Math.random() * 35), rarity: 'common' });
  return rewards;
}

const CardCollection = () => {
  const { deck, setDeck, setScreen, setActiveTab, profile, setProfile } = useGame();
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [filter, setFilter] = useState<'all' | 'troop' | 'spell' | 'building'>('all');
  const [deckSlot, setDeckSlot] = useState(0);
  const [decks, setDecks] = useState<GameCard[][]>([deck, [], [], [], []]);
  const [freebiesClaimed, setFreebiesClaimedState] = useState(getFreebiesClaimed);
  const [showFreebieRewards, setShowFreebieRewards] = useState<RewardItem[] | null>(null);
  const filtered = filter === 'all' ? allCards : allCards.filter(c => c.type === filter);
  const isInDeck = (card: GameCard) => decks[deckSlot].some(d => d.id === card.id);

  const toggleDeck = (card: GameCard) => {
    const newDecks = [...decks];
    if (isInDeck(card)) {
      newDecks[deckSlot] = newDecks[deckSlot].filter(d => d.id !== card.id);
    } else if (newDecks[deckSlot].length < 8) {
      newDecks[deckSlot] = [...newDecks[deckSlot], card];
    }
    setDecks(newDecks);
    if (deckSlot === 0) setDeck(newDecks[0]);
  };

  const currentDeck = decks[deckSlot];
  const avgElixir = currentDeck.length > 0 ? (currentDeck.reduce((a, c) => a + c.elixir, 0) / currentDeck.length).toFixed(1) : '0.0';

  const claimFreebies = () => {
    if (freebiesClaimed) return;
    const rewards = generateDailyFreebies();
    const goldReward = rewards.find(r => r.name === 'Gold');
    if (goldReward) {
      setProfile((prev: typeof profile) => ({ ...prev, gold: prev.gold + goldReward.count }));
    }
    setFreebiesClaimed();
    setFreebiesClaimedState(true);
    setShowFreebieRewards(rewards);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Freebie reward popup */}
      <AnimatePresence>
        {showFreebieRewards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setShowFreebieRewards(null)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="w-[90%] max-w-sm bg-card border border-border rounded-2xl p-5"
            >
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-xl pointer-events-none"
              />
              <h2 className="font-display font-bold text-lg text-primary text-center mb-4">🎁 DAILY FREEBIES!</h2>
              <div className="grid grid-cols-2 gap-2">
                {showFreebieRewards.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
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
                transition={{ delay: showFreebieRewards.length * 0.15 + 0.3 }}
                onClick={() => setShowFreebieRewards(null)}
                className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase"
              >
                Collect
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <button onClick={() => { setActiveTab('battle'); setScreen('menu'); }} className="text-muted-foreground text-xs font-semibold">✕</button>
        <h2 className="font-display font-bold text-foreground text-sm">BATTLE DECK</h2>
        <span className="text-xs font-bold text-primary">{currentDeck.length}/8</span>
      </div>

      {/* Deck slots tabs */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        {[0, 1, 2, 3, 4].map(i => (
          <button
            key={i}
            onClick={() => setDeckSlot(i)}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${deckSlot === i ? 'text-primary border-b-2 border-primary bg-[hsl(220,20%,16%)]' : 'text-muted-foreground'}`}
          >
            Deck {i + 1}
          </button>
        ))}
      </div>

      {/* Current deck */}
      <div className="px-2 py-2 bg-[hsl(220,20%,13%)] border-b border-border">
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              {currentDeck[i] ? (
                <div onClick={() => toggleDeck(currentDeck[i])}>
                  <CardComponent card={currentDeck[i]} size="xs" showElixir={false} />
                </div>
              ) : (
                <div className="w-10 h-13 rounded border border-dashed border-muted-foreground/20 bg-muted/10" />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[9px] text-muted-foreground">Avg Elixir: <span className="text-elixir font-bold">{avgElixir}</span></span>
          <span className="text-[9px] text-muted-foreground">{currentDeck.length}/8 cards</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 px-2 py-1.5 bg-[hsl(220,20%,11%)] border-b border-border">
        {(['all', 'troop', 'spell', 'building'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold capitalize transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Daily Freebies */}
      <div className="px-2 pt-2 bg-[hsl(220,20%,10%)]">
        <motion.button
          whileTap={!freebiesClaimed ? { scale: 0.97 } : undefined}
          onClick={claimFreebies}
          disabled={freebiesClaimed}
          className={`w-full rounded-xl p-3 flex items-center gap-3 border transition-colors ${
            freebiesClaimed
              ? 'bg-muted/30 border-border/30 opacity-50'
              : 'bg-gradient-to-r from-[hsl(140,50%,20%)] to-[hsl(160,50%,18%)] border-[hsl(140,50%,35%)] hover:brightness-110'
          }`}
        >
          {freebiesClaimed ? (
            <Check className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Gift className="w-5 h-5 text-[hsl(140,60%,60%)]" />
          )}
          <div className="text-left flex-1">
            <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">
              {freebiesClaimed ? 'Freebies Claimed!' : 'Daily Free Cards'}
            </div>
            <div className="text-[8px] text-muted-foreground">
              {freebiesClaimed ? 'Come back tomorrow for more' : 'Tap to claim free cards & gold'}
            </div>
          </div>
          {!freebiesClaimed && (
            <span className="text-[9px] font-bold text-[hsl(140,60%,60%)] bg-[hsl(140,50%,15%)] px-2 py-1 rounded-lg uppercase">Free</span>
          )}
        </motion.button>
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto p-2 bg-[hsl(220,20%,10%)]">
        <div className="grid grid-cols-4 gap-1.5">
          {filtered.map(card => (
            <motion.div
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCard(card)}
              className={`${isInDeck(card) ? 'ring-2 ring-primary rounded-lg' : ''}`}
            >
              <CardComponent card={card} size="md" showLevel showCount />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[hsl(0,0%,0%,0.85)] backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCard(null)}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5 max-w-xs w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3">
              <CardComponent card={selectedCard} size="lg" showElixir showLevel />
            </div>
            <h3 className="font-display font-bold text-foreground text-lg text-center">{selectedCard.name}</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                selectedCard.rarity === 'common' ? 'bg-common/20 text-common' :
                selectedCard.rarity === 'rare' ? 'bg-[hsl(210,60%,50%,0.2)] text-[hsl(210,60%,60%)]' :
                selectedCard.rarity === 'epic' ? 'bg-epic/20 text-epic' :
                selectedCard.rarity === 'legendary' ? 'bg-legendary/20 text-legendary' :
                'bg-[hsl(340,60%,50%,0.2)] text-[hsl(340,60%,60%)]'
              }`}>{selectedCard.rarity}</span>
              <span className="text-[10px] text-muted-foreground">• {selectedCard.era}</span>
            </div>
            <p className="text-foreground/80 text-xs text-center mt-3 leading-relaxed">{selectedCard.description}</p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {selectedCard.hp && (
                <div className="bg-muted rounded-lg p-2 text-center">
                  <div className="text-[8px] text-muted-foreground uppercase">Hitpoints</div>
                  <div className="text-sm font-bold text-hp-green">{selectedCard.hp}</div>
                </div>
              )}
              <div className="bg-muted rounded-lg p-2 text-center">
                <div className="text-[8px] text-muted-foreground uppercase">Damage</div>
                <div className="text-sm font-bold text-accent">{selectedCard.damage}</div>
              </div>
              <div className="bg-muted rounded-lg p-2 text-center">
                <div className="text-[8px] text-muted-foreground uppercase">Elixir</div>
                <div className="text-sm font-bold text-elixir">{selectedCard.elixir}</div>
              </div>
            </div>
            {/* Upgrade progress */}
            <div className="mt-3 bg-muted rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-muted-foreground">Level {selectedCard.level}</span>
                <span className="text-[9px] text-muted-foreground">{selectedCard.count}/{selectedCard.maxCount}</span>
              </div>
              <div className="h-2 bg-[hsl(0,0%,0%,0.3)] rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(selectedCard.count / selectedCard.maxCount) * 100}%` }} />
              </div>
            </div>
            <button
              onClick={() => { toggleDeck(selectedCard); setSelectedCard(null); }}
              className={`w-full mt-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider ${isInDeck(selectedCard) ? 'bg-accent text-accent-foreground' : currentDeck.length < 8 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
              disabled={!isInDeck(selectedCard) && currentDeck.length >= 8}
            >
              {isInDeck(selectedCard) ? 'Remove from Deck' : 'Add to Deck'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CardCollection;
