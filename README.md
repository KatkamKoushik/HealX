# HealX
## Inclusive Healthcare Navigation Platform
**Seva First Innovation Challenge (SFIC) • South Zone • Level 3**  
**Theme 3: Swasth & Samavesh Bharat**

---

### Project Notice & Scope
> **Demonstration Prototype Notice:**  
> HealX is an engineering prototype designed for the **Seva First Innovation Challenge (SFIC) Level 3**. It is intended strictly for healthcare facility discovery, department navigation, and accessibility demonstration. It does not provide medical diagnoses, emergency dispatch, or official government health record integration. Facility records included in the default distribution represent simulated sample data across South India.

---

## 1. Overview & Core Features

HealX addresses the challenge of navigating healthcare services by combining accessible web design, multilingual support, and structured facility verification.

| Feature Area | Description & Current Capability | Implementation |
| :--- | :--- | :--- |
| **Multilingual Support** | Complete bilingual UI support for **English (`en`)** and **Telugu (`te`)** with instant switching and persistent preference storage. | Client-side i18n context |
| **Accessibility** | Built-in Text-to-Speech (TTS) via Web Speech API, variable typography scaling (100%–130%), and high-contrast display mode. | Native browser APIs & Tailwind CSS |
| **Assisted Navigation** | Natural-language query interface with grounded citations referencing directory data, backed by a resilient fallback architecture. | Gemini 1.5 Flash → Grok → Deterministic local directory |
| **Facility Verification** | Structured tiering (*Verified*, *Needs Review*, *Unverified*, *Inactive*) with auditable verification change logs and reviewer notes. | PostgreSQL / In-Memory Repository |
| **Telephony Simulation** | Interactive telephone keypad (IVR) audio simulator and SMS notification dispatcher with mock preview and optional Twilio adapter. | Web Audio API / Twilio REST API |
| **Data Observability** | Centralized dashboard for review statuses, search volume, community feedback ratings, and verification coverage. | Recharts & aggregation routes |

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
│       AI Navigation API      │  │   Facility Repository     │
│   Gemini 1.5 → Grok → Local  │  │ Supabase Postgres / Mock  │
└──────────────────────────────┘  └───────────────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐  ┌───────────────────────────┐
│     Telephony Simulator      │  │   Audit & Observability   │
│  Mock SMS / Twilio & IVR UI  │  │ Review History & Telemetry│
└──────────────────────────────┘  └───────────────────────────┘
```

- **Resilient Fallbacks:** External service failures (such as unavailable database connections or missing AI keys) gracefully fall back to local in-memory storage and deterministic directory search without crashing.
- **Privacy by Default:** Citizen phone numbers are masked in audit records and mock message outputs.
- **Configurable Identity:** The brand name defaults to **HealX**, configurable via `NEXT_PUBLIC_APP_NAME`.

---

## 3. Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling & UI:** Tailwind CSS, Lucide React
- **Persistence:** Supabase PostgreSQL (`@supabase/supabase-js`, `@supabase/ssr`, `postgres`) with local in-memory store
- **AI Integration:** Google Generative AI SDK (`@google/generative-ai`), Grok HTTP API
- **Testing:** Custom test harness with 14 automated unit and integration tests

---

## 4. Setup & Running Locally

### Prerequisites
- **Node.js:** v18.17+ or v20+
- **Yarn:** v1.22+ or **npm**

### Installation
```bash
# Clone the repository and install dependencies
yarn install --no-bin-links
```

### Environment Configuration
Copy the sample environment variables:
```bash
cp .env.example .env.local
```

The application runs immediately in **Zero-Config Demo Mode** without requiring external API keys.

### Running the Development Server
```bash
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests & Quality Checks
```bash
# Run unit and integration tests
yarn test

# Run strict TypeScript type checks
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
| `NEXT_PUBLIC_APP_NAME` | `HealX` | Configures the branding across the UI, headers, and metadata |
| `NEXT_PUBLIC_DEFAULT_LANG` | `en` | Default language on first visit (`en` or `te`) |
| `SMS_MODE` | `mock` | `mock` (simulates SMS in console/UI) or `real` (dispatches via Twilio) |
| `IVR_MODE` | `mock` | Telephony simulator operational mode |
| `GEMINI_API_KEY` | *(optional)* | Google Gemini 1.5 Flash API key for natural language navigation |
| `GROK_API_KEY` | *(optional)* | xAI Grok API key for secondary failover |
| `NEXT_PUBLIC_SUPABASE_URL` | *(optional)* | Supabase project URL (falls back to local data store if omitted) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| *(optional)* | Supabase client anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | *(optional)* | Supabase administrative key for migrations and verification |

---

## 6. Application Routes

- **`/`**: Public landing page with multilingual introduction and quick navigation.
- **`/hospitals`**: Hospital search and directory with city filters and audio read-out.
- **`/hospitals/[id]`**: Facility detail page displaying clinical departments, hours, and verification metadata.
- **`/assistant`**: AI healthcare navigator with strict medical safety guardrails and citations.
- **`/demo`**: Guided interactive evaluator tour showcasing all Level 3 requirements.
- **`/admin/verification`**: Staff review console for transitioning facility verification tiers with audit notes.
- **`/admin/ivr`**: Interactive telephone dialpad simulator with English & Telugu prompts.
- **`/admin/notifications`**: SMS alert simulation and dispatch audit log.
- **`/admin/analytics`**: Social impact indicators, search queries, and verification coverage metrics.

---

## 7. License & Attribution

Developed for the **Seva First Innovation Challenge (SFIC) Level 3**. Released under the MIT License for educational and evaluation purposes.
