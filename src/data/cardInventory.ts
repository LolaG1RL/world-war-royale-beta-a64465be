// Card inventory system - manages card counts and levels in localStorage
// Clash Royale style upgrade mechanics

export interface CardInventoryEntry {
  count: number;
  level: number;
}

export type CardInventory = Record<string, CardInventoryEntry>;

const STORAGE_KEY = 'card_inventory';
const OWNED_CARDS_KEY = 'owned_cards';
const INVENTORY_UPDATED_EVENT = 'card-inventory-updated';

const emitInventoryUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(INVENTORY_UPDATED_EVENT));
  }
};

// Cards needed to upgrade at each level, by rarity
const UPGRADE_CARDS: Record<string, number[]> = {
  common:    [2, 4, 10, 20, 50, 100, 200, 400, 800, 1000, 2000, 5000],
  rare:      [2, 4, 10, 20, 50, 100, 200, 400, 800, 1000],
  epic:      [2, 4, 10, 20, 50, 100, 200],
  legendary: [2, 4, 10, 20, 50],
  hero:      [2, 4, 10],
};

// Gold cost to upgrade at each level, by rarity
const UPGRADE_GOLD: Record<string, number[]> = {
  common:    [5, 20, 50, 150, 400, 1000, 2000, 4000, 8000, 20000, 50000, 100000],
  rare:      [50, 150, 400, 1000, 2000, 4000, 8000, 20000, 50000, 100000],
  epic:      [400, 2000, 4000, 8000, 20000, 50000, 100000],
  legendary: [5000, 20000, 50000, 100000, 200000],
  hero:      [20000, 50000, 100000],
};

// Max level by rarity
export const MAX_LEVEL: Record<string, number> = {
  common: 13,
  rare: 11,
  epic: 8,
  legendary: 6,
  hero: 4,
};

// Donation limits per day by rarity
export const DONATION_LIMITS: Record<string, number> = {
  common: 40,
  rare: 4,
  epic: 1,
  legendary: 0, // can't request legendary
  hero: 0,
};

export const getCardInventory = (): CardInventory => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const saveCardInventory = (inv: CardInventory) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inv));
  emitInventoryUpdated();
};

const saveOwnedCardIds = (ids: string[]) => {
  localStorage.setItem(OWNED_CARDS_KEY, JSON.stringify(Array.from(new Set(ids))));
  emitInventoryUpdated();
};

export const getOwnedCardIds = (): string[] => {
  try {
    const saved = localStorage.getItem(OWNED_CARDS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return Array.from(new Set(parsed.filter(Boolean)));
    }
  } catch {}

  // Migration fallback for older versions: every inventory key counts as owned/unlocked
  const inv = getCardInventory();
  const fallbackOwned = Object.keys(inv);
  if (fallbackOwned.length > 0) saveOwnedCardIds(fallbackOwned);
  return fallbackOwned;
};

export const markCardsOwned = (cardIds: string[]) => {
  const ids = cardIds.filter(Boolean);
  if (ids.length === 0) return;

  const ownedSet = new Set(getOwnedCardIds());
  const inv = getCardInventory();
  let ownedChanged = false;
  let invChanged = false;

  ids.forEach((id) => {
    if (!ownedSet.has(id)) {
      ownedSet.add(id);
      ownedChanged = true;
    }

    if (!inv[id]) {
      inv[id] = { count: 0, level: 1 };
      invChanged = true;
    }
  });

  if (invChanged) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inv));
  }
  if (ownedChanged) {
    localStorage.setItem(OWNED_CARDS_KEY, JSON.stringify(Array.from(ownedSet)));
  }
  if (invChanged || ownedChanged) emitInventoryUpdated();
};

export const isCardOwned = (cardId: string): boolean => {
  const inv = getCardInventory();
  if (inv[cardId]) return true;
  return getOwnedCardIds().includes(cardId);
};

