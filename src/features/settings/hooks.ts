import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createShift, deleteShift, listShifts, updateShift, type ShiftInput } from './api'

export function useShifts() {
  return useQuery({ queryKey: ['shifts'], queryFn: listShifts })
}

export function useCreateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ShiftInput) => createShift(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  })
}

export function useUpdateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ShiftInput }) => updateShift(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  })
}

export function useDeleteShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteShift(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  })
}
