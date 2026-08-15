# Database design

## Core relationships

```text
auth.users 1─1 profiles
profiles 1─* incidents 1─* incident_media
                       1─* ai_analyses
                       1─* incident_status_events
                       1─* assignments *─1 teams *─* profiles (team_members)
                                       *─1 vehicles
                       1─* cleanup_verifications
                       *─* duplicate_clusters (duplicate_cluster_members)
profiles 1─* notifications
profiles 1─* audit_logs
hotspots (derived operational intelligence)
```

All required entities are implemented. Additions:

- `team_members` creates enforceable worker assignment scope.
- `waste_categories` supports audited activation and handling guidance from the Admin console.
- `incident_status_events` persists every workflow transition.
- `incidents.display_id` separates public civic references (`SW-2048`) from UUID keys.
- `score_factors` preserves explainability instead of only the final score.
- `is_demo` / `is_prototype` prevent seeded intelligence from being mistaken for production output.

## Index strategy

- `(status, action_score DESC)` partial index for active priority queue.
- `(reporter_id, created_at DESC)` for citizen tracking.
- category/time and created-time indexes for analysis/duplication.
- incident foreign-key indexes for media, analyses, assignments, events and cluster members.
- user/unread/time index for notification badges.
- rough latitude/longitude index; a production viewport/nearest-neighbor implementation can add a generated PostGIS geography column and GiST index.

## Workflow integrity

`validate_incident_transition` compares enum position and rejects any move not exactly one step forward. `assign_response` locks the incident/team/vehicle, verifies availability and updates all three in one transaction. `advance_incident_status` authorizes operations or the assigned worker. Status changes create event and audit rows.

The allowed order is:

`REPORTED → AI_ANALYZED → PRIORITIZED → ASSIGNED → ACCEPTED → DISPATCHED → ON_SITE → CLEANUP_IN_PROGRESS → CLEANUP_COMPLETED → VERIFICATION → RESOLVED`

## RLS matrix

| Entity | Citizen | Worker | Officer | Admin | Recycler |
|---|---|---|---|---|---|
| Incident | own | assigned | all municipal | all | recyclable categories |
| Media/analysis | own | assigned | all municipal | all | no citizen media policy |
| Assignment | — | assigned team | manage | manage | recyclable-related view |
| Verification | own result | assigned insert/view | manage | manage | — |
| Team/vehicle | read | read | read/assign | manage | read |
| Notifications | own | own | own | own | own |
| Audit | — | insert own action | view | view/manage | — |

See migration SQL for exact policy expressions. Service-role credentials exist only in Edge Function runtime.

## Seed data

`supabase/seed.sql` inserts 20 fictional incidents across all eight categories and all required urgency/outcome states, plus resources, three hotspots, analyses and a 12-report duplicate master. It deliberately does not embed Auth passwords. Demo Auth users should be created through a deployment-specific secure administrative process.
