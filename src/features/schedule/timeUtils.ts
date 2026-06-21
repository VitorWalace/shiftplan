import type { TimeString } from './types'

/** Converts "HH:mm" into minutes since midnight. */
export function timeToMinutes(time: TimeString): number {
  const [hoursPart, minutesPart] = time.split(':')
  return Number(hoursPart) * 60 + Number(minutesPart)
}

/** Whether [aStart, aEnd) overlaps [bStart, bEnd), in minutes since midnight. */
export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

/** Whether [innerStart, innerEnd) is fully contained within [outerStart, outerEnd). */
export function rangeContains(
  outerStart: number,
  outerEnd: number,
  innerStart: number,
  innerEnd: number,
): boolean {
  return outerStart <= innerStart && innerEnd <= outerEnd
}

export function durationMinutes(start: TimeString, end: TimeString): number {
  return timeToMinutes(end) - timeToMinutes(start)
}

export const DAY_LABELS_PT: Record<string, string> = {
  monday: 'segunda-feira',
  tuesday: 'terça-feira',
  wednesday: 'quarta-feira',
  thursday: 'quinta-feira',
  friday: 'sexta-feira',
  saturday: 'sábado',
  sunday: 'domingo',
}
