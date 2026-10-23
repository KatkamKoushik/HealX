# HealX — Inclusive Healthcare Navigation Platform

**Seva First Innovation Challenge (SFIC) • South Zone • Level 3**  
**Theme 3: Swasth & Samavesh Bharat**

---

### Project Notice & Scope
> **Demonstration Prototype Notice:**  
> HealX is an engineering prototype developed for the **Seva First Innovation Challenge (SFIC) Level 3**. It is intended strictly for healthcare facility discovery, clinical department navigation, and accessibility demonstration. It does not provide medical diagnoses, emergency dispatch, or official government health record integration. Facility records included in the default distribution represent simulated sample data across South India.

---

## 1. Overview & Core Features

HealX addresses the challenge of navigating public and private healthcare facilities by combining accessible web design, multilingual interfaces, resilient AI-assisted search, and structured facility verification.

| Feature Area | Description & Current Capability | Implementation Architecture |
| :--- | :--- | :--- |
| **Multilingual Support** | Complete bilingual UI support for **English (`en`)** and **Telugu (`te`)** with instant switching and persistent client preference. | Context-driven dictionary translations (`src/lib/i18n`) |
| **Accessibility** | Native Text-to-Speech (TTS) via Web Speech API, variable typography scaling (100%–130%), and high-contrast display mode. | Native browser Web Speech API & Tailwind CSS |
| **Assisted Navigation** | Three-tier waterfall navigation: Google Gemini 3.8 Flash &rarr; Groq / xAI Grok &rarr; Deterministic local directory search with grounded citations. | Multi-provider streaming HTTP service (`src/lib/ai`) |
| **Facility Verification** | Structured 4-tier status lifecycle (*Verified*, *Needs Review*, *Unverified*, *Inactive*) with audit records, verification logs, and reviewer notes. | Supabase PostgreSQL with direct connection pooling or in-memory demo store |
| **Server-Side Security** | Real Supabase Auth session verification (`@supabase/ssr`), Role-Based Access Control (RBAC: `staff`, `admin`), and database triggers preventing role escalation. | Server Component Layout guards & API authorization helpers |
| **Telephony Simulation** | Interactive telephone keypad (IVR) audio simulator and SMS notification dispatcher with masked citizen phone numbers (`+91 98*** **321`). | Web Audio API / Twilio REST Adapter |
| **Observability & Health** | Real-time diagnostics endpoint (`/api/status`), telemetry tracking, and administrative review metrics derived directly from database records. | Relational database aggregation & Recharts dashboard |

---

## 2. Architecture & Design Principles

```
┌─────────────────────────────────────────────────────────────┐
│                       HealX Web UI                          │
│     (Next.js 14 App Router, TypeScript, Tailwind CSS)       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐  ┌───────────────────────────┐
│       AI Navigation API      │  │     Data Access Layer     │
│  Gemini 3.8 → Groq → Local   │  │   Supabase Postgres /     │
│      Grounded Citations      │  │   In-Memory Demo Store    │
└──────────────────────────────┘  └───────────────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐  ┌───────────────────────────┐
│   Telephony & Notification   │  │   Auth, RLS & Security    │
│  Masked SMS & IVR Simulator  │  │ Supabase Auth, RBAC,      │
│     (Twilio or Mock Mode)    │  │ Escalation-Guard Trigger  │
└──────────────────────────────┘  └───────────────────────────┘
```

- **Dual-Mode Data Architecture:** When database credentials are provided, HealX operates as a live Supabase PostgreSQL application. In offline or evaluation environments, it operates in explicit zero-config Demo Mode with an in-memory repository and clear visual indicators.
- **Failover Waterfall:** AI navigation prioritizes grounded directory queries. If the primary provider experiences rate limits or network latency, the service automatically fails over without failing the user's request.
- **Privacy by Default:** Citizen phone numbers are masked in audit records and mock message outputs.

---

## 3. Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5 (Strict Mode enabled)
- **Styling & UI:** Tailwind CSS, Lucide React
- **Persistence & ORM:** Supabase PostgreSQL (`@supabase/supabase-js`, `@supabase/ssr`, `postgres`) with dynamic `IDataRepository` interface
- **AI Integration:** Google Generative AI REST API (`gemini-3.8-flash`), GroqCloud / xAI Grok REST API (`qwen/qwen3.8-27b`)
- **Testing:** Custom test harness with 27 automated unit, security, and integration tests
- **Audio Simulation:** Browser Web Audio API (dual-tone multi-frequency synthesizer)

