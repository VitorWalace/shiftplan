// Domain types for the schedule feature. Pure data shapes only — no logic here.

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

/** Time of day as "HH:mm" (24h), e.g. "08:00", "23:30". */
export type TimeString = string

export interface Employee {
  id: string
  name: string
  /** Free text, e.g. "Garçom", "Caixa", "Barbeiro". */
  role: string
  maxHoursPerWeek?: number
}

/** A recurring window in which the employee can work, e.g. "monday 08:00-18:00". */
export interface AvailabilityWindow {
  day: DayOfWeek
  start: TimeString
  end: TimeString
}

/** A specific recurring unavailability, e.g. "can't work tuesday nights". */
export interface UnavailabilityWindow {
  day: DayOfWeek
  start: TimeString
  end: TimeString
}

export interface Availability {
  employeeId: string
  /** Windows the employee can work. If empty/omitted, the employee is treated as available by default. */
  available?: AvailabilityWindow[]
  /** Specific windows the employee explicitly cannot work. */
  unavailable?: UnavailabilityWindow[]
  /** Full days off requested (warning-level if violated, not a hard block). */
  daysOff?: DayOfWeek[]
}

/** A shift template defined by the business owner in Configurações. */
export interface Shift {
  id: string
  day: DayOfWeek
  start: TimeString
  end: TimeString
  /** Minimum number of employees required for this shift. */
  minStaff: number
}

/** Links one employee to one shift within a schedule. */
export interface Assignment {
  id: string
  employeeId: string
  shiftId: string
}

/** A single week's schedule. */
export interface Schedule {
  id: string
  /** ISO date (yyyy-MM-dd) of the Monday that starts this week. */
  weekStart: string
  assignments: Assignment[]
}

export type ConflictType = 'unavailable' | 'overlap' | 'understaffed' | 'overtime' | 'dayOffViolation'

export type ConflictSeverity = 'error' | 'warning'

export interface Conflict {
  type: ConflictType
  severity: ConflictSeverity
  /** Human-readable message in Brazilian Portuguese. */
  message: string
  employeeIds?: string[]
  shiftIds?: string[]
  assignmentIds?: string[]
}
