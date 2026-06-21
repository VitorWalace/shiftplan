import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEmployee,
  deleteEmployee,
  listAllAvailabilities,
  listEmployees,
  replaceAvailability,
  updateEmployee,
  type AvailabilityDraft,
  type EmployeeInput,
} from './api'

export function useEmployees() {
  return useQuery({ queryKey: ['employees'], queryFn: listEmployees })
}

export function useAvailabilities() {
  return useQuery({ queryKey: ['availabilities'], queryFn: listAllAvailabilities })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: EmployeeInput) => createEmployee(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmployeeInput }) => updateEmployee(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['availabilities'] })
    },
  })
}

export function useSaveAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, draft }: { employeeId: string; draft: AvailabilityDraft }) =>
      replaceAvailability(employeeId, draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['availabilities'] }),
  })
}
