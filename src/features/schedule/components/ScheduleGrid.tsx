import { DAY_OPTIONS } from '../periods'
import type { Assignment, ConflictSeverity, Employee, Shift } from '../types'
import { ScheduleCell } from './ScheduleCell'

interface TimeSlot {
  start: string
  end: string
}

interface ScheduleGridProps {
  shifts: Shift[]
  assignments: Assignment[]
  employeeById: Map<string, Employee>
  shiftSeverity: Map<string, ConflictSeverity>
  assignmentSeverity: Map<string, ConflictSeverity>
  onRemoveAssignment: (assignmentId: string) => void
}

function uniqueTimeSlots(shifts: Shift[]): TimeSlot[] {
  const seen = new Map<string, TimeSlot>()
  for (const shift of shifts) {
    const key = `${shift.start}-${shift.end}`
    if (!seen.has(key)) seen.set(key, { start: shift.start, end: shift.end })
  }
  return Array.from(seen.values()).sort((a, b) => a.start.localeCompare(b.start))
}

export function ScheduleGrid({
  shifts,
  assignments,
  employeeById,
  shiftSeverity,
  assignmentSeverity,
  onRemoveAssignment,
}: ScheduleGridProps) {
  const timeSlots = uniqueTimeSlots(shifts)

  const assignmentsByShift = new Map<string, Assignment[]>()
  for (const assignment of assignments) {
    const list = assignmentsByShift.get(assignment.shiftId) ?? []
    list.push(assignment)
    assignmentsByShift.set(assignment.shiftId, list)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-24 p-2 text-left text-xs font-medium text-muted-500">Turno</th>
            {DAY_OPTIONS.map((day) => (
              <th key={day.value} className="p-2 text-center text-xs font-medium text-muted-500">
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={`${slot.start}-${slot.end}`}>
              <td className="p-2 align-top text-xs font-medium text-muted-600">
                {slot.start}–{slot.end}
              </td>
              {DAY_OPTIONS.map((day) => {
                const shift = shifts.find(
                  (s) => s.day === day.value && s.start === slot.start && s.end === slot.end,
                )
                return (
                  <td key={day.value} className="p-1.5 align-top">
                    {shift ? (
                      <ScheduleCell
                        shiftId={shift.id}
                        minStaff={shift.minStaff}
                        assignments={assignmentsByShift.get(shift.id) ?? []}
                        employeeById={employeeById}
                        cellSeverity={shiftSeverity.get(shift.id)}
                        assignmentSeverity={assignmentSeverity}
                        onRemoveAssignment={onRemoveAssignment}
                      />
                    ) : (
                      <div className="flex min-h-[72px] items-center justify-center rounded-md border border-dashed border-muted-200 text-[11px] text-muted-300">
                        —
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
