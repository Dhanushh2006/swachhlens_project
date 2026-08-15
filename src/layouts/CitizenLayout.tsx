import { ClipboardList, Home, Map, Plus, UserRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../components/brand/Logo'
import { DemoBar } from '../components/DemoBar'
import { useAuth } from '../context/AuthContext'
import { NotificationMenu } from '../components/NotificationMenu'
import { cn } from '../lib/utils'

export function CitizenLayout() {
  const { signOut } = useAuth(); const navigate = useNavigate()
  const nav = [{to:'/app',label:'Home',icon:Home,end:true},{to:'/app/reports',label:'My reports',icon:ClipboardList},{to:'/app/report',label:'Report',icon:Plus,primary:true},{to:'/app/nearby',label:'Nearby',icon:Map}]
  return <div className="min-h-screen bg-canvas"><DemoBar/><header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4"><Logo/><div className="flex items-center gap-1"><NotificationMenu/><button onClick={()=>void signOut().then(()=>navigate('/'))} className="grid h-10 w-10 place-items-center rounded-full bg-forest-100 text-forest-800" title="Sign out"><UserRound size={18}/></button></div></div></header>
    <main className="mobile-safe mx-auto max-w-2xl"><Outlet/></main>
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-2 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-6px_24px_rgba(15,50,40,.06)]"><div className="mx-auto grid max-w-xl grid-cols-4">{nav.map(({to,label,icon:Icon,primary,end})=><NavLink to={to} end={end} key={to} className={({isActive})=>cn('relative flex min-h-[54px] flex-col items-center justify-center gap-1 text-[10px] font-bold',isActive?'text-forest-700':'text-slate-500')}>{primary?<span className="absolute -top-6 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-forest-700 text-white shadow-lift"><Icon size={26}/></span>:<Icon size={20}/>}<span className={primary?'mt-8':''}>{label}</span></NavLink>)}</div></nav>
  </div>
}
