import { useDraggable } from '@dnd-kit/core'
import type { ConflictSeverity, Employee } from '../types'

interface EmployeeSidebarCardProps {
  employee: Employee
  severity?: ConflictSeverity
}

export function EmployeeSidebarCard({ employee, severity }: EmployeeSidebarCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `employee:${employee.id}`,
    data: { type: 'employee', employeeId: employee.id },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={[
        'cursor-grab touch-none select-none rounded-md border px-3 py-2 text-sm shadow-sm active:cursor-grabbing',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        isDragging ? 'opacity-50' : '',
        severity === 'error'
          ? 'border-danger-300 bg-danger-50 text-danger-700'
          : severity === 'warning'
            ? 'border-warning-300 bg-warning-50 text-warning-700'
            : 'border-muted-200 bg-white text-muted-800',
      ].join(' ')}
    >
      <p className="font-medium">{employee.name}</p>
      <p className="text-xs text-muted-500">{employee.role}</p>
    </div>
  )
}
