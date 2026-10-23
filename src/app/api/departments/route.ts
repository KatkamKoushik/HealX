/**
 * API Route: /api/departments
 * GET: Retrieve departments with optional search and hospitalId filter (Public)
 * POST: Create department (Protected: Staff or Admin required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';
import { requireStaffOrAdmin } from '@/lib/auth/server-auth';
import { z } from 'zod';

const DepartmentQuerySchema = z.object({
  search: z.string().max(100).optional(),
  hospitalId: z.string().max(100).optional(),
});

const CreateDepartmentSchema = z.object({
  hospital_id: z.string().min(1),
  name: z.string().min(2).max(150),
  description: z.string().min(5).max(1000),
  contact_information: z.string().max(200).nullable().optional(),
  operating_hours: z.string().max(100).nullable().optional(),
  is_active: z.boolean().default(true),
  verification_status: z.enum(['unverified', 'verified', 'needs_review', 'inactive']).default('unverified'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = DepartmentQuerySchema.safeParse({
      search: searchParams.get('search') || undefined,
      hospitalId: searchParams.get('hospitalId') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const store = getDataStore();
    const departments = await store.getDepartments({
      search: parsed.data.search,
      hospitalId: parsed.data.hospitalId,
      activeOnly: true,
    });

    return NextResponse.json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireStaffOrAdmin();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const parsed = CreateDepartmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const store = getDataStore();
    const created = await store.createDepartment(parsed.data, auth.user.id);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create department';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
