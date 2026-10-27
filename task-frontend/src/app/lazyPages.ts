import { lazy } from 'react'

export const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({
    default: m.LoginPage,
  })),
)

export const InspectionsPage = lazy(() =>
  import('@/features/inspections/pages/InspectionsPage').then((m) => ({
    default: m.InspectionsPage,
  })),
)

export const NewInspectionPage = lazy(() =>
  import('@/features/inspections/pages/NewInspectionPage').then((m) => ({
    default: m.NewInspectionPage,
  })),
)

export const SummaryPage = lazy(() =>
  import('@/features/inspections/pages/SummaryPage').then((m) => ({
    default: m.SummaryPage,
  })),
)

export const NotFoundPage = lazy(() =>
  import('@/app/pages/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  })),
)
