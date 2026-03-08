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

const RevealScreen = ({ items, title = '🎁 YOU GOT!', subtitle, onClose }: RevealScreenProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      onClick={e => e.stopPropagation()}
      className="w-[90%] max-w-sm bg-card border border-border rounded-2xl p-5 relative"
    >
      {/* Light burst */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-xl pointer-events-none"
      />

      <h2 className="font-display font-bold text-lg text-primary text-center mb-1 relative z-10">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground text-center mb-3 relative z-10">{subtitle}</p>}

      <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto relative z-10">
        {items.map((r, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
            className={`bg-background border rounded-xl p-3 text-center ${
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
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(items.length * 0.12, 1) + 0.3 }}
        onClick={onClose}
        className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase relative z-10"
      >
        Collect
      </motion.button>
    </motion.div>
  </motion.div>
);

export default RevealScreen;
