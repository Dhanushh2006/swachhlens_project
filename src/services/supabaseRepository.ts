import { STATUS_FLOW } from '../config/decisionRules'
import { supabase } from '../lib/supabase'
import type { AIAnalysis, AppState, CleanupVerification, Incident, IncidentStatus, NewReportInput, PriorityLevel, SensitivityLevel, VolumeCategory, WasteCategory } from '../types/domain'

const client = () => {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

function fallbackImage(category: WasteCategory) {
  const map: Partial<Record<WasteCategory,string>> = {
    'Construction debris':'/demo/construction-debris.jpg','Overflowing bin':'/demo/overflowing-bin.jpg','Hazardous waste':'/demo/hazardous-waste.jpg',
    'Plastic waste':'/demo/plastic-waste.jpg','Organic waste':'/demo/organic-market.jpg','Drain blockage':'/demo/construction-debris.jpg',
    'Garbage dump':'/demo/overflowing-bin.jpg','E-waste':'/demo/hazardous-waste.jpg',
  }
  return map[category] ?? '/demo/overflowing-bin.jpg'
}

const responseFrom = (value: Record<string,unknown> = {}) => ({
  teamType: String(value.teamType ?? value.team_type ?? 'Standard Cleanup Team'),
  vehicleType: String(value.vehicleType ?? value.vehicle_type ?? 'Utility Van'),
  workerCount: Number(value.workerCount ?? value.worker_count ?? 2),
  escalation: String(value.escalation ?? 'STANDARD') as AIAnalysis['response']['escalation'],
  reason: String(value.reason ?? 'Operational response based on visible waste and location context.'),
})

export async function loadSupabaseState(): Promise<AppState> {
  const db = client()
  const [incidentResult, teamResult, vehicleResult, assignmentResult, clusterResult, memberResult, verificationResult, notificationResult, hotspotResult, auditResult] = await Promise.all([
    db.from('incidents').select('*, ai_analyses(*), incident_media(*), incident_status_events(*)').order('created_at',{ascending:false}).limit(200),
    db.from('teams').select('*').order('name'), db.from('vehicles').select('*').order('name'),
    db.from('assignments').select('*').order('assigned_at',{ascending:false}), db.from('duplicate_clusters').select('*').order('created_at',{ascending:false}),
    db.from('duplicate_cluster_members').select('*'), db.from('cleanup_verifications').select('*').order('created_at',{ascending:false}),
    db.from('notifications').select('*').order('created_at',{ascending:false}).limit(100), db.from('hotspots').select('*').order('risk_score',{ascending:false}),
    db.from('audit_logs').select('*').order('created_at',{ascending:false}).limit(100),
  ])
  const firstError = [incidentResult,teamResult,vehicleResult,assignmentResult,clusterResult,memberResult,verificationResult,notificationResult,hotspotResult,auditResult].find(result=>result.error)?.error
  if (firstError) throw new Error(firstError.message)
  const assignmentsRaw = assignmentResult.data ?? []
  const mediaPaths = (incidentResult.data ?? []).flatMap((raw:any)=>(raw.incident_media??[]).map((media:any)=>media.storage_path)).filter(Boolean)
  const signedResult = mediaPaths.length ? await db.storage.from('incident-media').createSignedUrls(mediaPaths, 3600) : { data: [], error: null }
  const signedUrls = new Map((signedResult.data ?? []).map((item:any)=>[item.path,item.signedUrl]))
  const cleanupPaths = (verificationResult.data ?? []).map((raw:any)=>raw.after_media_path).filter(Boolean)
  const cleanupSignedResult = cleanupPaths.length ? await db.storage.from('cleanup-evidence').createSignedUrls(cleanupPaths, 3600) : { data: [], error: null }
  const cleanupSignedUrls = new Map((cleanupSignedResult.data ?? []).map((item:any)=>[item.path,item.signedUrl]))
  const incidents: Incident[] = (incidentResult.data ?? []).map((raw: any) => {
    const analysisRaw = [...(raw.ai_analyses ?? [])].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0] ?? {}
    const category = (raw.waste_category ?? analysisRaw.waste_categories?.[0] ?? 'Garbage dump') as WasteCategory
    const confidence = Number(analysisRaw.confidence_scores?.[category] ?? .7)
    const media = raw.incident_media?.[0]
    const assignment = assignmentsRaw.find((item:any)=>item.incident_id===raw.id)
    const currentIndex = STATUS_FLOW.indexOf(raw.status as IncidentStatus)
    const events = raw.incident_status_events?.map((event:any)=>({status:event.to_status,at:event.created_at,note:event.note})) ?? []
    const timeline = events.length ? [{status:'REPORTED' as IncidentStatus,at:raw.created_at},...events] : STATUS_FLOW.slice(0,currentIndex+1).map(status=>({status,at:raw.created_at,actor:'SWACHHLENS'}))
    const recommendation = analysisRaw.recommended_action ?? {}
    return {
      id: raw.display_id, backendId: raw.id, reporterId: raw.reporter_id, latitude:raw.latitude,longitude:raw.longitude,address:raw.address,capturedAt:raw.captured_at,
      description:raw.description,status:raw.status,wasteCategory:category,volumeCategory:(raw.volume_category??analysisRaw.volume_category??'Medium') as VolumeCategory,
      actionScore:raw.action_score??0,scoreBreakdown:{volume:raw.score_factors?.volume??0,locationSensitivity:raw.score_factors?.locationSensitivity??raw.score_factors?.location_sensitivity??0,reportFrequency:raw.score_factors?.reportFrequency??raw.score_factors?.report_frequency??0,complaintAge:raw.score_factors?.complaintAge??raw.score_factors?.complaint_age??0,hazardContext:raw.score_factors?.hazardContext??raw.score_factors?.hazard_context??0},
      priorityLevel:(raw.priority_level??'LOW') as PriorityLevel,locationSensitivity:(raw.location_sensitivity??'LOW') as SensitivityLevel,sensitivityReason:raw.sensitivity_reason??'No sensitive location signal',reportCount:raw.report_count,
      mediaUrl:media?.storage_path ? (signedUrls.get(media.storage_path) ?? fallbackImage(category)) : fallbackImage(category), analysis:{id:analysisRaw.id??`pending-${raw.id}`,categories:[{category,confidence}],volumeCategory:(analysisRaw.volume_category??raw.volume_category??'Medium') as VolumeCategory,volumeConfidence:Number(analysisRaw.volume_confidence??.7),hazardFlags:analysisRaw.hazard_flags??[],recommendedAction:String(recommendation.summary??''),response:responseFrom(recommendation),modelVersion:analysisRaw.model_version??'pending',isPrototype:analysisRaw.is_prototype??true,createdAt:analysisRaw.created_at??raw.created_at},
      duplicateMasterId:raw.duplicate_master_id, timeline,assignedTeamId:assignment?.team_id,assignedVehicleId:assignment?.vehicle_id,createdAt:raw.created_at,updatedAt:raw.updated_at,
    } as Incident
  })
  const backendToDisplay = new Map((incidentResult.data??[]).map((raw:any)=>[raw.id,raw.display_id]))
  return {
    incidents,
    teams:(teamResult.data??[]).map((raw:any)=>({id:raw.id,name:raw.name,teamType:raw.team_type,workerCount:raw.worker_count,availability:raw.availability,currentLocation:raw.current_location??{latitude:0,longitude:0}})),
    vehicles:(vehicleResult.data??[]).map((raw:any)=>({id:raw.id,name:raw.name,vehicleType:raw.vehicle_type,capacity:raw.capacity,availability:raw.availability,currentLocation:raw.current_location??{latitude:0,longitude:0}})),
    assignments:assignmentsRaw.map((raw:any)=>({id:raw.id,incidentId:backendToDisplay.get(raw.incident_id)??raw.incident_id,teamId:raw.team_id,vehicleId:raw.vehicle_id,assignedBy:raw.assigned_by,assignedAt:raw.assigned_at,acceptedAt:raw.accepted_at,dispatchedAt:raw.dispatched_at,completedAt:raw.completed_at,status:raw.status})),
    clusters:(clusterResult.data??[]).map((raw:any)=>({id:raw.id,masterIncidentId:backendToDisplay.get(raw.master_incident_id)??raw.master_incident_id,memberIncidentIds:(memberResult.data??[]).filter((m:any)=>m.cluster_id===raw.id).map((m:any)=>backendToDisplay.get(m.incident_id)??m.incident_id),similarityScore:Number(raw.similarity_score),detectionReason:raw.detection_reason??[],createdAt:raw.created_at})),
    verifications:(verificationResult.data??[]).map((raw:any)=>({id:raw.id,incidentId:backendToDisplay.get(raw.incident_id)??raw.incident_id,afterMediaPath:cleanupSignedUrls.get(raw.after_media_path)??raw.after_media_path,verificationStatus:raw.verification_status,confidence:Number(raw.confidence),remainingWasteIndicator:raw.remaining_waste_indicator,createdAt:raw.created_at})),
    notifications:(notificationResult.data??[]).map((raw:any)=>({id:raw.id,userId:raw.user_id,title:raw.title,message:raw.message,type:raw.type,read:raw.read,createdAt:raw.created_at})),
    hotspots:(hotspotResult.data??[]).map((raw:any)=>({id:raw.id,name:raw.name,centerLatitude:raw.center_latitude,centerLongitude:raw.center_longitude,riskScore:raw.risk_score,reportCount:raw.report_count,trend:Number(raw.trend),dominantCategory:raw.dominant_category,averageResolutionTime:Number(raw.average_resolution_time),signal:raw.signal,recommendation:raw.recommendation})),
    auditLogs:(auditResult.data??[]).map((raw:any)=>({id:raw.id,userId:raw.user_id,action:raw.action,entityType:raw.entity_type,entityId:raw.entity_id,metadata:raw.metadata,createdAt:raw.created_at})),version:1,
  }
}

