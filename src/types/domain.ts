export type Role = 'CITIZEN' | 'FIELD_WORKER' | 'MUNICIPAL_OFFICER' | 'ADMIN' | 'RECYCLING_PARTNER'
export type WasteCategory = 'Overflowing bin' | 'Garbage dump' | 'Plastic waste' | 'Construction debris' | 'Organic waste' | 'E-waste' | 'Hazardous waste' | 'Drain blockage'
export type VolumeCategory = 'Small' | 'Medium' | 'Large' | 'Very Large'
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type SensitivityLevel = 'HIGH' | 'MEDIUM' | 'LOW'
export type IncidentStatus = 'REPORTED' | 'AI_ANALYZED' | 'PRIORITIZED' | 'ASSIGNED' | 'ACCEPTED' | 'DISPATCHED' | 'ON_SITE' | 'CLEANUP_IN_PROGRESS' | 'CLEANUP_COMPLETED' | 'VERIFICATION' | 'RESOLVED'

export interface Profile {
  id: string
  fullName: string
  email: string
  phone?: string
  role: Role
  avatarUrl?: string
  createdAt: string
}

export interface TimelineEvent {
  status: IncidentStatus
  at: string
  actor?: string
  note?: string
}

export interface ActionScoreBreakdown {
  volume: number
  locationSensitivity: number
  reportFrequency: number
  complaintAge: number
  hazardContext: number
}

export interface ResponseRecommendation {
  teamType: string
  vehicleType: string
  workerCount: number
  escalation: 'IMMEDIATE' | 'OFFICER_REVIEW' | 'STANDARD' | 'NONE'
  reason: string
}

export interface AIAnalysis {
  id: string
  categories: { category: WasteCategory; confidence: number }[]
  volumeCategory: VolumeCategory
  volumeConfidence: number
  hazardFlags: string[]
  recommendedAction: string
  response: ResponseRecommendation
  modelVersion: string
  isPrototype: boolean
  createdAt: string
}

export interface Incident {
  id: string
  /** Internal UUID used by the configured Supabase backend; never shown as the civic reference. */
  backendId?: string
  reporterId: string | null
  latitude: number
  longitude: number
  address: string
  capturedAt: string
  description: string
  status: IncidentStatus
  wasteCategory: WasteCategory
  volumeCategory: VolumeCategory
  actionScore: number
  scoreBreakdown: ActionScoreBreakdown
  priorityLevel: PriorityLevel
  locationSensitivity: SensitivityLevel
  sensitivityReason: string
  reportCount: number
  mediaUrl: string
  afterMediaUrl?: string
  analysis: AIAnalysis
  duplicateMasterId?: string
  duplicateSimilarity?: number
  timeline: TimelineEvent[]
  assignedTeamId?: string
  assignedVehicleId?: string
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  teamType: string
  workerCount: number
  availability: 'AVAILABLE' | 'ASSIGNED' | 'OFF_DUTY'
  currentLocation: { latitude: number; longitude: number }
}

export interface Vehicle {
  id: string
  name: string
  vehicleType: string
  capacity: string
  availability: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE'
  currentLocation: { latitude: number; longitude: number }
}

export interface Assignment {
  id: string
  incidentId: string
  teamId: string
  vehicleId: string
  assignedBy: string
  assignedAt: string
  acceptedAt?: string
  dispatchedAt?: string
  completedAt?: string
  status: 'ASSIGNED' | 'ACCEPTED' | 'DISPATCHED' | 'ON_SITE' | 'IN_PROGRESS' | 'COMPLETED'
}

export interface DuplicateCluster {
  id: string
  masterIncidentId: string
  memberIncidentIds: string[]
  similarityScore: number
  detectionReason: string[]
  createdAt: string
}

export interface CleanupVerification {
  id: string
  incidentId: string
  afterMediaPath: string
  verificationStatus: 'VERIFIED' | 'MANUAL_REVIEW'
  confidence: number
  remainingWasteIndicator: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'INFO' | 'CRITICAL' | 'ASSIGNMENT' | 'RESOLVED'
  read: boolean
  createdAt: string
}

export interface Hotspot {
  id: string
  name: string
  centerLatitude: number
  centerLongitude: number
  riskScore: number
  reportCount: number
  trend: number
  dominantCategory: WasteCategory
  averageResolutionTime: number
  signal: string
  recommendation: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown>
  createdAt: string
}

export interface AppState {
  incidents: Incident[]
  teams: Team[]
  vehicles: Vehicle[]
  assignments: Assignment[]
  clusters: DuplicateCluster[]
  verifications: CleanupVerification[]
  notifications: Notification[]
  hotspots: Hotspot[]
  auditLogs: AuditLog[]
  version: number
}

export interface NewReportInput {
  reporterId: string
  latitude: number
  longitude: number
  address: string
  description: string
  mediaUrl: string
  capturedAt: string
  analysis: AIAnalysis
  sensitivity: SensitivityLevel
  sensitivityReason: string
}
