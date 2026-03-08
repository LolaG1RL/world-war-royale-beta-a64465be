import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { GameCard, ChestData, PlayerProfile, ClanData, getStarterDeck, defaultChests, defaultProfile, allCards, getArenaForTrophies } from '@/data/cards';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface GameState {
  screen: string;
  setScreen: (s: string) => void;
  profile: PlayerProfile;
  setProfile: (p: PlayerProfile | ((prev: PlayerProfile) => PlayerProfile)) => void;
  deck: GameCard[];
  setDeck: (d: GameCard[]) => void;
  chests: ChestData[];
  setChests: (c: ChestData[]) => void;
  clan: ClanData | null;
  setClan: (c: ClanData | null) => void;
  battleResult: 'win' | 'lose' | null;
  setBattleResult: (r: 'win' | 'lose' | null) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  saving: boolean;
}

const GameContext = createContext<GameState | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { username, user } = useAuth();
  const [screen, setScreen] = useState('menu');
  const [profile, setProfile] = useState<PlayerProfile>({
    ...defaultProfile,
    name: username || 'Warrior',
  });
  const [deck, setDeck] = useState<GameCard[]>(getStarterDeck());
  const [chests, setChests] = useState<ChestData[]>(defaultChests);
  const [clan, setClan] = useState<ClanData | null>(null);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [activeTab, setActiveTab] = useState('battle');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load progress from DB on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('player_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        const arena = getArenaForTrophies(data.trophies);
        setProfile({
          name: username || 'Warrior',
          level: data.level,
          xp: data.xp,
          maxXp: data.max_xp,
          trophies: data.trophies,
          maxTrophies: data.max_trophies,
          arena: arena.id,
          arenaName: arena.name,
          wins: data.wins,
          losses: data.losses,
          threeCrownWins: data.three_crown_wins,
          challengeMaxWins: data.challenge_max_wins,
          warDayWins: data.war_day_wins,
          clanCardsCollected: data.clan_cards_collected,
          totalDonations: data.total_donations,
          gold: data.gold,
          gems: data.gems,
          starPoints: data.star_points,
        });
        // Restore deck from saved card IDs
        if (data.deck_ids && data.deck_ids.length > 0) {
          const restoredDeck = data.deck_ids
            .map((id: string) => allCards.find(c => c.id === id))
            .filter(Boolean) as GameCard[];
          if (restoredDeck.length > 0) setDeck(restoredDeck);
        }
      } else {
        // New player - create initial progress row
        await supabase.from('player_progress').insert({
          user_id: user.id,
        });
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  // Save progress to DB (debounced)
  const saveProgress = useCallback(() => {
    if (!user || !loaded) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      const arena = getArenaForTrophies(profile.trophies);
      await supabase.from('player_progress').update({
        level: profile.level,
        xp: profile.xp,
        max_xp: profile.maxXp,
        trophies: profile.trophies,
        max_trophies: Math.max(profile.trophies, profile.maxTrophies),
        arena: arena.id,
        arena_name: arena.name,
        wins: profile.wins,
        losses: profile.losses,
        three_crown_wins: profile.threeCrownWins,
        challenge_max_wins: profile.challengeMaxWins,
        war_day_wins: profile.warDayWins,
        clan_cards_collected: profile.clanCardsCollected,
        total_donations: profile.totalDonations,
        gold: profile.gold,
        gems: profile.gems,
        star_points: profile.starPoints,
        deck_ids: deck.map(c => c.id),
      }).eq('user_id', user.id);
      setSaving(false);
    }, 1000);
  }, [user, loaded, profile, deck]);

  // Auto-save when profile or deck changes
  useEffect(() => {
    if (loaded) saveProgress();
  }, [profile, deck, loaded]);

  // Keep profile name in sync with username
  const currentProfile = { ...profile, name: username || profile.name };

  return (
    <GameContext.Provider value={{
      screen, setScreen,
      profile: currentProfile, setProfile,
      deck, setDeck,
      chests, setChests,
      clan, setClan,
      battleResult, setBattleResult,
      activeTab, setActiveTab,
      saving,
    }}>
      {children}
    </GameContext.Provider>
  );
};
