import { AsaasProvider } from '../_lib/payments/AsaasProvider.js'
import { requireUser } from '../_lib/requireUser.js'
import { supabaseAdmin } from '../_lib/supabaseAdmin.js'
import type { ApiRequest, ApiResponse } from '../_lib/types.js'

const PRO_PLAN_PRICE = 39

interface SubscriptionRow {
  asaas_customer_id: string | null
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await requireUser(req)
  if (!user) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }

  const body = req.body as { cpfCnpj?: string } | undefined
  const cpfCnpj = body?.cpfCnpj?.replace(/\D/g, '')

  try {
    const provider = new AsaasProvider()

    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('asaas_customer_id')
      .eq('owner_id', user.id)
      .maybeSingle()

    let customerId = (existing as SubscriptionRow | null)?.asaas_customer_id ?? undefined

    if (!customerId) {
      if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
        res.status(400).json({ error: 'Informe um CPF ou CNPJ válido para gerar a cobrança.' })
        return
      }

      const customer = await provider.createCustomer({
        name: user.email ?? 'Cliente ShiftPlan',
        email: user.email ?? '',
        cpfCnpj,
      })
      customerId = customer.customerId
    }

    const subscription = await provider.createSubscription({
      customerId,
      value: PRO_PLAN_PRICE,
      description: 'ShiftPlan - Plano Pro (mensal)',
    })

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
    res.status(502).json({ error: error instanceof Error ? error.message : 'Erro ao iniciar cobrança' })
  }
}
