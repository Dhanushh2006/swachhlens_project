import { calculateActionScore, generateResponse } from '../services/decisionEngine'
import type { AppState, Incident, IncidentStatus, PriorityLevel, SensitivityLevel, VolumeCategory, WasteCategory } from '../types/domain'

const NOW = new Date()
const isoAgo = (hours: number) => new Date(NOW.getTime() - hours * 36e5).toISOString()

const imageFor: Partial<Record<WasteCategory, string>> = {
  'Construction debris': '/demo/construction-debris.jpg',
  'Overflowing bin': '/demo/overflowing-bin.jpg',
  'Hazardous waste': '/demo/hazardous-waste.jpg',
  'Plastic waste': '/demo/plastic-waste.jpg',
  'Organic waste': '/demo/organic-market.jpg',
  'Drain blockage': '/demo/construction-debris.jpg',
  'Garbage dump': '/demo/overflowing-bin.jpg',
  'E-waste': '/demo/hazardous-waste.jpg',
}

interface SeedIncident {
  id: string; category: WasteCategory; volume: VolumeCategory; sensitivity: SensitivityLevel; sensitivityReason: string
  reports: number; age: number; hazards?: string[]; status: IncidentStatus; address: string; lat: number; lng: number
  description: string; score?: number; priority?: PriorityLevel; media?: string; duplicateMasterId?: string; afterMediaUrl?: string
}

function buildIncident(spec: SeedIncident): Incident {
  const createdAt = isoAgo(spec.age)
  const hazards = spec.hazards ?? []
  const recommendation = generateResponse(spec.category, spec.volume, hazards, spec.sensitivity)
  const calculated = calculateActionScore({ volume: spec.volume, sensitivity: spec.sensitivity, reportCount: spec.reports, ageHours: spec.age, hazards })
  const actionScore = spec.score ?? calculated.score
  const stages: IncidentStatus[] = ['REPORTED', 'AI_ANALYZED', 'PRIORITIZED', 'ASSIGNED', 'ACCEPTED', 'DISPATCHED', 'ON_SITE', 'CLEANUP_IN_PROGRESS', 'CLEANUP_COMPLETED', 'VERIFICATION', 'RESOLVED']
  const statusIndex = stages.indexOf(spec.status)
  return {
    id: spec.id, reporterId: 'demo-citizen', latitude: spec.lat, longitude: spec.lng, address: spec.address,
    capturedAt: createdAt, description: spec.description, status: spec.status, wasteCategory: spec.category,
    volumeCategory: spec.volume, actionScore, scoreBreakdown: spec.id === 'SW-2048'
      ? { volume: 25, locationSensitivity: 25, reportFrequency: 20, complaintAge: 14, hazardContext: 10 }
      : calculated.breakdown,
    priorityLevel: spec.priority ?? calculated.priority, locationSensitivity: spec.sensitivity, sensitivityReason: spec.sensitivityReason,
    reportCount: spec.reports, mediaUrl: spec.media ?? imageFor[spec.category] ?? '/demo/overflowing-bin.jpg', afterMediaUrl: spec.afterMediaUrl,
    analysis: {
      id: `ai-${spec.id}`, categories: [{ category: spec.category, confidence: spec.id === 'SW-2048' ? 0.94 : 0.86 + (Number(spec.id.slice(-1)) % 9) / 100 }],
      volumeCategory: spec.volume, volumeConfidence: spec.id === 'SW-2048' ? 0.82 : 0.8 + (Number(spec.id.slice(-1)) % 7) / 100,
      hazardFlags: hazards, recommendedAction: `${recommendation.vehicleType} + ${recommendation.workerCount} workers`, response: recommendation,
      modelVersion: 'swachhlens-prototype-rules-1.0', isPrototype: true, createdAt: new Date(new Date(createdAt).getTime() + 5 * 6e4).toISOString(),
    },
    duplicateMasterId: spec.duplicateMasterId,
    duplicateSimilarity: spec.duplicateMasterId ? 0.91 : undefined,
    timeline: stages.slice(0, statusIndex + 1).map((status, index) => ({ status, at: new Date(new Date(createdAt).getTime() + index * 24 * 6e4).toISOString(), actor: index > 2 ? 'Demo operations' : 'SWACHHLENS Intelligence' })),
    assignedTeamId: statusIndex >= 3 ? (spec.category === 'Hazardous waste' ? 'team-hazmat' : spec.category === 'Plastic waste' ? 'team-recovery' : 'team-bulk') : undefined,
    assignedVehicleId: statusIndex >= 3 ? (spec.category === 'Hazardous waste' ? 'vehicle-containment' : spec.category === 'Plastic waste' ? 'vehicle-recycling' : 'vehicle-mini') : undefined,
    createdAt, updatedAt: isoAgo(Math.max(0.2, spec.age - statusIndex * 0.4)),
  }
}

