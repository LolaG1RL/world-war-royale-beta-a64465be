import { useSettings } from '@/context/SettingsContext';
import { useGame } from '@/context/GameContext';
import { BottomNav } from './BottomNav';
import { X, Volume2, VolumeX, Music, Zap } from 'lucide-react';
import { playButtonClick } from '@/lib/sfx';

const SettingsScreen = () => {
  const { setScreen } = useGame();
  const { sfxEnabled, musicEnabled, sfxVolume, musicVolume, setSfxEnabled, setMusicEnabled, setSfxVolume, setMusicVolume } = useSettings();

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <button onClick={() => setScreen('menu')} className="text-muted-foreground"><X className="w-4 h-4" /></button>
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">⚙️ Settings</h2>
        <div className="w-4" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Audio section */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" /> Audio Settings
          </h3>

          {/* SFX Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">Sound Effects</span>
            </div>
            <button
              onClick={() => { setSfxEnabled(!sfxEnabled); if (!sfxEnabled) playButtonClick(); }}
              className={`w-11 h-6 rounded-full transition-colors relative ${sfxEnabled ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${sfxEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* SFX Volume */}
          {sfxEnabled && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">SFX Volume</span>
                <span className="text-[10px] font-bold text-foreground">{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={sfxVolume}
                onChange={e => setSfxVolume(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          )}

          {/* Music Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">Music</span>
            </div>
            <button
              onClick={() => setMusicEnabled(!musicEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${musicEnabled ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${musicEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Music Volume */}
          {musicEnabled && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Music Volume</span>
                <span className="text-[10px] font-bold text-foreground">{Math.round(musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={musicVolume}
                onChange={e => setMusicVolume(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          )}
        </div>

        {/* Mute all shortcut */}
        <button
          onClick={() => {
            const allOff = !sfxEnabled && !musicEnabled;
            setSfxEnabled(allOff);
            setMusicEnabled(allOff);
          }}
          className="w-full py-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground flex items-center justify-center gap-2"
        >
          {sfxEnabled || musicEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {sfxEnabled || musicEnabled ? 'Mute All' : 'Unmute All'}
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
