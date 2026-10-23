/**
 * API Route: /api/notifications/ivr
 * POST: Process DTMF keypad digit input in IVR state machine
 * GET: Render initial IVR state and menu
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIvrService, IvrState } from '@/lib/notifications/ivr-service';
import { z } from 'zod';

const IvrInputSchema = z.object({
  digit: z.string().min(1).max(2),
  state: z.object({
    currentStep: z.enum([
      'LANGUAGE_SELECT',
      'MAIN_MENU',
      'HOSPITALS_MENU',
      'HOSPITAL_DETAILS',
      'DEPARTMENTS_MENU',
      'EMERGENCY_INFO',
    ]),
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
        { success: false, error: 'Invalid IVR input', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const ivrService = getIvrService();
    const result = await ivrService.processInput(
      parsed.data.state as IvrState,
      parsed.data.digit
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'IVR simulation error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ivrService = getIvrService();
    const initial = ivrService.getInitialState();
    const rendered = await ivrService.renderStep(initial);
    return NextResponse.json({ success: true, data: rendered });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'IVR initialization error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
