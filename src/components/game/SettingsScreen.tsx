import { useSettings } from '@/context/SettingsContext';
import { useGame } from '@/context/GameContext';
import { X, Volume2, VolumeX, Music, Zap, Globe, Sparkles, Eye } from 'lucide-react';
import { playButtonClick } from '@/lib/sfx';
import { LANGUAGES, Language, t } from '@/lib/i18n';

const SettingsScreen = () => {
  const { setScreen } = useGame();
  const {
    sfxEnabled, musicEnabled, sfxVolume, musicVolume,
    setSfxEnabled, setMusicEnabled, setSfxVolume, setMusicVolume,
    language, setLanguage,
    visualsEnabled, particlesEnabled, setVisualsEnabled, setParticlesEnabled,
  } = useSettings();

  const T = (key: string) => t(key, language);

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <button onClick={() => setScreen('profile')} className="text-muted-foreground"><X className="w-4 h-4" /></button>
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">{T('settings.title')}</h2>
        <div className="w-4" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ═══ Language Section ═══ */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> {T('settings.language')}
          </h3>
          <p className="text-[10px] text-muted-foreground">{T('settings.language_desc')}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); playButtonClick(); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                  language === lang.code
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-secondary border-border text-foreground hover:border-primary/30'
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <div>
                  <div className="text-[10px] font-bold">{lang.native}</div>
                  <div className="text-[8px] text-muted-foreground">{lang.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Audio Section ═══ */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" /> {T('settings.audio')}
          </h3>

          {/* SFX Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{T('settings.sfx')}</span>
            </div>
            <button
              onClick={() => { setSfxEnabled(!sfxEnabled); if (!sfxEnabled) playButtonClick(); }}
              className={`w-11 h-6 rounded-full transition-colors relative ${sfxEnabled ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${sfxEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {sfxEnabled && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{T('settings.sfx_volume')}</span>
                <span className="text-[10px] font-bold text-foreground">{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={sfxVolume}
                onChange={e => setSfxVolume(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
          )}

          {/* Music Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{T('settings.music')}</span>
            </div>
            <button
              onClick={() => setMusicEnabled(!musicEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${musicEnabled ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${musicEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {musicEnabled && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{T('settings.music_volume')}</span>
                <span className="text-[10px] font-bold text-foreground">{Math.round(musicVolume * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={musicVolume}
                onChange={e => setMusicVolume(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
            </div>
          )}
        </div>

        {/* ═══ Visuals Section ═══ */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> {T('settings.visuals')}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{T('settings.card_animations')}</span>
            </div>
            <button
              onClick={() => setVisualsEnabled(!visualsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${visualsEnabled ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${visualsEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{T('settings.particles')}</span>
            </div>
            <button
              onClick={() => setParticlesEnabled(!particlesEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${particlesEnabled ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${particlesEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Mute all */}
        <button
          onClick={() => {
            const allOff = !sfxEnabled && !musicEnabled;
            setSfxEnabled(allOff);
            setMusicEnabled(allOff);
          }}
          className="w-full py-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground flex items-center justify-center gap-2"
        >
          {sfxEnabled || musicEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {sfxEnabled || musicEnabled ? T('settings.mute_all') : T('settings.unmute_all')}
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
