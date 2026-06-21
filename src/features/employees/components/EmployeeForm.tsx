import { useState, type FormEvent } from 'react'
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../../../components/ui/styles'
import type { EmployeeInput } from '../api'
import type { Employee } from '../../schedule/types'

interface EmployeeFormProps {
  initial?: Employee
  submitting: boolean
  onSubmit: (input: EmployeeInput) => void
  onCancel: () => void
}

export function EmployeeForm({ initial, submitting, onSubmit, onCancel }: EmployeeFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState(initial?.maxHoursPerWeek?.toString() ?? '')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit({
      name,
      role,
      maxHoursPerWeek: maxHoursPerWeek ? Number(maxHoursPerWeek) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-muted-200 bg-white p-4">
      <label className={labelClass}>
        Nome
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Ex: Ana Souza"
        />
      </label>

      <label className={labelClass}>
        Função
        <input
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={inputClass}
          placeholder="Ex: Garçom, Caixa, Barbeiro"
        />
      </label>

      <label className={labelClass}>
        Carga horária máx. semanal (opcional)
        <input
          type="number"
          min={1}
          value={maxHoursPerWeek}
          onChange={(e) => setMaxHoursPerWeek(e.target.value)}
          className={inputClass}
          placeholder="Ex: 40"
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
