import { describe, expect, it } from 'vitest'
import {
  checkDayOffViolation,
  checkOvertime,
  checkOverlap,
  checkUnavailability,
  checkUnderstaffed,
  validateSchedule,
  type ScheduleContext,
} from './engine'
import type { Assignment, Availability, Employee, Schedule, Shift } from './types'

function employee(overrides: Partial<Employee> & { id: string; name: string }): Employee {
  return { role: 'Funcionário', ...overrides }
}

function shift(overrides: Partial<Shift> & { id: string }): Shift {
  return { day: 'monday', start: '08:00', end: '12:00', minStaff: 1, ...overrides }
}

function assignment(employeeId: string, shiftId: string, id = `${employeeId}-${shiftId}`): Assignment {
  return { id, employeeId, shiftId }
}

function schedule(assignments: Assignment[]): Schedule {
  return { id: 'sch-1', weekStart: '2026-06-15', assignments }
}

describe('checkUnavailability', () => {
  const ana = employee({ id: 'ana', name: 'Ana' })
  const tuesdayNightShift = shift({ id: 'shift-tue-night', day: 'tuesday', start: '18:00', end: '23:00' })

  it('flags an employee scheduled during a window they marked unavailable', () => {
    const availabilities: Availability[] = [
      {
        employeeId: 'ana',
        unavailable: [{ day: 'tuesday', start: '18:00', end: '23:59' }],
      },
    ]
    const context: ScheduleContext = { employees: [ana], shifts: [tuesdayNightShift], availabilities }
    const sched = schedule([assignment('ana', 'shift-tue-night')])

    const conflicts = checkUnavailability(sched, context)

    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toMatchObject({ type: 'unavailable', severity: 'error', employeeIds: ['ana'] })
  })

  it('flags an employee scheduled outside their declared availability windows', () => {
    const availabilities: Availability[] = [
      {
        employeeId: 'ana',
        available: [{ day: 'tuesday', start: '08:00', end: '12:00' }],
      },
    ]
    const context: ScheduleContext = { employees: [ana], shifts: [tuesdayNightShift], availabilities }
    const sched = schedule([assignment('ana', 'shift-tue-night')])

    const conflicts = checkUnavailability(sched, context)

    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]?.type).toBe('unavailable')
  })

  it('does not flag an employee scheduled within their availability and with no explicit denial', () => {
    const availabilities: Availability[] = [
      {
        employeeId: 'ana',
        available: [{ day: 'tuesday', start: '17:00', end: '23:59' }],
      },
    ]
    const context: ScheduleContext = { employees: [ana], shifts: [tuesdayNightShift], availabilities }
    const sched = schedule([assignment('ana', 'shift-tue-night')])

    expect(checkUnavailability(sched, context)).toHaveLength(0)
  })

  it('does not flag an employee with no availability record at all', () => {
    const context: ScheduleContext = { employees: [ana], shifts: [tuesdayNightShift], availabilities: [] }
    const sched = schedule([assignment('ana', 'shift-tue-night')])

    expect(checkUnavailability(sched, context)).toHaveLength(0)
  })
})

describe('checkOverlap', () => {
  const joao = employee({ id: 'joao', name: 'João' })

  it('flags the same employee assigned to two shifts that overlap in time on the same day', () => {
    const shiftA = shift({ id: 'a', day: 'monday', start: '08:00', end: '14:00' })
    const shiftB = shift({ id: 'b', day: 'monday', start: '12:00', end: '18:00' })
    const context: ScheduleContext = { employees: [joao], shifts: [shiftA, shiftB], availabilities: [] }
    const sched = schedule([assignment('joao', 'a'), assignment('joao', 'b')])

    const conflicts = checkOverlap(sched, context)

    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toMatchObject({ type: 'overlap', severity: 'error', employeeIds: ['joao'] })
  })

  it('does not flag back-to-back shifts that touch but do not overlap', () => {
    const shiftA = shift({ id: 'a', day: 'monday', start: '08:00', end: '12:00' })
    const shiftB = shift({ id: 'b', day: 'monday', start: '12:00', end: '16:00' })
    const context: ScheduleContext = { employees: [joao], shifts: [shiftA, shiftB], availabilities: [] }
    const sched = schedule([assignment('joao', 'a'), assignment('joao', 'b')])

    expect(checkOverlap(sched, context)).toHaveLength(0)
  })

  it('does not flag overlapping time ranges on different days', () => {
    const shiftA = shift({ id: 'a', day: 'monday', start: '08:00', end: '14:00' })
    const shiftB = shift({ id: 'b', day: 'tuesday', start: '08:00', end: '14:00' })
    const context: ScheduleContext = { employees: [joao], shifts: [shiftA, shiftB], availabilities: [] }
    const sched = schedule([assignment('joao', 'a'), assignment('joao', 'b')])

    expect(checkOverlap(sched, context)).toHaveLength(0)
  })
})

