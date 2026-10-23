/**
 * API Route: /api/assistant
 * POST: AI Healthcare Navigation Assistant with Waterfall Failover (Gemini -> Grok -> Fallback)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAiService } from '@/lib/ai/ai-service';
import { getDataStore } from '@/lib/repository/data-store';
import { z } from 'zod';

const AssistantRequestSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters').max(400, 'Query too long'),
  language: z.enum(['en', 'te']).default('en'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AssistantRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid assistant request', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { query, language } = parsed.data;
    const aiService = getAiService();
    const store = getDataStore();

    // Call waterfall service
    const response = await aiService.askNavigationAssistant(query, language);

    // Record non-sensitive usage event
    await store.logUsageEvent({
      event_type: 'assistant_query',
      page_name: 'assistant',
      anonymised_session_id: null,
      metadata: {
        language,
        providerUsed: response.providerUsed,
        fallbackTriggered: response.fallbackTriggered,
        latencyMs: response.latencyMs,
      },
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Assistant service error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const aiService = getAiService();
  return NextResponse.json({
    success: true,
    status: aiService.getProviderStatus(),
  });
}
