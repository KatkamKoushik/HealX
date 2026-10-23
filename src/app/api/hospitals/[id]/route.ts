/**
 * API Route: /api/hospitals/[id]
 * GET: Retrieve hospital by ID or slug (Public)
 * PUT: Update hospital details (Protected: Staff or Admin required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';
import { requireStaffOrAdmin } from '@/lib/auth/server-auth';
import { z } from 'zod';

const UpdateHospitalSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().min(5).max(1000).optional(),
  hospital_type: z
    .enum([
      'General Hospital',
      'Community Health Centre',
      'Area Hospital',
      'Specialty Centre',
      'Teaching Hospital',
      'Primary Health Centre',
    ])
    .optional(),
  address: z.string().min(5).max(300).optional(),
  locality: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().max(100).optional(),
  postal_code: z.string().min(5).max(10).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  operating_hours: z.string().max(100).nullable().optional(),
  emergency_information: z.string().max(300).nullable().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const store = getDataStore();
    const hospital = await store.getHospitalById(params.id);

    if (!hospital) {
      return NextResponse.json({ success: false, error: 'Hospital not found' }, { status: 404 });
    }

    // Telemetry
    await store.logUsageEvent({
      event_type: 'page_view',
      page_name: `hospital_detail_${hospital.id}`,
      anonymised_session_id: null,
      metadata: { hospitalId: hospital.id, hospitalName: hospital.name },
    });

    return NextResponse.json({ success: true, data: hospital });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
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
    const parsed = UpdateHospitalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const store = getDataStore();
    const updated = await store.updateHospital(params.id, parsed.data, auth.user.id);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Hospital not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
