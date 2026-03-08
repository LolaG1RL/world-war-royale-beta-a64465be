import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { getArenaForTrophies } from '@/data/cards';
import { BottomNav } from './BottomNav';
import { ChevronLeft, Copy, Shield, Award, Target, Crown, Star, LogOut, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ProfileScreen = () => {
  const { setScreen, profile, deck } = useGame();
  const { signOut, playerTag } = useAuth();
  const arena = getArenaForTrophies(profile.trophies);
  const [copied, setCopied] = useState(false);

  const copyTag = () => {
    if (playerTag) {
      navigator.clipboard.writeText(playerTag);
      setCopied(true);
      toast.success('Player tag copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const stats = [
    { label: 'Wins', value: profile.wins, icon: '⚔️' },
    { label: 'Losses', value: profile.losses, icon: '💀' },
    { label: '3 Crown Wins', value: profile.threeCrownWins, icon: '👑' },
    { label: 'Max Trophies', value: profile.maxTrophies, icon: '🏆' },
    { label: 'Challenge Max', value: profile.challengeMaxWins, icon: '🏅' },
    { label: 'War Day Wins', value: profile.warDayWins, icon: '⚔️' },
    { label: 'Cards Collected', value: profile.clanCardsCollected, icon: '🃏' },
    { label: 'Total Donations', value: profile.totalDonations, icon: '📦' },
  ];

  const badges = [
    { name: 'Grand Champion', emoji: '🏆', earned: false },
    { name: 'War Hero', emoji: '⚔️', earned: profile.warDayWins > 0 },
    { name: 'Card Master', emoji: '🃏', earned: profile.clanCardsCollected > 0 },
    { name: 'Generous Donor', emoji: '📦', earned: profile.totalDonations > 0 },
    { name: 'Legendary Player', emoji: '🌟', earned: profile.maxTrophies >= 4000 },
    { name: 'Speed Demon', emoji: '⚡', earned: profile.wins >= 100 },
  ];

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <button onClick={() => setScreen('menu')} className="text-muted-foreground"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">Deaf ID Profile</h2>
        <button className="text-muted-foreground text-[10px]">⚙️</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile card */}
        <div className="bg-gradient-to-b from-[hsl(220,25%,14%)] to-[hsl(220,20%,11%)] p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-3xl shadow-lg">
              👤
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-display font-bold text-foreground">{profile.name}</span>
                <span className="bg-[hsl(210,60%,40%)] px-1.5 py-0.5 rounded text-[8px] font-bold text-foreground">Lvl {profile.level}</span>
              </div>
              <button
                onClick={copyTag}
                className="flex items-center gap-1 mt-0.5 text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
              >
                <span>{playerTag || '...'}</span>
                {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              </button>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-primary">🏆 {profile.trophies}</span>
                <span className="text-[10px] text-muted-foreground">{arena.emoji} {arena.name}</span>
              </div>
            </div>
          </div>
          {/* XP bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[8px] text-muted-foreground mb-0.5">
              <span>Level {profile.level}</span>
              <span>{profile.xp}/{profile.maxXp} XP</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[hsl(210,60%,50%)] rounded-full" style={{ width: `${(profile.xp / profile.maxXp) * 100}%` }} />
            </div>
          </div>
          <p className="text-[8px] text-muted-foreground mt-2">Share your player tag so friends can add you!</p>
        </div>

        {/* Stats grid */}
        <div className="p-3">
          <div className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Battle Statistics</div>
          <div className="grid grid-cols-2 gap-1.5">
            {stats.map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-2 flex items-center gap-2">
                <span className="text-sm">{stat.icon}</span>
                <div>
                  <div className="text-[8px] text-muted-foreground">{stat.label}</div>
                  <div className="text-xs font-bold text-foreground">{stat.value.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Win rate */}
        <div className="px-3 pb-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-[10px] font-bold text-foreground mb-2">Win Rate</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex">
                {(profile.wins + profile.losses) > 0 ? (
                  <>
                    <div className="h-full bg-hp-green" style={{ width: `${(profile.wins / (profile.wins + profile.losses)) * 100}%` }} />
                    <div className="h-full bg-hp-red" style={{ width: `${(profile.losses / (profile.wins + profile.losses)) * 100}%` }} />
                  </>
                ) : (
                  <div className="h-full bg-muted w-full" />
                )}
              </div>
              <span className="text-xs font-bold text-foreground">{(profile.wins + profile.losses) > 0 ? ((profile.wins / (profile.wins + profile.losses)) * 100).toFixed(1) : '0.0'}%</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="px-3 pb-3">
          <div className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Badges</div>
          <div className="grid grid-cols-3 gap-1.5">
            {badges.map((badge, i) => (
              <div key={i} className={`bg-card border rounded-lg p-2 text-center ${badge.earned ? 'border-primary/30' : 'border-border opacity-40'}`}>
                <span className="text-xl">{badge.emoji}</span>
                <div className="text-[8px] font-bold text-foreground mt-0.5">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite deck */}
        <div className="px-3 pb-3">
          <div className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">Favorite Deck</div>
          <div className="bg-card border border-border rounded-lg p-2">
            <div className="grid grid-cols-8 gap-0.5">
              {deck.map(card => (
                <div key={card.id} className="text-center">
                  <span className="text-lg">{card.emoji}</span>
                  <div className="text-[6px] text-muted-foreground truncate">{card.name.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="px-3 pb-4">
          <button onClick={signOut} className="w-full py-2.5 bg-accent/10 border border-accent/20 rounded-xl text-xs font-bold text-accent uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-accent/20 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out of Deaf ID
          </button>
        </div>
      </div>

      <BottomNav active="battle" setScreen={setScreen} />
    </div>
  );
};

export default ProfileScreen;
