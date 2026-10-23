# HealX — System Architecture & Technical Specifications
## Inclusive Healthcare Navigation Platform (SFIC Level 3 • Theme 3: Swasth & Samavesh Bharat)

---

### 1. Architectural Model & Monolith Structure
HealX is built as a high-performance modular Next.js 14 App Router application engineered for reliability, multilingual accessibility, and strict security boundaries.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Presentation & Interaction Layer                      │
│   • Bilingual Interface (English & Telugu with Unicode native typography)   │
│   • Accessibility Controls (Web Speech TTS, Font Scaling 100%-130%, A11y)  │
│   • Mobile Responsive Shell (Evaluator walkthrough, directory, admin)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    Application & Security Perimeter                         │
│   • Server Session Verification (Supabase Auth & HttpOnly Cookies)          │
│   • Role-Based Access Control (RBAC: Admin vs Staff vs Citizen)             │
│   • API Request Validation (Zod schemas for all mutations & queries)        │
│   • PII Masking & Safe Audit Logging (Phone masking, zero secret logs)       │
└──────────────────┬───────────────────┬───────────────────┬──────────────────┘
                   │                   │                   │
┌──────────────────▼───┐ ┌─────────────▼─────┐ ┌───────────▼──────────────────┐
│  Grounded AI Service │ │Telephony Simulator│ │ Data Repository Abstraction  │
│ • Gemini 3.8 Flash   │ │ • Simulated SMS   │ │ • IDataRepository Interface  │
│ • Groq / Grok Engine │ │ • Twilio Adapter  │ │ • SupabaseDataStore (Postgres│
│ • Offline Determinism│ │ • Interactive IVR │ │ • LocalDataStore (Demo Mode) │
└──────────────────────┘ └───────────────────┘ └──────────────────────────────┘
```

---

### 2. Data Access Layer & Dual Store Architecture
The repository layer decouples business logic from the underlying storage mechanism via `IDataRepository`:

1. **`SupabaseDataStore` (Production & Configured Environments):**
   - Direct connection pooling via `postgres` client to Supabase PostgreSQL (PostgreSQL 17+).
   - Relational joins, transactions, and explicit pagination (`SELECT ... LIMIT ... OFFSET ...`).
   - Hardened with Row Level Security (RLS) policies and privilege escalation prevention triggers.
   - Real database writes and reads for hospitals, departments, services, sources, feedback, notifications, and audit logs.

2. **`LocalDataStore` (Zero-Config Evaluation & Demo Mode):**
   - In-memory implementation of `IDataRepository` pre-populated from authoritative seed data.
   - Operates offline or in environments without external credentials.
   - Explicitly reports `dataSource: 'demo'` and `isSampleBaseline: true`.
   - Never fabricates storage in Supabase when operating in local demo mode.

---

### 3. Authentication & Role-Based Authorization
- **Authentication Service:** Real Supabase GoTrue Auth with server-verified sessions via `@supabase/ssr`.
- **Role Model:**
  - `admin`: Full administrative privileges (manage staff, view raw audit logs, alter system configuration, mutate directory records).
  - `staff`: Operational privileges (conduct data verification surveys, update department details, dispatch notifications).
  - `patient` / anonymous: Public read-only access to active directory records and public feedback submission.
- **Privilege Escalation Prevention:**
  - Database-level trigger `trg_prevent_role_escalation` on `public.profiles` prevents non-administrators from altering their role field during profile updates.
  - Server-side helpers `requireStaffOrAdmin()` and `requireAdmin()` guard all mutating API endpoints, returning HTTP 401 for unauthenticated requests and HTTP 403 for unauthorized roles.

---

### 4. Grounded AI Waterfall Engine
The natural language assistant (`/api/assistant`) operates on a three-tier resilience waterfall:

1. **Tier 1 — Google Gemini (Primary):**
   - Model: `gemini-3.8-flash` (or configured via `GEMINI_MODEL`).
   - Authentication: Header-based via `x-goog-api-key` (preventing credential leakage in URLs or logs).
   - Grounding: Dynamic directory context injection with strict non-diagnostic clinical boundaries.

2. **Tier 2 — Groq / xAI Grok (Secondary Failover):**
   - Automatically triggered if Tier 1 encounters HTTP 429 rate limits, network timeouts (12s), or temporary 5xx errors.
   - Supports GroqCloud (`gsk_...` via `api.groq.com/openai/v1/chat/completions`) and xAI (`xai-...` via `api.x.ai/v1/chat/completions`).

3. **Tier 3 — Deterministic Directory Fallback (Offline Fallback):**
   - If both providers fail or are unconfigured, local directory records matching the user query are formatted into clear markdown cards with citations and 108/112 emergency routing.
   - Guaranteed 100% uptime with zero crashes from missing external API keys.

---

### 5. Telephony & Notification Architecture
- **Operational Modes:**
  - `mock`: Default demonstration mode. Generates realistic notification payloads, masks recipient telephone numbers (`+91-98XXX-XX102`), and logs dispatches as `mode: 'simulated'`.
  - `real`: Dispatches live SMS alerts via Twilio REST API when `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are configured. Never fabricates success if a network dispatch fails.
- **IVR Simulator:**
  - Interactive telephone tree simulator replicating keypad DTMF tones, bilingual audio voice prompts (English & Telugu), and triage for casualty departments.

---

### 6. Security & Privacy Guarantees
- **No Secret Exposure:** Zero API keys, passwords, or tokens in browser bundles or client-facing responses.
- **Data Minimization:** No personal health information (PHI) or private medical queries are persisted in audit logs.
- **Input Sanitization:** Strict Zod schema validation across all API route handlers, rejecting oversized payloads to mitigate prompt injection.