const incidentSpecs: SeedIncident[] = [
  { id: 'SW-2048', category: 'Construction debris', volume: 'Large', sensitivity: 'HIGH', sensitivityReason: 'Fictional Shantivan School (86m)', reports: 7, age: 11, hazards: ['Drain blockage detected'], status: 'PRIORITIZED', address: 'School Lane & 4th Cross · Demo City', lat: 12.9719, lng: 77.5949, description: 'Large construction debris is blocking the drain beside the school wall.', score: 94, priority: 'CRITICAL' },
  { id: 'SW-2049', category: 'Garbage dump', volume: 'Medium', sensitivity: 'MEDIUM', sensitivityReason: 'Major road', reports: 1, age: 3.4, status: 'AI_ANALYZED', address: 'Ring Road Underpass East · Demo City', lat: 12.9660, lng: 77.6032, description: 'Supporting mixed-waste report at the underpass.', duplicateMasterId: 'SW-2053' },
  { id: 'SW-2050', category: 'Hazardous waste', volume: 'Medium', sensitivity: 'HIGH', sensitivityReason: 'Fictional Arogya Clinic (120m)', reports: 2, age: 1.8, hazards: ['Possible chemical exposure'], status: 'ASSIGNED', address: 'Service Road 7 · Demo City', lat: 12.9761, lng: 77.6002, description: 'Unlabelled leaking containers found near a service lane.', score: 88, priority: 'CRITICAL' },
  { id: 'SW-2051', category: 'Organic waste', volume: 'Large', sensitivity: 'HIGH', sensitivityReason: 'Fictional Central Market', reports: 9, age: 7.2, hazards: ['Pest and hygiene risk'], status: 'ASSIGNED', address: 'Central Market Gate 3 · Demo City', lat: 12.9695, lng: 77.6008, description: 'Vegetable and fruit waste accumulating after daily market close.', score: 86, priority: 'CRITICAL' },
  { id: 'SW-2052', category: 'Plastic waste', volume: 'Large', sensitivity: 'HIGH', sensitivityReason: 'Urban water channel (demo)', reports: 5, age: 18, hazards: ['Water-flow obstruction'], status: 'DISPATCHED', address: 'Canal Walk North · Demo City', lat: 12.9781, lng: 77.5911, description: 'Plastic packaging accumulated along the channel edge.', score: 90, priority: 'CRITICAL' },
  { id: 'SW-2053', category: 'Garbage dump', volume: 'Very Large', sensitivity: 'MEDIUM', sensitivityReason: 'Major road', reports: 12, age: 15, hazards: ['Traffic visibility risk'], status: 'PRIORITIZED', address: 'Ring Road Underpass · Demo City', lat: 12.9655, lng: 77.6038, description: 'Repeated mixed waste reports at the underpass.', score: 89, priority: 'CRITICAL' },
  { id: 'SW-2054', category: 'E-waste', volume: 'Small', sensitivity: 'MEDIUM', sensitivityReason: 'Residential zone', reports: 1, age: 5, hazards: ['Battery handling risk'], status: 'ACCEPTED', address: 'Meadow Block C · Demo City', lat: 12.9732, lng: 77.5863, description: 'Discarded monitors, cables and batteries on pavement.', score: 55, priority: 'MEDIUM' },
  { id: 'SW-2055', category: 'Overflowing bin', volume: 'Medium', sensitivity: 'HIGH', sensitivityReason: 'Fictional City Hospital (74m)', reports: 4, age: 22, status: 'VERIFICATION', address: 'Health District Entry · Demo City', lat: 12.9812, lng: 77.5977, description: 'Bin beside pedestrian entrance; cleanup evidence submitted.', score: 73, priority: 'HIGH', afterMediaUrl: '/demo/cleanup-verified.jpg' },
  { id: 'SW-2056', category: 'Drain blockage', volume: 'Medium', sensitivity: 'HIGH', sensitivityReason: 'Major road', reports: 6, age: 9, hazards: ['Standing water', 'Water-flow obstruction'], status: 'ON_SITE', address: 'Monsoon Avenue Junction · Demo City', lat: 12.9638, lng: 77.5941, description: 'Drain blocked with mixed litter after rainfall.', score: 87, priority: 'CRITICAL' },
  { id: 'SW-2057', category: 'Plastic waste', volume: 'Small', sensitivity: 'LOW', sensitivityReason: 'Residential zone', reports: 1, age: 0.8, status: 'PRIORITIZED', address: 'Garden Street · Demo City', lat: 12.9681, lng: 77.5842, description: 'Plastic bottles and wrappers beside the curb.' },
  { id: 'SW-2058', category: 'Organic waste', volume: 'Medium', sensitivity: 'MEDIUM', sensitivityReason: 'Bus stand', reports: 3, age: 6, hazards: ['Pest and hygiene risk'], status: 'CLEANUP_IN_PROGRESS', address: 'West Bus Stand · Demo City', lat: 12.9749, lng: 77.6073, description: 'Food waste behind the vendor line.' },
  { id: 'SW-2059', category: 'Construction debris', volume: 'Small', sensitivity: 'LOW', sensitivityReason: 'Residential zone', reports: 1, age: 2.2, status: 'PRIORITIZED', address: 'School Lane South · Demo City', lat: 12.9725, lng: 77.5955, description: 'Supporting brick and tile report near the school drain.', duplicateMasterId: 'SW-2048' },
  { id: 'SW-2060', category: 'Garbage dump', volume: 'Large', sensitivity: 'MEDIUM', sensitivityReason: 'Market approach road', reports: 8, age: 30, hazards: ['Pest and hygiene risk'], status: 'RESOLVED', address: 'Old Market Approach · Demo City', lat: 12.9673, lng: 77.6121, description: 'Recurring mixed waste pile now cleared.', afterMediaUrl: '/demo/cleanup-verified.jpg' },
  { id: 'SW-2061', category: 'Overflowing bin', volume: 'Small', sensitivity: 'LOW', sensitivityReason: 'Residential zone', reports: 1, age: 4, status: 'RESOLVED', address: 'Palm Grove 1st Cross · Demo City', lat: 12.9841, lng: 77.5884, description: 'Small public bin overflow was cleared.', afterMediaUrl: '/demo/cleanup-verified.jpg' },
  { id: 'SW-2062', category: 'Hazardous waste', volume: 'Small', sensitivity: 'MEDIUM', sensitivityReason: 'Light industrial zone', reports: 1, age: 1.2, hazards: ['Sharp material risk'], status: 'AI_ANALYZED', address: 'Workshop Lane · Demo City', lat: 12.9584, lng: 77.6004, description: 'Broken fluorescent tubes near loading gate.', score: 76, priority: 'HIGH' },
  { id: 'SW-2063', category: 'Plastic waste', volume: 'Medium', sensitivity: 'MEDIUM', sensitivityReason: 'Major road', reports: 4, age: 10, status: 'RESOLVED', address: 'East Flyover Base · Demo City', lat: 12.9771, lng: 77.6144, description: 'Segregated plastic pile collected by recovery team.', afterMediaUrl: '/demo/cleanup-verified.jpg' },
  { id: 'SW-2064', category: 'E-waste', volume: 'Medium', sensitivity: 'LOW', sensitivityReason: 'Commercial zone', reports: 2, age: 12, hazards: ['Battery handling risk'], status: 'ASSIGNED', address: 'Tech Arcade Rear Gate · Demo City', lat: 12.9861, lng: 77.6048, description: 'Old printers and computer components require recovery.' },
  { id: 'SW-2065', category: 'Drain blockage', volume: 'Large', sensitivity: 'HIGH', sensitivityReason: 'Fictional Vidya School (95m)', reports: 5, age: 26, hazards: ['Standing water'], status: 'RESOLVED', address: 'Vidya Road South · Demo City', lat: 12.9568, lng: 77.5931, description: 'Drain obstruction cleared before school opening.', afterMediaUrl: '/demo/cleanup-verified.jpg' },
  { id: 'SW-2066', category: 'Organic waste', volume: 'Small', sensitivity: 'MEDIUM', sensitivityReason: 'Market', reports: 1, age: 1, status: 'REPORTED', address: 'Flower Market Exit · Demo City', lat: 12.9705, lng: 77.6091, description: 'Flower and leaf waste on service pavement.' },
  { id: 'SW-2067', category: 'Garbage dump', volume: 'Medium', sensitivity: 'MEDIUM', sensitivityReason: 'Major road', reports: 1, age: 3, status: 'PRIORITIZED', address: 'Ring Road Underpass West · Demo City', lat: 12.9650, lng: 77.6043, description: 'Supporting mixed-waste report at the same underpass.', duplicateMasterId: 'SW-2053' },
]

