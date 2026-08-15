# Privacy and security

## Principles

1. Collect only what incident response needs.
2. Keep citizen identity out of public and partner views.
3. Ask for camera/location in context, not on page load.
4. Use approximate location publicly and precise location only operationally.
5. Log privileged workflow changes.
6. Never add facial recognition or citizen-risk profiling.

## Data use

| Data | Purpose | Main control |
|---|---|---|
| Photo/video | waste understanding and evidence | private Storage + signed URL |
| GPS | duplicate detection, sensitivity, routing | role-scoped incident access |
| Timestamp | age, duplication and audit | immutable capture field |
| Comment | hazard/context interpretation | length validation and role access |
| Contact/profile | account and notification | self/operations RLS |
| After image | cleanup verification | assigned worker / operations policy |

## Authorization

RLS policies live in `202608150002_rls.sql`; hardening triggers live in `202608150004_security_hardening.sql`.

- Citizen: insert a report as self; select own incidents/media/analysis.
- Field worker: select assigned incidents; advance only assigned workflow; upload evidence to an assigned incident path.
- Municipal officer: manage municipal incidents and assignments.
- Admin: administrative access.
- Recycling partner: recyclable-heavy incident visibility without citizen profile exposure.

Worker update policies are paired with a database trigger that rejects changes to report facts and decision fields. The status trigger rejects skipped/reversed transitions. Storage buckets are private and file size/MIME restricted.

## Deployment actions still required

A municipal deployment must define retention/deletion schedules, legal basis and consent copy, encryption/key ownership, backup policy, breach response, media moderation, subject-access/deletion handling, audit retention and approved data processors. Security testing must include RLS tests under every role, signed URL expiry, malicious file handling and Edge Function abuse limits.

## Prototype data

All seeded locations are fictional demo labels. Included incident images were generated for demonstration. The app does not expose or imply real citizen identities, official GIS data or government integration.
