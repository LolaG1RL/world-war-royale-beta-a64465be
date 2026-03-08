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
                { name: 'Win 3 Battles', progress: 0, max: 3, reward: '💰 200' },
                { name: 'Play 5 Cards', progress: 0, max: 5, reward: '💰 100' },
                { name: 'Destroy 10 Towers', progress: 0, max: 10, reward: '💎 5' },
              ].map((q, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-t border-border/30">
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-foreground">{q.name}</div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(q.progress / q.max) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{q.progress}/{q.max}</span>
                  <span className="text-[9px] font-bold text-primary">{q.reward}</span>
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
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <div className="text-sm font-display font-bold text-foreground">No Active Tournament</div>
            <div className="text-xs text-muted-foreground text-center mt-1">Check back soon for the next tournament!</div>
          </div>
        )}
      </div>

      <BottomNav active="events" setScreen={setScreen} />
    </div>
  );
};

export default EventsScreen;
