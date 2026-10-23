/**
 * API Route: /api/departments
 * GET: Retrieve departments with optional search and hospitalId filter
 * POST: Create department
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const hospitalId = searchParams.get('hospitalId') || undefined;

    const store = getDataStore();
    const departments = store.getDepartments({ search, hospitalId, activeOnly: true });

    return NextResponse.json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = getDataStore();
    const created = store.createDepartment(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create department';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
