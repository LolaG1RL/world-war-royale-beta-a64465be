import { useGame } from '@/context/GameContext';
import { BottomNav } from './ShopScreen';
import { useState } from 'react';
import { MessageCircle, UserPlus, Search, Shield, Swords as SwordsIcon, Plus } from 'lucide-react';

const SocialScreen = () => {
  const { setScreen, clan, profile, setClan, setProfile } = useGame();
  const [tab, setTab] = useState<'clan' | 'friends' | 'global'>('clan');
  const [showCreateClan, setShowCreateClan] = useState(false);
  const [clanName, setClanName] = useState('');
  const [clanDescription, setClanDescription] = useState('');

  const handleCreateClan = () => {
    if (!clanName.trim() || clanName.length < 3) return;
    if (profile.gems < 100) return;

    setProfile(prev => ({ ...prev, gems: prev.gems - 100 }));
    setClan({
      name: clanName.trim(),
      tag: `#${clanName.trim().substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 9000 + 1000)}`,
      members: 1,
      maxMembers: 50,
      trophies: profile.trophies,
      badge: '⚔️',
      description: clanDescription.trim() || 'A new clan ready for war!',
      donations: 0,
    });
    setShowCreateClan(false);
    setClanName('');
    setClanDescription('');
  };

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
          {!clan ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {showCreateClan ? (
                <div className="w-full max-w-xs space-y-3">
                  <h3 className="text-sm font-display font-bold text-foreground text-center">Create a Clan</h3>
                  <p className="text-[10px] text-muted-foreground text-center">Costs 💎 100 gems</p>
                  <input
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-xs text-foreground border border-border"
                    placeholder="Clan name (3-15 chars)"
                    value={clanName}
                    onChange={e => setClanName(e.target.value.substring(0, 15))}
                  />
                  <textarea
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-xs text-foreground border border-border resize-none"
                    placeholder="Description (optional)"
                    rows={2}
                    value={clanDescription}
                    onChange={e => setClanDescription(e.target.value.substring(0, 100))}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateClan(false)}
                      className="flex-1 py-2 bg-secondary text-muted-foreground rounded-lg text-xs font-bold border border-border"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateClan}
                      disabled={profile.gems < 100 || clanName.trim().length < 3}
                      className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-40"
                    >
                      Create (💎 100)
                    </button>
                  </div>
                  {profile.gems < 100 && (
                    <p className="text-[9px] text-destructive text-center">Not enough gems! You have {profile.gems}.</p>
                  )}
                </div>
              ) : (
                <>
                  <Shield className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <div className="text-sm font-display font-bold text-foreground">No Clan</div>
                  <div className="text-xs text-muted-foreground text-center mt-1">Join or create a clan to battle together!</div>
                  <div className="flex gap-2 mt-4">
                    <button className="px-6 py-2 bg-secondary text-muted-foreground rounded-lg text-xs font-bold border border-border flex items-center gap-1">
                      <Search className="w-3 h-3" />Search Clans
                    </button>
                    <button
                      onClick={() => setShowCreateClan(true)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />Create (💎 100)
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
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

              {/* Members list - just you */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 px-3 py-2 border-b border-border/50">
                  <div className="text-[10px] text-muted-foreground font-bold w-4">1</div>
                  <div className="w-2 h-2 rounded-full bg-hp-green" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-foreground">{profile.name}</div>
                    <div className="text-[8px] text-primary">Leader</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-foreground flex items-center gap-1 justify-end">🏆 {profile.trophies}</div>
                    <div className="text-[8px] text-muted-foreground">📦 0</div>
                  </div>
                </div>
              </div>
            </>
          )}
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
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <div className="text-sm font-display font-bold text-foreground">Global Leaderboard</div>
          <div className="text-xs text-muted-foreground text-center mt-1">No players yet. Be the first to climb!</div>
        </div>
      )}

      <BottomNav active="social" setScreen={setScreen} />
    </div>
  );
};

export default SocialScreen;
