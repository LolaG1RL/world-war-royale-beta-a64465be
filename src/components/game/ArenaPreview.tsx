import { useMemo } from 'react';

// Arena theme colors: [ground, groundAccent, river, bridge, towerBlue, towerRed, wallColor]
const ARENA_THEMES: Record<number, { ground: string; accent: string; river: string; bridge: string; wall: string; glow: string }> = {
  1:  { ground: 'hsl(120,20%,25%)', accent: 'hsl(120,15%,30%)', river: 'hsl(200,60%,40%)', bridge: 'hsl(30,40%,30%)', wall: 'hsl(30,20%,35%)', glow: 'hsl(120,30%,50%)' },
  2:  { ground: 'hsl(35,30%,25%)',  accent: 'hsl(35,25%,30%)',  river: 'hsl(200,50%,35%)', bridge: 'hsl(25,35%,28%)', wall: 'hsl(25,30%,40%)', glow: 'hsl(35,50%,55%)' },
  3:  { ground: 'hsl(270,10%,18%)', accent: 'hsl(270,10%,22%)', river: 'hsl(280,30%,30%)', bridge: 'hsl(0,5%,25%)',   wall: 'hsl(270,10%,30%)', glow: 'hsl(270,40%,50%)' },
  4:  { ground: 'hsl(20,15%,20%)',  accent: 'hsl(20,10%,25%)',  river: 'hsl(200,40%,35%)', bridge: 'hsl(20,20%,30%)', wall: 'hsl(0,10%,35%)',   glow: 'hsl(20,60%,50%)' },
  5:  { ground: 'hsl(280,25%,20%)', accent: 'hsl(280,20%,25%)', river: 'hsl(260,50%,45%)', bridge: 'hsl(280,15%,30%)', wall: 'hsl(280,20%,35%)', glow: 'hsl(280,60%,60%)' },
  6:  { ground: 'hsl(30,20%,22%)',  accent: 'hsl(30,15%,28%)',  river: 'hsl(200,45%,38%)', bridge: 'hsl(30,30%,35%)', wall: 'hsl(30,25%,40%)',  glow: 'hsl(40,70%,55%)' },
  7:  { ground: 'hsl(45,25%,22%)',  accent: 'hsl(45,20%,28%)',  river: 'hsl(200,50%,40%)', bridge: 'hsl(40,30%,32%)', wall: 'hsl(45,30%,38%)',  glow: 'hsl(45,80%,60%)' },
  8:  { ground: 'hsl(200,20%,25%)', accent: 'hsl(200,25%,30%)', river: 'hsl(200,60%,50%)', bridge: 'hsl(200,10%,35%)', wall: 'hsl(200,15%,40%)', glow: 'hsl(200,70%,65%)' },
  9:  { ground: 'hsl(140,30%,20%)', accent: 'hsl(140,25%,25%)', river: 'hsl(170,50%,35%)', bridge: 'hsl(30,30%,28%)', wall: 'hsl(140,20%,30%)', glow: 'hsl(140,50%,50%)' },
  10: { ground: 'hsl(10,20%,20%)',  accent: 'hsl(10,15%,25%)',  river: 'hsl(200,40%,35%)', bridge: 'hsl(10,20%,30%)', wall: 'hsl(10,25%,35%)',  glow: 'hsl(10,60%,50%)' },
  11: { ground: 'hsl(240,15%,18%)', accent: 'hsl(240,15%,23%)', river: 'hsl(220,50%,40%)', bridge: 'hsl(240,10%,28%)', wall: 'hsl(240,15%,32%)', glow: 'hsl(50,80%,60%)' },
  12: { ground: 'hsl(270,15%,15%)', accent: 'hsl(270,15%,20%)', river: 'hsl(260,40%,30%)', bridge: 'hsl(270,10%,25%)', wall: 'hsl(270,15%,28%)', glow: 'hsl(30,80%,55%)' },
  13: { ground: 'hsl(30,15%,18%)',  accent: 'hsl(30,10%,23%)',  river: 'hsl(200,40%,32%)', bridge: 'hsl(30,20%,28%)', wall: 'hsl(30,15%,32%)',  glow: 'hsl(0,50%,50%)' },
  14: { ground: 'hsl(210,15%,22%)', accent: 'hsl(210,10%,28%)', river: 'hsl(200,50%,45%)', bridge: 'hsl(210,10%,30%)', wall: 'hsl(210,15%,35%)', glow: 'hsl(200,60%,60%)' },
  15: { ground: 'hsl(45,30%,20%)',  accent: 'hsl(45,25%,25%)',  river: 'hsl(200,55%,42%)', bridge: 'hsl(45,25%,30%)', wall: 'hsl(45,30%,35%)',  glow: 'hsl(45,90%,60%)' },
};

