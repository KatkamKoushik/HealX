/**
 * Server-Side Authentication & Authorization Helpers
 * Validates real Supabase Auth sessions and verifies user roles from profiles table.
 * Rejects unauthenticated requests with 401 and unauthorized requests with 403.
 */

import { getServerSupabaseClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/database';
import { NextResponse } from 'next/server';

export interface AuthSessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export type AuthResult =
  | { authenticated: true; user: AuthSessionUser }
  | { authenticated: false; response: NextResponse };

/**
 * Validates the current user session via Supabase Auth server client.
 * Returns the user and profile role if valid.
 */
export async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  const supabase = getServerSupabaseClient();
  if (!supabase) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Fetch user profile from database to get trusted role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      fullName: profile?.full_name || user.user_metadata?.full_name || 'Staff User',
      role: (profile?.role as UserRole) || 'staff',
    };
  } catch {
    return null;
  }
}

/**
 * Enforces that the request is authenticated with at least 'staff' or 'admin' role.
 */
export async function requireStaffOrAdmin(): Promise<AuthResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please sign in with staff credentials.',
          code: 'UNAUTHENTICATED',
        },
        { status: 401 }
      ),
    };
  }

  if (user.role !== 'staff' && user.role !== 'admin') {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Insufficient privileges. Staff or Administrator role required.',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      ),
    };
  }

  return { authenticated: true, user };
}

/**
 * Enforces that the request is authenticated with 'admin' role exclusively.
 */
export async function requireAdmin(): Promise<AuthResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please sign in with administrator credentials.',
          code: 'UNAUTHENTICATED',
        },
        { status: 401 }
      ),
    };
  }

  if (user.role !== 'admin') {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Administrator privileges required.',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      ),
    };
  }

  return { authenticated: true, user };
}
