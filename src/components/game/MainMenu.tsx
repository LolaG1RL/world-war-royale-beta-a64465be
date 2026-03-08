import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { getArenaForTrophies, trophyRoadRewards } from '@/data/cards';
import CardComponent from './CardComponent';
import { motion } from 'framer-motion';
import { Swords, Trophy, Crown, Map, Star, Mail } from 'lucide-react';
import splashImage from '@/assets/world-war-royale-splash.png';
import { supabase } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';
import { BottomNav } from './BottomNav';
import BattleBannerDisplay from './BattleBannerDisplay';
import { getPlayerBanner } from '@/data/banners';

const MainMenu = () => {
  const { profile, deck, chests, setScreen, setActiveTab } = useGame();
  const { signOut, user } = useAuth();
  const arena = getArenaForTrophies(profile.trophies);
  const playerBanner = getPlayerBanner();
  const [unreadMail, setUnreadMail] = useState(0);
  const [unclaimedTrophy, setUnclaimedTrophy] = useState(0);
  const [unclaimedWarPass, setUnclaimedWarPass] = useState(0);

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
        const WAR_PASS_TIERS = [2,4,7,10,14,18,22,27,32,37,42,48,54,60,67,74,82,90,98,110];
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
          {/* Resources */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <div className="flex items-center gap-1 bg-[hsl(220,15%,16%)] pl-1.5 pr-2.5 py-1 rounded-full border border-border">
              <span className="text-xs">💰</span>
              <span className="text-[10px] font-bold text-foreground">{profile.gold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 bg-[hsl(220,15%,16%)] pl-1.5 pr-2.5 py-1 rounded-full border border-border">
              <span className="text-xs">💎</span>
              <span className="text-[10px] font-bold text-foreground">{profile.gems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trophy/Arena display */}
      <div className="relative z-10 flex items-center justify-center py-2 bg-[hsl(220,20%,11%,0.8)]">
        <div className="flex items-center gap-3">
          <div className="trophy-badge">
            <Trophy className="w-3.5 h-3.5" />
            <span>{profile.trophies.toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            <span className="text-foreground font-semibold">{arena.emoji} {arena.name}</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Arena / Events buttons row */}
        <div className="flex gap-1.5 px-3 py-2">
          <button onClick={() => { setActiveTab('trophy-road'); setScreen('trophy-road'); }} className="flex-1 bg-[hsl(220,15%,16%)] border border-border rounded-lg py-2 px-2 flex items-center gap-2 hover:bg-[hsl(220,15%,20%)] transition-colors relative">
            <Map className="w-4 h-4 text-primary" />
            <div className="text-left">
              <div className="text-[9px] font-bold text-foreground">Trophy Road</div>
              <div className="text-[7px] text-muted-foreground">Arena {arena.id}</div>
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
              <div className="text-[9px] font-bold text-foreground">Events</div>
              <div className="text-[7px] text-muted-foreground">Special Challenge</div>
            </div>
          </button>
        </div>
        <div className="flex gap-1.5 px-3 pb-2">
          <button onClick={() => setScreen('mailbox')} className="flex-1 bg-[hsl(220,15%,16%)] border border-border rounded-lg py-2 px-2 flex items-center gap-2 hover:bg-[hsl(220,15%,20%)] transition-colors relative">
            <Mail className="w-4 h-4 text-primary" />
            <div className="text-left">
              <div className="text-[9px] font-bold text-foreground">Mailbox</div>
              <div className="text-[7px] text-muted-foreground">Messages</div>
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
              <div className="text-[9px] font-bold text-foreground">War Pass</div>
              <div className="text-[7px] text-muted-foreground">Earn Crowns</div>
            </div>
            {unclaimedWarPass > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                <span className="text-[7px] font-black text-accent-foreground">{unclaimedWarPass > 9 ? '9+' : unclaimedWarPass}</span>
              </div>
            )}
          </button>
        </div>

        {/* Battle Button - Center piece */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4"
          >
            <img src={logoImage} alt="World War Royale" className="w-48 h-auto drop-shadow-2xl" />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setScreen('battle')}
            className="btn-battle text-lg flex items-center gap-2"
          >
            <Swords className="w-5 h-5" />
            BATTLE
          </motion.button>

          {/* 1v1 / 2v2 toggle */}
          <div className="flex gap-2 mt-3">
            <button className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-[10px] font-bold text-primary">1v1</button>
            <button className="px-4 py-1.5 rounded-full bg-secondary text-[10px] font-bold text-muted-foreground border border-border">2v2</button>
            <button className="px-4 py-1.5 rounded-full bg-secondary text-[10px] font-bold text-muted-foreground border border-border">Party</button>
          </div>
        </div>

        {/* Current deck preview */}
        <div className="px-3 mb-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Current Deck</span>
            <button onClick={() => { setActiveTab('cards'); setScreen('deck'); }} className="text-[9px] text-primary font-bold">Edit Deck →</button>
          </div>
          <div className="grid grid-cols-8 gap-0.5">
            {deck.slice(0, 8).map((card) => (
              <CardComponent key={card.id} card={card} size="xs" showElixir={false} />
            ))}
          </div>
        </div>

      </div>

      {/* Bottom navigation - CR style */}
      <BottomNav active="battle" setScreen={setScreen} />
    </div>
  );
};

export default MainMenu;
