import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inspectionsApi } from '@/features/inspections/api/inspectionsApi'
import { inspectionKeys } from '@/features/inspections/lib/queryKeys'
import type { Inspection } from '@/features/inspections/types'

type ResolveVariables = { id: string; resolutionNote: string }

export function useResolveInspection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, resolutionNote }: ResolveVariables) =>
      inspectionsApi.resolve(id, { resolutionNote }),
    onSuccess: (updated) => {
      // Reflect the change instantly in every cached list, then refetch in the background.
      queryClient.setQueriesData<Inspection[]>(
        { queryKey: inspectionKeys.lists() },
        (list) =>
          list?.map((item) => (item.id === updated.id ? updated : item)),
      )
      queryClient.setQueryData(inspectionKeys.detail(updated.id), updated)
    },
    onSettled: () => {
      // Also runs on 409 (already resolved elsewhere) so stale cards refresh.
      void queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: inspectionKeys.summary() })
    },
  })
}
