import { useSubscription } from './hooks'
import type { PlanId } from './types'

export const FREE_EMPLOYEE_LIMIT = 5
export const FREE_SCHEDULE_LIMIT = 1

export interface PlanInfo {
  plan: PlanId
  isPro: boolean
  loading: boolean
  maxEmployees: number
  hasWatermark: boolean
  canAddEmployee: (currentCount: number) => boolean
  canCreateSchedule: (currentCount: number) => boolean
}

/** Exposes the current plan's limits so the UI can gate actions with a friendly upgrade prompt. */
export function usePlan(): PlanInfo {
  const subscriptionQuery = useSubscription()
  const plan = subscriptionQuery.data?.plan ?? 'free'
  const isPro = plan === 'pro'

  return {
    plan,
    isPro,
    loading: subscriptionQuery.isLoading,
    maxEmployees: isPro ? Infinity : FREE_EMPLOYEE_LIMIT,
    hasWatermark: !isPro,
    canAddEmployee: (currentCount) => isPro || currentCount < FREE_EMPLOYEE_LIMIT,
    canCreateSchedule: (currentCount) => isPro || currentCount < FREE_SCHEDULE_LIMIT,
  }
}
