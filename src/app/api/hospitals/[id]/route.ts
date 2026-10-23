/**
 * API Route: /api/hospitals/[id]
 * GET: Retrieve hospital by ID or slug
 * PUT: Update hospital details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const store = getDataStore();
    const hospital = store.getHospitalById(params.id);

    if (!hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    // Telemetry
    store.logUsageEvent({
      event_type: 'page_view',
      page_name: `hospital_detail_${hospital.id}`,
      anonymised_session_id: null,
      metadata: { hospitalId: hospital.id, hospitalName: hospital.name },
    });

    return NextResponse.json({ success: true, data: hospital });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const store = getDataStore();
    const updated = store.updateHospital(params.id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
