/**
 * AI Healthcare Navigation Service: Waterfall Orchestrator
 * Priority Pipeline: Gemini -> Grok/Groq -> Deterministic Directory Fallback
 * Implements timeout limits, circuit breaking, grounded retrieval, and zero-diagnostic constraints.
 */

import APP_CONFIG from '@/config/app-config';
import { getDataStore } from '@/lib/repository/data-store';
import { Hospital } from '@/types/database';
import { cleanEnv } from '../utils/env';

export interface AiSourceCitation {
  label: string;
  recordId: string;
}

export interface AiNavigationResponse {
  answer: string;
  language: 'en' | 'te';
  sources: AiSourceCitation[];
  disclaimer: string;
  requestId: string;
  providerUsed: 'gemini' | 'grok' | 'fallback';
  fallbackTriggered: boolean;
  modelName?: string;
  latencyMs: number;
}

interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'unconfigured' | 'cooldown';
  consecutiveFailures: number;
  lastFailureTime: number | null;
  lastErrorMessage: string | null;
}

export class AiWaterfallService {
  private static instance: AiWaterfallService;
  private providerHealth: Record<'gemini' | 'grok', ProviderHealth> = {
    gemini: { status: 'healthy', consecutiveFailures: 0, lastFailureTime: null, lastErrorMessage: null },
    grok: { status: 'healthy', consecutiveFailures: 0, lastFailureTime: null, lastErrorMessage: null },
  };

  private readonly cooldownPeriodMs = 60000; // 1 minute cooldown after repeated failures

  public constructor() {
    this.refreshProviderConfigStatus();
  }

  public static getInstance(): AiWaterfallService {
    if (!AiWaterfallService.instance) {
      AiWaterfallService.instance = new AiWaterfallService();
    }
    return AiWaterfallService.instance;
  }

  public getProviderStatus() {
    this.refreshProviderConfigStatus();
    return {
      gemini: { ...this.providerHealth.gemini, configured: Boolean(cleanEnv(process.env.GEMINI_API_KEY)) },
      grok: { ...this.providerHealth.grok, configured: Boolean(cleanEnv(process.env.GROK_API_KEY)) },
      order: APP_CONFIG.ai.providerOrder,
      timeoutMs: APP_CONFIG.ai.timeoutMs,
      maxRetries: APP_CONFIG.ai.maxRetries,
    };
  }

  private refreshProviderConfigStatus() {
    const hasGemini = Boolean(cleanEnv(process.env.GEMINI_API_KEY));
    const hasGrok = Boolean(cleanEnv(process.env.GROK_API_KEY));

    if (!hasGemini && this.providerHealth.gemini.status !== 'cooldown') {
      this.providerHealth.gemini.status = 'unconfigured';
    }
    if (!hasGrok && this.providerHealth.grok.status !== 'cooldown') {
      this.providerHealth.grok.status = 'unconfigured';
    }
  }

