import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'

export function NotFoundPage() {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">That route does not exist.</p>
      <Button asChild>
        <Link to="/inspections">Go to inspections</Link>
      </Button>
    </section>
  )
}
