import { Activity, BarChart3, Building2, ChevronDown, CircleDot, Flame, LayoutDashboard, Map, Menu, Network, Search, Settings, Truck, UsersRound, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { DemoBar } from '../components/DemoBar'
import { DataErrorBanner } from '../components/DataErrorBanner'
import { Logo } from '../components/brand/Logo'
import { useAuth } from '../context/AuthContext'
import { NotificationMenu } from '../components/NotificationMenu'
import { cn } from '../lib/utils'

const nav = [
  {to:'/command',label:'Overview',icon:LayoutDashboard,end:true}, {to:'/command/incidents',label:'Live incidents',icon:CircleDot},
  {to:'/command/priority',label:'Priority queue',icon:Activity}, {to:'/command/map',label:'City map',icon:Map},
  {to:'/command/clusters',label:'Duplicate clusters',icon:Network}, {to:'/command/teams',label:'Teams',icon:UsersRound},
  {to:'/command/vehicles',label:'Vehicles',icon:Truck}, {to:'/command/hotspots',label:'Hotspots',icon:Flame},
  {to:'/command/analytics',label:'Analytics',icon:BarChart3}, {to:'/command/settings',label:'Settings',icon:Settings},
]

export function CommandLayout(){const [open,setOpen]=useState(false);const [search,setSearch]=useState('');const {profile,signOut}=useAuth();const navigate=useNavigate()
  const sidebar=<><div className="flex h-20 items-center justify-between px-5"><Logo inverse/><button className="text-white lg:hidden" onClick={()=>setOpen(false)}><X/></button></div><div className="px-5 pb-4"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-forest-100/70">Municipal Command Center</p></div><nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">{nav.map(({to,label,icon:Icon,end})=><NavLink onClick={()=>setOpen(false)} end={end} to={to} key={to} className={({isActive})=>cn('flex h-10 items-center gap-3 rounded-lg px-3 text-xs font-bold transition',isActive?'bg-white text-forest-900 shadow-sm':'text-forest-100 hover:bg-white/10 hover:text-white')}><Icon size={17}/>{label}</NavLink>)}</nav><div className="border-t border-white/10 p-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white"><Building2 size={18}/></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{profile?.fullName}</p><p className="truncate text-[10px] text-forest-100">Municipal operations</p></div><button onClick={()=>void signOut().then(()=>navigate('/'))} title="Sign out" className="text-forest-100"><ChevronDown size={16}/></button></div></div></>
  return <div className="min-h-screen bg-canvas"><DemoBar/><DataErrorBanner/><aside className="fixed inset-y-8 left-0 z-50 hidden w-60 flex-col bg-forest-800 lg:flex">{sidebar}</aside>{open&&<><button className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={()=>setOpen(false)} aria-label="Close navigation"/><aside className="fixed inset-y-8 left-0 z-50 flex w-72 flex-col bg-forest-800 lg:hidden">{sidebar}</aside></>}
    <div className="lg:pl-60"><header className="sticky top-8 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8"><button className="lg:hidden" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu/></button><form className="relative hidden max-w-md flex-1 md:block" onSubmit={(event)=>{event.preventDefault();navigate(`/command/incidents?query=${encodeURIComponent(search)}`)}}><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event)=>setSearch(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs" placeholder="Search incident, address or category…" aria-label="Search command center"/></form><div className="ml-auto flex items-center gap-3"><span className="hidden items-center gap-2 rounded-md bg-forest-50 px-2.5 py-1.5 text-[10px] font-bold text-forest-700 sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"/>LIVE DATA</span><NotificationMenu compact/></div></header><main><Outlet/></main></div>
  </div>
}
