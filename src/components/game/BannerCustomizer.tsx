import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import {
  allBackgrounds, allEmblems, allBadges,
  getPlayerBanner, setPlayerBanner, PlayerBanner,
  getOwnedBackgrounds, getOwnedEmblems, getOwnedBadges,
  addOwnedBadge, getUnlockedAchievementBadges,
} from '@/data/banners';
import BattleBannerDisplay from './BattleBannerDisplay';

type SubTab = 'backgrounds' | 'emblems' | 'badges';

const BannerCustomizer = ({ onClose }: { onClose: () => void }) => {
  const { profile } = useGame();
  const [banner, setBanner] = useState<PlayerBanner>(getPlayerBanner());
  const [subTab, setSubTab] = useState<SubTab>('backgrounds');
  const [ownedBgs] = useState(() => getOwnedBackgrounds());
  const [ownedEmbs] = useState(() => getOwnedEmblems());
  const [ownedBadges, setOwnedBadgesState] = useState(() => getOwnedBadges());

  // Auto-unlock achievement badges
  useEffect(() => {
    const unlocked = getUnlockedAchievementBadges(profile);
    let changed = false;
    unlocked.forEach(id => {
      if (!ownedBadges.has(id)) {
        addOwnedBadge(id);
        changed = true;
      }
    });
    if (changed) setOwnedBadgesState(getOwnedBadges());
  }, [profile]);

  const save = (b: PlayerBanner) => {
    setBanner(b);
    setPlayerBanner(b);
  };

  const selectBg = (id: string) => { if (ownedBgs.has(id)) save({ ...banner, backgroundId: id }); };
  const selectEmblem = (id: string) => { if (ownedEmbs.has(id)) save({ ...banner, emblemId: id }); };
  const toggleBadge = (id: string) => {
    if (!ownedBadges.has(id)) return;
    const cur = [...banner.badgeIds];
    if (cur.includes(id)) {
      save({ ...banner, badgeIds: cur.filter(b => b !== id) });
    } else if (cur.length < 3) {
      save({ ...banner, badgeIds: [...cur, id] });
    }
  };

  const RARITY_BORDER: Record<string, string> = {
    common: 'border-muted-foreground/40',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-primary',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[hsl(0,0%,0%,0.9)] z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <button onClick={onClose} className="text-muted-foreground text-xs">← Back</button>
        <h2 className="font-display font-bold text-foreground text-sm">BATTLE BANNER</h2>
        <div className="w-12" />
      </div>

      {/* Preview */}
      <div className="px-4 py-3 bg-[hsl(220,20%,11%)]">
        <BattleBannerDisplay banner={banner} name={profile.name} trophies={profile.trophies} size="lg" />
      </div>

      {/* Sub tabs */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        {(['backgrounds', 'emblems', 'badges'] as SubTab[]).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${subTab === t ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {t === 'backgrounds' ? '🖼️ BG' : t === 'emblems' ? '🎭 Emblem' : '🏅 Badges'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 bg-[hsl(220,20%,10%)]">
        {subTab === 'backgrounds' && (
          <div className="grid grid-cols-2 gap-2">
            {allBackgrounds.map(bg => {
              const owned = ownedBgs.has(bg.id);
              const selected = banner.backgroundId === bg.id;
              return (
                <button key={bg.id} onClick={() => selectBg(bg.id)} className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${selected ? 'border-primary ring-2 ring-primary/30' : owned ? RARITY_BORDER[bg.rarity] : 'border-border opacity-40 grayscale'}`} style={{ background: bg.css }}>
                  {bg.animated && bg.animationSvg && <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: bg.animationSvg }} />}
                  <div className="absolute bottom-0 left-0 right-0 bg-[hsl(0,0%,0%,0.6)] px-1.5 py-0.5">
                    <span className="text-[8px] font-bold text-foreground">{bg.name}</span>
                  </div>
                  {!owned && <div className="absolute top-1 right-1 text-[8px] bg-[hsl(0,0%,0%,0.7)] px-1 rounded text-muted-foreground">🔒</div>}
                  {selected && <div className="absolute top-1 left-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[8px] text-primary-foreground font-bold">✓</div>}
                </button>
              );
            })}
          </div>
        )}

        {subTab === 'emblems' && (
          <div className="grid grid-cols-4 gap-2">
            {allEmblems.map(emb => {
              const owned = ownedEmbs.has(emb.id);
              const selected = banner.emblemId === emb.id;
              return (
                <button key={emb.id} onClick={() => selectEmblem(emb.id)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${selected ? 'border-primary bg-primary/10' : owned ? `${RARITY_BORDER[emb.rarity]} bg-card` : 'border-border bg-muted/10 opacity-40 grayscale'}`}>
                  <span className={`text-xl ${emb.animated ? 'animate-pulse' : ''}`}>{emb.emoji}</span>
                  <span className="text-[7px] font-bold text-foreground truncate w-full text-center px-0.5">{emb.name}</span>
                  {!owned && <span className="text-[7px] text-muted-foreground">🔒</span>}
                </button>
              );
            })}
          </div>
        )}

        {subTab === 'badges' && (
          <>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Equipped ({banner.badgeIds.length}/3)</div>
            <div className="flex gap-1.5 mb-3">
              {[0, 1, 2].map(i => {
                const bid = banner.badgeIds[i];
                const badge = bid ? allBadges.find(b => b.id === bid) : null;
                return (
                  <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center ${badge ? 'bg-primary/20 border-2 border-primary/40' : 'border-2 border-dashed border-muted-foreground/20 bg-muted/10'}`}>
                    {badge ? <span className="text-base">{badge.emoji}</span> : null}
                  </div>
                );
              })}
            </div>

            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Achievement Badges</div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {allBadges.filter(b => b.type === 'achievement').map(badge => {
                const owned = ownedBadges.has(badge.id);
                const equipped = banner.badgeIds.includes(badge.id);
                return (
                  <button key={badge.id} onClick={() => toggleBadge(badge.id)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${equipped ? 'border-primary bg-primary/10' : owned ? `${RARITY_BORDER[badge.rarity]} bg-card` : 'border-border bg-muted/10 opacity-40 grayscale'}`}>
                    <span className="text-lg">{badge.emoji}</span>
                    <span className="text-[6px] font-bold text-foreground text-center leading-tight">{badge.name}</span>
                    {!owned && <span className="text-[6px] text-muted-foreground">{badge.condition}</span>}
                  </button>
                );
              })}
            </div>

            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Cosmetic Badges</div>
            <div className="grid grid-cols-4 gap-2">
              {allBadges.filter(b => b.type === 'cosmetic').map(badge => {
                const owned = ownedBadges.has(badge.id);
                const equipped = banner.badgeIds.includes(badge.id);
                return (
                  <button key={badge.id} onClick={() => toggleBadge(badge.id)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${equipped ? 'border-primary bg-primary/10' : owned ? `${RARITY_BORDER[badge.rarity]} bg-card` : 'border-border bg-muted/10 opacity-40 grayscale'}`}>
                    <span className="text-lg">{badge.emoji}</span>
                    <span className="text-[6px] font-bold text-foreground text-center leading-tight">{badge.name}</span>
                    {!owned && <span className="text-[6px] text-muted-foreground">🔒</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default BannerCustomizer;
