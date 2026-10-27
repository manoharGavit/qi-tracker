import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { InspectionForm } from '@/features/inspections/components/InspectionForm'
import { useCreateInspection } from '@/features/inspections/hooks/useCreateInspection'
import type { CreateInspectionInput } from '@/features/inspections/types'
import { PageHeader } from '@/shared/components/PageHeader'
import { Card, CardContent } from '@/shared/components/ui/card'

export function NewInspectionPage() {
  const navigate = useNavigate()
  const createInspection = useCreateInspection()

  const handleSubmit = async (input: CreateInspectionInput) => {
    const created = await createInspection.mutateAsync(input)
    toast.success(`Inspection logged for ${created.machineId}`)
    navigate('/inspections')
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New inspection"
        description="Record a defect found during fabric inspection."
      />
      <Card>
        <CardContent>
          <InspectionForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}
