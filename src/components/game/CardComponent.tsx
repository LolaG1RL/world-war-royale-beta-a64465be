import { GameCard } from '@/data/cards';

interface CardComponentProps {
  card: GameCard;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  showElixir?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-20',
  md: 'w-20 h-28',
  lg: 'w-28 h-40',
};

const rarityGradients = {
  common: 'from-[hsl(210,10%,30%)] to-[hsl(210,10%,18%)]',
  rare: 'from-[hsl(38,60%,35%)] to-[hsl(38,80%,20%)]',
  epic: 'from-[hsl(270,50%,35%)] to-[hsl(270,70%,18%)]',
  legendary: 'from-[hsl(38,90%,45%)] to-[hsl(30,100%,25%)]',
};

const rarityBorders = {
  common: 'border-common/50',
  rare: 'border-rare/60',
  epic: 'border-epic/60',
  legendary: 'border-legendary/70',
};

const CardComponent = ({ card, size = 'md', onClick, disabled = false, showElixir = true }: CardComponentProps) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`card-slot ${sizeClasses[size]} bg-gradient-to-b ${rarityGradients[card.rarity]} border-2 ${rarityBorders[card.rarity]} flex flex-col items-center justify-center gap-1 select-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${card.rarity === 'legendary' ? 'animate-pulse-glow' : ''}`}
    >
      {showElixir && (
        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-elixir flex items-center justify-center text-[10px] font-bold text-foreground z-10 shadow-md">
          {card.elixir}
        </div>
      )}
      <span className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl'}>{card.emoji}</span>
      <span className={`font-semibold text-foreground text-center leading-tight px-1 ${size === 'sm' ? 'text-[7px]' : size === 'md' ? 'text-[9px]' : 'text-xs'}`}>
        {card.name}
      </span>
      {size === 'lg' && (
        <div className="text-[8px] text-muted-foreground mt-1 px-2 text-center">
          {card.era}
        </div>
      )}
    </div>
  );
};

export default CardComponent;
