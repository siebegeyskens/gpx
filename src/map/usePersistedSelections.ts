import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { selectionsDb, type RoutePoint, type RouteReference, type SelectionRecord } from '../db/selectionsDb'

const SELECTIONS_QUERY_KEY = ['selections'] as const

export function usePersistedSelections() {
  const queryClient = useQueryClient()

  const selectionsQuery = useQuery({
    queryKey: SELECTIONS_QUERY_KEY,
    queryFn: () => selectionsDb.selections.orderBy('createdAt').reverse().toArray(),
  })

  const addSelectionMutation = useMutation({
    mutationFn: async ({ routeRef, segment }: { segment: RoutePoint[]; routeRef: RouteReference }) => {
      const createdAt = Date.now()
      const id = await selectionsDb.selections.add({
        createdAt,
        routeRef,
        segment,
      })
      return { id, createdAt, routeRef, segment } satisfies SelectionRecord
    },
    onSuccess: (newSelection) => {
      queryClient.setQueryData<SelectionRecord[] | undefined>(SELECTIONS_QUERY_KEY, (prev) => {
        if (!prev) return [newSelection]
        return [newSelection, ...prev]
      })
    },
  })

  const clearSelectionsMutation = useMutation({
    mutationFn: async () => {
      await selectionsDb.selections.clear()
    },
    onSuccess: () => {
      queryClient.setQueryData<SelectionRecord[]>(SELECTIONS_QUERY_KEY, [])
    },
  })

  return {
    addSelection: async (segment: RoutePoint[], routeRef: RouteReference) =>
      addSelectionMutation.mutateAsync({ routeRef, segment }),
    clearSelections: async () => clearSelectionsMutation.mutateAsync(),
    isLoading: selectionsQuery.isLoading,
    selections: selectionsQuery.data ?? [],
  }
}
