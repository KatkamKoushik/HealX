/**
 * API Route: /api/notifications/sms
 * GET: Retrieve notification logs (Protected: Staff or Admin required)
 * POST: Send or simulate SMS notification (Protected: Staff or Admin required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSmsService } from '@/lib/notifications/sms-service';
import { getDataStore } from '@/lib/repository/data-store';
import { requireStaffOrAdmin } from '@/lib/auth/server-auth';
import { z } from 'zod';

const SendSmsSchema = z.object({
  recipientPhoneNumber: z.string().min(8, 'Phone number must be at least 8 digits').max(20),
  messageText: z.string().min(3, 'Message must be at least 3 characters').max(320, 'Message too long'),
  isSimulated: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireStaffOrAdmin();
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const store = getDataStore();
    const logs = await store.getNotificationLogs();
    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching notification logs';
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
    const parsed = SendSmsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid SMS request', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const smsService = getSmsService();
    const result = await smsService.sendSms(parsed.data);

    return NextResponse.json({ success: result.success, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'SMS dispatch error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
