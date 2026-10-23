import { describe, it } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';

describe('Validation Schemas & Guardrails', () => {
  const FeedbackSchema = z.object({
    category: z.enum(['general', 'navigation', 'data_accuracy', 'accessibility', 'language']),
    rating: z.number().int().min(1).max(5),
    message: z.string().max(800).optional().nullable(),
    preferred_language: z.enum(['en', 'te']).default('en'),
  });

  const AssistantQuerySchema = z.object({
    query: z.string().min(2).max(400),
    language: z.enum(['en', 'te']).default('en'),
  });

  it('validates proper citizen feedback submissions', () => {
    const valid = FeedbackSchema.safeParse({
      category: 'accessibility',
      rating: 5,
      message: 'Great contrast and voice features.',
      preferred_language: 'en',
    });
    assert.strictEqual(valid.success, true);
  });

  it('rejects feedback ratings outside 1 to 5', () => {
    const invalid = FeedbackSchema.safeParse({
      category: 'general',
      rating: 7,
      preferred_language: 'en',
    });
    assert.strictEqual(invalid.success, false);
  });

  it('rejects overly long assistant queries to avoid prompt injection', () => {
    const longQuery = 'A'.repeat(500);
    const result = AssistantQuerySchema.safeParse({
      query: longQuery,
      language: 'en',
    });
    assert.strictEqual(result.success, false);
  });

  it('accepts valid navigation queries', () => {
    const result = AssistantQuerySchema.safeParse({
      query: 'Find pediatric emergency in Hyderabad',
      language: 'en',
    });
    assert.strictEqual(result.success, true);
  });
});
