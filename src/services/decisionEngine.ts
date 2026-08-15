import { ACTION_SCORE_CONFIG, priorityFromScore } from '../config/decisionRules'
import type { ActionScoreBreakdown, AIAnalysis, ResponseRecommendation, SensitivityLevel, VolumeCategory, WasteCategory } from '../types/domain'

export interface ScoreInput {
  volume: VolumeCategory
  sensitivity: SensitivityLevel
  reportCount: number
  ageHours: number
  hazards: string[]
}

export function calculateActionScore(input: ScoreInput) {
  const volume = ACTION_SCORE_CONFIG.volume[input.volume]
  const locationSensitivity = ACTION_SCORE_CONFIG.locationSensitivity[input.sensitivity]
  const reportFrequency = ACTION_SCORE_CONFIG.reportFrequency.find((rule) => input.reportCount >= rule.min)?.points ?? 0
  const complaintAge = ACTION_SCORE_CONFIG.complaintAge.find((rule) => input.ageHours >= rule.minHours)?.points ?? 0
  const hasCriticalHazard = input.hazards.some((h) => /chemical|sharp|medical|fire/i.test(h))
  const hazardContext = input.hazards.length ? (hasCriticalHazard ? ACTION_SCORE_CONFIG.hazard.critical : ACTION_SCORE_CONFIG.hazard.present) : 0
  const breakdown: ActionScoreBreakdown = { volume, locationSensitivity, reportFrequency, complaintAge, hazardContext }
  const score = Math.min(100, Object.values(breakdown).reduce((sum, value) => sum + value, 0))
  return { score, priority: priorityFromScore(score), breakdown }
}

export function generateResponse(category: WasteCategory, volume: VolumeCategory, hazards: string[], sensitivity: SensitivityLevel): ResponseRecommendation {
  const hazardText = hazards.join(' ').toLowerCase()
  if (category === 'Hazardous waste' || /chemical|medical|sharp|fire/.test(hazardText)) {
    return { teamType: 'Hazmat Response Unit', vehicleType: 'Containment Vehicle', workerCount: 4, escalation: 'IMMEDIATE', reason: 'Potentially hazardous material requires isolation, trained handling and officer oversight.' }
  }
  if (category === 'Drain blockage' || /drain|water flow/.test(hazardText)) {
    return { teamType: 'Drainage & Sanitation', vehicleType: volume === 'Small' ? 'Utility Van' : 'Mini Truck', workerCount: 3, escalation: sensitivity === 'HIGH' ? 'IMMEDIATE' : 'OFFICER_REVIEW', reason: `${volume} waste with a drainage impact${sensitivity === 'HIGH' ? ' near a sensitive location' : ''}.` }
  }
  if (category === 'Construction debris') {
    return { teamType: 'Bulk Waste Crew', vehicleType: volume === 'Very Large' ? 'Tipper Truck' : 'Mini Truck', workerCount: volume === 'Small' ? 2 : 3, escalation: sensitivity === 'HIGH' ? 'IMMEDIATE' : 'OFFICER_REVIEW', reason: `${volume} construction debris${hazards.length ? ` with ${hazards[0].toLowerCase()}` : ''}${sensitivity === 'HIGH' ? ' near a sensitive location' : ''}.` }
  }
  if (category === 'Plastic waste' || category === 'E-waste') {
    return { teamType: 'Materials Recovery Team', vehicleType: 'Recycling Van', workerCount: 2, escalation: category === 'E-waste' ? 'OFFICER_REVIEW' : 'STANDARD', reason: 'Recoverable material should be segregated and routed through an appropriate recycling stream.' }
  }
  if (category === 'Organic waste') {
    return { teamType: 'Organic Waste Crew', vehicleType: 'Covered Collection Van', workerCount: volume === 'Large' ? 3 : 2, escalation: sensitivity === 'HIGH' ? 'OFFICER_REVIEW' : 'STANDARD', reason: 'Bio-waste needs time-sensitive, covered collection and specialized handling.' }
  }
  if (volume === 'Large' || volume === 'Very Large') {
    return { teamType: 'Bulk Waste Crew', vehicleType: 'Mini Truck', workerCount: 3, escalation: sensitivity === 'HIGH' ? 'OFFICER_REVIEW' : 'STANDARD', reason: 'Visible accumulation exceeds manual collection capacity.' }
  }
  return { teamType: 'Standard Cleanup Team', vehicleType: volume === 'Small' ? 'Hand Cart' : 'Light Utility Vehicle', workerCount: volume === 'Small' ? 1 : 2, escalation: 'NONE', reason: 'Routine manual collection is appropriate for the visible waste and current context.' }
}

export function explainScore(analysis: AIAnalysis, sensitivityReason: string, reportCount: number) {
  const category = analysis.categories[0].category.toLowerCase()
  const reports = reportCount > 1 ? `, has ${reportCount} supporting reports` : ''
  const hazard = analysis.hazardFlags.length ? `, includes ${analysis.hazardFlags[0].toLowerCase()}` : ''
  return `Priority reflects ${analysis.volumeCategory.toLowerCase()} ${category} near ${sensitivityReason.toLowerCase()}${reports}${hazard}.`
}
