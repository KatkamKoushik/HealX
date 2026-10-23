/**
 * SFIC Application Configuration
 * Centralized settings for branding, external services, and feature modes.
 * Primary name: HealX (configurable via NEXT_PUBLIC_APP_NAME).
 */

export type AppName = 'HealX' | 'MediFlow' | 'Healix' | 'ResQ 2.0';

export interface AppConfig {
  name: AppName;
  tagline: string;
  description: string;
  disclaimer: string;
  fictionalDataNotice: string;
  version: string;
  defaultLanguage: 'en' | 'te';
  supportedLanguages: Array<{ code: 'en' | 'te'; name: string; nativeName: string }>;
  ai: {
    mode: 'enabled' | 'disabled';
    providerOrder: Array<'gemini' | 'grok'>;
    timeoutMs: number;
    maxRetries: number;
    maxOutputTokens: number;
  };
  sms: {
    mode: 'mock' | 'real';
  };
  ivr: {
    mode: 'mock' | 'real';
  };
  maps: {
    mode: 'links';
  };
}

const resolveAppName = (): AppName => {
  const envName = process.env.NEXT_PUBLIC_APP_NAME?.trim();
  if (envName === 'HealX' || envName === 'Healix' || envName === 'ResQ 2.0' || envName === 'MediFlow') {
    return envName as AppName;
  }
  return 'HealX';
};

const appName = resolveAppName();

export const APP_CONFIG: AppConfig = {
  name: appName,
  tagline: 'Swasth & Samavesh Bharat — Accessible, Multilingual Healthcare Navigation',
  description:
    'An inclusive healthcare navigation platform that helps people find relevant hospital and department information through an accessible, multilingual digital experience, with optional voice, SMS, and AI-assisted navigation.',
  disclaimer:
    'Demonstration prototype developed for Seva First Innovation Challenge (SFIC) Level 3: Swasth & Samavesh Bharat. This application is not an official government platform, a certified medical product, or an officially partnered hospital network. Information provided is for navigational demonstration purposes only.',
  fictionalDataNotice:
    'Sample data — not independently verified. Seeded records represent simulated healthcare facilities for demonstration purposes.',
  version: '1.0.0-sfic.l3',
  defaultLanguage: 'en',
  supportedLanguages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  ],
  ai: {
    mode: (process.env.AI_MODE as 'enabled' | 'disabled') || 'enabled',
    providerOrder: (process.env.AI_PROVIDER_ORDER?.split(',').map((p) => p.trim()) as Array<'gemini' | 'grok'>) || [
      'gemini',
      'grok',
    ],
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '12000', 10),
    maxRetries: parseInt(process.env.AI_MAX_RETRIES_PER_PROVIDER || '1', 10),
    maxOutputTokens: parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '800', 10),
  },
  sms: {
    mode: (process.env.SMS_MODE as 'mock' | 'real') || 'mock',
  },
  ivr: {
    mode: (process.env.IVR_MODE as 'mock' | 'real') || 'mock',
  },
  maps: {
    mode: 'links',
  },
};

export default APP_CONFIG;
