/**
 * Data Repository Factory & Unified Store Access
 * Implements strict repository selection between live Supabase PostgreSQL
 * and an explicitly isolated in-memory demonstration store.
 */

import { IDataRepository } from './types';
import { SupabaseDataStore } from './supabase-store';
import { LocalDataStore } from './local-store';

let activeStore: IDataRepository | null = null;
let cachedStoreType: 'supabase' | 'demo' | null = null;

export function getDataStore(): IDataRepository {
  const requestedMode = process.env.DATA_STORE_MODE?.trim().toLowerCase();

  // Explicit demo mode forced
  if (requestedMode === 'demo') {
    if (!activeStore || cachedStoreType !== 'demo') {
      activeStore = new LocalDataStore();
      cachedStoreType = 'demo';
    }
    return activeStore;
  }

  // Check for PostgreSQL credentials
  const hasPgConnection = Boolean(
    (process.env.DIRECT_URL || process.env.DATABASE_URL)?.trim()
  );

  if (hasPgConnection) {
    if (!activeStore || cachedStoreType !== 'supabase') {
      activeStore = new SupabaseDataStore();
      cachedStoreType = 'supabase';
    }
    return activeStore;
  }

  // Fallback to demo store if no database configured
  if (!activeStore || cachedStoreType !== 'demo') {
    activeStore = new LocalDataStore();
    cachedStoreType = 'demo';
  }
  return activeStore;
}

export function isDatabaseConfigured(): boolean {
  return Boolean((process.env.DIRECT_URL || process.env.DATABASE_URL)?.trim());
}

export * from './types';
export { SupabaseDataStore } from './supabase-store';
export { LocalDataStore } from './local-store';
