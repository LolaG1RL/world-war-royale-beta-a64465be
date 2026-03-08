import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { Trophy, Star, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';

const BattleResult = () => {
  const { battleResult, setScreen } = useGame();
  const isWin = battleResult === 'win';
  const trophyChange = isWin ? 30 : -15;
  const [netCrowns, setNetCrowns] = useState(0);

  useEffect(() => {
    const c = parseInt(localStorage.getItem('last_battle_crowns') || '0');
    setNetCrowns(c);
  }, []);

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-b ${isWin ? 'from-primary/10' : 'from-accent/10'} via-transparent to-transparent`} />

      <motion.div initial={{scale:0,rotate:-20}} animate={{scale:1,rotate:0}} transition={{type:'spring',stiffness:200,damping:15}} className="relative z-10 text-center">
        {isWin && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}} className="flex justify-center gap-1 mb-4">
            {[0,1,2].map(i => (
              <motion.div key={i} initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{delay:0.5+i*0.2}}>
                <Star className="w-8 h-8 text-primary fill-primary" />
              </motion.div>
            ))}
          </motion.div>
        )}
        <div className={`text-7xl mb-4 ${isWin?'':'grayscale'}`}>{isWin?'🏆':'💀'}</div>
        <h1 className={`font-display font-black text-4xl mb-2 ${isWin?'text-primary':'text-accent'}`}>{isWin?'VICTORY!':'DEFEAT'}</h1>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Trophy className={`w-5 h-5 ${isWin?'text-primary':'text-accent'}`} />
          <span className={`font-bold text-lg ${isWin?'text-primary':'text-accent'}`}>{isWin?'+':''}{trophyChange}</span>
        </div>

        {/* Crown change for War Pass */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-1.5 mt-3"
        >
          <Crown className={`w-4 h-4 ${netCrowns >= 0 ? 'text-primary' : 'text-accent'}`} />
          <span className={`text-sm font-bold ${netCrowns >= 0 ? 'text-primary' : 'text-accent'}`}>
            {netCrowns >= 0 ? '+' : ''}{netCrowns} War Pass Crowns
          </span>
        </motion.div>
      </motion.div>

      <motion.button initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1}} onClick={() => setScreen('menu')} className="btn-battle mt-10 relative z-10">
        Continue
      </motion.button>
    </div>
  );
};

export default BattleResult;
