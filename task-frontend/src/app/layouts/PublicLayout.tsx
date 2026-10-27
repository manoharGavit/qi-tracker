import { Outlet } from 'react-router-dom'
import { BrandMark } from '@/shared/components/BrandMark'

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-topbar items-center px-4">
        <BrandMark />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-10 md:items-center md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
