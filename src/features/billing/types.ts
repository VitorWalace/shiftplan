export type PlanId = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled'

export interface Subscription {
  plan: PlanId
  status: SubscriptionStatus
  currentPeriodEnd?: string
}

export interface PixCharge {
  encodedImage: string
  payload: string
  expirationDate: string
}
