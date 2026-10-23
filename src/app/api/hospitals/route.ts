/**
 * API Route: /api/hospitals
 * GET: Retrieve active hospitals with query filters (Public read)
 * POST: Create a new hospital (Protected: Staff or Admin required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';
import { requireStaffOrAdmin } from '@/lib/auth/server-auth';
import { z } from 'zod';

const HospitalQuerySchema = z.object({
  search: z.string().max(100).optional(),
  type: z.string().max(50).optional(),
  status: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  activeOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val !== 'false'),
});

const CreateHospitalSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().min(5).max(1000),
  hospital_type: z.enum([
    'General Hospital',
    'Community Health Centre',
    'Area Hospital',
    'Specialty Centre',
    'Teaching Hospital',
    'Primary Health Centre',
  ]),
  address: z.string().min(5).max(300),
  locality: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().max(100).default('Telangana'),
  postal_code: z.string().min(5).max(10),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  operating_hours: z.string().max(100).nullable().optional(),
  emergency_information: z.string().max(300).nullable().optional(),
  is_active: z.boolean().default(true),
  verification_status: z.enum(['unverified', 'verified', 'needs_review', 'inactive']).default('unverified'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = HospitalQuerySchema.safeParse({
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      city: searchParams.get('city') || undefined,
      activeOnly: searchParams.get('activeOnly') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const store = getDataStore();
    const hospitals = await store.getHospitals(parsed.data);

    // Record search telemetry if query present
    if (parsed.data.search) {
      await store.logUsageEvent({
        event_type: 'search_hospital',
        page_name: 'hospitals',
        anonymised_session_id: null,
        metadata: { term: parsed.data.search, city: parsed.data.city || 'all' },
      });
    }

    return NextResponse.json({
      success: true,
      count: hospitals.length,
      dataSource: store.getDataSourceType(),
      data: hospitals,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: 'Failed to retrieve hospitals', message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Enforce staff or admin authorization
  const auth = await requireStaffOrAdmin();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const parsed = CreateHospitalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const store = getDataStore();
    const created = await store.createHospital(parsed.data, auth.user.id);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create hospital';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
