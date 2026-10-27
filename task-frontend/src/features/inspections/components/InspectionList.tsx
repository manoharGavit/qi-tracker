import { useState } from 'react'
import { InspectionCard } from '@/features/inspections/components/InspectionCard'
import { ResolveInspectionDialog } from '@/features/inspections/components/ResolveInspectionDialog'
import type { Inspection } from '@/features/inspections/types'

export function InspectionList({ inspections }: { inspections: Inspection[] }) {
  // Keep the last selection while closing so the drawer can animate out with content.
  const [selected, setSelected] = useState<Inspection | null>(null)
  const [open, setOpen] = useState(false)

  const handleResolve = (inspection: Inspection) => {
    setSelected(inspection)
    setOpen(true)
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {inspections.map((inspection) => (
          <li key={inspection.id}>
            <InspectionCard inspection={inspection} onResolve={handleResolve} />
          </li>
        ))}
      </ul>
      <ResolveInspectionDialog
        inspection={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
