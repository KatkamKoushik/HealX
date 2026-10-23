# HealX — Metric Definitions & Telemetry Methodology

## 1. Scope & Principles
This document defines how metrics on the HealX platform are captured, aggregated, and reported. HealX adheres strictly to factual reporting, avoiding fabricated claims of waiting-time reductions, hospital adoptions, or clinical health outcomes.

---

## 2. Metric Catalog

### A. Directory Search Volume (`totalSearches`)
- **Definition:** The cumulative count of user lookup operations against the hospital and department search endpoints.
- **Source:** `usage_events` table where `event_type LIKE 'search_%'`.
- **Computation:**
  ```sql
  SELECT COUNT(*) FROM usage_events WHERE event_type LIKE 'search_%';
  ```
- **Limitations:** Reflects system lookup events. Does not correlate with physical patient arrivals at hospitals.

---

### B. Verification Coverage (`verificationCoveragePercent`)
- **Definition:** The percentage of listed healthcare facilities that have completed an auditable verification review.
- **Source:** `hospitals` table where `verification_status = 'verified'`.
- **Computation:**
  $$\text{Coverage} = \left(\frac{\text{Verified Hospitals}}{\text{Total Hospitals}}\right) \times 100$$
- **Limitations:** Only measures administrative data accuracy (address, hours, contact, departments). Does not measure medical care quality.

---

### C. Citizen Satisfaction Rating (`averageSatisfactionRating`)
- **Definition:** Average rating submitted by citizens through the public feedback form.
- **Source:** `feedback` table (`rating` column, scale: 1 to 5).
- **Computation:**
  ```sql
  SELECT COALESCE(AVG(rating), 0) FROM feedback;
  ```
- **Limitations:** Subject to self-selection bias of respondents.

---

### D. AI Navigation Telemetry (`aiQueriesCount` & `aiFailoverCount`)
- **Definition:**
  - `aiQueriesCount`: Total natural language queries processed by `/api/assistant`.
  - `aiFailoverCount`: Total instances where primary provider (Gemini) failed over to Grok or deterministic fallback.
- **Source:** `usage_events` where `event_type = 'assistant_query'`.
- **Computation:**
  ```sql
  SELECT COUNT(*) FILTER (WHERE metadata->>'fallbackTriggered' = 'true') FROM usage_events;
  ```

---

### E. Telephony Simulation Counts (`simulatedNotifications` & `realNotifications`)
- **Definition:** Count of dispatched notifications, distinguished by operational mode.
- **Source:** `notification_logs` table (`mode = 'simulated'` vs `mode = 'delivered'`).
- **Limitations:** Simulated dispatches do not touch telecommunication carrier networks.

---

## 3. Data Source Distinction
- **Supabase Mode:** Real counts aggregated live from PostgreSQL tables.
- **Demo Mode:** Real counts aggregated in-memory from user actions during the active session. Explicitly marked with `dataSource: 'demo'` and `isSampleBaseline: true`.
