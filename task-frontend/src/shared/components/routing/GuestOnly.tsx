import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/authContext'
import { getSafeRedirectPath } from '@/shared/lib/redirect'

export function GuestOnly() {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()

  if (isAuthenticated) {
    return (
      <Navigate to={getSafeRedirectPath(searchParams.get('redirect'))} replace />
    )
  }

  return <Outlet />
}
