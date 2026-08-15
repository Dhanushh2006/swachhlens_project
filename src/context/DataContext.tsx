import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { canTransition } from '../config/decisionRules'
import { demoDb } from '../lib/demoDb'
import { isSupabaseConfigured } from '../lib/supabase'
import { calculateActionScore } from '../services/decisionEngine'
import { detectDuplicate } from '../services/duplicateService'
import { verifyCleanup as runVerification } from '../services/cleanupService'
import { assignSupabaseIncident, loadSupabaseState, readSupabaseNotification, submitSupabaseReport, transitionSupabaseIncident, verifySupabaseCleanup } from '../services/supabaseRepository'
import { useRealtimeData } from '../hooks/useRealtimeData'
import type { AppState, CleanupVerification, Incident, IncidentStatus, NewReportInput } from '../types/domain'
import { useAuth } from './AuthContext'

interface DataContextValue extends AppState {
  loading: boolean
  error: string | null
  createIncident: (input: NewReportInput) => Promise<Incident>
  assignIncident: (incidentId: string, teamId: string, vehicleId: string) => Promise<void>
  transitionIncident: (incidentId: string, status: IncidentStatus, note?: string) => Promise<void>
  submitCleanup: (incidentId: string, imageName: string, imageUrl: string) => Promise<CleanupVerification>
  markResolved: (incidentId: string) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  resetDemo: () => Promise<void>
}

