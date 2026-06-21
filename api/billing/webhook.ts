import { supabaseAdmin } from '../_lib/supabaseAdmin'
import type { ApiRequest, ApiResponse } from '../_lib/types'

interface AsaasWebhookBody {
  event: string
  payment?: { subscription?: string }
}

interface MappedEvent {
  status: 'active' | 'past_due' | 'canceled'
  plan: 'pro' | 'free'
}

function mapAsaasEvent(event: string): MappedEvent | null {
  switch (event) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED':
      return { status: 'active', plan: 'pro' }
    case 'PAYMENT_OVERDUE':
      return { status: 'past_due', plan: 'pro' }
    case 'PAYMENT_DELETED':
    case 'PAYMENT_REFUNDED':
    case 'SUBSCRIPTION_DELETED':
      return { status: 'canceled', plan: 'free' }
    default:
      return null
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  // Asaas sends back the access token configured for this webhook URL in
  // their dashboard, in this header — that's how we know the request is genuine.
  const token = req.headers['asaas-access-token']
  if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    res.status(401).json({ error: 'Token inválido' })
    return
  }

  const body = req.body as AsaasWebhookBody
  const subscriptionId = body.payment?.subscription
  const mapped = subscriptionId ? mapAsaasEvent(body.event) : null

  if (mapped && subscriptionId) {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: mapped.status, plan: mapped.plan, updated_at: new Date().toISOString() })
      .eq('asaas_subscription_id', subscriptionId)
  }

  res.status(200).json({ received: true })
}
