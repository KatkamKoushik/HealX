/**
 * API Route: /api/analytics
 * GET: Retrieve aggregated impact telemetry and usage metrics
 */

import { NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';

export async function GET() {
  try {
    const store = getDataStore();
    const summary = store.getAnalyticsSummary();
    return NextResponse.json({ success: true, data: summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analytics error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