describe('checkUnderstaffed', () => {
  const ana = employee({ id: 'ana', name: 'Ana' })

  it('flags a shift with fewer employees than minStaff', () => {
    const s = shift({ id: 'a', minStaff: 2 })
    const context: ScheduleContext = { employees: [ana], shifts: [s], availabilities: [] }
    const sched = schedule([assignment('ana', 'a')])

    const conflicts = checkUnderstaffed(sched, context)

    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toMatchObject({ type: 'understaffed', severity: 'error', shiftIds: ['a'] })
  })

  it('does not flag a shift that meets exactly its minStaff', () => {
    const ana2 = employee({ id: 'ana2', name: 'Ana 2' })
    const s = shift({ id: 'a', minStaff: 2 })
    const context: ScheduleContext = { employees: [ana, ana2], shifts: [s], availabilities: [] }
    const sched = schedule([assignment('ana', 'a'), assignment('ana2', 'a')])

    expect(checkUnderstaffed(sched, context)).toHaveLength(0)
  })
})

describe('checkOvertime', () => {
  it('flags an employee whose total scheduled hours exceed maxHoursPerWeek', () => {
    const carlos = employee({ id: 'carlos', name: 'Carlos', maxHoursPerWeek: 10 })
    const shiftA = shift({ id: 'a', day: 'monday', start: '08:00', end: '14:00' })
    const shiftB = shift({ id: 'b', day: 'tuesday', start: '08:00', end: '14:00' })
    const context: ScheduleContext = { employees: [carlos], shifts: [shiftA, shiftB], availabilities: [] }
    const sched = schedule([assignment('carlos', 'a'), assignment('carlos', 'b')])

    const conflicts = checkOvertime(sched, context)

    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toMatchObject({ type: 'overtime', severity: 'error', employeeIds: ['carlos'] })
  })

  it('does not flag an employee exactly at the maxHoursPerWeek limit', () => {
    const carlos = employee({ id: 'carlos', name: 'Carlos', maxHoursPerWeek: 6 })
    const shiftA = shift({ id: 'a', day: 'monday', start: '08:00', end: '14:00' })
    const context: ScheduleContext = { employees: [carlos], shifts: [shiftA], availabilities: [] }
    const sched = schedule([assignment('carlos', 'a')])

    expect(checkOvertime(sched, context)).toHaveLength(0)
  })

  it('does not flag an employee with no maxHoursPerWeek configured', () => {
    const carlos = employee({ id: 'carlos', name: 'Carlos' })
    const shiftA = shift({ id: 'a', day: 'monday', start: '08:00', end: '23:00' })
    const context: ScheduleContext = { employees: [carlos], shifts: [shiftA], availabilities: [] }
    const sched = schedule([assignment('carlos', 'a')])

    expect(checkOvertime(sched, context)).toHaveLength(0)
  })
})

describe('checkDayOffViolation', () => {
  const maria = employee({ id: 'maria', name: 'Maria' })
  const sundayShift = shift({ id: 'a', day: 'sunday' })

  it('warns when an employee is scheduled on a day they requested off', () => {
    const availabilities: Availability[] = [{ employeeId: 'maria', daysOff: ['sunday'] }]
    const context: ScheduleContext = { employees: [maria], shifts: [sundayShift], availabilities }
    const sched = schedule([assignment('maria', 'a')])

    const conflicts = checkDayOffViolation(sched, context)

    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]).toMatchObject({ type: 'dayOffViolation', severity: 'warning' })
  })

  it('does not warn when the scheduled day is not in daysOff', () => {
    const availabilities: Availability[] = [{ employeeId: 'maria', daysOff: ['saturday'] }]
    const context: ScheduleContext = { employees: [maria], shifts: [sundayShift], availabilities }
    const sched = schedule([assignment('maria', 'a')])

    expect(checkDayOffViolation(sched, context)).toHaveLength(0)
  })
})

describe('validateSchedule', () => {
  it('returns an empty list for a fully clean schedule', () => {
    const ana = employee({ id: 'ana', name: 'Ana', maxHoursPerWeek: 40 })
    const s = shift({ id: 'a', minStaff: 1 })
    const context: ScheduleContext = { employees: [ana], shifts: [s], availabilities: [] }
    const sched = schedule([assignment('ana', 'a')])

    expect(validateSchedule(sched, context)).toHaveLength(0)
  })

  it('aggregates multiple simultaneous conflicts from different rules', () => {
    // Ana: unavailable on monday morning, overbooked into two overlapping shifts, over her hour cap.
    const ana = employee({ id: 'ana', name: 'Ana', maxHoursPerWeek: 5 })
    // Bruno: only employee in a shift that requires 2.
    const bruno = employee({ id: 'bruno', name: 'Bruno' })

    const shiftA = shift({ id: 'a', day: 'monday', start: '08:00', end: '14:00', minStaff: 1 })
    const shiftB = shift({ id: 'b', day: 'monday', start: '12:00', end: '18:00', minStaff: 1 })
    const understaffedShift = shift({ id: 'c', day: 'wednesday', start: '08:00', end: '12:00', minStaff: 2 })

    const availabilities: Availability[] = [
      { employeeId: 'ana', unavailable: [{ day: 'monday', start: '08:00', end: '10:00' }] },
    ]

    const context: ScheduleContext = {
      employees: [ana, bruno],
      shifts: [shiftA, shiftB, understaffedShift],
      availabilities,
    }
    const sched = schedule([
      assignment('ana', 'a'),
      assignment('ana', 'b'),
      assignment('bruno', 'c'),
    ])

    const conflicts = validateSchedule(sched, context)
    const types = conflicts.map((c) => c.type).sort()

    expect(types).toEqual(['overlap', 'overtime', 'unavailable', 'understaffed'])
  })
})
