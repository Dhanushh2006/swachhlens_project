import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types/domain'
import { PageLoading } from './ui/Loading'

export function ProtectedRoute({ roles, children }: { roles?: Role[]; children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoading />
  if (!profile) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(profile.role)) {
    const route = profile.role === 'CITIZEN' ? '/app' : profile.role === 'FIELD_WORKER' ? '/field' : profile.role === 'RECYCLING_PARTNER' ? '/recycler' : '/command'
    return <Navigate to={route} replace />
  }
  return children
}
