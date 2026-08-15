import { FlaskConical, RotateCcw } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Button } from './ui/Button'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function DemoBar() {
  const { resetDemo } = useData()
  const { isDemo } = useAuth()
  const connected = isSupabaseConfigured && !isDemo
  return <div className="flex min-h-8 items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-1 text-center text-[10px] font-bold text-amber-900 sm:text-xs">
    <FlaskConical size={13}/><span>PROTOTYPE MODE · {connected ? 'Connected Supabase backend' : 'Persistent IndexedDB demo data'} · AI-assisted</span>
    {!connected && <Button variant="ghost" size="sm" className="ml-1 min-h-6 px-1.5 py-0 text-[10px] text-amber-900 hover:bg-amber-100" icon={<RotateCcw size={11}/>} onClick={() => void resetDemo()}>Reset</Button>}
  </div>
}
