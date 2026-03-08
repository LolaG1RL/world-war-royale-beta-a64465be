import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { t, tRarity } from '@/lib/i18n';
import { BottomNav } from './BottomNav';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, ChevronRight, Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { allCards } from '@/data/cards';
import { allEmotes, addOwnedEmote, getOwnedEmotes } from '@/data/emotes';
import { allBackgrounds, allEmblems, addOwnedBackground, addOwnedEmblem, getOwnedBackgrounds, getOwnedEmblems } from '@/data/banners';
import { addCards, markCardsOwned } from '@/data/cardInventory';
import RevealScreen, { RevealItem } from './RevealScreen';

// ── Seeded random ──
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const r = seededRng(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ── Reward types ──
interface RewardItem {
  emoji: string;
  name: string;
  count: number;
  rarity: string;
}

type RewardDef = {
  type: 'gold' | 'gems' | 'cards' | 'emote' | 'banner-bg' | 'banner-emb';
  amount?: number;
  rarity?: string;
};

// ── Generate timed events ──
interface EventData {
  id: string;
  name: string;
  emoji: string;
  description: string;
  hoursLeft: number;
  rewards: RewardDef[];
  type: 'event' | 'challenge' | 'tournament';
  entryFee?: { amount: number; currency: 'gold' | 'gems' };
  maxWins?: number;
  maxLosses?: number;
  milestones?: { wins: number; reward: RewardDef }[];
}

function generateEvents(): EventData[] {
  const seed = getDaySeed();
  const r = seededRng(seed * 3);

  const eventNames = [
    { name: 'Pharaoh\'s Challenge', emoji: '🏛️', desc: 'Ancient Egyptian battle royale! Only Egyptian-era troops are boosted.' },
    { name: 'Viking Raid', emoji: '⛵', desc: 'Pillage and plunder! Extra gold rewards for every win.' },
    { name: 'Dragon Festival', emoji: '🐲', desc: 'Dragons deal double damage this event!' },
    { name: 'Moonlit Siege', emoji: '🌙', desc: 'Night battle with limited vision. Spells cost 1 less elixir.' },
    { name: 'Iron Gauntlet', emoji: '🛡️', desc: 'Buildings have triple HP. Siege decks rule!' },
    { name: 'Mystic Mayhem', emoji: '🔮', desc: 'All troops get random buffs each deploy!' },
    { name: 'Samurai Showdown', emoji: '⚔️', desc: 'Honor duel! Only melee troops allowed.' },
    { name: 'Thunder Dome', emoji: '⚡', desc: 'Lightning strikes random enemies every 15 seconds!' },
  ];

  const picked = seededShuffle(eventNames, seed * 3).slice(0, 3);
  return picked.map((e, i) => {
    const hours = Math.floor(r() * 48) + 12;
    const rewardPool: RewardDef[] = [];
    // Always some gold/gems
    rewardPool.push({ type: 'gold', amount: Math.floor(r() * 500) + 200 });
    if (r() > 0.5) rewardPool.push({ type: 'gems', amount: Math.floor(r() * 20) + 5 });
    // Exclusive rewards
    if (r() > 0.4) {
      const unownedEmotes = allEmotes.filter(em => !getOwnedEmotes().includes(em.id));
      if (unownedEmotes.length > 0) rewardPool.push({ type: 'emote' });
    }
    if (r() > 0.6) rewardPool.push({ type: 'banner-bg' });
    if (r() > 0.7) rewardPool.push({ type: 'banner-emb' });
    rewardPool.push({ type: 'cards', amount: Math.floor(r() * 8) + 3, rarity: r() > 0.7 ? 'epic' : r() > 0.4 ? 'rare' : 'common' });

    return {
      id: `event-${getDaySeed()}-${i}`,
      name: e.name,
      emoji: e.emoji,
      description: e.desc,
      hoursLeft: hours,
      rewards: rewardPool,
      type: 'event' as const,
    };
  });
}

function generateChallenges(): EventData[] {
  const seed = getDaySeed();
  const r = seededRng(seed * 7);

  const challengeTemplates = [
    { name: 'Grand Challenge', emoji: '🏆', desc: '12 wins for ultimate rewards!', maxWins: 12, maxLosses: 3, fee: { amount: 100, currency: 'gems' as const } },
    { name: 'Classic Challenge', emoji: '⚔️', desc: '12 wins for great loot', maxWins: 12, maxLosses: 3, fee: { amount: 10, currency: 'gems' as const } },
    { name: 'Sudden Death', emoji: '💀', desc: 'One tower down = game over', maxWins: 9, maxLosses: 3, fee: { amount: 10, currency: 'gems' as const } },
    { name: 'Double Elixir Frenzy', emoji: '⚡', desc: 'Twice the elixir, twice the fun!', maxWins: 6, maxLosses: 3, fee: undefined },
    { name: 'Draft Royale', emoji: '🎲', desc: 'Pick cards from a random selection', maxWins: 12, maxLosses: 3, fee: { amount: 100, currency: 'gems' as const } },
    { name: 'Rage Mode', emoji: '😡', desc: 'Permanent rage spell! Everything is faster!', maxWins: 8, maxLosses: 3, fee: { amount: 5, currency: 'gems' as const } },
    { name: 'Mirror Match', emoji: '🪞', desc: 'Both players use the same deck!', maxWins: 6, maxLosses: 3, fee: undefined },
    { name: 'Triple Draft', emoji: '🎯', desc: 'Choose 3 picks from 3 pairs', maxWins: 9, maxLosses: 3, fee: { amount: 50, currency: 'gems' as const } },
  ];

  const picked = seededShuffle(challengeTemplates, seed * 7).slice(0, 4);
  return picked.map((c, i) => {
    const hours = Math.floor(r() * 72) + 24;
    const milestones: { wins: number; reward: RewardDef }[] = [];
    const mw = c.maxWins;
    milestones.push({ wins: Math.ceil(mw * 0.25), reward: { type: 'gold', amount: Math.floor(r() * 300) + 100 } });
    milestones.push({ wins: Math.ceil(mw * 0.5), reward: { type: 'cards', amount: Math.floor(r() * 5) + 2, rarity: 'rare' } });
    milestones.push({ wins: Math.ceil(mw * 0.75), reward: { type: 'gems', amount: Math.floor(r() * 15) + 5 } });
    // Final reward - exclusive
    const finalReward: RewardDef = r() > 0.5 ? { type: 'emote' } : r() > 0.5 ? { type: 'banner-bg' } : { type: 'banner-emb' };
    milestones.push({ wins: mw, reward: finalReward });

    return {
      id: `challenge-${getDaySeed()}-${i}`,
      name: c.name,
      emoji: c.emoji,
      description: c.desc,
      hoursLeft: hours,
      rewards: milestones.map(m => m.reward),
      type: 'challenge' as const,
      entryFee: c.fee,
      maxWins: c.maxWins,
      maxLosses: c.maxLosses,
      milestones,
    };
  });
}

function generateTournaments(): EventData[] {
  const seed = getDaySeed();
  const r = seededRng(seed * 11);

  const tourneyNames = [
    { name: 'Warlord Cup', emoji: '🏅', desc: 'Compete for the Warlord title! Top rewards for top warriors.' },
    { name: 'Legends League', emoji: '👑', desc: 'Only the strongest survive. Exclusive legendary rewards!' },
    { name: 'Arena Clash', emoji: '🏟️', desc: 'Battle through the arenas for glory and loot!' },
    { name: 'Conqueror\'s Trial', emoji: '⚔️', desc: 'Prove your worth in endless battles!' },
  ];

  const picked = seededShuffle(tourneyNames, seed * 11).slice(0, 2);
  return picked.map((t, i) => {
    const hours = Math.floor(r() * 96) + 48;
    const milestones: { wins: number; reward: RewardDef }[] = [
      { wins: 3, reward: { type: 'gold', amount: Math.floor(r() * 500) + 300 } },
      { wins: 6, reward: { type: 'cards', amount: Math.floor(r() * 4) + 2, rarity: 'epic' } },
      { wins: 10, reward: { type: 'gems', amount: Math.floor(r() * 30) + 15 } },
      { wins: 15, reward: { type: 'emote' } },
      { wins: 20, reward: { type: 'banner-bg' } },
    ];

    return {
      id: `tourney-${getDaySeed()}-${i}`,
      name: t.name,
      emoji: t.emoji,
      description: t.desc,
      hoursLeft: hours,
      rewards: milestones.map(m => m.reward),
      type: 'tournament' as const,
      maxWins: 20,
      maxLosses: 0,
      milestones,
    };
  });
}

// ── Persistence ──
function getEventProgress(eventId: string): { wins: number; losses: number; claimed: number[]; completed: boolean } {
  try {
    const stored = localStorage.getItem(`event_progress_${eventId}`);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { wins: 0, losses: 0, claimed: [], completed: false };
}

function setEventProgress(eventId: string, progress: { wins: number; losses: number; claimed: number[]; completed: boolean }) {
  localStorage.setItem(`event_progress_${eventId}`, JSON.stringify(progress));
}

// Daily quest persistence
function getDailyQuestProgress(): { date: string; quests: { progress: number; claimed: boolean }[] } {
  try {
    const stored = localStorage.getItem('daily_quest_progress');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), quests: [{ progress: 0, claimed: false }, { progress: 0, claimed: false }, { progress: 0, claimed: false }] };
}

function saveDailyQuestProgress(quests: { progress: number; claimed: boolean }[]) {
  localStorage.setItem('daily_quest_progress', JSON.stringify({ date: getTodayKey(), quests }));
}

// RewardReveal now uses RevealScreen from shop
// ── Format time ──
function fmtHours(h: number) {
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h`;
}

function resolveReward(rewardDef: RewardDef, rng: () => number): RewardItem[] {
  const items: RewardItem[] = [];
  switch (rewardDef.type) {
    case 'gold':
      items.push({ emoji: '💰', name: 'Gold', count: rewardDef.amount || 200, rarity: 'common' });
      break;
    case 'gems':
      items.push({ emoji: '💎', name: 'Gems', count: rewardDef.amount || 10, rarity: 'rare' });
      break;
    case 'cards': {
      const pool = allCards.filter(c => c.rarity === (rewardDef.rarity || 'common'));
      const amt = rewardDef.amount || 3;
      for (let i = 0; i < amt; i++) {
        const card = pool[Math.floor(rng() * pool.length)];
        items.push({ emoji: card.emoji, name: card.name, count: 1, rarity: card.rarity });
      }
      break;
    }
    case 'emote': {
      const unowned = allEmotes.filter(e => !getOwnedEmotes().includes(e.id));
      if (unowned.length > 0) {
        const emote = unowned[Math.floor(rng() * unowned.length)];
        addOwnedEmote(emote.id);
        items.push({ emoji: '😀', name: emote.name, count: 1, rarity: emote.rarity });
      } else {
        items.push({ emoji: '💎', name: 'Gems (no emotes left)', count: 20, rarity: 'rare' });
      }
      break;
    }
    case 'banner-bg': {
      const unowned = allBackgrounds.filter(b => !getOwnedBackgrounds().has(b.id));
      if (unowned.length > 0) {
        const bg = unowned[Math.floor(rng() * unowned.length)];
        addOwnedBackground(bg.id);
        items.push({ emoji: '🖼️', name: bg.name, count: 1, rarity: bg.rarity });
      } else {
        items.push({ emoji: '💎', name: 'Gems (all BGs owned)', count: 30, rarity: 'rare' });
      }
      break;
    }
    case 'banner-emb': {
      const unowned = allEmblems.filter(e => !getOwnedEmblems().has(e.id));
      if (unowned.length > 0) {
        const emb = unowned[Math.floor(rng() * unowned.length)];
        addOwnedEmblem(emb.id);
        items.push({ emoji: '🎭', name: emb.name, count: 1, rarity: emb.rarity });
      } else {
        items.push({ emoji: '💎', name: 'Gems (all emblems owned)', count: 20, rarity: 'rare' });
      }
      break;
    }
  }
  return items;
}

// ── Countdown hook ──
function useCountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

// ── Daily quests config ──
const DAILY_QUESTS = [
  { nameKey: 'events.quest_win_battles', name: 'Win 3 Battles', max: 3, reward: { type: 'gold' as const, amount: 200 }, rewardLabel: '💰 200' },
  { nameKey: 'events.quest_play_cards', name: 'Play 5 Cards', max: 5, reward: { type: 'gold' as const, amount: 100 }, rewardLabel: '💰 100' },
  { nameKey: 'events.quest_destroy_towers', name: 'Destroy 10 Towers', max: 10, reward: { type: 'gems' as const, amount: 5 }, rewardLabel: '💎 5' },
];

// ── Main Component ──
const EventsScreen = () => {
  const { setScreen, profile, setProfile, deck } = useGame();
  const { language } = useSettings();
  const [tab, setTab] = useState<'events' | 'challenges' | 'tournaments'>('events');
  const [rewardPopup, setRewardPopup] = useState<RewardItem[] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const countdown = useCountdownToMidnight();

  const events = useMemo(() => generateEvents(), []);
  const challenges = useMemo(() => generateChallenges(), []);
  const tournaments = useMemo(() => generateTournaments(), []);

  const [questProgress, setQuestProgress] = useState(() => getDailyQuestProgress());
  const [, forceUpdate] = useState(0);

  // Check for completed event battle on mount (returning from battle)
  useEffect(() => {
    const eb = localStorage.getItem('event_battle');
    if (eb) {
      try {
        const parsed = JSON.parse(eb);
        if (parsed.completed) {
          localStorage.removeItem('event_battle');
          forceUpdate(n => n + 1);
          // Refresh quest progress (wins are updated by BattleResult)
          setQuestProgress(getDailyQuestProgress());
        }
      } catch {}
    }
  }, []);

  const startEventBattle = useCallback((event: EventData) => {
    const prog = getEventProgress(event.id);
    if (prog.completed) { toast.info(t('events.already_completed', language)); return; }
    if (event.maxLosses && event.maxLosses > 0 && prog.losses >= event.maxLosses) { toast.error(t('events.too_many_losses', language)); return; }

    // Store event battle context
    localStorage.setItem('event_battle', JSON.stringify({
      eventId: event.id,
      maxWins: event.maxWins || 0,
      maxLosses: event.maxLosses || 0,
      completed: false,
    }));

    // Navigate to actual battle
    setScreen('battle');
  }, [language, setScreen]);

  const claimMilestone = useCallback((event: EventData, milestoneIdx: number) => {
    const prog = getEventProgress(event.id);
    const ms = event.milestones?.[milestoneIdx];
    if (!ms || prog.claimed.includes(milestoneIdx)) return;
    if (prog.wins < ms.wins) { toast.error(`${t('events.win_count', language)} ${ms.wins}!`); return; }

    prog.claimed.push(milestoneIdx);
    setEventProgress(event.id, prog);

    const rng = () => Math.random();
    const resolved = resolveReward(ms.reward, rng);

    // Apply rewards
    resolved.forEach(r => {
      if (r.name === 'Gold' || r.name.includes('Gold')) setProfile(p => ({ ...p, gold: p.gold + r.count }));
      if (r.name === 'Gems' || r.name.includes('Gems')) setProfile(p => ({ ...p, gems: p.gems + r.count }));
      // Cards are handled by addCards via resolveReward
    });

    setRewardPopup(resolved);
    forceUpdate(n => n + 1);
  }, [setProfile]);

  const claimEventReward = useCallback((event: EventData) => {
    const prog = getEventProgress(event.id);
    if (prog.claimed.includes(-1)) { toast.info(t('events.already_completed', language)); return; }
    if (prog.wins < 1) { toast.error(`${t('events.win_count', language)} 1!`); return; }

    prog.claimed.push(-1);
    setEventProgress(event.id, prog);

    const rng = () => Math.random();
    const allRewards: RewardItem[] = [];
    event.rewards.forEach(rd => allRewards.push(...resolveReward(rd, rng)));

    allRewards.forEach(r => {
      if (r.name === 'Gold' || r.name.includes('Gold')) setProfile(p => ({ ...p, gold: p.gold + r.count }));
      if (r.name === 'Gems' || r.name.includes('Gems')) setProfile(p => ({ ...p, gems: p.gems + r.count }));
    });

    setRewardPopup(allRewards);
    forceUpdate(n => n + 1);
  }, [setProfile]);

  const claimQuest = useCallback((idx: number) => {
    const quests = [...questProgress.quests];
    if (quests[idx].claimed || quests[idx].progress < DAILY_QUESTS[idx].max) return;
    quests[idx].claimed = true;
    setQuestProgress({ ...questProgress, quests });
    saveDailyQuestProgress(quests);

    const q = DAILY_QUESTS[idx];
    const rng = () => Math.random();
    const resolved = resolveReward(q.reward, rng);
    resolved.forEach(r => {
      if (r.name === 'Gold') setProfile(p => ({ ...p, gold: p.gold + r.count }));
      if (r.name === 'Gems') setProfile(p => ({ ...p, gems: p.gems + r.count }));
    });
    setRewardPopup(resolved);
  }, [questProgress, setProfile]);

  // Simulate quest progress (auto-increment for testing)
  const addQuestProgress = useCallback((idx: number) => {
    const quests = [...questProgress.quests];
    if (quests[idx].progress < DAILY_QUESTS[idx].max) {
      quests[idx].progress += 1;
      setQuestProgress({ ...questProgress, quests });
      saveDailyQuestProgress(quests);
    }
  }, [questProgress]);

  const joinChallenge = useCallback((event: EventData) => {
    if (event.entryFee) {
      const currency = event.entryFee.currency === 'gold' ? profile.gold : profile.gems;
      if (currency < event.entryFee.amount) {
        toast.error(`${t('shop.not_enough', language)} ${t(`shop.${event.entryFee.currency}`, language)}!`);
        return;
      }
      setProfile(p => event.entryFee!.currency === 'gold'
        ? { ...p, gold: p.gold - event.entryFee!.amount }
        : { ...p, gems: p.gems - event.entryFee!.amount }
      );
    }
    const prog = getEventProgress(event.id);
    if (!prog.completed) {
      setSelectedEvent(event);
    }
  }, [profile, setProfile]);

  const rewardLabel = (rd: RewardDef) => {
    switch (rd.type) {
      case 'gold': return `💰 ${rd.amount}`;
      case 'gems': return `💎 ${rd.amount}`;
      case 'cards': return `🃏 ${rd.amount} ${tRarity(rd.rarity || 'common', language)}`;
      case 'emote': return t('events.exclusive_emote', language);
      case 'banner-bg': return t('events.exclusive_bg', language);
      case 'banner-emb': return t('events.exclusive_emblem', language);
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Reward popup */}
      <AnimatePresence>
        {rewardPopup && <RevealScreen items={rewardPopup} onClose={() => setRewardPopup(null)} lang={language} />}
      </AnimatePresence>

      {/* Event detail modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/85 flex items-end justify-center" onClick={() => setSelectedEvent(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 20 }} onClick={e => e.stopPropagation()} className="w-full max-w-md bg-card border-t border-border rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedEvent.emoji}</span>
                  <div>
                    <h3 className="font-display font-bold text-foreground text-sm">{selectedEvent.name}</h3>
                    <p className="text-[9px] text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEvent(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="bg-muted rounded-lg px-2 py-1 text-center">
                  <div className="text-[8px] text-muted-foreground">{t('events.time_left', language)}</div>
                  <div className="text-xs font-bold text-primary">{fmtHours(selectedEvent.hoursLeft)}</div>
                </div>
                {(() => {
                  const prog = getEventProgress(selectedEvent.id);
                  return (
                    <>
                      <div className="bg-muted rounded-lg px-2 py-1 text-center">
                        <div className="text-[8px] text-muted-foreground">{t('events.wins', language)}</div>
                        <div className="text-xs font-bold text-hp-green">{prog.wins}</div>
                      </div>
                      {selectedEvent.maxLosses && selectedEvent.maxLosses > 0 && (
                        <div className="bg-muted rounded-lg px-2 py-1 text-center">
                          <div className="text-[8px] text-muted-foreground">{t('events.losses', language)}</div>
                          <div className="text-xs font-bold text-accent">{prog.losses}/{selectedEvent.maxLosses}</div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Milestones */}
              {selectedEvent.milestones && (
                <div className="space-y-1.5 mb-3">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">{t('events.milestones', language)}</div>
                  {selectedEvent.milestones.map((ms, idx) => {
                    const prog = getEventProgress(selectedEvent.id);
                    const reached = prog.wins >= ms.wins;
                    const claimed = prog.claimed.includes(idx);
                    return (
                      <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg border ${reached ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/5'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${reached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {ms.wins}
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-bold text-foreground">{ms.wins} {ms.wins > 1 ? t('events.wins_plural', language) : t('events.win_count', language)}</div>
                          <div className="text-[8px] text-muted-foreground">{rewardLabel(ms.reward)}</div>
                        </div>
                        {claimed ? (
                          <span className="text-[8px] text-hp-green font-bold">{t('events.claimed', language)}</span>
                        ) : reached ? (
                          <button onClick={() => claimMilestone(selectedEvent, idx)} className="px-2 py-1 bg-primary text-primary-foreground rounded-lg text-[9px] font-bold">{t('events.claim_btn', language)}</button>
                        ) : (
                          <span className="text-[8px] text-muted-foreground">🔒</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Battle button */}
              {(() => {
                const prog = getEventProgress(selectedEvent.id);
                return !prog.completed ? (
                  <button onClick={() => startEventBattle(selectedEvent)} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase">
                    {t('events.battle', language)}
                  </button>
                ) : (
                  <div className="text-center py-2 text-[10px] text-muted-foreground font-bold">{t('events.completed', language)}</div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">{t('events.title', language)}</h2>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />{t('events.resets', language)}: {countdown}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        {(['events', 'challenges', 'tournaments'] as const).map(tabKey => {
          const tabLabelMap: Record<string, string> = { events: t('events.events', language), challenges: t('events.challenges', language), tournaments: t('events.tournaments', language) };
          return (
          <button key={tabKey} onClick={() => setTab(tabKey)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${tab === tabKey ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {tabLabelMap[tabKey]}
          </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'events' && (
          <div className="p-3 space-y-2">
            {/* Daily Quests */}
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs font-display font-bold text-foreground mb-2">{t('events.daily_quests', language)}</div>
              {DAILY_QUESTS.map((q, i) => {
                const qp = questProgress.quests[i];
                const done = qp.progress >= q.max;
                return (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-t border-border/30">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-foreground">{t(q.nameKey, language)}</div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(qp.progress / q.max) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{qp.progress}/{q.max}</span>
                    {qp.claimed ? (
                      <span className="text-[8px] text-hp-green font-bold">✓</span>
                    ) : done ? (
                      <button onClick={() => claimQuest(i)} className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-[8px] font-bold animate-pulse">{t('events.claim_btn', language)}</button>
                    ) : (
                      <span className="text-[8px] text-muted-foreground">🔒</span>
                    )}
                    <span className="text-[9px] font-bold text-primary">{q.rewardLabel}</span>
                  </div>
                );
              })}
            </div>

            {/* Timed events */}
            {events.map(event => {
              const prog = getEventProgress(event.id);
              const claimed = prog.claimed.includes(-1);
              return (
                <motion.button key={event.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedEvent(event)} className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
                  <span className="text-2xl">{event.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-bold text-foreground">{event.name}</div>
                    <div className="text-[9px] text-muted-foreground">{event.description}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {event.rewards.slice(0, 3).map((r, ri) => (
                        <span key={ri} className="text-[7px] bg-muted px-1 py-0.5 rounded text-muted-foreground">{rewardLabel(r)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[8px] text-primary font-bold">{fmtHours(event.hoursLeft)}</div>
                    {prog.wins > 0 && <div className="text-[8px] text-hp-green">{prog.wins}W</div>}
                    {claimed && <div className="text-[7px] text-hp-green font-bold">✓</div>}
                    <ChevronRight className="w-3 h-3 text-muted-foreground mt-0.5" />
                  </div>
                </motion.button>
              );
            })}

            {/* Claim all event rewards */}
            {events.some(e => { const p = getEventProgress(e.id); return p.wins >= 1 && !p.claimed.includes(-1); }) && (
              <button onClick={() => {
                events.forEach(e => {
                  const p = getEventProgress(e.id);
                  if (p.wins >= 1 && !p.claimed.includes(-1)) claimEventReward(e);
                });
              }} className="w-full py-2 bg-hp-green/20 text-hp-green rounded-xl text-[10px] font-bold border border-hp-green/30">
                {t('events.claim_available', language)}
              </button>
            )}
          </div>
        )}

        {tab === 'challenges' && (
          <div className="p-3 space-y-2">
            {challenges.map(c => {
              const prog = getEventProgress(c.id);
              return (
                <motion.button key={c.id} whileTap={{ scale: 0.98 }} onClick={() => {
                  if (!prog.completed && !prog.wins && !prog.losses) {
                    joinChallenge(c);
                  } else {
                    setSelectedEvent(c);
                  }
                }} className={`w-full bg-card border rounded-xl p-3 flex items-center gap-3 transition-colors ${prog.completed ? 'border-hp-green/30' : 'border-border hover:border-primary/30'}`}>
                  <span className="text-2xl">{c.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-bold text-foreground">{c.name}</div>
                    <div className="text-[9px] text-muted-foreground">{c.description}</div>
                    {(prog.wins > 0 || prog.losses > 0) && (
                      <div className="text-[8px] mt-0.5">
                        <span className="text-hp-green">{prog.wins}W</span>
                        <span className="text-muted-foreground mx-1">-</span>
                        <span className="text-accent">{prog.losses}L</span>
                        {prog.completed && <span className="text-hp-green ml-1 font-bold">{t('events.done', language)}</span>}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[8px] text-muted-foreground">{fmtHours(c.hoursLeft)}</div>
                    <div className={`text-[9px] font-bold mt-0.5 ${!c.entryFee ? 'text-hp-green' : 'text-primary'}`}>
                      {!c.entryFee ? t('events.free', language) : `💎 ${c.entryFee.amount}`}
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground mt-0.5" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {tab === 'tournaments' && (
          <div className="p-3 space-y-2">
            {tournaments.map(tourney => {
              const prog = getEventProgress(tourney.id);
              return (
                <motion.button key={tourney.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedEvent(tourney)} className={`w-full bg-gradient-to-r from-card to-[hsl(220,20%,14%)] border rounded-xl p-3 flex items-center gap-3 transition-colors ${prog.completed ? 'border-hp-green/30' : 'border-primary/30 hover:border-primary/50'}`}>
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <span className="text-xl">{tourney.emoji}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-bold text-foreground">{tourney.name}</div>
                    <div className="text-[9px] text-muted-foreground">{tourney.description}</div>
                    {prog.wins > 0 && (
                      <div className="text-[8px] text-hp-green mt-0.5">{prog.wins} {t('events.wins_plural', language).toLowerCase()}</div>
                    )}
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {tourney.milestones?.slice(0, 3).map((ms, mi) => (
                        <span key={mi} className="text-[7px] bg-primary/10 border border-primary/20 px-1 py-0.5 rounded text-primary">{ms.wins}W: {rewardLabel(ms.reward)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[8px] text-primary font-bold">{fmtHours(tourney.hoursLeft)}</div>
                    <div className="text-[9px] text-hp-green font-bold mt-0.5">{t('events.free', language)}</div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground mt-0.5" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav active="events" setScreen={setScreen} />
    </div>
  );
};

export default EventsScreen;