export function createDemoState(): AppState {
  const incidents = incidentSpecs.map(buildIncident)
  return {
    profiles: [
      { id:'demo-citizen', fullName:'Aarav Citizen', email:'citizen@swachhlens.demo', role:'CITIZEN', createdAt:isoAgo(720) },
      { id:'demo-officer', fullName:'Meera Rao', email:'officer@swachhlens.demo', role:'MUNICIPAL_OFFICER', createdAt:isoAgo(1200) },
      { id:'demo-worker', fullName:'Ravi Kumar', email:'worker@swachhlens.demo', role:'FIELD_WORKER', createdAt:isoAgo(960) },
      { id:'demo-admin', fullName:'Demo Administrator', email:'admin@swachhlens.demo', role:'ADMIN', createdAt:isoAgo(1400) },
      { id:'demo-recycler', fullName:'GreenLoop Partner', email:'recycler@swachhlens.demo', role:'RECYCLING_PARTNER', createdAt:isoAgo(800) },
    ],
    incidents,
    teams: [
      { id: 'team-bulk', name: 'Alpha Sanitation Crew', teamType: 'Bulk Waste Crew', workerCount: 4, availability: 'AVAILABLE', currentLocation: { latitude: 12.9701, longitude: 77.5962 } },
      { id: 'team-drainage', name: 'Flow Response Unit', teamType: 'Drainage & Sanitation', workerCount: 3, availability: 'ASSIGNED', currentLocation: { latitude: 12.9641, longitude: 77.5945 } },
      { id: 'team-hazmat', name: 'Civic Hazmat 01', teamType: 'Hazmat Response Unit', workerCount: 4, availability: 'ASSIGNED', currentLocation: { latitude: 12.976, longitude: 77.6001 } },
      { id: 'team-recovery', name: 'GreenLoop Recovery', teamType: 'Materials Recovery Team', workerCount: 3, availability: 'AVAILABLE', currentLocation: { latitude: 12.9791, longitude: 77.5908 } },
      { id: 'team-organic', name: 'Market Hygiene Crew', teamType: 'Organic Waste Crew', workerCount: 3, availability: 'AVAILABLE', currentLocation: { latitude: 12.9698, longitude: 77.601 } },
    ],
    vehicles: [
      { id: 'vehicle-mini', name: 'Mini Truck MT-12', vehicleType: 'Mini Truck', capacity: '2.5 tonne class', availability: 'AVAILABLE', currentLocation: { latitude: 12.9702, longitude: 77.5961 } },
      { id: 'vehicle-tipper', name: 'Tipper TT-04', vehicleType: 'Tipper Truck', capacity: '6 tonne class', availability: 'AVAILABLE', currentLocation: { latitude: 12.962, longitude: 77.603 } },
      { id: 'vehicle-containment', name: 'Containment HV-01', vehicleType: 'Containment Vehicle', capacity: 'Hazard-controlled', availability: 'ASSIGNED', currentLocation: { latitude: 12.976, longitude: 77.6 } },
      { id: 'vehicle-recycling', name: 'Recovery Van RV-08', vehicleType: 'Recycling Van', capacity: '1.5 tonne class', availability: 'AVAILABLE', currentLocation: { latitude: 12.979, longitude: 77.591 } },
      { id: 'vehicle-utility', name: 'Utility UV-17', vehicleType: 'Utility Van', capacity: '800 kg class', availability: 'AVAILABLE', currentLocation: { latitude: 12.968, longitude: 77.605 } },
    ],
    assignments: [
      { id: 'as-2050', incidentId: 'SW-2050', teamId: 'team-hazmat', vehicleId: 'vehicle-containment', assignedBy: 'demo-officer', assignedAt: isoAgo(0.8), status: 'ASSIGNED' },
      { id: 'as-2051', incidentId: 'SW-2051', teamId: 'team-bulk', vehicleId: 'vehicle-mini', assignedBy: 'demo-officer', assignedAt: isoAgo(0.4), status: 'ASSIGNED' },
      { id: 'as-2052', incidentId: 'SW-2052', teamId: 'team-recovery', vehicleId: 'vehicle-recycling', assignedBy: 'demo-officer', assignedAt: isoAgo(2), acceptedAt: isoAgo(1.7), dispatchedAt: isoAgo(1.3), status: 'DISPATCHED' },
    ],
    clusters: [
      { id: 'DC-0183', masterIncidentId: 'SW-2053', memberIncidentIds: ['SW-2053', 'SW-2049', 'SW-2067'], similarityScore: 0.91, detectionReason: ['Average proximity 84m', 'Same mixed-waste signature', '12 reports within 72 hours', '9 prototype image matches'], createdAt: isoAgo(14.5) },
      { id: 'DC-0184', masterIncidentId: 'SW-2048', memberIncidentIds: ['SW-2048', 'SW-2059'], similarityScore: 0.84, detectionReason: ['Construction debris category', 'Within 118m', 'Similar visible material'], createdAt: isoAgo(9) },
    ],
    verifications: [
      { id: 'verify-2060', incidentId: 'SW-2060', afterMediaPath: '/demo/cleanup-verified.jpg', verificationStatus: 'VERIFIED', confidence: 0.93, remainingWasteIndicator: 'LOW', createdAt: isoAgo(3) },
      { id: 'verify-2055', incidentId: 'SW-2055', afterMediaPath: '/demo/cleanup-verified.jpg', verificationStatus: 'VERIFIED', confidence: 0.93, remainingWasteIndicator: 'LOW', createdAt: isoAgo(0.5) },
    ],
    notifications: [
      { id: 'note-1', userId: 'demo-officer', title: 'Critical incident near school', message: 'SW-2048 scored 94/100. Drain blockage is visible near a sensitive location.', type: 'CRITICAL', read: false, createdAt: isoAgo(0.3) },
      { id: 'note-2', userId: 'demo-worker', title: 'New cleanup assignment', message: 'SW-2051 is ready for acceptance.', type: 'ASSIGNMENT', read: false, createdAt: isoAgo(0.4) },
      { id: 'note-3', userId: 'demo-citizen', title: 'Cleanup verified', message: 'Your report SW-2061 has been resolved.', type: 'RESOLVED', read: false, createdAt: isoAgo(2) },
    ],
    hotspots: [
      { id: 'hot-1', name: 'Central Market Loop', centerLatitude: 12.9697, centerLongitude: 77.602, riskScore: 87, reportCount: 9, trend: 24, dominantCategory: 'Organic waste', averageResolutionTime: 13.4, signal: '9 reports in 72 hours · resolution time increasing', recommendation: 'Increase post-market collection frequency' },
      { id: 'hot-2', name: 'Ring Road Underpass', centerLatitude: 12.9655, centerLongitude: 77.6038, riskScore: 79, reportCount: 12, trend: 18, dominantCategory: 'Garbage dump', averageResolutionTime: 16.1, signal: '4 repeated incidents · mixed waste dominant', recommendation: 'Add evening patrol and covered collection point' },
      { id: 'hot-3', name: 'North Canal Walk', centerLatitude: 12.9781, centerLongitude: 77.5911, riskScore: 72, reportCount: 6, trend: 12, dominantCategory: 'Plastic waste', averageResolutionTime: 9.8, signal: 'Water-adjacent litter recurrence', recommendation: 'Add recovery bin and weekly channel sweep' },
    ],
    categories: [
      { id:'cat-overflow', name:'Overflowing bin', active:true, handlingNotes:'Standard collection; assess spill perimeter.', sortOrder:1 },
      { id:'cat-dump', name:'Garbage dump', active:true, handlingNotes:'Mixed-waste crew and segregation assessment.', sortOrder:2 },
      { id:'cat-plastic', name:'Plastic waste', active:true, handlingNotes:'Route recoverable material to recycling partner.', sortOrder:3 },
      { id:'cat-construction', name:'Construction debris', active:true, handlingNotes:'Bulk crew; inspect drains and road obstruction.', sortOrder:4 },
      { id:'cat-organic', name:'Organic waste', active:true, handlingNotes:'Covered collection and hygiene controls.', sortOrder:5 },
      { id:'cat-ewaste', name:'E-waste', active:true, handlingNotes:'Authorized recovery with battery precautions.', sortOrder:6 },
      { id:'cat-hazardous', name:'Hazardous waste', active:true, handlingNotes:'Immediate isolation and trained response.', sortOrder:7 },
      { id:'cat-drain', name:'Drain blockage', active:true, handlingNotes:'Drainage response and water-flow verification.', sortOrder:8 },
    ],
    auditLogs: [],
    version: 3,
  }
}
