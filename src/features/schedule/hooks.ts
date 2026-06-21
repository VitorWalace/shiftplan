import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAssignment, deleteAssignment, getOrCreateSchedule, listAssignments } from './api'
import type { Assignment } from './types'

export function useSchedule(weekStart: string) {
  return useQuery({ queryKey: ['schedule', weekStart], queryFn: () => getOrCreateSchedule(weekStart) })
}

export function useAssignments(scheduleId: string | undefined) {
  return useQuery({
    queryKey: ['assignments', scheduleId],
    queryFn: () => listAssignments(scheduleId as string),
    enabled: Boolean(scheduleId),
  })
}

export function useCreateAssignment(scheduleId: string | undefined) {
  const queryClient = useQueryClient()
  const key = ['assignments', scheduleId]

  return useMutation({
    mutationFn: ({ employeeId, shiftId }: { employeeId: string; shiftId: string }) => {
      if (!scheduleId) throw new Error('Schedule not ready yet')
      return createAssignment(scheduleId, employeeId, shiftId)
    },
    onMutate: async ({ employeeId, shiftId }) => {
      const previous = queryClient.getQueryData<Assignment[]>(key) ?? []
      const optimistic: Assignment = { id: `optimistic-${employeeId}-${shiftId}`, employeeId, shiftId }
      queryClient.setQueryData<Assignment[]>(key, [...previous, optimistic])
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteAssignment(scheduleId: string | undefined) {
  const queryClient = useQueryClient()
  const key = ['assignments', scheduleId]

  return useMutation({
    mutationFn: (assignmentId: string) => deleteAssignment(assignmentId),
    onMutate: async (assignmentId) => {
      const previous = queryClient.getQueryData<Assignment[]>(key) ?? []
      queryClient.setQueryData<Assignment[]>(
        key,
        previous.filter((a) => a.id !== assignmentId),
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
