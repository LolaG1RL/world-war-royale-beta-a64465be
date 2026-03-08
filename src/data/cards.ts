export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'hero';
export type CardType = 'troop' | 'spell' | 'building';

export interface GameCard {
  id: string;
  name: string;
  elixir: number;
  rarity: Rarity;
  type: CardType;
  hp?: number;
  damage: number;
  description: string;
  era: string;
  emoji: string;
  level: number;
  count: number;
  maxCount: number;
}

export interface ChestData {
  id: string;
  type: 'silver' | 'gold' | 'giant' | 'magical' | 'legendary' | 'mega-lightning';
  name: string;
  emoji: string;
  unlockTime: number; // seconds
  cards: number;
  isUnlocking: boolean;
  unlockProgress: number;
  isReady: boolean;
}

export interface ClanData {
  name: string;
  tag: string;
  members: number;
  maxMembers: number;
  trophies: number;
  badge: string;
  description: string;
  donations: number;
  bannerColor: string;
  iconEmoji: string;
  iconColor: string;
}

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  trophies: number;
  maxTrophies: number;
  arena: number;
  arenaName: string;
  wins: number;
  losses: number;
  threeCrownWins: number;
  challengeMaxWins: number;
  warDayWins: number;
  clanCardsCollected: number;
  totalDonations: number;
  gold: number;
  gems: number;
  starPoints: number;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  type: 'card' | 'chest' | 'gold' | 'gems' | 'emote' | 'pass';
  cost: number;
  currency: 'gold' | 'gems' | 'real';
  rarity?: Rarity;
  description: string;
}

export interface TrophyRoadReward {
  trophies: number;
  type: 'gold' | 'cards' | 'chest' | 'gems' | 'arena';
  amount: number;
  name: string;
  emoji: string;
  claimed: boolean;
}

export const arenas = [
  { id: 1, name: 'Training Camp', trophies: 0, emoji: '⛺' },
  { id: 2, name: 'Goblin Stadium', trophies: 200, emoji: '🏟️' },
  { id: 3, name: 'Bone Pit', trophies: 400, emoji: '💀' },
  { id: 4, name: 'Barbarian Bowl', trophies: 600, emoji: '🪓' },
  { id: 5, name: 'Spell Valley', trophies: 800, emoji: '🔮' },
  { id: 6, name: "Builder's Workshop", trophies: 1000, emoji: '🔨' },
  { id: 7, name: 'Royal Arena', trophies: 1200, emoji: '👑' },
  { id: 8, name: 'Frozen Peak', trophies: 1400, emoji: '❄️' },
  { id: 9, name: 'Jungle Arena', trophies: 1600, emoji: '🌿' },
  { id: 10, name: 'Hog Mountain', trophies: 1800, emoji: '🐗' },
  { id: 11, name: 'Electro Valley', trophies: 2000, emoji: '⚡' },
  { id: 12, name: 'Spooky Town', trophies: 2200, emoji: '🎃' },
  { id: 13, name: 'Rascals Hideout', trophies: 2600, emoji: '🗡️' },
  { id: 14, name: 'Serenity Peak', trophies: 3000, emoji: '🏔️' },
  { id: 15, name: 'Legendary Arena', trophies: 4000, emoji: '🏆' },
];

