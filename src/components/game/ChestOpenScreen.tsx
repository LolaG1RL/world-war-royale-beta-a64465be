import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { allCards } from '@/data/cards';
import { t } from '@/lib/i18n';

const ChestOpenScreen = () => {
  const { setScreen, chests, setChests, setProfile } = useGame();
  const { language } = useSettings();
  const T = (key: string) => t(key, language);
  const [opened, setOpened] = useState(false);
  const [rewards, setRewards] = useState<{ emoji: string; name: string; count: number; rarity: string }[]>([]);

  const readyChest = chests.find(c => c.isReady);

  const openChest = () => {
    // Generate random rewards
    const numCards = readyChest?.cards || 3;
    const rewardCards: typeof rewards = [];
    for (let i = 0; i < numCards; i++) {
      const card = allCards[Math.floor(Math.random() * allCards.length)];
      rewardCards.push({ emoji: card.emoji, name: card.name, count: 1 + Math.floor(Math.random() * 5), rarity: card.rarity });
    }
    rewardCards.push({ emoji: '💰', name: 'Gold', count: 100 + Math.floor(Math.random() * 500), rarity: 'common' });
    setRewards(rewardCards);
    setOpened(true);

    // Update chests
    if (readyChest) {
      setChests(chests.map(c => c.id === readyChest.id ? { ...c, isReady: false, isUnlocking: false, unlockProgress: 0 } : c));
      setProfile(prev => ({ ...prev, gold: prev.gold + 100 + Math.floor(Math.random() * 500) }));
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,30%,6%)] to-[hsl(220,25%,12%)]" />
      
      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: '100%', x: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 1, 0], y: '-20%' }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
          />
        ))}
      </div>

      {!opened ? (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotateZ: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            {readyChest?.emoji || '💰'}
          </motion.div>
          <h2 className="font-display font-bold text-xl text-foreground mb-1">{readyChest?.name || 'Chest'}</h2>
          <p className="text-[10px] text-muted-foreground mb-6">{T('chest.contains')} {readyChest?.cards || 3} {T('chest.cards')}</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={openChest}
            className="btn-battle text-base"
          >
            {T('chest.open_chest')}
          </motion.button>
          <button onClick={() => setScreen('menu')} className="block mt-4 text-xs text-muted-foreground mx-auto">{T('chest.go_back')}</button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 w-full px-4"
        >
          {/* Light burst */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/30 rounded-full blur-xl"
          />

          <h2 className="font-display font-bold text-lg text-primary text-center mb-4">{T('chest.rewards')}</h2>
          
          <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
            <AnimatePresence>
              {rewards.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
                  className={`bg-card border rounded-xl p-3 text-center ${
                    r.rarity === 'legendary' ? 'border-legendary/50 shadow-[0_0_10px_hsl(38,90%,50%,0.3)]' :
                    r.rarity === 'epic' ? 'border-epic/40' :
                    r.rarity === 'rare' ? 'border-[hsl(210,60%,50%,0.4)]' :
                    'border-border'
                  }`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <div className="text-[8px] font-bold text-foreground mt-1">{r.name}</div>
                  <div className={`text-[10px] font-bold mt-0.5 ${
                    r.rarity === 'legendary' ? 'text-legendary' :
                    r.rarity === 'epic' ? 'text-epic' :
                    r.rarity === 'rare' ? 'text-[hsl(210,60%,60%)]' :
                    'text-foreground'
                  }`}>x{r.count}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rewards.length * 0.15 + 0.3 }}
            onClick={() => setScreen('menu')}
            className="btn-battle text-sm mx-auto block mt-6"
          >
            {T('battle.continue')}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ChestOpenScreen;
