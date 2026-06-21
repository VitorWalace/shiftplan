import { DAY_OPTIONS } from './periods'
import { DAY_LABELS_PT } from './timeUtils'
import type { Employee, Schedule, Shift } from './types'

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDateBR(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
}

export interface WhatsAppContext {
  employees: Employee[]
  shifts: Shift[]
  /** Free plan keeps the "Feito com ShiftPlan" footer; Pro removes it. */
  watermark?: boolean
}

/** Builds the clean, WhatsApp-ready text for a week's schedule. Pure and deterministic. */
export function buildWhatsAppText(schedule: Schedule, context: WhatsAppContext): string {
  const employeeById = new Map(context.employees.map((employee) => [employee.id, employee]))

  const assignmentsByShift = new Map<string, string[]>()
  for (const assignment of schedule.assignments) {
    const name = employeeById.get(assignment.employeeId)?.name
    if (!name) continue
    const list = assignmentsByShift.get(assignment.shiftId) ?? []
    list.push(name)
    assignmentsByShift.set(assignment.shiftId, list)
  }

  const weekStart = new Date(`${schedule.weekStart}T00:00:00`)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const lines: string[] = [`📅 Escala da semana de ${formatDateBR(weekStart)} a ${formatDateBR(weekEnd)}`, '']

  for (const { value: day } of DAY_OPTIONS) {
    const dayShifts = context.shifts
      .filter((shift) => shift.day === day)
      .sort((a, b) => a.start.localeCompare(b.start))
    if (dayShifts.length === 0) continue

    lines.push(`📌 ${capitalize(DAY_LABELS_PT[day] ?? day)}`)
    for (const shift of dayShifts) {
      const names = assignmentsByShift.get(shift.id) ?? []
      const peopleText = names.length > 0 ? names.join(', ') : 'sem ninguém escalado'
      lines.push(`🕐 ${shift.start}–${shift.end}: ${peopleText}`)
    }
    lines.push('')
  }

  if (context.watermark ?? true) {
    lines.push('Feito com ShiftPlan')
  }

  return lines.join('\n').trim()
}
