import { useState } from 'react';
import { GameCard, getStarterDeck } from '@/data/cards';
import CardComponent from './CardComponent';
import { motion } from 'framer-motion';
import { Swords, Trophy, Users, ScrollText, Settings, Crown } from 'lucide-react';

interface MainMenuProps {
  trophies: number;
  playerName: string;
  deck: GameCard[];
  onBattle: () => void;
  onDeck: () => void;
}

const MainMenu = ({ trophies, playerName, deck, onBattle, onDeck }: MainMenuProps) => {
  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,8%)] via-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">{playerName}</div>
            <div className="text-[10px] text-muted-foreground">Deaf ID</div>
          </div>
        </div>
        <div className="trophy-badge">
          <Trophy className="w-3.5 h-3.5" />
          <span>{trophies}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
            <span className="text-primary text-xs">💰</span>
            <span className="text-xs font-bold text-foreground">2,450</span>
          </div>
          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
            <span className="text-elixir text-xs">💎</span>
            <span className="text-xs font-bold text-foreground">120</span>
          </div>
        </div>
      </div>

      {/* Arena display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
        >
          <div className="text-6xl mb-2 text-center">⚔️</div>
          <h1 className="font-display font-black text-2xl text-foreground text-center tracking-wider">
            WAR OF AGES
          </h1>
          <p className="text-muted-foreground text-xs text-center mt-1 tracking-widest uppercase">
            Arena of Legends
          </p>
        </motion.div>

        {/* Battle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBattle}
          className="btn-battle text-xl mb-8"
        >
          <Swords className="inline w-5 h-5 mr-2 -mt-0.5" />
          BATTLE!
        </motion.button>

        {/* Current deck preview */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Your Deck</span>
            <button onClick={onDeck} className="text-xs text-primary font-semibold">Edit →</button>
          </div>
          <div className="grid grid-cols-8 gap-1">
            {deck.slice(0, 8).map((card, i) => (
              <CardComponent key={card.id} card={card} size="sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="relative z-10 flex items-stretch bg-card/90 backdrop-blur-sm border-t border-border">
        <button className="nav-tab flex-1">
          <Users className="w-5 h-5" />
          <span>Social</span>
        </button>
        <button className="nav-tab flex-1">
          <ScrollText className="w-5 h-5" />
          <span>Shop</span>
        </button>
        <button className="nav-tab active flex-1">
          <Swords className="w-5 h-5" />
          <span>Battle</span>
        </button>
        <button onClick={onDeck} className="nav-tab flex-1">
          <Crown className="w-5 h-5" />
          <span>Cards</span>
        </button>
        <button className="nav-tab flex-1">
          <Settings className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
