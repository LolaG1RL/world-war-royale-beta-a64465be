import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getArenaForTrophies } from '@/data/cards';
import { BottomNav } from './BottomNav';
import { ChevronLeft, Copy, Shield, Award, Target, Crown, Star, LogOut, Check, Settings } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { t, tArena } from '@/lib/i18n';

const ProfileScreen = () => {
  const { setScreen, profile, deck } = useGame();
  const { signOut, playerTag } = useAuth();
  const { language } = useSettings();
  const arena = getArenaForTrophies(profile.trophies);
  const [copied, setCopied] = useState(false);

  const copyTag = () => {
    if (playerTag) {
      navigator.clipboard.writeText(playerTag);
      setCopied(true);
      toast.success(t('profile.tag_copied', language));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const stats = [
    { label: t('profile.wins', language), value: profile.wins, icon: '⚔️' },
    { label: t('profile.losses', language), value: profile.losses, icon: '💀' },
    { label: t('profile.3_crown_wins', language), value: profile.threeCrownWins, icon: '👑' },
    { label: t('profile.max_trophies', language), value: profile.maxTrophies, icon: '🏆' },
    { label: t('profile.challenge_max', language), value: profile.challengeMaxWins, icon: '🏅' },
    { label: t('profile.war_day_wins', language), value: profile.warDayWins, icon: '⚔️' },
    { label: t('profile.cards_collected', language), value: profile.clanCardsCollected, icon: '🃏' },
    { label: t('profile.total_donations', language), value: profile.totalDonations, icon: '📦' },
  ];

  const badges = [
    { name: t('profile.badge.grand_champion', language), emoji: '🏆', earned: false },
    { name: t('profile.badge.war_hero', language), emoji: '⚔️', earned: profile.warDayWins > 0 },
    { name: t('profile.badge.card_master', language), emoji: '🃏', earned: profile.clanCardsCollected > 0 },
    { name: t('profile.badge.generous_donor', language), emoji: '📦', earned: profile.totalDonations > 0 },
    { name: t('profile.badge.legendary_player', language), emoji: '🌟', earned: profile.maxTrophies >= 4000 },
    { name: t('profile.badge.speed_demon', language), emoji: '⚡', earned: profile.wins >= 100 },
  ];

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <button onClick={() => setScreen('menu')} className="text-muted-foreground"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">{t('profile.title', language)}</h2>
        <button onClick={() => setScreen('settings')} className="text-muted-foreground"><Settings className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile card */}
        <div className="bg-gradient-to-b from-[hsl(220,25%,14%)] to-[hsl(220,20%,11%)] p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-3xl shadow-lg">
              👤
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-display font-bold text-foreground">{profile.name}</span>
                <span className="bg-[hsl(210,60%,40%)] px-1.5 py-0.5 rounded text-[8px] font-bold text-foreground">{t('menu.lvl', language)} {profile.level}</span>
              </div>
              <button
                onClick={copyTag}
                className="flex items-center gap-1 mt-0.5 text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
              >
                <span>{playerTag || '...'}</span>
                {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              </button>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-primary">🏆 {profile.trophies}</span>
                <span className="text-[10px] text-muted-foreground">{arena.emoji} {arena.name}</span>
              </div>
            </div>
          </div>
          {/* XP bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[8px] text-muted-foreground mb-0.5">
              <span>{t('common.level', language)} {profile.level}</span>
              <span>{profile.xp}/{profile.maxXp} XP</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[hsl(210,60%,50%)] rounded-full" style={{ width: `${(profile.xp / profile.maxXp) * 100}%` }} />
            </div>
          </div>
          <p className="text-[8px] text-muted-foreground mt-2">{t('profile.share_tag', language)}</p>
        </div>

        {/* Stats grid */}
        <div className="p-3">
          <div className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('profile.battle_stats', language)}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {stats.map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-2 flex items-center gap-2">
                <span className="text-sm">{stat.icon}</span>
                <div>
                  <div className="text-[8px] text-muted-foreground">{stat.label}</div>
                  <div className="text-xs font-bold text-foreground">{stat.value.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Win rate */}
        <div className="px-3 pb-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-[10px] font-bold text-foreground mb-2">{t('profile.win_rate', language)}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex">
                {(profile.wins + profile.losses) > 0 ? (
                  <>
                    <div className="h-full bg-hp-green" style={{ width: `${(profile.wins / (profile.wins + profile.losses)) * 100}%` }} />
                    <div className="h-full bg-hp-red" style={{ width: `${(profile.losses / (profile.wins + profile.losses)) * 100}%` }} />
                  </>
                ) : (
                  <div className="h-full bg-muted w-full" />
                )}
              </div>
              <span className="text-xs font-bold text-foreground">{(profile.wins + profile.losses) > 0 ? ((profile.wins / (profile.wins + profile.losses)) * 100).toFixed(1) : '0.0'}%</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="px-3 pb-3">
          <div className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('profile.badges', language)}</div>
          <div className="grid grid-cols-3 gap-1.5">
            {badges.map((badge, i) => (
              <div key={i} className={`bg-card border rounded-lg p-2 text-center ${badge.earned ? 'border-primary/30' : 'border-border opacity-40'}`}>
                <span className="text-xl">{badge.emoji}</span>
                <div className="text-[8px] font-bold text-foreground mt-0.5">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite deck */}
        <div className="px-3 pb-3">
          <div className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('profile.fav_deck', language)}</div>
          <div className="bg-card border border-border rounded-lg p-2">
            <div className="grid grid-cols-8 gap-0.5">
              {deck.map(card => (
                <div key={card.id} className="text-center">
                  <span className="text-lg">{card.emoji}</span>
                  <div className="text-[6px] text-muted-foreground truncate">{card.name.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings section (collapsible) */}
        {showSettings && (
          <div className="px-3 pb-3 space-y-3">
            <div className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Settings className="w-3 h-3" /> {T('settings.title')}
            </div>

            {/* Language */}
            <div className="bg-card border border-border rounded-xl p-3 space-y-2">
              <h3 className="text-[10px] font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-primary" /> {T('settings.language')}
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => { setLanguage(lang.code); playButtonClick(); }}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left transition-all ${language === lang.code ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-secondary border-border text-foreground hover:border-primary/30'}`}>
                    <span className="text-xs">{lang.flag}</span>
                    <div>
                      <div className="text-[9px] font-bold">{lang.native}</div>
                      <div className="text-[7px] text-muted-foreground">{lang.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio */}
            <div className="bg-card border border-border rounded-xl p-3 space-y-3">
              <h3 className="text-[10px] font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-primary" /> {T('settings.audio')}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-foreground">{T('settings.sfx')}</span>
                </div>
                <button onClick={() => { setSfxEnabled(!sfxEnabled); if (!sfxEnabled) playButtonClick(); }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${sfxEnabled ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-transform ${sfxEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {sfxEnabled && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground">{T('settings.sfx_volume')}</span>
                    <span className="text-[9px] font-bold text-foreground">{Math.round(sfxVolume * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={sfxVolume} onChange={e => setSfxVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-foreground">{T('settings.music')}</span>
                </div>
                <button onClick={() => setMusicEnabled(!musicEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${musicEnabled ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-transform ${musicEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {musicEnabled && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground">{T('settings.music_volume')}</span>
                    <span className="text-[9px] font-bold text-foreground">{Math.round(musicVolume * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={e => setMusicVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
                </div>
              )}
            </div>

            {/* Visuals */}
            <div className="bg-card border border-border rounded-xl p-3 space-y-3">
              <h3 className="text-[10px] font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-primary" /> {T('settings.visuals')}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-foreground">{T('settings.card_animations')}</span>
                </div>
                <button onClick={() => setVisualsEnabled(!visualsEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${visualsEnabled ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-transform ${visualsEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-foreground">{T('settings.particles')}</span>
                </div>
                <button onClick={() => setParticlesEnabled(!particlesEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${particlesEnabled ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-transform ${particlesEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Mute all */}
            <button onClick={() => { const allOff = !sfxEnabled && !musicEnabled; setSfxEnabled(allOff); setMusicEnabled(allOff); }}
              className="w-full py-2 rounded-xl border border-border bg-card text-[10px] font-bold text-foreground flex items-center justify-center gap-2">
              {sfxEnabled || musicEnabled ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {sfxEnabled || musicEnabled ? T('settings.mute_all') : T('settings.unmute_all')}
            </button>
          </div>
        )}

        {/* Sign out */}
        <div className="px-3 pb-4">
          <button onClick={signOut} className="w-full py-2.5 bg-accent/10 border border-accent/20 rounded-xl text-xs font-bold text-accent uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-accent/20 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            {t('profile.sign_out', language)}
          </button>
        </div>
      </div>

      <BottomNav active="battle" setScreen={setScreen} />
    </div>
  );
};

export default ProfileScreen;
