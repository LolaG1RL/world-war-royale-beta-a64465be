import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { t } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { BottomNav } from './BottomNav';
import { allCards } from '@/data/cards';
import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, UserPlus, Search, Shield, Swords as SwordsIcon, Plus, Trophy, ChevronLeft, ChevronRight, Loader2, X, Check, UserMinus, ArrowUp, Repeat, Gift } from 'lucide-react';
import ClanFlag, { CLAN_ICONS, BANNER_SHAPES } from './ClanFlag';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getCardEntry, addCards, removeCards, canRequest, setRequestCooldown, getRequestTimeLeft, getSkipCooldownCost, skipRequestCooldown, DONATION_LIMITS, getDonationsToday, recordDonation } from '@/data/cardInventory';
import { allEmotes, getEquippedEmotes } from '@/data/emotes';
import { countryCodeToFlag } from '@/lib/countryFlags';
import { allEmblems, getPlayerBanner } from '@/data/banners';
import RevealScreen, { RevealItem } from './RevealScreen';
import { isContentSafe } from '@/lib/contentFilter';

const BANNER_COLORS = [
  '#b91c1c', '#dc2626', '#ef4444',
  '#c2410c', '#ea580c', '#f97316',
  '#a16207', '#ca8a04', '#eab308',
  '#15803d', '#16a34a', '#22c55e',
  '#0e7490', '#0891b2', '#06b6d4',
  '#1d4ed8', '#2563eb', '#3b82f6',
  '#7c3aed', '#8b5cf6', '#a78bfa',
  '#be185d', '#db2777', '#ec4899',
  '#1e293b', '#334155', '#475569',
  '#18181b', '#fafaf9', '#78716c',
];

const ICON_COLORS = [
  '#ffffff', '#fef08a', '#fde047', '#facc15',
  '#f97316', '#ef4444', '#ec4899', '#a78bfa',
  '#60a5fa', '#22d3ee', '#34d399', '#a3e635',
  '#1e293b', '#000000',
];

interface LeaderboardEntry {
  user_id: string;
  trophies: number;
  level: number;
  wins: number;
  username?: string;
  player_tag?: string;
  country?: string;
  equipped_emblem?: string;
}

// Top 100 worldwide rewards (rank 1 = best)
const TOP_100_REWARDS: { rank: number; gold: number; gems: number; exclusiveBanner?: string; exclusiveEmote?: string; label: string }[] = [
  { rank: 1, gold: 100000, gems: 5000, exclusiveBanner: '🏆 Champion Banner', exclusiveEmote: '👑 Champion Emote', label: '🥇 #1 World Champion' },
  { rank: 2, gold: 75000, gems: 3500, exclusiveBanner: '🥈 Silver Banner', exclusiveEmote: '⚔️ Elite Emote', label: '🥈 #2' },
  { rank: 3, gold: 50000, gems: 2500, exclusiveBanner: '🥉 Bronze Banner', exclusiveEmote: '🔥 Fire Emote', label: '🥉 #3' },
  ...Array.from({ length: 7 }, (_, i) => ({
    rank: i + 4, gold: 30000 - i * 2000, gems: 1500 - i * 100, exclusiveBanner: '⭐ Top 10 Banner', label: `#${i + 4}`
  })),
  ...Array.from({ length: 15 }, (_, i) => ({
    rank: i + 11, gold: 15000 - i * 500, gems: 800 - i * 20, label: `#${i + 11}`
  })),
  ...Array.from({ length: 25 }, (_, i) => ({
    rank: i + 26, gold: 8000 - i * 100, gems: 400 - i * 5, label: `#${i + 26}`
  })),
  ...Array.from({ length: 49 }, (_, i) => ({
    rank: i + 51, gold: 5000 - i * 50, gems: 200 - i * 2, label: `#${i + 51}`
  })),
];

// Top 10 local rewards
const TOP_10_LOCAL_REWARDS = [
  { rank: 1, gold: 25000, gems: 1000, exclusiveBanner: '🏅 National Champion Banner', label: '🥇 #1 National' },
  { rank: 2, gold: 18000, gems: 700, label: '🥈 #2' },
  { rank: 3, gold: 12000, gems: 500, label: '🥉 #3' },
  ...Array.from({ length: 7 }, (_, i) => ({
    rank: i + 4, gold: 8000 - i * 500, gems: 300 - i * 20, label: `#${i + 4}`
  })),
];

interface ClanRow {
  id: string;
  name: string;
  tag: string;
  description: string;
  banner_color: string;
  banner_shape: string;
  icon_id: string;
  icon_color: string;
  max_members: number;
  created_by: string;
  member_count?: number;
}

interface FriendRow {
  id: string;
  user_id: string;
  friend_user_id: string;
  status: string;
  friend_username?: string;
  friend_tag?: string;
  friend_trophies?: number;
}

