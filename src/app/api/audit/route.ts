/**
 * API Route: /api/audit
 * GET: Retrieve administrative audit logs
 */

import { NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';

export async function GET() {
  try {
    const store = getDataStore();
    const logs = store.getAuditLogs();
    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Audit log retrieval failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