export const allCards: GameCard[] = [
  // Common troops
  { id: 'roman-legionary', name: 'Roman Legionary', elixir: 3, rarity: 'common', type: 'troop', hp: 600, damage: 75, description: 'Disciplined soldier with shield and gladius. Marches in formation.', era: 'Ancient Rome', emoji: '🛡️', level: 1, count: 0, maxCount: 800 },
  { id: 'wwii-rifleman', name: 'WWII Rifleman', elixir: 3, rarity: 'common', type: 'troop', hp: 500, damage: 90, description: 'Standard infantry with semi-auto rifle. Fast fire rate.', era: 'World War II', emoji: '🔫', level: 1, count: 0, maxCount: 400 },
  { id: 'viking-raider', name: 'Viking Raider', elixir: 3, rarity: 'common', type: 'troop', hp: 650, damage: 85, description: 'Axe-wielding Norse warrior. Hits hard and fast.', era: 'Viking Age', emoji: '🪓', level: 1, count: 0, maxCount: 800 },
  { id: 'skeleton-horde', name: 'Skeleton Horde', elixir: 2, rarity: 'common', type: 'troop', hp: 100, damage: 40, description: 'A swarm of undead skeletons. Weak alone, deadly in numbers.', era: 'Fantasy', emoji: '💀', level: 1, count: 0, maxCount: 200 },
  { id: 'egyptian-archer', name: 'Egyptian Archer', elixir: 3, rarity: 'common', type: 'troop', hp: 350, damage: 95, description: 'Precise ranged attacker from the Nile. Fires flaming arrows.', era: 'Ancient Egypt', emoji: '🏹', level: 1, count: 0, maxCount: 800 },
  { id: 'mongol-cavalry', name: 'Mongol Cavalry', elixir: 4, rarity: 'common', type: 'troop', hp: 700, damage: 110, description: 'Lightning fast horse archer. Strikes and retreats.', era: 'Mongol Empire', emoji: '🐎', level: 1, count: 0, maxCount: 400 },
  { id: 'goblin-scouts', name: 'Goblin Scouts', elixir: 2, rarity: 'common', type: 'troop', hp: 200, damage: 60, description: 'Three sneaky goblins. Fast and mischievous.', era: 'Fantasy', emoji: '👺', level: 1, count: 0, maxCount: 100 },
  { id: 'zulu-warrior', name: 'Zulu Warrior', elixir: 3, rarity: 'common', type: 'troop', hp: 580, damage: 80, description: 'Fearsome spear-wielding warrior with iklwa and shield.', era: 'Zulu Kingdom', emoji: '⚔️', level: 1, count: 0, maxCount: 200 },
  { id: 'militia-spearmen', name: 'Militia Spearmen', elixir: 2, rarity: 'common', type: 'troop', hp: 280, damage: 55, description: 'Peasant soldiers armed with spears. Deploy three at once.', era: 'Medieval', emoji: '🗡️', level: 1, count: 0, maxCount: 50 },
  { id: 'maori-warrior', name: 'Māori Warrior', elixir: 3, rarity: 'common', type: 'troop', hp: 620, damage: 78, description: 'Fierce Polynesian warrior with a taiaha. Haka intimidation!', era: 'Polynesia', emoji: '🪃', level: 1, count: 0, maxCount: 100 },

  // Rare troops
  { id: 'samurai', name: 'Samurai', elixir: 4, rarity: 'rare', type: 'troop', hp: 850, damage: 150, description: 'Master swordsman with devastating katana strikes.', era: 'Feudal Japan', emoji: '⚔️', level: 1, count: 0, maxCount: 50 },
  { id: 'orc-berserker', name: 'Orc Berserker', elixir: 5, rarity: 'rare', type: 'troop', hp: 1200, damage: 130, description: 'Raging greenskin that gets stronger when hurt.', era: 'Fantasy', emoji: '👹', level: 1, count: 0, maxCount: 50 },
  { id: 'crusader-knight', name: 'Crusader Knight', elixir: 5, rarity: 'rare', type: 'troop', hp: 1400, damage: 120, description: 'Heavily armored mounted knight. Charges into battle.', era: 'Medieval', emoji: '🏇', level: 1, count: 0, maxCount: 50 },
  { id: 'spartan-phalanx', name: 'Spartan Phalanx', elixir: 5, rarity: 'rare', type: 'troop', hp: 400, damage: 70, description: 'Three Spartans in tight formation. High defense, area denial.', era: 'Ancient Greece', emoji: '🏛️', level: 1, count: 0, maxCount: 20 },
  { id: 'wwi-tank', name: 'WWI Tank', elixir: 6, rarity: 'rare', type: 'troop', hp: 2000, damage: 100, description: 'Slow but nearly indestructible. Crushes everything in its path.', era: 'World War I', emoji: '🪖', level: 1, count: 0, maxCount: 50 },
  { id: 'ninja', name: 'Shadow Ninja', elixir: 3, rarity: 'rare', type: 'troop', hp: 450, damage: 180, description: 'Invisible until attacking. Deadly first strike.', era: 'Feudal Japan', emoji: '🥷', level: 1, count: 0, maxCount: 50 },
  { id: 'ottoman-janissary', name: 'Ottoman Janissary', elixir: 4, rarity: 'rare', type: 'troop', hp: 750, damage: 95, description: 'Elite musketeer with early firearms. Ranged splash damage.', era: 'Ottoman Empire', emoji: '🔥', level: 1, count: 0, maxCount: 20 },
  { id: 'celtic-druid', name: 'Celtic Druid', elixir: 4, rarity: 'rare', type: 'troop', hp: 500, damage: 60, description: 'Heals nearby allies over time. Ancient nature magic.', era: 'Celtic', emoji: '🌿', level: 1, count: 0, maxCount: 20 },

  // Epic troops & spells
  { id: 'dragon-warrior', name: 'Dragon Warrior', elixir: 7, rarity: 'epic', type: 'troop', hp: 2500, damage: 200, description: 'Half-dragon berserker. Breathes fire in an arc.', era: 'Fantasy', emoji: '🐲', level: 1, count: 0, maxCount: 10 },
  { id: 'persian-war-elephant', name: 'War Elephant', elixir: 7, rarity: 'epic', type: 'troop', hp: 3000, damage: 180, description: 'Massive beast that tramples everything. Splash damage.', era: 'Persian Empire', emoji: '🐘', level: 1, count: 0, maxCount: 10 },
  { id: 'aztec-priest', name: 'Aztec Sun Priest', elixir: 5, rarity: 'epic', type: 'troop', hp: 600, damage: 160, description: 'Channels solar energy to blast enemies. Area damage.', era: 'Aztec Empire', emoji: '☀️', level: 1, count: 0, maxCount: 10 },
  { id: 'fireball', name: 'Fireball', elixir: 4, rarity: 'epic', type: 'spell', damage: 350, description: 'A devastating ball of fire. Damages everything in its radius.', era: 'Fantasy', emoji: '🔥', level: 1, count: 0, maxCount: 10 },
  { id: 'artillery-strike', name: 'Artillery Strike', elixir: 5, rarity: 'epic', type: 'spell', damage: 500, description: 'Calls in a barrage of mortar shells. Massive area damage.', era: 'Modern', emoji: '💣', level: 1, count: 0, maxCount: 4 },
  { id: 'freeze-spell', name: 'Frost Rune', elixir: 4, rarity: 'epic', type: 'spell', damage: 50, description: 'Ancient Norse rune that freezes all enemies in area.', era: 'Fantasy', emoji: '❄️', level: 1, count: 0, maxCount: 10 },
  { id: 'terracotta-army', name: 'Terracotta Army', elixir: 6, rarity: 'epic', type: 'troop', hp: 300, damage: 55, description: 'Summons 6 clay soldiers. They shatter on death dealing area damage.', era: 'Ancient China', emoji: '🪨', level: 1, count: 0, maxCount: 4 },
  { id: 'lightning-bolt', name: 'Zeus Lightning', elixir: 6, rarity: 'epic', type: 'spell', damage: 600, description: 'Strikes 3 enemy targets with divine lightning.', era: 'Mythology', emoji: '⚡', level: 1, count: 0, maxCount: 10 },

  // Legendary
  { id: 'napoleon', name: 'Napoleon', elixir: 6, rarity: 'legendary', type: 'troop', hp: 1800, damage: 250, description: 'The Emperor himself! Buffs nearby allies and fires cannon.', era: 'Napoleonic', emoji: '👑', level: 1, count: 0, maxCount: 2 },
  { id: 'phoenix', name: 'Phoenix', elixir: 5, rarity: 'legendary', type: 'troop', hp: 1500, damage: 200, description: 'Mythical firebird. Revives once after death with half HP.', era: 'Mythology', emoji: '🦅', level: 1, count: 0, maxCount: 2 },
  { id: 'genghis-khan', name: 'Genghis Khan', elixir: 7, rarity: 'legendary', type: 'troop', hp: 2200, damage: 280, description: 'Spawns Mongol riders and charges with unstoppable force.', era: 'Mongol Empire', emoji: '⚡', level: 1, count: 0, maxCount: 2 },
  { id: 'necromancer', name: 'Necromancer', elixir: 5, rarity: 'legendary', type: 'troop', hp: 800, damage: 120, description: 'Raises fallen enemies as skeletons to fight for you.', era: 'Fantasy', emoji: '🧙', level: 1, count: 0, maxCount: 2 },
  { id: 'cleopatra', name: 'Cleopatra', elixir: 4, rarity: 'legendary', type: 'troop', hp: 900, damage: 100, description: 'Charms enemy troops to fight for you temporarily.', era: 'Ancient Egypt', emoji: '👸', level: 1, count: 0, maxCount: 2 },
  { id: 'kraken', name: 'Kraken', elixir: 8, rarity: 'legendary', type: 'troop', hp: 4000, damage: 300, description: 'Massive sea monster. Grabs and crushes multiple enemies.', era: 'Mythology', emoji: '🐙', level: 1, count: 0, maxCount: 2 },

  // Heroes
  { id: 'alexander-the-great', name: 'Alexander the Great', elixir: 6, rarity: 'hero', type: 'troop', hp: 3000, damage: 350, description: 'Conquers everything. Ability: Macedonian Charge - dashes forward dealing massive damage.', era: 'Ancient Greece', emoji: '🦁', level: 1, count: 0, maxCount: 1 },
  { id: 'joan-of-arc', name: 'Joan of Arc', elixir: 5, rarity: 'hero', type: 'troop', hp: 2500, damage: 200, description: 'Divine warrior. Ability: Rally Cry - buffs all allies attack speed.', era: 'Medieval France', emoji: '⚜️', level: 1, count: 0, maxCount: 1 },
];

