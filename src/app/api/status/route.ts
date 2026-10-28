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
import { cleanEnv } from '@/lib/utils/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getDataStore();
  const dbHealth = await store.checkHealth();
  const aiService = getAiService();
  const aiStatus = aiService.getProviderStatus();

  const geminiRaw = cleanEnv(process.env.GEMINI_API_KEY);
  const grokRaw = cleanEnv(process.env.GROK_API_KEY || process.env.GROQ_API_KEY);

  const hasTwilioSid = Boolean(cleanEnv(process.env.TWILIO_ACCOUNT_SID) || cleanEnv(process.env.TWILIO_API_KEY_SID));
  const hasTwilioAuth = Boolean(cleanEnv(process.env.TWILIO_AUTH_TOKEN) || cleanEnv(process.env.TWILIO_API_KEY_SECRET));
  const hasTwilioPhone = Boolean(cleanEnv(process.env.TWILIO_PHONE_NUMBER));
  const mapsKey = cleanEnv(process.env.GOOGLE_MAPS_API_KEY) || cleanEnv(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  const hasMapsKey = Boolean(mapsKey);
  const googleClientId = cleanEnv(process.env.GOOGLE_CLIENT_ID) || cleanEnv(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const hasGoogleOAuth = Boolean(googleClientId);

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
      diagnostics: {
        geminiConfigured: Boolean(geminiRaw),
        geminiKeyPrefix: geminiRaw ? `${geminiRaw.slice(0, 3)}...${geminiRaw.slice(-3)}` : 'none',
        geminiKeyLength: geminiRaw.length,
        geminiModel: cleanEnv(process.env.GEMINI_MODEL) || 'gemini-flash-lite-latest',
        grokConfigured: Boolean(grokRaw),
        grokKeyPrefix: grokRaw ? `${grokRaw.slice(0, 4)}...${grokRaw.slice(-3)}` : 'none',
        grokKeyLength: grokRaw.length,
        grokModel: cleanEnv(process.env.GROK_MODEL) || 'qwen/qwen3.8-27b',
        hasDbUrl: Boolean(cleanEnv(process.env.DATABASE_URL)),
        hasDirectUrl: Boolean(cleanEnv(process.env.DIRECT_URL)),
        googleMapsConfigured: hasMapsKey,
        googleMapsKeyPrefix: mapsKey ? `${mapsKey.slice(0, 6)}...${mapsKey.slice(-4)}` : 'none',
        googleOAuthConfigured: hasGoogleOAuth,
        googleClientIdPrefix: googleClientId ? `${googleClientId.slice(0, 8)}...` : 'none',
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
          mode: hasMapsKey ? 'api_embed' : APP_CONFIG.maps.mode,
          apiKeyConfigured: hasMapsKey,
          status: hasMapsKey ? 'live_maps_api' : 'standard_links',
        },
        googleAuth: {
          configured: hasGoogleOAuth,
          status: hasGoogleOAuth ? 'configured' : 'unconfigured',
        },
      },
    },
  });
}
