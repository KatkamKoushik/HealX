/**
 * Environment Variable Sanitization Utility
 * Automatically cleans leading/trailing whitespace, wrapping single/double quotes,
 * and carriage returns introduced when copying configurations into cloud dashboards (e.g. Vercel).
 */

export function cleanEnv(value?: string | null): string {
  if (!value) return '';
  let cleaned = value.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned.replace(/\r/g, '');
}
