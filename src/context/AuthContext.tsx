import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Profile, Role } from '../types/domain'

interface AuthContextValue {
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (fullName: string, email: string, password: string) => Promise<void>
  signInDemo: (role: Role) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const SESSION_KEY = 'swachhlens-demo-role'

const demoProfiles: Record<Role, Profile> = {
  CITIZEN: { id: 'demo-citizen', fullName: 'Aarav Citizen', email: 'citizen@swachhlens.demo', role: 'CITIZEN', createdAt: new Date().toISOString() },
  MUNICIPAL_OFFICER: { id: 'demo-officer', fullName: 'Meera Rao', email: 'officer@swachhlens.demo', role: 'MUNICIPAL_OFFICER', createdAt: new Date().toISOString() },
  FIELD_WORKER: { id: 'demo-worker', fullName: 'Ravi Kumar', email: 'worker@swachhlens.demo', role: 'FIELD_WORKER', createdAt: new Date().toISOString() },
  ADMIN: { id: 'demo-admin', fullName: 'Demo Administrator', email: 'admin@swachhlens.demo', role: 'ADMIN', createdAt: new Date().toISOString() },
  RECYCLING_PARTNER: { id: 'demo-recycler', fullName: 'GreenLoop Partner', email: 'recycler@swachhlens.demo', role: 'RECYCLING_PARTNER', createdAt: new Date().toISOString() },
}

function profileFromUser(user: User, role: Role = 'CITIZEN'): Profile {
  return { id: user.id, fullName: user.user_metadata.full_name ?? user.email?.split('@')[0] ?? 'Citizen', email: user.email ?? '', role: (user.user_metadata.role as Role) ?? role, createdAt: user.created_at }
}

async function resolveProfile(user: User): Promise<Profile> {
  if (!supabase) return profileFromUser(user)
  const { data } = await supabase.from('profiles').select('id,full_name,email,phone,role,avatar_url,created_at').eq('id',user.id).maybeSingle()
  if (!data) return profileFromUser(user)
  return { id:data.id,fullName:data.full_name,email:data.email,phone:data.phone??undefined,role:data.role as Role,avatarUrl:data.avatar_url??undefined,createdAt:data.created_at }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const savedRole = sessionStorage.getItem(SESSION_KEY) as Role | null
    if (savedRole && demoProfiles[savedRole]) {
      setProfile(demoProfiles[savedRole]); setIsDemo(true); setLoading(false); return
    }
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(async ({ data }) => {
      setProfile(data.session?.user ? await resolveProfile(data.session.user) : null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setProfile(null)
      else window.setTimeout(() => { void resolveProfile(session.user).then(setProfile) }, 0)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    profile, loading, isDemo,
    async signIn(email, password) {
      if (!supabase) throw new Error('Supabase is not configured. Use one of the secure demo access buttons below.')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
      if (data.user) { setProfile(await resolveProfile(data.user)); setIsDemo(false) }
    },
    async signUp(fullName, email, password) {
      if (!supabase) throw new Error('Supabase is not configured in this preview. Demo access remains available.')
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role: 'CITIZEN' } } })
      if (error) throw new Error(error.message)
      if (data.user) setProfile(await resolveProfile(data.user))
    },
    signInDemo(role) {
      sessionStorage.setItem(SESSION_KEY, role)
      setProfile(demoProfiles[role]); setIsDemo(true)
    },
    async signOut() {
      sessionStorage.removeItem(SESSION_KEY)
      if (supabase && !isDemo) await supabase.auth.signOut()
      setProfile(null); setIsDemo(false)
    },
  }), [profile, loading, isDemo])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export { demoProfiles, isSupabaseConfigured }
