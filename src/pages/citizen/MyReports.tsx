import { ClipboardList, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/Loading'
import { IncidentMedia } from '../../components/ui/IncidentMedia'
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { shortDate } from '../../lib/utils'

export function MyReports() {
  const { profile }=useAuth(); const { incidents }=useData()
  const own=incidents.filter((item)=>item.reporterId===profile?.id)
  const shown=own.length?own:incidents.slice(0,4)
  return <div className="px-4 py-6 sm:px-6"><div><p className="eyebrow">Citizen tracking</p><h1 className="mt-1 text-2xl font-black">My reports</h1><p className="mt-2 text-sm text-slate-500">Follow every incident from report to verified resolution.</p></div>
    {!shown.length?<div className="mt-6"><EmptyState icon={<ClipboardList/>} title="No reports yet" description="Your submitted waste reports will appear here with a live status timeline."/></div>:<div className="mt-6 space-y-3">{shown.map((incident)=><Link key={incident.id} to={`/app/reports/${incident.id}`} className="card block rounded-2xl p-4"><div className="flex items-start gap-3"><IncidentMedia url={incident.mediaUrl} type={incident.mediaType} className="h-20 w-20 rounded-xl" alt="Waste report evidence"/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><b>{incident.id}</b><StatusBadge status={incident.status}/></div><h2 className="mt-2 text-sm font-bold">{incident.wasteCategory} · {incident.volumeCategory}</h2><p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500"><MapPin size={12}/>{incident.address}</p><div className="mt-3 flex items-center justify-between"><PriorityBadge priority={incident.priorityLevel}/><span className="text-[10px] text-slate-400">{shortDate(incident.createdAt)}</span></div></div></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-forest-600" style={{width:`${Math.max(12,(incident.timeline.length/11)*100)}%`}}/></div></Link>)}</div>}
  </div>
}
