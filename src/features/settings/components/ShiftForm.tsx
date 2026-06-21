import { useState, type FormEvent } from 'react'
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../../../components/ui/styles'
import { DAY_OPTIONS } from '../../schedule/periods'
import type { ShiftInput } from '../api'
import type { Shift } from '../../schedule/types'

interface ShiftFormProps {
  initial?: Shift
  submitting: boolean
  onSubmit: (input: ShiftInput) => void
  onCancel: () => void
}

export function ShiftForm({ initial, submitting, onSubmit, onCancel }: ShiftFormProps) {
  const [day, setDay] = useState<Shift['day']>(initial?.day ?? 'monday')
  const [start, setStart] = useState(initial?.start ?? '08:00')
  const [end, setEnd] = useState(initial?.end ?? '17:00')
  const [minStaff, setMinStaff] = useState(initial?.minStaff?.toString() ?? '1')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit({ day, start, end, minStaff: Number(minStaff) })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-muted-200 bg-white p-4">
      <label className={labelClass}>
        Dia da semana
        <select
          value={day}
          onChange={(e) => setDay(e.target.value as Shift['day'])}
          className={inputClass}
        >
          {DAY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <label className={`${labelClass} flex-1`}>
          Início
          <input type="time" required value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
        </label>
        <label className={`${labelClass} flex-1`}>
          Fim
          <input type="time" required value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
        </label>
      </div>

      <label className={labelClass}>
        Mínimo de pessoas
        <input
          type="number"
          min={1}
          required
          value={minStaff}
          onChange={(e) => setMinStaff(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="mt-1 flex gap-2">
        <button type="submit" disabled={submitting} className={buttonPrimaryClass}>
          {submitting ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" onClick={onCancel} className={buttonSecondaryClass}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
