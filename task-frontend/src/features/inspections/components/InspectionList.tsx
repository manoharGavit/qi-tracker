'use no memo'

import { useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { InspectionCard } from '@/features/inspections/components/InspectionCard'
import { ResolveInspectionDialog } from '@/features/inspections/components/ResolveInspectionDialog'
import type { Inspection } from '@/features/inspections/types'

export function InspectionList({ inspections }: { inspections: Inspection[] }) {
  // Keep the last selection while closing so the drawer can animate out with content.
  const [selected, setSelected] = useState<Inspection | null>(null)
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const handleResolve = (inspection: Inspection) => {
    setSelected(inspection)
    setOpen(true)
  }

  const rowVirtualizer = useWindowVirtualizer({
    count: inspections.length,
    estimateSize: () => 180,
    overscan: 5,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <>
      {virtualItems.length > 0 ? (
        <div
          ref={listRef}
          data-slot="virtualized-inspection-list"
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {virtualItems.map((virtualRow) => {
            const inspection = inspections[virtualRow.index]
            if (!inspection) return null

            return (
              <div
                key={inspection.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full pb-3"
                style={{
                  transform: `translateY(${virtualRow.start - (rowVirtualizer.options.scrollMargin ?? 0)}px)`,
                }}
              >
                <InspectionCard
                  inspection={inspection}
                  onResolve={handleResolve}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {inspections.map((inspection) => (
            <li key={inspection.id}>
              <InspectionCard
                inspection={inspection}
                onResolve={handleResolve}
              />
            </li>
          ))}
        </ul>
      )}

      <ResolveInspectionDialog
        inspection={selected}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
