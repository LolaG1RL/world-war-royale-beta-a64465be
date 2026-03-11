import { useState, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { X, Volume2, VolumeX, Music, Zap, Globe, Sparkles, Eye, MessageCircle, Gift, Loader2 } from 'lucide-react';
import { playButtonClick } from '@/lib/sfx';
import { LANGUAGES, Language, t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// AI Support Chat
const AISupport = ({ language }: { language: Language }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai'; text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Use Lovable AI for customer support
      const { data, error } = await supabase.functions.invoke('ai-support', {
        body: { message: userMsg, history: messages.slice(-6) },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: 'ai', text: data?.reply || 'Sorry, I could not process your request.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Our support system is temporarily unavailable. Your message has been noted and we will get back to you via email.' }]);
      // Still try to send the email notification
      try {
        await supabase.functions.invoke('ai-support', {
          body: { message: userMsg, emailOnly: true },
        });
      } catch {}
    }
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="max-h-48 overflow-y-auto space-y-1.5 bg-secondary/50 rounded-lg p-2">
        {messages.length === 0 && (
          <div className="text-[9px] text-muted-foreground text-center py-4">
            {t('settings.support_welcome', language)}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`text-[10px] p-1.5 rounded-lg ${m.role === 'user' ? 'bg-primary/20 text-foreground ml-4' : 'bg-card border border-border mr-4 text-foreground'}`}>
            {m.role === 'ai' ? '🤖 ' : '👤 '}{m.text}
          </div>
        ))}
        {loading && (
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <input
          className="flex-1 bg-secondary rounded-lg px-2 py-1.5 text-[10px] text-foreground border border-border"
          placeholder={t('settings.support_placeholder', language)}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50">
          {t('settings.send', language)}
        </button>
      </div>
    </div>
  );
};

// Code Redeem
const CodeRedeem = ({ language, onRedeem }: { language: Language; onRedeem: (gold: number, gems: number) => void }) => {
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const VALID_CODES: Record<string, { gold: number; gems: number; label: string }> = {
    'WWRBETA': { gold: 500, gems: 50, label: 'Beta Tester Reward' },
    'WELCOME2024': { gold: 1000, gems: 100, label: 'Welcome Pack' },
    'WARLORD': { gold: 2000, gems: 0, label: 'Warlord Gold' },
    'GEMRUSH': { gold: 0, gems: 200, label: 'Gem Rush' },
    'ROYALE100': { gold: 500, gems: 100, label: 'Royale Bonus' },
  };

  const redeem = () => {
    if (!code.trim()) return;
    setRedeeming(true);
    const upper = code.trim().toUpperCase();
    
    // Check if already redeemed
    const redeemed = JSON.parse(localStorage.getItem('redeemed_codes') || '[]');
    if (redeemed.includes(upper)) {
      toast.error(t('settings.code_already_used', language));
      setRedeeming(false);
      return;
    }

    const reward = VALID_CODES[upper];
    if (!reward) {
      toast.error(t('settings.invalid_code', language));
      setRedeeming(false);
      return;
    }

    redeemed.push(upper);
    localStorage.setItem('redeemed_codes', JSON.stringify(redeemed));
    onRedeem(reward.gold, reward.gems);
    toast.success(`${reward.label}: ${reward.gold > 0 ? `💰 ${reward.gold} ` : ''}${reward.gems > 0 ? `💎 ${reward.gems}` : ''}`);
    setCode('');
    setRedeeming(false);
  };

  return (
    <div className="flex gap-1">
      <input
        className="flex-1 bg-secondary rounded-lg px-2 py-1.5 text-[10px] text-foreground border border-border uppercase"
        placeholder={t('settings.enter_code', language)}
        value={code}
        onChange={e => setCode(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && redeem()}
      />
      <button onClick={redeem} disabled={redeeming || !code.trim()} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50">
        {t('settings.redeem', language)}
      </button>
    </div>
  );
};

const SettingsScreen = () => {
  const { setScreen, profile, setProfile } = useGame();
  const { user } = useAuth();
  const {
    sfxEnabled, musicEnabled, sfxVolume, musicVolume,
    setSfxEnabled, setMusicEnabled, setSfxVolume, setMusicVolume,
    language, setLanguage,
    visualsEnabled, particlesEnabled, setVisualsEnabled, setParticlesEnabled,
  } = useSettings();

  const [showSupport, setShowSupport] = useState(false);

  const T = (key: string) => t(key, language);

  const handleRedeem = (gold: number, gems: number) => {
    setProfile(p => ({ ...p, gold: p.gold + gold, gems: p.gems + gems }));
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-background overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[hsl(220,25%,12%)] border-b border-border">
        <button onClick={() => setScreen('profile')} className="text-muted-foreground"><X className="w-4 h-4" /></button>
        <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider">{T('settings.title')}</h2>
        <div className="w-4" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Language */}
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

        {/* Audio */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" /> {T('settings.audio')}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{T('settings.sfx')}</span>
            </div>
            <button onClick={() => { setSfxEnabled(!sfxEnabled); if (!sfxEnabled) playButtonClick(); }}
              className={`w-11 h-6 rounded-full transition-colors relative ${sfxEnabled ? 'bg-primary' : 'bg-muted'}`}>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{T('settings.music')}</span>
            </div>
            <button onClick={() => setMusicEnabled(!musicEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${musicEnabled ? 'bg-primary' : 'bg-muted'}`}>
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

        {/* Visuals */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> {T('settings.visuals')}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{T('settings.card_animations')}</span>
            </div>
            <button onClick={() => setVisualsEnabled(!visualsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${visualsEnabled ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${visualsEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{T('settings.particles')}</span>
            </div>
            <button onClick={() => setParticlesEnabled(!particlesEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${particlesEnabled ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-transform ${particlesEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Code Redeem */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" /> {T('settings.redeem_code')}
          </h3>
          <p className="text-[10px] text-muted-foreground">{T('settings.redeem_desc')}</p>
          <CodeRedeem language={language} onRedeem={handleRedeem} />
        </div>

        {/* AI Customer Support */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <button onClick={() => setShowSupport(!showSupport)} className="w-full flex items-center justify-between">
            <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" /> {T('settings.support')}
            </h3>
            <span className="text-[10px] text-muted-foreground">{showSupport ? '▲' : '▼'}</span>
          </button>
          {showSupport && <AISupport language={language} />}
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
