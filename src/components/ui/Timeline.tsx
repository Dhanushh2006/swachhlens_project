import { Check } from 'lucide-react'
import { STATUS_FLOW } from '../../config/decisionRules'
import { formatStatus, shortDate } from '../../lib/utils'
import type { IncidentStatus, TimelineEvent } from '../../types/domain'

export function StatusTimeline({ events, currentStatus, compact = false }: { events: TimelineEvent[]; currentStatus: IncidentStatus; compact?: boolean }) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus)
  const visible = compact ? STATUS_FLOW.filter((_, i) => i === 0 || i === currentIndex || i === STATUS_FLOW.length - 1 || (i > currentIndex && i < currentIndex + 2)) : STATUS_FLOW
  return <ol className="space-y-0" aria-label="Incident status timeline">{visible.map((status, index) => {
    const originalIndex = STATUS_FLOW.indexOf(status)
    const complete = originalIndex <= currentIndex
    const event = events.find((item) => item.status === status)
    return <li key={status} className="relative flex gap-3 pb-5 last:pb-0">
      {index < visible.length - 1 && <span className={`absolute left-[11px] top-6 h-[calc(100%-6px)] w-px ${complete ? 'bg-forest-400' : 'bg-slate-200'}`} />}
      <span className={`relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] ${complete ? 'border-forest-600 bg-forest-600 text-white' : 'border-slate-300 bg-white text-slate-400'}`}>{complete ? <Check size={12} strokeWidth={3}/> : originalIndex + 1}</span>
      <div><p className={`text-xs font-bold ${complete ? 'text-ink' : 'text-slate-400'}`}>{formatStatus(status)}</p>{event && <p className="mt-0.5 text-[11px] text-slate-500">{shortDate(event.at)}{event.actor ? ` · ${event.actor}` : ''}</p>}</div>
    </li>
  })}</ol>
}
