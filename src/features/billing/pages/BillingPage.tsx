import { buttonPrimaryClass, buttonSecondaryClass, cardClass } from '../../../components/ui/styles'
import { useStartProCheckout, useSubscription } from '../hooks'

const STATUS_LABELS_PT: Record<string, string> = {
  active: 'Ativa',
  past_due: 'Pagamento pendente',
  canceled: 'Cancelada',
}

export function BillingPage() {
  const subscriptionQuery = useSubscription()
  const checkout = useStartProCheckout()

  if (subscriptionQuery.isLoading) {
    return <p className="text-sm text-muted-500">Carregando assinatura...</p>
  }

  const subscription = subscriptionQuery.data
  const isPro = subscription?.plan === 'pro'

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-muted-900">Assinatura</h1>

      <div className={`${cardClass} mt-4`}>
        <p className="text-sm text-muted-500">Plano atual</p>
        <p className="text-lg font-semibold text-muted-900">{isPro ? 'Pro' : 'Free'}</p>
        {subscription && (
          <p className="mt-1 text-sm text-muted-500">
            Status: {STATUS_LABELS_PT[subscription.status] ?? subscription.status}
          </p>
        )}

        {!isPro && (
          <div className="mt-4">
            <p className="text-sm text-muted-600">
              No plano <strong>Free</strong> você tem até 5 funcionários e 1 escala ativa, com a marca "Feito com
              ShiftPlan" no texto exportado.
            </p>
            <p className="mt-2 text-sm text-muted-600">
              O plano <strong>Pro</strong> (R$ 39/mês) libera equipe e escalas ilimitadas, histórico de escalas e
              remove a marca d'água.
            </p>
            <button
              type="button"
              className={`${buttonPrimaryClass} mt-3`}
              disabled={checkout.isPending}
              onClick={() => checkout.mutate()}
            >
              {checkout.isPending ? 'Gerando Pix...' : 'Assinar o plano Pro'}
            </button>
          </div>
        )}

        {isPro && <p className="mt-3 text-sm text-primary-700">Sua equipe já está no plano Pro. 🎉</p>}
      </div>

      {checkout.isError && (
        <p className="mt-3 text-sm text-danger-600">
          {checkout.error instanceof Error ? checkout.error.message : 'Não foi possível iniciar a cobrança.'}
        </p>
      )}

      {checkout.data?.pix && (
        <div className={`${cardClass} mt-4`}>
          <p className="text-sm font-medium text-muted-900">Pague com Pix para ativar o plano Pro</p>
          <img
            src={`data:image/png;base64,${checkout.data.pix.encodedImage}`}
            alt="QR code Pix"
            className="mx-auto mt-3 h-48 w-48"
          />
          <label className="mt-3 block text-xs font-medium text-muted-500">Ou copie o código Pix</label>
          <textarea
            readOnly
            value={checkout.data.pix.payload}
            className="mt-1 w-full rounded-md border border-muted-300 p-2 text-xs"
            rows={3}
            onClick={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            className={`${buttonSecondaryClass} mt-2`}
            onClick={() => navigator.clipboard.writeText(checkout.data?.pix?.payload ?? '')}
          >
            Copiar código Pix
          </button>
          <p className="mt-3 text-xs text-muted-500">
            Após o pagamento, a confirmação chega automaticamente em alguns instantes. Você pode atualizar esta
            página para ver o status mais recente.
          </p>
        </div>
      )}
    </div>
  )
}
