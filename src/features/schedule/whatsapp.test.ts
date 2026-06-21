import { describe, expect, it } from 'vitest'
import { buildWhatsAppText } from './whatsapp'
import type { Employee, Schedule, Shift } from './types'

describe('buildWhatsAppText', () => {
  const ana: Employee = { id: 'ana', name: 'Ana', role: 'Garçom' }
  const bruno: Employee = { id: 'bruno', name: 'Bruno', role: 'Caixa' }
  const mondayShift: Shift = { id: 's1', day: 'monday', start: '08:00', end: '12:00', minStaff: 1 }
  const tuesdayShift: Shift = { id: 's2', day: 'tuesday', start: '12:00', end: '18:00', minStaff: 2 }

  it('lists each day with assigned employees and ends with the watermark', () => {
    const schedule: Schedule = {
      id: 'sch',
      weekStart: '2026-06-15',
      assignments: [
        { id: 'a1', employeeId: 'ana', shiftId: 's1' },
        { id: 'a2', employeeId: 'bruno', shiftId: 's2' },
      ],
    }

    const text = buildWhatsAppText(schedule, { employees: [ana, bruno], shifts: [mondayShift, tuesdayShift] })

    expect(text).toContain('15/06 a 21/06')
    expect(text).toContain('08:00–12:00: Ana')
    expect(text).toContain('12:00–18:00: Bruno')
    expect(text.trim().endsWith('Feito com ShiftPlan')).toBe(true)
  })

  it('marks a shift with no one assigned', () => {
    const schedule: Schedule = { id: 'sch', weekStart: '2026-06-15', assignments: [] }

    const text = buildWhatsAppText(schedule, { employees: [ana], shifts: [mondayShift] })

    expect(text).toContain('sem ninguém escalado')
  })

  it('omits days that have no shifts defined', () => {
    const schedule: Schedule = { id: 'sch', weekStart: '2026-06-15', assignments: [] }

    const text = buildWhatsAppText(schedule, { employees: [ana], shifts: [mondayShift] })

    expect(text).not.toContain('Terça')
  })
})
