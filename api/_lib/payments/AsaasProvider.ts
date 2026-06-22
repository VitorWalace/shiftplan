import type {
  CreateCustomerInput,
  CreateCustomerResult,
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  PaymentProvider,
  SubscriptionStatusResult,
} from './PaymentProvider.js'

const ASAAS_API_URL = process.env.ASAAS_API_URL ?? 'https://sandbox.asaas.com/api/v3'

interface AsaasCustomerResponse {
  id: string
}

interface AsaasSubscriptionResponse {
  id: string
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
}

interface AsaasPaymentListResponse {
  data: { id: string }[]
}

interface AsaasPixQrCodeResponse {
  encodedImage: string
  payload: string
  expirationDate: string
}

function nextDueDateIso(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

export class AsaasProvider implements PaymentProvider {
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const apiKey = process.env.ASAAS_API_KEY
    if (!apiKey) {
      throw new Error('Missing ASAAS_API_KEY environment variable.')
    }

    const response = await fetch(`${ASAAS_API_URL}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        access_token: apiKey,
        ...init.headers,
      },
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Asaas API error ${response.status}: ${body}`)
    }

    return (await response.json()) as T
  }

  async createCustomer(input: CreateCustomerInput): Promise<CreateCustomerResult> {
    const customer = await this.request<AsaasCustomerResponse>('/customers', {
      method: 'POST',
      body: JSON.stringify({ name: input.name, email: input.email, cpfCnpj: input.cpfCnpj }),
    })
    return { customerId: customer.id }
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult> {
    const subscription = await this.request<AsaasSubscriptionResponse>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        customer: input.customerId,
        billingType: 'PIX',
        cycle: 'MONTHLY',
        value: input.value,
        description: input.description,
        nextDueDate: nextDueDateIso(),
      }),
    })

    const pixCharge = await this.fetchFirstPixCharge(subscription.id)
    return { subscriptionId: subscription.id, pixCharge }
  }

  async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusResult> {
    const subscription = await this.request<AsaasSubscriptionResponse>(`/subscriptions/${subscriptionId}`)
    return { status: subscription.status }
  }

  private async fetchFirstPixCharge(subscriptionId: string) {
    const payments = await this.request<AsaasPaymentListResponse>(`/payments?subscription=${subscriptionId}`)
    const firstPayment = payments.data[0]
    if (!firstPayment) return undefined

    return this.request<AsaasPixQrCodeResponse>(`/payments/${firstPayment.id}/pixQrCode`)
  }
}
