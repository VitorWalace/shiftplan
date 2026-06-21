import { supabase } from '../../lib/supabase'
import type { Availability, DayOfWeek, Employee } from '../schedule/types'

interface EmployeeRow {
  id: string
  name: string
  role: string
  max_hours_per_week: number | null
}

function mapEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    maxHoursPerWeek: row.max_hours_per_week ?? undefined,
  }
}

export interface EmployeeInput {
  name: string
  role: string
  maxHoursPerWeek?: number
}

export async function listEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from('employees').select('*').order('name')
  if (error) throw error
  return (data as EmployeeRow[]).map(mapEmployee)
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert({ name: input.name, role: input.role, max_hours_per_week: input.maxHoursPerWeek ?? null })
    .select()
    .single()
  if (error) throw error
  return mapEmployee(data as EmployeeRow)
}

export async function updateEmployee(id: string, input: EmployeeInput): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .update({ name: input.name, role: input.role, max_hours_per_week: input.maxHoursPerWeek ?? null })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapEmployee(data as EmployeeRow)
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) throw error
}

interface AvailabilityRow {
  employee_id: string
  day_of_week: DayOfWeek
  kind: 'unavailable' | 'day_off'
  start_time: string | null
  end_time: string | null
}

function toDomainTime(dbTime: string): string {
  return dbTime.slice(0, 5)
}

/** Fetches every availability row for the current owner, aggregated per employee. */
export async function listAllAvailabilities(): Promise<Availability[]> {
  const { data, error } = await supabase.from('availabilities').select('*')
  if (error) throw error

  const byEmployee = new Map<string, Availability>()
  for (const row of data as AvailabilityRow[]) {
    const entry = byEmployee.get(row.employee_id) ?? {
      employeeId: row.employee_id,
      unavailable: [],
      daysOff: [],
    }

    if (row.kind === 'unavailable' && row.start_time && row.end_time) {
      entry.unavailable = [
        ...(entry.unavailable ?? []),
        { day: row.day_of_week, start: toDomainTime(row.start_time), end: toDomainTime(row.end_time) },
      ]
    } else if (row.kind === 'day_off') {
      entry.daysOff = [...(entry.daysOff ?? []), row.day_of_week]
    }

    byEmployee.set(row.employee_id, entry)
  }

  return Array.from(byEmployee.values())
}

export interface AvailabilityDraft {
  unavailable: { day: DayOfWeek; start: string; end: string }[]
  daysOff: DayOfWeek[]
}

/** Replaces every availability row for one employee with the current grid state. */
export async function replaceAvailability(employeeId: string, draft: AvailabilityDraft): Promise<void> {
  const { error: deleteError } = await supabase.from('availabilities').delete().eq('employee_id', employeeId)
  if (deleteError) throw deleteError

  const rows = [
    ...draft.unavailable.map((window) => ({
      employee_id: employeeId,
      day_of_week: window.day,
      kind: 'unavailable' as const,
      start_time: `${window.start}:00`,
      end_time: `${window.end}:00`,
    })),
    ...draft.daysOff.map((day) => ({
      employee_id: employeeId,
      day_of_week: day,
      kind: 'day_off' as const,
      start_time: null,
      end_time: null,
    })),
  ]

  if (rows.length === 0) return

  const { error: insertError } = await supabase.from('availabilities').insert(rows)
  if (insertError) throw insertError
}
