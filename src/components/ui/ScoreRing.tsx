import { cn } from '../../lib/utils'

export function ScoreRing({ score, size = 'md', light = false }: { score: number; size?: 'sm' | 'md' | 'lg'; light?: boolean }) {
  const color = score >= 85 ? '#c93235' : score >= 68 ? '#dd6b20' : score >= 42 ? '#b7791f' : '#23815d'
  return <div className={cn('score-ring relative grid shrink-0 place-items-center rounded-full', size === 'sm' && 'h-14 w-14', size === 'md' && 'h-20 w-20', size === 'lg' && 'h-32 w-32')} style={{ '--score': score, '--score-color': color } as React.CSSProperties}>
    <div className={cn('relative z-10 text-center font-black leading-none', light ? 'text-white' : 'text-ink', size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl')}>{score}<span className={cn('block font-bold text-slate-400', size === 'lg' ? 'mt-1 text-[11px]' : 'text-[8px]')}>/ 100</span></div>
  </div>
}
