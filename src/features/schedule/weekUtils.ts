import { addDays, addWeeks, format, startOfWeek } from 'date-fns'

export function mondayOf(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function toIsoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function parseIsoDate(weekStartIso: string): Date {
  return new Date(`${weekStartIso}T00:00:00`)
}

export function formatWeekRange(weekStartIso: string): string {
  const start = parseIsoDate(weekStartIso)
  const end = addDays(start, 6)
  return `${format(start, 'dd/MM')} a ${format(end, 'dd/MM')}`
}

export function shiftWeek(weekStartIso: string, deltaWeeks: number): string {
  return toIsoDate(addWeeks(parseIsoDate(weekStartIso), deltaWeeks))
}
