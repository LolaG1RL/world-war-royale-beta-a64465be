import { motion } from 'framer-motion';
import { Trophy, Crown, Star } from 'lucide-react';

interface BattleResultProps {
  result: 'win' | 'lose';
  trophyChange: number;
  onContinue: () => void;
}

const BattleResult = ({ result, trophyChange, onContinue }: BattleResultProps) => {
  const isWin = result === 'win';

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className={`absolute inset-0 ${isWin ? 'bg-gradient-to-b from-primary/10 via-transparent to-transparent' : 'bg-gradient-to-b from-accent/10 via-transparent to-transparent'}`} />

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10 text-center"
      >
        {isWin && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-1 mb-4"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
              >
                <Star className="w-8 h-8 text-primary fill-primary" />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className={`text-7xl mb-4 ${isWin ? '' : 'grayscale'}`}>
          {isWin ? '🏆' : '💀'}
        </div>

        <h1 className={`font-display font-black text-4xl mb-2 ${isWin ? 'text-primary' : 'text-accent'}`}>
          {isWin ? 'VICTORY!' : 'DEFEAT'}
        </h1>

        <div className="flex items-center justify-center gap-2 mt-4">
          <Trophy className={`w-5 h-5 ${isWin ? 'text-primary' : 'text-accent'}`} />
          <span className={`font-bold text-lg ${isWin ? 'text-primary' : 'text-accent'}`}>
            {isWin ? '+' : ''}{trophyChange}
          </span>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={onContinue}
        className="btn-battle mt-10 relative z-10"
      >
        Continue
      </motion.button>
    </div>
  );
};

export default BattleResult;
