import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { canTransition } from '../config/decisionRules'
import { demoDb } from '../lib/demoDb'
import { isSupabaseConfigured } from '../lib/supabase'
import { calculateActionScore } from '../services/decisionEngine'
import { detectDuplicate } from '../services/duplicateService'
import { verifyCleanup as runVerification } from '../services/cleanupService'
import { assignSupabaseIncident, loadSupabaseState, readSupabaseNotification, submitSupabaseReport, transitionSupabaseIncident, updateSupabaseCategory, updateSupabaseResource, updateSupabaseUserRole, verifySupabaseCleanup } from '../services/supabaseRepository'
import { useRealtimeData } from '../hooks/useRealtimeData'
import type { AppState, CleanupVerification, Incident, IncidentStatus, NewReportInput, Role } from '../types/domain'
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
  updateTeamAvailability: (id: string, availability: 'AVAILABLE'|'ASSIGNED'|'OFF_DUTY') => Promise<void>
  updateVehicleAvailability: (id: string, availability: 'AVAILABLE'|'ASSIGNED'|'MAINTENANCE') => Promise<void>
  updateCategoryActive: (id: string, active: boolean) => Promise<void>
  updateUserRole: (id: string, role: Role) => Promise<void>
  resetDemo: () => Promise<void>
}

