import type { IncidentStatus, PriorityLevel, SensitivityLevel, VolumeCategory } from '../types/domain'

export const ACTION_SCORE_CONFIG = {
  volume: { Small: 5, Medium: 12, Large: 25, 'Very Large': 25 } satisfies Record<VolumeCategory, number>,
  locationSensitivity: { LOW: 6, MEDIUM: 14, HIGH: 25 } satisfies Record<SensitivityLevel, number>,
  reportFrequency: [
    { min: 7, points: 20 },
    { min: 4, points: 16 },
    { min: 2, points: 10 },
    { min: 1, points: 4 },
  ],
  complaintAge: [
    { minHours: 8, points: 14 },
    { minHours: 4, points: 9 },
    { minHours: 1, points: 5 },
    { minHours: 0, points: 2 },
  ],
  hazard: { critical: 15, present: 10, none: 0 },
  thresholds: { critical: 85, high: 68, medium: 42 },
} as const

export const STATUS_FLOW: IncidentStatus[] = [
  'REPORTED', 'AI_ANALYZED', 'PRIORITIZED', 'ASSIGNED', 'ACCEPTED', 'DISPATCHED',
  'ON_SITE', 'CLEANUP_IN_PROGRESS', 'CLEANUP_COMPLETED', 'VERIFICATION', 'RESOLVED',
]

export function priorityFromScore(score: number): PriorityLevel {
  if (score >= ACTION_SCORE_CONFIG.thresholds.critical) return 'CRITICAL'
  if (score >= ACTION_SCORE_CONFIG.thresholds.high) return 'HIGH'
  if (score >= ACTION_SCORE_CONFIG.thresholds.medium) return 'MEDIUM'
  return 'LOW'
}

export function canTransition(from: IncidentStatus, to: IncidentStatus) {
  return STATUS_FLOW.indexOf(to) === STATUS_FLOW.indexOf(from) + 1
}
