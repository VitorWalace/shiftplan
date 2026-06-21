// Pure, deterministic schedule validation engine.
// No side effects, no fetch, no I/O — inputs in, Conflict[] out.

import type { Assignment, Availability, Conflict, Employee, Schedule, Shift } from './types'
import { DAY_LABELS_PT, durationMinutes, rangeContains, rangesOverlap, timeToMinutes } from './timeUtils'

export interface ScheduleContext {
  employees: Employee[]
  shifts: Shift[]
  availabilities: Availability[]
}

interface ResolvedAssignment {
  assignment: Assignment
  employee: Employee
  shift: Shift
}

function resolveAssignments(schedule: Schedule, context: ScheduleContext): ResolvedAssignment[] {
  const employeeById = new Map(context.employees.map((e) => [e.id, e]))
  const shiftById = new Map(context.shifts.map((s) => [s.id, s]))

  const resolved: ResolvedAssignment[] = []
  for (const assignment of schedule.assignments) {
    const employee = employeeById.get(assignment.employeeId)
    const shift = shiftById.get(assignment.shiftId)
    if (employee && shift) {
      resolved.push({ assignment, employee, shift })
    }
  }
  return resolved
}

function dayLabel(day: string): string {
  return DAY_LABELS_PT[day] ?? day
}

/** Employee assigned to a shift at a time they marked as unavailable, or outside their allowed availability. */
export function checkUnavailability(schedule: Schedule, context: ScheduleContext): Conflict[] {
  const availabilityByEmployee = new Map(context.availabilities.map((a) => [a.employeeId, a]))
  const conflicts: Conflict[] = []

  for (const { assignment, employee, shift } of resolveAssignments(schedule, context)) {
    const availability = availabilityByEmployee.get(employee.id)
    if (!availability) continue

    const shiftStart = timeToMinutes(shift.start)
    const shiftEnd = timeToMinutes(shift.end)

    const hasExplicitDenial = (availability.unavailable ?? []).some(
      (window) =>
        window.day === shift.day &&
        rangesOverlap(shiftStart, shiftEnd, timeToMinutes(window.start), timeToMinutes(window.end)),
    )

    if (hasExplicitDenial) {
      conflicts.push({
        type: 'unavailable',
        severity: 'error',
        message: `${employee.name} está escalado em ${dayLabel(shift.day)} (${shift.start}-${shift.end}), mas marcou indisponibilidade nesse horário.`,
        employeeIds: [employee.id],
        shiftIds: [shift.id],
        assignmentIds: [assignment.id],
      })
      continue
    }

    const availableWindows = availability.available ?? []
    if (availableWindows.length > 0) {
      const isCovered = availableWindows.some(
        (window) =>
          window.day === shift.day &&
          rangeContains(timeToMinutes(window.start), timeToMinutes(window.end), shiftStart, shiftEnd),
      )
      if (!isCovered) {
        conflicts.push({
          type: 'unavailable',
          severity: 'error',
          message: `${employee.name} está escalado em ${dayLabel(shift.day)} (${shift.start}-${shift.end}), fora da disponibilidade informada.`,
          employeeIds: [employee.id],
          shiftIds: [shift.id],
          assignmentIds: [assignment.id],
        })
      }
    }
  }

  return conflicts
}

/** Same employee assigned to two shifts whose time ranges overlap on the same day. */
export function checkOverlap(schedule: Schedule, context: ScheduleContext): Conflict[] {
  const conflicts: Conflict[] = []
  const resolved = resolveAssignments(schedule, context)

  const byEmployee = new Map<string, ResolvedAssignment[]>()
  for (const item of resolved) {
    const list = byEmployee.get(item.employee.id) ?? []
    list.push(item)
    byEmployee.set(item.employee.id, list)
  }

  for (const items of byEmployee.values()) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i]
        const b = items[j]
        if (!a || !b || a.shift.day !== b.shift.day) continue

        const overlaps = rangesOverlap(
          timeToMinutes(a.shift.start),
          timeToMinutes(a.shift.end),
          timeToMinutes(b.shift.start),
          timeToMinutes(b.shift.end),
        )

        if (overlaps) {
          conflicts.push({
            type: 'overlap',
            severity: 'error',
            message: `${a.employee.name} está escalado em dois turnos que se sobrepõem em ${dayLabel(a.shift.day)}: ${a.shift.start}-${a.shift.end} e ${b.shift.start}-${b.shift.end}.`,
            employeeIds: [a.employee.id],
            shiftIds: [a.shift.id, b.shift.id],
            assignmentIds: [a.assignment.id, b.assignment.id],
          })
        }
      }
    }
  }

  return conflicts
}

