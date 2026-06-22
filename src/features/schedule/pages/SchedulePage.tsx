import { useMemo, useState } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { Link } from 'react-router-dom'
import { ToastViewport, useToast } from '../../../components/ui/Toast'
import { getErrorMessage } from '../../../lib/errors'
import { useAvailabilities, useEmployees } from '../../employees/hooks'
import { useShifts } from '../../settings/hooks'
import { usePlan } from '../../billing/usePlan'
import { OnboardingChecklist } from '../../onboarding/OnboardingChecklist'
import { buildConflictUI } from '../conflictUtils'
import { ConflictsPanel } from '../components/ConflictsPanel'
import { EmployeeSidebarCard } from '../components/EmployeeSidebarCard'
import { ScheduleGrid } from '../components/ScheduleGrid'
import { WeekNavigator } from '../components/WeekNavigator'
import { validateSchedule } from '../engine'
import { useAssignments, useCreateAssignment, useDeleteAssignment, useSchedule } from '../hooks'
import { formatWeekRange, mondayOf, shiftWeek, toIsoDate } from '../weekUtils'
import { buildWhatsAppText } from '../whatsapp'

type DragData =
  | { type: 'employee'; employeeId: string }
  | { type: 'assignment'; assignmentId: string; employeeId: string; shiftId: string }

type DropData = { type: 'shift'; shiftId: string }

export function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => toIsoDate(mondayOf(new Date())))

  const employeesQuery = useEmployees()
  const availabilitiesQuery = useAvailabilities()
  const shiftsQuery = useShifts()
  const scheduleQuery = useSchedule(weekStart)
  const scheduleId = scheduleQuery.data?.id
  const assignmentsQuery = useAssignments(scheduleId)

  const createAssignment = useCreateAssignment(scheduleId)
  const deleteAssignment = useDeleteAssignment(scheduleId)

  const { message, showToast } = useToast()
  const plan = usePlan()

  const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data])
  const availabilities = useMemo(() => availabilitiesQuery.data ?? [], [availabilitiesQuery.data])
  const shifts = useMemo(() => shiftsQuery.data ?? [], [shiftsQuery.data])
  const assignments = useMemo(() => assignmentsQuery.data ?? [], [assignmentsQuery.data])

  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])

  const conflicts = useMemo(() => {
    if (!scheduleId) return []
    return validateSchedule({ id: scheduleId, weekStart, assignments }, { employees, shifts, availabilities })
  }, [scheduleId, weekStart, assignments, employees, shifts, availabilities])

  const conflictUI = useMemo(() => buildConflictUI(conflicts), [conflicts])

  const onMutationError = { onError: () => showToast('Não foi possível salvar a alteração. Tente novamente.') }

  function handleDragEnd(event: DragEndEvent) {
    const activeData = event.active.data.current as DragData | undefined
    if (!activeData) return

    if (!event.over) {
      if (activeData.type === 'assignment') {
        deleteAssignment.mutate(activeData.assignmentId, onMutationError)
      }
      return
    }

    const overData = event.over.data.current as DropData | undefined
    if (!overData) return

    const { employeeId } = activeData
    const targetShiftId = overData.shiftId
    const alreadyAssigned = assignments.some((a) => a.employeeId === employeeId && a.shiftId === targetShiftId)

    if (activeData.type === 'employee') {
      if (alreadyAssigned) return
      createAssignment.mutate({ employeeId, shiftId: targetShiftId }, onMutationError)
      return
    }

    if (activeData.shiftId === targetShiftId || alreadyAssigned) {
      deleteAssignment.mutate(activeData.assignmentId, onMutationError)
      return
    }

    deleteAssignment.mutate(activeData.assignmentId, onMutationError)
    createAssignment.mutate({ employeeId, shiftId: targetShiftId }, onMutationError)
  }

  function handleExport() {
    if (!scheduleId) return
    const text = buildWhatsAppText(
      { id: scheduleId, weekStart, assignments },
      { employees, shifts, watermark: plan.hasWatermark },
    )
    navigator.clipboard
      .writeText(text)
      .then(() => showToast('Escala copiada! Cole no grupo do WhatsApp.'))
      .catch(() => showToast('Não foi possível copiar. Tente novamente.'))
  }

  if (employeesQuery.isLoading || shiftsQuery.isLoading) {
    return <p className="text-sm text-muted-500">Carregando...</p>
  }

  if (employees.length === 0 || shifts.length === 0) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-semibold text-muted-900">Escala</h1>
        <OnboardingChecklist hasEmployees={employees.length > 0} hasShifts={shifts.length > 0} hasAssignments={false} />
      </div>
    )
  }

  if (scheduleQuery.isError) {
    const isPlanLimit = (getErrorMessage(scheduleQuery.error) ?? '').includes('plano Free')
    return (
      <div>
        <h1 className="text-xl font-semibold text-muted-900">Escala</h1>
        <p className="mt-2 text-sm text-danger-600">
          {isPlanLimit
            ? 'O plano Free permite apenas 1 escala ativa. Faça upgrade para o plano Pro e tenha histórico de escalas.'
            : 'Não foi possível carregar a escala desta semana.'}
        </p>
        {isPlanLimit && (
          <Link to="/app/assinatura" className="mt-3 inline-block text-sm font-medium text-primary-600 hover:underline">
            Ver planos →
          </Link>
        )}
      </div>
    )
  }

  if (scheduleQuery.isLoading || !scheduleId) {
    return <p className="text-sm text-muted-500">Carregando escala...</p>
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">
        <OnboardingChecklist hasEmployees hasShifts hasAssignments={assignments.length > 0} />

        <WeekNavigator
          label={formatWeekRange(weekStart)}
          onPrev={() => setWeekStart(shiftWeek(weekStart, -1))}
          onNext={() => setWeekStart(shiftWeek(weekStart, 1))}
          onExport={handleExport}
        />

        <div className="flex flex-col gap-4 lg:flex-row">
          <aside className="lg:w-56 lg:shrink-0">
            <h2 className="mb-2 text-sm font-semibold text-muted-700">Equipe</h2>
            <div className="flex flex-col gap-2">
              {employees.map((employee) => (
                <EmployeeSidebarCard
                  key={employee.id}
                  employee={employee}
                  severity={conflictUI.employeeSeverity.get(employee.id)}
                />
              ))}
            </div>
          </aside>

          <div className="flex-1">
            <ScheduleGrid
              shifts={shifts}
              assignments={assignments}
              employeeById={employeeById}
              shiftSeverity={conflictUI.shiftSeverity}
              assignmentSeverity={conflictUI.assignmentSeverity}
              onRemoveAssignment={(id) => deleteAssignment.mutate(id, onMutationError)}
            />
          </div>

          <aside className="lg:w-72 lg:shrink-0">
            <h2 className="mb-2 text-sm font-semibold text-muted-700">Conflitos</h2>
            <ConflictsPanel conflicts={conflicts} />
          </aside>
        </div>
      </div>

      <ToastViewport message={message} />
    </DndContext>
  )
}
