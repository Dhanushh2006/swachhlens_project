# Application architecture

## Product boundary

SWACHHLENS converts a citizen observation into a municipal decision record. The frontend never treats an uploaded image as the finished product; every workflow creates or updates typed operational entities.

## Modules

```text
src/
├── components/       brand, UI primitives, timeline, guards
├── config/           ActionScore weights and valid status order
├── context/          authentication and operational state orchestration
├── data/             deterministic 20-incident demo seed
├── hooks/            Supabase Realtime subscription
├── layouts/          mobile citizen and desktop command shells
├── pages/            role-focused experiences
├── services/         AI, duplicate, score, cleanup and repository adapters
└── types/            domain contract

supabase/
├── migrations/       schema, RLS, workflow RPCs, security hardening
├── functions/        analysis and decision APIs
└── seed.sql           fictional relational demo data
```

## Runtime modes

### Connected mode

When both Vite Supabase variables are present and the user authenticates normally, `supabaseRepository` queries role-scoped PostgreSQL data, requests signed private-media URLs, calls transactional RPCs for assignment/status changes, and invokes Edge Functions for report processing and verification. Realtime listens to incidents, assignments and verifications.

### Reliable demo mode

Password-free role buttons explicitly start a demo session. Operational state is stored as one versioned domain snapshot in IndexedDB, not localStorage. Mutations use the same service contracts and status validation. This lets judges complete the workflow without cloud credentials while keeping prototype output clearly labelled.

## End-to-end report sequence

1. Browser requests camera and GPS only after a user action.
2. Photo/video media is validated (JPG/PNG/WebP/MP4/WebM, 8 MB maximum).
3. `WasteAnalyzer` selects the Edge Function adapter or deterministic adapter.
4. Duplicate service compares proximity, capture window and category; image similarity remains an adapter boundary.
5. ActionScore and ResponseMatch return structured, explainable output.
6. Citizen reviews the analysis and consent context.
7. Connected mode uploads private media and invokes `submit-report`; demo mode persists through IndexedDB.
8. Municipal queues re-rank from persisted ActionScore.
9. Assignment is transactional: incident, team, vehicle, notification and audit state move together.
10. Field transitions advance one state at a time.
11. After evidence runs verification; verified evidence allows resolution.

## Design system

- Forest green expresses civic trust and cleanliness.
- Red/orange/amber/green are reserved for urgency and always accompanied by text.
- Mobile touch targets are at least 40–44 px; citizen and field shells include safe-area padding.
- Desktop information hierarchy favors queue scan speed over decorative cards.
- Loading, empty, permission, validation and unavailable-resource states are explicit.

## Performance

Routes are lazy-loaded, keeping Leaflet and Recharts out of the initial citizen bundle. Queries cap operational lists, indexes support queue/report access, Storage images use constrained demo assets, and Realtime subscribes only to mutation-critical tables. A production map should add server-side viewport queries and clustering for thousands of markers.

## Trust boundaries

Frontend role guards are navigation only. Authorization is enforced by RLS and security-definer RPCs. Browser code receives only the anon key. Edge Functions use server-only environment credentials when privileged orchestration is required. See `database.md` and `privacy.md`.
