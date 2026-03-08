import { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getArenaForTrophies, trophyRoadRewards, getXpForLevel, getLevelReward } from '@/data/cards';
import CardComponent from './CardComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Crown, Map, Star, Mail, Settings } from 'lucide-react';
import splashImage from '@/assets/world-war-royale-splash.png';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from './BottomNav';
import BattleBannerDisplay from './BattleBannerDisplay';
import { getPlayerBanner } from '@/data/banners';
import ArenaPreview from './ArenaPreview';
import RevealScreen, { RevealItem } from './RevealScreen';
import { updateSfxSettings, playCoinCollect } from '@/lib/sfx';
import { t, tArena } from '@/lib/i18n';

const MainMenu = () => {
  const { profile, deck, chests, setScreen, setActiveTab, setProfile } = useGame();
  const { signOut, user } = useAuth();
  const { sfxEnabled, sfxVolume, language } = useSettings();
  const arena = getArenaForTrophies(profile.trophies);
  const playerBanner = getPlayerBanner();

  // Sync SFX settings to the audio module
  useEffect(() => {
    updateSfxSettings(sfxEnabled, sfxVolume);
  }, [sfxEnabled, sfxVolume]);
  const [unreadMail, setUnreadMail] = useState(0);
  const [unclaimedTrophy, setUnclaimedTrophy] = useState(0);
  const [unclaimedWarPass, setUnclaimedWarPass] = useState(0);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [revealItems, setRevealItems] = useState<RevealItem[] | null>(null);
  const [claimedLevels, setClaimedLevels] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('claimed_level_rewards') || '[]')); }
    catch { return new Set(); }
  });

  const xpForCurrentLevel = getXpForLevel(profile.level);
  const xpProgress = Math.min(100, (profile.xp / xpForCurrentLevel) * 100);

  // Check unclaimed trophy road rewards
  useEffect(() => {
    const saved = localStorage.getItem('trophy_road_claimed');
    const claimed = new Set<number>(saved ? JSON.parse(saved) : []);
    const count = trophyRoadRewards.filter(r => r.trophies <= profile.trophies && !claimed.has(r.trophies)).length;
    setUnclaimedTrophy(count);
  }, [profile.trophies]);

  // Check unclaimed war pass rewards
  useEffect(() => {
    const saved = localStorage.getItem('war_pass_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const crowns = data.crowns || 0;
        const claimedFree = new Set(data.claimedFree || []);
        const claimedPaid = new Set(data.claimedPaid || []);
        const hasPaid = data.hasPaid || false;
        // Count unclaimed tiers where crowns are sufficient
        const WAR_PASS_TIERS = [2,5,8,11,15,19,23,28,33,38,43,49,55,61,68,75,82,90,98,106,114,122,131,140,149,158,168,178,188,198,204,210,216,222,228,234,240,246,252,258,262,266,270,274,278,281,284,287,290,293,295,296,297,298,299,299,299,300,300,300];
        let count = 0;
        WAR_PASS_TIERS.forEach((needed, i) => {
          const tier = i + 1;
          if (crowns >= needed && !claimedFree.has(tier)) count++;
          if (crowns >= needed && hasPaid && !claimedPaid.has(tier)) count++;
        });
        setUnclaimedWarPass(count);
      } catch {}
    }
  }, []);

  // Check unread mail count
  useEffect(() => {
    if (!user) return;
    const checkMail = async () => {
      const { data } = await supabase
        .from('mailbox_messages')
        .select('id, is_read, is_claimed, reward_gold, reward_gems')
        .or(`recipient_user_id.eq.${user.id},recipient_user_id.is.null`);
      if (data) {
        const count = data.filter(m => !m.is_read || (!m.is_claimed && (m.reward_gold > 0 || m.reward_gems > 0))).length;
        setUnreadMail(count);
      }
    };
    checkMail();
    const channel = supabase
      .channel('mailbox-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mailbox_messages' }, () => {
        checkMail();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={splashImage} alt="World War Royale" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,8%,0.7)] via-[hsl(220,20%,10%,0.85)] to-[hsl(220,25%,8%,0.95)]" />
      </div>

      {/* Top bar - Level, Name, Trophies, Resources */}
      <div className="relative z-10 bg-[hsl(220,25%,10%,0.95)] border-b border-border">
        {/* Player banner + Resources row */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          <button onClick={() => setScreen('profile')} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <BattleBannerDisplay banner={playerBanner} name={profile.name} trophies={profile.trophies} size="sm" />
          </button>
          {/* Resources + Settings */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 bg-[hsl(220,15%,16%)] pl-1.5 pr-2.5 py-1 rounded-full border border-border">
                <span className="text-xs">💰</span>
                <span className="text-[10px] font-bold text-foreground">{profile.gold.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 bg-[hsl(220,15%,16%)] pl-1.5 pr-2.5 py-1 rounded-full border border-border">
                <span className="text-xs">💎</span>
                <span className="text-[10px] font-bold text-foreground">{profile.gems}</span>
              </div>
            </div>
            <button onClick={() => setScreen('settings')} className="w-7 h-7 rounded-full bg-[hsl(220,15%,16%)] border border-border flex items-center justify-center hover:bg-[hsl(220,15%,22%)] transition-colors">
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Trophy/Arena + Level display */}
      <div className="relative z-10 flex items-center justify-between px-3 py-2 bg-[hsl(220,20%,11%,0.8)]">
        <div className="flex items-center gap-2">
          <div className="trophy-badge">
            <Trophy className="w-3.5 h-3.5" />
            <span>{profile.trophies.toLocaleString()}</span>
          </div>
          {/* Level badge - right of trophies */}
          <button onClick={() => setShowLevelModal(true)} className="flex items-center gap-1 bg-[hsl(220,15%,16%)] border border-primary/30 rounded-full pl-1 pr-2 py-0.5 hover:border-primary/60 transition-colors">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[8px] font-black text-primary">{profile.level}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[7px] font-bold text-foreground leading-none">{t('menu.lvl', language)}</span>
              <div className="w-8 h-1 rounded-full bg-muted mt-0.5 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </button>
        </div>
        <div className="text-[10px] text-muted-foreground">
          <span className="text-foreground font-semibold">{arena.emoji} {tArena(arena.name, language)}</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Arena / Events buttons row */}
        <div className="flex gap-1.5 px-3 py-2">
          <button onClick={() => { setActiveTab('trophy-road'); setScreen('trophy-road'); }} className="flex-1 bg-[hsl(220,15%,16%)] border border-border rounded-lg py-2 px-2 flex items-center gap-2 hover:bg-[hsl(220,15%,20%)] transition-colors relative">
            <Map className="w-4 h-4 text-primary" />
            <div className="text-left">
              <div className="text-[9px] font-bold text-foreground">{t('menu.trophy_road', language)}</div>
              <div className="text-[7px] text-muted-foreground">{t('menu.arena', language)} {arena.id}</div>
            </div>
            {unclaimedTrophy > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                <span className="text-[7px] font-black text-accent-foreground">{unclaimedTrophy > 9 ? '9+' : unclaimedTrophy}</span>
              </div>
            )}
          </button>
          <button onClick={() => setScreen('events')} className="flex-1 bg-[hsl(220,15%,16%)] border border-border rounded-lg py-2 px-2 flex items-center gap-2 hover:bg-[hsl(220,15%,20%)] transition-colors">
            <Star className="w-4 h-4 text-legendary" />
            <div className="text-left">
              <div className="text-[9px] font-bold text-foreground">{t('menu.events', language)}</div>
              <div className="text-[7px] text-muted-foreground">{t('menu.special_challenge', language)}</div>
            </div>
          </button>
        </div>
        <div className="flex gap-1.5 px-3 pb-2">
          <button onClick={() => setScreen('mailbox')} className="flex-1 bg-[hsl(220,15%,16%)] border border-border rounded-lg py-2 px-2 flex items-center gap-2 hover:bg-[hsl(220,15%,20%)] transition-colors relative">
            <Mail className="w-4 h-4 text-primary" />
            <div className="text-left">
              <div className="text-[9px] font-bold text-foreground">{t('menu.mailbox', language)}</div>
              <div className="text-[7px] text-muted-foreground">{t('menu.messages', language)}</div>
            </div>
            {unreadMail > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                <span className="text-[7px] font-black text-accent-foreground">{unreadMail > 9 ? '9+' : unreadMail}</span>
              </div>
            )}
          </button>
          <button onClick={() => setScreen('war-pass')} className="flex-1 bg-gradient-to-r from-[hsl(280,30%,16%)] to-[hsl(320,30%,16%)] border border-[hsl(280,20%,25%)] rounded-lg py-2 px-2 flex items-center gap-2 hover:from-[hsl(280,30%,20%)] hover:to-[hsl(320,30%,20%)] transition-colors relative">
            <Crown className="w-4 h-4 text-[hsl(280,60%,65%)]" />
            <div className="text-left">
              <div className="text-[9px] font-bold text-foreground">{t('menu.war_pass', language)}</div>
              <div className="text-[7px] text-muted-foreground">{t('menu.earn_crowns', language)}</div>
            </div>
            {unclaimedWarPass > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                <span className="text-[7px] font-black text-accent-foreground">{unclaimedWarPass > 9 ? '9+' : unclaimedWarPass}</span>
              </div>
            )}
          </button>
        </div>

        {/* Battle Button - Center piece */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="mb-3"
          >
            <ArenaPreview arenaId={arena.id} arenaName={arena.name} arenaEmoji={arena.emoji} />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setScreen('battle')}
            className="btn-battle text-lg flex items-center gap-2"
          >
            <Swords className="w-5 h-5" />
            {t('menu.battle', language)}
          </motion.button>

          {/* 1v1 / 2v2 toggle */}
          <div className="flex gap-2 mt-3">
            <button className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-[10px] font-bold text-primary">1v1</button>
            <button className="px-4 py-1.5 rounded-full bg-secondary text-[10px] font-bold text-muted-foreground border border-border">2v2</button>
            <button className="px-4 py-1.5 rounded-full bg-secondary text-[10px] font-bold text-muted-foreground border border-border">{t('menu.party', language)}</button>
          </div>
        </div>

        {/* Current deck preview */}
        <div className="px-3 mb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">{t('menu.current_deck', language)}</span>
            <button onClick={() => { setActiveTab('cards'); setScreen('deck'); }} className="text-[9px] text-primary font-bold">{t('menu.edit_deck', language)}</button>
          </div>
          <div className="grid grid-cols-8 gap-0.5">
            {deck.slice(0, 8).map((card) => (
              <CardComponent key={card.id} card={card} size="xs" showElixir={false} />
            ))}
          </div>
        </div>

      </div>

      {/* Level rewards modal */}
      <AnimatePresence>
        {showLevelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[hsl(0,0%,0%,0.85)] flex flex-col"
            onClick={() => setShowLevelModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="flex-1 flex flex-col max-w-md mx-auto w-full"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[hsl(220,25%,12%)] border-b border-border">
                <button onClick={() => setShowLevelModal(false)} className="text-muted-foreground text-sm font-bold">✕</button>
                <h3 className="font-display font-bold text-foreground text-sm">{t('menu.level_rewards', language)}</h3>
                <div className="text-[10px] font-bold text-primary">Lvl {profile.level}</div>
              </div>

              {/* XP bar */}
              <div className="px-4 py-3 bg-[hsl(220,20%,11%)] border-b border-border">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">{t('menu.xp_progress', language)}</span>
                  <span className="font-bold text-foreground">{profile.xp} / {xpForCurrentLevel}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>

              {/* Reward list */}
              <div className="flex-1 overflow-y-auto bg-[hsl(220,20%,10%)]">
                {Array.from({ length: Math.max(profile.level + 10, 30) }, (_, i) => i + 1).map(lvl => {
                  const reward = getLevelReward(lvl);
                  const claimed = claimedLevels.has(lvl);
                  const canClaim = !claimed && lvl <= profile.level;
                  const isFuture = lvl > profile.level;

                  return (
                    <div
                      key={lvl}
                      className={`flex items-center gap-3 px-4 py-2.5 border-b border-border/50 ${
                        lvl === profile.level ? 'bg-primary/5' : ''
                      } ${isFuture ? 'opacity-40' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        claimed ? 'bg-muted/50' :
                        canClaim ? 'bg-primary/20 border-2 border-primary/50 animate-pulse' :
                        'bg-muted/20'
                      }`}>
                        <span className="text-[10px] font-black text-foreground">{lvl}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{reward.emoji}</span>
                          <span className={`text-[10px] font-bold ${claimed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{reward.name}</span>
                        </div>
                      </div>
                      {claimed && <span className="text-[8px] text-muted-foreground font-bold">✅</span>}
                      {canClaim && (
                        <button
                          onClick={() => {
                            playCoinCollect();
                            const items: RevealItem[] = [];
                            if (reward.type === 'gold') {
                              setProfile(p => ({ ...p, gold: p.gold + reward.amount }));
                              items.push({ emoji: '💰', name: 'Gold', count: reward.amount, rarity: 'common' });
                            } else if (reward.type === 'gems') {
                              setProfile(p => ({ ...p, gems: p.gems + reward.amount }));
                              items.push({ emoji: '💎', name: 'Gems', count: reward.amount, rarity: 'epic' });
                            } else if (reward.type === 'cards') {
                              items.push({ emoji: '🃏', name: 'Random Cards', count: reward.amount, rarity: 'rare' });
                            } else if (reward.type === 'chest') {
                              items.push({ emoji: reward.emoji, name: reward.name, count: 1, rarity: 'legendary' });
                            }
                            const next = new Set(claimedLevels);
                            next.add(lvl);
                            setClaimedLevels(next);
                            localStorage.setItem('claimed_level_rewards', JSON.stringify([...next]));
                            setRevealItems(items);
                            setShowLevelModal(false);
                          }}
                          className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full text-[9px] font-bold text-primary animate-pulse"
                        >
                          {t('menu.claim', language)}
                        </button>
                      )}
                      {isFuture && <span className="text-[8px] text-muted-foreground">🔒</span>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal screen */}
      <AnimatePresence>
        {revealItems && (
          <RevealScreen
            items={revealItems}
            title="⬆️ Level Reward!"
            subtitle="You received:"
            onClose={() => setRevealItems(null)}
          />
        )}
      </AnimatePresence>

      {/* Bottom navigation - CR style */}
      <BottomNav active="battle" setScreen={setScreen} />
    </div>
  );
};

export default MainMenu;
