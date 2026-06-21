import { useState } from 'react'
import { buttonDangerClass, buttonPrimaryClass, buttonSecondaryClass, cardClass } from '../../../components/ui/styles'
import { DAY_OPTIONS } from '../../schedule/periods'
import type { Shift } from '../../schedule/types'
import { ShiftForm } from '../components/ShiftForm'
import { useCreateShift, useDeleteShift, useShifts, useUpdateShift } from '../hooks'

type FormState = { mode: 'create' } | { mode: 'edit'; shift: Shift } | { mode: 'closed' }

const dayLabel = new Map(DAY_OPTIONS.map((option) => [option.value, option.label]))

export function SettingsPage() {
  const shiftsQuery = useShifts()
  const createShift = useCreateShift()
  const updateShift = useUpdateShift()
  const deleteShift = useDeleteShift()

  const [formState, setFormState] = useState<FormState>({ mode: 'closed' })

  if (shiftsQuery.isLoading) {
    return <p className="text-sm text-muted-500">Carregando turnos...</p>
  }

  if (shiftsQuery.isError) {
    return <p className="text-sm text-danger-600">Não foi possível carregar os turnos. Tente novamente.</p>
  }

  const shifts = shiftsQuery.data ?? []

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-muted-900">Configurações</h1>
          <p className="mt-1 text-sm text-muted-500">Defina os turnos padrão da semana e o mínimo de pessoas por turno.</p>
        </div>
        {formState.mode === 'closed' && (
          <button type="button" className={buttonPrimaryClass} onClick={() => setFormState({ mode: 'create' })}>
            + Novo turno
          </button>
        )}
      </div>

      {formState.mode !== 'closed' && (
        <div className="mt-4 max-w-md">
          <ShiftForm
            key={formState.mode === 'edit' ? formState.shift.id : 'create'}
            initial={formState.mode === 'edit' ? formState.shift : undefined}
            submitting={createShift.isPending || updateShift.isPending}
            onCancel={() => setFormState({ mode: 'closed' })}
            onSubmit={(input) => {
              if (formState.mode === 'edit') {
                updateShift.mutate({ id: formState.shift.id, input }, { onSuccess: () => setFormState({ mode: 'closed' }) })
              } else {
                createShift.mutate(input, { onSuccess: () => setFormState({ mode: 'closed' }) })
              }
            }}
          />
          {(createShift.isError || updateShift.isError) && (
            <p className="mt-2 text-sm text-danger-600">Não foi possível salvar. Tente novamente.</p>
          )}
        </div>
      )}

      {shifts.length === 0 && formState.mode === 'closed' && (
        <p className="mt-6 text-sm text-muted-500">
          Nenhum turno definido ainda. Clique em "Novo turno" para começar.
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {shifts.map((shift) => (
          <li key={shift.id} className={`${cardClass} flex items-center justify-between`}>
            <div>
              <p className="font-medium text-muted-900">{dayLabel.get(shift.day)}</p>
              <p className="text-sm text-muted-500">
                {shift.start} - {shift.end} · mínimo {shift.minStaff} pessoa(s)
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className={buttonSecondaryClass} onClick={() => setFormState({ mode: 'edit', shift })}>
                Editar
              </button>
              <button
                type="button"
                className={buttonDangerClass}
                disabled={deleteShift.isPending}
                onClick={() => deleteShift.mutate(shift.id)}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      {deleteShift.isError && (
        <p className="mt-2 text-sm text-danger-600">Não foi possível excluir o turno. Tente novamente.</p>
      )}
    </div>
  )
}
