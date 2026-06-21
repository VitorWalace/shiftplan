import type { Conflict, ConflictSeverity } from './types'

export interface ConflictUI {
  shiftSeverity: Map<string, ConflictSeverity>
  assignmentSeverity: Map<string, ConflictSeverity>
  employeeSeverity: Map<string, ConflictSeverity>
}

function worse(current: ConflictSeverity | undefined, next: ConflictSeverity): ConflictSeverity {
  return current === 'error' || next === 'error' ? 'error' : next
}

function applyTo(map: Map<string, ConflictSeverity>, ids: string[] | undefined, severity: ConflictSeverity) {
  for (const id of ids ?? []) {
    map.set(id, worse(map.get(id), severity))
  }
}

/** Reduces the flat conflict list into per-shift/per-assignment/per-employee severities for the grid UI. */
export function buildConflictUI(conflicts: Conflict[]): ConflictUI {
  const shiftSeverity = new Map<string, ConflictSeverity>()
  const assignmentSeverity = new Map<string, ConflictSeverity>()
  const employeeSeverity = new Map<string, ConflictSeverity>()

  for (const conflict of conflicts) {
    applyTo(shiftSeverity, conflict.shiftIds, conflict.severity)
    applyTo(assignmentSeverity, conflict.assignmentIds, conflict.severity)
    applyTo(employeeSeverity, conflict.employeeIds, conflict.severity)
  }

  return { shiftSeverity, assignmentSeverity, employeeSeverity }
}