const emptyState: AppState = { incidents: [], teams: [], vehicles: [], assignments: [], clusters: [], verifications: [], notifications: [], hotspots: [], auditLogs: [], version: 1 }
const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { profile, isDemo } = useAuth()
  const useRemoteBackend = isSupabaseConfigured && !isDemo
  const [state, setState] = useState<AppState>(emptyState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      setState(useRemoteBackend ? await loadSupabaseState() : await demoDb.load())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operational data could not be loaded.')
    } finally { setLoading(false) }
  }, [useRemoteBackend])

  useEffect(() => { void reload() }, [reload, profile?.id])
  useRealtimeData(reload)

  const persist = useCallback(async (updater: (current: AppState) => AppState) => {
    let next!: AppState
    setState((current) => { next = updater(current); return next })
    try { await demoDb.save(next) } catch (err) { setError(err instanceof Error ? err.message : 'Could not save changes.'); throw err }
  }, [])

  const createIncident = useCallback(async (input: NewReportInput) => {
    if (useRemoteBackend) {
      const result = await submitSupabaseReport(input)
      const next = await loadSupabaseState()
      setState(next)
      const created = next.incidents.find((item) => item.id === result.displayId)
      if (!created) throw new Error('Report was submitted but could not be reloaded. Refresh to see it.')
      return created
    }
    let created!: Incident
    await persist((current) => {
      const highest = Math.max(...current.incidents.map((item) => Number(item.id.replace('SW-', ''))), 2067)
      const id = `SW-${highest + 1}`
      const category = input.analysis.categories[0].category
      const duplicate = detectDuplicate({ latitude: input.latitude, longitude: input.longitude, category, capturedAt: input.capturedAt }, current.incidents)
      const reportCount = 1
      const matchingIncident = duplicate ? current.incidents.find((item) => item.id === duplicate.matchingIncidentId) : undefined
      const score = calculateActionScore({
        volume: input.analysis.volumeCategory,
        sensitivity: input.sensitivity,
        reportCount: matchingIncident ? matchingIncident.reportCount + 1 : reportCount,
        ageHours: matchingIncident ? Math.max(0, (Date.now() - new Date(matchingIncident.createdAt).getTime()) / 36e5) : 0,
        hazards: input.analysis.hazardFlags,
      })
      const now = new Date().toISOString()
      created = {
        id, reporterId: input.reporterId, latitude: input.latitude, longitude: input.longitude, address: input.address,
        capturedAt: input.capturedAt, description: input.description, status: 'PRIORITIZED', wasteCategory: category,
        volumeCategory: input.analysis.volumeCategory, actionScore: score.score, scoreBreakdown: score.breakdown, priorityLevel: score.priority,
        locationSensitivity: input.sensitivity, sensitivityReason: input.sensitivityReason, reportCount, mediaUrl: input.mediaUrl,
        analysis: input.analysis, duplicateMasterId: duplicate?.matchingIncidentId, duplicateSimilarity: duplicate?.probability,
        timeline: [
          { status: 'REPORTED', at: now, actor: profile?.fullName },
          { status: 'AI_ANALYZED', at: now, actor: 'SWACHHLENS Intelligence' },
          { status: 'PRIORITIZED', at: now, actor: 'ActionScore Engine' },
        ], createdAt: now, updatedAt: now,
      }
      const incidents = current.incidents.map((incident) => duplicate && incident.id === duplicate.matchingIncidentId ? { ...incident, reportCount: incident.reportCount + 1, updatedAt: now } : incident)
      const clusters = duplicate ? [...current.clusters, { id: `DC-${String(current.clusters.length + 185).padStart(4, '0')}`, masterIncidentId: duplicate.matchingIncidentId, memberIncidentIds: [duplicate.matchingIncidentId, id], similarityScore: duplicate.probability, detectionReason: duplicate.reasons, createdAt: now }] : current.clusters
      return { ...current, incidents: [created, ...incidents], clusters, auditLogs: [...current.auditLogs, { id: crypto.randomUUID(), userId: input.reporterId, action: 'INCIDENT_CREATED', entityType: 'incident', entityId: id, metadata: { duplicate }, createdAt: now }] }
    })
    return created
  }, [persist, profile, useRemoteBackend])

  const assignIncident = useCallback(async (incidentId: string, teamId: string, vehicleId: string) => {
    if (useRemoteBackend) {
      const incident = state.incidents.find((item) => item.id === incidentId)
      if (!incident?.backendId) throw new Error('Incident backend reference is unavailable.')
      await assignSupabaseIncident(incident.backendId, teamId, vehicleId)
      setState(await loadSupabaseState())
      return
    }
    await persist((current) => {
      const incident = current.incidents.find((item) => item.id === incidentId)
      if (!incident) throw new Error('Incident not found.')
      if (incident.status !== 'PRIORITIZED') throw new Error(`Only prioritized incidents can be assigned. Current status: ${incident.status}.`)
      const team = current.teams.find((item) => item.id === teamId)
      const vehicle = current.vehicles.find((item) => item.id === vehicleId)
      if (!team || !vehicle) throw new Error('Select a valid team and vehicle.')
      if (team.availability !== 'AVAILABLE' || vehicle.availability !== 'AVAILABLE') throw new Error('That response resource is no longer available. Choose another.')
      const now = new Date().toISOString()
      return {
        ...current,
        incidents: current.incidents.map((item) => item.id === incidentId ? { ...item, status: 'ASSIGNED', assignedTeamId: teamId, assignedVehicleId: vehicleId, updatedAt: now, timeline: [...item.timeline, { status: 'ASSIGNED', at: now, actor: profile?.fullName ?? 'Officer' }] } : item),
        teams: current.teams.map((item) => item.id === teamId ? { ...item, availability: 'ASSIGNED' } : item),
        vehicles: current.vehicles.map((item) => item.id === vehicleId ? { ...item, availability: 'ASSIGNED' } : item),
        assignments: [...current.assignments, { id: crypto.randomUUID(), incidentId, teamId, vehicleId, assignedBy: profile?.id ?? 'demo-officer', assignedAt: now, status: 'ASSIGNED' }],
        notifications: [{ id: crypto.randomUUID(), userId: 'demo-worker', title: 'New cleanup assignment', message: `${incidentId} was assigned to ${team.name}.`, type: 'ASSIGNMENT', read: false, createdAt: now }, ...current.notifications],
        auditLogs: [...current.auditLogs, { id: crypto.randomUUID(), userId: profile?.id ?? 'demo-officer', action: 'RESPONSE_ASSIGNED', entityType: 'incident', entityId: incidentId, metadata: { teamId, vehicleId }, createdAt: now }],
      }
    })
  }, [persist, profile, state.incidents, useRemoteBackend])

  const transitionIncident = useCallback(async (incidentId: string, status: IncidentStatus, note?: string) => {
    if (useRemoteBackend) {
      const incident = state.incidents.find((item) => item.id === incidentId)
      if (!incident?.backendId) throw new Error('Incident backend reference is unavailable.')
      await transitionSupabaseIncident(incident.backendId, status, note)
      setState(await loadSupabaseState())
      return
    }
    await persist((current) => {
      const incident = current.incidents.find((item) => item.id === incidentId)
      if (!incident) throw new Error('Incident not found.')
      if (!canTransition(incident.status, status)) throw new Error(`Invalid transition: ${incident.status} → ${status}.`)
      const now = new Date().toISOString()
      const assignmentStatus = status === 'ACCEPTED' ? 'ACCEPTED' : status === 'DISPATCHED' ? 'DISPATCHED' : status === 'ON_SITE' ? 'ON_SITE' : status === 'CLEANUP_IN_PROGRESS' ? 'IN_PROGRESS' : status === 'CLEANUP_COMPLETED' ? 'COMPLETED' : undefined
      return {
        ...current,
        incidents: current.incidents.map((item) => item.id === incidentId ? { ...item, status, updatedAt: now, timeline: [...item.timeline, { status, at: now, actor: profile?.fullName, note }] } : item),
        assignments: current.assignments.map((item) => item.incidentId === incidentId && assignmentStatus ? { ...item, status: assignmentStatus, acceptedAt: status === 'ACCEPTED' ? now : item.acceptedAt, dispatchedAt: status === 'DISPATCHED' ? now : item.dispatchedAt, completedAt: status === 'CLEANUP_COMPLETED' ? now : item.completedAt } : item),
        auditLogs: [...current.auditLogs, { id: crypto.randomUUID(), userId: profile?.id ?? 'system', action: `STATUS_${status}`, entityType: 'incident', entityId: incidentId, metadata: { from: incident.status, note }, createdAt: now }],
      }
    })
  }, [persist, profile, state.incidents, useRemoteBackend])

  const submitCleanup = useCallback(async (incidentId: string, imageName: string, imageUrl: string) => {
    const incident = state.incidents.find((item) => item.id === incidentId)
    if (!incident) throw new Error('Incident not found.')
    if (incident.status !== 'CLEANUP_COMPLETED' && incident.status !== 'VERIFICATION') throw new Error('Complete cleanup before submitting verification evidence.')
    if (useRemoteBackend) {
      if (!incident.backendId) throw new Error('Incident backend reference is unavailable.')
      const verification = await verifySupabaseCleanup(incident.backendId, imageName, imageUrl)
      setState(await loadSupabaseState())
      return verification
    }
    const verification = await runVerification(incidentId, imageName, imageUrl)
    await persist((current) => {
      const currentIncident = current.incidents.find((item) => item.id === incidentId)!
      const now = new Date().toISOString()
      const shouldAddTransition = currentIncident.status === 'CLEANUP_COMPLETED'
      return { ...current, verifications: [verification, ...current.verifications], incidents: current.incidents.map((item) => item.id === incidentId ? { ...item, status: 'VERIFICATION', afterMediaUrl: imageUrl, updatedAt: now, timeline: shouldAddTransition ? [...item.timeline, { status: 'VERIFICATION', at: now, actor: 'Cleanup Verification Engine' }] : item.timeline } : item) }
    })
    return verification
  }, [persist, state.incidents, useRemoteBackend])

  const markResolved = useCallback(async (incidentId: string) => transitionIncident(incidentId, 'RESOLVED', 'Cleanup evidence verified'), [transitionIncident])
  const markNotificationRead = useCallback(async (id: string) => {
    if (useRemoteBackend) { await readSupabaseNotification(id); setState(await loadSupabaseState()); return }
    await persist((current) => ({ ...current, notifications: current.notifications.map((item) => item.id === id ? { ...item, read: true } : item) }))
  }, [persist, useRemoteBackend])
  const resetDemo = useCallback(async () => { setLoading(true); if (useRemoteBackend) await reload(); else setState(await demoDb.reset()); setLoading(false) }, [reload, useRemoteBackend])

  const value = useMemo(() => ({ ...state, loading, error, createIncident, assignIncident, transitionIncident, submitCleanup, markResolved, markNotificationRead, resetDemo }), [state, loading, error, createIncident, assignIncident, transitionIncident, submitCleanup, markResolved, markNotificationRead, resetDemo])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used inside DataProvider')
  return context
}
