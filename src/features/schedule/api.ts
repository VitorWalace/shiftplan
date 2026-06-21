import { supabase } from '../../lib/supabase'
import type { Assignment } from './types'

interface ScheduleRow {
  id: string
  week_start: string
}

interface AssignmentRow {
  id: string
  employee_id: string
  shift_id: string
}

function mapAssignment(row: AssignmentRow): Assignment {
  return { id: row.id, employeeId: row.employee_id, shiftId: row.shift_id }
}

export interface ScheduleRecord {
  id: string
  weekStart: string
}

/** Fetches the schedule for a given week, creating an empty one on first visit. */
export async function getOrCreateSchedule(weekStart: string): Promise<ScheduleRecord> {
  const { data: existing, error: selectError } = await supabase
    .from('schedules')
    .select('id, week_start')
    .eq('week_start', weekStart)
    .maybeSingle()
  if (selectError) throw selectError

  if (existing) {
    const row = existing as ScheduleRow
    return { id: row.id, weekStart: row.week_start }
  }

  const { data: created, error: insertError } = await supabase
    .from('schedules')
    .insert({ week_start: weekStart })
    .select('id, week_start')
    .single()
  if (insertError) throw insertError

  const row = created as ScheduleRow
  return { id: row.id, weekStart: row.week_start }
}

export async function listAssignments(scheduleId: string): Promise<Assignment[]> {
  const { data, error } = await supabase.from('assignments').select('*').eq('schedule_id', scheduleId)
  if (error) throw error
  return (data as AssignmentRow[]).map(mapAssignment)
}

export async function createAssignment(scheduleId: string, employeeId: string, shiftId: string): Promise<Assignment> {
  const { data, error } = await supabase
    .from('assignments')
    .insert({ schedule_id: scheduleId, employee_id: employeeId, shift_id: shiftId })
    .select()
    .single()
  if (error) throw error
  return mapAssignment(data as AssignmentRow)
}

export async function deleteAssignment(id: string): Promise<void> {
  const { error } = await supabase.from('assignments').delete().eq('id', id)
  if (error) throw error
}
