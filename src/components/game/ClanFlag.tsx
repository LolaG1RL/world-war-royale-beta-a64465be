interface ClanFlagProps {
  bannerColor: string;
  iconEmoji: string;
  iconColor: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { w: 'w-10', h: 'h-12', icon: 'text-sm', notch: 4 },
  md: { w: 'w-14', h: 'h-[4.5rem]', icon: 'text-xl', notch: 6 },
  lg: { w: 'w-20', h: 'h-24', icon: 'text-3xl', notch: 8 },
};

const ClanFlag = ({ bannerColor, iconEmoji, iconColor, size = 'md' }: ClanFlagProps) => {
  const s = sizes[size];

  return (
    <div className={`${s.w} ${s.h} relative flex-shrink-0`}>
      {/* Banner shape with notch at bottom */}
      <svg viewBox="0 0 56 72" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 0 H52 Q56 0 56 4 V60 L28 50 L0 60 V4 Q0 0 4 0Z"
          fill={bannerColor}
          stroke="hsl(0,0%,100%,0.15)"
          strokeWidth="2"
        />
        {/* Inner border */}
        <path
          d="M6 4 H50 Q52 4 52 6 V54 L28 46 L4 54 V6 Q4 4 6 4Z"
          fill="none"
          stroke="hsl(0,0%,100%,0.1)"
          strokeWidth="1"
        />
      </svg>
      {/* Icon centered */}
      <div className="absolute inset-0 flex items-center justify-center pb-2">
        <span className={s.icon} style={{ color: iconColor, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
          {iconEmoji}
        </span>
      </div>
    </div>
  );
};

export default ClanFlag;
