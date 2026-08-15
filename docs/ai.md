# AI and decision architecture

## Honest prototype contract

The `WasteAnalyzer` interface accepts image metadata/context and returns:

- waste categories and confidence;
- approximate volume band and confidence;
- contextual hazard flags;
- initial action recommendation;
- ResponseMatch fields;
- model version and `isPrototype` marker.

`createWasteAnalyzer()` uses `analyze-waste` when Supabase is configured and `DeterministicPrototypeAnalyzer` otherwise. UI components consume only this contract; no component hardcodes a selected analysis result.

## WasteVision categories

Overflowing bin, Garbage dump, Plastic waste, Construction debris, Organic waste, E-waste, Hazardous waste and Drain blockage. Volume is limited to Small, Medium, Large and Very Large. The app explicitly says this is an operational estimate based on visible/contextual evidence—not exact cubic volume.

## Deterministic analyzer

The fallback analyzes the file name, optional comment and explicit demo-scenario hint with a documented keyword ruleset. A fixed ruleset makes demonstrations reproducible and testable. It is labelled prototype AI and must not be interpreted as validated computer vision.

A production adapter can replace it with a detector/segmenter plus calibrated classifiers while preserving the domain response. Model governance should add representative validation data, calibration monitoring, human-review thresholds, drift detection and model cards.

## ActionScore™

Maximum 100 points; configuration is centralized in `src/config/decisionRules.ts` and mirrored server-side.

| Factor | Maximum | Signal |
|---|---:|---|
| Visible volume | 25 | categorical estimate |
| Location sensitivity | 25 | configurable contextual POI type |
| Report frequency | 20 | supporting citizen signals |
| Complaint age | 15 | unresolved duration |
| Hazard/context | 15 | drain, chemical, sharp material, etc. |

Thresholds: Critical ≥85, High ≥68, Medium ≥42, otherwise Low. `SW-2048` reproduces 25 + 25 + 20 + 14 + 10 = **94**. The factor record is persisted in `incidents.score_factors` so an officer can audit the decision.

## Duplicate intelligence

Prototype threshold: within 150 m, within 72 hours, same category, then optional deterministic visual-similarity contribution. The abstraction can be replaced with image embeddings. Matches create a master relationship and cluster/member records; supporting reports increase one issue's demand signal instead of creating duplicate dispatches.

Production evaluation should separately measure false consolidation and missed duplicates, with an officer override and cluster-split action.

## ResponseMatch™

Rules map waste/context to team type, vehicle, worker count, escalation and reason:

- small litter → manual cleanup;
- bulk waste/debris → extra workers + truck;
- recyclable-heavy → recovery partner;
- hazardous → containment + immediate escalation;
- organic → covered specialized collection;
- drain blockage → drainage/sanitation;
- sensitive location → escalated review.

This is decision support, not autonomous dispatch. An officer confirms resources.

## Cleanup verification

The verifier returns status, confidence and remaining-waste indicator. Demo verification is deterministic: normal evidence returns 93% / Low; filenames suggesting blur/dark/unclear trigger manual review. A real before/after model should include viewpoint quality checks and a conservative manual-review threshold.
