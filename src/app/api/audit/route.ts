/**
 * API Route: /api/audit
 * GET: Retrieve administrative audit logs
 * Protected: Administrator role required exclusively
 */

import { NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';
import { requireAdmin } from '@/lib/auth/server-auth';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const store = getDataStore();
    const logs = await store.getAuditLogs();
    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Audit log retrieval failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
