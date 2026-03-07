export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
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
  emoji: string; // placeholder visual
}

export const allCards: GameCard[] = [
  // Common troops
  { id: 'roman-legionary', name: 'Roman Legionary', elixir: 3, rarity: 'common', type: 'troop', hp: 600, damage: 75, description: 'Disciplined soldier with shield and gladius. Marches in formation.', era: 'Ancient Rome', emoji: '🛡️' },
  { id: 'wwii-rifleman', name: 'WWII Rifleman', elixir: 3, rarity: 'common', type: 'troop', hp: 500, damage: 90, description: 'Standard infantry with semi-auto rifle. Fast fire rate.', era: 'World War II', emoji: '🔫' },
  { id: 'viking-raider', name: 'Viking Raider', elixir: 3, rarity: 'common', type: 'troop', hp: 650, damage: 85, description: 'Axe-wielding Norse warrior. Hits hard and fast.', era: 'Viking Age', emoji: '🪓' },
  { id: 'skeleton-horde', name: 'Skeleton Horde', elixir: 2, rarity: 'common', type: 'troop', hp: 100, damage: 40, description: 'A swarm of undead skeletons. Weak alone, deadly in numbers.', era: 'Fantasy', emoji: '💀' },
  { id: 'egyptian-archer', name: 'Egyptian Archer', elixir: 3, rarity: 'common', type: 'troop', hp: 350, damage: 95, description: 'Precise ranged attacker from the Nile. Fires flaming arrows.', era: 'Ancient Egypt', emoji: '🏹' },
  { id: 'mongol-cavalry', name: 'Mongol Cavalry', elixir: 4, rarity: 'common', type: 'troop', hp: 700, damage: 110, description: 'Lightning fast horse archer. Strikes and retreats.', era: 'Mongol Empire', emoji: '🐎' },
  { id: 'goblin-scouts', name: 'Goblin Scouts', elixir: 2, rarity: 'common', type: 'troop', hp: 200, damage: 60, description: 'Three sneaky goblins. Fast and mischievous.', era: 'Fantasy', emoji: '👺' },
  { id: 'zulu-warrior', name: 'Zulu Warrior', elixir: 3, rarity: 'common', type: 'troop', hp: 580, damage: 80, description: 'Fearsome spear-wielding warrior with iklwa and shield.', era: 'Zulu Kingdom', emoji: '⚔️' },

  // Rare troops
  { id: 'samurai', name: 'Samurai', elixir: 4, rarity: 'rare', type: 'troop', hp: 850, damage: 150, description: 'Master swordsman with devastating katana strikes.', era: 'Feudal Japan', emoji: '⚔️' },
  { id: 'orc-berserker', name: 'Orc Berserker', elixir: 5, rarity: 'rare', type: 'troop', hp: 1200, damage: 130, description: 'Raging greenskin that gets stronger when hurt.', era: 'Fantasy', emoji: '👹' },
  { id: 'crusader-knight', name: 'Crusader Knight', elixir: 5, rarity: 'rare', type: 'troop', hp: 1400, damage: 120, description: 'Heavily armored mounted knight. Charges into battle.', era: 'Medieval', emoji: '🏇' },
  { id: 'spartan-phalanx', name: 'Spartan Phalanx', elixir: 5, rarity: 'rare', type: 'troop', hp: 400, damage: 70, description: 'Three Spartans in tight formation. High defense, area denial.', era: 'Ancient Greece', emoji: '🏛️' },
  { id: 'wwi-tank', name: 'WWI Tank', elixir: 6, rarity: 'rare', type: 'troop', hp: 2000, damage: 100, description: 'Slow but nearly indestructible. Crushes everything in its path.', era: 'World War I', emoji: '🪖' },
  { id: 'ninja', name: 'Shadow Ninja', elixir: 3, rarity: 'rare', type: 'troop', hp: 450, damage: 180, description: 'Invisible until attacking. Deadly first strike.', era: 'Feudal Japan', emoji: '🥷' },

  // Epic troops & spells
  { id: 'dragon-warrior', name: 'Dragon Warrior', elixir: 7, rarity: 'epic', type: 'troop', hp: 2500, damage: 200, description: 'Half-dragon berserker. Breathes fire in an arc.', era: 'Fantasy', emoji: '🐲' },
  { id: 'persian-war-elephant', name: 'War Elephant', elixir: 7, rarity: 'epic', type: 'troop', hp: 3000, damage: 180, description: 'Massive beast that tramples everything. Splash damage.', era: 'Persian Empire', emoji: '🐘' },
  { id: 'aztec-priest', name: 'Aztec Sun Priest', elixir: 5, rarity: 'epic', type: 'troop', hp: 600, damage: 160, description: 'Channels solar energy to blast enemies. Area damage.', era: 'Aztec Empire', emoji: '☀️' },
  { id: 'fireball', name: 'Fireball', elixir: 4, rarity: 'epic', type: 'spell', damage: 350, description: 'A devastating ball of fire. Damages everything in its radius.', era: 'Fantasy', emoji: '🔥' },
  { id: 'artillery-strike', name: 'Artillery Strike', elixir: 5, rarity: 'epic', type: 'spell', damage: 500, description: 'Calls in a barrage of mortar shells. Massive area damage.', era: 'Modern', emoji: '💣' },
  { id: 'freeze-spell', name: 'Frost Rune', elixir: 4, rarity: 'epic', type: 'spell', damage: 50, description: 'Ancient Norse rune that freezes all enemies in area.', era: 'Fantasy', emoji: '❄️' },

  // Legendary
  { id: 'napoleon', name: 'Napoleon', elixir: 6, rarity: 'legendary', type: 'troop', hp: 1800, damage: 250, description: 'The Emperor himself! Buffs nearby allies and fires cannon.', era: 'Napoleonic', emoji: '👑' },
  { id: 'phoenix', name: 'Phoenix', elixir: 5, rarity: 'legendary', type: 'troop', hp: 1500, damage: 200, description: 'Mythical firebird. Revives once after death with half HP.', era: 'Mythology', emoji: '🦅' },
  { id: 'genghis-khan', name: 'Genghis Khan', elixir: 7, rarity: 'legendary', type: 'troop', hp: 2200, damage: 280, description: 'Spawns Mongol riders and charges with unstoppable force.', era: 'Mongol Empire', emoji: '⚡' },
  { id: 'necromancer', name: 'Necromancer', elixir: 5, rarity: 'legendary', type: 'troop', hp: 800, damage: 120, description: 'Raises fallen enemies as skeletons to fight for you.', era: 'Fantasy', emoji: '🧙' },
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

export const rarityColors: Record<Rarity, string> = {
  common: 'bg-common/20 border-common/40',
  rare: 'bg-rare/20 border-rare/40',
  epic: 'bg-epic/20 border-epic/40',
  legendary: 'bg-legendary/20 border-legendary/40',
};
