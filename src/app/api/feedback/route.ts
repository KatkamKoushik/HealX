/**
 * API Route: /api/feedback
 * GET: Retrieve feedback list (Protected: Staff or Admin required)
 * POST: Submit citizen feedback with validation & abuse limits (Public)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataStore } from '@/lib/repository/data-store';
import { requireStaffOrAdmin } from '@/lib/auth/server-auth';
import { z } from 'zod';

const FeedbackSchema = z.object({
  category: z.enum(['general', 'navigation', 'data_accuracy', 'accessibility', 'language']),
  rating: z.number().int().min(1).max(5),
  message: z.string().max(800, 'Message cannot exceed 800 characters').nullable().optional(),
  preferred_language: z.enum(['en', 'te']).default('en'),
});

export async function GET() {
  const auth = await requireStaffOrAdmin();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const store = getDataStore();
    const list = await store.getFeedback();
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = FeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid feedback submission', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const store = getDataStore();
    const created = await store.submitFeedback({
      category: parsed.data.category,
      rating: parsed.data.rating,
      message: parsed.data.message || null,
      preferred_language: parsed.data.preferred_language,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback submitted successfully',
        data: created,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Submission failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
