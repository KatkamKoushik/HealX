# HealX Operational Runbook & Migration Guide

**Project:** HealX — Inclusive Healthcare Navigation Platform  
**Target Environment:** Node.js 18+ / Next.js 14 / Supabase PostgreSQL  
**Document Version:** 1.0.0 (Production-Ready)

---

## 1. System Overview & Architecture Modes

HealX supports two primary operating modes:

1. **Configured Supabase Mode (Production / Staging):**
   - Active when `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`), and `DATABASE_URL` / `DIRECT_URL` are set.
   - All facilities, departments, verification records, feedback, notifications, telemetry, and audit logs are persisted in PostgreSQL.
   - Server-side user authentication is enforced through Supabase Auth cookies (`@supabase/ssr`).
   - Row-Level Security (RLS) and database triggers prevent privilege escalation.

2. **Explicit Zero-Config Demo Mode (Local Testing / Evaluation):**
   - Active when Supabase keys are omitted or when explicitly set via `DATA_STORE_MODE=demo`.
   - Uses an in-memory repository (`LocalDataStore`) seeded with standard South Indian demonstration facilities.
   - Distinct UI badge and API response tags indicate `dataSource: 'demo'`.
   - Never fabricates Supabase connection health when database credentials are not active.

---

## 2. Environment Variables Checklist

