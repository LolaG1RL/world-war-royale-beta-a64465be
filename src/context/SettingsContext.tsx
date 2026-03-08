import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number; // 0-1
  musicVolume: number; // 0-1
}

interface SettingsState extends Settings {
  setSfxEnabled: (v: boolean) => void;
  setMusicEnabled: (v: boolean) => void;
  setSfxVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
}

const defaultSettings: Settings = {
  sfxEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.5,
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
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
