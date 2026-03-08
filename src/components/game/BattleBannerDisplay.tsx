import { motion } from 'framer-motion';
import {
  allBackgrounds, allEmblems, allBadges,
  BannerBackground, BannerEmblem, BannerBadge,
  PlayerBanner,
} from '@/data/banners';

/** Renders a banner card (background + emblem + badges) */
const BattleBannerDisplay = ({
  banner,
  name,
  trophies,
  size = 'md',
  className = '',
}: {
  banner: PlayerBanner;
  name: string;
  trophies: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const bg = allBackgrounds.find(b => b.id === banner.backgroundId) || allBackgrounds[0];
  const emblem = allEmblems.find(e => e.id === banner.emblemId) || allEmblems[0];
  const badges = banner.badgeIds
    .map(id => allBadges.find(b => b.id === id))
    .filter(Boolean) as BannerBadge[];

  const dims = size === 'lg' ? 'w-full h-20' : size === 'md' ? 'w-full h-16' : 'w-full h-12';
  const textSize = size === 'lg' ? 'text-sm' : size === 'md' ? 'text-xs' : 'text-[10px]';
  const emojiSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-base';
  const badgeSize = size === 'lg' ? 'text-sm w-6 h-6' : size === 'md' ? 'text-xs w-5 h-5' : 'text-[10px] w-4 h-4';

  return (
    <div className={`${dims} rounded-xl overflow-hidden relative flex items-center ${className}`} style={{ background: bg.css }}>
      {/* Animated overlay */}
      {bg.animated && bg.animationSvg && (
        <div className="absolute inset-0 pointer-events-none" dangerouslySetInnerHTML={{ __html: bg.animationSvg }} />
      )}

      {/* Emblem */}
      <div className={`flex-shrink-0 flex items-center justify-center w-14 ${emojiSize}`}>
        <span className={emblem.animated ? 'animate-pulse' : ''}>{emblem.emoji}</span>
      </div>

      {/* Name & Trophies */}
      <div className="flex-1 min-w-0">
        <div className={`font-display font-bold text-foreground ${textSize} truncate drop-shadow`}>{name}</div>
        <div className="flex items-center gap-1">
          <span className="text-primary text-[10px]">🏆</span>
          <span className="text-[10px] font-bold text-primary drop-shadow">{trophies}</span>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex gap-0.5 mr-2 flex-shrink-0">
          {badges.map(badge => (
            <div key={badge.id} className={`${badgeSize} rounded-full bg-[hsl(0,0%,0%,0.4)] flex items-center justify-center`} title={badge.name}>
              {badge.emoji}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BattleBannerDisplay;