  public isProviderInCooldown(provider: 'gemini' | 'grok'): boolean {
    const health = this.providerHealth[provider];
    if (health.status === 'cooldown' && health.lastFailureTime) {
      if (Date.now() - health.lastFailureTime > this.cooldownPeriodMs) {
        health.status = 'healthy';
        health.consecutiveFailures = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  public recordSuccess(provider: 'gemini' | 'grok') {
    this.providerHealth[provider].status = 'healthy';
    this.providerHealth[provider].consecutiveFailures = 0;
    this.providerHealth[provider].lastErrorMessage = null;
  }

  public recordFailure(provider: 'gemini' | 'grok', errorMsg: string, isPermanent = false) {
    const health = this.providerHealth[provider];
    health.consecutiveFailures += 1;
    health.lastFailureTime = Date.now();
    health.lastErrorMessage = errorMsg;

    if (isPermanent || health.consecutiveFailures >= 3) {
      health.status = 'cooldown';
    } else {
      health.status = 'degraded';
    }
  }

  public async askNavigationAssistant(
    userQuery: string,
    language: 'en' | 'te' = 'en'
  ): Promise<AiNavigationResponse> {
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Retrieve grounded directory records for context
    const dataStore = getDataStore();
    const allHospitals = await dataStore.getHospitals({ activeOnly: true });
    const relevantHospitals = this.filterRelevantDirectory(userQuery, allHospitals);

    const citations: AiSourceCitation[] = relevantHospitals.slice(0, 3).map((h) => ({
      label: h.name,
      recordId: h.id,
    }));

    // Check if AI mode is disabled
    if (APP_CONFIG.ai.mode === 'disabled') {
      return this.generateDeterministicFallback(
        userQuery,
        relevantHospitals,
        language,
        requestId,
        startTime,
        'AI Navigation mode is currently disabled in configuration.'
      );
    }

    const providerOrder = APP_CONFIG.ai.providerOrder;
    let fallbackTriggered = false;

    // 2. Iterate through configured providers
    for (const provider of providerOrder) {
      if (provider === 'gemini') {
        const geminiKey = cleanEnv(process.env.GEMINI_API_KEY);
        if (!geminiKey || this.isProviderInCooldown('gemini')) {
          fallbackTriggered = true;
          continue;
        }

        try {
          const configuredModel = cleanEnv(process.env.GEMINI_MODEL);
          const modelName = configuredModel || 'gemini-flash-lite-latest';
          const answer = await this.callGemini(userQuery, relevantHospitals, language, geminiKey, modelName);
          this.recordSuccess('gemini');
          return {
            answer,
            language,
            sources: citations,
            disclaimer: APP_CONFIG.disclaimer,
            requestId,
            providerUsed: 'gemini',
            fallbackTriggered,
            modelName,
            latencyMs: Date.now() - startTime,
          };
        } catch (err: unknown) {
          fallbackTriggered = true;
          const msg = err instanceof Error ? err.message : 'Gemini error';
          const isPermanent = msg.includes('401') || msg.includes('403') || msg.includes('API_KEY_INVALID');
          this.recordFailure('gemini', msg, isPermanent);
          // Failover to next provider
        }
      }

      if (provider === 'grok') {
        const grokKey = cleanEnv(process.env.GROK_API_KEY);
        if (!grokKey || this.isProviderInCooldown('grok')) {
          fallbackTriggered = true;
          continue;
        }

        try {
          const isGroq = grokKey.startsWith('gsk_');
          const defaultModel = isGroq ? 'qwen/qwen3.8-27b' : 'grok-beta';
          const configuredModel = cleanEnv(process.env.GROK_MODEL);
          const modelName = configuredModel || defaultModel;

          const answer = await this.callGrok(userQuery, relevantHospitals, language, grokKey, modelName, isGroq);
          this.recordSuccess('grok');
          return {
            answer,
            language,
            sources: citations,
            disclaimer: APP_CONFIG.disclaimer,
            requestId,
            providerUsed: 'grok',
            fallbackTriggered: true,
            modelName,
            latencyMs: Date.now() - startTime,
          };
        } catch (err: unknown) {
          fallbackTriggered = true;
          const msg = err instanceof Error ? err.message : 'Grok error';
          const isPermanent = msg.includes('401') || msg.includes('403');
          this.recordFailure('grok', msg, isPermanent);
          // Failover to deterministic fallback
        }
      }
    }

    // 3. Deterministic Directory Fallback (Offline-ready, grounded citations)
    return this.generateDeterministicFallback(
      userQuery,
      relevantHospitals,
      language,
      requestId,
      startTime,
      fallbackTriggered
        ? 'AI providers were unavailable or unconfigured. Grounded directory records retrieved directly.'
        : undefined
    );
  }

  public filterRelevantDirectory(query: string, hospitals: Hospital[]): Hospital[] {
    const q = query.toLowerCase();
    const scored = hospitals.map((h) => {
      let score = 0;
      if (q.includes(h.city.toLowerCase())) score += 5;
      if (q.includes(h.locality.toLowerCase())) score += 3;
      if (h.departments?.some((d) => q.includes(d.name.toLowerCase()))) score += 4;
      if (q.includes('emergency') && h.emergency_information) score += 3;
      if (h.name.toLowerCase().split(' ').some((word) => q.includes(word))) score += 2;
      return { hospital: h, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.filter((s) => s.score > 0).map((s) => s.hospital);
    return top.length > 0 ? top : hospitals.slice(0, 3);
  }

  public constructSystemPrompt(hospitals: Hospital[], language: 'en' | 'te'): string {
    const directoryContext = hospitals
      .map(
        (h) => `
Hospital: ${h.name}
City/Locality: ${h.locality}, ${h.city}, ${h.state}
Address: ${h.address} (PIN: ${h.postal_code})
Phone: ${h.phone || 'Not available'}
Operating Hours: ${h.operating_hours || 'Standard public hours'}
Emergency Services: ${h.emergency_information || 'Standard casualty ward'}
Verification Status: ${h.verification_status}
Departments Available: ${h.departments?.map((d) => d.name).join(', ') || 'General medicine'}
`
      )
      .join('\n---\n');

    const langInstruction =
      language === 'te'
        ? 'CRITICAL: Respond completely in clean, natural Telugu script (తెలుగు), but preserve official hospital names, addresses, and telephone numbers clearly without garbling them.'
        : 'Respond in clear, professional English.';

    return `You are the AI Healthcare Navigation Assistant for ${APP_CONFIG.name}.
Your duty is exclusively to help citizens find healthcare facilities, departments, contact details, operating hours, and directions based on the verified directory records provided below.

GROUNDING DIRECTORY CONTEXT:
${directoryContext}

STRICT SAFETY AND CLINICAL BOUNDARIES:
1. You are a NAVIGATION assistant, NOT a doctor or clinician.
2. NEVER diagnose illnesses, interpret medical symptoms, or speculate on conditions.
3. NEVER prescribe drugs, suggest medication dosages, or recommend home remedies.
4. If the user describes acute emergencies (chest pain, severe bleeding, stroke symptoms, loss of consciousness), immediately advise them to call 108 or 112 or proceed to the nearest emergency ward immediately.
5. Ground your answers ONLY in the directory records provided above. Never invent doctors, phone numbers, or non-existent hospitals.
6. Clearly mention if a hospital is verified or marked as sample data.
7. ${langInstruction}
`;
  }

  public async callGemini(
    query: string,
    hospitals: Hospital[],
    language: 'en' | 'te',
    apiKey: string,
    modelName = 'gemini-flash-lite-latest'
  ): Promise<string> {
    const cleanKey = cleanEnv(apiKey);
    const systemPrompt = this.constructSystemPrompt(hospitals, language);
    const timeoutMs = Math.min(APP_CONFIG.ai.timeoutMs, 6000);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Pass clean API key via both URL query and header for complete compatibility
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nCitizen Query: "${query}"` }],
          },
        ],
        generationConfig: {
          maxOutputTokens: APP_CONFIG.ai.maxOutputTokens,
          temperature: 0.2, // low temperature for grounded facts
        },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API Error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Gemini returned an empty candidate response.');
      }
      return text.trim();
    } finally {
      clearTimeout(timeout);
    }
  }

  public async callGrok(
    query: string,
    hospitals: Hospital[],
    language: 'en' | 'te',
    apiKey: string,
    modelName = 'qwen/qwen3.8-27b',
    isGroq = false
  ): Promise<string> {
    const cleanKey = cleanEnv(apiKey).replace(/^Bearer\s+/i, '');
    const systemPrompt = this.constructSystemPrompt(hospitals, language);
    const timeoutMs = Math.min(APP_CONFIG.ai.timeoutMs, 6000);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const endpoint = isGroq
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.x.ai/v1/chat/completions';

      const payload = {
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        max_tokens: APP_CONFIG.ai.maxOutputTokens,
        temperature: 0.2,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cleanKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Grok API Error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('Grok returned an empty response.');
      }
      return text.trim();
    } finally {
      clearTimeout(timeout);
    }
  }

  public generateDeterministicFallback(
    query: string,
    hospitals: Hospital[],
    language: 'en' | 'te',
    requestId: string,
    startTime: number,
    note?: string
  ): AiNavigationResponse {
    const citations: AiSourceCitation[] = hospitals.slice(0, 3).map((h) => ({
      label: h.name,
      recordId: h.id,
    }));

    let answer = '';
    if (language === 'te') {
      const hospitalList = hospitals
        .slice(0, 3)
        .map(
          (h, i) =>
            `${i + 1}. **${h.name}**\n   - **ప్రాంతం:** ${h.locality}, ${h.city}\n   - **ఫోన్:** ${
              h.phone || 'లభ్యం కాలేదు'
            }\n   - **అత్యవసర విభాగం:** ${h.emergency_information || '24 గంటల క్యాజువాలిటీ'}\n   - **స్థితి:** ${
              h.verification_status === 'verified' ? 'ధృవీకరించబడింది' : 'నమూనా సమాచారం'
            }`
        )
        .join('\n\n');

      answer = `మీ శోధనకు సంబంధించిన ఆసుపత్రుల వివరాలు ఇక్కడ ఉన్నాయి:\n\n${hospitalList}\n\nదయచేసి గమనించండి: అత్యవసర సమయాల్లో వెంటనే 108 లేదా 112 కు కాల్ చేయండి. పూర్తి వివరాల కోసం పైన ఉన్న లింక్‌లను చూడవచ్చు.`;
    } else {
      const hospitalList = hospitals
        .slice(0, 3)
        .map(
          (h, i) =>
            `${i + 1}. **${h.name}**\n   - **Location:** ${h.locality}, ${h.city}\n   - **Contact:** ${
              h.phone || 'Not available'
            }\n   - **Emergency:** ${h.emergency_information || 'Standard casualty ward'}\n   - **Status:** ${
              h.verification_status === 'verified' ? 'Verified' : 'Sample Demonstration Record'
            }`
        )
        .join('\n\n');

      answer = `Here are the relevant facilities matching your query from our directory:\n\n${hospitalList}\n\n*Important Safety Reminder:* This platform provides facility navigation only and cannot provide medical diagnoses. For medical emergencies, dial 108 or 112 immediately.`;
    }

    if (note) {
      answer += `\n\n*(System Note: ${note})*`;
    }

    return {
      answer,
      language,
      sources: citations,
      disclaimer: APP_CONFIG.disclaimer,
      requestId,
      providerUsed: 'fallback',
      fallbackTriggered: true,
      latencyMs: Date.now() - startTime,
    };
  }
}

export function getAiService(): AiWaterfallService {
  return AiWaterfallService.getInstance();
}
