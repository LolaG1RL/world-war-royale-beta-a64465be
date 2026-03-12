import { useGame } from '@/context/GameContext';
import { useSettings } from '@/context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Crown, Anchor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { t } from '@/lib/i18n';
import { playVictory, playDefeat } from '@/lib/sfx';

const BattleResult = () => {
  const { battleResult, setScreen, profile, clan } = useGame();
  const { language } = useSettings();
  const isWin = battleResult === 'win';
  const [netCrowns, setNetCrowns] = useState(0);
  const [riverBattle, setRiverBattle] = useState<any>(null);
  const [eventBattle, setEventBattle] = useState<any>(null);
  const [showCrowns, setShowCrowns] = useState(false);
  const [zoomOut, setZoomOut] = useState(false);

  // Opponent data (stored from BattleIntro)
  const [oppName] = useState(() => {
    try { return localStorage.getItem('last_opp_name') || 'Opponent'; } catch { return 'Opponent'; }
  });
  const [oppClan] = useState(() => {
    try { return localStorage.getItem('last_opp_clan') || ''; } catch { return ''; }
  });

  useEffect(() => {
    const c = parseInt(localStorage.getItem('last_battle_crowns') || '0');
    setNetCrowns(c);
    const rb = localStorage.getItem('river_race_battle');
    if (rb) {
      try {
        const parsed = JSON.parse(rb);
        setRiverBattle(parsed);
        localStorage.setItem('river_race_battle', JSON.stringify({ ...parsed, completed: true, result: isWin ? 'win' : 'loss' }));
      } catch {}
    }
    // Event battle context
    const eb = localStorage.getItem('event_battle');
    if (eb) {
      try {
        const parsed = JSON.parse(eb);
        setEventBattle(parsed);
        // Update event progress
        const progKey = `event_progress_${parsed.eventId}`;
        const stored = localStorage.getItem(progKey);
        const prog = stored ? JSON.parse(stored) : { wins: 0, losses: 0, claimed: [], completed: false };
        if (isWin) prog.wins += 1; else prog.losses += 1;
        if (parsed.maxWins && prog.wins >= parsed.maxWins) prog.completed = true;
        if (parsed.maxLosses && parsed.maxLosses > 0 && prog.losses >= parsed.maxLosses) prog.completed = true;
        localStorage.setItem(progKey, JSON.stringify(prog));
        localStorage.setItem('event_battle', JSON.stringify({ ...parsed, completed: true, result: isWin ? 'win' : 'loss' }));
      } catch {}
    }
    // Advance daily quests on any battle
    try {
      const d = new Date();
      const todayKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const stored = localStorage.getItem('daily_quest_progress');
      if (stored) {
        const qp = JSON.parse(stored);
        if (qp.date === todayKey) {
          // Quest 0: "Win 3 Battles" - only on wins
          if (isWin && qp.quests[0] && qp.quests[0].progress < 3) {
            qp.quests[0].progress += 1;
          }
          // Quest 1: "Play 5 Cards" - increment on every battle (you always play cards)
          if (qp.quests[1] && qp.quests[1].progress < 5) {
            qp.quests[1].progress += 1;
          }
          // Quest 2: "Destroy 10 Towers" - increment by crowns earned
          const crowns = Math.max(0, parseInt(localStorage.getItem('last_battle_crowns') || '0'));
          if (qp.quests[2] && qp.quests[2].progress < 10) {
            qp.quests[2].progress = Math.min(10, qp.quests[2].progress + crowns);
          }
          localStorage.setItem('daily_quest_progress', JSON.stringify(qp));
        }
      }
    } catch {}
    // Play sfx
    if (isWin) playVictory(); else playDefeat();
    // Animate: zoom out, then show crowns
    setTimeout(() => setZoomOut(true), 200);
    setTimeout(() => setShowCrowns(true), 1200);
  }, [isWin]);

  const isRiverRace = !!riverBattle;
  const isEventBattle = !!eventBattle;
  const trophyChange = (isRiverRace || isEventBattle) ? 0 : parseInt(localStorage.getItem('last_trophy_change') || '0');

  const handleContinue = () => {
    if (isEventBattle) { localStorage.removeItem('event_battle'); setScreen('events'); }
    else if (isRiverRace) setScreen('river-race');
    else setScreen('menu');
  };

  const playerCrowns = Math.max(0, netCrowns);
  const oppCrowns = Math.max(0, -netCrowns + (isWin ? 0 : Math.abs(netCrowns)));

  // Calculate actual tower crowns
  const pCrownsDisplay = isWin ? Math.max(1, playerCrowns) : Math.max(0, playerCrowns);
  const eCrownsDisplay = isWin ? Math.max(0, 3 - pCrownsDisplay) : Math.max(1, 3 - pCrownsDisplay);

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

  const CrownRow = ({ crowns, name, clanName, isPlayer }: { crowns: number; name: string; clanName: string; isPlayer: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: isPlayer ? 40 : -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, type: 'spring', stiffness: 150, damping: 15 }}
      className={`relative flex flex-col items-center`}
    >
      {/* Cushion */}
      <div className={`relative w-64 py-3 px-4 rounded-2xl border-2 ${
        isPlayer 
          ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 border-blue-400/50' 
          : 'bg-gradient-to-r from-red-900/80 to-red-800/80 border-red-400/50'
      }`}>
        {/* Cushion shine */}
        <div className={`absolute inset-0 rounded-2xl opacity-20 ${
          isPlayer ? 'bg-gradient-to-b from-blue-300 to-transparent' : 'bg-gradient-to-b from-red-300 to-transparent'
        }`} />
        
        {/* Crowns */}
        <div className="flex justify-center gap-3 mb-2">
          <AnimatePresence>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -30, scale: 0, rotate: -30 }}
                animate={showCrowns && i < crowns ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : { opacity: 0.15, y: 0, scale: 0.7, rotate: 0 }}
                transition={{ delay: 1.6 + i * 0.3, type: 'spring', stiffness: 200, damping: 12 }}
                className="relative"
              >
                <span className={`text-3xl ${i < crowns ? '' : 'grayscale opacity-30'}`}>
                  {isPlayer ? '👑' : '👑'}
                </span>
                {isPlayer && i < crowns && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-blue-400/60 rounded-full mt-1" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Name & Clan */}
        <div className="text-center relative z-10">
          <div className={`font-display font-bold text-sm ${isPlayer ? 'text-blue-200' : 'text-red-200'}`}>
            {name}
          </div>
          {clanName && (
            <div className={`text-[9px] flex items-center justify-center gap-1 ${isPlayer ? 'text-blue-400/70' : 'text-red-400/70'}`}>
              {clanName}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background battlefield zoom out effect */}
      <motion.div 
        initial={{ scale: 1.2 }} 
        animate={zoomOut ? { scale: 1 } : { scale: 1.2 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className={`absolute inset-0 bg-gradient-to-b ${isWin ? 'from-primary/10' : 'from-accent/10'} via-transparent to-transparent`}
      />

      {/* "GAME ENDS" text */}
      <motion.div
        initial={{ opacity: 0, scale: 2 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [2, 1, 1, 0.8] }}
        transition={{ duration: 2, times: [0, 0.2, 0.7, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
      >
        <span className="font-display font-black text-3xl text-foreground drop-shadow-lg uppercase tracking-widest">
          {isWin ? t('battle.victory', language) : t('battle.defeat', language)}
        </span>
      </motion.div>

      {/* Crown cushion display */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: showCrowns ? 1 : 0 }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        {/* Opponent cushion (top, red) */}
        <CrownRow crowns={eCrownsDisplay} name={oppName} clanName={oppClan} isPlayer={false} />
        
        {/* VS divider */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={showCrowns ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.5 }}
          className="text-muted-foreground font-display font-bold text-sm"
        >
          ⚔️
        </motion.div>

        {/* Player cushion (bottom, blue) */}
        <CrownRow crowns={pCrownsDisplay} name={profile.name} clanName={clan?.name || ''} isPlayer={true} />
      </motion.div>

      {/* Trophy/reward info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={showCrowns ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 2.5 }}
        className="relative z-10 mt-6"
      >
        {isRiverRace ? (
          <div className="bg-card border border-border rounded-xl p-4 space-y-2 w-64">
            {riverBattle.battleType === 'boat' && (
              <div className="flex items-center justify-center gap-1 mb-1">
               <Anchor className="w-4 h-4 text-accent" />
                <span className="text-[10px] font-bold text-accent">{t('battle.boat_battle_label', language)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{t('battle.gold_earned', language)}</span>
              <span className="text-[10px] font-bold text-foreground">💰 +{rewards.gold}</span>
            </div>
            {rewards.medals > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{t('battle.medals', language)}</span>
                <span className="text-[10px] font-bold text-primary">🏅 +{rewards.medals}</span>
              </div>
            ) : (
              <div className="text-[8px] text-[hsl(45,80%,60%)] text-center">{t('battle.training_day', language)}</div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Trophy className={`w-5 h-5 ${isWin ? 'text-primary' : 'text-accent'}`} />
            <span className={`font-bold text-lg ${isWin ? 'text-primary' : 'text-accent'}`}>{isWin ? '+' : ''}{trophyChange}</span>
          </div>
        )}
      </motion.div>

      <motion.button 
        initial={{ opacity: 0, y: 20 }} 
        animate={showCrowns ? { opacity: 1, y: 0 } : {}} 
        transition={{ delay: 3 }} 
        onClick={handleContinue} 
        className="btn-battle mt-6 relative z-10"
      >
        {t('battle.continue', language)}
      </motion.button>
    </div>
  );
};

export default BattleResult;
