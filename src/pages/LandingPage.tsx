import { ArrowRight, BrainCircuit, Camera, CheckCircle2, Route, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/brand/Logo'
import { Button } from '../components/ui/Button'
import { publicAsset } from '../lib/utils'

export function LandingPage() {
  return <main className="min-h-screen bg-[#f7faf8]">
    <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"><Logo/><Link to="/login"><Button variant="outline">Open prototype <ArrowRight size={16}/></Button></Link></header>
    <section className="relative overflow-hidden border-y border-forest-100 bg-forest-800 text-white">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,#fff 1px,transparent 0)', backgroundSize: '28px 28px' }}/>
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.05fr_.95fr] md:py-24">
        <div><div className="inline-flex items-center gap-2 rounded-full border border-forest-500 bg-forest-700 px-3 py-1.5 text-xs font-bold text-forest-50"><Sparkles size={14}/> AI-assisted waste response intelligence</div>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.04] tracking-[-.04em] sm:text-6xl">One report.<br/><span className="text-[#86d4b1]">One operational decision.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-forest-100 sm:text-lg">SWACHHLENS turns a citizen photo into explainable priority, duplicate intelligence and a dispatch-ready response plan.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/login"><Button size="lg" className="bg-white text-forest-800 hover:bg-forest-50">Explore working demo <ArrowRight size={18}/></Button></Link><a href="#workflow"><Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">See the workflow</Button></a></div>
          <p className="mt-5 flex items-center gap-2 text-xs text-forest-100"><ShieldCheck size={15}/> Privacy-first prototype · No facial recognition · Demo data clearly labelled</p>
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-white text-ink shadow-2xl">
            <img src={publicAsset('/demo/construction-debris.jpg')} className="h-60 w-full object-cover" alt="Demo construction debris incident"/>
            <div className="p-5"><div className="flex items-center justify-between"><span className="text-xs font-extrabold uppercase tracking-widest text-red-600">Critical incident</span><span className="text-xs font-bold text-slate-500">SW-2048</span></div><div className="mt-3 flex items-end justify-between"><div><h2 className="text-xl font-black">Construction debris</h2><p className="mt-1 text-sm text-slate-500">Large · Drain blockage · Near school</p></div><div className="text-right"><div className="text-3xl font-black text-red-600">94</div><div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">ActionScore</div></div></div><div className="mt-4 rounded-xl bg-forest-50 p-3 text-sm"><b className="text-forest-800">ResponseMatch™</b><p className="mt-1 text-slate-600">Mini truck + 3 workers · Immediate escalation</p></div></div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-slate-200 bg-white p-3 shadow-lift sm:block"><p className="text-[10px] font-bold uppercase text-slate-400">Duplicate intelligence</p><p className="mt-1 font-black text-forest-800">12 reports → 1 response</p></div>
        </div>
      </div>
    </section>
    <section id="workflow" className="mx-auto max-w-7xl px-5 py-20 sm:px-8"><div className="max-w-2xl"><p className="eyebrow">The full intelligence loop</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Beyond complaint collection</h2><p className="mt-3 text-slate-600">Each step produces structured operational data and a traceable decision.</p></div>
      <div className="mt-10 grid gap-4 md:grid-cols-4">{[
        [Camera,'Report','Photo, GPS, time and context'],[BrainCircuit,'Understand','Category, volume and hazards'],[Route,'Dispatch','Priority, team and vehicle'],[CheckCircle2,'Verify','Before/after cleanup evidence']
      ].map(([Icon,title,copy]) => <div className="card rounded-2xl p-5" key={String(title)}><div className="grid h-10 w-10 place-items-center rounded-xl bg-forest-100 text-forest-700"><Icon size={20}/></div><h3 className="mt-4 font-black">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy as string}</p></div>)}</div>
    </section>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Logo/><p className="text-xs text-slate-500">Competition prototype · AI-assisted decision support, not an official municipal integration.</p><Link to="/privacy" className="text-xs font-bold text-forest-700">Privacy by design</Link></div></footer>
  </main>
}
