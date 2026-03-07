import { useGame } from '@/context/GameContext';
import { BottomNav } from './ShopScreen';
import { useState } from 'react';
import { MessageCircle, UserPlus, Search, Shield, Swords as SwordsIcon } from 'lucide-react';

const SocialScreen = () => {
  const { setScreen, clan, profile } = useGame();
  const [tab, setTab] = useState<'clan' | 'friends' | 'global'>('clan');

  const clanMembers = [
    { name: 'Warrior', trophies: 4250, role: 'Leader', donations: 120, online: true },
    { name: 'ShadowBlade', trophies: 4100, role: 'Co-Leader', donations: 95, online: true },
    { name: 'DragonSlayer', trophies: 3980, role: 'Elder', donations: 80, online: false },
    { name: 'PhoenixRise', trophies: 3850, role: 'Elder', donations: 110, online: true },
    { name: 'NightHawk', trophies: 3700, role: 'Member', donations: 45, online: false },
    { name: 'IronFist', trophies: 3650, role: 'Member', donations: 60, online: false },
    { name: 'StormKing', trophies: 3500, role: 'Member', donations: 30, online: true },
    { name: 'ViperStrike', trophies: 3400, role: 'Member', donations: 55, online: false },
    { name: 'TitanLord', trophies: 3350, role: 'Member', donations: 70, online: false },
    { name: 'BlazeFury', trophies: 3200, role: 'Member', donations: 25, online: true },
  ];

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">Social</h2>
        <button className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
          <UserPlus className="w-3 h-3 inline mr-1" />Add Friend
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        {(['clan', 'friends', 'global'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'clan' && (
        <>
          {/* Clan header */}
          <div className="bg-[hsl(220,20%,13%)] p-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-2xl">
                {clan.badge}
              </div>
              <div className="flex-1">
                <div className="text-sm font-display font-bold text-foreground">{clan.name}</div>
                <div className="text-[9px] text-muted-foreground">{clan.tag} • {clan.members}/{clan.maxMembers} members</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] text-primary font-bold">🏆 {clan.trophies.toLocaleString()}</span>
                  <span className="text-[9px] text-muted-foreground">📦 {clan.donations} donations/wk</span>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-2 italic">"{clan.description}"</p>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 py-1.5 bg-primary/20 text-primary rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                <MessageCircle className="w-3 h-3" />Chat
              </button>
              <button className="flex-1 py-1.5 bg-accent/20 text-accent rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                <SwordsIcon className="w-3 h-3" />Clan War
              </button>
              <button className="flex-1 py-1.5 bg-secondary text-muted-foreground rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                <Search className="w-3 h-3" />Search
              </button>
            </div>
          </div>

          {/* Members list */}
          <div className="flex-1 overflow-y-auto">
            {clanMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-border/50 hover:bg-muted/20 transition-colors">
                <div className="text-[10px] text-muted-foreground font-bold w-4">{i + 1}</div>
                <div className={`w-2 h-2 rounded-full ${m.online ? 'bg-hp-green' : 'bg-muted-foreground/30'}`} />
                <div className="flex-1">
                  <div className="text-xs font-bold text-foreground">{m.name}</div>
                  <div className="text-[8px] text-muted-foreground">
                    <span className={m.role === 'Leader' ? 'text-primary' : m.role === 'Co-Leader' ? 'text-legendary' : m.role === 'Elder' ? 'text-epic' : ''}>{m.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-foreground flex items-center gap-1 justify-end">🏆 {m.trophies}</div>
                  <div className="text-[8px] text-muted-foreground">📦 {m.donations}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'friends' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <UserPlus className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <div className="text-sm font-display font-bold text-foreground">Add Friends</div>
          <div className="text-xs text-muted-foreground text-center mt-1">Search by tag or invite friends for quick friendly battles!</div>
          <div className="flex items-center gap-2 mt-4 w-full max-w-xs">
            <input className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-foreground border border-border" placeholder="Enter player tag..." />
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold">Add</button>
          </div>
        </div>
      )}

      {tab === 'global' && (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-display font-bold text-foreground mb-2 uppercase">Global Leaderboard</div>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30">
              <span className={`text-[10px] font-bold w-5 text-center ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>#{i + 1}</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-foreground">Player_{1000 + i}</div>
                <div className="text-[8px] text-muted-foreground">Clan #{i + 1}</div>
              </div>
              <span className="text-[10px] font-bold text-primary">🏆 {(9000 - i * 120).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <BottomNav active="social" setScreen={setScreen} />
    </div>
  );
};

export default SocialScreen;
