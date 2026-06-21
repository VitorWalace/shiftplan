import { Link } from 'react-router-dom'
import { buttonPrimaryClass, buttonSecondaryClass } from '../../../components/ui/styles'

interface UpgradeModalProps {
  reason: string
  onClose: () => void
}

export function UpgradeModal({ reason, onClose }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-muted-900">Faça upgrade pra liberar</h2>
        <p className="mt-2 text-sm text-muted-600">{reason}</p>
        <div className="mt-5 flex gap-2">
          <Link to="/app/assinatura" onClick={onClose} className={buttonPrimaryClass}>
            Ver planos
          </Link>
          <button type="button" onClick={onClose} className={buttonSecondaryClass}>
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}
