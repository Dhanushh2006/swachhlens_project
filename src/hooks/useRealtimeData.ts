import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

/** Subscribes to operational table changes when Supabase is configured.
 * IndexedDB prototype mutations update React state immediately through DataContext.
 */
export function useRealtimeData(onChange: () => void) {
  useEffect(() => {
    const client = supabase
    if (!client) return
    const channel = client.channel('operational-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cleanup_verifications' }, onChange)
      .subscribe()
    return () => { void client.removeChannel(channel) }
  }, [onChange])
}
