import type { Incident, WasteCategory } from '../types/domain'

const DUPLICATE_RADIUS_METERS = 150
const DUPLICATE_WINDOW_HOURS = 72

function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const earthRadius = 6371e3
  const p1 = a.latitude * Math.PI / 180
  const p2 = b.latitude * Math.PI / 180
  const dp = (b.latitude - a.latitude) * Math.PI / 180
  const dl = (b.longitude - a.longitude) * Math.PI / 180
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export interface DuplicateCandidate {
  probability: number
  matchingIncidentId: string
  reasons: string[]
  distanceMeters: number
}

export function detectDuplicate(input: { latitude: number; longitude: number; category: WasteCategory; capturedAt: string }, incidents: Incident[]): DuplicateCandidate | null {
  const candidates = incidents.filter((incident) => incident.status !== 'RESOLVED').map((incident) => {
    const distance = distanceMeters(input, incident)
    const hours = Math.abs(new Date(input.capturedAt).getTime() - new Date(incident.capturedAt).getTime()) / 36e5
    const sameCategory = input.category === incident.wasteCategory
    const score = (distance <= DUPLICATE_RADIUS_METERS ? 0.42 : 0) + (hours <= DUPLICATE_WINDOW_HOURS ? 0.22 : 0) + (sameCategory ? 0.27 : 0)
    const reasons = [
      ...(distance <= DUPLICATE_RADIUS_METERS ? [`${Math.round(distance)}m away`] : []),
      ...(sameCategory ? ['Same waste category'] : []),
      ...(hours <= DUPLICATE_WINDOW_HOURS ? [`Reported within ${Math.max(1, Math.round(hours))} hours`] : []),
      ...(score >= 0.75 ? ['High prototype visual similarity'] : []),
    ]
    return { probability: Math.min(0.96, score + (score >= 0.75 ? 0.07 : 0)), matchingIncidentId: incident.duplicateMasterId ?? incident.id, reasons, distanceMeters: distance }
  }).filter((candidate) => candidate.probability >= 0.7)
  return candidates.sort((a, b) => b.probability - a.probability)[0] ?? null
}

export const duplicateConfig = { radiusMeters: DUPLICATE_RADIUS_METERS, windowHours: DUPLICATE_WINDOW_HOURS, imageSimilarity: 'deterministic prototype adapter' }