---

## 4. Setup & Running Locally

### Prerequisites
- **Node.js:** v18.17+ or v20+
- **Yarn:** v1.22+ (or npm)

### Installation
```bash
# Clone the repository
git clone https://github.com/KatkamKoushik/HealX.git
cd HealX

# Install dependencies
yarn install --no-bin-links
```

### Environment Configuration
Copy the sample environment variables:
```bash
cp .env.example .env.local
```

The application runs immediately in **Zero-Config Demo Mode** out of the box. To connect to a live Supabase instance, fill in your project credentials in `.env.local`.

### Running the Development Server
```bash
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests & Quality Checks
```bash
# Run unit, security, and integration tests
yarn test

# Run strict TypeScript type check
yarn typecheck

# Build production bundle
yarn build

# Run production server
yarn start
```

---

## 5. Configuration Options

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_NAME` | `HealX` | Platform branding across the UI, headers, and metadata |
| `NEXT_PUBLIC_DEFAULT_LANG` | `en` | Default language on first visit (`en` or `te`) |
| `DATA_STORE_MODE` | `auto` | Set to `demo` to force local in-memory storage, or `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | *(optional)* | Supabase project URL (falls back to local data store if omitted) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(optional)* | Supabase client anon public key for browser sessions |
| `SUPABASE_SERVICE_ROLE_KEY` | *(optional)* | Supabase administrative key for backend verification & migrations |
| `DATABASE_URL` | *(optional)* | Supabase Transaction Pooler connection string (`port 6543`) |
| `DIRECT_URL` | *(optional)* | Direct PostgreSQL connection string (`port 5432`) |
| `GEMINI_API_KEY` | *(optional)* | Google Gemini API key (`gemini-3.8-flash`) |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Gemini model identifier |
| `GROK_API_KEY` | *(optional)* | Groq / xAI Grok API key for secondary failover |
| `GROK_MODEL` | `qwen/qwen3.8-27b` | Groq / Grok model identifier |
| `SMS_MODE` | `mock` | `mock` (masked in console/UI) or `real` (Twilio adapter) |
| `IVR_MODE` | `mock` | `mock` (browser Web Audio simulator) or `real` |

---

## 6. Seed Accounts & Evaluation Credentials

When running with Supabase configured and the seed script executed (`node scripts/seed-auth-users.mjs`), use the following credentials to access the protected administration area:

- **Admin Login:** `admin@healx.org`  
  **Password:** `DemoPass2026!`  
  **Role:** `admin` (Full access to Verification, SMS Simulation, IVR Logs, and Analytics)
- **Staff Login:** `staff@healx.org`  
  **Password:** `DemoPass2026!`  
  **Role:** `staff` (Facility Verification & Directory Management)

Unauthenticated attempts to access `/admin/*` routes are intercepted by server-side guards and redirected to `/login?error=auth_required`.

---

## 7. Application Routes

- **`/`**: Public landing page with bilingual introduction and quick navigation.
- **`/hospitals`**: Hospital search and directory with city/district filters and audio read-out.
- **`/hospitals/[id]`**: Facility detail page displaying clinical departments, verified hours, and sources.
- **`/assistant`**: AI healthcare navigator with strict medical safety guardrails and citations.
- **`/demo`**: Interactive guided tour showcasing all SFIC Level 3 requirements.
- **`/admin/verification`**: Staff review console for transitioning facility verification tiers with audit notes.
- **`/admin/ivr`**: Interactive telephone dialpad simulator with English & Telugu audio prompts.
- **`/admin/notifications`**: SMS alert simulation and dispatch audit log.
- **`/admin/analytics`**: Community feedback, search volume, and verification coverage metrics.

---

## 8. Documentation Index

- [Architecture Reference](docs/ARCHITECTURE.md) — Comprehensive technical architecture, repository interfaces, and security model.
- [Operational Runbook & Migration Guide](docs/RUNBOOK.md) — Step-by-step database migrations, environment provisioning, and deployment instructions.
- [Evaluator Demo Guide](docs/DEMO_GUIDE.md) — Guided 7-step evaluation walkthrough for SFIC reviewers.
- [Observability & Metrics Reference](docs/METRICS.md) — Explanation of telemetry tracking and audit log structures.

---

## 9. License & Attribution

Developed for the **Seva First Innovation Challenge (SFIC) Level 3**. Released under the MIT License for educational and evaluation purposes.