async function uploadDataUrl(bucket:string,path:string,url:string){if(!url.startsWith('data:')&&!url.startsWith('/'))return url;const blob=await (await fetch(url)).blob();const {error}=await client().storage.from(bucket).upload(path,blob,{contentType:blob.type||'image/jpeg',upsert:false});if(error)throw new Error(error.message);return path}

export async function submitSupabaseReport(input:NewReportInput){const db=client();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error('Sign in before submitting a report.');const mediaPath=await uploadDataUrl('incident-media',`${user.id}/${crypto.randomUUID()}.jpg`,input.mediaUrl);const {data,error}=await db.functions.invoke('submit-report',{body:{...input,mediaPath}});if(error)throw new Error(error.message);return data as {displayId:string}}
export async function assignSupabaseIncident(backendId:string,teamId:string,vehicleId:string){const {error}=await client().rpc('assign_response',{target_incident:backendId,target_team:teamId,target_vehicle:vehicleId});if(error)throw new Error(error.message)}
export async function transitionSupabaseIncident(backendId:string,status:IncidentStatus,note?:string){const {error}=await client().rpc('advance_incident_status',{target_incident:backendId,target_status:status,transition_note:note??null});if(error)throw new Error(error.message)}
export async function verifySupabaseCleanup(backendId:string,imageName:string,imageUrl:string){const db=client();const path=await uploadDataUrl('cleanup-evidence',`${backendId}/${crypto.randomUUID()}.jpg`,imageUrl);const {data,error}=await db.functions.invoke('verify-cleanup',{body:{incidentId:backendId,afterMediaPath:path,imageName}});if(error)throw new Error(error.message);return { ...(data as CleanupVerification), afterMediaPath: imageUrl }}
export async function readSupabaseNotification(id:string){const {error}=await client().from('notifications').update({read:true}).eq('id',id);if(error)throw new Error(error.message)}
