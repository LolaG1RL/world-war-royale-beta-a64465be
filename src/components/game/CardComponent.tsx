import { GameCard } from '@/data/cards';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCardTap, playCardSfx } from '@/lib/sfx';

interface CardComponentProps {
  card: GameCard;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  showElixir?: boolean;
  showLevel?: boolean;
  showCount?: boolean;
}

const sizeClasses = {
  xs: 'w-10 h-13',
  sm: 'w-14 h-[72px]',
  md: 'w-[72px] h-[96px]',
  lg: 'w-28 h-40',
};

const rarityGradients: Record<string, string> = {
  common: 'from-[hsl(200,8%,35%)] to-[hsl(200,10%,20%)]',
  rare: 'from-[hsl(210,50%,40%)] to-[hsl(210,60%,22%)]',
  epic: 'from-[hsl(280,45%,40%)] to-[hsl(280,60%,20%)]',
  legendary: 'from-[hsl(38,85%,48%)] to-[hsl(28,90%,28%)]',
  champion: 'from-[hsl(340,60%,45%)] to-[hsl(340,70%,22%)]',
};

const rarityBorders: Record<string, string> = {
  common: 'border-[hsl(200,8%,45%)]',
  rare: 'border-[hsl(210,60%,50%)]',
  epic: 'border-[hsl(280,55%,50%)]',
  legendary: 'border-[hsl(38,90%,55%)]',
  champion: 'border-[hsl(340,70%,55%)]',
};

const rarityGlow: Record<string, string> = {
  common: '',
  rare: '',
  epic: 'shadow-[0_0_8px_hsl(280,55%,50%,0.3)]',
  legendary: 'shadow-[0_0_12px_hsl(38,90%,50%,0.4)]',
  champion: 'shadow-[0_0_15px_hsl(340,70%,50%,0.5)]',
};

// Particle colors per rarity
const rarityParticleColor: Record<string, string> = {
  common: 'bg-[hsl(200,8%,60%)]',
  rare: 'bg-[hsl(210,70%,60%)]',
  epic: 'bg-[hsl(280,60%,65%)]',
  legendary: 'bg-[hsl(38,90%,60%)]',
  champion: 'bg-[hsl(340,70%,60%)]',
};

const CardComponent = ({ card, size = 'md', onClick, disabled = false, showElixir = true, showLevel = false, showCount = false }: CardComponentProps) => {
  const [tapped, setTapped] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = () => {
    if (disabled) return;
    playCardTap();
    playCardSfx(card.type, card.rarity);

    // Spawn particles
    const newParticles = Array.from({ length: size === 'xs' ? 3 : 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 600);

    // Tap flash
    setTapped(true);
    setTimeout(() => setTapped(false), 200);

    onClick?.();
  };

  const isSpecial = card.rarity === 'legendary' || card.rarity === 'champion';
  const isEpic = card.rarity === 'epic';

  return (
    <motion.div
      onClick={handleClick}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      whileHover={disabled ? undefined : { scale: 1.08, y: -2 }}
      className={`relative ${sizeClasses[size]} bg-gradient-to-b ${rarityGradients[card.rarity]} border-2 ${rarityBorders[card.rarity]} ${rarityGlow[card.rarity]} rounded-lg flex flex-col items-center justify-center gap-0.5 select-none overflow-hidden cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {/* Tap flash overlay */}
      <AnimatePresence>
        {tapped && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[hsl(0,0%,100%,0.3)] z-20 pointer-events-none rounded-lg"
          />
        )}
      </AnimatePresence>

      {/* Particles on tap */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, x: `${p.x}%`, y: `${p.y}%` }}
            animate={{ opacity: 0, scale: 0, y: `${p.y - 40}%` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute w-1 h-1 rounded-full ${rarityParticleColor[card.rarity]} z-30 pointer-events-none`}
          />
        ))}
      </AnimatePresence>

      {/* Legendary/Champion animated shimmer */}
      {isSpecial && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-[hsl(0,0%,100%,0.15)] to-transparent skew-x-[-20deg] pointer-events-none z-10"
        />
      )}

      {/* Epic pulsing glow */}
      {isEpic && (
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-[hsl(280,60%,50%,0.15)] pointer-events-none rounded-lg"
        />
      )}

      {/* Rare subtle sparkle */}
      {card.rarity === 'rare' && size !== 'xs' && (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
              className="absolute w-0.5 h-0.5 rounded-full bg-[hsl(210,80%,70%)] pointer-events-none z-10"
              style={{ left: `${20 + i * 30}%`, top: `${15 + i * 25}%` }}
            />
          ))}
        </>
      )}

      {/* Elixir cost */}
      {showElixir && (
        <div className="absolute -top-0.5 -left-0.5 w-5 h-5 rounded-full bg-[hsl(280,70%,50%)] flex items-center justify-center text-[9px] font-black text-foreground z-10 shadow-md border border-[hsl(280,80%,60%)]">
          {card.elixir}
        </div>
      )}

      {/* Card type icon */}
      {size !== 'xs' && (
        <div className="absolute top-0.5 right-0.5 text-[7px] opacity-50 z-10">
          {card.type === 'spell' ? '✨' : card.type === 'building' ? '🏗️' : '⚔️'}
        </div>
      )}
      
      {/* Card emoji with bounce on special */}
      <motion.span
        animate={isSpecial ? { y: [0, -2, 0] } : {}}
        transition={isSpecial ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
        className={`${size === 'xs' ? 'text-base' : size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl' : 'text-5xl'} drop-shadow-lg relative z-10`}
      >
        {card.emoji}
      </motion.span>
      
      {/* Card name */}
      <span className={`font-bold text-foreground text-center leading-tight px-0.5 relative z-10 ${size === 'xs' ? 'text-[5px]' : size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[8px]' : 'text-xs'}`}>
        {card.name}
      </span>

      {/* Level badge */}
      {showLevel && size !== 'xs' && (
        <div className="absolute bottom-0 left-0 right-0 bg-[hsl(0,0%,0%,0.6)] text-center z-10">
          <span className="text-[7px] font-bold text-primary">Lvl {card.level}</span>
        </div>
      )}

      {/* Count bar */}
      {showCount && size !== 'xs' && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="h-1 bg-[hsl(0,0%,0%,0.5)]">
            <div className="h-full bg-primary transition-all" style={{ width: `${(card.count / card.maxCount) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Rarity shine effect for legendary/champion */}
      {isSpecial && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[hsl(0,0%,100%,0.08)] to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
};

export default CardComponent;