export const subscribeToCardInventory = (onChange: () => void) => {
  if (typeof window === 'undefined') return () => {};

  const handler = () => onChange();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === OWNED_CARDS_KEY) onChange();
  };

  window.addEventListener(INVENTORY_UPDATED_EVENT, handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(INVENTORY_UPDATED_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
};

export const getCardEntry = (cardId: string): CardInventoryEntry => {
  const inv = getCardInventory();
  return inv[cardId] || { count: 0, level: 1 };
};

export const addCards = (cardId: string, amount: number): CardInventoryEntry => {
  const inv = getCardInventory();
  const entry = inv[cardId] || { count: 0, level: 1 };
  entry.count += amount;
  inv[cardId] = entry;
  saveCardInventory(inv);
  markCardsOwned([cardId]);
  return entry;
};

export const removeCards = (cardId: string, amount: number): CardInventoryEntry => {
  const inv = getCardInventory();
  const entry = inv[cardId] || { count: 0, level: 1 };
  entry.count = Math.max(0, entry.count - amount);
  inv[cardId] = entry;
  saveCardInventory(inv);
  return entry;
};

export const getUpgradeRequirements = (cardId: string, rarity: string): { cardsNeeded: number; goldNeeded: number; maxLevel: boolean } | null => {
  const entry = getCardEntry(cardId);
  const maxLvl = MAX_LEVEL[rarity] || 13;
  if (entry.level >= maxLvl) return { cardsNeeded: 0, goldNeeded: 0, maxLevel: true };
  const levelIndex = entry.level - 1;
  const cards = UPGRADE_CARDS[rarity]?.[levelIndex] ?? 9999;
  const gold = UPGRADE_GOLD[rarity]?.[levelIndex] ?? 99999;
  return { cardsNeeded: cards, goldNeeded: gold, maxLevel: false };
};

export const canUpgrade = (cardId: string, rarity: string, playerGold: number): boolean => {
  const entry = getCardEntry(cardId);
  const req = getUpgradeRequirements(cardId, rarity);
  if (!req || req.maxLevel) return false;
  return entry.count >= req.cardsNeeded && playerGold >= req.goldNeeded;
};

export const upgradeCard = (cardId: string, rarity: string): { goldCost: number; newLevel: number } | null => {
  const inv = getCardInventory();
  const entry = inv[cardId] || { count: 0, level: 1 };
  const req = getUpgradeRequirements(cardId, rarity);
  if (!req || req.maxLevel) return null;
  if (entry.count < req.cardsNeeded) return null;

  entry.count -= req.cardsNeeded;
  entry.level += 1;
  inv[cardId] = entry;
  saveCardInventory(inv);
  markCardsOwned([cardId]);
  return { goldCost: req.goldNeeded, newLevel: entry.level };
};

// Request cooldown helpers
const REQUEST_COOLDOWN_KEY = 'card_request_cooldown';
const DONATIONS_TODAY_KEY = 'donations_today';

export const getRequestCooldown = (): number => {
  try {
    const saved = localStorage.getItem(REQUEST_COOLDOWN_KEY);
    if (!saved) return 0;
    return parseInt(saved, 10);
  } catch { return 0; }
};

export const setRequestCooldown = () => {
  localStorage.setItem(REQUEST_COOLDOWN_KEY, String(Date.now()));
};

export const canRequest = (): boolean => {
  const last = getRequestCooldown();
  if (!last) return true;
  return Date.now() - last >= 12 * 60 * 60 * 1000; // 12 hours
};

export const getRequestTimeLeftMs = (): number => {
  const last = getRequestCooldown();
  if (!last) return 0;
  const diff = 12 * 60 * 60 * 1000 - (Date.now() - last);
  return Math.max(0, diff);
};

export const getRequestTimeLeft = (): string => {
  const diff = getRequestTimeLeftMs();
  if (diff <= 0) return '';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
};

export const getSkipCooldownCost = (): number => {
  const remaining = getRequestTimeLeftMs();
  if (remaining <= 0) return 0;
  const total = 12 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil((remaining / total) * 100));
};

export const skipRequestCooldown = () => {
  localStorage.removeItem(REQUEST_COOLDOWN_KEY);
};

interface DonationsToday {
  date: string;
  donated: number;
}

export const getDonationsToday = (): DonationsToday => {
  try {
    const saved = localStorage.getItem(DONATIONS_TODAY_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.date === today) return data;
    }
  } catch {}
  return { date: new Date().toDateString(), donated: 0 };
};

export const recordDonation = (amount: number) => {
  const data = getDonationsToday();
  data.donated += amount;
  data.date = new Date().toDateString();
  localStorage.setItem(DONATIONS_TODAY_KEY, JSON.stringify(data));
};
