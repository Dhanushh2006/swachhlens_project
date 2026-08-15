import { AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext'

export function DataErrorBanner(){const {error}=useData();if(!error)return null;return <div role="alert" className="flex items-center justify-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-800"><AlertTriangle size={15} className="shrink-0"/><span>Operational data issue: {error}</span></div>}