export const getStarterDeck = (): GameCard[] => {
  return [
    allCards.find(c => c.id === 'roman-legionary')!,
    allCards.find(c => c.id === 'egyptian-archer')!,
    allCards.find(c => c.id === 'skeleton-horde')!,
    allCards.find(c => c.id === 'viking-raider')!,
    allCards.find(c => c.id === 'samurai')!,
    allCards.find(c => c.id === 'fireball')!,
    allCards.find(c => c.id === 'orc-berserker')!,
    allCards.find(c => c.id === 'mongol-cavalry')!,
  ];
};

export const defaultChests: ChestData[] = [
  { id: 'chest-1', type: 'silver', name: 'Silver Chest', emoji: '🪙', unlockTime: 10800, cards: 3, isUnlocking: false, unlockProgress: 0, isReady: false },
  { id: 'chest-2', type: 'silver', name: 'Silver Chest', emoji: '🪙', unlockTime: 10800, cards: 3, isUnlocking: false, unlockProgress: 0, isReady: false },
  { id: 'chest-3', type: 'silver', name: 'Silver Chest', emoji: '🪙', unlockTime: 10800, cards: 3, isUnlocking: false, unlockProgress: 0, isReady: false },
  { id: 'chest-4', type: 'silver', name: 'Silver Chest', emoji: '🪙', unlockTime: 10800, cards: 3, isUnlocking: false, unlockProgress: 0, isReady: false },
];

