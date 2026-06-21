import { buttonPrimaryClass, buttonSecondaryClass } from '../../../components/ui/styles'

interface WeekNavigatorProps {
  label: string
  onPrev: () => void
  onNext: () => void
  onExport: () => void
}

export function WeekNavigator({ label, onPrev, onNext, onExport }: WeekNavigatorProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrev} className={buttonSecondaryClass} aria-label="Semana anterior">
          ←
        </button>
        <span className="text-sm font-medium text-muted-700">Semana de {label}</span>
        <button type="button" onClick={onNext} className={buttonSecondaryClass} aria-label="Próxima semana">
          →
        </button>
      </div>
      <button type="button" onClick={onExport} className={buttonPrimaryClass}>
        Exportar pro WhatsApp
      </button>
    </div>
  )
}
