import { useState } from 'react'
import { buttonDangerClass, buttonPrimaryClass, buttonSecondaryClass, cardClass } from '../../../components/ui/styles'
import { PageHeading } from '../../../components/ui/PageHeading'
import { UsersIcon } from '../../../components/ui/icons'
import { getErrorMessage } from '../../../lib/errors'
import { UpgradeModal } from '../../billing/components/UpgradeModal'
import { usePlan } from '../../billing/usePlan'
import { AvailabilityGrid } from '../components/AvailabilityGrid'
import { EmployeeForm } from '../components/EmployeeForm'
import { useAvailabilities, useCreateEmployee, useDeleteEmployee, useEmployees, useSaveAvailability, useUpdateEmployee } from '../hooks'
import type { Employee } from '../../schedule/types'

type FormState = { mode: 'create' } | { mode: 'edit'; employee: Employee } | { mode: 'closed' }

export function EmployeesPage() {
  const employeesQuery = useEmployees()
  const availabilitiesQuery = useAvailabilities()
  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()
  const deleteEmployee = useDeleteEmployee()
  const saveAvailability = useSaveAvailability()
  const plan = usePlan()

  const [formState, setFormState] = useState<FormState>({ mode: 'closed' })
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const employees = employeesQuery.data ?? []
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)
  const selectedAvailability = availabilitiesQuery.data?.find((a) => a.employeeId === selectedEmployeeId)

  if (employeesQuery.isLoading) {
    return <p className="text-sm text-muted-500">Carregando equipe...</p>
  }

  if (employeesQuery.isError) {
    return <p className="text-sm text-danger-600">Não foi possível carregar a equipe. Tente novamente.</p>
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <PageHeading icon={UsersIcon} title="Equipe" />
          {formState.mode === 'closed' && (
            <button
              type="button"
              className={buttonPrimaryClass}
              onClick={() => {
                if (plan.canAddEmployee(employees.length)) {
                  setFormState({ mode: 'create' })
                } else {
                  setShowUpgradeModal(true)
                }
              }}
            >
              + Novo funcionário
            </button>
          )}
        </div>

        {formState.mode !== 'closed' && (
          <div className="mt-4">
            <EmployeeForm
              key={formState.mode === 'edit' ? formState.employee.id : 'create'}
              initial={formState.mode === 'edit' ? formState.employee : undefined}
              submitting={createEmployee.isPending || updateEmployee.isPending}
              onCancel={() => setFormState({ mode: 'closed' })}
              onSubmit={(input) => {
                if (formState.mode === 'edit') {
                  updateEmployee.mutate(
                    { id: formState.employee.id, input },
                    { onSuccess: () => setFormState({ mode: 'closed' }) },
                  )
                } else {
                  createEmployee.mutate(input, {
                    onSuccess: () => setFormState({ mode: 'closed' }),
                    onError: (error) => {
                      if ((getErrorMessage(error) ?? '').includes('plano Free')) {
                        setFormState({ mode: 'closed' })
                        setShowUpgradeModal(true)
                      }
                    },
                  })
                }
              }}
            />
            {(createEmployee.isError || updateEmployee.isError) && (
              <p className="mt-2 text-sm text-danger-600">Não foi possível salvar. Tente novamente.</p>
            )}
          </div>
        )}

        {employees.length === 0 && formState.mode === 'closed' && (
          <p className="mt-6 text-sm text-muted-500">
            Nenhum funcionário cadastrado ainda. Clique em "Novo funcionário" para começar.
          </p>
        )}

        <ul className="mt-4 flex flex-col gap-2">
          {employees.map((employee) => (
            <li
              key={employee.id}
              className={[
                cardClass,
                'flex cursor-pointer items-center justify-between',
                selectedEmployeeId === employee.id ? 'border-primary-300 ring-1 ring-primary-200' : '',
              ].join(' ')}
              onClick={() => setSelectedEmployeeId(employee.id)}
            >
              <div>
                <p className="font-medium text-muted-900">{employee.name}</p>
                <p className="text-sm text-muted-500">
                  {employee.role}
                  {employee.maxHoursPerWeek ? ` · até ${employee.maxHoursPerWeek}h/semana` : ''}
                </p>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className={buttonSecondaryClass}
                  onClick={() => setFormState({ mode: 'edit', employee })}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className={buttonDangerClass}
                  disabled={deleteEmployee.isPending}
                  onClick={() => {
                    if (selectedEmployeeId === employee.id) setSelectedEmployeeId(null)
                    deleteEmployee.mutate(employee.id)
                  }}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>

        {deleteEmployee.isError && (
          <p className="mt-2 text-sm text-danger-600">Não foi possível excluir o funcionário. Tente novamente.</p>
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-semibold text-muted-900">Disponibilidade</h2>
        {!selectedEmployee && (
          <p className="mt-2 text-sm text-muted-500">Selecione um funcionário na lista para editar a disponibilidade.</p>
        )}
        {selectedEmployee && availabilitiesQuery.isLoading && (
          <p className="mt-2 text-sm text-muted-500">Carregando disponibilidade...</p>
        )}
        {selectedEmployee && !availabilitiesQuery.isLoading && (
          <div className={`${cardClass} mt-3`}>
            <p className="mb-3 text-sm text-muted-600">
              Marque os períodos em que <strong>{selectedEmployee.name}</strong> não pode trabalhar, ou um dia inteiro de folga.
            </p>
            <AvailabilityGrid
              key={selectedEmployee.id}
              availability={selectedAvailability}
              saving={saveAvailability.isPending}
              onSave={(draft) => saveAvailability.mutate({ employeeId: selectedEmployee.id, draft })}
            />
            {saveAvailability.isError && (
              <p className="mt-2 text-sm text-danger-600">Não foi possível salvar a disponibilidade. Tente novamente.</p>
            )}
          </div>
        )}
      </div>

      {showUpgradeModal && (
        <UpgradeModal
          reason={`O plano Free permite até ${plan.maxEmployees} funcionários. Faça upgrade para o plano Pro para cadastrar mais.`}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  )
}
