import { AsaasProvider } from '../_lib/payments/AsaasProvider.js'
import { requireUser } from '../_lib/requireUser.js'
import { supabaseAdmin } from '../_lib/supabaseAdmin.js'
import type { ApiRequest, ApiResponse } from '../_lib/types.js'

const PRO_PLAN_PRICE = 39

interface SubscriptionRow {
  asaas_customer_id: string | null
}

class MissingCpfCnpjError extends Error {}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const requestUser = await requireUser(req)
  if (!requestUser) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }
  const user = requestUser

  const body = req.body as { cpfCnpj?: string } | undefined
  const cpfCnpj = body?.cpfCnpj?.replace(/\D/g, '')

  const provider = new AsaasProvider()

  async function createCustomer(): Promise<string> {
    if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
      throw new MissingCpfCnpjError('Informe um CPF ou CNPJ válido para gerar a cobrança.')
    }
    const customer = await provider.createCustomer({
      name: user.email ?? 'Cliente ShiftPlan',
      email: user.email ?? '',
      cpfCnpj,
    })
    return customer.customerId
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('asaas_customer_id')
      .eq('owner_id', user.id)
      .maybeSingle()

    let customerId = (existing as SubscriptionRow | null)?.asaas_customer_id ?? undefined
    if (!customerId) {
      customerId = await createCustomer()
    }

    let subscription
    try {
      subscription = await provider.createSubscription({
        customerId,
        value: PRO_PLAN_PRICE,
        description: 'ShiftPlan - Plano Pro (mensal)',
      })
    } catch (error) {
      // The stored customer may no longer be valid on Asaas's side — either
      // explicitly removed, or referencing an id Asaas no longer recognizes.
      // Create a fresh one and retry once.
      const message = error instanceof Error ? error.message : ''
      const isStaleCustomer = message.includes('cliente removido') || message.includes('invalid_customer')
      if (!isStaleCustomer) throw error

      customerId = await createCustomer()
      subscription = await provider.createSubscription({
        customerId,
        value: PRO_PLAN_PRICE,
        description: 'ShiftPlan - Plano Pro (mensal)',
      })
    }

    await supabaseAdmin
      .from('subscriptions')
      .update({
        asaas_customer_id: customerId,
        asaas_subscription_id: subscription.subscriptionId,
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', user.id)

    res.status(200).json({ pix: subscription.pixCharge ?? null })
  } catch (error) {
    if (error instanceof MissingCpfCnpjError) {
      res.status(400).json({ error: error.message })
      return
    }
    res.status(502).json({ error: error instanceof Error ? error.message : 'Erro ao iniciar cobrança' })
  }
}
