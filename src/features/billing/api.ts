import { supabase } from '../../lib/supabase'
import type { PixCharge, Subscription } from './types'

interface SubscriptionRow {
  plan: 'free' | 'pro'
  status: 'active' | 'past_due' | 'canceled'
  current_period_end: string | null
}

export async function getSubscription(): Promise<Subscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .maybeSingle()
  if (error) throw error
  if (!data) return { plan: 'free', status: 'active' }

  const row = data as SubscriptionRow
  return { plan: row.plan, status: row.status, currentPeriodEnd: row.current_period_end ?? undefined }
}

/** Calls the serverless checkout route, which talks to Asaas using the secret API key on the server. */
export async function startProCheckout(cpfCnpj: string): Promise<{ pix: PixCharge | null }> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Você precisa estar logado para assinar o plano Pro.')

  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpfCnpj }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Erro ao iniciar cobrança' }))
    throw new Error(body.error ?? 'Erro ao iniciar cobrança')
  }

  return response.json() as Promise<{ pix: PixCharge | null }>
}
