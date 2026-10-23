/**
 * Supabase Browser Client
 * Provides typed client when environment variables are supplied.
 * Gracefully reports unconfigured state without crashing the UI.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getBrowserSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createBrowserClient(url, anonKey);
  }

  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}
