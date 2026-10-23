/**
 * Supabase Browser Client
 * Provides typed client when environment variables are supplied.
 * Gracefully reports unconfigured state without crashing the UI.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cleanEnv } from '../utils/env';

let cachedClient: SupabaseClient | null = null;

export function getBrowserSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;

  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
