import { GameCard } from '@/data/cards';

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
  hero: 'from-[hsl(340,60%,45%)] to-[hsl(340,70%,22%)]',
};

const rarityBorders: Record<string, string> = {
  common: 'border-[hsl(200,8%,45%)]',
  rare: 'border-[hsl(210,60%,50%)]',
  epic: 'border-[hsl(280,55%,50%)]',
  legendary: 'border-[hsl(38,90%,55%)]',
  hero: 'border-[hsl(340,70%,55%)]',
};

const rarityGlow: Record<string, string> = {
  common: '',
  rare: '',
  epic: 'shadow-[0_0_8px_hsl(280,55%,50%,0.3)]',
  legendary: 'shadow-[0_0_12px_hsl(38,90%,50%,0.4)]',
  hero: 'shadow-[0_0_15px_hsl(340,70%,50%,0.5)]',
};

const CardComponent = ({ card, size = 'md', onClick, disabled = false, showElixir = true, showLevel = false, showCount = false }: CardComponentProps) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`relative ${sizeClasses[size]} bg-gradient-to-b ${rarityGradients[card.rarity]} border-2 ${rarityBorders[card.rarity]} ${rarityGlow[card.rarity]} rounded-lg flex flex-col items-center justify-center gap-0.5 select-none overflow-hidden cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {/* Elixir cost */}
      {showElixir && (
        <div className="absolute -top-0.5 -left-0.5 w-5 h-5 rounded-full bg-[hsl(280,70%,50%)] flex items-center justify-center text-[9px] font-black text-foreground z-10 shadow-md border border-[hsl(280,80%,60%)]">
          {card.elixir}
        </div>
      )}
      
      {/* Card emoji */}
      <span className={`${size === 'xs' ? 'text-base' : size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl' : 'text-5xl'} drop-shadow-lg`}>
        {card.emoji}
      </span>
      
      {/* Card name */}
      <span className={`font-bold text-foreground text-center leading-tight px-0.5 ${size === 'xs' ? 'text-[5px]' : size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[8px]' : 'text-xs'}`}>
        {card.name}
      </span>

      {/* Level badge */}
      {showLevel && size !== 'xs' && (
        <div className="absolute bottom-0 left-0 right-0 bg-[hsl(0,0%,0%,0.6)] text-center">
          <span className="text-[7px] font-bold text-primary">Lvl {card.level}</span>
        </div>
      )}

      {/* Count bar */}
      {showCount && size !== 'xs' && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-1 bg-[hsl(0,0%,0%,0.5)]">
            <div className="h-full bg-primary transition-all" style={{ width: `${(card.count / card.maxCount) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Rarity shine effect for legendary/hero */}
      {(card.rarity === 'legendary' || card.rarity === 'champion') && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[hsl(0,0%,100%,0.08)] to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default CardComponent;
