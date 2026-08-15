import { cn } from '../../lib/utils'

export function Logo({ compact = false, inverse = false, className }: { compact?: boolean; inverse?: boolean; className?: string }) {
  return <div className={cn('flex items-center gap-2.5', className)} aria-label="SWACHHLENS">
    <svg width="38" height="38" viewBox="0 0 42 42" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M4.5 21C8.3 13.8 14 10.2 21 10.2S33.7 13.8 37.5 21C33.7 28.2 28 31.8 21 31.8S8.3 28.2 4.5 21Z" stroke={inverse ? '#fff' : '#0f684d'} strokeWidth="2.8"/>
      <circle cx="21" cy="21" r="6.2" fill={inverse ? '#d5efe3' : '#15805f'}/>
      <path d="M21.2 20.7c4.2-6.7 9.2-8.2 13.4-6.8-1 5.8-5.2 9-13.4 6.8Z" fill={inverse ? '#fff' : '#79b99d'}/>
      <path d="M21 24v9" stroke={inverse ? '#fff' : '#0f684d'} strokeWidth="2.6" strokeLinecap="round"/>
      <path d="m17.8 30.4 3.2 3.4 3.2-3.4" stroke={inverse ? '#fff' : '#0f684d'} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    {!compact && <div className="leading-none">
      <div className={cn('text-[17px] font-black tracking-[.09em]', inverse ? 'text-white' : 'text-forest-800')}>SWACHH<span className={inverse ? 'text-forest-100' : 'text-forest-500'}>LENS</span></div>
      <div className={cn('mt-1 text-[8px] font-bold uppercase tracking-[.16em]', inverse ? 'text-forest-100' : 'text-slate-500')}>See · Understand · Act</div>
    </div>}
  </div>
}
