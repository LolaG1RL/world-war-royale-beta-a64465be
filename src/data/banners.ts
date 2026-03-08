// Battle Banner system
// A banner = background + emblem (troop image). Some are animated (rare).
// Badges = achievement + cosmetic, max 3 equipped at a time.

export type BannerRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BannerBackground {
  id: string;
  name: string;
  rarity: BannerRarity;
  /** CSS gradient or color for the background */
  css: string;
  /** If true, has an animated SVG overlay */
  animated?: boolean;
  animationSvg?: string;
  cost: number;
  currency: 'gold' | 'gems';
}

export interface BannerEmblem {
  id: string;
  name: string;
  emoji: string;
  rarity: BannerRarity;
  /** If true, has subtle animation */
  animated?: boolean;
  cost: number;
  currency: 'gold' | 'gems';
}

export interface BannerBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: BannerRarity;
  /** 'achievement' = earned, 'cosmetic' = purchased */
  type: 'achievement' | 'cosmetic';
  cost: number;
  currency: 'gold' | 'gems';
  /** For achievement badges, the condition description */
  condition?: string;
}

export interface PlayerBanner {
  backgroundId: string;
  emblemId: string;
  badgeIds: string[]; // max 3
}

// ── Backgrounds ──
export const allBackgrounds: BannerBackground[] = [
  { id: 'bg-plains', name: 'Green Plains', rarity: 'common', css: 'linear-gradient(135deg, hsl(120,30%,25%), hsl(140,25%,18%))', cost: 0, currency: 'gold' },
  { id: 'bg-stone', name: 'Stone Wall', rarity: 'common', css: 'linear-gradient(135deg, hsl(220,10%,30%), hsl(220,15%,20%))', cost: 100, currency: 'gold' },
  { id: 'bg-crimson', name: 'Crimson Dawn', rarity: 'common', css: 'linear-gradient(135deg, hsl(0,50%,30%), hsl(350,40%,18%))', cost: 200, currency: 'gold' },
  { id: 'bg-ocean', name: 'Deep Ocean', rarity: 'rare', css: 'linear-gradient(135deg, hsl(210,60%,30%), hsl(200,50%,15%))', cost: 500, currency: 'gold' },
  { id: 'bg-sunset', name: 'Golden Sunset', rarity: 'rare', css: 'linear-gradient(135deg, hsl(30,70%,40%), hsl(15,60%,25%))', cost: 500, currency: 'gold' },
  { id: 'bg-frost', name: 'Frozen Tundra', rarity: 'rare', css: 'linear-gradient(135deg, hsl(195,50%,40%), hsl(210,40%,22%))', cost: 800, currency: 'gold' },
  { id: 'bg-inferno', name: 'Inferno', rarity: 'epic', css: 'linear-gradient(135deg, hsl(15,80%,45%), hsl(0,70%,20%))', cost: 50, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="hsl(15,80%,60%)" stroke-width="0.5" opacity="0.3"><animate attributeName="r" values="25;35;25" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite"/></circle></svg>' },
  { id: 'bg-void', name: 'Shadow Void', rarity: 'epic', css: 'linear-gradient(135deg, hsl(270,40%,20%), hsl(280,30%,8%))', cost: 50, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><circle cx="30" cy="30" r="5" fill="hsl(270,50%,50%)" opacity="0.2"><animate attributeName="opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite"/></circle><circle cx="70" cy="60" r="4" fill="hsl(280,50%,50%)" opacity="0.2"><animate attributeName="opacity" values="0.05;0.25;0.05" dur="2.5s" repeatCount="indefinite"/></circle></svg>' },
  { id: 'bg-divine', name: 'Divine Light', rarity: 'legendary', css: 'linear-gradient(135deg, hsl(45,80%,50%), hsl(38,90%,30%))', cost: 200, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><line x1="50" y1="0" x2="50" y2="100" stroke="hsl(45,80%,70%)" stroke-width="0.5" opacity="0.3"><animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" repeatCount="indefinite"/></line><line x1="0" y1="50" x2="100" y2="50" stroke="hsl(45,80%,70%)" stroke-width="0.5" opacity="0.3"><animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" begin="1s" repeatCount="indefinite"/></line></svg>' },
  { id: 'bg-galaxy', name: 'Galaxy', rarity: 'legendary', css: 'linear-gradient(135deg, hsl(260,50%,15%), hsl(300,40%,10%), hsl(220,50%,20%))', cost: 250, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="white" opacity="0.5"><animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="75" cy="35" r="0.8" fill="white" opacity="0.4"><animate attributeName="opacity" values="0.1;0.7;0.1" dur="2s" repeatCount="indefinite"/></circle><circle cx="40" cy="70" r="1.2" fill="white" opacity="0.3"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.8s" repeatCount="indefinite"/></circle></svg>' },
];

// ── Emblems (troop-based) ──
export const allEmblems: BannerEmblem[] = [
  { id: 'emb-shield', name: 'Shield', emoji: '🛡️', rarity: 'common', cost: 0, currency: 'gold' },
  { id: 'emb-sword', name: 'Crossed Swords', emoji: '⚔️', rarity: 'common', cost: 100, currency: 'gold' },
  { id: 'emb-skull', name: 'Skull', emoji: '💀', rarity: 'common', cost: 150, currency: 'gold' },
  { id: 'emb-axe', name: 'Battle Axe', emoji: '🪓', rarity: 'common', cost: 150, currency: 'gold' },
  { id: 'emb-bow', name: 'Bow', emoji: '🏹', rarity: 'common', cost: 150, currency: 'gold' },
  { id: 'emb-horse', name: 'War Horse', emoji: '🐎', rarity: 'rare', cost: 400, currency: 'gold' },
  { id: 'emb-ninja', name: 'Ninja', emoji: '🥷', rarity: 'rare', cost: 500, currency: 'gold' },
  { id: 'emb-samurai', name: 'Samurai', emoji: '⚔️', rarity: 'rare', cost: 500, currency: 'gold' },
  { id: 'emb-elephant', name: 'War Elephant', emoji: '🐘', rarity: 'epic', cost: 40, currency: 'gems' },
  { id: 'emb-dragon', name: 'Dragon', emoji: '🐲', rarity: 'epic', cost: 60, currency: 'gems', animated: true },
  { id: 'emb-phoenix', name: 'Phoenix', emoji: '🦅', rarity: 'legendary', cost: 150, currency: 'gems', animated: true },
  { id: 'emb-crown', name: 'Emperor Crown', emoji: '👑', rarity: 'legendary', cost: 200, currency: 'gems', animated: true },
  { id: 'emb-kraken', name: 'Kraken', emoji: '🐙', rarity: 'legendary', cost: 200, currency: 'gems', animated: true },
];

// ── Badges ──
export const allBadges: BannerBadge[] = [
  // Achievement badges
  { id: 'badge-first-win', name: 'First Blood', emoji: '🩸', description: 'Win your first battle', rarity: 'common', type: 'achievement', cost: 0, currency: 'gold', condition: 'wins >= 1' },
  { id: 'badge-10-wins', name: 'Warrior', emoji: '⚔️', description: 'Win 10 battles', rarity: 'common', type: 'achievement', cost: 0, currency: 'gold', condition: 'wins >= 10' },
  { id: 'badge-50-wins', name: 'Veteran', emoji: '🎖️', description: 'Win 50 battles', rarity: 'rare', type: 'achievement', cost: 0, currency: 'gold', condition: 'wins >= 50' },
  { id: 'badge-100-wins', name: 'Centurion', emoji: '🏛️', description: 'Win 100 battles', rarity: 'epic', type: 'achievement', cost: 0, currency: 'gold', condition: 'wins >= 100' },
  { id: 'badge-1k-trophies', name: 'Rising Star', emoji: '⭐', description: 'Reach 1000 trophies', rarity: 'rare', type: 'achievement', cost: 0, currency: 'gold', condition: 'maxTrophies >= 1000' },
  { id: 'badge-2k-trophies', name: 'Champion', emoji: '🏆', description: 'Reach 2000 trophies', rarity: 'epic', type: 'achievement', cost: 0, currency: 'gold', condition: 'maxTrophies >= 2000' },
  { id: 'badge-4k-trophies', name: 'Legend', emoji: '👑', description: 'Reach 4000 trophies', rarity: 'legendary', type: 'achievement', cost: 0, currency: 'gold', condition: 'maxTrophies >= 4000' },
  { id: 'badge-3crown', name: 'Crusher', emoji: '💥', description: 'Get 10 three-crown wins', rarity: 'rare', type: 'achievement', cost: 0, currency: 'gold', condition: 'threeCrownWins >= 10' },
  // Cosmetic badges
  { id: 'badge-fire', name: 'Fire', emoji: '🔥', description: 'A blazing fire badge', rarity: 'common', type: 'cosmetic', cost: 200, currency: 'gold' },
  { id: 'badge-lightning', name: 'Lightning', emoji: '⚡', description: 'Electric energy', rarity: 'common', type: 'cosmetic', cost: 200, currency: 'gold' },
  { id: 'badge-star', name: 'Star', emoji: '🌟', description: 'A shining star', rarity: 'rare', type: 'cosmetic', cost: 500, currency: 'gold' },
  { id: 'badge-gem', name: 'Gem', emoji: '💎', description: 'Precious gemstone', rarity: 'rare', type: 'cosmetic', cost: 30, currency: 'gems' },
  { id: 'badge-heart', name: 'Heart', emoji: '❤️', description: 'Show some love', rarity: 'common', type: 'cosmetic', cost: 150, currency: 'gold' },
  { id: 'badge-skull-gold', name: 'Golden Skull', emoji: '☠️', description: 'Fear the reaper', rarity: 'epic', type: 'cosmetic', cost: 60, currency: 'gems' },
  { id: 'badge-dragon', name: 'Dragon Crest', emoji: '🐉', description: 'Ancient dragon emblem', rarity: 'epic', type: 'cosmetic', cost: 80, currency: 'gems' },
  { id: 'badge-infinity', name: 'Infinity', emoji: '♾️', description: 'The eternal symbol', rarity: 'legendary', type: 'cosmetic', cost: 200, currency: 'gems' },
];

// ── localStorage persistence ──
const BANNER_KEY = 'player_banner';
const OWNED_BG_KEY = 'owned_backgrounds';
const OWNED_EMBLEM_KEY = 'owned_emblems';
const OWNED_BADGE_KEY = 'owned_badges';

export function getPlayerBanner(): PlayerBanner {
  try {
    const stored = localStorage.getItem(BANNER_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { backgroundId: 'bg-plains', emblemId: 'emb-shield', badgeIds: [] };
}

export function setPlayerBanner(banner: PlayerBanner) {
  localStorage.setItem(BANNER_KEY, JSON.stringify(banner));
}

function getOwnedSet(key: string, defaults: string[]): Set<string> {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const arr = JSON.parse(stored) as string[];
      defaults.forEach(d => arr.includes(d) || arr.push(d));
      return new Set(arr);
    }
  } catch {}
  return new Set(defaults);
}

function saveOwnedSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

// Default owned: first free background & emblem
export function getOwnedBackgrounds(): Set<string> {
  return getOwnedSet(OWNED_BG_KEY, ['bg-plains']);
}
export function addOwnedBackground(id: string) {
  const s = getOwnedBackgrounds(); s.add(id); saveOwnedSet(OWNED_BG_KEY, s);
}

export function getOwnedEmblems(): Set<string> {
  return getOwnedSet(OWNED_EMBLEM_KEY, ['emb-shield']);
}
export function addOwnedEmblem(id: string) {
  const s = getOwnedEmblems(); s.add(id); saveOwnedSet(OWNED_EMBLEM_KEY, s);
}

export function getOwnedBadges(): Set<string> {
  return getOwnedSet(OWNED_BADGE_KEY, []);
}
export function addOwnedBadge(id: string) {
  const s = getOwnedBadges(); s.add(id); saveOwnedSet(OWNED_BADGE_KEY, s);
}

/** Check which achievement badges the player qualifies for */
export function getUnlockedAchievementBadges(profile: { wins: number; maxTrophies: number; threeCrownWins: number }): string[] {
  const unlocked: string[] = [];
  for (const badge of allBadges) {
    if (badge.type !== 'achievement') continue;
    switch (badge.id) {
      case 'badge-first-win': if (profile.wins >= 1) unlocked.push(badge.id); break;
      case 'badge-10-wins': if (profile.wins >= 10) unlocked.push(badge.id); break;
      case 'badge-50-wins': if (profile.wins >= 50) unlocked.push(badge.id); break;
      case 'badge-100-wins': if (profile.wins >= 100) unlocked.push(badge.id); break;
      case 'badge-1k-trophies': if (profile.maxTrophies >= 1000) unlocked.push(badge.id); break;
      case 'badge-2k-trophies': if (profile.maxTrophies >= 2000) unlocked.push(badge.id); break;
      case 'badge-4k-trophies': if (profile.maxTrophies >= 4000) unlocked.push(badge.id); break;
      case 'badge-3crown': if (profile.threeCrownWins >= 10) unlocked.push(badge.id); break;
    }
  }
  return unlocked;
}
