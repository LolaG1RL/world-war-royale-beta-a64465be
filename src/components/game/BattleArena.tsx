import { useState, useEffect, useCallback, useRef } from 'react';
import { GameCard, getSpeedValue, canTarget, getRangeValue, SPEED_VALUES } from '@/data/cards';
import { useGame } from '@/context/GameContext';
import CardComponent from './CardComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { allEmotes, getEquippedEmotes } from '@/data/emotes';

import BattleIntro from './BattleIntro';
import BattleBannerDisplay from './BattleBannerDisplay';
import { getPlayerBanner } from '@/data/banners';

interface DeployedUnit {
  id: string;
  card: GameCard;
  x: number;
  y: number;
  side: 'player' | 'enemy';
  key: number;
  hp: number;
  maxHp: number;
  shieldHp: number;
  lastAttackTime: number;
  targetId: string | null;
  isCharging: boolean;
  deployCount: number; // track individual unit for swarms
}

interface TowerData {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  side: 'player' | 'enemy';
  type: 'king' | 'princess';
  lastAttackTime: number;
}

const BattleArena = () => {
  const { deck, setScreen, setBattleResult, setProfile, profile } = useGame();
  const isRiverRace = !!localStorage.getItem('river_race_battle');
  const [showIntro, setShowIntro] = useState(true);
  const playerBanner = getPlayerBanner();
  const [elixir, setElixir] = useState(5);
  const [maxElixir] = useState(10);
  const [timer, setTimer] = useState(180);
  const [hand, setHand] = useState<GameCard[]>([]);
  const [nextCard, setNextCard] = useState<GameCard | null>(null);
  const [deployedUnits, setDeployedUnits] = useState<DeployedUnit[]>([]);
  const [towers, setTowers] = useState<TowerData[]>([
    // Enemy towers
    { id: 'e-king', x: 50, y: 4, hp: 4000, maxHp: 4000, side: 'enemy', type: 'king', lastAttackTime: 0 },
    { id: 'e-left', x: 20, y: 17, hp: 2500, maxHp: 2500, side: 'enemy', type: 'princess', lastAttackTime: 0 },
    { id: 'e-right', x: 80, y: 17, hp: 2500, maxHp: 2500, side: 'enemy', type: 'princess', lastAttackTime: 0 },
    // Player towers
    { id: 'p-king', x: 50, y: 88, hp: 4000, maxHp: 4000, side: 'player', type: 'king', lastAttackTime: 0 },
    { id: 'p-left', x: 20, y: 75, hp: 2500, maxHp: 2500, side: 'player', type: 'princess', lastAttackTime: 0 },
    { id: 'p-right', x: 80, y: 75, hp: 2500, maxHp: 2500, side: 'player', type: 'princess', lastAttackTime: 0 },
  ]);
  const [unitCounter, setUnitCounter] = useState(0);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [isDoubleElixir, setIsDoubleElixir] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);
  const [activeEmote, setActiveEmote] = useState<{svg: string; side: 'player' | 'enemy'; key: number} | null>(null);
  const [emoteCounter, setEmoteCounter] = useState(0);
  const [damageNumbers, setDamageNumbers] = useState<{id: number; x: number; y: number; damage: number}[]>([]);
  const damageCounter = useRef(0);
  const equippedEmoteIds = getEquippedEmotes();
  const equippedEmotes = equippedEmoteIds.map(id => allEmotes.find(e => e.id === id)).filter(Boolean);
  const enemyElixir = useRef(5);
  const gameTime = useRef(0);

  const playerTowerHP = {
    king: towers.find(t => t.id === 'p-king')?.hp ?? 0,
    left: towers.find(t => t.id === 'p-left')?.hp ?? 0,
    right: towers.find(t => t.id === 'p-right')?.hp ?? 0,
  };
  const enemyTowerHP = {
    king: towers.find(t => t.id === 'e-king')?.hp ?? 0,
    left: towers.find(t => t.id === 'e-left')?.hp ?? 0,
    right: towers.find(t => t.id === 'e-right')?.hp ?? 0,
  };

  // Deaf Mode event listeners
  useEffect(() => {
    const handler = (e: Event) => {
      const { action } = (e as CustomEvent).detail;
      switch (action) {
        case 'insta-elixir':
          setElixir(10);
          break;
        case 'insta-win': {
          const pC = (enemyTowerHP.left <= 0 ? 1 : 0) + (enemyTowerHP.right <= 0 ? 1 : 0) + (enemyTowerHP.king <= 0 ? 1 : 0) + 3;
          const eC = (playerTowerHP.left <= 0 ? 1 : 0) + (playerTowerHP.right <= 0 ? 1 : 0) + (playerTowerHP.king <= 0 ? 1 : 0);
          const net = pC - eC;
          const s1 = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
          s1.crowns = Math.max(0, (s1.crowns || 0) + net);
          localStorage.setItem('war_pass_data', JSON.stringify(s1));
          localStorage.setItem('last_battle_crowns', String(net));
          setBattleResult('win');
          if (!isRiverRace) { const gain = 20 + Math.floor(Math.random() * 21); localStorage.setItem('last_trophy_change', String(gain)); setProfile(prev => ({ ...prev, trophies: prev.trophies + gain, wins: prev.wins + 1 })); }
          setScreen('result');
          break;
        }
        case 'insta-lose': {
          const pC2 = (enemyTowerHP.left <= 0 ? 1 : 0) + (enemyTowerHP.right <= 0 ? 1 : 0) + (enemyTowerHP.king <= 0 ? 1 : 0);
          const eC2 = (playerTowerHP.left <= 0 ? 1 : 0) + (playerTowerHP.right <= 0 ? 1 : 0) + (playerTowerHP.king <= 0 ? 1 : 0) + 3;
          const net2 = pC2 - eC2;
          const s2 = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
          s2.crowns = Math.max(0, (s2.crowns || 0) + net2);
          localStorage.setItem('war_pass_data', JSON.stringify(s2));
          localStorage.setItem('last_battle_crowns', String(net2));
          setBattleResult('lose');
          if (!isRiverRace) { const loss = 10 + Math.floor(Math.random() * 21); localStorage.setItem('last_trophy_change', String(-loss)); setProfile(prev => ({ ...prev, losses: prev.losses + 1, trophies: Math.max(0, prev.trophies - loss) })); }
          setScreen('result');
          break;
        }
        case 'spawn-unit': {
          const troops = deck.filter(c => c.type === 'troop');
          if (!troops.length) break;
          const card = troops[Math.floor(Math.random() * troops.length)];
          spawnUnit(card, 30 + Math.random() * 40, 60 + Math.random() * 15, 'player');
          break;
        }
      }
    };
    window.addEventListener('deaf-mod', handler);
    return () => window.removeEventListener('deaf-mod', handler);
  }, [deck, setBattleResult, setProfile, setScreen, enemyTowerHP, playerTowerHP]);

  useEffect(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setHand(shuffled.slice(0, 4));
    setNextCard(shuffled[4] || shuffled[0]);
  }, [deck]);

  const spawnUnit = useCallback((card: GameCard, x: number, y: number, side: 'player' | 'enemy') => {
    const count = card.deployCount || 1;
    const baseHp = card.hp || 100;
    const shieldHp = card.shieldHp || 0;
    
    setUnitCounter(prev => {
      const newUnits: DeployedUnit[] = [];
      for (let i = 0; i < count; i++) {
        const offsetX = count > 1 ? (i % 3 - 1) * 4 : 0;
        const offsetY = count > 1 ? Math.floor(i / 3) * 4 : 0;
        newUnits.push({
          id: `${side[0]}-${prev + i}`,
          card,
          x: Math.max(5, Math.min(95, x + offsetX)),
          y: Math.max(5, Math.min(95, y + offsetY)),
          side,
          key: prev + i,
          hp: baseHp,
          maxHp: baseHp,
          shieldHp,
          lastAttackTime: 0,
          targetId: null,
          isCharging: false,
          deployCount: i,
        });
      }
      setDeployedUnits(u => [...u, ...newUnits]);
      return prev + count;
    });
  }, []);

  // Elixir regen
  useEffect(() => {
    const rate = isDoubleElixir ? 0.5 : 1;
    const interval = setInterval(() => {
      setElixir(prev => Math.min(prev + 0.5, maxElixir));
      enemyElixir.current = Math.min(enemyElixir.current + 0.5 * (isDoubleElixir ? 2 : 1), 10);
    }, 1000 * rate);
    return () => clearInterval(interval);
  }, [maxElixir, isDoubleElixir]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 60 && !isDoubleElixir) setIsDoubleElixir(true);
        if (prev <= 0) {
          const pCrowns = (enemyTowerHP.left <= 0 ? 1 : 0) + (enemyTowerHP.right <= 0 ? 1 : 0) + (enemyTowerHP.king <= 0 ? 1 : 0);
          const eCrowns = (playerTowerHP.left <= 0 ? 1 : 0) + (playerTowerHP.right <= 0 ? 1 : 0) + (playerTowerHP.king <= 0 ? 1 : 0);
          const netCrowns = pCrowns - eCrowns;
          const saved = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
          saved.crowns = Math.max(0, (saved.crowns || 0) + netCrowns);
          localStorage.setItem('war_pass_data', JSON.stringify(saved));
          localStorage.setItem('last_battle_crowns', String(netCrowns));
          const result = pCrowns >= eCrowns ? 'win' : 'lose';
          setBattleResult(result);
          if (!isRiverRace) { 
            const change = result === 'win' ? (20 + Math.floor(Math.random() * 21)) : -(10 + Math.floor(Math.random() * 21)); 
            localStorage.setItem('last_trophy_change', String(change)); 
            setProfile(prev => ({ ...prev, trophies: Math.max(0, prev.trophies + change), wins: result === 'win' ? prev.wins + 1 : prev.wins, losses: result === 'lose' ? prev.losses + 1 : prev.losses })); 
          }
          setScreen('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [enemyTowerHP, playerTowerHP, isDoubleElixir, setBattleResult, setScreen, setProfile, isRiverRace]);

  // Enemy AI - smarter deployment
  useEffect(() => {
    const interval = setInterval(() => {
      const troops = deck.filter(c => c.type === 'troop');
      if (!troops.length) return;
      
      // Pick card based on elixir cost
      const affordable = troops.filter(c => c.elixir <= enemyElixir.current);
      if (affordable.length === 0) return;
      
      const card = affordable[Math.floor(Math.random() * affordable.length)];
      enemyElixir.current -= card.elixir;
      
      // Smart placement: counter player's lane or push empty lane
      const playerUnits = deployedUnits.filter(u => u.side === 'player');
      const leftLane = playerUnits.filter(u => u.x < 50).length;
      const rightLane = playerUnits.filter(u => u.x >= 50).length;
      
      let deployX = 50;
      if (leftLane > rightLane) deployX = 25 + Math.random() * 15; // Counter left
      else if (rightLane > leftLane) deployX = 60 + Math.random() * 15; // Counter right
      else deployX = Math.random() > 0.5 ? (25 + Math.random() * 15) : (60 + Math.random() * 15);
      
      // Deploy behind king tower for tanks, at bridge for fast units
      const speed = getSpeedValue(card.speed);
      const deployY = speed >= SPEED_VALUES.fast ? 25 : 10 + Math.random() * 10;
      
      spawnUnit(card, deployX, deployY, 'enemy');
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [deck, deployedUnits, spawnUnit]);

  // Main combat simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      gameTime.current += 100;
      const now = gameTime.current;

      setDeployedUnits(prevUnits => {
        let units = [...prevUnits];
        const livingTowers = towers.filter(t => t.hp > 0);

        // Process each unit
        units = units.map(unit => {
          if (unit.hp <= 0) return unit;

          const card = unit.card;
          const speed = getSpeedValue(card.speed) * 0.8; // Scaled for arena
          const range = getRangeValue(card.range) * 5; // Scaled tiles to %
          const hitSpeed = (card.hitSpeed || 1.0) * 1000; // Convert to ms

          // Find target
          const enemySide = unit.side === 'player' ? 'enemy' : 'player';
          let target: DeployedUnit | TowerData | null = null;
          let targetDist = Infinity;

          // Check if this unit only targets buildings
          const targetsBuildings = card.targets === 'buildings';

          if (!targetsBuildings) {
            // Find closest enemy unit we can target
            for (const enemy of units) {
              if (enemy.side !== enemySide || enemy.hp <= 0) continue;
              if (!canTarget(card, enemy.card)) continue;
              
              const dist = Math.sqrt((unit.x - enemy.x) ** 2 + (unit.y - enemy.y) ** 2);
              if (dist < targetDist) {
                targetDist = dist;
                target = enemy;
              }
            }
          }

          // If no unit target or targets buildings, find closest tower
          if (!target || targetsBuildings) {
            for (const tower of livingTowers) {
              if (tower.side !== enemySide) continue;
              // Can't target king until a princess tower is down
              if (tower.type === 'king') {
                const princesses = livingTowers.filter(t => t.side === enemySide && t.type === 'princess');
                if (princesses.length === 2) continue;
              }
              const dist = Math.sqrt((unit.x - tower.x) ** 2 + (unit.y - tower.y) ** 2);
              if (dist < targetDist) {
                targetDist = dist;
                target = tower;
              }
            }
          }

          // Move towards target or attack
          if (target) {
            if (targetDist > range) {
              // Move towards target
              const dx = (target.x - unit.x) / targetDist;
              const dy = (target.y - unit.y) / targetDist;
              return {
                ...unit,
                x: unit.x + dx * speed,
                y: unit.y + dy * speed,
                isCharging: card.chargeSpeed && targetDist > range * 2,
              };
            } else {
              // In range - attack if ready
              if (now - unit.lastAttackTime >= hitSpeed) {
                const damage = card.damage * (unit.isCharging && card.chargeSpeed ? card.chargeSpeed : 1);
                
                // Show damage number
                damageCounter.current++;
                setDamageNumbers(prev => [...prev, { id: damageCounter.current, x: target!.x, y: target!.y, damage }]);
                setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== damageCounter.current)), 800);

                return { ...unit, lastAttackTime: now, isCharging: false };
              }
            }
          } else {
            // No target - move towards enemy side
            const moveDir = unit.side === 'player' ? -1 : 1;
            return { ...unit, y: unit.y + moveDir * speed };
          }

          return unit;
        });

        // Process attacks (apply damage)
        units.forEach(unit => {
          if (unit.hp <= 0) return;
          const card = unit.card;
          const range = getRangeValue(card.range) * 5;
          const hitSpeed = (card.hitSpeed || 1.0) * 1000;

          if (gameTime.current - unit.lastAttackTime < hitSpeed && unit.lastAttackTime > 0) return;

          const enemySide = unit.side === 'player' ? 'enemy' : 'player';
          const targetsBuildings = card.targets === 'buildings';
          const splash = card.splashRadius ? card.splashRadius * 5 : 0;

          // Damage enemy units
          if (!targetsBuildings) {
            units.forEach(enemy => {
              if (enemy.side !== enemySide || enemy.hp <= 0) continue;
              if (!canTarget(card, enemy.card)) continue;
              
              const dist = Math.sqrt((unit.x - enemy.x) ** 2 + (unit.y - enemy.y) ** 2);
              if (dist <= range + (splash > 0 ? splash : 0)) {
                const damage = card.damage * (unit.isCharging && card.chargeSpeed ? card.chargeSpeed : 1);
                // First hit shield
                if (enemy.shieldHp > 0) {
                  enemy.shieldHp = Math.max(0, enemy.shieldHp - damage);
                } else {
                  enemy.hp -= damage;
                }
              }
            });
          }
        });

        // Tower attacks
        setTowers(prevTowers => {
          return prevTowers.map(tower => {
            if (tower.hp <= 0) return tower;
            
            const attackInterval = tower.type === 'king' ? 1200 : 900;
            if (now - tower.lastAttackTime < attackInterval) return tower;

            const enemySide = tower.side === 'player' ? 'enemy' : 'player';
            const enemyUnits = units.filter(u => u.side === enemySide && u.hp > 0);
            
            // Sort by distance
            enemyUnits.sort((a, b) => {
              const distA = Math.sqrt((tower.x - a.x) ** 2 + (tower.y - a.y) ** 2);
              const distB = Math.sqrt((tower.x - b.x) ** 2 + (tower.y - b.y) ** 2);
              return distA - distB;
            });

            const rangeLimit = tower.type === 'king' ? 25 : 20;
            const target = enemyUnits.find(u => {
              const dist = Math.sqrt((tower.x - u.x) ** 2 + (tower.y - u.y) ** 2);
              return dist <= rangeLimit;
            });

            if (target) {
              const damage = tower.type === 'king' ? 80 : 50;
              target.hp -= damage;
              
              damageCounter.current++;
              setDamageNumbers(prev => [...prev, { id: damageCounter.current, x: target.x, y: target.y, damage }]);
              
              return { ...tower, lastAttackTime: now };
            }
            return tower;
          });
        });

        // Apply unit damage to towers
        units.forEach(unit => {
          if (unit.hp <= 0) return;
          const card = unit.card;
          const range = getRangeValue(card.range) * 5;
          const hitSpeed = (card.hitSpeed || 1.0) * 1000;

          if (gameTime.current - unit.lastAttackTime < 100) return; // Just attacked

          const enemySide = unit.side === 'player' ? 'enemy' : 'player';
          
          setTowers(prevTowers => {
            return prevTowers.map(tower => {
              if (tower.hp <= 0 || tower.side !== enemySide) return tower;
              
              // Check if king is attackable
              if (tower.type === 'king') {
                const princesses = prevTowers.filter(t => t.side === enemySide && t.type === 'princess' && t.hp > 0);
                if (princesses.length === 2) return tower;
              }

              const dist = Math.sqrt((unit.x - tower.x) ** 2 + (unit.y - tower.y) ** 2);
              if (dist <= range) {
                const damage = card.damage;
                return { ...tower, hp: Math.max(0, tower.hp - damage * 0.1) }; // Gradual damage for visualization
              }
              return tower;
            });
          });
        });

        // Handle death damage
        units.forEach(unit => {
          if (unit.hp <= 0 && unit.card.deathDamage) {
            const splash = (unit.card.splashRadius || 1) * 5;
            const enemySide = unit.side === 'player' ? 'enemy' : 'player';
            
            units.forEach(enemy => {
              if (enemy.side !== enemySide || enemy.hp <= 0) return;
              const dist = Math.sqrt((unit.x - enemy.x) ** 2 + (unit.y - enemy.y) ** 2);
              if (dist <= splash) {
                enemy.hp -= unit.card.deathDamage!;
              }
            });
          }
        });

        // Remove dead units
        return units.filter(u => u.hp > 0);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [towers]);

  const deployCard = useCallback((ax: number, ay: number) => {
    if (selectedCard === null) return;
    const card = hand[selectedCard];
    if (!card || elixir < card.elixir) return;
    
    // Only deploy on player's side
    if (ay < 50) return;
    
    setElixir(p => p - card.elixir);
    
    if (card.type === 'spell') {
      // Handle spell effects
      const splash = (card.splashRadius || 2) * 5;
      
      // Damage enemies in radius
      setDeployedUnits(units => units.map(u => {
        if (u.side === 'player') return u;
        const dist = Math.sqrt((ax - u.x) ** 2 + (ay - u.y) ** 2);
        if (dist <= splash) {
          return { ...u, hp: u.hp - card.damage };
        }
        return u;
      }));
      
      // Damage towers
      setTowers(t => t.map(tower => {
        if (tower.side === 'player') return tower;
        const dist = Math.sqrt((ax - tower.x) ** 2 + (ay - tower.y) ** 2);
        if (dist <= splash) {
          return { ...tower, hp: Math.max(0, tower.hp - card.damage) };
        }
        return tower;
      }));

      // Show damage indicator
      damageCounter.current++;
      setDamageNumbers(prev => [...prev, { id: damageCounter.current, x: ax, y: ay, damage: card.damage }]);
    } else {
      spawnUnit(card, ax, ay, 'player');
    }
    
    setHand(prev => {
      const n = [...prev];
      n[selectedCard] = nextCard!;
      return n;
    });
    const rem = deck.filter(c => !hand.includes(c) && c.id !== nextCard?.id);
    setNextCard(rem[Math.floor(Math.random() * rem.length)] || deck[0]);
    setSelectedCard(null);
  }, [selectedCard, hand, elixir, nextCard, deck, spawnUnit]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const pCrowns = (enemyTowerHP.left <= 0 ? 1 : 0) + (enemyTowerHP.right <= 0 ? 1 : 0) + (enemyTowerHP.king <= 0 ? 1 : 0);
  const eCrowns = (playerTowerHP.left <= 0 ? 1 : 0) + (playerTowerHP.right <= 0 ? 1 : 0) + (playerTowerHP.king <= 0 ? 1 : 0);

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col arena-field relative overflow-hidden">
      {/* Battle Intro */}
      {showIntro && <BattleIntro onComplete={() => setShowIntro(false)} />}

      {/* Mini banner */}
      {!showIntro && (
        <div className="absolute top-10 left-2 right-2 z-30 pointer-events-none">
          <BattleBannerDisplay banner={playerBanner} name={profile.name} trophies={profile.trophies} size="sm" className="opacity-70" />
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[hsl(220,20%,10%,0.95)] z-20 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-blue-400 font-bold font-display text-[10px]">YOU</span>
          <div className="flex gap-0.5">{[0,1,2].map(i => <span key={i} className={`text-[10px] ${i < pCrowns ? 'text-primary' : 'text-muted-foreground/20'}`}>⭐</span>)}</div>
        </div>
        <div className={`px-3 py-0.5 rounded-full font-display font-bold text-sm ${isDoubleElixir ? 'bg-accent/20 text-accent' : 'bg-muted text-primary'}`}>
          {fmt(timer)}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">{[0,1,2].map(i => <span key={i} className={`text-[10px] ${i < eCrowns ? 'text-accent' : 'text-muted-foreground/20'}`}>⭐</span>)}</div>
          <span className="text-red-400 font-bold font-display text-[10px]">FOE</span>
        </div>
      </div>

      {isDoubleElixir && (
        <div className="bg-accent/20 text-center py-0.5 text-[8px] font-bold text-accent uppercase tracking-widest">⚡ Double Elixir ⚡</div>
      )}

      {/* Arena */}
      <div className="flex-1 relative" onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        deployCard(x, y);
      }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-900/30 to-slate-900" />
        
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({length: 8}).map((_, i) => <div key={i} className="absolute left-0 right-0 border-t border-foreground" style={{top: `${(i+1)*12.5}%`}} />)}
        </div>

        {/* River */}
        <div className="absolute left-0 right-0 top-[47%] h-[6%] bg-arena-river/40">
          <div className="absolute inset-0 bg-gradient-to-b from-arena-river/20 via-arena-river/50 to-arena-river/20" />
        </div>
        {/* Bridges */}
        <div className="absolute left-[18%] top-[46%] w-[14%] h-[8%] bg-amber-900/80 rounded border border-amber-700/50 z-10" />
        <div className="absolute right-[18%] top-[46%] w-[14%] h-[8%] bg-amber-900/80 rounded border border-amber-700/50 z-10" />

        {/* Towers */}
        {towers.map(tower => (
          <Tower key={tower.id} tower={tower} />
        ))}

        {/* Units */}
        <AnimatePresence>
          {deployedUnits.map(u => (
            <motion.div 
              key={u.key} 
              initial={{scale:0}} 
              animate={{scale:1}} 
              exit={{scale:0,opacity:0}} 
              className="absolute z-20" 
              style={{left:`${u.x}%`,top:`${u.y}%`,transform:'translate(-50%,-50%)'}}
            >
              <div className={`relative ${u.card.unitType === 'air' ? '-mt-3' : ''}`}>
                {/* Shadow for air units */}
                {u.card.unitType === 'air' && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/30 rounded-full blur-sm" />
                )}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg ${
                  u.side==='player'
                    ? 'bg-blue-700 border-2 border-blue-400'
                    : 'bg-red-700 border-2 border-red-400'
                } ${u.isCharging ? 'animate-pulse ring-2 ring-primary' : ''}`}>
                  {u.card.emoji}
                </div>
                {/* HP bar */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-black/60 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${u.hp/u.maxHp > 0.5 ? 'bg-hp-green' : u.hp/u.maxHp > 0.25 ? 'bg-yellow-500' : 'bg-hp-red'}`} 
                    style={{width:`${(u.hp/u.maxHp)*100}%`}} 
                  />
                </div>
                {/* Shield indicator */}
                {u.shieldHp > 0 && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px]">🛡️</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Damage numbers */}
        <AnimatePresence>
          {damageNumbers.map(d => (
            <motion.div
              key={d.id}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -20, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute z-50 pointer-events-none"
              style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <span className="text-red-400 font-black text-sm drop-shadow-lg">-{d.damage}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Emote display */}
        <AnimatePresence>
          {activeEmote && (
            <motion.div
              key={activeEmote.key}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="absolute z-30"
              style={{ left: activeEmote.side === 'player' ? '70%' : '30%', top: activeEmote.side === 'player' ? '70%' : '20%', transform: 'translate(-50%,-50%)' }}
            >
              <div className="w-14 h-14 rounded-full bg-slate-900/90 border-2 border-primary/50 p-1 shadow-xl" dangerouslySetInnerHTML={{ __html: activeEmote.svg }} />
            </motion.div>
          )}
        </AnimatePresence>

        {selectedCard !== null && (
          <div className="absolute bottom-0 left-0 right-0 top-1/2 border-t-2 border-dashed border-primary/20 bg-primary/5 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 text-center text-[8px] text-primary/60 uppercase tracking-wider py-1">
              Tap to deploy
            </div>
          </div>
        )}
      </div>

      {/* Elixir bar */}
      <div className="px-3 py-1.5 bg-slate-900/95">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-elixir/20 border border-elixir/40 flex items-center justify-center">
            <span className="text-xs font-black text-elixir">{Math.floor(elixir)}</span>
          </div>
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden relative">
            <div className="h-full elixir-bar rounded-full transition-all duration-200" style={{width:`${(elixir/maxElixir)*100}%`}} />
            {Array.from({length:9}).map((_,i) => (
              <div key={i} className="absolute top-0 bottom-0 w-px bg-black/30" style={{left:`${(i+1)*10}%`}} />
            ))}
          </div>
        </div>
      </div>

      {/* Emote panel */}
      <AnimatePresence>
        {showEmotes && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-slate-900 border-t border-border overflow-hidden">
            <div className="flex gap-1 p-1.5 justify-center flex-wrap">
              {equippedEmotes.map(emote => emote && (
                <button key={emote.id} onClick={() => {
                  setEmoteCounter(p => p + 1);
                  setActiveEmote({ svg: emote.svg, side: 'player', key: emoteCounter });
                  setTimeout(() => setActiveEmote(null), 2500);
                  setShowEmotes(false);
                  setTimeout(() => {
                    const rnd = allEmotes[Math.floor(Math.random() * allEmotes.length)];
                    setEmoteCounter(p => p + 1);
                    setActiveEmote({ svg: rnd.svg, side: 'enemy', key: emoteCounter + 1000 });
                    setTimeout(() => setActiveEmote(null), 2500);
                  }, 1500 + Math.random() * 2000);
                }} className="w-9 h-9 rounded-full bg-slate-800 border border-border p-1 hover:border-primary/50 transition-colors">
                  <div dangerouslySetInnerHTML={{ __html: emote.svg }} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card hand */}
      <div className="px-1.5 py-2 bg-slate-900 border-t border-border flex items-end justify-center gap-1">
        <button onClick={() => setShowEmotes(!showEmotes)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mr-1 transition-colors ${showEmotes ? 'bg-primary/20 border border-primary/40' : 'bg-slate-800 border border-border'}`}>
          😀
        </button>
        {nextCard && (
          <div className="mr-1.5">
            <div className="text-[6px] text-muted-foreground text-center mb-0.5 uppercase tracking-wider">Next</div>
            <CardComponent card={nextCard} size="xs" showElixir={false} />
          </div>
        )}
        {hand.map((card, i) => (
          <motion.div key={card.id+i} whileTap={{scale:0.95}} onClick={() => setSelectedCard(selectedCard===i?null:i)}>
            <div className={`transition-all duration-150 rounded-lg ${selectedCard===i?'ring-2 ring-primary -translate-y-3 shadow-[0_0_15px_hsl(38,90%,50%,0.3)]':''}`}>
              <CardComponent card={card} size="sm" disabled={elixir<card.elixir} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Tower = ({ tower }: { tower: TowerData }) => {
  const isBlue = tower.side === 'player';
  const destroyed = tower.hp <= 0;
  const size = tower.type === 'king' ? 'lg' : 'sm';
  const label = tower.type === 'king' ? '👑' : '🗼';
  
  return (
    <div className="absolute z-10" style={{ left: `${tower.x}%`, top: `${tower.y}%`, transform: 'translate(-50%, -50%)' }}>
      <div className={`${size==='lg'?'w-12 h-12':'w-9 h-9'} rounded-lg flex flex-col items-center justify-center ${
        destroyed 
          ? 'bg-muted/30 border border-muted-foreground/20' 
          : isBlue 
            ? 'bg-blue-800 border-2 border-blue-400' 
            : 'bg-red-800 border-2 border-red-400'
      } shadow-lg`}>
        <span className={`${size==='lg'?'text-base':'text-xs'} ${destroyed?'grayscale opacity-30':''}`}>{label}</span>
        {!destroyed && (
          <div className={`${size==='lg'?'w-8':'w-6'} h-1 bg-black/40 rounded-full overflow-hidden mt-0.5`}>
            <div 
              className={`h-full rounded-full transition-all ${tower.hp/tower.maxHp > 0.5 ? 'bg-hp-green' : tower.hp/tower.maxHp > 0.25 ? 'bg-primary' : 'bg-hp-red'}`} 
              style={{width:`${(tower.hp/tower.maxHp)*100}%`}} 
            />
          </div>
        )}
      </div>
      {!destroyed && <div className="text-[7px] font-bold text-foreground text-center mt-0.5 drop-shadow">{Math.floor(tower.hp)}</div>}
    </div>
  );
};

export default BattleArena;
