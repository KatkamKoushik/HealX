import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getAiService } from '../src/lib/ai/ai-service';

describe('AI Waterfall Service & Failover Pipeline', () => {
  it('falls back gracefully to deterministic directory results when keys are absent', async () => {
    const origGemini = process.env.GEMINI_API_KEY;
    const origGrok = process.env.GROK_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROK_API_KEY;

    try {
      const aiService = getAiService();
      const result = await aiService.askNavigationAssistant('Find hospitals in Hyderabad', 'en');

      assert.ok(result !== undefined);
      assert.strictEqual(result.providerUsed, 'fallback');
      assert.strictEqual(result.fallbackTriggered, true);
      assert.ok(result.answer.includes('Hyderabad'));
      assert.ok(result.sources.length > 0);
      assert.ok(result.disclaimer !== undefined);
      assert.ok(result.requestId !== undefined);
    } finally {
      if (origGemini) process.env.GEMINI_API_KEY = origGemini;
      if (origGrok) process.env.GROK_API_KEY = origGrok;
    }
  });

  it('returns Telugu output when language is set to "te"', async () => {
    const origGemini = process.env.GEMINI_API_KEY;
    const origGrok = process.env.GROK_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROK_API_KEY;

    try {
      const aiService = getAiService();
      const result = await aiService.askNavigationAssistant('విజయవాడలో ఆసుపత్రులు', 'te');

      assert.ok(result !== undefined);
      assert.strictEqual(result.language, 'te');
      assert.ok(result.answer.includes('ఆసుపత్రుల వివరాలు'));
      assert.strictEqual(result.providerUsed, 'fallback');
    } finally {
      if (origGemini) process.env.GEMINI_API_KEY = origGemini;
      if (origGrok) process.env.GROK_API_KEY = origGrok;
    }
  });

  it('triggers Grok failover when Gemini throws rate limit HTTP 429', async () => {
    const origGemini = process.env.GEMINI_API_KEY;
    const origGrok = process.env.GROK_API_KEY;
    const originalFetch = global.fetch;

    process.env.GEMINI_API_KEY = 'mock-gemini-key';
    process.env.GROK_API_KEY = 'mock-grok-key';

    // Mock fetch: Gemini fails with 429; Grok succeeds
    global.fetch = (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes('generativelanguage.googleapis.com')) {
        return Promise.resolve(new Response('Resource exhausted / Rate limit exceeded', { status: 429 }));
      }
      if (urlStr.includes('api.x.ai')) {
        return Promise.resolve(new Response(JSON.stringify({
          choices: [
            {
              message: {
                content: 'Grok Answer: Charminar Hospital has 24/7 emergency care in Hyderabad.',
              },
            },
          ],
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return Promise.reject(new Error('Unknown URL'));
    };

    try {
      const aiService = getAiService();
      const result = await aiService.askNavigationAssistant('Emergency in Hyderabad', 'en');

      assert.strictEqual(result.providerUsed, 'grok');
      assert.strictEqual(result.fallbackTriggered, true);
      assert.ok(result.answer.includes('Grok Answer'));
    } finally {
      global.fetch = originalFetch;
      if (origGemini) process.env.GEMINI_API_KEY = origGemini; else delete process.env.GEMINI_API_KEY;
      if (origGrok) process.env.GROK_API_KEY = origGrok; else delete process.env.GROK_API_KEY;
    }
  });

  it('falls back to deterministic directory when both Gemini and Grok fail', async () => {
    const origGemini = process.env.GEMINI_API_KEY;
    const origGrok = process.env.GROK_API_KEY;
    const originalFetch = global.fetch;

    process.env.GEMINI_API_KEY = 'mock-gemini-key';
    process.env.GROK_API_KEY = 'mock-grok-key';

    // Mock fetch: both fail
    global.fetch = () => {
      return Promise.resolve(new Response('Service Unavailable', { status: 503 }));
    };

    try {
      const aiService = getAiService();
      const result = await aiService.askNavigationAssistant('Cardiology departments', 'en');

      assert.strictEqual(result.providerUsed, 'fallback');
      assert.strictEqual(result.fallbackTriggered, true);
      assert.ok(result.answer.includes('relevant facilities matching your query'));
      assert.ok(result.sources.length > 0);
    } finally {
      global.fetch = originalFetch;
      if (origGemini) process.env.GEMINI_API_KEY = origGemini; else delete process.env.GEMINI_API_KEY;
      if (origGrok) process.env.GROK_API_KEY = origGrok; else delete process.env.GROK_API_KEY;
    }
  });

  it('reports provider health configuration without exposing actual API keys', () => {
    const origGemini = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'secret-test-key-12345';
    try {
      const aiService = getAiService();
      const status = aiService.getProviderStatus();

      assert.strictEqual(status.gemini.configured, true);
      // Ensure raw key is nowhere in status
      const statusString = JSON.stringify(status);
      assert.ok(!statusString.includes('secret-test-key-12345'));
    } finally {
      if (origGemini) process.env.GEMINI_API_KEY = origGemini; else delete process.env.GEMINI_API_KEY;
    }
  });
});
