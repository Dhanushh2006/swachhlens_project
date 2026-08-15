export function PageLoading() {
  return <div className="grid min-h-[60vh] place-items-center"><div className="text-center"><div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-forest-100 border-t-forest-600"/><p className="mt-4 text-sm font-semibold text-slate-500">Loading operational data…</p></div></div>
}

export function Skeleton({ className = '' }: { className?: string }) { return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} /> }

export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><div><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest-50 text-forest-700">{icon}</div><h3 className="mt-4 font-bold text-ink">{title}</h3><p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p></div></div>
}
