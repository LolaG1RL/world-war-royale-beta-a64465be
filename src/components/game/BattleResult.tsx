import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { Trophy, Star, Crown, Anchor } from 'lucide-react';
import { useState, useEffect } from 'react';

const BattleResult = () => {
  const { battleResult, setScreen } = useGame();
  const isWin = battleResult === 'win';
  const [netCrowns, setNetCrowns] = useState(0);
  const [riverBattle, setRiverBattle] = useState<any>(null);

  useEffect(() => {
    const c = parseInt(localStorage.getItem('last_battle_crowns') || '0');
    setNetCrowns(c);
    // Check if this was a river race battle
    const rb = localStorage.getItem('river_race_battle');
    if (rb) {
      try {
        const parsed = JSON.parse(rb);
        setRiverBattle(parsed);
        // Mark as completed so RiverRaceScreen can pick up the result
        localStorage.setItem('river_race_battle', JSON.stringify({ ...parsed, completed: true, result: isWin ? 'win' : 'loss' }));
      } catch {}
    }
  }, [isWin]);

  const isRiverRace = !!riverBattle;
  const trophyChange = isRiverRace ? 0 : parseInt(localStorage.getItem('last_trophy_change') || '0');

  const handleContinue = () => {
    if (isRiverRace) {
      setScreen('river-race');
    } else {
      setScreen('menu');
    }
  };

  // Calculate river race rewards for display
  const getRiverRewards = () => {
    if (!riverBattle) return { medals: 0, gold: 0 };
    const type = riverBattle.battleType;
    let medals = 0, gold = 0;
    if (type === '1v1') { medals = isWin ? 200 : 50; gold = isWin ? 150 : 30; }
    else if (type === 'duel') { medals = isWin ? 700 : 150; gold = isWin ? 450 : 90; }
    else if (type === 'special') { medals = isWin ? 250 : 75; gold = isWin ? 200 : 40; }
    else if (type === 'boat') { medals = isWin ? 150 : 30; gold = isWin ? 100 : 20; }
    if (riverBattle.isTrainingDay) medals = 0;
    return { medals, gold };
  };

  const rewards = getRiverRewards();

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

        {isRiverRace ? (
          <>
            {/* River Race rewards */}
            <div className="bg-card border border-border rounded-xl p-4 mt-4 space-y-2 w-64">
              {riverBattle.battleType === 'boat' && (
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Anchor className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-bold text-accent">Boat Battle</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Gold earned</span>
                <span className="text-[10px] font-bold text-foreground">💰 +{rewards.gold}</span>
              </div>
              {rewards.medals > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Medals earned</span>
                  <span className="text-[10px] font-bold text-primary">🏅 +{rewards.medals}</span>
                </div>
              ) : (
                <div className="text-[8px] text-[hsl(45,80%,60%)] text-center">Training Day — no medals earned</div>
              )}
              {riverBattle.battleType === 'boat' && isWin && (
                <div className="text-[8px] text-accent text-center font-bold">💥 Enemy defense damaged!</div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Trophy className={`w-5 h-5 ${isWin?'text-primary':'text-accent'}`} />
              <span className={`font-bold text-lg ${isWin?'text-primary':'text-accent'}`}>{isWin?'+':''}{trophyChange}</span>
            </div>

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
          </>
        )}
      </motion.div>

      <motion.button initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1}} onClick={handleContinue} className="btn-battle mt-10 relative z-10">
        Continue
      </motion.button>
    </div>
  );
};

export default BattleResult;
