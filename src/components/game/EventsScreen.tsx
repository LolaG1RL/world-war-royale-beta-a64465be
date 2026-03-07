import { useGame } from '@/context/GameContext';
import { BottomNav } from './ShopScreen';
import { useState } from 'react';
import { Swords, Trophy, Clock, Star, Gift, Zap, ChevronRight } from 'lucide-react';

const challenges = [
  { id: 1, name: 'Grand Challenge', emoji: '🏆', description: '12 wins for ultimate reward', entry: '100 gems', active: true, wins: 0, losses: 0, maxWins: 12, maxLosses: 3 },
  { id: 2, name: 'Classic Challenge', emoji: '⚔️', description: '12 wins for great loot', entry: '10 gems', active: true, wins: 0, losses: 0, maxWins: 12, maxLosses: 3 },
  { id: 3, name: 'Global Tournament', emoji: '🌍', description: 'Compete against the world!', entry: 'Free', active: true, wins: 0, losses: 0, maxWins: 20, maxLosses: 0 },
  { id: 4, name: 'Sudden Death', emoji: '💀', description: 'One tower down = game over', entry: '10 gems', active: true, wins: 0, losses: 0, maxWins: 9, maxLosses: 3 },
  { id: 5, name: 'Double Elixir', emoji: '⚡', description: 'Twice the elixir, twice the chaos', entry: 'Free', active: true, wins: 0, losses: 0, maxWins: 6, maxLosses: 3 },
  { id: 6, name: 'Draft Challenge', emoji: '🎲', description: 'Pick cards for your opponent!', entry: '100 gems', active: false, wins: 0, losses: 0, maxWins: 12, maxLosses: 3 },
];

const specialEvents = [
  { name: 'Clan War Day', emoji: '⚔️', timeLeft: '1d 5h', description: 'War battles remaining: 2/4', type: 'war' },
  { name: 'Album Event', emoji: '📖', timeLeft: '23d', description: 'Collect snippets for exclusive rewards!', type: 'album' },
  { name: 'Season Challenge', emoji: '🏅', timeLeft: '12d', description: 'Complete challenges for season rewards', type: 'season' },
];

const EventsScreen = () => {
  const { setScreen } = useGame();
  const [tab, setTab] = useState<'events' | 'challenges' | 'tournaments'>('events');

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">Events</h2>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />Season ends: 12d
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        {(['events', 'challenges', 'tournaments'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'events' && (
          <div className="p-3 space-y-2">
            {/* War Pass banner */}
            <div className="bg-gradient-to-r from-[hsl(340,50%,22%)] to-[hsl(280,40%,18%)] rounded-xl p-4 border border-[hsl(340,50%,35%)]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎖️</span>
                <div>
                  <div className="text-sm font-display font-bold text-foreground">WAR PASS</div>
                  <div className="text-[9px] text-foreground/70">Season 1 • Tier 15/35</div>
                </div>
              </div>
              <div className="mt-2 h-2 bg-[hsl(0,0%,0%,0.4)] rounded-full">
                <div className="h-full bg-primary rounded-full" style={{ width: '43%' }} />
              </div>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`flex-1 h-6 rounded text-center text-[8px] flex items-center justify-center ${i < 4 ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'}`}>
                    {i < 4 ? '✓' : i + 12}
                  </div>
                ))}
              </div>
            </div>

            {/* Special events */}
            {specialEvents.map((event, i) => (
              <button key={i} className="w-full bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
                <span className="text-2xl">{event.emoji}</span>
                <div className="flex-1 text-left">
                  <div className="text-xs font-bold text-foreground">{event.name}</div>
                  <div className="text-[9px] text-muted-foreground">{event.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] text-primary font-bold">{event.timeLeft}</div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </div>
              </button>
            ))}

            {/* Quests */}
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-xs font-display font-bold text-foreground mb-2">Daily Quests</div>
              {[
                { name: 'Win 3 Battles', progress: 2, max: 3, reward: '💰 200' },
                { name: 'Play 5 Cards', progress: 5, max: 5, reward: '💰 100', done: true },
                { name: 'Destroy 10 Towers', progress: 4, max: 10, reward: '💎 5' },
              ].map((q, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-t border-border/30">
                  <div className="flex-1">
                    <div className={`text-[10px] font-bold ${q.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{q.name}</div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
                      <div className={`h-full rounded-full ${q.done ? 'bg-hp-green' : 'bg-primary'}`} style={{ width: `${(q.progress / q.max) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{q.progress}/{q.max}</span>
                  <span className={`text-[9px] font-bold ${q.done ? 'text-hp-green' : 'text-primary'}`}>{q.done ? '✓' : q.reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'challenges' && (
          <div className="p-3 space-y-2">
            {challenges.map(c => (
              <button key={c.id} className={`w-full bg-card border rounded-xl p-3 flex items-center gap-3 transition-colors ${c.active ? 'border-border hover:border-primary/30' : 'border-border/30 opacity-50'}`}>
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1 text-left">
                  <div className="text-xs font-bold text-foreground">{c.name}</div>
                  <div className="text-[9px] text-muted-foreground">{c.description}</div>
                </div>
                <div className="text-right">
                  <div className={`text-[9px] font-bold ${c.entry === 'Free' ? 'text-hp-green' : 'text-primary'}`}>{c.entry}</div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'tournaments' && (
          <div className="p-3 space-y-2">
            <div className="bg-gradient-to-r from-[hsl(38,80%,22%)] to-[hsl(28,70%,18%)] rounded-xl p-4 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌍</span>
                <div>
                  <div className="text-sm font-display font-bold text-foreground">Global Tournament</div>
                  <div className="text-[9px] text-foreground/70">Season 1 Championship</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-[hsl(0,0%,0%,0.3)] rounded-lg p-2 text-center">
                  <div className="text-[8px] text-muted-foreground">Your Wins</div>
                  <div className="text-lg font-bold text-primary">7</div>
                </div>
                <div className="bg-[hsl(0,0%,0%,0.3)] rounded-lg p-2 text-center">
                  <div className="text-[8px] text-muted-foreground">Rank</div>
                  <div className="text-lg font-bold text-foreground">#2,451</div>
                </div>
                <div className="bg-[hsl(0,0%,0%,0.3)] rounded-lg p-2 text-center">
                  <div className="text-[8px] text-muted-foreground">Time Left</div>
                  <div className="text-lg font-bold text-accent">2d</div>
                </div>
              </div>
              <button className="w-full mt-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase">Play Tournament</button>
            </div>

            {/* Past tournaments */}
            <div className="text-[10px] font-bold text-muted-foreground uppercase mt-3 mb-1">Past Tournaments</div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 opacity-60">
                <span className="text-xl">🏆</span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-foreground">Tournament #{i}</div>
                  <div className="text-[9px] text-muted-foreground">Rank #{100 * i + 50} • 8 wins</div>
                </div>
                <span className="text-[9px] text-muted-foreground">Ended</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="events" setScreen={setScreen} />
    </div>
  );
};

export default EventsScreen;
