import { Sword, Shield, Skull, Crown, Flame, Zap, Star, Target, Crosshair, Mountain, Anchor, Eye, Heart, Sun, Moon, Gem, Swords, Trophy, Flag, Compass } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export const CLAN_ICONS: { id: string; Icon: LucideIcon; label: string }[] = [
  { id: 'swords', Icon: Swords, label: 'Swords' },
  { id: 'sword', Icon: Sword, label: 'Sword' },
  { id: 'shield', Icon: Shield, label: 'Shield' },
  { id: 'skull', Icon: Skull, label: 'Skull' },
  { id: 'crown', Icon: Crown, label: 'Crown' },
  { id: 'flame', Icon: Flame, label: 'Flame' },
  { id: 'zap', Icon: Zap, label: 'Lightning' },
  { id: 'star', Icon: Star, label: 'Star' },
  { id: 'target', Icon: Target, label: 'Target' },
  { id: 'crosshair', Icon: Crosshair, label: 'Crosshair' },
  { id: 'mountain', Icon: Mountain, label: 'Mountain' },
  { id: 'anchor', Icon: Anchor, label: 'Anchor' },
  { id: 'eye', Icon: Eye, label: 'Eye' },
  { id: 'heart', Icon: Heart, label: 'Heart' },
  { id: 'sun', Icon: Sun, label: 'Sun' },
  { id: 'moon', Icon: Moon, label: 'Moon' },
  { id: 'gem', Icon: Gem, label: 'Gem' },
  { id: 'trophy', Icon: Trophy, label: 'Trophy' },
  { id: 'flag', Icon: Flag, label: 'Flag' },
  { id: 'compass', Icon: Compass, label: 'Compass' },
];

export const BANNER_SHAPES: { id: string; label: string; path: string }[] = [
  { id: 'pointed', label: 'Pointed', path: 'M4 0 H52 Q56 0 56 4 V60 L28 72 L0 60 V4 Q0 0 4 0Z' },
  { id: 'notched', label: 'Notched', path: 'M4 0 H52 Q56 0 56 4 V64 L28 54 L0 64 V4 Q0 0 4 0Z' },
  { id: 'straight', label: 'Straight', path: 'M4 0 H52 Q56 0 56 4 V68 Q56 72 52 72 H4 Q0 72 0 68 V4 Q0 0 4 0Z' },
  { id: 'swallowtail', label: 'Swallowtail', path: 'M4 0 H52 Q56 0 56 4 V68 L42 58 L28 72 L14 58 L0 68 V4 Q0 0 4 0Z' },
  { id: 'shield', label: 'Shield', path: 'M28 0 L56 8 V40 Q56 68 28 72 Q0 68 0 40 V8 Z' },
  { id: 'pentagon', label: 'Pentagon', path: 'M28 0 L56 20 L46 64 H10 L0 20 Z' },
];

export const getIconById = (id: string) => CLAN_ICONS.find(i => i.id === id) || CLAN_ICONS[0];

interface ClanFlagProps {
  bannerColor: string;
  bannerShape: string;
  iconId: string;
  iconColor: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { w: 'w-10', h: 'h-12', iconSize: 14 },
  md: { w: 'w-14', h: 'h-[4.5rem]', iconSize: 22 },
  lg: { w: 'w-20', h: 'h-24', iconSize: 32 },
};

const ClanFlag = ({ bannerColor, bannerShape, iconId, iconColor, size = 'md' }: ClanFlagProps) => {
  const s = sizeMap[size];
  const shape = BANNER_SHAPES.find(b => b.id === bannerShape) || BANNER_SHAPES[0];
  const iconData = getIconById(iconId);
  const IconComponent = iconData.Icon;

  return (
    <div className={`${s.w} ${s.h} relative flex-shrink-0`}>
      <svg viewBox="0 0 56 72" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Shadow */}
        <path d={shape.path} fill="rgba(0,0,0,0.3)" transform="translate(2,2)" />
        {/* Main shape */}
        <path d={shape.path} fill={bannerColor} />
        {/* Highlight edge */}
        <path d={shape.path} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        {/* Inner darker overlay for depth */}
        <path d={shape.path} fill="rgba(0,0,0,0.1)" />
      </svg>
      {/* Icon centered */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: shape.id === 'pointed' || shape.id === 'notched' ? '8px' : '0' }}>
        <IconComponent
          size={s.iconSize}
          color={iconColor}
          strokeWidth={2.5}
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
        />
      </div>
    </div>
  );
};

export default ClanFlag;
