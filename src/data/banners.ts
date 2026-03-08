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
  { id: 'bg-plains', name: 'Green Plains', rarity: 'common', css: 'linear-gradient(135deg, hsl(120,35%,28%) 0%, hsl(90,25%,20%) 40%, hsl(140,30%,15%) 100%)', cost: 0, currency: 'gold' },
  { id: 'bg-stone', name: 'Stone Fortress', rarity: 'common', css: 'linear-gradient(160deg, hsl(220,15%,35%) 0%, hsl(200,10%,22%) 30%, hsl(240,12%,18%) 70%, hsl(220,8%,12%) 100%)', cost: 100, currency: 'gold' },
  { id: 'bg-crimson', name: 'Crimson Dawn', rarity: 'common', css: 'linear-gradient(135deg, hsl(350,55%,35%) 0%, hsl(0,45%,28%) 30%, hsl(15,40%,22%) 60%, hsl(340,50%,15%) 100%)', cost: 200, currency: 'gold' },
  { id: 'bg-midnight', name: 'Midnight Blue', rarity: 'common', css: 'linear-gradient(180deg, hsl(220,50%,18%) 0%, hsl(230,45%,12%) 50%, hsl(240,40%,8%) 100%)', cost: 150, currency: 'gold' },
  { id: 'bg-forest', name: 'Enchanted Forest', rarity: 'common', css: 'linear-gradient(135deg, hsl(110,40%,22%) 0%, hsl(130,35%,18%) 40%, hsl(150,30%,12%) 100%)', cost: 180, currency: 'gold' },
  { id: 'bg-ocean', name: 'Deep Ocean', rarity: 'rare', css: 'linear-gradient(180deg, hsl(200,55%,35%) 0%, hsl(210,60%,25%) 30%, hsl(220,55%,18%) 60%, hsl(230,50%,12%) 100%)', cost: 500, currency: 'gold' },
  { id: 'bg-sunset', name: 'Golden Sunset', rarity: 'rare', css: 'linear-gradient(135deg, hsl(45,70%,45%) 0%, hsl(30,65%,35%) 25%, hsl(15,60%,28%) 50%, hsl(350,55%,22%) 80%, hsl(340,45%,15%) 100%)', cost: 500, currency: 'gold' },
  { id: 'bg-frost', name: 'Frozen Tundra', rarity: 'rare', css: 'linear-gradient(180deg, hsl(195,50%,45%) 0%, hsl(200,45%,35%) 25%, hsl(210,40%,25%) 50%, hsl(220,35%,18%) 80%, hsl(230,30%,12%) 100%)', cost: 800, currency: 'gold' },
  { id: 'bg-desert', name: 'Sahara Mirage', rarity: 'rare', css: 'linear-gradient(160deg, hsl(40,55%,45%) 0%, hsl(35,50%,35%) 30%, hsl(25,45%,25%) 60%, hsl(15,40%,18%) 100%)', cost: 600, currency: 'gold' },
  { id: 'bg-jungle', name: 'Dark Jungle', rarity: 'rare', css: 'linear-gradient(135deg, hsl(100,40%,30%) 0%, hsl(120,35%,22%) 30%, hsl(150,30%,15%) 60%, hsl(160,25%,10%) 100%)', cost: 700, currency: 'gold' },
  { id: 'bg-twilight', name: 'Twilight', rarity: 'rare', css: 'linear-gradient(180deg, hsl(280,40%,25%) 0%, hsl(260,35%,18%) 40%, hsl(240,30%,12%) 70%, hsl(220,25%,8%) 100%)', cost: 650, currency: 'gold' },
  { id: 'bg-bloodmoon', name: 'Blood Moon', rarity: 'rare', css: 'linear-gradient(180deg, hsl(0,50%,20%) 0%, hsl(350,55%,15%) 40%, hsl(340,60%,10%) 100%)', cost: 750, currency: 'gold' },
  { id: 'bg-inferno', name: 'Inferno', rarity: 'epic', css: 'linear-gradient(135deg, hsl(15,80%,50%) 0%, hsl(5,75%,40%) 25%, hsl(0,70%,30%) 50%, hsl(350,65%,20%) 75%, hsl(340,60%,12%) 100%)', cost: 50, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="none" stroke="hsl(15,80%,60%)" stroke-width="0.5" opacity="0.3"><animate attributeName="r" values="25;35;25" dur="3s" repeatCount="indefinite"/></circle></svg>' },
  { id: 'bg-void', name: 'Shadow Void', rarity: 'epic', css: 'radial-gradient(ellipse at 30% 40%, hsl(270,50%,25%) 0%, hsl(280,40%,15%) 30%, hsl(260,35%,10%) 60%, hsl(250,30%,5%) 100%)', cost: 50, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><circle cx="30" cy="30" r="5" fill="hsl(270,50%,50%)" opacity="0.2"><animate attributeName="opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite"/></circle></svg>' },
  { id: 'bg-aurora', name: 'Aurora Borealis', rarity: 'epic', css: 'linear-gradient(180deg, hsl(220,40%,12%) 0%, hsl(160,50%,20%) 25%, hsl(130,45%,25%) 40%, hsl(180,50%,22%) 55%, hsl(280,40%,18%) 75%, hsl(220,35%,10%) 100%)', cost: 70, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><path d="M0,50 Q25,30 50,45 T100,40" fill="none" stroke="hsl(130,50%,50%)" stroke-width="0.8" opacity="0.25"></path></svg>' },
  { id: 'bg-thunderstorm', name: 'Thunderstorm', rarity: 'epic', css: 'linear-gradient(180deg, hsl(230,50%,15%) 0%, hsl(220,45%,22%) 30%, hsl(200,40%,18%) 60%, hsl(210,50%,10%) 100%)', cost: 60, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><line x1="30" y1="20" x2="35" y2="50" stroke="hsl(45,90%,70%)" stroke-width="0.5" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/></line></svg>' },
  { id: 'bg-nebula', name: 'Cosmic Nebula', rarity: 'epic', css: 'radial-gradient(ellipse at 60% 40%, hsl(300,50%,25%) 0%, hsl(280,45%,18%) 25%, hsl(260,40%,12%) 50%, hsl(240,35%,8%) 100%)', cost: 80, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><circle cx="60" cy="40" r="20" fill="hsl(300,40%,40%)" opacity="0.1"><animate attributeName="r" values="18;25;18" dur="4s" repeatCount="indefinite"/></circle></svg>' },
  { id: 'bg-divine', name: 'Divine Light', rarity: 'legendary', css: 'radial-gradient(ellipse at 50% 30%, hsl(45,85%,55%) 0%, hsl(40,80%,40%) 20%, hsl(38,75%,30%) 40%, hsl(35,60%,20%) 60%, hsl(30,50%,12%) 100%)', cost: 200, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><line x1="50" y1="0" x2="50" y2="100" stroke="hsl(45,80%,70%)" stroke-width="0.5" opacity="0.3"><animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" repeatCount="indefinite"/></line></svg>' },
  { id: 'bg-galaxy', name: 'Galaxy', rarity: 'legendary', css: 'radial-gradient(ellipse at 40% 50%, hsl(260,55%,22%) 0%, hsl(280,45%,15%) 25%, hsl(300,40%,12%) 50%, hsl(240,50%,10%) 75%, hsl(220,45%,6%) 100%)', cost: 250, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="white" opacity="0.5"><animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="75" cy="35" r="0.8" fill="white" opacity="0.4"><animate attributeName="opacity" values="0.1;0.7;0.1" dur="2s" repeatCount="indefinite"/></circle></svg>' },
  { id: 'bg-volcanic', name: 'Volcanic', rarity: 'legendary', css: 'linear-gradient(180deg, hsl(0,60%,15%) 0%, hsl(10,70%,25%) 30%, hsl(20,80%,35%) 50%, hsl(30,75%,30%) 65%, hsl(5,65%,18%) 80%, hsl(0,50%,8%) 100%)', cost: 220, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="8" fill="hsl(20,90%,50%)" opacity="0.15"><animate attributeName="r" values="5;12;5" dur="2s" repeatCount="indefinite"/></circle></svg>' },
  { id: 'bg-olympus', name: 'Mount Olympus', rarity: 'legendary', css: 'linear-gradient(180deg, hsl(200,60%,70%) 0%, hsl(210,50%,50%) 20%, hsl(220,40%,35%) 45%, hsl(230,35%,22%) 70%, hsl(240,30%,12%) 100%)', cost: 280, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="20" r="10" fill="hsl(45,90%,80%)" opacity="0.2"><animate attributeName="opacity" values="0.15;0.35;0.15" dur="3s" repeatCount="indefinite"/></circle></svg>' },
  // Season 1 War Pass+ exclusive
  { id: 'bg-wp-s1-divine-flame', name: 'Divine Flame', rarity: 'legendary', css: 'linear-gradient(180deg, hsl(45,70%,50%) 0%, hsl(35,65%,38%) 20%, hsl(280,40%,22%) 50%, hsl(260,35%,15%) 80%, hsl(240,30%,8%) 100%)', cost: 0, currency: 'gems', animated: true, animationSvg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="30" r="15" fill="hsl(45,80%,60%)" opacity="0.15"><animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite"/></circle><circle cx="30" cy="60" r="8" fill="hsl(280,50%,50%)" opacity="0.1"><animate attributeName="opacity" values="0.05;0.2;0.05" dur="3s" repeatCount="indefinite"/></circle></svg>' },
];

// ── Emblems (troop-based) ──
export const allEmblems: BannerEmblem[] = [
  { id: 'emb-shield', name: 'Shield', emoji: '🛡️', rarity: 'common', cost: 0, currency: 'gold' },
  { id: 'emb-sword', name: 'Crossed Swords', emoji: '⚔️', rarity: 'common', cost: 100, currency: 'gold' },
  { id: 'emb-skull', name: 'Skull', emoji: '💀', rarity: 'common', cost: 150, currency: 'gold' },
  { id: 'emb-axe', name: 'Battle Axe', emoji: '🪓', rarity: 'common', cost: 150, currency: 'gold' },
  { id: 'emb-bow', name: 'Bow', emoji: '🏹', rarity: 'common', cost: 150, currency: 'gold' },
  { id: 'emb-fire', name: 'Fire', emoji: '🔥', rarity: 'common', cost: 180, currency: 'gold' },
  { id: 'emb-lightning', name: 'Lightning', emoji: '⚡', rarity: 'common', cost: 180, currency: 'gold' },
  { id: 'emb-star', name: 'Star', emoji: '⭐', rarity: 'common', cost: 200, currency: 'gold' },
  { id: 'emb-horse', name: 'War Horse', emoji: '🐎', rarity: 'rare', cost: 400, currency: 'gold' },
  { id: 'emb-ninja', name: 'Ninja', emoji: '🥷', rarity: 'rare', cost: 500, currency: 'gold' },
  { id: 'emb-samurai', name: 'Samurai Helm', emoji: '⛩️', rarity: 'rare', cost: 500, currency: 'gold' },
  { id: 'emb-viking', name: 'Viking', emoji: '🪓', rarity: 'rare', cost: 450, currency: 'gold' },
  { id: 'emb-spartan', name: 'Spartan', emoji: '🏛️', rarity: 'rare', cost: 550, currency: 'gold' },
  { id: 'emb-knight', name: 'Knight', emoji: '🗡️', rarity: 'rare', cost: 480, currency: 'gold' },
  { id: 'emb-wizard', name: 'Wizard', emoji: '🧙', rarity: 'rare', cost: 520, currency: 'gold' },
  { id: 'emb-elephant', name: 'War Elephant', emoji: '🐘', rarity: 'epic', cost: 40, currency: 'gems' },
  { id: 'emb-dragon', name: 'Dragon', emoji: '🐲', rarity: 'epic', cost: 60, currency: 'gems', animated: true },
  { id: 'emb-lion', name: 'Lion', emoji: '🦁', rarity: 'epic', cost: 55, currency: 'gems' },
  { id: 'emb-eagle', name: 'Eagle', emoji: '🦅', rarity: 'epic', cost: 50, currency: 'gems' },
  { id: 'emb-wolf', name: 'Wolf', emoji: '🐺', rarity: 'epic', cost: 45, currency: 'gems' },
  { id: 'emb-phoenix', name: 'Phoenix', emoji: '🔥', rarity: 'legendary', cost: 150, currency: 'gems', animated: true },
  { id: 'emb-crown', name: 'Emperor Crown', emoji: '👑', rarity: 'legendary', cost: 200, currency: 'gems', animated: true },
  { id: 'emb-kraken', name: 'Kraken', emoji: '🐙', rarity: 'legendary', cost: 200, currency: 'gems', animated: true },
  { id: 'emb-trident', name: 'Trident', emoji: '🔱', rarity: 'legendary', cost: 180, currency: 'gems', animated: true },
  { id: 'emb-thunderbolt', name: 'Thunderbolt', emoji: '⚡', rarity: 'legendary', cost: 220, currency: 'gems', animated: true },
  // Season 1 War Pass+ exclusive
  { id: 'emb-wp-s1-joan', name: 'Joan\'s Banner', emoji: '⚜️', rarity: 'legendary', cost: 0, currency: 'gems', animated: true },
];

// ── Badges ──
export const allBadges: BannerBadge[] = [
  // Achievement badges (earned, not purchased)
  { id: 'badge-first-win', name: 'First Blood', emoji: '🩸', description: 'Win your first battle', rarity: 'common', type: 'achievement', cost: 0, currency: 'gold', condition: 'wins >= 1' },
  { id: 'badge-10-wins', name: 'Warrior', emoji: '⚔️', description: 'Win 10 battles', rarity: 'common', type: 'achievement', cost: 0, currency: 'gold', condition: 'wins >= 10' },
  { id: 'badge-50-wins', name: 'Veteran', emoji: '🎖️', description: 'Win 50 battles', rarity: 'rare', type: 'achievement', cost: 0, currency: 'gold', condition: 'wins >= 50' },
  { id: 'badge-100-wins', name: 'Centurion', emoji: '🏛️', description: 'Win 100 battles', rarity: 'epic', type: 'achievement', cost: 0, currency: 'gold', condition: 'wins >= 100' },
  { id: 'badge-1k-trophies', name: 'Rising Star', emoji: '⭐', description: 'Reach 1000 trophies', rarity: 'rare', type: 'achievement', cost: 0, currency: 'gold', condition: 'maxTrophies >= 1000' },
  { id: 'badge-2k-trophies', name: 'Champion', emoji: '🏆', description: 'Reach 2000 trophies', rarity: 'epic', type: 'achievement', cost: 0, currency: 'gold', condition: 'maxTrophies >= 2000' },
  { id: 'badge-4k-trophies', name: 'Legend', emoji: '👑', description: 'Reach 4000 trophies', rarity: 'legendary', type: 'achievement', cost: 0, currency: 'gold', condition: 'maxTrophies >= 4000' },
  { id: 'badge-3crown', name: 'Crusher', emoji: '💥', description: 'Get 10 three-crown wins', rarity: 'rare', type: 'achievement', cost: 0, currency: 'gold', condition: 'threeCrownWins >= 10' },
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
