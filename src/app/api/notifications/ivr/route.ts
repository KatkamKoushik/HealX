/**
 * API Route: /api/notifications/ivr
 * POST: Process DTMF keypad digit input in IVR state machine
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIvrService, IvrState } from '@/lib/notifications/ivr-service';
import { z } from 'zod';

const IvrInputSchema = z.object({
  digit: z.string().min(1).max(2),
  state: z.object({
    currentStep: z.string(),
    language: z.enum(['en', 'te']),
    selectedHospitalId: z.string().optional(),
    selectedDepartmentId: z.string().optional(),
    history: z.array(z.string()),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = IvrInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid IVR input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const ivrService = getIvrService();
    const result = ivrService.processInput(
      parsed.data.state as IvrState,
      parsed.data.digit
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'IVR simulation error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const ivrService = getIvrService();
  const initial = ivrService.getInitialState();
  const rendered = ivrService.renderStep(initial);
  return NextResponse.json({ success: true, data: rendered });
}
