import { useDraggable } from '@dnd-kit/core'
import type { ConflictSeverity, Employee } from '../types'

interface AssignedCardProps {
  assignmentId: string
  employee: Employee
  shiftId: string
  severity?: ConflictSeverity
  onRemove: () => void
}

export function AssignedCard({ assignmentId, employee, shiftId, severity, onRemove }: AssignedCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `assignment:${assignmentId}`,
    data: { type: 'assignment', assignmentId, employeeId: employee.id, shiftId },
  })

  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={[
        'flex items-center justify-between gap-1 rounded-md border px-2 py-1 text-xs',
        isDragging ? 'opacity-50' : '',
        severity === 'error'
          ? 'border-danger-300 bg-danger-50 text-danger-700'
          : severity === 'warning'
            ? 'border-warning-300 bg-warning-50 text-warning-700'
            : 'border-primary-200 bg-primary-50 text-primary-800',
      ].join(' ')}
    >
      <span
        {...listeners}
        {...attributes}
        className="cursor-grab touch-none truncate select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:cursor-grabbing"
      >
        {employee.name}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover ${employee.name}`}
        className="shrink-0 rounded text-muted-400 hover:text-danger-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        ×
      </button>
    </div>
  )
}
