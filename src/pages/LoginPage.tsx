import { useState, type FormEvent } from 'react'
import { ArrowLeft, Building2, HardHat, Leaf, LockKeyhole, Shield, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/brand/Logo'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types/domain'

const demoRoles: { role: Role; title: string; subtitle: string; icon: typeof UserRound; path: string }[] = [
  { role: 'CITIZEN', title: 'Citizen', subtitle: 'Report & track', icon: UserRound, path: '/app' },
  { role: 'MUNICIPAL_OFFICER', title: 'Municipal officer', subtitle: 'Command center', icon: Building2, path: '/command' },
  { role: 'FIELD_WORKER', title: 'Field worker', subtitle: 'Assigned cleanup', icon: HardHat, path: '/field' },
  { role: 'RECYCLING_PARTNER', title: 'Recycling partner', subtitle: 'Recovery queue', icon: Leaf, path: '/recycler' },
  { role: 'ADMIN', title: 'Administrator', subtitle: 'Resources & audit', icon: Shield, path: '/admin' },
]

export function LoginPage() {
  const { signIn, signInDemo } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const demo = (role: Role, path: string) => { signInDemo(role); navigate(path) }
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { await signIn(email, password); navigate('/app') } catch (err) { setError(err instanceof Error ? err.message : 'Sign in failed.') } finally { setBusy(false) } }
  return <main className="grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
    <section className="bg-forest-800 p-6 text-white sm:p-10 lg:flex lg:flex-col lg:justify-between"><Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-forest-100"><ArrowLeft size={16}/> Back</Link><div className="my-12 max-w-xl lg:my-0"><Logo inverse/><h1 className="mt-10 text-4xl font-black leading-tight tracking-tight sm:text-5xl">See Waste.<br/>Understand Risk.<br/><span className="text-[#86d4b1]">Dispatch Smarter.</span></h1><p className="mt-5 max-w-md leading-7 text-forest-100">Choose a secure, password-free demo role to test connected end-to-end workflows.</p></div><p className="hidden text-xs text-forest-100 lg:block">TechNova Season 3 · Competition prototype</p></section>
    <section className="bg-canvas px-5 py-10 sm:px-10 lg:grid lg:place-items-center"><div className="w-full max-w-2xl"><p className="eyebrow">Instant demo access</p><h2 className="mt-2 text-2xl font-black">Choose your operational view</h2><p className="mt-2 text-sm text-slate-500">No demo password is exposed or required.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{demoRoles.map(({ role,title,subtitle,icon: Icon,path }) => <button key={role} onClick={() => demo(role,path)} className="card group flex items-center gap-4 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-forest-300 hover:shadow-lift"><span className="grid h-11 w-11 place-items-center rounded-xl bg-forest-50 text-forest-700 group-hover:bg-forest-700 group-hover:text-white"><Icon size={21}/></span><span><b className="block text-sm text-ink">{title}</b><span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span></span></button>)}</div>
      <div className="my-7 flex items-center gap-4"><span className="h-px flex-1 bg-slate-200"/><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Configured Supabase account</span><span className="h-px flex-1 bg-slate-200"/></div>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><div><label className="sr-only" htmlFor="email">Email</label><input className="input" id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email address" required/></div><div><label className="sr-only" htmlFor="password">Password</label><input className="input" id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" required minLength={6}/></div><Button type="submit" loading={busy} icon={<LockKeyhole size={16}/>}>Sign in</Button></form>{error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500">Supabase Auth activates when environment variables are configured. Demo identities are isolated prototype sessions. <Link to="/signup" className="font-bold text-forest-700">Create citizen account</Link> · <Link to="/privacy" className="font-bold text-forest-700">Privacy details</Link></p>
    </div></section>
  </main>
}
