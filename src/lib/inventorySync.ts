// Inventory synchronization: localStorage <-> Supabase player_inventory table
// Persists: banners, emblems, badges, emotes, war pass, trophy road, card inventory, hero slots, settings

import { supabase } from '@/integrations/supabase/client';

const SYNC_KEYS = [
  'player_banner',
  'owned_backgrounds',
  'owned_emblems',
  'owned_badges',
  'owned_emotes',
  'equipped_emotes',
  'war_pass_data',
  'trophy_road_claimed',
  'card_inventory',
  'card_ownership',
  'hero_slots',
  'active_season_heroes',
  'river_race_data',
  'game_settings',
];

function gatherLocalData(): Record<string, any> {
  const data: Record<string, any> = {};
  for (const key of SYNC_KEYS) {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) data[key] = JSON.parse(val);
    } catch {
      const val = localStorage.getItem(key);
      if (val !== null) data[key] = val;
    }
  }
  return data;
}

function applyLocalData(data: Record<string, any>) {
  for (const [key, value] of Object.entries(data)) {
    if (SYNC_KEYS.includes(key) && value !== undefined && value !== null) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }
}

/** Load inventory from DB and merge into localStorage (DB wins for missing local data) */
export async function loadInventory(userId: string): Promise<void> {
  const { data } = await supabase
    .from('player_inventory')
    .select('inventory_data')
    .eq('user_id', userId)
    .maybeSingle();

  if (data?.inventory_data && typeof data.inventory_data === 'object') {
    const dbData = data.inventory_data as Record<string, any>;
    const localData = gatherLocalData();

    // Merge: for each key, use local if exists, otherwise use DB
    // This way existing local state is preserved but missing data is restored from DB
    for (const key of SYNC_KEYS) {
      if (!localData[key] && dbData[key] !== undefined) {
        const val = dbData[key];
        localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
      }
    }
  }
}

/** Save current localStorage inventory to DB */
export async function saveInventory(userId: string): Promise<void> {
  const data = gatherLocalData();
  if (Object.keys(data).length === 0) return;

  const { error } = await supabase
    .from('player_inventory')
    .upsert({
      user_id: userId,
      inventory_data: data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) console.warn('Inventory save failed:', error.message);
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

/** Debounced save — call frequently, actually saves every 3s */
export function debouncedSaveInventory(userId: string) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveInventory(userId), 3000);
}
