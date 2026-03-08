// Simulated matchup data for all cards
// Each card has win rates against every other card, simulating real battle statistics
// Logic: swarms counter single-target, splash counters swarms, air counters ground-only,
// buildings counter win-conditions, spells counter grouped units, tanks counter ranged, etc.

export interface MatchupEntry {
  cardId: string;
  winRate: number; // 0-100
  sampleSize: number; // simulated battle count
}

export interface CardMatchupData {
  counters: MatchupEntry[]; // cards this card is good against (sorted by winRate desc)
  counteredBy: MatchupEntry[]; // cards this card is bad against (sorted by winRate asc, shown as opponent's winRate)
}

// Helper to generate a deterministic pseudo-random number from two strings
function seedRandom(a: string, b: string): number {
  let hash = 0;
  const str = a + b;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

type CardArchetype = 'swarm' | 'tank' | 'splash' | 'single-target' | 'air' | 'ranged' | 'spell-aoe' | 'spell-single' | 'building-targeter' | 'support' | 'glass-cannon';

// Classify each card into archetype for matchup logic
const cardArchetypes: Record<string, CardArchetype> = {
  'roman-legionary': 'single-target',
  'wwii-rifleman': 'ranged',
  'viking-raider': 'single-target',
  'skeleton-horde': 'swarm',
  'egyptian-archer': 'ranged',
  'mongol-cavalry': 'ranged',
  'goblin-scouts': 'swarm',
  'zulu-warrior': 'single-target',
  'militia-spearmen': 'swarm',
  'maori-warrior': 'single-target',
  'minions': 'air',
  'bats': 'swarm',
  'samurai': 'single-target',
  'orc-berserker': 'splash',
  'crusader-knight': 'tank',
  'spartan-phalanx': 'swarm',
  'wwi-tank': 'tank',
  'ninja': 'glass-cannon',
  'ottoman-janissary': 'splash',
  'celtic-druid': 'support',
  'balloon': 'building-targeter',
  'valkyrie': 'splash',
  'dragon-warrior': 'splash',
  'persian-war-elephant': 'splash',
  'aztec-priest': 'splash',
  'fireball': 'spell-aoe',
  'artillery-strike': 'spell-aoe',
  'freeze-spell': 'spell-single',
  'terracotta-army': 'swarm',
  'lightning-bolt': 'spell-single',
  'golem': 'building-targeter',
  'pekka': 'tank',
  'napoleon': 'splash',
  'phoenix': 'air',
  'genghis-khan': 'tank',
  'necromancer': 'support',
  'cleopatra': 'support',
  'kraken': 'splash',
  'wizard': 'splash',
  'alexander-the-great': 'tank',
  'joan-of-arc': 'support',
};

// Advantage matrix: archetype A vs B -> base win rate advantage
const advantageMatrix: Record<CardArchetype, Partial<Record<CardArchetype, number>>> = {
  'swarm': { 'single-target': 15, 'tank': 12, 'building-targeter': 10, 'support': 5 },
  'tank': { 'ranged': 12, 'splash': 8, 'glass-cannon': 15, 'support': 10 },
  'splash': { 'swarm': 18, 'support': 5 },
  'single-target': { 'tank': 8, 'glass-cannon': 10, 'air': 5 },
  'air': { 'single-target': 12, 'tank': 10, 'swarm': -5 },
  'ranged': { 'single-target': 8, 'swarm': 5, 'air': 10 },
  'spell-aoe': { 'swarm': 20, 'support': 12, 'glass-cannon': 15 },
  'spell-single': { 'tank': 5, 'splash': 8, 'support': 10 },
  'building-targeter': { 'ranged': 5 },
  'support': { 'swarm': 5, 'glass-cannon': 8 },
  'glass-cannon': { 'support': 12, 'ranged': 8, 'swarm': 5 },
};

export function generateMatchupData(cardId: string, allCardIds: string[]): CardMatchupData {
  const myArchetype = cardArchetypes[cardId] || 'single-target';
  const matchups: MatchupEntry[] = [];

  for (const otherId of allCardIds) {
    if (otherId === cardId) continue;
    const otherArchetype = cardArchetypes[otherId] || 'single-target';

    // Base win rate is 50%
    let winRate = 50;

    // Apply archetype advantage
    const myAdvantage = advantageMatrix[myArchetype]?.[otherArchetype] || 0;
    const theirAdvantage = advantageMatrix[otherArchetype]?.[myArchetype] || 0;
    winRate += myAdvantage - theirAdvantage;

    // Add some deterministic variance based on card IDs
    const variance = (seedRandom(cardId, otherId) % 15) - 7;
    winRate += variance;

    // Clamp
    winRate = Math.max(15, Math.min(85, winRate));

    // Simulated sample size (more popular cards have more data)
    const sampleSize = 50 + (seedRandom(cardId, otherId) % 200);

    matchups.push({ cardId: otherId, winRate, sampleSize });
  }

  // Sort by win rate
  const sorted = [...matchups].sort((a, b) => b.winRate - a.winRate);

  // Top counters (win rate > 55) and worst matchups (win rate < 45)
  const counters = sorted.filter(m => m.winRate > 55).slice(0, 10);
  const counteredBy = sorted.filter(m => m.winRate < 45).reverse().slice(0, 10);

  return { counters, counteredBy };
}

// Pre-generate all matchup data
let _cache: Record<string, CardMatchupData> | null = null;

export function getAllMatchups(allCardIds: string[]): Record<string, CardMatchupData> {
  if (_cache) return _cache;
  _cache = {};
  for (const id of allCardIds) {
    _cache[id] = generateMatchupData(id, allCardIds);
  }
  return _cache;
}
