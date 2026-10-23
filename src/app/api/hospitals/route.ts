/**
 * API Route: /api/hospitals
 * Query Parameters:
 * - search: string
 * - type: string
 * - status: string
 * - city: string
 * - activeOnly: boolean (default true)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';
import { z } from 'zod';

const HospitalQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  city: z.string().optional(),
  activeOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val !== 'false'),
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
      return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.format() }, { status: 400 });
    }

    const store = getDataStore();
    const hospitals = store.getHospitals(parsed.data);

    // Record search telemetry if query present
    if (parsed.data.search) {
      store.logUsageEvent({
        event_type: 'search_hospital',
        page_name: 'hospitals',
        anonymised_session_id: null,
        metadata: { term: parsed.data.search, city: parsed.data.city || 'all' },
      });
    }

    return NextResponse.json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Failed to retrieve hospitals', message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = getDataStore();
    const created = store.createHospital(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create hospital';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
