import { Bell, Check, CheckCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { cn, timeAgo } from '../lib/utils'
import { Badge } from './ui/Badge'

export function NotificationMenu({compact=false}:{compact?:boolean}){
  const {profile}=useAuth();const {notifications,markNotificationRead}=useData();const [open,setOpen]=useState(false);const ref=useRef<HTMLDivElement>(null)
  const mine=notifications.filter(item=>item.userId===profile?.id);const unread=mine.filter(item=>!item.read).length
  useEffect(()=>{const close=(event:MouseEvent)=>{if(!ref.current?.contains(event.target as Node))setOpen(false)};document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close)},[])
  return <div className="relative" ref={ref}><button onClick={()=>setOpen(v=>!v)} className={cn('relative grid place-items-center rounded-lg border border-slate-200 bg-white text-slate-600',compact?'h-9 w-9':'h-10 w-10')} aria-label={`${unread} unread notifications`} aria-expanded={open}><Bell size={compact?17:19}/>{unread>0&&<span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[8px] font-bold text-white">{unread}</span>}</button>
  {open&&<div className="absolute right-0 top-12 z-[1000] w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-lift"><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><p className="eyebrow">In-app alerts</p><h2 className="mt-1 text-sm font-black">Notifications</h2></div><Badge tone={unread?'critical':'success'}>{unread} unread</Badge></div>{mine.length?<div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">{mine.slice(0,8).map(item=><button key={item.id} disabled={item.read} onClick={()=>void markNotificationRead(item.id)} className={cn('flex w-full gap-3 p-4 text-left',!item.read?'bg-blue-50/60 hover:bg-blue-50':'bg-white')}><span className={cn('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full',item.read?'bg-slate-100 text-slate-400':'bg-blue-100 text-blue-700')}>{item.read?<Check size={13}/>:<Bell size={13}/>}</span><span className="min-w-0 flex-1"><b className="block text-xs text-ink">{item.title}</b><span className="mt-1 block text-[11px] leading-4 text-slate-600">{item.message}</span><span className="mt-1.5 block text-[9px] text-slate-400">{timeAgo(item.createdAt)}{!item.read?' · Select to mark read':''}</span></span></button>)}</div>:<div className="p-8 text-center"><CheckCheck className="mx-auto text-forest-600"/><p className="mt-3 text-xs font-bold">You are all caught up</p></div>}</div>}</div>
}
