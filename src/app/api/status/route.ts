/**
 * API Route: /api/status
 * GET: System and external integration status.
 * Never exposes secrets, keys, or token fragments.
 */

import { NextResponse } from 'next/server';
import APP_CONFIG from '@/config/app-config';

export async function GET() {
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasSupabaseAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
  const hasSupabaseService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasGrok = Boolean(process.env.GROK_API_KEY?.trim());
  const hasTwilioSid = Boolean(process.env.TWILIO_ACCOUNT_SID?.trim());
  const hasTwilioAuth = Boolean(process.env.TWILIO_AUTH_TOKEN?.trim());
  const hasTwilioPhone = Boolean(process.env.TWILIO_PHONE_NUMBER?.trim());

  return NextResponse.json({
    success: true,
    data: {
      appName: APP_CONFIG.name,
      version: APP_CONFIG.version,
      activeDataSource: hasSupabaseUrl && hasSupabaseAnon ? 'Supabase PostgreSQL' : 'Local In-Memory Repository (Demo Mode)',
      integrations: {
        supabase: {
          configured: hasSupabaseUrl && hasSupabaseAnon,
          hasServiceRole: hasSupabaseService,
          status: hasSupabaseUrl && hasSupabaseAnon ? 'configured' : 'mock_fallback',
        },
        gemini: {
          configured: hasGemini,
          priority: APP_CONFIG.ai.providerOrder.indexOf('gemini') + 1,
          status: hasGemini ? 'configured' : 'unconfigured_fallback',
        },
        grok: {
          configured: hasGrok,
          priority: APP_CONFIG.ai.providerOrder.indexOf('grok') + 1,
          status: hasGrok ? 'configured' : 'unconfigured_fallback',
        },
        sms: {
          mode: APP_CONFIG.sms.mode,
          twilioConfigured: hasTwilioSid && hasTwilioAuth && hasTwilioPhone,
          status: APP_CONFIG.sms.mode === 'real' && hasTwilioSid ? 'real_delivery' : 'mock_simulation',
        },
        ivr: {
          mode: APP_CONFIG.ivr.mode,
          status: 'interactive_web_simulation',
        },
        maps: {
          mode: APP_CONFIG.maps.mode,
          status: 'standard_links',
        },
      },
    },
  });
}