export const defaultProfile: PlayerProfile = {
  name: 'Warrior',
  level: 1,
  xp: 0,
  maxXp: 100,
  trophies: 0,
  maxTrophies: 0,
  arena: 1,
  arenaName: 'Training Camp',
  wins: 0,
  losses: 0,
  threeCrownWins: 0,
  challengeMaxWins: 0,
  warDayWins: 0,
  clanCardsCollected: 0,
  totalDonations: 0,
  gold: 100,
  gems: 10,
  starPoints: 0,
};


export const shopItems: ShopItem[] = [
  { id: 'shop-1', name: 'Silver Chest', emoji: '🪙', type: 'chest', cost: 100, currency: 'gold', description: 'Contains 3 cards' },
  { id: 'shop-2', name: 'Gold Chest', emoji: '💰', type: 'chest', cost: 300, currency: 'gold', description: 'Contains 6 cards' },
  { id: 'shop-3', name: 'Magical Chest', emoji: '✨', type: 'chest', cost: 500, currency: 'gems', description: 'Contains 12 cards, guaranteed Epic' },
  { id: 'shop-4', name: 'Legendary Chest', emoji: '🌟', type: 'chest', cost: 500, currency: 'gems', description: 'Contains 1 guaranteed Legendary' },
  { id: 'shop-5', name: 'Roman Legionary', emoji: '🛡️', type: 'card', cost: 10, currency: 'gold', rarity: 'common', description: 'x10 cards' },
  { id: 'shop-6', name: 'Samurai', emoji: '⚔️', type: 'card', cost: 1000, currency: 'gold', rarity: 'rare', description: 'x1 card' },
  { id: 'shop-7', name: 'Dragon Warrior', emoji: '🐲', type: 'card', cost: 2000, currency: 'gold', rarity: 'epic', description: 'x1 card' },
  { id: 'shop-8', name: '1000 Gold', emoji: '💰', type: 'gold', cost: 60, currency: 'gems', description: '1000 Gold coins' },
  { id: 'shop-9', name: '10000 Gold', emoji: '💰', type: 'gold', cost: 500, currency: 'gems', description: '10000 Gold coins' },
  { id: 'shop-10', name: '80 Gems', emoji: '💎', type: 'gems', cost: 4.99, currency: 'real', description: '80 Gems' },
  { id: 'shop-11', name: '500 Gems', emoji: '💎', type: 'gems', cost: 14.99, currency: 'real', description: '500 Gems' },
  { id: 'shop-12', name: 'War Pass', emoji: '🎖️', type: 'pass', cost: 4.99, currency: 'real', description: 'Unlock premium rewards all season' },
];