const SocialScreen = () => {
  const { setScreen, clan, profile, setClan, setProfile, deck } = useGame();
  const { language } = useSettings();
  const { user, playerTag } = useAuth();
  const T = (key: string) => t(key, language);
  const [tab, setTab] = useState<'clan' | 'friends' | 'leaderboard'>('clan');
  const [showCreateClan, setShowCreateClan] = useState(false);
  const [clanName, setClanName] = useState('');
  const [clanDescription, setClanDescription] = useState('');
  const [bannerColor, setBannerColor] = useState(BANNER_COLORS[5]);
  const [bannerShape, setBannerShape] = useState(BANNER_SHAPES[0].id);
  const [iconId, setIconId] = useState(CLAN_ICONS[0].id);
  const [iconColor, setIconColor] = useState(ICON_COLORS[0]);
  const [customizeStep, setCustomizeStep] = useState<'info' | 'flag'>('info');

  // Search clans
  const [searchingClans, setSearchingClans] = useState(false);
  const [clanSearchQuery, setClanSearchQuery] = useState('');
  const [clanSearchResults, setClanSearchResults] = useState<ClanRow[]>([]);
  const [showClanSearch, setShowClanSearch] = useState(false);
  const [joiningClan, setJoiningClan] = useState<string | null>(null);

  // Friends
  const [friendTag, setFriendTag] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Global leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [localLeaderboard, setLocalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [globalSubTab, setGlobalSubTab] = useState<'local' | 'worldwide' | 'top100'>('worldwide');
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [userCountryCode, setUserCountryCode] = useState<string | null>(null);
  const [myWorldRank, setMyWorldRank] = useState<number | null>(null);
  const [myLocalRank, setMyLocalRank] = useState<number | null>(null);
  const [showRewardsPanel, setShowRewardsPanel] = useState(false);
  const [seasonEndReveal, setSeasonEndReveal] = useState<RevealItem[] | null>(null);

  // Helper: get emblem emoji by id
  const getEmblemEmoji = (id?: string) => {
    const emb = allEmblems.find(e => e.id === (id || 'emb-shield'));
    return emb?.emoji || '🛡️';
  };

  // Check & distribute season-end rewards once
  useEffect(() => {
    if (!user) return;
    const seasonKey = 'season_rewards_claimed_v1';
    if (localStorage.getItem(seasonKey)) return;

    const worldRank = parseInt(localStorage.getItem('my_world_rank') || '0');
    const localRank = parseInt(localStorage.getItem('my_local_rank') || '0');

    const items: RevealItem[] = [];
    let goldTotal = 0;
    let gemsTotal = 0;

    // World rank rewards
    if (worldRank > 0 && worldRank <= 100) {
      const reward = TOP_100_REWARDS.find(r => r.rank === worldRank);
      if (reward) {
        goldTotal += reward.gold;
        gemsTotal += reward.gems;
        items.push({ emoji: '🌍', name: `${T('social.worldwide')} #${worldRank}`, count: 1, rarity: worldRank <= 3 ? 'legendary' : worldRank <= 10 ? 'epic' : 'rare' });
        if (reward.exclusiveBanner) items.push({ emoji: '🏴', name: reward.exclusiveBanner, count: 1, rarity: 'legendary' });
        if (reward.exclusiveEmote) items.push({ emoji: '😀', name: reward.exclusiveEmote, count: 1, rarity: 'epic' });
      }
    }

    // Local rank rewards
    if (localRank > 0 && localRank <= 10) {
      const reward = TOP_10_LOCAL_REWARDS.find(r => r.rank === localRank);
      if (reward) {
        goldTotal += reward.gold;
        gemsTotal += reward.gems;
        items.push({ emoji: '🏠', name: `${T('social.local')} #${localRank}`, count: 1, rarity: localRank <= 3 ? 'legendary' : 'epic' });
        if (reward.exclusiveBanner) items.push({ emoji: '🏴', name: reward.exclusiveBanner, count: 1, rarity: 'legendary' });
      }
    }

    if (items.length > 0) {
      if (goldTotal > 0) items.push({ emoji: '💰', name: T('shop.gold'), count: goldTotal, rarity: 'common' });
      if (gemsTotal > 0) items.push({ emoji: '💎', name: T('shop.gems'), count: gemsTotal, rarity: 'rare' });
      setProfile(prev => ({ ...prev, gold: prev.gold + goldTotal, gems: prev.gems + gemsTotal }));
      setSeasonEndReveal(items);
      localStorage.setItem(seasonKey, 'true');
    }
  }, [user]);

  // Load user's clan from DB on mount
  useEffect(() => {
    if (!user) return;
    const loadClan = async () => {
      const { data: membership } = await supabase
        .from('clan_members')
        .select('clan_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership) {
        const { data: clanData } = await supabase
          .from('clans')
          .select('*')
          .eq('id', membership.clan_id)
          .maybeSingle();

        if (clanData) {
          // Count members
          const { count } = await supabase
            .from('clan_members')
            .select('*', { count: 'exact', head: true })
            .eq('clan_id', clanData.id);

          setClan({
            name: clanData.name,
            tag: clanData.tag,
            members: count || 1,
            maxMembers: clanData.max_members,
            trophies: profile.trophies,
            badge: clanData.icon_id,
            description: clanData.description,
            donations: 0,
            bannerColor: clanData.banner_color,
            bannerShape: clanData.banner_shape,
            iconId: clanData.icon_id,
            iconColor: clanData.icon_color,
          });
        }
      }
    };
    loadClan();
  }, [user]);

  // Search clans
  const searchClans = useCallback(async () => {
    setSearchingClans(true);
    let query = supabase.from('clans').select('*');
    if (clanSearchQuery.trim()) {
      query = query.ilike('name', `%${clanSearchQuery.trim()}%`);
    }
    const { data } = await query.limit(20);
    setClanSearchResults((data as ClanRow[]) || []);
    setSearchingClans(false);
  }, [clanSearchQuery]);

  // Join clan
  const joinClan = async (clanRow: ClanRow) => {
    if (!user) return;
    setJoiningClan(clanRow.id);
    const { error } = await supabase.from('clan_members').insert({
      clan_id: clanRow.id,
      user_id: user.id,
      role: 'member',
    });
    if (error) {
      if (error.code === '23505') toast.error(T('social.toast_already_in_clan'));
      else toast.error(error.message);
    } else {
      const { count } = await supabase
        .from('clan_members')
        .select('*', { count: 'exact', head: true })
        .eq('clan_id', clanRow.id);

      setClan({
        name: clanRow.name,
        tag: clanRow.tag,
        members: count || 1,
        maxMembers: clanRow.max_members,
        trophies: profile.trophies,
        badge: clanRow.icon_id,
        description: clanRow.description,
        donations: 0,
        bannerColor: clanRow.banner_color,
        bannerShape: clanRow.banner_shape,
        iconId: clanRow.icon_id,
        iconColor: clanRow.icon_color,
      });
      setShowClanSearch(false);
      toast.success(`${T('social.toast_joined')} ${clanRow.name}!`);
    }
    setJoiningClan(null);
  };

  // Create clan (save to DB) - with content safety
  const handleCreateClan = async () => {
    if (!clanName.trim() || clanName.length < 3 || !user) return;
    if (profile.gems < 100) return;

    // Content safety check
    if (!isContentSafe(clanName) || !isContentSafe(clanDescription)) {
      toast.error(t('social.inappropriate_content', language));
      return;
    }

    const tag = `#${clanName.trim().substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 9000 + 1000)}`;

    const { data: newClan, error } = await supabase.from('clans').insert({
      name: clanName.trim(),
      tag,
      description: clanDescription.trim() || 'A new clan ready for war!',
      banner_color: bannerColor,
      banner_shape: bannerShape,
      icon_id: iconId,
      icon_color: iconColor,
      created_by: user.id,
    }).select().single();

    if (error) {
      toast.error(error.message);
      return;
    }

    // Add creator as leader
    await supabase.from('clan_members').insert({
      clan_id: newClan.id,
      user_id: user.id,
      role: 'leader',
    });

    setProfile(prev => ({ ...prev, gems: prev.gems - 100 }));
    setClan({
      name: clanName.trim(),
      tag,
      members: 1,
      maxMembers: 50,
      trophies: profile.trophies,
      badge: iconId,
      description: clanDescription.trim() || 'A new clan ready for war!',
      donations: 0,
      bannerColor,
      bannerShape,
      iconId,
      iconColor,
    });
    setShowCreateClan(false);
    setClanName('');
    setClanDescription('');
    setCustomizeStep('info');
    toast.success(T('social.toast_clan_created'));
  };

  // Leave clan
  const leaveClan = async () => {
    if (!user) return;
    await supabase.from('clan_members').delete().eq('user_id', user.id);
    setClan(null);
    toast.success(T('social.toast_left_clan'));
  };

  // Add friend by tag
  const addFriend = async () => {
    if (!user || !friendTag.trim()) return;
    setAddingFriend(true);
    const tag = friendTag.trim().startsWith('#') ? friendTag.trim() : `#${friendTag.trim()}`;

    // Find user by player_tag
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('player_tag', tag.toUpperCase())
      .maybeSingle();

    if (!targetProfile) {
      toast.error(T('social.toast_player_not_found'));
      setAddingFriend(false);
      return;
    }
    if (targetProfile.user_id === user.id) {
      toast.error(T('social.toast_cant_add_self'));
      setAddingFriend(false);
      return;
    }

    const { error } = await supabase.from('friends').insert({
      user_id: user.id,
      friend_user_id: targetProfile.user_id,
      status: 'accepted', // auto-accept for simplicity
    });

    if (error) {
      if (error.code === '23505') toast.error(T('social.toast_already_friends'));
      else toast.error(error.message);
    } else {
      toast.success(T('social.toast_friend_added'));
      setFriendTag('');
      loadFriends();
    }
    setAddingFriend(false);
  };

  // Load friends
  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoadingFriends(true);
    const { data } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`);

    if (data && data.length > 0) {
      // Get friend user IDs
      const friendIds = data.map(f => f.user_id === user.id ? f.friend_user_id : f.user_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, player_tag')
        .in('user_id', friendIds);

      // Get trophies
      const { data: progress } = await supabase
        .from('player_progress')
        .select('user_id, trophies')
        .in('user_id', friendIds);

      const enriched: FriendRow[] = data.map(f => {
        const friendId = f.user_id === user.id ? f.friend_user_id : f.user_id;
        const prof = profiles?.find(p => p.user_id === friendId);
        const prog = progress?.find(p => p.user_id === friendId);
        return {
          ...f,
          friend_username: prof?.username || 'Unknown',
          friend_tag: prof?.player_tag || '',
          friend_trophies: prog?.trophies || 0,
        };
      });
      setFriends(enriched);
    } else {
      setFriends([]);
    }
    setLoadingFriends(false);
  }, [user]);

  // Remove friend
  const removeFriend = async (friendId: string) => {
    await supabase.from('friends').delete().eq('id', friendId);
    setFriends(prev => prev.filter(f => f.id !== friendId));
    toast.success(t('social.friend_removed', language));
  };

  // Detect user country on mount
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.country_name) {
          setUserCountry(data.country_name);
          setUserCountryCode(data.country_code);
          // Save country to player_progress
          if (user) {
            await supabase
              .from('player_progress')
              .update({ country: data.country_code } as any)
              .eq('user_id', user.id);
          }
        }
      } catch {
        setUserCountry('Unknown');
      }
    };
    detectCountry();
  }, [user]);

  // Load leaderboard (worldwide + local)
  const loadLeaderboard = useCallback(async () => {
    setLoadingLeaderboard(true);

    // Worldwide
    const { data: progress } = await supabase
      .from('player_progress')
      .select('user_id, trophies, level, wins, country, equipped_emblem')
      .order('trophies', { ascending: false })
      .limit(200);

    if (progress && progress.length > 0) {
      const userIds = progress.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, player_tag')
        .in('user_id', userIds);

      const entries: LeaderboardEntry[] = progress.map(p => {
        const prof = profiles?.find(pr => pr.user_id === p.user_id);
        return {
          ...p,
          username: prof?.username || 'Unknown',
          player_tag: prof?.player_tag || '',
          country: (p as any).country || null,
          equipped_emblem: (p as any).equipped_emblem || 'emb-shield',
        };
      });
      setLeaderboard(entries);

      // Find world rank
      const worldIdx = entries.findIndex(e => e.user_id === user?.id);
      setMyWorldRank(worldIdx >= 0 ? worldIdx + 1 : null);
      // Persist for season-end rewards
      if (worldIdx >= 0) localStorage.setItem('my_world_rank', String(worldIdx + 1));

      // Local leaderboard (same country)
      if (userCountryCode) {
        const local = entries.filter(e => e.country === userCountryCode);
        setLocalLeaderboard(local);
        const localIdx = local.findIndex(e => e.user_id === user?.id);
        setMyLocalRank(localIdx >= 0 ? localIdx + 1 : null);
        // Persist for season-end rewards
        if (localIdx >= 0) localStorage.setItem('my_local_rank', String(localIdx + 1));
      }
    }
    setLoadingLeaderboard(false);
  }, [user, userCountryCode]);

  // Load data when switching tabs
  useEffect(() => {
    if (tab === 'friends') loadFriends();
    if (tab === 'leaderboard') loadLeaderboard();
  }, [tab, globalSubTab, loadLeaderboard]);

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">{t('social.title', language)}</h2>
        <div className="text-[9px] text-muted-foreground">{playerTag}</div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        {(['clan', 'friends', 'leaderboard'] as const).map(tb => (
          <button key={tb} onClick={() => setTab(tb)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${tab === tb ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {tb === 'clan' ? t('social.clan', language) : tb === 'friends' ? t('social.friends', language) : t('social.leaderboard', language)}
          </button>
        ))}
      </div>

      {tab === 'clan' && (
        <>
          {!clan ? (
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-4">
              {showClanSearch ? (
                // Search clans UI
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowClanSearch(false)} className="text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
                    <h3 className="text-sm font-display font-bold text-foreground">{t('social.search_clans', language)}</h3>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-foreground border border-border"
                      placeholder={t('social.clan_name_placeholder', language)}
                      value={clanSearchQuery}
                      onChange={e => setClanSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchClans()}
                    />
                    <button onClick={searchClans} disabled={searchingClans} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                      {searchingClans ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                    </button>
                  </div>
                  {clanSearchResults.length === 0 && !searchingClans && (
                    <div className="text-center text-xs text-muted-foreground py-6">{t('social.search_join', language)}</div>
                  )}
                  <div className="space-y-2">
                    {clanSearchResults.map(c => (
                      <div key={c.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                        <ClanFlag bannerColor={c.banner_color} bannerShape={c.banner_shape} iconId={c.icon_id} iconColor={c.icon_color} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-foreground truncate">{c.name}</div>
                          <div className="text-[8px] text-muted-foreground">{c.tag}</div>
                          <div className="text-[8px] text-muted-foreground truncate">{c.description}</div>
                        </div>
                        <button
                          onClick={() => joinClan(c)}
                          disabled={joiningClan === c.id}
                          className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50"
                        >
                          {joiningClan === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : t('social.join', language)}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : showCreateClan ? (
                <div className="w-full max-w-xs space-y-3">
                  <h3 className="text-sm font-display font-bold text-foreground text-center">{t('social.create_clan', language)}</h3>
                  <p className="text-[10px] text-muted-foreground text-center">{t('social.costs_gems', language)}</p>

                  <div className="flex justify-center py-2">
                    <ClanFlag bannerColor={bannerColor} bannerShape={bannerShape} iconId={iconId} iconColor={iconColor} size="lg" />
                  </div>

                  {customizeStep === 'info' && (
                    <>
                      <input
                        className="w-full bg-secondary rounded-lg px-3 py-2 text-xs text-foreground border border-border"
                        placeholder={t('social.clan_name_input', language)}
                        value={clanName}
                        onChange={e => setClanName(e.target.value.substring(0, 15))}
                      />
                      <textarea
                        className="w-full bg-secondary rounded-lg px-3 py-2 text-xs text-foreground border border-border resize-none"
                        placeholder={t('social.description_optional', language)}
                        rows={2}
                        value={clanDescription}
                        onChange={e => setClanDescription(e.target.value.substring(0, 100))}
                      />
                      <button
                        onClick={() => setCustomizeStep('flag')}
                        disabled={clanName.trim().length < 3}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1"
                      >
                        {t('social.customize_flag', language)} <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => { setShowCreateClan(false); setCustomizeStep('info'); }}
                        className="w-full py-2 bg-secondary text-muted-foreground rounded-lg text-xs font-bold border border-border"
                      >
                        {t('shop.cancel', language)}
                      </button>
                    </>
                  )}

                  {customizeStep === 'flag' && (
                    <>
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t('social.banner_shape', language)}</div>
                        <div className="flex gap-2 flex-wrap">
                          {BANNER_SHAPES.map(shape => (
                            <button key={shape.id} onClick={() => setBannerShape(shape.id)}
                              className={`w-10 h-12 rounded-md border-2 transition-all flex items-center justify-center ${bannerShape === shape.id ? 'border-primary scale-110' : 'border-border'}`}>
                              <svg viewBox="0 0 56 72" className="w-7 h-9">
                                <path d={shape.path} fill={bannerColor} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t('social.banner_color', language)}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {BANNER_COLORS.map(c => (
                            <button key={c} onClick={() => setBannerColor(c)}
                              className={`w-6 h-6 rounded-md border-2 transition-all ${bannerColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t('social.icon', language)}</div>
                        <div className="flex flex-wrap gap-1">
                          {CLAN_ICONS.map(({ id, Icon }) => (
                            <button key={id} onClick={() => setIconId(id)}
                              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${iconId === id ? 'bg-primary/30 border border-primary scale-110' : 'bg-secondary border border-border'}`}>
                              <Icon size={14} color={iconId === id ? iconColor : '#888'} strokeWidth={2} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t('social.icon_color', language)}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {ICON_COLORS.map(c => (
                            <button key={c} onClick={() => setIconColor(c)}
                              className={`w-6 h-6 rounded-full border-2 transition-all ${iconColor === c ? 'border-foreground scale-110' : 'border-muted'}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setCustomizeStep('info')}
                          className="flex-1 py-2 bg-secondary text-muted-foreground rounded-lg text-xs font-bold border border-border flex items-center justify-center gap-1">
                          <ChevronLeft className="w-3 h-3" />{t('common.back', language)}
                        </button>
                        <button onClick={handleCreateClan} disabled={profile.gems < 100 || clanName.trim().length < 3}
                          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-40">
                          {t('social.create_cost', language)}
                        </button>
                      </div>
                      {profile.gems < 100 && (
                        <p className="text-[9px] text-destructive text-center">{t('social.not_enough_gems', language)} {t('social.you_have', language)} {profile.gems}.</p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <Shield className="w-12 h-12 text-muted-foreground/30 mb-3" />
                   <div className="text-sm font-display font-bold text-foreground">{t('social.no_clan', language)}</div>
                  <div className="text-xs text-muted-foreground text-center mt-1">{t('social.join_create', language)}</div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { setShowClanSearch(true); searchClans(); }}
                      className="px-6 py-2 bg-secondary text-muted-foreground rounded-lg text-xs font-bold border border-border flex items-center gap-1">
                      <Search className="w-3 h-3" />{t('social.search_clans', language)}
                    </button>
                    <button onClick={() => setShowCreateClan(true)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold flex items-center gap-1">
                      <Plus className="w-3 h-3" />{t('social.create_cost', language)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ClanView clan={clan} profile={profile} user={user} leaveClan={leaveClan} setScreen={setScreen} />
          )}
        </>
      )}

      {tab === 'friends' && (
        <div className="flex-1 overflow-y-auto">
          {/* Add friend input */}
          <div className="p-3 border-b border-border bg-[hsl(220,20%,13%)]">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('social.add_by_tag', language)}</div>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-foreground border border-border"
                placeholder="#A1B2C3D4"
                value={friendTag}
                onChange={e => setFriendTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addFriend()}
              />
              <button onClick={addFriend} disabled={addingFriend || !friendTag.trim()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1">
                {addingFriend ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                {t('social.add_friend', language)}
              </button>
            </div>
          </div>

          {/* Your tag */}
          <div className="px-3 py-2 border-b border-border/50 bg-[hsl(220,20%,11%)]">
            <div className="text-[8px] text-muted-foreground">{t('social.your_tag', language)}: <span className="text-primary font-bold">{playerTag}</span></div>
          </div>

          {/* Friends list */}
          {loadingFriends ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <UserPlus className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <div className="text-xs text-muted-foreground">{t('social.no_friends', language)}</div>
            </div>
          ) : (
            friends.map((f, i) => (
              <div key={f.id} className="flex items-center gap-3 px-3 py-2 border-b border-border/50">
                <div className="text-[10px] text-muted-foreground font-bold w-4">{i + 1}</div>
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-foreground">{f.friend_username}</div>
                  <div className="text-[8px] text-muted-foreground">{f.friend_tag}</div>
                </div>
                <div className="text-[10px] font-bold text-foreground mr-1">🏆 {f.friend_trophies}</div>
                {f.status === 'accepted' && (
                  <button
                    onClick={() => {
                      // Check deck has 8 cards
                      if (deck.length < 8) {
                        toast.error(t('battle.deck_not_full', language));
                        return;
                      }
                      localStorage.setItem('friendly_battle', JSON.stringify({ friendName: f.friend_username, friendTag: f.friend_tag }));
                      setScreen('matchmaking');
                    }}
                    className="px-2 py-1 bg-primary/20 border border-primary/30 rounded-lg text-[8px] font-bold text-primary hover:bg-primary/30 transition-colors mr-1"
                  >
                    ⚔️ {t('social.friendly_battle', language)}
                  </button>
                )}
                <button onClick={() => removeFriend(f.id)} className="text-muted-foreground hover:text-destructive">
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-tabs */}
          <div className="flex bg-[hsl(220,20%,12%)] border-b border-border">
            {(['local', 'worldwide', 'top100'] as const).map(st => (
              <button key={st} onClick={() => setGlobalSubTab(st)} className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider ${globalSubTab === st ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
                {st === 'local' ? t('social.local', language) : st === 'worldwide' ? t('social.worldwide', language) : t('social.top100', language)}
              </button>
            ))}
          </div>

          {/* Location info */}
          {globalSubTab === 'local' && (
            <div className="px-3 py-2 bg-[hsl(220,20%,11%)] border-b border-border/50 flex items-center justify-between">
              <div className="text-[9px] text-muted-foreground">📍 {t('social.your_location', language)}: <span className="text-foreground font-bold">{userCountry || t('social.detecting', language)}</span></div>
              {myLocalRank && <div className="text-[9px] text-primary font-bold">{t('social.your_rank', language)}: #{myLocalRank}</div>}
            </div>
          )}
          {globalSubTab === 'worldwide' && myWorldRank && (
            <div className="px-3 py-2 bg-[hsl(220,20%,11%)] border-b border-border/50">
              <div className="text-[9px] text-primary font-bold">🌍 {t('social.your_rank', language)}: #{myWorldRank}</div>
            </div>
          )}

          {/* Rewards info banner + Season timer */}
          {(globalSubTab === 'top100' || globalSubTab === 'local') && (
            <div className="mx-3 mt-2 mb-1 space-y-1">
              <div className="px-3 py-1.5 bg-gradient-to-r from-[hsl(280,40%,18%)] to-[hsl(320,40%,18%)] border border-[hsl(280,30%,30%)] rounded-lg text-[9px] font-bold text-[hsl(280,60%,70%)] flex items-center justify-between">
                <span>⏳ {t('social.season_ends', language)}</span>
                <SeasonCountdown />
              </div>
              <button
                onClick={() => setShowRewardsPanel(!showRewardsPanel)}
                className="w-full px-3 py-2 bg-gradient-to-r from-[hsl(38,80%,20%)] to-[hsl(38,60%,15%)] border border-primary/30 rounded-lg text-[9px] font-bold text-primary flex items-center justify-between"
              >
                <span>🏅 {globalSubTab === 'top100' ? t('social.top100_rewards', language) : t('social.top10_rewards', language)}</span>
                <span className="text-[8px]">{showRewardsPanel ? '▲' : '▼'}</span>
              </button>
            </div>
          )}

          {/* Rewards panel */}
          <AnimatePresence>
            {showRewardsPanel && (globalSubTab === 'top100' || globalSubTab === 'local') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mx-3 overflow-hidden"
              >
                <div className="bg-[hsl(220,20%,11%)] border border-border rounded-lg p-2 mb-1 max-h-40 overflow-y-auto">
                  {(globalSubTab === 'top100' ? TOP_100_REWARDS.slice(0, 20) : TOP_10_LOCAL_REWARDS).map(r => (
                    <div key={r.rank} className="flex items-center gap-2 py-1 border-b border-border/30 last:border-0">
                      <span className="text-[9px] font-bold w-8 text-center text-foreground">{r.label}</span>
                      <div className="flex-1 flex flex-wrap gap-1">
                        <span className="text-[8px] text-foreground">💰{r.gold.toLocaleString()}</span>
                        <span className="text-[8px] text-foreground">💎{r.gems}</span>
                        {r.exclusiveBanner && <span className="text-[7px] bg-primary/20 text-primary px-1 rounded">{r.exclusiveBanner}</span>}
                        {r.exclusiveEmote && <span className="text-[7px] bg-purple-500/20 text-purple-400 px-1 rounded">{r.exclusiveEmote}</span>}
                      </div>
                    </div>
                  ))}
                  {globalSubTab === 'top100' && (
                    <div className="text-[8px] text-muted-foreground text-center py-1">{t('social.more_rewards', language)}</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Leaderboard list */}
          <div className="flex-1 overflow-y-auto">
            {loadingLeaderboard ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : (() => {
              const data = globalSubTab === 'local' ? localLeaderboard
                : globalSubTab === 'top100' ? leaderboard.slice(0, 100)
                : leaderboard;

              if (data.length === 0) return (
                <div className="flex flex-col items-center justify-center py-8">
                  <Trophy className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  <div className="text-xs text-muted-foreground">
                    {globalSubTab === 'local' ? t('social.no_local_players', language) : t('social.no_players', language)}
                  </div>
                </div>
              );

              return data.map((entry, i) => {
                const isYou = entry.user_id === user?.id;
                const rank = i + 1;
                const isTop100 = globalSubTab === 'top100';
                const isLocal = globalSubTab === 'local';
                const reward = isTop100 ? TOP_100_REWARDS.find(r => r.rank === rank) : isLocal && rank <= 10 ? TOP_10_LOCAL_REWARDS.find(r => r.rank === rank) : null;

                return (
                  <div key={entry.user_id} className={`flex items-center gap-2 px-3 py-2 border-b border-border/50 ${isYou ? 'bg-primary/10' : ''} ${reward ? 'bg-[hsl(38,30%,10%,0.3)]' : ''}`}>
                    <div className={`text-[10px] font-bold w-6 text-center ${rank === 1 ? 'text-primary' : rank === 2 ? 'text-muted-foreground' : rank === 3 ? 'text-[hsl(25,70%,50%)]' : 'text-muted-foreground'}`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </div>
                    {/* Equipped emblem instead of level square */}
                    <div className="w-7 h-7 rounded-lg bg-[hsl(220,20%,18%)] border border-border flex items-center justify-center">
                      <span className="text-base">{getEmblemEmoji(isYou ? getPlayerBanner().emblemId : entry.equipped_emblem)}</span>
                    </div>
                    {/* Country flag */}
                    {entry.country && (
                      <span className="text-sm" title={entry.country}>{countryCodeToFlag(entry.country)}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">
                        {entry.username} {isYou && <span className="text-[8px] text-primary">({t('common.you', language)})</span>}
                      </div>
                      <div className="text-[8px] text-muted-foreground">
                        {entry.player_tag} • {t('menu.lvl', language)} {entry.level} • {entry.wins}W
                      </div>
                      {reward && (
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          <span className="text-[7px] bg-primary/10 text-primary px-1 rounded">💰{reward.gold.toLocaleString()}</span>
                          <span className="text-[7px] bg-primary/10 text-primary px-1 rounded">💎{reward.gems}</span>
                          {reward.exclusiveBanner && <span className="text-[6px] bg-primary/20 text-primary px-1 rounded">{reward.exclusiveBanner}</span>}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-foreground flex items-center gap-1">🏆 {entry.trophies.toLocaleString()}</div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Season-end reward reveal */}
      <AnimatePresence>
        {seasonEndReveal && (
          <RevealScreen
            items={seasonEndReveal}
            title={`🏆 ${T('social.season_end_rewards')}`}
            subtitle={T('social.season_end_desc')}
            onClose={() => setSeasonEndReveal(null)}
            lang={language}
          />
        )}
      </AnimatePresence>

      <BottomNav active="social" setScreen={setScreen} />
    </div>
  );
};

// Clan View with Chat & Trading
interface ClanMsg {
  id: string;
  user_id: string;
  username: string;
  message_type: string;
  content: string;
  trade_card_offered: string | null;
  trade_card_wanted: string | null;
  created_at: string;
}

const ClanView = ({ clan, profile, user, leaveClan, setScreen }: { clan: any; profile: any; user: any; leaveClan: () => void; setScreen: (s: string) => void }) => {
  const { setProfile } = useGame();
  const { language } = useSettings();
  const T = (key: string) => t(key, language);
  const [chatMode, setChatMode] = useState<'info' | 'chat'>('info');
  const [messages, setMessages] = useState<ClanMsg[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [tradeOffer, setTradeOffer] = useState('');
  const [tradeWant, setTradeWant] = useState('');
  const [requestCardId, setRequestCardId] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [clanId, setClanId] = useState<string | null>(null);
  const [showEmotePicker, setShowEmotePicker] = useState(false);

  // Get equipped emotes data
  const equippedEmoteIds = getEquippedEmotes();
  const equippedEmotesData = allEmotes.filter(e => equippedEmoteIds.includes(e.id));

  // Cards the user owns (count > 0) - for trading offers
  const ownedCards = allCards.filter(c => {
    const entry = getCardEntry(c.id);
    return entry.count > 0;
  });

  // Requestable cards (any card with donation limits)
  const requestableCards = allCards.filter(c => DONATION_LIMITS[c.rarity] > 0);

  const sendEmote = async (emote: typeof allEmotes[0]) => {
    if (!clanId || !user) return;
    await supabase.from('clan_messages').insert({
      clan_id: clanId,
      user_id: user.id,
      username: profile.name,
      message_type: 'emote',
      content: emote.svg,
    });
    setShowEmotePicker(false);
  };


  // Get clan ID from DB
  useEffect(() => {
    if (!user) return;
    const getClanId = async () => {
      const { data } = await supabase
        .from('clan_members')
        .select('clan_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setClanId(data.clan_id);
    };
    getClanId();
  }, [user]);

  // Load messages & subscribe to realtime
  useEffect(() => {
    if (!clanId) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from('clan_messages')
        .select('*')
        .eq('clan_id', clanId)
        .order('created_at', { ascending: true })
        .limit(100);
      setMessages((data as ClanMsg[]) || []);
    };
    loadMessages();

    const channel = supabase
      .channel(`clan-chat-${clanId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'clan_messages',
        filter: `clan_id=eq.${clanId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ClanMsg]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clanId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!msgInput.trim() || !clanId || !user) return;
    setSending(true);
    await supabase.from('clan_messages').insert({
      clan_id: clanId,
      user_id: user.id,
      username: profile.name,
      message_type: 'chat',
      content: msgInput.trim(),
    });
    setMsgInput('');
    setSending(false);
  };

  const sendTradeRequest = async () => {
    if (!tradeOffer || !tradeWant || !clanId || !user) return;
    if (tradeOffer === tradeWant) { toast.error(T('social.cant_trade_self')); return; }
    const offered = allCards.find(c => c.id === tradeOffer);
    const wanted = allCards.find(c => c.id === tradeWant);
    if (!offered || !wanted) return;
    const offerEntry = getCardEntry(tradeOffer);
    if (offerEntry.count <= 1) { toast.error(T('social.toast_need_2_to_trade')); return; }
    setSending(true);
    await supabase.from('clan_messages').insert({
      clan_id: clanId,
      user_id: user.id,
      username: profile.name,
      message_type: 'trade_request',
      content: `🔄 Trade: ${offered.emoji} ${offered.name} ↔ ${wanted.emoji} ${wanted.name}`,
      trade_card_offered: tradeOffer,
      trade_card_wanted: tradeWant,
    });
    setShowTrade(false);
    setTradeOffer('');
    setTradeWant('');
    setSending(false);
    toast.success(T('social.toast_trade_posted'));
  };
  
  const acceptTrade = (msg: ClanMsg) => {
    if (!msg.trade_card_offered || !msg.trade_card_wanted) return;
    if (msg.user_id === user?.id) { toast.error(T('social.toast_cant_accept_own')); return; }
    const offeredCard = allCards.find(c => c.id === msg.trade_card_offered);
    const wantedCard = allCards.find(c => c.id === msg.trade_card_wanted);
    if (!offeredCard || !wantedCard) return;
    
    // The acceptor needs to have the "wanted" card (what the poster wants)
    const myWantedEntry = getCardEntry(msg.trade_card_wanted);
    if (myWantedEntry.count <= 1) { toast.error(T('social.toast_need_2_to_trade')); return; }
    
    // Execute trade: acceptor gives wanted card, receives offered card
    removeCards(msg.trade_card_wanted, 1);
    addCards(msg.trade_card_offered, 1);
    
    // Grant XP for trading
    setProfile((p: any) => ({ ...p, xp: p.xp + 10 }));
    toast.success(T('social.toast_trade_complete'));
  };

  const sendCardRequest = async () => {
    if (!requestCardId || !clanId || !user) return;
    if (!canRequest()) {
      toast.error(`${T('social.toast_request_cooldown')} ${getRequestTimeLeft()}`);
      return;
    }
    const card = allCards.find(c => c.id === requestCardId);
    if (!card) return;
    const entry = getCardEntry(card.id);
    const limit = DONATION_LIMITS[card.rarity];
    if (limit <= 0) { toast.error(T('social.toast_cant_request_rarity')); return; }

    setSending(true);
    await supabase.from('clan_messages').insert({
      clan_id: clanId,
      user_id: user.id,
      username: profile.name,
      message_type: 'card_request',
      content: `🙏 Requesting: ${card.emoji} ${card.name} (${card.rarity}) — max ${limit}/day`,
      trade_card_wanted: requestCardId,
    });
    setRequestCooldown();
    setShowRequest(false);
    setRequestCardId('');
    setSending(false);
    toast.success(T('social.toast_request_posted'));
  };

  const donateCard = (msg: ClanMsg) => {
    if (!msg.trade_card_wanted) return;
    if (msg.user_id === user?.id) { toast.error(T('social.toast_cant_donate_self')); return; }
    const card = allCards.find(c => c.id === msg.trade_card_wanted);
    if (!card) return;
    const myEntry = getCardEntry(card.id);
    if (myEntry.count <= 1) { toast.error(T('social.toast_need_2_to_donate')); return; }
    const limit = DONATION_LIMITS[card.rarity];
    const today = getDonationsToday();
    if (today.donated >= limit) { toast.error(T('social.toast_donation_limit')); return; }

    // Remove card from donor, add to requester (locally — in a real game this would be server-side)
    removeCards(card.id, 1);
    recordDonation(1);
    // Grant XP/gold for donating
    const xpReward = card.rarity === 'common' ? 1 : card.rarity === 'rare' ? 10 : 50;
    const goldReward = card.rarity === 'common' ? 5 : card.rarity === 'rare' ? 50 : 500;
    setProfile((p: any) => ({ ...p, gold: p.gold + goldReward, xp: p.xp + xpReward, totalDonations: p.totalDonations + 1 }));
    toast.success(`${T('social.toast_donated')} ${card.emoji} ${card.name}! +${goldReward}💰 +${xpReward}XP`);
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      {chatMode === 'info' ? (
        <>
          {/* Clan header with flag */}
          <div className="bg-[hsl(220,20%,13%)] p-3 border-b border-border">
            <div className="flex items-center gap-3">
              <ClanFlag bannerColor={clan.bannerColor} bannerShape={clan.bannerShape} iconId={clan.iconId} iconColor={clan.iconColor} size="md" />
              <div className="flex-1">
                <div className="text-sm font-display font-bold text-foreground">{clan.name}</div>
                <div className="text-[9px] text-muted-foreground">{clan.tag} • {clan.members}/{clan.maxMembers} {t('social.members', language)}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] text-primary font-bold">🏆 {clan.trophies?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-2 italic">"{clan.description}"</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setChatMode('chat')} className="flex-1 py-1.5 bg-primary/20 text-primary rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                <MessageCircle className="w-3 h-3" />{t('social.chat', language)}
              </button>
              <button onClick={() => setScreen('river-race')} className="flex-1 py-1.5 bg-[hsl(200,40%,20%)] text-[hsl(200,70%,65%)] rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                <SwordsIcon className="w-3 h-3" />{t('battle.river_race', language)}
              </button>
              <button onClick={leaveClan} className="flex-1 py-1.5 bg-destructive/20 text-destructive rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                <X className="w-3 h-3" />{t('social.leave', language)}
              </button>
            </div>
          </div>
          {/* Members list */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center gap-3 px-3 py-2 border-b border-border/50">
              <div className="text-[10px] text-muted-foreground font-bold w-4">1</div>
              <div className="w-2 h-2 rounded-full bg-hp-green" />
              <div className="flex-1">
                <div className="text-xs font-bold text-foreground">{profile.name}</div>
                <div className="text-[8px] text-primary">{t('social.leader', language)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-foreground flex items-center gap-1 justify-end">🏆 {profile.trophies}</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Chat header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(220,20%,13%)] border-b border-border">
            <button onClick={() => setChatMode('info')} className="text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground flex-1">{clan.name} Chat</span>
            <button onClick={() => { setShowTrade(!showTrade); setShowRequest(false); }} className="bg-primary/20 text-primary px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1">
              <Repeat className="w-3 h-3" />{t('social.trade', language)}
            </button>
            <button onClick={() => { setShowRequest(!showRequest); setShowTrade(false); }} className="bg-hp-green/20 text-hp-green px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1">
              <Gift className="w-3 h-3" />{t('social.request', language)}
            </button>
          </div>

          {/* Trade panel */}
          <AnimatePresence>
            {showTrade && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="bg-[hsl(220,20%,11%)] border-b border-border overflow-hidden">
                <div className="p-3 space-y-2">
                  <div className="text-[9px] font-bold text-primary uppercase tracking-wider">{t('social.post_trade', language)}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-muted-foreground">{t('social.you_offer', language)}</label>
                      <select value={tradeOffer} onChange={e => setTradeOffer(e.target.value)}
                        className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-[9px] text-foreground">
                         <option value="">{t('social.select_card', language)}</option>
                        {ownedCards.map(c => {
                          const entry = getCardEntry(c.id);
                          return <option key={c.id} value={c.id}>{c.emoji} {c.name} — x{entry.count}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] text-muted-foreground">{t('social.you_want', language)}</label>
                      <select value={tradeWant} onChange={e => setTradeWant(e.target.value)}
                        className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-[9px] text-foreground">
                         <option value="">{t('social.select_card', language)}</option>
                        {allCards.filter(c => c.id !== tradeOffer).map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  {tradeOffer === tradeWant && tradeOffer && (
                    <div className="text-[9px] text-destructive">⚠️ {t('social.cant_trade_self', language)}</div>
                  )}
                  <button onClick={sendTradeRequest} disabled={!tradeOffer || !tradeWant || tradeOffer === tradeWant || sending}
                    className="w-full py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold disabled:opacity-50">
                    {t('social.post_trade_btn', language)}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card request panel */}
          <AnimatePresence>
            {showRequest && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="bg-[hsl(120,15%,11%)] border-b border-border overflow-hidden">
                <div className="p-3 space-y-2">
                  <div className="text-[9px] font-bold text-hp-green uppercase tracking-wider">{t('social.request_card', language)}</div>
                  {!canRequest() && (
                    <div className="flex items-center gap-2">
                      <div className="text-[9px] text-destructive">⏳ {T('river.cooldown')}: {getRequestTimeLeft()}</div>
                      <button onClick={() => {
                        const cost = getSkipCooldownCost();
                        if (profile.gems < cost) {
                          toast.error(`${T('social.not_enough_gems')} ${cost} 💎`);
                          return;
                        }
                        setProfile({ ...profile, gems: profile.gems - cost });
                        skipRequestCooldown();
                        toast.success(`${T('social.skip_cost')} ${cost} 💎`);
                      }} className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-[8px] font-bold">
                        {t('social.skip_cost', language)} ({getSkipCooldownCost()} 💎)
                      </button>
                    </div>
                  )}
                  <div>
                    <label className="text-[8px] text-muted-foreground">{t('social.card_to_request', language)}</label>
                    <select value={requestCardId} onChange={e => setRequestCardId(e.target.value)}
                      className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-[9px] text-foreground">
                      <option value="">{t('social.select_card', language)}</option>
                      {requestableCards.map(c => {
                        const entry = getCardEntry(c.id);
                        return <option key={c.id} value={c.id}>{c.emoji} {c.name} ({c.rarity}){entry.count > 0 ? ` — x${entry.count}` : ''}</option>;
                      })}
                    </select>
                  </div>
                  {requestCardId && (() => {
                    const card = allCards.find(c => c.id === requestCardId);
                    if (!card) return null;
                    return (
                      <div className="text-[8px] text-muted-foreground">
                        {t('social.max_donations', language)}: <span className="text-foreground font-bold">{DONATION_LIMITS[card.rarity]}</span> • {t('social.cooldown_between', language)}
                      </div>
                    );
                  })()}
                  <button onClick={sendCardRequest} disabled={!requestCardId || sending || !canRequest()}
                    className="w-full py-1.5 bg-hp-green text-foreground rounded-lg text-[10px] font-bold disabled:opacity-50">
                    {t('social.request_card_btn', language)}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
            {messages.length === 0 && (
              <div className="text-center text-[10px] text-muted-foreground py-8">{t('social.no_messages', language)}</div>
            )}
            {messages.map(msg => {
              const isMe = msg.user_id === user?.id;
              const isTrade = msg.message_type === 'trade_request';
              const isRequest = msg.message_type === 'card_request';
              const isEmote = msg.message_type === 'emote';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-1.5 ${
                    isEmote
                      ? 'bg-transparent border-none px-0'
                      : isRequest
                      ? 'bg-[hsl(120,20%,15%)] border border-[hsl(120,25%,25%)]'
                      : isTrade
                      ? 'bg-[hsl(280,30%,18%)] border border-[hsl(280,30%,30%)]'
                      : isMe
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-[hsl(220,15%,16%)] border border-border'
                  }`}>
                    {!isMe && !isEmote && (
                      <div className="text-[8px] font-bold text-primary mb-0.5">{msg.username}</div>
                    )}
                    {isEmote ? (
                      <div className="flex flex-col items-center">
                        {!isMe && <div className="text-[8px] font-bold text-primary mb-0.5">{msg.username}</div>}
                        <div className="w-12 h-12" dangerouslySetInnerHTML={{ __html: msg.content }} />
                      </div>
                    ) : (
                      <div className="text-[10px] text-foreground">{msg.content}</div>
                    )}
                    {isTrade && msg.trade_card_offered && msg.trade_card_wanted && (
                      <button
                        onClick={() => acceptTrade(msg)}
                        className="mt-1 px-3 py-1 bg-primary/20 text-primary rounded-lg text-[9px] font-bold flex items-center gap-1 hover:bg-primary/30 transition-colors"
                      >
                        <Repeat className="w-3 h-3" /> {t('social.accept_trade', language)}
                      </button>
                    )}
                    {isRequest && msg.trade_card_wanted && (
                      <button
                        onClick={() => donateCard(msg)}
                        className="mt-1 px-3 py-1 bg-hp-green/20 text-hp-green rounded-lg text-[9px] font-bold flex items-center gap-1 hover:bg-hp-green/30 transition-colors"
                      >
                        <Gift className="w-3 h-3" /> {t('social.donate', language)}
                      </button>
                    )}
                    {!isEmote && <div className="text-[7px] text-muted-foreground text-right mt-0.5">{formatTime(msg.created_at)}</div>}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Emote picker */}
          <AnimatePresence>
            {showEmotePicker && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="bg-[hsl(220,20%,11%)] border-t border-border overflow-hidden">
                <div className="p-2 grid grid-cols-8 gap-1.5 max-h-24 overflow-y-auto">
                  {equippedEmotesData.map(emote => (
                    <button key={emote.id} onClick={() => sendEmote(emote)}
                      className="w-8 h-8 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors p-0.5">
                      <div dangerouslySetInnerHTML={{ __html: emote.svg }} />
                    </button>
                  ))}
                  {equippedEmotesData.length === 0 && (
                    <div className="col-span-8 text-[9px] text-muted-foreground text-center py-2">{t('social.no_emotes_equipped', language)}</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat input */}
          <div className="px-3 py-2 bg-[hsl(220,20%,10%)] border-t border-border flex gap-2">
            <button onClick={() => setShowEmotePicker(!showEmotePicker)}
              className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-sm hover:border-primary/50 transition-colors">
              😀
            </button>
            <input
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={t('social.type_message', language)}
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-[10px] text-foreground placeholder:text-muted-foreground"
            />
            <button onClick={sendMessage} disabled={!msgInput.trim() || sending}
              className="bg-primary text-primary-foreground w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-50">
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default SocialScreen;
