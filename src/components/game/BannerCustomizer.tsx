import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/context/SettingsContext';
import {
  allBackgrounds, allEmblems, allBadges,
  getPlayerBanner, setPlayerBanner, PlayerBanner,
  getOwnedBackgrounds, getOwnedEmblems, getOwnedBadges,
  addOwnedBadge, getUnlockedAchievementBadges,
} from '@/data/banners';
import BattleBannerDisplay from './BattleBannerDisplay';
import { BottomNav } from './BottomNav';
import { t } from '@/lib/i18n';

type SubTab = 'backgrounds' | 'emblems' | 'badges';

const BannerCustomizer = () => {
  const { profile, setScreen, clan } = useGame();
  const { language } = useSettings();
  const T = (key: string) => t(key, language);
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

  const { user } = useAuth();

  const save = (b: PlayerBanner) => {
    setBanner(b);
    setPlayerBanner(b);
    // Sync equipped emblem to DB for leaderboard display
    if (user && b.emblemId) {
      supabase.from('player_progress').update({ equipped_emblem: b.emblemId } as any).eq('user_id', user.id).then(() => {});
    }
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

  // Filter to only show owned items
  const ownedBackgrounds = allBackgrounds.filter(bg => ownedBgs.has(bg.id));
  const ownedEmblemsList = allEmblems.filter(emb => ownedEmbs.has(emb.id));
  const ownedBadgesList = allBadges.filter(b => ownedBadges.has(b.id));

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <div className="w-8" />
        <h2 className="font-display font-bold text-foreground text-sm">{T('banner.title')}</h2>
        <span className="text-xs font-bold text-primary">{banner.badgeIds.length}/3</span>
      </div>

      {/* Preview */}
      <div className="px-4 py-3 bg-[hsl(220,20%,11%)] border-b border-border">
        <BattleBannerDisplay banner={banner} name={profile.name} trophies={profile.trophies} clanName={clan?.name} clanBanner={clan ? { bannerColor: clan.bannerColor, bannerShape: clan.bannerShape, iconId: clan.iconId, iconColor: clan.iconColor } : undefined} size="lg" />
      </div>

      {/* Sub tabs */}
      <div className="flex bg-[hsl(220,20%,14%)] border-b border-border">
        {(['backgrounds', 'emblems', 'badges'] as SubTab[]).map(tab => (
          <button key={tab} onClick={() => setSubTab(tab)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${subTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {tab === 'backgrounds' ? T('banner.bg') : tab === 'emblems' ? T('banner.emblem') : T('banner.badges_tab')}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 bg-[hsl(220,20%,10%)]">
        {subTab === 'backgrounds' && (
          <>
            {ownedBackgrounds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                {T('banner.no_bg')}<br />{T('banner.buy_shop')}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {ownedBackgrounds.map(bg => {
                  const selected = banner.backgroundId === bg.id;
                  return (
                    <button key={bg.id} onClick={() => selectBg(bg.id)} className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${selected ? 'border-primary ring-2 ring-primary/30' : RARITY_BORDER[bg.rarity]}`} style={{ background: bg.css }}>
                      {bg.animated && bg.animationSvg && <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: bg.animationSvg }} />}
                      <div className="absolute bottom-0 left-0 right-0 bg-[hsl(0,0%,0%,0.6)] px-1.5 py-0.5">
                        <span className="text-[8px] font-bold text-foreground">{bg.name}</span>
                      </div>
                      {selected && <div className="absolute top-1 left-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[8px] text-primary-foreground font-bold">✓</div>}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {subTab === 'emblems' && (
          <>
            {ownedEmblemsList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                {T('banner.no_emblems')}<br />{T('banner.buy_shop')}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {ownedEmblemsList.map(emb => {
                  const selected = banner.emblemId === emb.id;
                  return (
                    <button key={emb.id} onClick={() => selectEmblem(emb.id)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${selected ? 'border-primary bg-primary/10' : `${RARITY_BORDER[emb.rarity]} bg-card`}`}>
                      <span className={`text-xl ${emb.animated ? 'animate-pulse' : ''}`}>{emb.emoji}</span>
                      <span className="text-[7px] font-bold text-foreground truncate w-full text-center px-0.5">{emb.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {subTab === 'badges' && (
          <>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">{T('banner.equipped')} ({banner.badgeIds.length}/3)</div>
            <div className="flex gap-1.5 mb-3">
              {[0, 1, 2].map(i => {
                const bid = banner.badgeIds[i];
                const badge = bid ? allBadges.find(b => b.id === bid) : null;
                return (
                  <button key={i} onClick={() => badge && toggleBadge(badge.id)} className={`w-10 h-10 rounded-full flex items-center justify-center ${badge ? 'bg-primary/20 border-2 border-primary/40 cursor-pointer' : 'border-2 border-dashed border-muted-foreground/20 bg-muted/10'}`}>
                    {badge ? <span className="text-base">{badge.emoji}</span> : null}
                  </button>
                );
              })}
            </div>

            {ownedBadgesList.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-xs">
                {T('banner.no_badges')}<br />{T('banner.win_battles')}
              </div>
            ) : (
              <>
                {/* Achievement badges */}
                {ownedBadgesList.filter(b => b.type === 'achievement').length > 0 && (
                  <>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">{T('banner.achievement_badges')}</div>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {ownedBadgesList.filter(b => b.type === 'achievement').map(badge => {
                        const equipped = banner.badgeIds.includes(badge.id);
                        return (
                          <button key={badge.id} onClick={() => toggleBadge(badge.id)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${equipped ? 'border-primary bg-primary/10' : `${RARITY_BORDER[badge.rarity]} bg-card`}`}>
                            <span className="text-lg">{badge.emoji}</span>
                            <span className="text-[6px] font-bold text-foreground text-center leading-tight">{badge.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Cosmetic badges */}
                {ownedBadgesList.filter(b => b.type === 'cosmetic').length > 0 && (
                  <>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">{T('banner.cosmetic_badges')}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {ownedBadgesList.filter(b => b.type === 'cosmetic').map(badge => {
                        const equipped = banner.badgeIds.includes(badge.id);
                        return (
                          <button key={badge.id} onClick={() => toggleBadge(badge.id)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${equipped ? 'border-primary bg-primary/10' : `${RARITY_BORDER[badge.rarity]} bg-card`}`}>
                            <span className="text-lg">{badge.emoji}</span>
                            <span className="text-[6px] font-bold text-foreground text-center leading-tight">{badge.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      <BottomNav active="cards" setScreen={setScreen} />
    </div>
  );
};

export default BannerCustomizer;