const emptyState: AppState = { profiles: [], incidents: [], teams: [], vehicles: [], assignments: [], clusters: [], verifications: [], notifications: [], hotspots: [], categories: [], auditLogs: [], version: 3 }
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

  useEffect(() => { setLoading(true); void reload() }, [reload, profile?.id])
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
        locationSensitivity: input.sensitivity, sensitivityReason: input.sensitivityReason, reportCount, mediaUrl: input.mediaUrl, mediaType: input.mediaType ?? 'image',
        analysis: input.analysis, duplicateMasterId: duplicate?.matchingIncidentId, duplicateSimilarity: duplicate?.probability,
        timeline: [
          { status: 'REPORTED', at: now, actor: profile?.fullName },
          { status: 'AI_ANALYZED', at: now, actor: 'SWACHHLENS Intelligence' },
          { status: 'PRIORITIZED', at: now, actor: 'ActionScore Engine' },
        ], createdAt: now, updatedAt: now,
      }
      const incidents = current.incidents.map((incident) => duplicate && incident.id === duplicate.matchingIncidentId ? { ...incident, reportCount: incident.reportCount + 1, updatedAt: now } : incident)
      const existingCluster = duplicate ? current.clusters.find((cluster) => cluster.masterIncidentId === duplicate.matchingIncidentId) : undefined
      const clusters = !duplicate ? current.clusters : existingCluster
        ? current.clusters.map((cluster) => cluster.id === existingCluster.id ? { ...cluster, memberIncidentIds: [...new Set([...cluster.memberIncidentIds, id])], similarityScore: Math.max(cluster.similarityScore, duplicate.probability) } : cluster)
        : [...current.clusters, { id: `DC-${String(current.clusters.length + 185).padStart(4, '0')}`, masterIncidentId: duplicate.matchingIncidentId, memberIncidentIds: [duplicate.matchingIncidentId, id], similarityScore: duplicate.probability, detectionReason: duplicate.reasons, createdAt: now }]
      return { ...current, incidents: [created, ...incidents], clusters, auditLogs: [...current.auditLogs, { id: crypto.randomUUID(), userId: input.reporterId, action: 'INCIDENT_CREATED', entityType: 'incident', entityId: id, metadata: { duplicate }, createdAt: now }] }
    })
    return created
  }, [persist, profile, useRemoteBackend])

  const assignIncident = useCallback(async (incidentId: string, teamId: string, vehicleId: string) => {
    if (useRemoteBackend) {
      const incident = state.incidents.find((item) => item.id === incidentId)
      if (!incident?.backendId) throw new Error('Incident backend reference is unavailable.')
      if (incident.duplicateMasterId) throw new Error(`This is a supporting report. Assign the master incident ${incident.duplicateMasterId}.`)
      await assignSupabaseIncident(incident.backendId, teamId, vehicleId)
      setState(await loadSupabaseState())
      return
    }
    await persist((current) => {
      const incident = current.incidents.find((item) => item.id === incidentId)
      if (!incident) throw new Error('Incident not found.')
      if (incident.status !== 'PRIORITIZED') throw new Error(`Only prioritized incidents can be assigned. Current status: ${incident.status}.`)
      if (incident.duplicateMasterId) throw new Error(`This is a supporting report. Assign the master incident ${incident.duplicateMasterId}.`)
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
        notifications: [
          { id: crypto.randomUUID(), userId: 'demo-worker', title: 'New cleanup assignment', message: `${incidentId} was assigned to ${team.name}.`, type: 'ASSIGNMENT', read: false, createdAt: now },
          ...(incident.reporterId ? [{ id: crypto.randomUUID(), userId: incident.reporterId, title: 'Your report has been assigned', message: `${incidentId} has been assigned to a response team.`, type: 'INFO' as const, read: false, createdAt: now }] : []),
          ...current.notifications,
        ],
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
        notifications: status === 'RESOLVED' && incident.reporterId ? [{ id: crypto.randomUUID(), userId: incident.reporterId, title: 'Cleanup verified', message: `${incidentId} has been resolved with verified cleanup evidence.`, type: 'RESOLVED', read: false, createdAt: now }, ...current.notifications] : current.notifications,
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
  const updateTeamAvailability = useCallback(async (id:string, availability:'AVAILABLE'|'ASSIGNED'|'OFF_DUTY') => {
    if (useRemoteBackend) { await updateSupabaseResource('teams',id,availability); setState(await loadSupabaseState()); return }
    await persist((current)=>({...current,teams:current.teams.map(item=>item.id===id?{...item,availability}:item),auditLogs:[...current.auditLogs,{id:crypto.randomUUID(),userId:profile?.id??'demo-admin',action:'TEAM_AVAILABILITY_UPDATED',entityType:'team',entityId:id,metadata:{availability},createdAt:new Date().toISOString()}]}))
  },[persist,profile?.id,useRemoteBackend])
  const updateVehicleAvailability = useCallback(async (id:string, availability:'AVAILABLE'|'ASSIGNED'|'MAINTENANCE') => {
    if (useRemoteBackend) { await updateSupabaseResource('vehicles',id,availability); setState(await loadSupabaseState()); return }
    await persist((current)=>({...current,vehicles:current.vehicles.map(item=>item.id===id?{...item,availability}:item),auditLogs:[...current.auditLogs,{id:crypto.randomUUID(),userId:profile?.id??'demo-admin',action:'VEHICLE_AVAILABILITY_UPDATED',entityType:'vehicle',entityId:id,metadata:{availability},createdAt:new Date().toISOString()}]}))
  },[persist,profile?.id,useRemoteBackend])
  const updateCategoryActive = useCallback(async (id:string, active:boolean) => {
    if (useRemoteBackend) { await updateSupabaseCategory(id,active); setState(await loadSupabaseState()); return }
    await persist((current)=>({...current,categories:current.categories.map(item=>item.id===id?{...item,active}:item),auditLogs:[...current.auditLogs,{id:crypto.randomUUID(),userId:profile?.id??'demo-admin',action:'WASTE_CATEGORY_UPDATED',entityType:'waste_category',entityId:id,metadata:{active},createdAt:new Date().toISOString()}]}))
  },[persist,profile?.id,useRemoteBackend])
  const updateUserRole = useCallback(async (id:string, role:Role) => {
    if (id===profile?.id) throw new Error('You cannot change your own role during an active session.')
    if (useRemoteBackend) { await updateSupabaseUserRole(id,role); setState(await loadSupabaseState()); return }
    await persist((current)=>({...current,profiles:current.profiles.map(item=>item.id===id?{...item,role}:item),auditLogs:[...current.auditLogs,{id:crypto.randomUUID(),userId:profile?.id??'demo-admin',action:'USER_ROLE_UPDATED',entityType:'profile',entityId:id,metadata:{role},createdAt:new Date().toISOString()}]}))
  },[persist,profile?.id,useRemoteBackend])
  const resetDemo = useCallback(async () => { setLoading(true); if (useRemoteBackend) await reload(); else setState(await demoDb.reset()); setLoading(false) }, [reload, useRemoteBackend])

  const value = useMemo(() => ({ ...state, loading, error, createIncident, assignIncident, transitionIncident, submitCleanup, markResolved, markNotificationRead, updateTeamAvailability, updateVehicleAvailability, updateCategoryActive, updateUserRole, resetDemo }), [state, loading, error, createIncident, assignIncident, transitionIncident, submitCleanup, markResolved, markNotificationRead, updateTeamAvailability, updateVehicleAvailability, updateCategoryActive, updateUserRole, resetDemo])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used inside DataProvider')
  return context
}
