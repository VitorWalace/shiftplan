// Abstraction over the billing gateway so the business logic (checkout route,
// webhook handler) never depends on Asaas directly. Swapping gateways later
// means writing a new class that implements this interface — nothing else changes.

export interface PixCharge {
  encodedImage: string
  payload: string
  expirationDate: string
}

export interface CreateCustomerInput {
  name: string
  email: string
  cpfCnpj?: string
}

export interface CreateCustomerResult {
  customerId: string
}

export interface CreateSubscriptionInput {
  customerId: string
  value: number
  description: string
}

export interface CreateSubscriptionResult {
  subscriptionId: string
  pixCharge?: PixCharge
}

export type GatewaySubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED'

export interface SubscriptionStatusResult {
  status: GatewaySubscriptionStatus
}

export interface PaymentProvider {
  createCustomer(input: CreateCustomerInput): Promise<CreateCustomerResult>
  createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult>
  getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusResult>
}
