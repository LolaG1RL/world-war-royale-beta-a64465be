import { useState, useEffect, useCallback, useRef } from 'react';
import { GameCard, getSpeedValue, canTarget, getRangeValue, SPEED_VALUES, allCards } from '@/data/cards';
import { useGame } from '@/context/GameContext';
import CardComponent from './CardComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { allEmotes, getEquippedEmotes } from '@/data/emotes';

import BattleIntro from './BattleIntro';
import BattleBannerDisplay from './BattleBannerDisplay';
import { getPlayerBanner } from '@/data/banners';
import { playBattleMusic, playOvertimeMusic, stopMusic } from '@/lib/music';
import { playCardSfx } from '@/lib/sfx';
import { t } from '@/lib/i18n';
import { useSettings } from '@/context/SettingsContext';

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
  deployCount: number;
  lifetimeRemaining?: number; // for buildings
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
  const { language } = useSettings();
  const isRiverRace = !!localStorage.getItem('river_race_battle');
  const isEventBattle = !!localStorage.getItem('event_battle');
  const isFriendlyBattle = !!localStorage.getItem('friendly_battle');
  const isNonTrophyBattle = isRiverRace || isEventBattle || isFriendlyBattle;

  // Read event modifiers (e.g. triple elixir, rage, etc.)
  const eventModifiers = (() => {
    try {
      const eb = localStorage.getItem('event_battle');
      if (!eb) return null;
      return JSON.parse(eb);
    } catch { return null; }
  })();
  const elixirMultiplier = eventModifiers?.elixirMultiplier || 1;
  const rageMode = eventModifiers?.rageMode || false;
  const [showIntro, setShowIntro] = useState(true);
  const playerBanner = getPlayerBanner();
  const [elixir, setElixir] = useState(5);
  const [maxElixir] = useState(10);
  const [timer, setTimer] = useState(180);
  const [hand, setHand] = useState<GameCard[]>([]);
  const [nextCard, setNextCard] = useState<GameCard | null>(null);
  const [cardQueue, setCardQueue] = useState<GameCard[]>([]);
  // AI deck/hand/cycle refs (don't need re-renders)
  const aiDeckRef = useRef<GameCard[]>([]);
  const aiHandRef = useRef<GameCard[]>([]);
  const aiQueueRef = useRef<GameCard[]>([]);
  const aiNextRef = useRef<GameCard | null>(null);
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
  const [spellProjectiles, setSpellProjectiles] = useState<{id: number; x: number; y: number; emoji: string; targetX: number; targetY: number}[]>([]);
  const projectileCounter = useRef(0);

  // For non-trophy battles (river race), pick a random arena for music/bg
  const battleArena = isRiverRace ? (Math.floor(Math.random() * 15) + 1) : profile.arena;

  // Start arena music when intro finishes
  useEffect(() => {
    if (!showIntro) {
      playBattleMusic(battleArena);
    }
    return () => stopMusic();
  }, [showIntro, battleArena]);

  // Switch to overtime music
  useEffect(() => {
    if (isDoubleElixir) playOvertimeMusic();
  }, [isDoubleElixir]);
  const damageCounter = useRef(0);
  const equippedEmoteIds = getEquippedEmotes();
  const equippedEmotes = equippedEmoteIds.map(id => allEmotes.find(e => e.id === id)).filter(Boolean);
  const enemyElixir = useRef(5);
  const gameTime = useRef(0);

  // Champion ability state
  const championCard = deck.find(c => c.rarity === 'champion' && c.ability);
  const [abilityCooldown, setAbilityCooldown] = useState(0);
  const [abilityActive, setAbilityActive] = useState(false);

  const towersRef = useRef(towers);
  towersRef.current = towers;
  const deployedUnitsRef = useRef(deployedUnits);
  deployedUnitsRef.current = deployedUnits;

  const getPlayerTowerHP = useCallback(() => ({
    king: towersRef.current.find(t => t.id === 'p-king')?.hp ?? 0,
    left: towersRef.current.find(t => t.id === 'p-left')?.hp ?? 0,
    right: towersRef.current.find(t => t.id === 'p-right')?.hp ?? 0,
  }), []);
  const getEnemyTowerHP = useCallback(() => ({
    king: towersRef.current.find(t => t.id === 'e-king')?.hp ?? 0,
    left: towersRef.current.find(t => t.id === 'e-left')?.hp ?? 0,
    right: towersRef.current.find(t => t.id === 'e-right')?.hp ?? 0,
  }), []);

  // Keep derived values for rendering
  const playerTowerHP = getPlayerTowerHP();
  const enemyTowerHP = getEnemyTowerHP();

  // Deaf Mode event listeners
  const spawnUnitRef = useRef<(card: GameCard, x: number, y: number, side: 'player' | 'enemy') => void>(() => {});

  useEffect(() => {
    const handler = (e: Event) => {
      const { action } = (e as CustomEvent).detail;
      switch (action) {
        case 'insta-elixir':
          setElixir(10);
          break;
        case 'insta-win': {
          const eth = getEnemyTowerHP();
          const pth = getPlayerTowerHP();
          const pC = (eth.left <= 0 ? 1 : 0) + (eth.right <= 0 ? 1 : 0) + (eth.king <= 0 ? 1 : 0) + 3;
          const eC = (pth.left <= 0 ? 1 : 0) + (pth.right <= 0 ? 1 : 0) + (pth.king <= 0 ? 1 : 0);
          const net = pC - eC;
          const s1 = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
          s1.crowns = Math.max(0, (s1.crowns || 0) + net);
          localStorage.setItem('war_pass_data', JSON.stringify(s1));
          localStorage.setItem('last_battle_crowns', String(net));
          setBattleResult('win');
          if (!isRiverRace && !isEventBattle) { const gain = 20 + Math.floor(Math.random() * 21); localStorage.setItem('last_trophy_change', String(gain)); setProfile(prev => ({ ...prev, trophies: prev.trophies + gain, maxTrophies: Math.max(prev.maxTrophies, prev.trophies + gain), wins: prev.wins + 1, threeCrownWins: pC >= 3 ? prev.threeCrownWins + 1 : prev.threeCrownWins })); }
          if (isRiverRace) { setProfile(prev => ({ ...prev, warDayWins: prev.warDayWins + 1 })); }
          setScreen('result');
          break;
        }
        case 'insta-lose': {
          const eth2 = getEnemyTowerHP();
          const pth2 = getPlayerTowerHP();
          const pC2 = (eth2.left <= 0 ? 1 : 0) + (eth2.right <= 0 ? 1 : 0) + (eth2.king <= 0 ? 1 : 0);
          const eC2 = (pth2.left <= 0 ? 1 : 0) + (pth2.right <= 0 ? 1 : 0) + (pth2.king <= 0 ? 1 : 0) + 3;
          const net2 = pC2 - eC2;
          const s2 = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
          s2.crowns = Math.max(0, (s2.crowns || 0) + net2);
          localStorage.setItem('war_pass_data', JSON.stringify(s2));
          localStorage.setItem('last_battle_crowns', String(net2));
          setBattleResult('lose');
          if (!isRiverRace && !isEventBattle) { const loss = 10 + Math.floor(Math.random() * 21); localStorage.setItem('last_trophy_change', String(-loss)); setProfile(prev => ({ ...prev, losses: prev.losses + 1, trophies: Math.max(0, prev.trophies - loss) })); }
          setScreen('result');
          break;
        }
        case 'spawn-unit': {
          const troops = deck.filter(c => c.type === 'troop');
          if (!troops.length) break;
          const card = troops[Math.floor(Math.random() * troops.length)];
          spawnUnitRef.current(card, 30 + Math.random() * 40, 60 + Math.random() * 15, 'player');
          break;
        }
      }
    };
    window.addEventListener('deaf-mod', handler);
    return () => window.removeEventListener('deaf-mod', handler);
  }, [deck, setBattleResult, setProfile, setScreen, getEnemyTowerHP, getPlayerTowerHP, isRiverRace]);

  useEffect(() => {
    // Player card cycle init
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setHand(shuffled.slice(0, 4));
    setNextCard(shuffled[4] || shuffled[0]);
    setCardQueue(shuffled.slice(5));
    // AI deck init - arena-scaled random 8 cards (import at top)
    const arenaCards = allCards.filter(c => c.unlockArena <= profile.arena && c.rarity !== 'champion');
    const aiShuffled = [...arenaCards].sort(() => Math.random() - 0.5).slice(0, 8);
    // Ensure at least 8 by repeating if needed
    while (aiShuffled.length < 8) aiShuffled.push(arenaCards[Math.floor(Math.random() * arenaCards.length)]);
    const aiDeck = [...aiShuffled].sort(() => Math.random() - 0.5);
    aiDeckRef.current = aiDeck;
    aiHandRef.current = aiDeck.slice(0, 4);
    aiNextRef.current = aiDeck[4] || aiDeck[0];
    aiQueueRef.current = aiDeck.slice(5);
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
          lifetimeRemaining: card.lifetime ? card.lifetime * 1000 : undefined,
        });
      }
      setDeployedUnits(u => [...u, ...newUnits]);
      return prev + count;
    });
  }, []);

  // Keep ref updated
  spawnUnitRef.current = spawnUnit;

  // Elixir regen - same rate for both player and AI, affected by event modifiers
  useEffect(() => {
    const doubleRate = isDoubleElixir ? 2 : 1;
    const totalMultiplier = doubleRate * elixirMultiplier;
    const interval = setInterval(() => {
      setElixir(prev => Math.min(prev + 0.5 * totalMultiplier, maxElixir));
      enemyElixir.current = Math.min(enemyElixir.current + 0.5 * totalMultiplier, 10);
    }, 1000);
    return () => clearInterval(interval);
  }, [maxElixir, isDoubleElixir, elixirMultiplier]);

  // Champion ability cooldown tick
  useEffect(() => {
    if (abilityCooldown <= 0) return;
    const interval = setInterval(() => {
      setAbilityCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [abilityCooldown > 0]);

  // Champion ability elixir cost (3 for Joan, 4 for Alexander, 3 default)
  const getAbilityElixirCost = (cardId: string) => {
    if (cardId === 'alexander-the-great') return 4;
    if (cardId === 'joan-of-arc') return 3;
    if (cardId === 'cleopatra') return 3;
    if (cardId === 'genghis-khan') return 4;
    if (cardId === 'napoleon') return 3;
    return 3;
  };

  const activateAbility = useCallback(() => {
    if (!championCard?.ability || abilityCooldown > 0 || abilityActive) return;
    const cost = getAbilityElixirCost(championCard.id);
    if (elixir < cost) return; // Not enough elixir
    setElixir(prev => prev - cost);
    setAbilityActive(true);
    setAbilityCooldown(championCard.ability.cooldown || 10);

    // Apply ability effect: buff all player units
    if (championCard.id === 'joan-of-arc') {
      // Rally Cry: +50% attack speed for all allies for 5s (halve hitSpeed)
      // We visually indicate it and apply a damage boost to simulate
      setDeployedUnits(units => units.map(u => {
        if (u.side === 'player') {
          return { ...u, card: { ...u.card, hitSpeed: (u.card.hitSpeed || 1) * 0.5 } };
        }
        return u;
      }));
      setTimeout(() => {
        setDeployedUnits(units => units.map(u => {
          if (u.side === 'player') {
            return { ...u, card: { ...u.card, hitSpeed: (u.card.hitSpeed || 0.5) * 2 } };
          }
          return u;
        }));
        setAbilityActive(false);
      }, 5000);
    } else if (championCard.id === 'alexander-the-great') {
      // Macedonian Charge: deal 500 damage to nearest enemy tower
      setTowers(t => t.map(tower => {
        if (tower.side === 'enemy' && tower.hp > 0) {
          return tower; // will be handled below
        }
        return tower;
      }));
      // Find nearest alive enemy tower and deal 500 damage
      const aliveEnemyTowers = towers.filter(t => t.side === 'enemy' && t.hp > 0);
      const princesses = aliveEnemyTowers.filter(t => t.type === 'princess');
      const target = princesses.length > 0 ? princesses[0] : aliveEnemyTowers[0];
      if (target) {
        setTowers(t => t.map(tower =>
          tower.id === target.id ? { ...tower, hp: Math.max(0, tower.hp - 500) } : tower
        ));
        damageCounter.current++;
        setDamageNumbers(prev => [...prev, { id: damageCounter.current, x: target.x, y: target.y, damage: 500 }]);
      }
      setTimeout(() => setAbilityActive(false), 1000);
    } else {
      setTimeout(() => setAbilityActive(false), 3000);
    }
  }, [championCard, abilityCooldown, abilityActive, towers, elixir]);

  // Timer - use refs to avoid restarting interval
  const isDoubleElixirRef = useRef(isDoubleElixir);
  isDoubleElixirRef.current = isDoubleElixir;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 60 && !isDoubleElixirRef.current) setIsDoubleElixir(true);
        if (prev <= 0) {
          const eth = getEnemyTowerHP();
          const pth = getPlayerTowerHP();
          const pCrowns = (eth.left <= 0 ? 1 : 0) + (eth.right <= 0 ? 1 : 0) + (eth.king <= 0 ? 1 : 0);
          const eCrowns = (pth.left <= 0 ? 1 : 0) + (pth.right <= 0 ? 1 : 0) + (pth.king <= 0 ? 1 : 0);
          const netCrowns = pCrowns - eCrowns;
          const saved = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
          saved.crowns = Math.max(0, (saved.crowns || 0) + netCrowns);
          localStorage.setItem('war_pass_data', JSON.stringify(saved));
          localStorage.setItem('last_battle_crowns', String(netCrowns));
          const result = pCrowns >= eCrowns ? 'win' : 'lose';
          setBattleResult(result);
          if (!isNonTrophyBattle) { 
            const change = result === 'win' ? (20 + Math.floor(Math.random() * 21)) : -(10 + Math.floor(Math.random() * 21)); 
            localStorage.setItem('last_trophy_change', String(change)); 
            setProfile(prev => ({ ...prev, trophies: Math.max(0, prev.trophies + change), maxTrophies: result === 'win' ? Math.max(prev.maxTrophies, prev.trophies + change) : prev.maxTrophies, wins: result === 'win' ? prev.wins + 1 : prev.wins, losses: result === 'lose' ? prev.losses + 1 : prev.losses, threeCrownWins: result === 'win' && pCrowns >= 3 ? prev.threeCrownWins + 1 : prev.threeCrownWins })); 
          }
          if (isRiverRace && result === 'win') {
            setProfile(prev => ({ ...prev, warDayWins: prev.warDayWins + 1 }));
          }
          setScreen('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [setBattleResult, setScreen, setProfile, isRiverRace, getEnemyTowerHP, getPlayerTowerHP]);

  // Enemy AI - uses own deck with proper card cycle
  useEffect(() => {
    const interval = setInterval(() => {
      const aiHand = aiHandRef.current;
      if (!aiHand.length) return;
      
      const affordable = aiHand.filter(c => c.elixir <= enemyElixir.current);
      if (affordable.length === 0) return;
      
      const cardIdx = aiHand.indexOf(affordable[Math.floor(Math.random() * affordable.length)]);
      const card = aiHand[cardIdx];
      enemyElixir.current -= card.elixir;
      
      // AI card cycle: replace played card with next, shift queue
      const nextCard = aiNextRef.current;
      if (nextCard) {
        aiHandRef.current = aiHand.map((c, i) => i === cardIdx ? nextCard : c);
        const queue = aiQueueRef.current;
        aiNextRef.current = queue[0] || card;
        aiQueueRef.current = [...queue.slice(1), card];
      }
      
      if (card.type === 'spell') {
        // AI spell: target player units or towers
        const playerUnits = deployedUnitsRef.current.filter(u => u.side === 'player' && u.hp > 0);
        let targetX = 50, targetY = 75;
        if (playerUnits.length > 0) {
          const target = playerUnits[Math.floor(Math.random() * playerUnits.length)];
          targetX = target.x; targetY = target.y;
        }
        // Apply spell damage
        const splash = (card.splashRadius || 2) * 5;
        setDeployedUnits(units => units.map(u => {
          if (u.side === 'enemy') return u;
          const dist = Math.sqrt((targetX - u.x) ** 2 + (targetY - u.y) ** 2);
          if (dist <= splash) return { ...u, hp: u.hp - card.damage };
          return u;
        }));
        setTowers(t => t.map(tower => {
          if (tower.side === 'enemy') return tower;
          const dist = Math.sqrt((targetX - tower.x) ** 2 + (targetY - tower.y) ** 2);
          if (dist <= splash) return { ...tower, hp: Math.max(0, tower.hp - card.damage) };
          return tower;
        }));
      } else if (card.type === 'building') {
        const deployX = 30 + Math.random() * 40;
        const deployY = 10 + Math.random() * 15;
        spawnUnit(card, deployX, deployY, 'enemy');
      } else {
        const playerUnits = deployedUnitsRef.current.filter(u => u.side === 'player');
        const leftLane = playerUnits.filter(u => u.x < 50).length;
        const rightLane = playerUnits.filter(u => u.x >= 50).length;
        
        let deployX = 50;
        if (leftLane > rightLane) deployX = 25 + Math.random() * 15;
        else if (rightLane > leftLane) deployX = 60 + Math.random() * 15;
        else deployX = Math.random() > 0.5 ? (25 + Math.random() * 15) : (60 + Math.random() * 15);
        
        const speed = getSpeedValue(card.speed);
        const deployY = speed >= SPEED_VALUES.fast ? 25 : 10 + Math.random() * 10;
        
        spawnUnit(card, deployX, deployY, 'enemy');
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [spawnUnit]);

  // Bridge and river constants
  const RIVER_TOP = 47;
  const RIVER_BOTTOM = 53;
  const LEFT_BRIDGE = { x: 25, y: 50 };
  const RIGHT_BRIDGE = { x: 75, y: 50 };

  const getLane = (x: number) => x < 50 ? 'left' : 'right';
  const needsCrossRiver = (unitY: number, targetY: number, side: 'player' | 'enemy') => {
    // Unit on player side going to enemy side or vice versa
    if (side === 'player') return unitY > RIVER_BOTTOM && targetY < RIVER_TOP;
    return unitY < RIVER_TOP && targetY > RIVER_BOTTOM;
  };

  const getNearestBridge = (x: number) => {
    return Math.abs(x - LEFT_BRIDGE.x) < Math.abs(x - RIGHT_BRIDGE.x) ? LEFT_BRIDGE : RIGHT_BRIDGE;
  };

  const getMovementTarget = (unit: DeployedUnit, target: { x: number; y: number }) => {
    // Air units fly directly
    if (unit.card.unitType === 'air') return target;
    
    // Check if we need to cross the river
    if (needsCrossRiver(unit.y, target.y, unit.side)) {
      const bridge = getNearestBridge(unit.x);
      // If not at bridge yet, go to bridge first
      const distToBridge = Math.sqrt((unit.x - bridge.x) ** 2 + (unit.y - bridge.y) ** 2);
      if (distToBridge > 3) {
        return bridge;
      }
    }
    return target;
  };

  // Helper to find the best target for a unit
  const findTarget = (
    unit: DeployedUnit,
    units: DeployedUnit[],
    livingTowers: TowerData[]
  ): DeployedUnit | TowerData | null => {
    const card = unit.card;
    const enemySide = unit.side === 'player' ? 'enemy' : 'player';
    const targetsBuildings = card.targets === 'buildings';
    const range = getRangeValue(card.range) * 5;
    const unitLane = getLane(unit.x);

    // Check if current target is still valid
    if (unit.targetId) {
      const currentTarget = units.find(u => u.id === unit.targetId && u.hp > 0) ||
        livingTowers.find(t => t.id === unit.targetId && t.hp > 0);
      if (currentTarget) {
        const dist = Math.sqrt((unit.x - currentTarget.x) ** 2 + (unit.y - currentTarget.y) ** 2);
        if (dist <= range * 2.5) return currentTarget;
      }
    }

    let bestTarget: DeployedUnit | TowerData | null = null;
    let bestDist = Infinity;

    if (targetsBuildings) {
      // Building-targeting units: target enemy buildings first, then towers
      for (const enemy of units) {
        if (enemy.side !== enemySide || enemy.hp <= 0) continue;
        if (enemy.card.type !== 'building') continue;
        const dist = Math.sqrt((unit.x - enemy.x) ** 2 + (unit.y - enemy.y) ** 2);
        if (dist < bestDist) { bestDist = dist; bestTarget = enemy; }
      }
    } else {
      for (const enemy of units) {
        if (enemy.side !== enemySide || enemy.hp <= 0) continue;
        if (!canTarget(card, enemy.card)) continue;
        
        const dist = Math.sqrt((unit.x - enemy.x) ** 2 + (unit.y - enemy.y) ** 2);
        const enemyLane = getLane(enemy.x);
        const effectiveDist = enemyLane === unitLane ? dist : dist * 1.8;
        
        if (effectiveDist < bestDist) {
          bestDist = effectiveDist;
          bestTarget = enemy;
        }
      }
    }

    // Find closest tower (always consider towers for building-targeting units, or as fallback)
    if (!bestTarget || targetsBuildings) {
      for (const tower of livingTowers) {
        if (tower.side !== enemySide) continue;
        if (tower.type === 'king') {
          const princesses = livingTowers.filter(t => t.side === enemySide && t.type === 'princess' && t.hp > 0);
          if (princesses.length === 2) continue;
        }
        const dist = Math.sqrt((unit.x - tower.x) ** 2 + (unit.y - tower.y) ** 2);
        if (dist < bestDist) {
          bestDist = dist;
          bestTarget = tower;
        }
      }
    }

    return bestTarget;
  };

  // Check for king tower destruction -> end game
  const checkKingDestroyed = useCallback(() => {
    const currentTowers = towersRef.current;
    const eKing = currentTowers.find(t => t.id === 'e-king');
    const pKing = currentTowers.find(t => t.id === 'p-king');

    if (eKing && eKing.hp <= 0) {
      const eth = getEnemyTowerHP();
      const pth = getPlayerTowerHP();
      const pC = (eth.left <= 0 ? 1 : 0) + (eth.right <= 0 ? 1 : 0) + 3; // 3 for king
      const eC = (pth.left <= 0 ? 1 : 0) + (pth.right <= 0 ? 1 : 0) + (pth.king <= 0 ? 1 : 0);
      const net = pC - eC;
      const s = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
      s.crowns = Math.max(0, (s.crowns || 0) + net);
      localStorage.setItem('war_pass_data', JSON.stringify(s));
      localStorage.setItem('last_battle_crowns', String(net));
      setBattleResult('win');
      if (!isNonTrophyBattle) {
        const gain = 20 + Math.floor(Math.random() * 21);
        localStorage.setItem('last_trophy_change', String(gain));
        setProfile(prev => ({ ...prev, trophies: prev.trophies + gain, maxTrophies: Math.max(prev.maxTrophies, prev.trophies + gain), wins: prev.wins + 1, threeCrownWins: pC >= 3 ? prev.threeCrownWins + 1 : prev.threeCrownWins }));
      }
      if (isRiverRace) {
        setProfile(prev => ({ ...prev, warDayWins: prev.warDayWins + 1 }));
      }
      setScreen('result');
      return true;
    }

    if (pKing && pKing.hp <= 0) {
      const eth = getEnemyTowerHP();
      const pth = getPlayerTowerHP();
      const pC = (eth.left <= 0 ? 1 : 0) + (eth.right <= 0 ? 1 : 0) + (eth.king <= 0 ? 1 : 0);
      const eC = (pth.left <= 0 ? 1 : 0) + (pth.right <= 0 ? 1 : 0) + 3;
      const net = pC - eC;
      const s = JSON.parse(localStorage.getItem('war_pass_data') || '{"crowns":0}');
      s.crowns = Math.max(0, (s.crowns || 0) + net);
      localStorage.setItem('war_pass_data', JSON.stringify(s));
      localStorage.setItem('last_battle_crowns', String(net));
      setBattleResult('lose');
      if (!isRiverRace && !isEventBattle) {
        const loss = 10 + Math.floor(Math.random() * 21);
        localStorage.setItem('last_trophy_change', String(-loss));
        setProfile(prev => ({ ...prev, losses: prev.losses + 1, trophies: Math.max(0, prev.trophies - loss) }));
      }
      setScreen('result');
      return true;
    }

    return false;
  }, [getEnemyTowerHP, getPlayerTowerHP, isRiverRace, setBattleResult, setProfile, setScreen]);

  // Main combat simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      gameTime.current += 100;
      const now = gameTime.current;

      if (checkKingDestroyed()) return;

      setDeployedUnits(prevUnits => {
        let units = prevUnits.map(u => ({ ...u })); // mutable copies
        const livingTowers = towersRef.current.filter(t => t.hp > 0);

        // Phase 0: Building lifetime decay
        for (const unit of units) {
          if (unit.card.type === 'building' && unit.lifetimeRemaining !== undefined) {
            unit.lifetimeRemaining -= 100;
            if (unit.lifetimeRemaining <= 0) {
              unit.hp = 0; // building expires
            }
          }
        }

        // Check for Joan of Arc passive: +20% damage bonus while alive AND in a hero slot (first N positions of deck)
        const heroSlotCount = (() => { const lvl = parseInt(localStorage.getItem('player_level') || '1'); if (lvl >= 26) return 2; if (lvl >= 11) return 1; return 0; })();
        const playerDeckIds: string[] = (() => { try { return JSON.parse(localStorage.getItem('current_deck_ids') || '[]'); } catch { return []; } })();
        const joanDeckIndex = playerDeckIds.indexOf('joan-of-arc');
        const joanInHeroSlot = joanDeckIndex >= 0 && joanDeckIndex < heroSlotCount;
        const joanAlivePlayer = joanInHeroSlot && units.some(u => u.card.id === 'joan-of-arc' && u.side === 'player' && u.hp > 0);
        const joanAliveEnemy = units.some(u => u.card.id === 'joan-of-arc' && u.side === 'enemy' && u.hp > 0);

        // Phase 1: Find targets and move/flag attacks
        const attackingUnits: { unit: DeployedUnit; target: DeployedUnit | TowerData; damage: number }[] = [];

        for (let i = 0; i < units.length; i++) {
          const unit = units[i];
          if (unit.hp <= 0) continue;

          const card = unit.card;
          const isBuilding = card.type === 'building';
          const speed = isBuilding ? 0 : getSpeedValue(card.speed) * 0.8;
          const range = getRangeValue(card.range) * 5;
          const hitSpeed = (card.hitSpeed || 1.0) * 1000;

          // Buildings with 0 damage don't attack (e.g. Tombstone)
          if (isBuilding && card.damage === 0) continue;

          const target = findTarget(unit, units, livingTowers);

          if (target) {
            const targetDist = Math.sqrt((unit.x - target.x) ** 2 + (unit.y - target.y) ** 2);
            unit.targetId = target.id;

            if (targetDist > range && !isBuilding) {
              // Move towards target (buildings don't move)
              const moveTarget = getMovementTarget(unit, target);
              const moveDist = Math.sqrt((unit.x - moveTarget.x) ** 2 + (unit.y - moveTarget.y) ** 2);
              if (moveDist > 0.5) {
                const dx = (moveTarget.x - unit.x) / moveDist;
                const dy = (moveTarget.y - unit.y) / moveDist;
                unit.x = unit.x + dx * speed;
                unit.y = unit.y + dy * speed;
              }
              unit.isCharging = !!(card.chargeSpeed && targetDist > range * 2);
            } else if (targetDist <= range) {
              // In range - attack if ready
              if (now - unit.lastAttackTime >= hitSpeed) {
                let damage = card.damage * (unit.isCharging && card.chargeSpeed ? card.chargeSpeed : 1);
                // Joan's passive: +20% damage
                if ((unit.side === 'player' && joanAlivePlayer) || (unit.side === 'enemy' && joanAliveEnemy)) {
                  damage = Math.floor(damage * 1.2);
                }
                attackingUnits.push({ unit, target, damage });
                unit.lastAttackTime = now;
                unit.isCharging = false;
              }
            }
          } else if (!isBuilding) {
            // No target - move towards enemy side via bridge if ground
            unit.targetId = null;
            if (unit.card.unitType !== 'air') {
              // Ground troops must use bridges
              const defaultTargetY = unit.side === 'player' ? 4 : 88;
              if (needsCrossRiver(unit.y, defaultTargetY, unit.side)) {
                const bridge = getNearestBridge(unit.x);
                const distToBridge = Math.sqrt((unit.x - bridge.x) ** 2 + (unit.y - bridge.y) ** 2);
                if (distToBridge > 3) {
                  const dx = (bridge.x - unit.x) / distToBridge;
                  const dy = (bridge.y - unit.y) / distToBridge;
                  unit.x += dx * speed;
                  unit.y += dy * speed;
                } else {
                  // At bridge, cross
                  const moveDir = unit.side === 'player' ? -1 : 1;
                  unit.y += moveDir * speed;
                }
              } else {
                const moveDir = unit.side === 'player' ? -1 : 1;
                unit.y += moveDir * speed;
              }
            } else {
              // Air units fly straight
              const moveDir = unit.side === 'player' ? -1 : 1;
              unit.y += moveDir * speed;
            }
          }
        }

        // Phase 2: Apply damage from attacks
        for (const { unit, target, damage } of attackingUnits) {
          const card = unit.card;
          const splash = card.splashRadius ? card.splashRadius * 5 : 0;

          // Check if target is a tower
          const isTower = 'type' in target && ('king' === target.type || 'princess' === target.type);

          if (isTower) {
            setTowers(prevTowers => prevTowers.map(t => {
              if (t.id !== target.id) return t;
              const newHp = Math.max(0, t.hp - damage);
              return { ...t, hp: newHp };
            }));
          } else {
            // Damage the primary target unit
            const targetUnit = target as DeployedUnit;
            const enemyInUnits = units.find(u => u.id === targetUnit.id);
            if (enemyInUnits) {
              if (enemyInUnits.shieldHp > 0) {
                enemyInUnits.shieldHp = Math.max(0, enemyInUnits.shieldHp - damage);
              } else {
                enemyInUnits.hp -= damage;
              }
            }

            // Splash damage to nearby enemies
            if (splash > 0) {
              const enemySide = unit.side === 'player' ? 'enemy' : 'player';
              for (const nearby of units) {
                if (nearby.id === targetUnit.id || nearby.side !== enemySide || nearby.hp <= 0) continue;
                const dist = Math.sqrt((target.x - nearby.x) ** 2 + (target.y - nearby.y) ** 2);
                if (dist <= splash) {
                  if (nearby.shieldHp > 0) {
                    nearby.shieldHp = Math.max(0, nearby.shieldHp - damage);
                  } else {
                    nearby.hp -= damage;
                  }
                }
              }
            }
          }

          // Show damage number
          damageCounter.current++;
          const dmgId = damageCounter.current;
          setDamageNumbers(prev => [...prev, { id: dmgId, x: target.x, y: target.y, damage }]);
          setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== dmgId)), 800);
        }

        // Phase 3: Tower attacks on units
        setTowers(prevTowers => {
          return prevTowers.map(tower => {
            if (tower.hp <= 0) return tower;

            const attackInterval = tower.type === 'king' ? 1200 : 900;
            if (now - tower.lastAttackTime < attackInterval) return tower;

            const enemySide = tower.side === 'player' ? 'enemy' : 'player';
            const rangeLimit = tower.type === 'king' ? 25 : 20;

            let closest: DeployedUnit | null = null;
            let closestDist = Infinity;
            for (const u of units) {
              if (u.side !== enemySide || u.hp <= 0) continue;
              const dist = Math.sqrt((tower.x - u.x) ** 2 + (tower.y - u.y) ** 2);
              if (dist <= rangeLimit && dist < closestDist) {
                closestDist = dist;
                closest = u;
              }
            }

            if (closest) {
              const damage = tower.type === 'king' ? 80 : 50;
              if (closest.shieldHp > 0) {
                closest.shieldHp = Math.max(0, closest.shieldHp - damage);
              } else {
                closest.hp -= damage;
              }

              damageCounter.current++;
              const dmgId = damageCounter.current;
              setDamageNumbers(prev => [...prev, { id: dmgId, x: closest!.x, y: closest!.y, damage }]);
              setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== dmgId)), 800);

              return { ...tower, lastAttackTime: now };
            }
            return tower;
          });
        });

        // Phase 4: Death damage
        for (const unit of units) {
          if (unit.hp <= 0 && unit.card.deathDamage) {
            const splash = (unit.card.splashRadius || 1) * 5;
            const enemySide = unit.side === 'player' ? 'enemy' : 'player';
            for (const enemy of units) {
              if (enemy.side !== enemySide || enemy.hp <= 0) continue;
              const dist = Math.sqrt((unit.x - enemy.x) ** 2 + (unit.y - enemy.y) ** 2);
              if (dist <= splash) {
                enemy.hp -= unit.card.deathDamage!;
              }
            }
          }
        }

        // Remove dead units
        return units.filter(u => u.hp > 0);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [checkKingDestroyed]);

  const deployCard = useCallback((ax: number, ay: number) => {
    if (selectedCard === null) return;
    const card = hand[selectedCard];
    if (!card || elixir < card.elixir) return;
    
    // Troops can only deploy on player's side; spells can target anywhere
    if (card.type !== 'spell' && card.type !== 'building' && ay < 50) return;
    if (card.type === 'building' && (ay < 50 || ay > 95)) return; // buildings on player side only
    
    setElixir(p => p - card.elixir);
    
    if (card.type === 'spell') {
      const splash = (card.splashRadius || 2) * 5;
      
      // Spell projectile visual — animate from card hand to target
      projectileCounter.current++;
      const projId = projectileCounter.current;
      setSpellProjectiles(prev => [...prev, { id: projId, x: 50, y: 95, emoji: card.emoji, targetX: ax, targetY: ay }]);
      playCardSfx('spell', card.rarity);

      // After projectile reaches target, apply damage
      setTimeout(() => {
        setSpellProjectiles(prev => prev.filter(p => p.id !== projId));
        
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
      }, 400);
    } else {
      playCardSfx(card.type, card.rarity);
      spawnUnit(card, ax, ay, 'player');
    }
    
    // Proper 4-card cycle: next replaces played card, played goes to end of queue
    const playedCard = card;
    setHand(prev => {
      const n = [...prev];
      n[selectedCard] = nextCard!;
      return n;
    });
    setNextCard(cardQueue[0] || playedCard);
    setCardQueue(prev => {
      const next = prev.slice(1);
      next.push(playedCard);
      return next;
    });
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
          <span className="text-blue-400 font-bold font-display text-[10px]">{t('battle.you', language)}</span>
          <div className="flex gap-0.5">{[0,1,2].map(i => <span key={i} className={`text-[10px] ${i < pCrowns ? 'text-primary' : 'text-muted-foreground/20'}`}>⭐</span>)}</div>
        </div>
        <div className={`px-3 py-0.5 rounded-full font-display font-bold text-sm ${isDoubleElixir ? 'bg-accent/20 text-accent' : 'bg-muted text-primary'}`}>
          {fmt(timer)}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">{[0,1,2].map(i => <span key={i} className={`text-[10px] ${i < eCrowns ? 'text-accent' : 'text-muted-foreground/20'}`}>⭐</span>)}</div>
          <span className="text-red-400 font-bold font-display text-[10px]">{t('battle.foe', language)}</span>
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
          {deployedUnits.map(u => {
            const isBuilding = u.card.type === 'building';
            const isJoan = u.card.id === 'joan-of-arc' && u.hp > 0;
            return (
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
                {/* Joan passive aura glow */}
                {isJoan && (
                  <div className="absolute -inset-2 rounded-full bg-amber-400/20 animate-pulse blur-sm" />
                )}
                <div className={`${isBuilding ? 'w-9 h-9 rounded-lg' : 'w-7 h-7 rounded-full'} flex items-center justify-center text-xs shadow-lg ${
                  u.side==='player'
                    ? isBuilding ? 'bg-blue-900 border-2 border-blue-300' : 'bg-blue-700 border-2 border-blue-400'
                    : isBuilding ? 'bg-red-900 border-2 border-red-300' : 'bg-red-700 border-2 border-red-400'
                } ${u.isCharging ? 'animate-pulse ring-2 ring-primary' : ''}`}>
                  {u.card.emoji}
                </div>
                {/* HP bar */}
                <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 ${isBuilding ? 'w-8' : 'w-6'} h-1 bg-black/60 rounded-full overflow-hidden`}>
                  <div 
                    className={`h-full transition-all ${u.hp/u.maxHp > 0.5 ? 'bg-hp-green' : u.hp/u.maxHp > 0.25 ? 'bg-yellow-500' : 'bg-hp-red'}`} 
                    style={{width:`${(u.hp/u.maxHp)*100}%`}} 
                  />
                </div>
                {/* Lifetime bar for buildings */}
                {isBuilding && u.lifetimeRemaining !== undefined && u.card.lifetime && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400/70 transition-all" style={{width:`${(u.lifetimeRemaining / (u.card.lifetime * 1000)) * 100}%`}} />
                  </div>
                )}
                {/* Shield indicator */}
                {u.shieldHp > 0 && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px]">🛡️</div>
                )}
              </div>
            </motion.div>
            );
          })}
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

        {/* Spell Projectiles */}
        <AnimatePresence>
          {spellProjectiles.map(p => (
            <motion.div
              key={p.id}
              initial={{ left: `${p.x}%`, top: `${p.y}%`, scale: 1.5, opacity: 1 }}
              animate={{ left: `${p.targetX}%`, top: `${p.targetY}%`, scale: 2, opacity: 1 }}
              exit={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeIn' }}
              className="absolute z-40 pointer-events-none"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,100,0,0.8)]">{p.emoji}</span>
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-md animate-pulse" />
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

        {/* Champion Ability Button — only when champion is deployed & alive */}
        {championCard?.ability && deployedUnits.some(u => u.card.id === championCard.id && u.side === 'player' && u.hp > 0) && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-40">
            <motion.button
              whileTap={abilityCooldown <= 0 ? { scale: 0.9 } : {}}
              onClick={(e) => { e.stopPropagation(); activateAbility(); }}
              disabled={abilityCooldown > 0 || elixir < getAbilityElixirCost(championCard.id)}
              className={`relative w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shadow-xl transition-all ${
                abilityActive
                  ? 'bg-primary/30 border-primary ring-2 ring-primary/50 animate-pulse'
                  : abilityCooldown > 0
                  ? 'bg-muted/60 border-muted-foreground/30 opacity-60'
                  : 'bg-[hsl(340,40%,20%)] border-[hsl(340,60%,50%)] hover:border-[hsl(340,70%,60%)]'
              }`}
            >
              <span className="text-lg">{championCard.emoji}</span>
              {abilityCooldown > 0 && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-2 border-transparent"
                    style={{
                      background: `conic-gradient(transparent ${((championCard.ability.cooldown! - abilityCooldown) / championCard.ability.cooldown!) * 100}%, hsl(0,0%,0%,0.6) 0%)`,
                      mask: 'radial-gradient(circle, transparent 55%, black 56%)',
                      WebkitMask: 'radial-gradient(circle, transparent 55%, black 56%)',
                    }}
                  />
                  <span className="text-[9px] font-black text-foreground">{abilityCooldown}s</span>
                </>
              )}
              {abilityCooldown <= 0 && !abilityActive && (
                <div className="flex flex-col items-center">
                  <span className="text-[6px] font-bold text-[hsl(340,60%,65%)] uppercase">{t('battle.ready', language)}</span>
                  <span className="text-[7px] font-bold text-elixir">💧{getAbilityElixirCost(championCard.id)}</span>
                </div>
              )}
            </motion.button>
            <div className="text-[7px] font-bold text-center text-foreground/70 mt-1 max-w-14 leading-tight">
              {championCard.ability.name}
            </div>
            {championCard.passive && (() => {
              const heroSlots: string[] = (() => { try { return JSON.parse(localStorage.getItem('hero_slots') || '[]'); } catch { return []; } })();
              return heroSlots.includes(championCard.id);
            })() && (
              <div className="mt-1 px-1 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                <div className="text-[5px] font-bold text-amber-400 uppercase text-center">{t('battle.passive', language)}</div>
                <div className="text-[5px] text-amber-300/80 text-center leading-tight">{championCard.passive.name}</div>
              </div>
            )}
          </div>
        )}

        {selectedCard !== null && (
          <div className="absolute bottom-0 left-0 right-0 top-1/2 border-t-2 border-dashed border-primary/20 bg-primary/5 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 text-center text-[8px] text-primary/60 uppercase tracking-wider py-1">
              {t('battle.tap_deploy', language)}
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
            <div className="text-[6px] text-muted-foreground text-center mb-0.5 uppercase tracking-wider">{t('battle.next', language)}</div>
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
