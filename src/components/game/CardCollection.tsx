import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { allCards, arenas } from '@/data/cards';
import { t } from '@/lib/i18n';
import CardComponent from './CardComponent';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { PlayerProfile } from '@/data/cards';
import { GameCard } from '@/data/cards';
import { allEmotes, getOwnedEmotes, getEquippedEmotes, setEquippedEmotes } from '@/data/emotes';
import { BottomNav } from './BottomNav';
import { getCardEntry, getUpgradeRequirements, canUpgrade, upgradeCard, addCards, isCardOwned } from '@/data/cardInventory';
import { toast } from 'sonner';
import {
  allBackgrounds, allEmblems, allBadges,
  getPlayerBanner, setPlayerBanner, PlayerBanner,
  getOwnedBackgrounds, getOwnedEmblems, getOwnedBadges,
  addOwnedBadge, getUnlockedAchievementBadges,
} from '@/data/banners';
import BattleBannerDisplay from './BattleBannerDisplay';
import { getAllMatchups } from '@/data/cardMatchups';

const RARITY_BORDER: Record<string, string> = {
  common: 'border-muted-foreground/40',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-primary',
};

type BannerSubTab = 'backgrounds' | 'emblems' | 'badges';

const BannerInline = ({ profile, clanName, clanBanner }: { profile: PlayerProfile; clanName?: string; clanBanner?: { bannerColor: string; bannerShape: string; iconId: string; iconColor: string } }) => {
  const [banner, setBanner] = useState<PlayerBanner>(getPlayerBanner());
  const [subTab, setSubTab] = useState<BannerSubTab>('backgrounds');
  const [ownedBgs] = useState(() => getOwnedBackgrounds());
  const [ownedEmbs] = useState(() => getOwnedEmblems());
  const [ownedBadges, setOwnedBadgesState] = useState(() => getOwnedBadges());

  useEffect(() => {
    const unlocked = getUnlockedAchievementBadges(profile);
    let changed = false;
    unlocked.forEach(id => {
      if (!ownedBadges.has(id)) {
        addOwnedBadge(id);
        changed = true;
      }
    });
    if (changed) setOwnedBadgesState(getOwnedBadges());
  }, [profile]);

  const save = (b: PlayerBanner) => { setBanner(b); setPlayerBanner(b); };
  const selectBg = (id: string) => { if (ownedBgs.has(id)) save({ ...banner, backgroundId: id }); };
  const selectEmblem = (id: string) => { if (ownedEmbs.has(id)) save({ ...banner, emblemId: id }); };
  const toggleBadge = (id: string) => {
    if (!ownedBadges.has(id)) return;
    const cur = [...banner.badgeIds];
    if (cur.includes(id)) save({ ...banner, badgeIds: cur.filter(b => b !== id) });
    else if (cur.length < 3) save({ ...banner, badgeIds: [...cur, id] });
  };

  const ownedBackgrounds = allBackgrounds.filter(bg => ownedBgs.has(bg.id));
  const ownedEmblemsList = allEmblems.filter(emb => ownedEmbs.has(emb.id));
  const ownedBadgesList = allBadges.filter(b => ownedBadges.has(b.id));

  return (
    <>
      {/* Preview */}
      <div className="px-4 py-3 bg-[hsl(220,20%,11%)] border-b border-border">
        <BattleBannerDisplay banner={banner} name={profile.name} trophies={profile.trophies} clanName={clanName} clanBanner={clanBanner} size="lg" />
      </div>

      {/* Sub tabs */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        {(['backgrounds', 'emblems', 'badges'] as BannerSubTab[]).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${subTab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {t === 'backgrounds' ? t('cards.bg_tab', language) : t === 'emblems' ? t('cards.emblem_tab', language) : t('cards.badges_tab', language)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 bg-[hsl(220,20%,10%)]">
        {subTab === 'backgrounds' && (
          ownedBackgrounds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">No backgrounds owned yet.<br />Buy some in the Shop → Banners tab!</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {ownedBackgrounds.map(bg => {
                const selected = banner.backgroundId === bg.id;
                return (
                  <button key={bg.id} onClick={() => selectBg(bg.id)} className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${selected ? 'border-primary ring-2 ring-primary/30' : RARITY_BORDER[bg.rarity]}`} style={{ background: bg.css }}>
                    {bg.animated && bg.animationSvg && <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: bg.animationSvg }} />}
                    <div className="absolute bottom-0 left-0 right-0 bg-[hsl(0,0%,0%,0.6)] px-1.5 py-0.5">
                      <span className="text-[8px] font-bold text-foreground">{bg.name}</span>
                    </div>
                    {selected && <div className="absolute top-1 left-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[8px] text-primary-foreground font-bold">✓</div>}
                  </button>
                );
              })}
            </div>
          )
        )}
        {subTab === 'emblems' && (
          ownedEmblemsList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">No emblems owned yet.<br />Buy some in the Shop → Banners tab!</div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {ownedEmblemsList.map(emb => {
                const selected = banner.emblemId === emb.id;
                return (
                  <button key={emb.id} onClick={() => selectEmblem(emb.id)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${selected ? 'border-primary bg-primary/10' : `${RARITY_BORDER[emb.rarity]} bg-card`}`}>
                    <span className={`text-xl ${emb.animated ? 'animate-pulse' : ''}`}>{emb.emoji}</span>
                    <span className="text-[7px] font-bold text-foreground truncate w-full text-center px-0.5">{emb.name}</span>
                  </button>
                );
              })}
            </div>
          )
        )}
        {subTab === 'badges' && (
          <>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Equipped ({banner.badgeIds.length}/3)</div>
            <div className="flex gap-1.5 mb-3">
              {[0, 1, 2].map(i => {
                const bid = banner.badgeIds[i];
                const badge = bid ? allBadges.find(b => b.id === bid) : null;
                return (
                  <button key={i} onClick={() => badge && toggleBadge(badge.id)} className={`w-10 h-10 rounded-full flex items-center justify-center ${badge ? 'bg-primary/20 border-2 border-primary/40 cursor-pointer' : 'border-2 border-dashed border-muted-foreground/20 bg-muted/10'}`}>
                    {badge ? <span className="text-base">{badge.emoji}</span> : null}
                  </button>
                );
              })}
            </div>
            {ownedBadgesList.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-xs">No badges earned yet.<br />Win battles to unlock achievement badges!</div>
            ) : (
              <>
                {ownedBadgesList.filter(b => b.type === 'achievement').length > 0 && (
                  <>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Achievement Badges</div>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {ownedBadgesList.filter(b => b.type === 'achievement').map(badge => (
                        <button key={badge.id} onClick={() => toggleBadge(badge.id)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${banner.badgeIds.includes(badge.id) ? 'border-primary bg-primary/10' : `${RARITY_BORDER[badge.rarity]} bg-card`}`}>
                          <span className="text-lg">{badge.emoji}</span>
                          <span className="text-[6px] font-bold text-foreground text-center leading-tight">{badge.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {ownedBadgesList.filter(b => b.type === 'cosmetic').length > 0 && (
                  <>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Cosmetic Badges</div>
                    <div className="grid grid-cols-4 gap-2">
                      {ownedBadgesList.filter(b => b.type === 'cosmetic').map(badge => (
                        <button key={badge.id} onClick={() => toggleBadge(badge.id)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${banner.badgeIds.includes(badge.id) ? 'border-primary bg-primary/10' : `${RARITY_BORDER[badge.rarity]} bg-card`}`}>
                          <span className="text-lg">{badge.emoji}</span>
                          <span className="text-[6px] font-bold text-foreground text-center leading-tight">{badge.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

// Hero slot helpers
const getHeroSlots = (level: number): number => {
  if (level >= 26) return 2;
  if (level >= 11) return 1;
  return 0;
};

const getActiveHeroSlots = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('hero_slots') || '[]');
  } catch { return []; }
};

const saveHeroSlots = (slots: string[]) => {
  localStorage.setItem('hero_slots', JSON.stringify(slots));
};

const isHeroUnlocked = (cardId: string): boolean => {
  try {
    const heroes = JSON.parse(localStorage.getItem('active_season_heroes') || '[]');
    return heroes.includes(cardId);
  } catch { return false; }
};

const CardCollection = () => {
  const { deck, setDeck, setScreen, setActiveTab, profile, setProfile, clan } = useGame();
  const { language } = useSettings();
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [filter, setFilter] = useState<'all' | 'troop' | 'spell' | 'building'>('all');
  const [deckSlot, setDeckSlot] = useState(0);
  const [decks, setDecks] = useState<GameCard[][]>([deck, [], [], [], []]);
  const [mainTab, setMainTab] = useState<'cards' | 'emotes' | 'banner'>('cards');
  const [showBanner, setShowBanner] = useState(false);
  const [ownedEmotes] = useState(() => getOwnedEmotes());
  const [equipped, setEquipped] = useState(() => getEquippedEmotes());
  const [, forceUpdate] = useState(0);
  const [detailTab, setDetailTab] = useState<'overview' | 'matchup' | 'hero'>('overview');
  const [heroSlots, setHeroSlots] = useState<string[]>(getActiveHeroSlots());

  const maxHeroSlots = getHeroSlots(profile.level);

  const allCardIds = useMemo(() => allCards.map(c => c.id), []);
  const matchupData = useMemo(() => getAllMatchups(allCardIds), [allCardIds]);

  const filtered = filter === 'all' ? allCards : allCards.filter(c => c.type === filter);
  
  // Split into unlocked (owned or in player's arena) and locked
  const unlockedCards = filtered.filter(c => isCardOwned(c.id) || c.unlockArena <= profile.arena);
  const lockedCards = filtered.filter(c => !isCardOwned(c.id) && c.unlockArena > profile.arena);
  
  const isInDeck = (card: GameCard) => decks[deckSlot].some(d => d.id === card.id);

  const toggleDeck = (card: GameCard) => {
    // Check hero version limits
    const currentDeck = decks[deckSlot];
    const isAdding = !isInDeck(card);
    
    if (isAdding) {
      if (currentDeck.length >= 8) return;
      
      // Check arena restriction
      if (card.unlockArena > profile.arena) {
        toast.error(`This card requires Arena ${card.unlockArena}!`);
        return;
      }
      
      // Check if this card has a hero version active
      const heroVersionCards = [...currentDeck, card].filter(c => isHeroUnlocked(c.id) && c.heroBonus);
      if (heroVersionCards.length > 2) {
        toast.error('Max 2 hero version cards in a deck!');
        return;
      }
    }
    
    const newDecks = [...decks];
    if (isInDeck(card)) {
      newDecks[deckSlot] = newDecks[deckSlot].filter(d => d.id !== card.id);
      // Remove from hero slots if removed from deck
      if (heroSlots.includes(card.id)) {
        const newSlots = heroSlots.filter(s => s !== card.id);
        setHeroSlots(newSlots);
        saveHeroSlots(newSlots);
      }
    } else {
      newDecks[deckSlot] = [...newDecks[deckSlot], card];
    }
    setDecks(newDecks);
    if (deckSlot === 0) setDeck(newDecks[0]);
  };

  const toggleHeroSlot = (cardId: string) => {
    if (heroSlots.includes(cardId)) {
      const newSlots = heroSlots.filter(s => s !== cardId);
      setHeroSlots(newSlots);
      saveHeroSlots(newSlots);
    } else if (heroSlots.length < maxHeroSlots) {
      const newSlots = [...heroSlots, cardId];
      setHeroSlots(newSlots);
      saveHeroSlots(newSlots);
    } else {
      toast.error(`You only have ${maxHeroSlots} hero slot${maxHeroSlots !== 1 ? 's' : ''}!`);
    }
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

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <div className="w-8" />
        <h2 className="font-display font-bold text-foreground text-sm">{mainTab === 'cards' ? 'BATTLE DECK' : mainTab === 'emotes' ? 'EMOTES' : 'BATTLE BANNER'}</h2>
        <span className="text-xs font-bold text-primary">{mainTab === 'cards' ? `${currentDeck.length}/8` : mainTab === 'emotes' ? `${equipped.length}/8` : ''}</span>
      </div>

      {/* Cards / Emotes / Banner tab */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        <button onClick={() => setMainTab('cards')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${mainTab === 'cards' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          🃏 Cards
        </button>
        <button onClick={() => setMainTab('emotes')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${mainTab === 'emotes' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          😀 Emotes
        </button>
        <button onClick={() => setMainTab('banner')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${mainTab === 'banner' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
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
                    <div onClick={() => toggleDeck(currentDeck[i])} className="relative">
                      <CardComponent card={currentDeck[i]} size="xs" showElixir={false} />
                      {isHeroUnlocked(currentDeck[i].id) && currentDeck[i].heroBonus && (
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center z-10 text-[6px] ${heroSlots.includes(currentDeck[i].id) ? 'bg-amber-500 animate-pulse' : 'bg-muted-foreground/40'}`}>
                          ⭐
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-13 rounded border border-dashed border-muted-foreground/20 bg-muted/10" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-[9px] text-muted-foreground">Avg Elixir: <span className="text-elixir font-bold">{avgElixir}</span></span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-amber-400">⭐ Hero Slots: {heroSlots.length}/{maxHeroSlots}</span>
                <span className="text-[9px] text-muted-foreground">{currentDeck.length}/8 cards</span>
              </div>
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
            {/* Unlocked cards */}
            <div className="grid grid-cols-4 gap-1.5">
              {unlockedCards.map(card => {
                const entry = getCardEntry(card.id);
                const enrichedCard = { ...card, level: entry.level, count: entry.count };
                const owned = isCardOwned(card.id);
                return (
                  <motion.div
                    key={card.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedCard(enrichedCard); setDetailTab('overview'); }}
                    className={`relative ${isInDeck(card) ? 'ring-2 ring-primary rounded-lg' : ''} ${!owned ? 'opacity-50' : ''}`}
                  >
                    <CardComponent card={enrichedCard} size="md" showElixir showLevel={owned} showCount={owned} />
                    {!owned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                        <span className="text-[8px] font-bold text-muted-foreground">Arena {card.unlockArena}</span>
                      </div>
                    )}
                    {owned && canUpgrade(card.id, card.rarity, profile.gold) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-hp-green rounded-full flex items-center justify-center z-10 animate-pulse">
                        <span className="text-[8px] font-black text-foreground">⬆</span>
                      </div>
                    )}
                    {owned && isHeroUnlocked(card.id) && card.heroBonus && (
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-amber-500/80 rounded text-[6px] font-bold text-black z-10">
                        HERO
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Locked cards section */}
            {lockedCards.length > 0 && (
              <>
                <div className="mt-4 mb-2 flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">🔒 Not Unlocked</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {lockedCards.map(card => {
                    const enrichedCard = { ...card, level: 1, count: 0 };
                    const arenaData = arenas.find(a => a.id === card.unlockArena);
                    return (
                      <motion.div
                        key={card.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedCard(enrichedCard); setDetailTab('overview'); }}
                        className="relative opacity-40 grayscale"
                      >
                        <CardComponent card={enrichedCard} size="md" showElixir />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                          <span className="text-[7px] font-bold text-muted-foreground">{arenaData?.emoji}</span>
                          <span className="text-[7px] font-bold text-muted-foreground">{arenaData?.name}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Card detail modal */}
          <AnimatePresence>
            {selectedCard && (() => {
              const entry = getCardEntry(selectedCard.id);
              const req = getUpgradeRequirements(selectedCard.id, selectedCard.rarity);
              const canUp = canUpgrade(selectedCard.id, selectedCard.rarity, profile.gold);
              const enriched = { ...selectedCard, level: entry.level, count: entry.count };
              const owned = isCardOwned(selectedCard.id);
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
                { label: 'Unlock Arena', value: `${enriched.unlockArena} - ${arenas.find(a => a.id === enriched.unlockArena)?.name || ''}`, icon: '🏟️' },
              ];

              const cardMatchup = matchupData[selectedCard.id];
              const hasHeroVersion = !!enriched.heroBonus;
              const heroUnlocked = hasHeroVersion && isHeroUnlocked(enriched.id);

              // Build tab list
              const tabs: ('overview' | 'matchup' | 'hero')[] = hasHeroVersion 
                ? ['overview', 'matchup', 'hero'] 
                : ['overview', 'matchup'];
              
              const currentTabIndex = tabs.indexOf(detailTab);

              const handleSwipe = (_: any, info: PanInfo) => {
                if (Math.abs(info.offset.x) > 50) {
                  if (info.offset.x < 0 && currentTabIndex < tabs.length - 1) setDetailTab(tabs[currentTabIndex + 1]);
                  if (info.offset.x > 0 && currentTabIndex > 0) setDetailTab(tabs[currentTabIndex - 1]);
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
                        {!owned && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/40">
                            🔒 LOCKED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tab bar */}
                    <div className="flex mx-4 mt-3 rounded-xl bg-muted/50 border border-border overflow-hidden">
                      {tabs.map(tab => (
                        <button
                          key={tab}
                          onClick={() => setDetailTab(tab)}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                            detailTab === tab
                              ? tab === 'hero' ? 'bg-amber-500 text-black' : 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {tab === 'hero' ? '⭐ Hero' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
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
                              {owned && (
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
                              )}
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
                              <span className="text-[9px]">← Swipe for Matchups →</span>
                            </div>
                          </motion.div>
                        ) : detailTab === 'matchup' ? (
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
                                            <div className="h-full bg-[hsl(142,60%,45%)]" style={{ width: `${m.winRate}%` }} />
                                            <div className="h-full bg-accent" style={{ width: `${100 - m.winRate}%` }} />
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
                                            <div className="h-full bg-accent" style={{ width: `${lossRate}%` }} />
                                            <div className="h-full bg-[hsl(142,60%,45%)]" style={{ width: `${m.winRate}%` }} />
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
                              <span className="text-[9px]">{hasHeroVersion ? '← Overview | Hero →' : '← Swipe for Overview →'}</span>
                            </div>
                          </motion.div>
                        ) : (
                          /* Hero tab */
                          <motion.div
                            key="hero"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="rounded-xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent p-4">
                              <div className="flex items-center justify-center gap-2 mb-3">
                                <span className="text-2xl">⭐</span>
                                <h4 className="font-display font-black text-lg text-amber-400">HERO VERSION</h4>
                                <span className="text-2xl">⭐</span>
                              </div>
                              
                              {/* Unlock status */}
                              <div className={`rounded-lg px-3 py-2 mb-3 text-center ${heroUnlocked ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-muted/50 border border-border'}`}>
                                <span className={`text-[11px] font-black uppercase tracking-wider ${heroUnlocked ? 'text-amber-400' : 'text-muted-foreground'}`}>
                                  {heroUnlocked ? '✅ UNLOCKED' : '🔒 LOCKED — Unlock via War Pass+'}
                                </span>
                              </div>

                              {/* Hero bonus */}
                              <div className="rounded-xl border border-border bg-card p-3 mb-3">
                                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Hero Bonus</div>
                                <div className="text-sm font-bold text-foreground">{enriched.heroBonus?.name}</div>
                                <p className="text-xs text-foreground/80 mt-1">{enriched.heroBonus?.description}</p>
                              </div>

                              {/* Hero slot info */}
                              <div className="rounded-xl border border-border bg-card p-3 mb-3">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Hero Slot System</div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-muted-foreground">Your Level</span>
                                    <span className="font-bold text-foreground">{profile.level}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-muted-foreground">Hero Slots Available</span>
                                    <span className="font-bold text-amber-400">{maxHeroSlots}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-muted-foreground">Hero Slots Used</span>
                                    <span className="font-bold text-foreground">{heroSlots.length}/{maxHeroSlots}</span>
                                  </div>
                                  <div className="h-px bg-border my-1" />
                                  <div className="text-[9px] text-muted-foreground space-y-0.5">
                                    <div className={profile.level >= 1 && profile.level <= 10 ? 'text-primary font-bold' : ''}>Lvl 1-10: 0 hero slots</div>
                                    <div className={profile.level >= 11 && profile.level <= 25 ? 'text-primary font-bold' : ''}>Lvl 11-25: 1 hero slot</div>
                                    <div className={profile.level >= 26 ? 'text-primary font-bold' : ''}>Lvl 26+: 2 hero slots</div>
                                  </div>
                                </div>
                              </div>

                              {/* Slot toggle */}
                              {heroUnlocked && isInDeck(enriched) && maxHeroSlots > 0 && (
                                <button
                                  onClick={() => toggleHeroSlot(enriched.id)}
                                  className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider ${
                                    heroSlots.includes(enriched.id)
                                      ? 'bg-amber-500 text-black'
                                      : heroSlots.length < maxHeroSlots
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                  }`}
                                  disabled={!heroSlots.includes(enriched.id) && heroSlots.length >= maxHeroSlots}
                                >
                                  {heroSlots.includes(enriched.id) ? '⭐ Remove from Hero Slot' : '⭐ Place in Hero Slot'}
                                </button>
                              )}
                              {heroUnlocked && !isInDeck(enriched) && (
                                <div className="text-[10px] text-muted-foreground text-center">Add this card to your deck first to use a hero slot</div>
                              )}
                              {!heroUnlocked && (
                                <div className="text-[10px] text-muted-foreground text-center">Unlock the hero version through War Pass+ to activate bonuses</div>
                              )}

                              <div className="mt-3 rounded-lg bg-accent/10 border border-accent/20 px-3 py-2">
                                <p className="text-[9px] text-accent leading-relaxed">
                                  ⚠️ Hero bonuses/passives only activate when the card is placed in a Hero Slot. 
                                  Max 2 hero version cards per deck. Cards not in a hero slot will function as normal cards.
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-center gap-1 text-muted-foreground">
                              <span className="text-[9px]">← Swipe for Matchups</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Bottom actions */}
                    <div className="px-4 pb-4 pt-2 border-t border-border bg-background/90">
                      {owned && req && !req.maxLevel && (
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
                      {owned && (
                        <button
                          onClick={() => {
                            toggleDeck(enriched);
                            setSelectedCard(null);
                            setDetailTab('overview');
                          }}
                          className={`w-full mt-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider ${
                            isInDeck(enriched)
                              ? 'bg-accent text-accent-foreground'
                              : enriched.unlockArena > profile.arena
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : currentDeck.length < 8
                                  ? 'bg-secondary text-foreground'
                                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }`}
                          disabled={!isInDeck(enriched) && (currentDeck.length >= 8 || enriched.unlockArena > profile.arena)}
                        >
                          {isInDeck(enriched) ? 'Remove from Deck' : enriched.unlockArena > profile.arena ? `🔒 Requires Arena ${enriched.unlockArena}` : 'Add to Deck'}
                        </button>
                      )}
                      {!owned && (
                        <div className="text-center py-2.5 text-[11px] text-muted-foreground font-bold">
                          🔒 Reach Arena {enriched.unlockArena} to unlock this card
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </>
      ) : mainTab === 'emotes' ? (
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
      ) : (
        /* Banner tab - inline */
        <BannerInline profile={profile} clanName={clan?.name} clanBanner={clan ? { bannerColor: clan.bannerColor, bannerShape: clan.bannerShape, iconId: clan.iconId, iconColor: clan.iconColor } : undefined} />
      )}

      <BottomNav active="cards" setScreen={setScreen} />
    </div>
  );
};

export default CardCollection;
