# SWACHHLENS

> **See Waste. Understand Risk. Dispatch Smarter.**

SWACHHLENS is an AI-assisted waste response intelligence prototype for TechNova Season 3. It turns an unstructured citizen report into an explainable operational decision:

**REPORT → UNDERSTAND → PRIORITIZE → DECIDE → DISPATCH → CLEAN → VERIFY → LEARN**

This is not a normal complaint form. A report becomes a waste classification, approximate volume band, contextual hazard signal, duplicate match, ActionScore™, and ResponseMatch™ recommendation before entering the municipal queue.

## What works

- **Citizen mobile app:** photo/video capture or upload, location consent and fallback, timestamp, comments, deterministic/Edge Function analysis, report review, persistent submission and tracking.
- **WasteVision:** all eight required categories, confidence, approximate Small–Very Large volume, hazard flags and technically defensible prototype labels.
- **Duplicate Intelligence:** configurable 150 m / 72 h comparison, category matching and pluggable visual-similarity adapter; consolidated master incidents are persisted.
- **ActionScore™:** centralized 0–100 formula with visible factor contributions—volume, location sensitivity, report frequency, age, and hazard/context.
- **ResponseMatch™:** recommends team type, vehicle, crew size, escalation and a human-readable reason.
- **Municipal Command Center:** database-derived KPIs, ranked queue, detailed decision view, Leaflet map, clusters, resources, hotspots and operational charts.
- **Field workflow:** assignment acceptance, travel, on-site and cleanup transitions; invalid skips are rejected; after-photo verification closes the loop.
- **Role experiences:** Citizen, Municipal Officer, Field Worker, Administrator and Recycling Partner. Admin controls persist user roles, team/vehicle availability and category activation with audit records.
- **Security foundation:** Supabase Auth, protected routes, PostgreSQL RLS, protected Storage buckets, transactional RPCs and audit records.
- **Reliable demo mode:** 20 fictional incidents in IndexedDB, generated demo imagery, five teams, five vehicles, clusters, hotspots and reproducible scenarios. No external service is required.

## Five demo moments

1. **One photo → structured AI waste intelligence** — Citizen → Report waste → choose a demo scenario → Analyze.
2. **12 reports → 1 master incident** — Officer → Duplicate clusters → `DC-0183`.
3. **ActionScore 94/100, explained** — Officer → open `SW-2048`.
4. **Team + vehicle + escalation recommendation** — `SW-2048` → ResponseMatch and assignment panel.
5. **Before/after → cleanup verification** — Field Worker → `SW-2055`, or advance an assignment and run demo verification.

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL/Auth/Storage/Realtime/Edge Functions), Leaflet + OpenStreetMap, Recharts, Zod, Vitest and Lucide icons.

## Architecture

```text
React role experiences
  ├─ AuthContext ───────────── Supabase Auth / isolated demo session
  ├─ DataContext ───────────── typed operational repository
  │    ├─ configured mode ─── PostgreSQL + RLS + Storage + RPC + Realtime
  │    └─ demo mode ───────── IndexedDB durable adapter
  └─ AI service interface
       ├─ Supabase Edge Functions
       └─ deterministic prototype analyzer

PostgreSQL: incidents → analyses → duplicate clusters → assignments
                                      ↓
                           cleanup verifications → audit / analytics
```

Business rules live in `src/config/decisionRules.ts` and service modules, not presentation components. Sensitive mutations also have server-side implementations in database functions or Edge Functions. See [docs/architecture.md](docs/architecture.md).

## Local setup

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0
```

With no environment values, the app automatically uses its persistent IndexedDB demo repository. Use **Open prototype** and select a password-free role.

### Supabase-connected setup

1. Create a Supabase project and install the Supabase CLI.
2. Set the local project link and apply schema/seed:

   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   supabase db reset        # local development; loads supabase/seed.sql
   ```

3. Deploy the functions:

   ```bash
   supabase functions deploy analyze-waste
   supabase functions deploy calculate-action-score
   supabase functions deploy detect-duplicates
   supabase functions deploy generate-response
   supabase functions deploy submit-report
   supabase functions deploy verify-cleanup
   ```

4. Put only public browser credentials in `.env`:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

5. Create users through Supabase Auth. The profile trigger creates a Citizen profile; change staff roles only through an audited administrative process. Never expose the service-role key in a `VITE_` variable.

## Demo access

The login screen offers password-free, isolated prototype identities:

| Role | Demonstration identity | Entry |
|---|---|---|
| Citizen | `citizen@swachhlens.demo` | Citizen app |
| Municipal Officer | `officer@swachhlens.demo` | Command center |
| Field Worker | `worker@swachhlens.demo` | Assignment workflow |
| Administrator | `admin@swachhlens.demo` | Controls and audit |
| Recycling Partner | `recycler@swachhlens.demo` | Recovery queue |

These labels are not production Auth passwords or real accounts. Real Supabase users use the email/password form. See [docs/demo.md](docs/demo.md).

## Scripts

```bash
npm run dev       # development server
npm run build     # strict TypeScript + production bundle
npm run test      # ActionScore, duplicate and workflow tests
npm run lint      # ESLint
npm run preview   # production preview
```

## Data and security

The schema includes every required table plus `team_members`, `incident_status_events` and governed `waste_categories`, with foreign keys and operational indexes. RLS restricts citizens to their reports, field workers to assigned work, recyclers to recyclable-heavy incidents, and operations roles to municipal scope. The backend status trigger rejects invalid transitions. See [docs/database.md](docs/database.md).

## Privacy

No facial recognition, citizen profiling or public citizen identity. Camera/location access is consent-driven, media buckets are private, and configured deployments use signed URLs. Demo locations and images are fictional/generated. See [docs/privacy.md](docs/privacy.md).

## Prototype limitations

- Deterministic analysis is an honest fallback, not a production computer-vision model.
- Volume is a categorical operational estimate, never an exact cubic-meter claim.
- Hotspot output is labelled **Prototype Prediction** and is not validated forecasting.
- Demo locations are fictional context around a map center, not an official municipal GIS dataset.
- IndexedDB demo data is single-browser prototype persistence; Supabase is the connected multi-user backend.
- Deployment hardening still requires municipal retention rules, model validation, observability, backups, accessibility audit and field trials.

## Documentation

- [Architecture](docs/architecture.md)
- [AI and decision engines](docs/ai.md)
- [Database and RLS](docs/database.md)
- [Demo runbook](docs/demo.md)
- [Privacy](docs/privacy.md)

## License / competition note

Competition-grade prototype for demonstration. It does not claim official government integration, production readiness or perfect AI accuracy.
