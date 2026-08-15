import { cn, formatStatus } from '../../lib/utils'
import type { ReactNode } from 'react'

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'critical'|'high'|'medium'|'low'|'info'|'success'|'neutral'; className?: string }) {
  const styles = { critical: 'border-red-200 bg-red-50 text-red-700', high: 'border-orange-200 bg-orange-50 text-orange-700', medium: 'border-amber-200 bg-amber-50 text-amber-800', low: 'border-emerald-200 bg-emerald-50 text-emerald-700', success: 'border-emerald-200 bg-emerald-50 text-emerald-700', info: 'border-blue-200 bg-blue-50 text-blue-700', neutral: 'border-slate-200 bg-slate-50 text-slate-600' }
  return <span className={cn('inline-flex items-center whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-extrabold uppercase tracking-[.08em]', styles[tone], className)}>{children}</span>
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone = priority === 'CRITICAL' ? 'critical' : priority === 'HIGH' ? 'high' : priority === 'MEDIUM' ? 'medium' : 'low'
  return <Badge tone={tone}>{priority}</Badge>
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={status === 'RESOLVED' ? 'success' : status === 'PRIORITIZED' ? 'high' : 'info'}>{formatStatus(status)}</Badge>
}
