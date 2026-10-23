/**
 * API Route: /api/hospitals/[id]/verify
 * POST: Transition verification status and record verification notes and staff actor
 * Protected: Staff or Admin role required
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';
import { requireStaffOrAdmin } from '@/lib/auth/server-auth';
import { VerificationStatus } from '@/types/database';
import { z } from 'zod';

const VerifySchema = z.object({
  status: z.enum(['verified', 'unverified', 'needs_review', 'inactive']),
  notes: z.string().min(3, 'Verification notes must be at least 3 characters').max(1000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Enforce staff or admin authorization
  const auth = await requireStaffOrAdmin();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const store = getDataStore();
    const updated = await store.verifyHospital(
      params.id,
      parsed.data.status as VerificationStatus,
      parsed.data.notes,
      auth.user.fullName,
      auth.user.id
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Hospital not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Hospital verification status transitioned to ${parsed.data.status}`,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
