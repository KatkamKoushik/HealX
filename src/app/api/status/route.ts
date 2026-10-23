/**
 * API Route: /api/status
 * GET: System health and external integration status.
 * Never exposes secrets, keys, or token fragments.
 * Accurately verifies actual database connectivity.
 */

import { NextResponse } from 'next/server';
import APP_CONFIG from '@/config/app-config';
import { getDataStore } from '@/lib/repository/data-store';
import { getAiService } from '@/lib/ai/ai-service';

export async function GET() {
  const store = getDataStore();
  const dbHealth = await store.checkHealth();
  const aiService = getAiService();
  const aiStatus = aiService.getProviderStatus();

  const hasTwilioSid = Boolean(process.env.TWILIO_ACCOUNT_SID?.trim());
  const hasTwilioAuth = Boolean(process.env.TWILIO_AUTH_TOKEN?.trim());
  const hasTwilioPhone = Boolean(process.env.TWILIO_PHONE_NUMBER?.trim());

  return NextResponse.json({
    success: true,
    data: {
      appName: APP_CONFIG.name,
      version: APP_CONFIG.version,
      uptimeSeconds: Math.floor(process.uptime()),
      activeDataSource: store.getDataSourceType() === 'supabase' ? 'Supabase PostgreSQL' : 'Local In-Memory Repository (Demo Mode)',
      dataSourceType: store.getDataSourceType(),
      databaseHealth: {
        connected: dbHealth.healthy,
        message: dbHealth.message,
      },
      integrations: {
        database: {
          type: store.getDataSourceType(),
          status: dbHealth.healthy ? 'healthy' : 'degraded',
          message: dbHealth.message,
        },
        gemini: {
          configured: aiStatus.gemini.configured,
          priority: APP_CONFIG.ai.providerOrder.indexOf('gemini') + 1,
          status: aiStatus.gemini.configured
            ? aiStatus.gemini.status === 'cooldown'
              ? 'cooldown'
              : 'configured'
            : 'unconfigured_fallback',
        },
        grok: {
          configured: aiStatus.grok.configured,
          priority: APP_CONFIG.ai.providerOrder.indexOf('grok') + 1,
          status: aiStatus.grok.configured
            ? aiStatus.grok.status === 'cooldown'
              ? 'cooldown'
              : 'configured'
            : 'unconfigured_fallback',
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
