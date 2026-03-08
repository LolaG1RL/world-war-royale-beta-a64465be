import { motion, AnimatePresence } from 'framer-motion';

export interface RevealItem {
  emoji: string;
  name: string;
  count: number;
  rarity: string;
}

interface RevealScreenProps {
  items: RevealItem[];
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

const RevealScreen = ({ items, title = '🎁 Reward Claimed!', subtitle, onClose }: RevealScreenProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-slate-950/95"
  >
    {/* Floating particles */}
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

    {/* Burst effect */}
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/30 rounded-full blur-xl"
    />

    {/* Title */}
    <h2 className="font-display font-bold text-lg text-primary text-center mb-1 relative z-10">{title}</h2>
    {subtitle && <p className="text-xs text-muted-foreground mb-4 relative z-10">{subtitle}</p>}

    {/* Items grid */}
    <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto px-4 relative z-10">
      <AnimatePresence>
        {items.map((r, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
            className={`bg-card border rounded-xl p-3 text-center ${
              r.rarity === 'legendary' ? 'border-primary/50 shadow-[0_0_10px_hsl(38,90%,50%,0.3)]' :
              r.rarity === 'epic' ? 'border-purple-400/40' :
              r.rarity === 'rare' ? 'border-blue-400/40' :
              'border-border'
            }`}
          >
            <span className="text-2xl">{r.emoji}</span>
            <div className="text-[8px] font-bold text-foreground mt-1">{r.name}</div>
            <div className={`text-[10px] font-bold mt-0.5 ${
              r.rarity === 'legendary' ? 'text-primary' :
              r.rarity === 'epic' ? 'text-purple-400' :
              r.rarity === 'rare' ? 'text-blue-400' :
              'text-foreground'
            }`}>x{r.count}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>

    {/* Continue button */}
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(items.length * 0.15, 1) + 0.3 }}
      onClick={onClose}
      className="btn-battle text-sm mt-6 relative z-10"
    >
      Continue
    </motion.button>
  </motion.div>
);

export default RevealScreen;
