import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { allCards } from '@/data/cards';
import { motion } from 'framer-motion';

const DEAF_MODE_EMAIL = 'tuasfait@gmail.com';

const DeafMode = () => {
  const { user } = useAuth();
  const { profile, setProfile, setScreen, setBattleResult, screen, deck, setDeck } = useGame();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 20, y: 80 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const wasDragged = useRef(false);

  // Only show for the special email
  if (user?.email !== DEAF_MODE_EMAIL) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    wasDragged.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) wasDragged.current = true;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - 48, dragStart.current.px + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 48, dragStart.current.py + dy)),
    });
  };

  const handlePointerUp = () => {
    setDragging(false);
    if (!wasDragged.current) setOpen(o => !o);
  };

  const inBattle = screen === 'battle';

  const modActions = {
    // Out-of-battle
    addGems: (n: number) => setProfile(p => ({ ...p, gems: p.gems + n })),
    addGold: (n: number) => setProfile(p => ({ ...p, gold: p.gold + n })),
    setLevel: (n: number) => setProfile(p => ({ ...p, level: Math.max(1, Math.min(14, n)) })),
    addTrophies: (n: number) => setProfile(p => ({ ...p, trophies: Math.max(0, p.trophies + n), maxTrophies: Math.max(p.maxTrophies, p.trophies + n) })),
    unlockAllCards: () => {
      const fullDeck = allCards.slice(0, 8);
      setDeck(fullDeck);
    },
    maxCards: () => {
      setProfile(p => ({ ...p, level: 14 }));
    },
    // In-battle (dispatches custom events that BattleArena listens for)
    instaWin: () => {
      window.dispatchEvent(new CustomEvent('deaf-mod', { detail: { action: 'insta-win' } }));
    },
    instaLose: () => {
      window.dispatchEvent(new CustomEvent('deaf-mod', { detail: { action: 'insta-lose' } }));
    },
    instaElixir: () => {
      window.dispatchEvent(new CustomEvent('deaf-mod', { detail: { action: 'insta-elixir' } }));
    },
    spawnUnit: () => {
      window.dispatchEvent(new CustomEvent('deaf-mod', { detail: { action: 'spawn-unit' } }));
    },
  };

  return (
    <>
      {/* Draggable cube */}
      <div
        className="fixed z-[9999] touch-none select-none"
        style={{ left: pos.x, top: pos.y }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[8px] font-black uppercase leading-tight text-center cursor-grab active:cursor-grabbing shadow-lg border transition-colors ${open ? 'bg-[hsl(0,70%,50%)] border-[hsl(0,70%,65%)] text-white' : 'bg-[hsl(260,60%,50%)] border-[hsl(260,60%,65%)] text-white'}`}>
          Deaf<br/>Mode
        </div>
      </div>

      {/* Mod menu panel */}
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-[9998] bg-[hsl(220,25%,8%,0.97)] border border-border rounded-xl p-3 w-64 max-h-[70vh] overflow-y-auto shadow-2xl"
          style={{ left: Math.min(pos.x, window.innerWidth - 280), top: Math.min(pos.y + 50, window.innerHeight - 400) }}
        >
          <div className="text-xs font-display font-bold text-[hsl(0,70%,60%)] uppercase tracking-widest mb-2 text-center">
            🔧 Deaf Mode 🔧
          </div>

          {/* Out-of-battle mods */}
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Resources</div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            <ModBtn label="💎 +100 Gems" onClick={() => modActions.addGems(100)} />
            <ModBtn label="💎 +1000 Gems" onClick={() => modActions.addGems(1000)} />
            <ModBtn label="💰 +1000 Gold" onClick={() => modActions.addGold(1000)} />
            <ModBtn label="💰 +10K Gold" onClick={() => modActions.addGold(10000)} />
          </div>

          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Progress</div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            <ModBtn label="🏆 +100 Trophies" onClick={() => modActions.addTrophies(100)} />
            <ModBtn label="🏆 +1000 Trophies" onClick={() => modActions.addTrophies(1000)} />
            <ModBtn label="🏆 -100 Trophies" onClick={() => modActions.addTrophies(-100)} variant="danger" />
            <ModBtn label="🏆 Reset to 0" onClick={() => setProfile(p => ({ ...p, trophies: 0 }))} variant="danger" />
          </div>

          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Level</div>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {[1, 5, 8, 10, 13, 14].map(l => (
              <ModBtn key={l} label={`Lv.${l}`} onClick={() => modActions.setLevel(l)} active={profile.level === l} />
            ))}
          </div>

          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Cards</div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            <ModBtn label="Max Level" onClick={modActions.maxCards} />
            <ModBtn label="Reset Deck" onClick={() => setDeck(allCards.slice(0, 8))} />
          </div>

          {/* In-battle mods */}
          {inBattle && (
            <>
              <div className="text-[9px] font-bold text-[hsl(0,70%,60%)] uppercase tracking-wider mb-1.5 mt-1">⚔️ Battle Cheats</div>
              <div className="grid grid-cols-2 gap-1">
                <ModBtn label="⚡ Max Elixir" onClick={modActions.instaElixir} variant="battle" />
                <ModBtn label="👹 Spawn Unit" onClick={modActions.spawnUnit} variant="battle" />
                <ModBtn label="🏆 Insta Win" onClick={modActions.instaWin} variant="win" />
                <ModBtn label="💀 Insta Lose" onClick={modActions.instaLose} variant="danger" />
              </div>
            </>
          )}
        </motion.div>
      )}
    </>
  );
};

const ModBtn = ({ label, onClick, variant = 'default', active = false }: { label: string; onClick: () => void; variant?: 'default' | 'danger' | 'battle' | 'win'; active?: boolean }) => {
  const colors = {
    default: 'bg-[hsl(220,15%,18%)] hover:bg-[hsl(220,15%,22%)] text-foreground border-border',
    danger: 'bg-[hsl(0,40%,18%)] hover:bg-[hsl(0,40%,24%)] text-[hsl(0,70%,65%)] border-[hsl(0,30%,25%)]',
    battle: 'bg-[hsl(260,40%,18%)] hover:bg-[hsl(260,40%,24%)] text-[hsl(260,70%,75%)] border-[hsl(260,30%,30%)]',
    win: 'bg-[hsl(120,40%,15%)] hover:bg-[hsl(120,40%,20%)] text-[hsl(120,60%,65%)] border-[hsl(120,30%,25%)]',
  };

  return (
    <button
      onClick={onClick}
      className={`px-2 py-1.5 rounded-md text-[9px] font-bold border transition-colors ${colors[variant]} ${active ? 'ring-1 ring-primary' : ''}`}
    >
      {label}
    </button>
  );
};

export default DeafMode;
