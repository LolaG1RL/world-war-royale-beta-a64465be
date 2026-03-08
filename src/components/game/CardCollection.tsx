import { useGame } from '@/context/GameContext';
import { allCards } from '@/data/cards';
import CardComponent from './CardComponent';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useState, useMemo } from 'react';
import { GameCard } from '@/data/cards';
import { allEmotes, getOwnedEmotes, getEquippedEmotes, setEquippedEmotes } from '@/data/emotes';
import { BottomNav } from './BottomNav';
import { getCardEntry, getUpgradeRequirements, canUpgrade, upgradeCard, addCards } from '@/data/cardInventory';
import { toast } from 'sonner';
import BannerCustomizer from './BannerCustomizer';
import { getAllMatchups } from '@/data/cardMatchups';

const CardCollection = () => {
  const { deck, setDeck, setScreen, setActiveTab, profile, setProfile } = useGame();
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [filter, setFilter] = useState<'all' | 'troop' | 'spell' | 'building'>('all');
  const [deckSlot, setDeckSlot] = useState(0);
  const [decks, setDecks] = useState<GameCard[][]>([deck, [], [], [], []]);
  const [mainTab, setMainTab] = useState<'cards' | 'emotes' | 'banner'>('cards');
  const [showBanner, setShowBanner] = useState(false);
  const [ownedEmotes] = useState(() => getOwnedEmotes());
  const [equipped, setEquipped] = useState(() => getEquippedEmotes());
  const [, forceUpdate] = useState(0);
  const [detailTab, setDetailTab] = useState<'overview' | 'matchup'>('overview');

  const allCardIds = useMemo(() => allCards.map(c => c.id), []);
  const matchupData = useMemo(() => getAllMatchups(allCardIds), [allCardIds]);

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

  const toggleEquipEmote = (emoteId: string) => {
    let next: string[];
    if (equipped.includes(emoteId)) {
      next = equipped.filter(e => e !== emoteId);
    } else if (equipped.length < 8) {
      next = [...equipped, emoteId];
    } else {
      return;
    }
    setEquipped(next);
    setEquippedEmotes(next);
  };

  const handleUpgrade = (card: GameCard) => {
    if (!canUpgrade(card.id, card.rarity, profile.gold)) return;
    const result = upgradeCard(card.id, card.rarity);
    if (!result) return;
    setProfile(p => ({ ...p, gold: p.gold - result.goldCost }));
    toast.success(`${card.name} upgraded to Level ${result.newLevel}!`);
    forceUpdate(n => n + 1);
  };

  const currentDeck = decks[deckSlot];
  const avgElixir = currentDeck.length > 0 ? (currentDeck.reduce((a, c) => a + c.elixir, 0) / currentDeck.length).toFixed(1) : '0.0';

  // If banner tab selected, render full-screen BannerCustomizer
  if (mainTab === 'banner') {
    return <BannerCustomizer />;
  }

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <div className="w-8" />
        <h2 className="font-display font-bold text-foreground text-sm">{mainTab === 'cards' ? 'BATTLE DECK' : 'EMOTES'}</h2>
        <span className="text-xs font-bold text-primary">{mainTab === 'cards' ? `${currentDeck.length}/8` : `${equipped.length}/8`}</span>
      </div>

      {/* Cards / Emotes / Banner tab */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        <button onClick={() => setMainTab('cards')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${mainTab === 'cards' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          🃏 Cards
        </button>
        <button onClick={() => setMainTab('emotes')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${mainTab === 'emotes' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          😀 Emotes
        </button>
        <button onClick={() => setMainTab('banner')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors text-muted-foreground`}>
          🏴 Banner
        </button>
      </div>

      {mainTab === 'cards' ? (
        <>
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

          {/* Card grid */}
          <div className="flex-1 overflow-y-auto p-2 bg-[hsl(220,20%,10%)]">
            <div className="grid grid-cols-4 gap-1.5">
              {filtered.map(card => {
                const entry = getCardEntry(card.id);
                const enrichedCard = { ...card, level: entry.level, count: entry.count };
                return (
                  <motion.div
                    key={card.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCard(enrichedCard)}
                    className={`relative ${isInDeck(card) ? 'ring-2 ring-primary rounded-lg' : ''}`}
                  >
                    <CardComponent card={enrichedCard} size="md" showLevel showCount />
                    {canUpgrade(card.id, card.rarity, profile.gold) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-hp-green rounded-full flex items-center justify-center z-10 animate-pulse">
                        <span className="text-[8px] font-black text-foreground">⬆</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Card detail modal - Clash Royale style */}
          <AnimatePresence>
            {selectedCard && (() => {
              const entry = getCardEntry(selectedCard.id);
              const req = getUpgradeRequirements(selectedCard.id, selectedCard.rarity);
              const canUp = canUpgrade(selectedCard.id, selectedCard.rarity, profile.gold);
              const enriched = { ...selectedCard, level: entry.level, count: entry.count };
              const progressValue = req && !req.maxLevel ? Math.min(100, (entry.count / req.cardsNeeded) * 100) : 100;
              const targetLabel = enriched.targets
                ? enriched.targets === 'ground-air' ? 'Ground + Air'
                  : enriched.targets === 'buildings' ? 'Buildings'
                    : enriched.targets.charAt(0).toUpperCase() + enriched.targets.slice(1)
                : enriched.type === 'spell' ? 'Area' : 'Ground';

              const detailRows = [
                { label: 'Type', value: enriched.type.toUpperCase(), icon: '🏷️' },
                { label: 'Targets', value: targetLabel, icon: '🎯' },
                { label: 'Elixir Cost', value: String(enriched.elixir), icon: '💧' },
                { label: 'Hitpoints', value: enriched.hp ? String(enriched.hp) : '—', icon: '❤️' },
                { label: 'Damage', value: String(enriched.damage), icon: '⚔️' },
                { label: 'Hit Speed', value: enriched.hitSpeed ? `${enriched.hitSpeed}s` : '—', icon: '⏱️' },
                { label: 'Speed', value: enriched.speed ? enriched.speed.replace('-', ' ') : '—', icon: '💨' },
                { label: 'Range', value: typeof enriched.range === 'number' ? `${enriched.range}` : (enriched.range || '—').replace('-', ' '), icon: '📏' },
                { label: 'Count', value: String(enriched.deployCount || 1), icon: '👥' },
              ];

              const cardMatchup = matchupData[selectedCard.id];

              const handleSwipe = (_: any, info: PanInfo) => {
                if (Math.abs(info.offset.x) > 50) {
                  if (info.offset.x < 0 && detailTab === 'overview') setDetailTab('matchup');
                  if (info.offset.x > 0 && detailTab === 'matchup') setDetailTab('overview');
                }
              };

              return (
                <motion.div
                  key="card-detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50"
                  onClick={() => { setSelectedCard(null); setDetailTab('overview'); }}
                >
                  <div
                    className="absolute inset-0 bg-background/90"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, hsl(var(--background)) 25%, hsl(var(--card)) 25%, hsl(var(--card)) 50%, hsl(var(--background)) 50%, hsl(var(--background)) 75%, hsl(var(--card)) 75%, hsl(var(--card)) 100%)',
                      backgroundSize: '36px 36px',
                    }}
                  />

                  <motion.div
                    initial={{ scale: 0.92, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.96, y: 10, opacity: 0 }}
                    className="relative h-full w-full max-w-md mx-auto flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Card Info</div>
                      <button
                        onClick={() => { setSelectedCard(null); setDetailTab('overview'); }}
                        className="w-8 h-8 rounded-full bg-muted text-foreground font-black"
                      >
                        ×
                      </button>
                    </div>

                    {/* Card name + level */}
                    <div className="px-4">
                      <h3 className="font-display font-black text-center text-2xl text-foreground leading-tight">{enriched.name}</h3>
                      <div className="mt-1 flex items-center justify-center gap-2">
                        <span className="text-[10px] font-bold text-primary">Level {entry.level}</span>
                        {enriched.targets === 'buildings' && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40">
                            WIN CONDITION
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tab bar - Overview | Matchup */}
                    <div className="flex mx-4 mt-3 rounded-xl bg-muted/50 border border-border overflow-hidden">
                      <button
                        onClick={() => setDetailTab('overview')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                          detailTab === 'overview'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setDetailTab('matchup')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                          detailTab === 'matchup'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Matchup
                      </button>
                    </div>

                    {/* Swipeable content */}
                    <motion.div
                      className="flex-1 overflow-y-auto px-4 pb-4 mt-2"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={handleSwipe}
                    >
                      <AnimatePresence mode="wait">
                        {detailTab === 'overview' ? (
                          <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Card art */}
                            <div className="rounded-xl border border-border bg-card p-3">
                              <div className="flex justify-center mb-3">
                                <CardComponent card={enriched} size="lg" showElixir showLevel />
                              </div>
                              <div className="rounded-lg bg-muted/70 p-2 border border-border">
                                <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                                  <span className="text-muted-foreground uppercase">Card Level Progress</span>
                                  <span className="text-foreground">
                                    {req && !req.maxLevel ? `${entry.count}/${req.cardsNeeded}` : 'MAX'}
                                  </span>
                                </div>
                                <div className="h-2 rounded-full bg-background/70 overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${progressValue}%` }} />
                                </div>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="mt-3 rounded-xl border border-border bg-card overflow-hidden">
                              {detailRows.map((row) => (
                                <div key={row.label} className="flex items-center justify-between px-3 py-2 border-b border-border last:border-b-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs">{row.icon}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{row.label}</span>
                                  </div>
                                  <span className="text-xs font-bold text-foreground">{row.value}</span>
                                </div>
                              ))}
                            </div>

                            {/* Lore */}
                            <div className="mt-3 rounded-xl border border-border bg-card px-3 py-2.5">
                              <p className="text-xs text-foreground/90 leading-relaxed">{enriched.description}</p>
                            </div>

                            {/* Swipe hint */}
                            <div className="mt-3 flex items-center justify-center gap-1 text-muted-foreground">
                              <span className="text-[9px]">← Swipe for Matchups</span>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="matchup"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Good against */}
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs">✅</span>
                                <span className="text-[11px] font-black text-foreground uppercase tracking-wider">Good Against</span>
                              </div>
                              <div className="space-y-1">
                                {cardMatchup?.counters.map(m => {
                                  const card = allCards.find(c => c.id === m.cardId);
                                  if (!card) return null;
                                  return (
                                    <div key={m.cardId} className="flex items-center gap-2 bg-card rounded-lg px-2 py-1.5 border border-border">
                                      <span className="text-lg">{card.emoji}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-foreground truncate">{card.name}</div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-0.5">
                                          <div className="h-full rounded-full flex">
                                            <div
                                              className="h-full bg-[hsl(142,60%,45%)]"
                                              style={{ width: `${m.winRate}%` }}
                                            />
                                            <div
                                              className="h-full bg-accent"
                                              style={{ width: `${100 - m.winRate}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-0.5">
                                        <span className="text-[10px] font-black text-[hsl(142,60%,45%)]">{m.winRate}</span>
                                        <span className="text-[8px] text-muted-foreground">|</span>
                                        <span className="text-[10px] font-black text-accent">{100 - m.winRate}</span>
                                      </div>
                                      <span className="text-[8px] text-muted-foreground">{m.sampleSize}</span>
                                    </div>
                                  );
                                })}
                                {(!cardMatchup?.counters.length) && (
                                  <div className="text-[10px] text-muted-foreground text-center py-3">No strong matchups found</div>
                                )}
                              </div>
                            </div>

                            {/* Bad against */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs">❌</span>
                                <span className="text-[11px] font-black text-foreground uppercase tracking-wider">Bad Against</span>
                              </div>
                              <div className="space-y-1">
                                {cardMatchup?.counteredBy.map(m => {
                                  const card = allCards.find(c => c.id === m.cardId);
                                  if (!card) return null;
                                  const lossRate = 100 - m.winRate;
                                  return (
                                    <div key={m.cardId} className="flex items-center gap-2 bg-card rounded-lg px-2 py-1.5 border border-border">
                                      <span className="text-lg">{card.emoji}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-foreground truncate">{card.name}</div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-0.5">
                                          <div className="h-full rounded-full flex">
                                            <div
                                              className="h-full bg-accent"
                                              style={{ width: `${lossRate}%` }}
                                            />
                                            <div
                                              className="h-full bg-[hsl(142,60%,45%)]"
                                              style={{ width: `${m.winRate}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-0.5">
                                        <span className="text-[10px] font-black text-accent">{lossRate}</span>
                                        <span className="text-[8px] text-muted-foreground">|</span>
                                        <span className="text-[10px] font-black text-[hsl(142,60%,45%)]">{m.winRate}</span>
                                      </div>
                                      <span className="text-[8px] text-muted-foreground">{m.sampleSize}</span>
                                    </div>
                                  );
                                })}
                                {(!cardMatchup?.counteredBy.length) && (
                                  <div className="text-[10px] text-muted-foreground text-center py-3">No weak matchups found</div>
                                )}
                              </div>
                            </div>

                            {/* Swipe hint */}
                            <div className="mt-3 flex items-center justify-center gap-1 text-muted-foreground">
                              <span className="text-[9px]">Swipe for Overview →</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Bottom actions */}
                    <div className="px-4 pb-4 pt-2 border-t border-border bg-background/90">
                      {req && !req.maxLevel && (
                        <button
                          onClick={() => {
                            handleUpgrade(enriched);
                            const newEntry = getCardEntry(selectedCard.id);
                            setSelectedCard({ ...selectedCard, level: newEntry.level, count: newEntry.count });
                          }}
                          disabled={!canUp}
                          className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider ${
                            canUp ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }`}
                        >
                          Upgrade • 💰 {req.goldNeeded.toLocaleString()}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          toggleDeck(enriched);
                          setSelectedCard(null);
                          setDetailTab('overview');
                        }}
                        className={`w-full mt-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider ${
                          isInDeck(enriched)
                            ? 'bg-accent text-accent-foreground'
                            : currentDeck.length < 8
                              ? 'bg-secondary text-foreground'
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                        disabled={!isInDeck(enriched) && currentDeck.length >= 8}
                      >
                        {isInDeck(enriched) ? 'Remove from Deck' : 'Add to Deck'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </>
      ) : (
        /* Emotes tab */
        <>
          {/* Equipped emotes */}
          <div className="px-3 py-2 bg-[hsl(220,20%,13%)] border-b border-border">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Equipped ({equipped.length}/8)</div>
            <div className="flex gap-1.5 flex-wrap">
              {equipped.map(id => {
                const emote = allEmotes.find(e => e.id === id);
                if (!emote) return null;
                return (
                  <button key={id} onClick={() => toggleEquipEmote(id)} className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 p-1 hover:border-accent transition-colors">
                    <div dangerouslySetInnerHTML={{ __html: emote.svg }} />
                  </button>
                );
              })}
              {Array.from({ length: Math.max(0, 8 - equipped.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/20 bg-muted/10" />
              ))}
            </div>
          </div>

          {/* All owned emotes */}
          <div className="flex-1 overflow-y-auto p-3 bg-[hsl(220,20%,10%)]">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Owned Emotes</div>
            <div className="grid grid-cols-5 gap-2">
              {allEmotes.filter(e => ownedEmotes.includes(e.id)).map(emote => {
                const isEquipped = equipped.includes(emote.id);
                return (
                  <motion.button
                    key={emote.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleEquipEmote(emote.id)}
                    className={`aspect-square rounded-xl border-2 p-1.5 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                      isEquipped ? 'border-primary bg-primary/10' :
                      emote.rarity === 'legendary' ? 'border-primary/30 bg-[hsl(38,30%,12%)]' :
                      emote.rarity === 'epic' ? 'border-purple-400/30 bg-[hsl(280,20%,12%)]' :
                      emote.rarity === 'rare' ? 'border-blue-400/30 bg-[hsl(210,20%,12%)]' :
                      'border-border bg-card'
                    }`}
                  >
                    <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: emote.svg }} />
                    <span className="text-[6px] font-bold text-foreground truncate w-full text-center">{emote.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Locked emotes preview */}
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mt-4 mb-2">Not Owned</div>
            <div className="grid grid-cols-5 gap-2">
              {allEmotes.filter(e => !ownedEmotes.includes(e.id)).map(emote => (
                <div key={emote.id} className="aspect-square rounded-xl border-2 border-border/30 bg-muted/10 p-1.5 flex flex-col items-center justify-center gap-0.5 opacity-40 grayscale">
                  <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: emote.svg }} />
                  <span className="text-[6px] font-bold text-muted-foreground truncate w-full text-center">{emote.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <BottomNav active="cards" setScreen={setScreen} />
    </div>
  );
};

export default CardCollection;
