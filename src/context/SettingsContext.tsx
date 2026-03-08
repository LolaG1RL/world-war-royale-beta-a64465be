import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/lib/i18n';
import { updateSfxSettings } from '@/lib/sfx';
import { updateMusicSettings } from '@/lib/music';

interface Settings {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  language: Language;
  visualsEnabled: boolean;
  particlesEnabled: boolean;
}

interface SettingsState extends Settings {
  setSfxEnabled: (v: boolean) => void;
  setMusicEnabled: (v: boolean) => void;
  setSfxVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setLanguage: (v: Language) => void;
  setVisualsEnabled: (v: boolean) => void;
  setParticlesEnabled: (v: boolean) => void;
}

const defaultSettings: Settings = {
  sfxEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.5,
  language: 'en',
  visualsEnabled: true,
  particlesEnabled: true,
};

const SettingsContext = createContext<SettingsState | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('game_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch { return defaultSettings; }
  });

  useEffect(() => {
    localStorage.setItem('game_settings', JSON.stringify(settings));
  }, [settings]);

  return (
    <SettingsContext.Provider value={{
      ...settings,
      setSfxEnabled: (v) => setSettings(s => ({ ...s, sfxEnabled: v })),
      setMusicEnabled: (v) => setSettings(s => ({ ...s, musicEnabled: v })),
      setSfxVolume: (v) => setSettings(s => ({ ...s, sfxVolume: v })),
      setMusicVolume: (v) => setSettings(s => ({ ...s, musicVolume: v })),
      setLanguage: (v) => setSettings(s => ({ ...s, language: v })),
      setVisualsEnabled: (v) => setSettings(s => ({ ...s, visualsEnabled: v })),
      setParticlesEnabled: (v) => setSettings(s => ({ ...s, particlesEnabled: v })),
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
