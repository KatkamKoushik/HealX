# Architecture & Technical Design Document
## SFIC Level 3: Inclusive Healthcare Navigation Platform (Theme 3: Swasth & Samavesh Bharat)

### 1. Architectural Philosophy
The application is structured as a **modular monolith** with clean boundaries between:
1. **Presentation Layer (Next.js App Router):** Multilingual, high-contrast, accessible UI.
2. **Domain & Service Layer:** Grounded AI waterfall orchestrator, telephony simulator, and verification engine.
3. **Data Access Layer:** Unified repository with automatic failover between Supabase PostgreSQL and local in-memory storage.
4. **Security & Auditing:** Immutable audit logging, Row Level Security, and zero-PHI data collection.

```
+-------------------------------------------------------------------------------+
|                             CLIENT / USER LAYER                               |
|   - Multilingual UI (English & Telugu)         - High Contrast Mode (WCAG AAA)|
|   - Web Speech Synthesis (TTS Audio)           - Adjustable Typography Scaling|
+---------------------------------------+---------------------------------------+
                                        |
+---------------------------------------v---------------------------------------+
|                       NEXT.JS APP ROUTER & API HANDLERS                       |
|   - / (Landing Page)                           - /hospitals (Directory)       |
|   - /hospitals/[id] (Facility Details)         - /departments (Specialties)   |
|   - /assistant (AI Grounded Navigation)        - /accessibility (Voice & UI)  |
|   - /demo (Judge Evaluation Tour)              - /admin/* (Staff Operations)  |
+-------------------+-------------------+-------------------+-------------------+
                    |                   |                   |
+-------------------v---+       +-------v-----------+   +---v-------------------+
|  AI WATERFALL SERVICE |       | TELEPHONY SERVICE |   |  VERIFICATION SERVICE |
| 1. Google Gemini 1.5  |       | - SMS Gateway     |   | - Status Tiers        |
| 2. xAI Grok Failover  |       |   (Mock / Twilio) |   | - Source Citations    |
| 3. Offline Retrieval  |       | - Interactive IVR |   | - Staff Auditor Notes |
+-------------------+---+       +-------+-----------+   +---+-------------------+
                    |                   |                   |
+-------------------v-------------------v-------------------v-------------------+
|                         DATA ACCESS REPOSITORY LAYER                          |
|   - Supabase PostgreSQL (When configured via NEXT_PUBLIC_SUPABASE_URL)        |
|   - In-Memory Resilient Repository (Out-of-the-box local demo mode)           |
+-------------------------------------------------------------------------------+
```

---

### 2. Grounded AI Waterfall Engine

The AI navigation system enforces strict non-diagnostic constraints to prevent clinical hallucinations:

1. **Grounded Directory Retrieval:** When a user asks a query, relevant facility records are fetched from the local repository and injected into the restricted system prompt.
2. **Clinical Guardrails:** The system explicitly forbids diagnosing diseases, prescribing medications, or predicting treatment dosages.
3. **Provider Failover Pipeline:**
   - **Primary:** Gemini 1.5 Flash (low latency, high contextual understanding).
   - **Failover:** Grok-beta (triggered automatically if Gemini hits HTTP 429 rate-limits or timeouts).
   - **Deterministic Fallback:** If both external APIs are unavailable or unconfigured, local directory records are formatted directly into clear navigation advice with links.

---

### 3. Verification Workflow & Confidence Tiers

Healthcare facility accuracy is maintained through four auditable statuses:

- **Verified:** Inspected via documented field visits, telephone checks, or official public registers.
- **Needs Review:** Operational hours or ward details require periodic re-confirmation.
- **Unverified:** Self-reported or newly submitted record awaiting inspection.
- **Inactive:** Suspended or closed facility hidden from public directory searches.

Every status transition records:
- Previous status & new status
- Responsible staff identifier
- Detailed verification rationale / source citation
- Timestamped audit log event