/** Shift with fewer assigned employees than its minStaff. */
export function checkUnderstaffed(schedule: Schedule, context: ScheduleContext): Conflict[] {
  const conflicts: Conflict[] = []
  const countByShift = new Map<string, number>()

  for (const assignment of schedule.assignments) {
    countByShift.set(assignment.shiftId, (countByShift.get(assignment.shiftId) ?? 0) + 1)
  }

  for (const shift of context.shifts) {
    const count = countByShift.get(shift.id) ?? 0
    if (count < shift.minStaff) {
      conflicts.push({
        type: 'understaffed',
        severity: 'error',
        message: `O turno de ${dayLabel(shift.day)} (${shift.start}-${shift.end}) precisa de ${shift.minStaff} pessoa(s), mas tem apenas ${count}.`,
        shiftIds: [shift.id],
      })
    }
  }

  return conflicts
}

/** Employee whose total scheduled hours in the week exceed their maxHoursPerWeek. */
export function checkOvertime(schedule: Schedule, context: ScheduleContext): Conflict[] {
  const conflicts: Conflict[] = []
  const resolved = resolveAssignments(schedule, context)

  const minutesByEmployee = new Map<string, number>()
  const assignmentIdsByEmployee = new Map<string, string[]>()
  for (const { assignment, employee, shift } of resolved) {
    const minutes = durationMinutes(shift.start, shift.end)
    minutesByEmployee.set(employee.id, (minutesByEmployee.get(employee.id) ?? 0) + minutes)
    const ids = assignmentIdsByEmployee.get(employee.id) ?? []
    ids.push(assignment.id)
    assignmentIdsByEmployee.set(employee.id, ids)
  }

  for (const employee of context.employees) {
    if (employee.maxHoursPerWeek === undefined) continue
    const totalHours = (minutesByEmployee.get(employee.id) ?? 0) / 60
    if (totalHours > employee.maxHoursPerWeek) {
      conflicts.push({
        type: 'overtime',
        severity: 'error',
        message: `${employee.name} está escalado para ${totalHours}h na semana, acima do limite de ${employee.maxHoursPerWeek}h.`,
        employeeIds: [employee.id],
        assignmentIds: assignmentIdsByEmployee.get(employee.id) ?? [],
      })
    }
  }

  return conflicts
}

/** (warning) Employee assigned on a day they requested off. */
export function checkDayOffViolation(schedule: Schedule, context: ScheduleContext): Conflict[] {
  const availabilityByEmployee = new Map(context.availabilities.map((a) => [a.employeeId, a]))
  const conflicts: Conflict[] = []

  for (const { assignment, employee, shift } of resolveAssignments(schedule, context)) {
    const availability = availabilityByEmployee.get(employee.id)
    if (!availability?.daysOff?.includes(shift.day)) continue

    conflicts.push({
      type: 'dayOffViolation',
      severity: 'warning',
      message: `${employee.name} está escalado em ${dayLabel(shift.day)}, mas pediu folga nesse dia.`,
      employeeIds: [employee.id],
      shiftIds: [shift.id],
      assignmentIds: [assignment.id],
    })
  }

  return conflicts
}

/** Runs every validation rule against the schedule and returns the combined list of conflicts. */
export function validateSchedule(schedule: Schedule, context: ScheduleContext): Conflict[] {
  return [
    ...checkUnavailability(schedule, context),
    ...checkOverlap(schedule, context),
    ...checkUnderstaffed(schedule, context),
    ...checkOvertime(schedule, context),
    ...checkDayOffViolation(schedule, context),
  ]
}
