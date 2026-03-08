import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { t } from '@/lib/i18n';
import { Swords, X } from 'lucide-react';

const MATCHMAKING_TIMEOUT = 30; // seconds before AI fallback

const MatchmakingScreen = () => {
  const { setScreen, profile } = useGame();
  const { user } = useAuth();
  const { language } = useSettings();
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<'searching' | 'found' | 'ai'>('searching');
  const [opponentName, setOpponentName] = useState('');
  const channelRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    // Timer
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= MATCHMAKING_TIMEOUT) {
          // Timeout - fall back to AI
          setStatus('ai');
          return prev + 1;
        }
        return prev + 1;
      });
    }, 1000);

    // Attempt realtime matchmaking via presence
    if (user) {
      const channel = supabase.channel('matchmaking', {
        config: { presence: { key: user.id } },
      });

      channel
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          // Another player joined matchmaking
          if (key !== user.id && status === 'searching') {
            const opp = newPresences[0];
            if (opp?.name) {
              setOpponentName(opp.name);
              setStatus('found');
            }
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              name: profile.name,
              trophies: profile.trophies,
              searching: true,
            });
          }
        });

      channelRef.current = channel;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // When status changes to found or ai, proceed to battle
  useEffect(() => {
    if (status === 'found') {
      // Real PvP match found - proceed after brief delay
      localStorage.setItem('match_type', 'pvp');
      localStorage.setItem('match_opponent', opponentName);
      setTimeout(() => setScreen('battle'), 1500);
    } else if (status === 'ai') {
      // AI fallback
      localStorage.setItem('match_type', 'ai');
      localStorage.removeItem('match_opponent');
      setTimeout(() => setScreen('battle'), 1000);
    }
  }, [status]);

  const handleCancel = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    setScreen('menu');
  };

  const dots = '.'.repeat((elapsed % 3) + 1);

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,8%)] via-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)]" />

      {/* Spinning swords animation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="relative z-10 mb-8"
      >
        <div className="w-24 h-24 rounded-full border-4 border-primary/30 border-t-primary flex items-center justify-center">
          <Swords className="w-10 h-10 text-primary" />
        </div>
      </motion.div>

      {/* Status text */}
      <div className="relative z-10 text-center">
        <AnimatePresence mode="wait">
          {status === 'searching' && (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-display font-bold text-lg text-foreground mb-2">
                {t('matchmaking.searching', language)}{dots}
              </h2>
              <p className="text-[10px] text-muted-foreground mb-1">
                {t('matchmaking.looking_for', language)}
              </p>
              <div className="text-xs text-muted-foreground font-mono">
                {elapsed}s / {MATCHMAKING_TIMEOUT}s
              </div>
              {/* Trophy range */}
              <div className="mt-3 bg-card border border-border rounded-lg px-4 py-2 inline-block">
                <span className="text-[10px] text-muted-foreground">{t('trophy.matchmaking', language)}: </span>
                <span className="text-[10px] font-bold text-primary">
                  🏆 {Math.max(0, profile.trophies - 100)} - {profile.trophies + 100}
                </span>
              </div>
              {/* AI fallback hint */}
              {elapsed >= 15 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[8px] text-muted-foreground mt-3"
                >
                  {t('matchmaking.ai_fallback_hint', language)}
                </motion.p>
              )}
            </motion.div>
          )}

          {status === 'found' && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="font-display font-bold text-lg text-primary mb-2">
                {t('matchmaking.found', language)}
              </h2>
              <p className="text-sm font-bold text-foreground">{opponentName}</p>
            </motion.div>
          )}

          {status === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="font-display font-bold text-sm text-muted-foreground mb-2">
                {t('matchmaking.no_players', language)}
              </h2>
              <p className="text-[10px] text-primary font-bold">
                {t('matchmaking.ai_opponent', language)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cancel button */}
      {status === 'searching' && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleCancel}
          className="relative z-10 mt-8 flex items-center gap-2 px-6 py-2.5 bg-accent/10 border border-accent/20 rounded-xl text-xs font-bold text-accent uppercase tracking-wider hover:bg-accent/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          {t('shop.cancel', language)}
        </motion.button>
      )}

      {/* Pulsing background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
            initial={{ width: 100, height: 100, opacity: 0.3 }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: 'easeOut' }}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchmakingScreen;
