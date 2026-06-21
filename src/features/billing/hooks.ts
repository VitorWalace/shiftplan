import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSubscription, startProCheckout } from './api'

export function useSubscription() {
  return useQuery({ queryKey: ['subscription'], queryFn: getSubscription })
}

export function useStartProCheckout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startProCheckout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  })
}
