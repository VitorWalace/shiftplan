import { useDroppable } from '@dnd-kit/core'
import type { Assignment, ConflictSeverity, Employee } from '../types'
import { AssignedCard } from './AssignedCard'

interface ScheduleCellProps {
  shiftId: string
  minStaff: number
  assignments: Assignment[]
  employeeById: Map<string, Employee>
  cellSeverity?: ConflictSeverity
  assignmentSeverity: Map<string, ConflictSeverity>
  onRemoveAssignment: (assignmentId: string) => void
}

export function ScheduleCell({
  shiftId,
  minStaff,
  assignments,
  employeeById,
  cellSeverity,
  assignmentSeverity,
  onRemoveAssignment,
}: ScheduleCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `shift:${shiftId}`, data: { type: 'shift', shiftId } })

  return (
    <div
      ref={setNodeRef}
      className={[
        'min-h-[72px] rounded-md border p-1.5 transition-colors',
        isOver ? 'ring-2 ring-primary-400' : '',
        cellSeverity === 'error'
          ? 'border-danger-300 bg-danger-50'
          : cellSeverity === 'warning'
            ? 'border-warning-300 bg-warning-50'
            : 'border-muted-200 bg-muted-50',
      ].join(' ')}
    >
      <p className="mb-1 text-[11px] text-muted-400">
        {assignments.length}/{minStaff}
      </p>
      <div className="flex flex-col gap-1">
        {assignments.map((assignment) => {
          const employee = employeeById.get(assignment.employeeId)
          if (!employee) return null
          return (
            <AssignedCard
              key={assignment.id}
              assignmentId={assignment.id}
              employee={employee}
              shiftId={shiftId}
              severity={assignmentSeverity.get(assignment.id)}
              onRemove={() => onRemoveAssignment(assignment.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
