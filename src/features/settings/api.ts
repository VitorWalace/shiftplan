import { supabase } from '../../lib/supabase'
import { DAY_OPTIONS } from '../schedule/periods'
import type { DayOfWeek, Shift } from '../schedule/types'

interface ShiftRow {
  id: string
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  min_staff: number
}

function mapShift(row: ShiftRow): Shift {
  return {
    id: row.id,
    day: row.day_of_week,
    start: row.start_time.slice(0, 5),
    end: row.end_time.slice(0, 5),
    minStaff: row.min_staff,
  }
}

export interface ShiftInput {
  day: DayOfWeek
  start: string
  end: string
  minStaff: number
}

const dayOrder = new Map(DAY_OPTIONS.map((option, index) => [option.value, index]))

function sortShifts(shifts: Shift[]): Shift[] {
  return [...shifts].sort((a, b) => {
    const dayDiff = (dayOrder.get(a.day) ?? 0) - (dayOrder.get(b.day) ?? 0)
    return dayDiff !== 0 ? dayDiff : a.start.localeCompare(b.start)
  })
}

export async function listShifts(): Promise<Shift[]> {
  const { data, error } = await supabase.from('shifts').select('*')
  if (error) throw error
  return sortShifts((data as ShiftRow[]).map(mapShift))
}

export async function createShift(input: ShiftInput): Promise<Shift> {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      day_of_week: input.day,
      start_time: `${input.start}:00`,
      end_time: `${input.end}:00`,
      min_staff: input.minStaff,
    })
    .select()
    .single()
  if (error) throw error
  return mapShift(data as ShiftRow)
}

export async function updateShift(id: string, input: ShiftInput): Promise<Shift> {
  const { data, error } = await supabase
    .from('shifts')
    .update({
      day_of_week: input.day,
      start_time: `${input.start}:00`,
      end_time: `${input.end}:00`,
      min_staff: input.minStaff,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapShift(data as ShiftRow)
}

export async function deleteShift(id: string): Promise<void> {
  const { error } = await supabase.from('shifts').delete().eq('id', id)
  if (error) throw error
}
