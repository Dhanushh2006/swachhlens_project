import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: 'sm' | 'md' | 'lg'; loading?: boolean; icon?: ReactNode }

export function Button({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }: Props) {
  return <button disabled={disabled || loading} className={cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-55',
    variant === 'primary' && 'bg-forest-700 text-white shadow-sm hover:bg-forest-800',
    variant === 'secondary' && 'bg-forest-100 text-forest-800 hover:bg-forest-50',
    variant === 'outline' && 'border border-slate-300 bg-white text-ink hover:border-forest-400 hover:bg-forest-50',
    variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
    variant === 'ghost' && 'text-slate-600 hover:bg-slate-100 hover:text-ink',
    size === 'sm' && 'min-h-9 px-3 text-xs', size === 'md' && 'min-h-11 px-4 text-sm', size === 'lg' && 'min-h-13 px-5 text-base', className,
  )} {...props}>{loading ? <Loader2 size={17} className="animate-spin" /> : icon}{children}</button>
}
