import { Suspense } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import {
  InspectionsPage,
  LoginPage,
  NewInspectionPage,
  NotFoundPage,
  SummaryPage,
} from '@/app/lazyPages'
import { PageLoader } from '@/shared/components/PageLoader'
import { GuestOnly } from '@/shared/components/routing/GuestOnly'
import { RequireAuth } from '@/shared/components/routing/RequireAuth'
import { DEFAULT_AUTHED_PATH } from '@/shared/lib/redirect'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={DEFAULT_AUTHED_PATH} replace /> },
  {
    element: <GuestOnly />,
    children: [
      {
        element: <PublicLayout />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/inspections', element: <InspectionsPage /> },
          { path: '/inspections/new', element: <NewInspectionPage /> },
          { path: '/summary', element: <SummaryPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])
