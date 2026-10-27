import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inspectionsApi } from '@/features/inspections/api/inspectionsApi'
import { inspectionKeys } from '@/features/inspections/lib/queryKeys'

export function useCreateInspection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inspectionsApi.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inspectionKeys.summary() }),
      ])
    },
  })
}
