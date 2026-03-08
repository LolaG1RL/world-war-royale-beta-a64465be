export interface Emote {
  id: string;
  name: string;
  svg: string; // SVG markup
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'taunt' | 'happy' | 'sad' | 'angry' | 'celebration';
}

const createSvg = (emoji: string, bg: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${bg}" stroke="#000" stroke-width="2"/><text x="32" y="42" text-anchor="middle" font-size="32">${emoji}</text></svg>`;

export const allEmotes: Emote[] = [
  // Common
  { id: 'em-thumbsup', name: 'Thumbs Up', svg: createSvg('👍', '#2d5a27'), rarity: 'common', category: 'happy' },
  { id: 'em-cry', name: 'Crying', svg: createSvg('😢', '#1a3a5c'), rarity: 'common', category: 'sad' },
  { id: 'em-laugh', name: 'Laughing', svg: createSvg('😂', '#5a4a10'), rarity: 'common', category: 'taunt' },
  { id: 'em-angry', name: 'Angry', svg: createSvg('😡', '#5c1a1a'), rarity: 'common', category: 'angry' },
  { id: 'em-wave', name: 'Waving', svg: createSvg('👋', '#3a3a2a'), rarity: 'common', category: 'happy' },
  { id: 'em-think', name: 'Thinking', svg: createSvg('🤔', '#2a3a4a'), rarity: 'common', category: 'taunt' },
  { id: 'em-clap', name: 'Clapping', svg: createSvg('👏', '#3a4a2a'), rarity: 'common', category: 'celebration' },
  { id: 'em-sleep', name: 'Sleeping', svg: createSvg('😴', '#1a2a4a'), rarity: 'common', category: 'taunt' },
  // Rare
  { id: 'em-fire', name: 'On Fire', svg: createSvg('🔥', '#5c3a0a'), rarity: 'rare', category: 'celebration' },
  { id: 'em-skull', name: 'Skull', svg: createSvg('💀', '#2a2a2a'), rarity: 'rare', category: 'taunt' },
  { id: 'em-heart', name: 'Love', svg: createSvg('❤️', '#5c1a2a'), rarity: 'rare', category: 'happy' },
  { id: 'em-shocked', name: 'Shocked', svg: createSvg('😱', '#3a2a5c'), rarity: 'rare', category: 'sad' },
  { id: 'em-cool', name: 'Cool', svg: createSvg('😎', '#1a3a3a'), rarity: 'rare', category: 'happy' },
  { id: 'em-devil', name: 'Devil', svg: createSvg('😈', '#4a1a4a'), rarity: 'rare', category: 'angry' },
  { id: 'em-muscle', name: 'Flex', svg: createSvg('💪', '#4a3a1a'), rarity: 'rare', category: 'celebration' },
  { id: 'em-trophy', name: 'Trophy', svg: createSvg('🏆', '#5a4a0a'), rarity: 'rare', category: 'celebration' },
  // Epic
  { id: 'em-crown', name: 'Crown', svg: createSvg('👑', '#5a4a00'), rarity: 'epic', category: 'celebration' },
  { id: 'em-ghost', name: 'Ghost', svg: createSvg('👻', '#3a3a5c'), rarity: 'epic', category: 'taunt' },
  { id: 'em-explosion', name: 'Explosion', svg: createSvg('💥', '#5c2a0a'), rarity: 'epic', category: 'angry' },
  { id: 'em-rocket', name: 'Rocket', svg: createSvg('🚀', '#1a2a5c'), rarity: 'epic', category: 'celebration' },
  { id: 'em-sword', name: 'Sword', svg: createSvg('⚔️', '#3a3a3a'), rarity: 'epic', category: 'angry' },
  { id: 'em-shield', name: 'Shield', svg: createSvg('🛡️', '#2a3a5c'), rarity: 'epic', category: 'happy' },
  // Legendary
  { id: 'em-dragon', name: 'Dragon', svg: createSvg('🐲', '#3a1a1a'), rarity: 'legendary', category: 'taunt' },
  { id: 'em-lightning', name: 'Lightning', svg: createSvg('⚡', '#4a4a0a'), rarity: 'legendary', category: 'angry' },
  { id: 'em-star', name: 'Superstar', svg: createSvg('🌟', '#5a4a00'), rarity: 'legendary', category: 'celebration' },
  { id: 'em-diamond', name: 'Diamond', svg: createSvg('💎', '#1a3a5c'), rarity: 'legendary', category: 'happy' },
];

export const starterEmoteIds = ['em-thumbsup', 'em-cry', 'em-laugh', 'em-angry'];

export function getOwnedEmotes(): string[] {
  try {
    const stored = localStorage.getItem('owned_emotes');
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem('owned_emotes', JSON.stringify(starterEmoteIds));
  return [...starterEmoteIds];
}

export function addOwnedEmote(id: string) {
  const owned = getOwnedEmotes();
  if (!owned.includes(id)) {
    owned.push(id);
    localStorage.setItem('owned_emotes', JSON.stringify(owned));
  }
}

export function getEquippedEmotes(): string[] {
  try {
    const stored = localStorage.getItem('equipped_emotes');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    }
  } catch {}
  const defaults = [...starterEmoteIds];
  localStorage.setItem('equipped_emotes', JSON.stringify(defaults));
  return defaults;
}

export function setEquippedEmotes(ids: string[]) {
  localStorage.setItem('equipped_emotes', JSON.stringify(ids.slice(0, 8)));
}