export const trophyRoadRewards: TrophyRoadReward[] = [
  { trophies: 0, type: 'chest', amount: 1, name: 'Starter Chest', emoji: '📦', claimed: false },
  { trophies: 200, type: 'gold', amount: 200, name: '200 Gold', emoji: '💰', claimed: false },
  { trophies: 400, type: 'chest', amount: 1, name: 'Silver Chest', emoji: '🪙', claimed: false },
  { trophies: 600, type: 'cards', amount: 10, name: '10 Cards', emoji: '🃏', claimed: false },
  { trophies: 800, type: 'gems', amount: 10, name: '10 Gems', emoji: '💎', claimed: false },
  { trophies: 1000, type: 'chest', amount: 1, name: 'Gold Chest', emoji: '💰', claimed: false },
  { trophies: 1200, type: 'gold', amount: 1000, name: '1000 Gold', emoji: '💰', claimed: false },
  { trophies: 1400, type: 'chest', amount: 1, name: 'Magical Chest', emoji: '✨', claimed: false },
  { trophies: 1600, type: 'gems', amount: 25, name: '25 Gems', emoji: '💎', claimed: false },
  { trophies: 1800, type: 'gold', amount: 2000, name: '2000 Gold', emoji: '💰', claimed: false },
  { trophies: 2000, type: 'chest', amount: 1, name: 'Giant Chest', emoji: '📦', claimed: false },
  { trophies: 2200, type: 'cards', amount: 50, name: '50 Cards', emoji: '🃏', claimed: false },
  { trophies: 2600, type: 'chest', amount: 1, name: 'Magical Chest', emoji: '✨', claimed: false },
  { trophies: 3000, type: 'gems', amount: 50, name: '50 Gems', emoji: '💎', claimed: false },
  { trophies: 3500, type: 'gold', amount: 5000, name: '5000 Gold', emoji: '💰', claimed: false },
  { trophies: 4000, type: 'chest', amount: 1, name: 'Legendary Chest', emoji: '🌟', claimed: false },
  { trophies: 4500, type: 'gold', amount: 10000, name: '10K Gold', emoji: '💰', claimed: false },
  { trophies: 5000, type: 'chest', amount: 1, name: 'Mega Lightning', emoji: '⚡', claimed: false },
  { trophies: 5500, type: 'gems', amount: 100, name: '100 Gems', emoji: '💎', claimed: false },
  { trophies: 6000, type: 'chest', amount: 1, name: 'Legendary Chest', emoji: '🌟', claimed: false },
];

export const getArenaForTrophies = (trophies: number) => {
  return [...arenas].reverse().find(a => trophies >= a.trophies) || arenas[0];
};
