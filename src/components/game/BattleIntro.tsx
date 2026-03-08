import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import { getPlayerBanner } from '@/data/banners';
import BattleBannerDisplay from './BattleBannerDisplay';

/** Pre-battle intro: player banner slides from bottom-left, opponent from top-right */
const BattleIntro = ({ onComplete }: { onComplete: () => void }) => {
  const { profile } = useGame();
  const [visible, setVisible] = useState(true);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // Keep ref updated
  onCompleteRef.current = onComplete;

  const playerBanner = getPlayerBanner();

  // Random opponent - use refs to avoid recalculating on re-render
  const oppDataRef = useRef({
    name: ['DarkLord99', 'SwordMaster', 'WarChief', 'PhoenixKing', 'CrushR', 'NightWolf'][Math.floor(Math.random() * 6)],
    trophies: Math.max(0, profile.trophies + Math.floor(Math.random() * 200) - 100),
    banner: {
      backgroundId: ['bg-crimson', 'bg-ocean', 'bg-stone', 'bg-inferno', 'bg-void'][Math.floor(Math.random() * 5)],
      emblemId: ['emb-skull', 'emb-sword', 'emb-axe', 'emb-dragon', 'emb-ninja'][Math.floor(Math.random() * 5)],
      badgeIds: ['badge-fire', 'badge-lightning'].slice(0, Math.floor(Math.random() * 3)),
    }
  });

  useEffect(() => {
    if (hasCompletedRef.current) return;
    
    const timer = setTimeout(() => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      setVisible(false);
      setTimeout(() => onCompleteRef.current(), 400);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []); // Empty deps - run once only

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-[hsl(220,20%,8%)] flex flex-col justify-center"
        >
          {/* VS text */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <span className="font-display font-black text-3xl text-primary drop-shadow-lg">⚔️ VS ⚔️</span>
          </motion.div>

          {/* Opponent banner - slides from right at top */}
          <motion.div
            initial={{ x: '120%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15, delay: 0.1 }}
            className="absolute top-[15%] left-4 right-4"
          >
            <BattleBannerDisplay banner={oppDataRef.current.banner} name={oppDataRef.current.name} trophies={oppDataRef.current.trophies} size="lg" />
          </motion.div>

          {/* Player banner - slides from left at bottom */}
          <motion.div
            initial={{ x: '-120%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15, delay: 0.1 }}
            className="absolute bottom-[15%] left-4 right-4"
          >
            <BattleBannerDisplay banner={playerBanner} name={profile.name} trophies={profile.trophies} size="lg" />
          </motion.div>

          {/* Countdown flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="absolute bottom-8 left-0 right-0 text-center"
          >
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Battle starting...</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BattleIntro;
