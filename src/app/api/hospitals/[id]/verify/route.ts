/**
 * API Route: /api/hospitals/[id]/verify
 * POST: Transition verification status and record verification notes and staff actor
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';
import { VerificationStatus } from '@/types/database';
import { z } from 'zod';

const VerifySchema = z.object({
  status: z.enum(['verified', 'unverified', 'needs_review', 'inactive']),
  notes: z.string().min(3, 'Verification notes must be at least 3 characters'),
  verifiedBy: z.string().default('Staff Administrator'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const store = getDataStore();
    const updated = store.verifyHospital(
      params.id,
      parsed.data.status as VerificationStatus,
      parsed.data.notes,
      parsed.data.verifiedBy
    );

    if (!updated) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Hospital status transitioned to ${parsed.data.status}`,
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
