# Demo runbook

## Reset

Use **Reset** in the amber prototype bar. This restores the 20-incident IndexedDB seed and clears actions from the current browser demo. Demo role access requires no password.

## 60-second judge path

1. Login → **Municipal officer**.
2. Overview immediately shows live KPIs, ranked demand, the ActionScore card and charts.
3. Open `SW-2048`: point out 94/100 factors, 94% category confidence, drain hazard, sensitive school context and Mini Truck + 3 workers.
4. Open Duplicate Clusters: `DC-0183` communicates 12 reports → one physical response.
5. Login as **Field worker**: advance `SW-2051`, or open verification-stage `SW-2055`, upload/run demo evidence, and mark resolved.

## Reproducible scenarios

### 1 — Overflowing bin

Citizen → Report → **Overflowing bin** demo → Analyze. Expected: Medium, standard cleanup response.

### 2 — Critical construction waste

Citizen → Report → **Critical debris** → Analyze. Its position/category matches the seeded master. Expected: Construction debris, Large, drain blockage, school context, duplicate match and consolidated ActionScore 94.

### 3 — Duplicate storm

Officer → Duplicate Clusters → `DC-0183`. Expected: master `SW-2053`, 12 reports, multiple cluster reasons and one-response message.

### 4 — Hazardous waste

Citizen → **Hazardous waste**, or Officer → `SW-2050`. Expected: chemical exposure flag, containment vehicle, Hazmat unit and immediate escalation.

### 5 — Cleanup verification

Field Worker → `SW-2055` → run demo verification → 93% confidence, Low remaining waste → Mark Resolved. For a fresh workflow, accept `SW-2051`, move through every valid state, then upload evidence.

## Connected multi-role demo

With Supabase configured, create Auth users and assign staff roles in `profiles`. Add the worker to a `team_members` record. Use separate browser profiles for officer and worker. Realtime events update operational data after assignment, transition and verification.

## Failure paths worth showing

- Analyze without an image.
- Deny location and continue with clearly labelled approximate demo location.
- Upload a non-image or >8 MB image.
- Try to skip a field status (service and database reject it).
- Assign an unavailable team/vehicle.
- Upload evidence named `unclear.jpg` to trigger manual-review output.
