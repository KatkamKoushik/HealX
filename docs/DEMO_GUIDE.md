# Guided Demonstration Script for SFIC Jury & Evaluators
## Seva First Innovation Challenge (SFIC) • South Zone • Level 3
**Theme 3: Swasth & Samavesh Bharat • HealX Platform**

---

### Overview for Evaluators
This walkthrough guides evaluators through the core capabilities of **HealX**, demonstrating how an accessible, multilingual healthcare navigation platform bridges information barriers for citizens across South India.

---

### Walkthrough Sequence (Estimated Time: 5 - 7 minutes)

#### 1. Public Landing Page & Language Switcher
- **URL:** `/`
- **Actions to Test:**
  - Notice the platform branding **HealX** and SFIC Level 3 theme banner.
  - Click the **తెలుగు** button in the header navigation: notice the entire UI, navigation links, benefits, and search placeholder immediately update into natural Telugu script.
  - Click **"Listen to Introduction (TTS)"**: observe browser SpeechSynthesis reading the platform introduction aloud.
  - In the search bar, type `Hyderabad` or `Emergency` and press Search.

#### 2. Healthcare Facility Directory
- **URL:** `/hospitals`
- **Actions to Test:**
  - Filter by **City / Region** (e.g. `Vijayawada`, `Warangal`, `Tirupati`, `Hyderabad`).
  - Filter by **Verification Status** (e.g. `Verified` vs `Needs Review`).
  - On any hospital card, click the **Audio Icon (Volume)**: listen to the facility's address, operating hours, and emergency casualty status read aloud.
  - Click **"Get Directions"**: verifies generation of standard Google Maps direction URLs without requiring paid API keys.
  - Click **"View Hospital Details"** on *Charminar Community Hospital*.

#### 3. Facility Details & Verification Audit
- **URL:** `/hospitals/hosp-001-hyd-charminar`
- **Actions to Test:**
  - Review operating hours, 24/7 trauma casualty badge, and connected clinical departments.
  - Inspect the **Information Verification Audit** section at the bottom: observe documented field survey source reference code (`SURVEY-HYD-CHM-0926`) and last checked date.

#### 4. Grounded AI Healthcare Navigation Assistant
- **URL:** `/assistant`
- **Actions to Test:**
  - Review the prominent non-diagnostic medical disclaimer banner.
  - Click a sample query: *"Where can I find 24/7 emergency pediatrics in Vijayawada?"*
  - Notice the grounded response citing facility records with clickable citation pills linking directly to the verified facility details.
  - Click **"Listen to Answer"**: listen to the assistant's answer read aloud via browser speech synthesis.
  - Note the active provider pipeline badge: **Gemini 3.8 Flash → Grok / Groq → Deterministic Fallback**.

#### 5. Accessibility Center
- **URL:** `/accessibility`
- **Actions to Test:**
  - Click **"Large (115%)"** or **"Extra Large (130%)"**: notice instant typography scaling across all pages.
  - Click **"High Contrast (WCAG AAA)"**: toggle accessible high-contrast border and text styling.
  - Click **"Test Voice Output"**: runs speech synthesis diagnostic and reports whether a native Telugu voice engine is installed.

#### 6. Staff Administrative Console
- **URL:** `/admin`
- **Actions to Test:**
  - If unauthenticated, the application automatically redirects to `/login`.
  - Sign in or click **"Fill Admin Credentials"** at `/login` (`admin@healx.org` / `DemoPass2026!`).
  - View real-time verification coverage percentage, total facilities, and external integrations status (Supabase PostgreSQL, Gemini, Grok/Groq, Twilio).

#### 7. Verification Workflow in Action
- **URL:** `/admin/verification`
- **Actions to Test:**
  - Locate an unverified or needs-review hospital (e.g. *Kakatiya Area Health Centre*).
  - Click **"Update Verification Status"**.
  - Change status to **Verified**, enter verification notes, and submit.
  - Notice the record immediately updates to **Verified** and a verification record is persisted in the database.

#### 8. Interactive IVR Telephony Simulation
- **URL:** `/admin/ivr`
- **Actions to Test:**
  - Click **"Simulate Call to HealX"**.
  - Hear or read the automated greeting: *"Press 1 for English, తెలుగు కొరకు 2 నొక్కండి"*.
  - Press **1** on the dialpad to enter English Main Menu.
  - Press **1** on the dialpad to browse hospitals.
  - Step through facility details and hear audio readout.

#### 9. SMS Notification Dispatch Inspector
- **URL:** `/admin/notifications`
- **Actions to Test:**
  - Review pre-filled emergency notification template.
  - Keep **Mock Mode** selected and click **"Simulate SMS Dispatch"**.
  - Notice notification log immediately generated with masked recipient identifier (`+91-98XXX-XX210`) and mode explicitly tagged as `simulated` (never misreported as real).

#### 10. Impact Analytics & Telemetry
- **URL:** `/admin/analytics`
- **Actions to Test:**
  - Inspect visual distribution charts for verified vs unverified records.
  - Review methodology disclaimers distinguishing observed prototype telemetry from future pilot projections.