Create a `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

| Variable | Required In | Description & Format |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_NAME` | Optional | Platform title (defaults to `HealX`). |
| `NEXT_PUBLIC_DEFAULT_LANG` | Optional | Default language code (`en` or `te`). |
| `DATA_STORE_MODE` | Optional | Set to `demo` to force in-memory storage even if DB keys are set. |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Supabase project URL (`https://<project-ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | Client-safe anonymous public key for browser Auth operations. |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Backend-only service role key for administrative mutations and migrations. |
| `DATABASE_URL` | Production | Supabase Transaction Pooler connection string (`port 6543`). |
| `DIRECT_URL` | Production | Direct Supabase PostgreSQL connection string (`port 5432` or session pooler). |
| `GEMINI_API_KEY` | Production | Google Gemini API key (uses model `gemini-3.8-flash`). |
| `GROK_API_KEY` | Optional | GroqCloud or xAI Grok API key for secondary AI failover (`qwen/qwen3.8-27b`). |
| `SMS_MODE` | Optional | `mock` (masked in console/memory) or `real` (Twilio adapter). |
| `IVR_MODE` | Optional | `mock` (browser Web Audio simulation) or `real`. |

---

## 3. Database Migration & Provisioning

### Step 3.1: Execute Schema Migrations

Apply the migrations in numerical order using either the Supabase SQL Editor or a PostgreSQL client (`psql`):

1. **`supabase/migrations/001_initial_schema.sql`**
   - Creates tables: `hospitals`, `departments`, `services`, `information_sources`, `verification_records`, `feedback`, `notification_logs`, `usage_events`, `audit_logs`, `profiles`.
   - Defines constraints, foreign keys, and indexes on critical query paths (`city`, `verification_status`, `created_at`).

2. **`supabase/migrations/002_rls_policies.sql`**
   - Enables RLS on all domain tables.
   - Grants public `SELECT` on verified hospitals, departments, and services.
   - Grants public `INSERT` on feedback.
   - Enforces staff/admin access on verification records, audit logs, and notification logs.
   - Creates the `trg_prevent_role_escalation` trigger preventing non-admins from changing their role in `profiles`.

### Step 3.2: Seed Authoritative Seed Data

To seed the initial facilities into PostgreSQL idempotently:

```bash
# Verify environment variables are configured in .env.local
node scripts/seed-database.mjs
```

This populates South Indian demonstration facilities across Hyderabad, Warangal, and Nizamabad with departments, contact numbers, and verified status.

### Step 3.3: Provision Staff and Admin Users

To create the initial admin user in Supabase Auth and link the role to `public.profiles`:

```bash
node scripts/seed-auth-users.mjs
```

Default seeded evaluation credentials:
- **Admin Email:** `admin@healx.org`  
  **Password:** `DemoPass2026!`  
  **Role:** `admin`
- **Staff Email:** `staff@healx.org`  
  **Password:** `DemoPass2026!`  
  **Role:** `staff`

*Note: For new staff members in production, create them via the Supabase Auth dashboard or Admin API, then assign `role = 'staff'` in `public.profiles`.*

---

## 4. Operational Health & Diagnostics

### Monitoring Health via API

The application exposes a real-time status endpoint at `/api/status`.

```bash
curl -s http://127.0.0.1:3000/api/status | jq .
```

Expected healthy response:
```json
{
  "status": "healthy",
  "app": "HealX",
  "version": "1.0.0",
  "dataSource": "supabase",
  "databaseHealth": {
    "connected": true,
    "latencyMs": 42
  },
  "services": {
    "supabase": "connected",
    "aiWaterfall": "available",
    "sms": "operational (mock)",
    "ivr": "operational (mock)"
  }
}
```

If Supabase is unreachable or credentials are intentionally omitted, `/api/status` accurately reports:
```json
{
  "dataSource": "demo",
  "databaseHealth": {
    "connected": false
  }
}
```

---

## 5. Security & Authentication Model

### Server-Side Protection
- **Layout Guards:** [`src/app/admin/layout.tsx`](file:///sdcard/Download/mobile_projects/SFIC/src/app/admin/layout.tsx) validates the user session on the server. Unauthenticated requests trigger an HTTP 307 redirect to `/login?error=auth_required`.
- **API Endpoints:** Mutation endpoints (`POST /api/hospitals`, `PUT /api/hospitals/[id]`, `POST /api/departments`, `POST /api/hospitals/[id]/verify`, `GET /api/audit`) invoke `requireStaffOrAdmin()` or `requireAdmin()` from [`src/lib/auth/server-auth.ts`](file:///sdcard/Download/mobile_projects/SFIC/src/lib/auth/server-auth.ts).
- **Zod Validation:** All incoming mutation payloads are strictly validated before hitting the repository layer.
- **Privacy Masking:** All citizen telephone numbers are masked (`+91 98*** **321`) prior to logging.

---

## 6. Troubleshooting Common Issues

### Issue A: "Connection terminated unexpectedly" or High Latency in Supabase
- **Root Cause:** Direct PostgreSQL connections on port 5432 can exhaust connection pools in serverless environments.
- **Resolution:** Set `DATABASE_URL` to Supabase's transaction pooler (`aws-0-<region>.pooler.supabase.com:6543`), and set `DIRECT_URL` for direct DDL migrations.

### Issue B: Android / Termux `EACCES` on `@next/swc`
- **Root Cause:** Android mounts `/sdcard` with the `noexec` flag, preventing native SWC binaries from executing directly from `node_modules`.
- **Resolution:** Run `node scripts/ensure-swc.mjs`, which stages the binary into `/tmp/swc` (an executable partition) and exports `NEXT_TEST_NATIVE_DIR=/tmp/swc`.

### Issue C: Gemini API 404 Model Not Found
- **Root Cause:** Legacy model aliases like `gemini-1.5-flash` may be restricted or deprecated on newer API keys.
- **Resolution:** Use `gemini-3.8-flash` in `.env.local` (`GEMINI_MODEL=gemini-3.8-flash`). The AI waterfall will automatically fail over to Groq/Grok (`qwen/qwen3.8-27b`) if Gemini is rate-limited or unavailable.

---

## 7. Verification Checklist for Evaluators

1. **Unit & Integration Tests:**
   ```bash
   yarn test
   ```
   *Expected:* 27 passing tests (0 failures).

2. **TypeScript Compilation:**
   ```bash
   yarn typecheck
   ```
   *Expected:* Clean compilation (0 errors).

3. **Production Build:**
   ```bash
   yarn build
   ```
   *Expected:* Static generation of all 29 routes.