interface ArenaPreviewProps {
  arenaId: number;
  arenaName: string;
  arenaEmoji: string;
}

const ArenaPreview = ({ arenaId, arenaName, arenaEmoji }: ArenaPreviewProps) => {
  const theme = ARENA_THEMES[arenaId] || ARENA_THEMES[1];

  return (
    <div className="relative w-48 rounded-xl overflow-hidden shadow-2xl border border-border/50" style={{ aspectRatio: '3/4' }}>
      {/* Arena ground */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.ground} 35%, ${theme.ground} 65%, ${theme.accent} 100%)` }} />
      
      {/* Grid pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`grid-${arenaId}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${arenaId})`} />
      </svg>

      {/* Lane divider */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px opacity-10" style={{ background: 'white' }} />

      {/* River */}
      <div className="absolute left-0 right-0 top-[46%] h-[8%]" style={{ background: theme.river }}>
        <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)` }} />
        {/* Ripple effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Left bridge */}
      <div className="absolute left-[15%] top-[44%] w-[20%] h-[12%] rounded-sm z-10" style={{ background: theme.bridge, border: `1px solid ${theme.wall}` }}>
        <div className="absolute inset-x-1 top-1 bottom-1 rounded-sm opacity-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
      </div>
      {/* Right bridge */}
      <div className="absolute right-[15%] top-[44%] w-[20%] h-[12%] rounded-sm z-10" style={{ background: theme.bridge, border: `1px solid ${theme.wall}` }}>
        <div className="absolute inset-x-1 top-1 bottom-1 rounded-sm opacity-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      {/* Enemy towers (top) */}
      {/* King tower */}
      <div className="absolute top-[6%] left-1/2 -translate-x-1/2 z-20">
        <div className="w-7 h-7 rounded-md bg-red-800 border-2 border-red-500 flex items-center justify-center shadow-lg">
          <span className="text-[10px]">👑</span>
        </div>
      </div>
      {/* Princess towers */}
      <div className="absolute top-[18%] left-[18%] z-20">
        <div className="w-5 h-5 rounded-md bg-red-800 border border-red-500 flex items-center justify-center shadow">
          <span className="text-[8px]">🗼</span>
        </div>
      </div>
      <div className="absolute top-[18%] right-[18%] z-20">
        <div className="w-5 h-5 rounded-md bg-red-800 border border-red-500 flex items-center justify-center shadow">
          <span className="text-[8px]">🗼</span>
        </div>
      </div>

      {/* Player towers (bottom) */}
      {/* King tower */}
      <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 z-20">
        <div className="w-7 h-7 rounded-md bg-blue-800 border-2 border-blue-400 flex items-center justify-center shadow-lg">
          <span className="text-[10px]">👑</span>
        </div>
      </div>
      {/* Princess towers */}
      <div className="absolute bottom-[18%] left-[18%] z-20">
        <div className="w-5 h-5 rounded-md bg-blue-800 border border-blue-400 flex items-center justify-center shadow">
          <span className="text-[8px]">🗼</span>
        </div>
      </div>
      <div className="absolute bottom-[18%] right-[18%] z-20">
        <div className="w-5 h-5 rounded-md bg-blue-800 border border-blue-400 flex items-center justify-center shadow">
          <span className="text-[8px]">🗼</span>
        </div>
      </div>

      {/* Arena name banner at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm py-1 px-2 z-30">
        <div className="text-center">
          <span className="text-[10px] font-display font-bold text-foreground drop-shadow">{arenaEmoji} {arenaName}</span>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 30px ${theme.glow}33` }} />
    </div>
  );
};

export default ArenaPreview;
