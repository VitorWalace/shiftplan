import { describe, expect, it } from 'vitest'
import { buildConflictUI } from './conflictUtils'
import type { Conflict } from './types'

describe('buildConflictUI', () => {
  it('returns empty maps for an empty conflict list', () => {
    const ui = buildConflictUI([])
    expect(ui.shiftSeverity.size).toBe(0)
    expect(ui.assignmentSeverity.size).toBe(0)
    expect(ui.employeeSeverity.size).toBe(0)
  })

  it('assigns severity per shift, assignment and employee id referenced by a conflict', () => {
    const conflicts: Conflict[] = [
      {
        type: 'overlap',
        severity: 'error',
        message: 'x',
        employeeIds: ['ana'],
        shiftIds: ['a', 'b'],
        assignmentIds: ['asg-1', 'asg-2'],
      },
    ]

    const ui = buildConflictUI(conflicts)

    expect(ui.shiftSeverity.get('a')).toBe('error')
    expect(ui.shiftSeverity.get('b')).toBe('error')
    expect(ui.assignmentSeverity.get('asg-1')).toBe('error')
    expect(ui.employeeSeverity.get('ana')).toBe('error')
  })

  it('escalates a warning to error when both severities target the same id', () => {
    const conflicts: Conflict[] = [
      { type: 'dayOffViolation', severity: 'warning', message: 'x', shiftIds: ['a'] },
      { type: 'understaffed', severity: 'error', message: 'y', shiftIds: ['a'] },
    ]

    const ui = buildConflictUI(conflicts)

    expect(ui.shiftSeverity.get('a')).toBe('error')
  })

  it('never downgrades an error back to warning', () => {
    const conflicts: Conflict[] = [
      { type: 'understaffed', severity: 'error', message: 'y', shiftIds: ['a'] },
      { type: 'dayOffViolation', severity: 'warning', message: 'x', shiftIds: ['a'] },
    ]

    const ui = buildConflictUI(conflicts)

    expect(ui.shiftSeverity.get('a')).toBe('error')
  })
})
