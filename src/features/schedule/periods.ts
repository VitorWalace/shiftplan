import type { DayOfWeek, TimeString } from './types'

export interface Period {
  key: 'morning' | 'afternoon' | 'evening'
  label: string
  start: TimeString
  end: TimeString
}

/** Coarse periods used by the availability grid in Equipe. */
export const PERIODS: Period[] = [
  { key: 'morning', label: 'Manhã', start: '06:00', end: '12:00' },
  { key: 'afternoon', label: 'Tarde', start: '12:00', end: '18:00' },
  { key: 'evening', label: 'Noite', start: '18:00', end: '23:59' },
]

export const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Segunda' },
  { value: 'tuesday', label: 'Terça' },
  { value: 'wednesday', label: 'Quarta' },
  { value: 'thursday', label: 'Quinta' },
  { value: 'friday', label: 'Sexta' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
]
