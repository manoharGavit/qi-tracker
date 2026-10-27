import { LogOutIcon } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { NAV_ITEMS, type NavItem } from '@/app/layouts/navItems'
import { useAuth } from '@/features/auth/context/authContext'
import { BrandMark } from '@/shared/components/BrandMark'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r bg-card p-4 md:flex">
        <BrandMark />
        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <SideNavLink key={item.to} item={item} />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t pt-4">
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{user?.name}</p>
            <p className="truncate text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOutIcon data-icon="inline-start" />
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-topbar items-center justify-between gap-2 border-b bg-card/95 px-4 backdrop-blur md:hidden">
          <BrandMark />
          <div className="flex items-center gap-1">
            <span className="max-w-32 truncate text-sm text-muted-foreground">
              {user?.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOutIcon />
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4 pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom)+1.5rem)] md:px-8 md:pt-8 md:pb-10">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid h-tabbar grid-cols-3">
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="flex">
              <TabBarLink item={item} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

function SideNavLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        cn(
          'flex h-control items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          isActive && 'bg-secondary text-secondary-foreground',
        )
      }
    >
      <Icon className="size-4" aria-hidden />
      {item.label}
    </NavLink>
  )
}

function TabBarLink({ item }: { item: NavItem }) {
  const Icon = item.icon

  if (item.primary) {
    return (
      <NavLink
        to={item.to}
        end
        aria-label="New inspection"
        className="flex flex-1 flex-col items-center justify-center"
      >
        <span className="flex size-control-lg -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95">
          <Icon className="size-6" aria-hidden />
        </span>
      </NavLink>
    )
  }

  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors',
          isActive && 'text-primary',
        )
      }
    >
      <Icon className="size-5" aria-hidden />
      {item.label}
    </NavLink>
  )
}
