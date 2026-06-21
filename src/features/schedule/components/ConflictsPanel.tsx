import type { Conflict } from '../types'

export function ConflictsPanel({ conflicts }: { conflicts: Conflict[] }) {
  if (conflicts.length === 0) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-700">
        Nenhum conflito encontrado. Escala pronta para exportar!
      </div>
    )
  }

  const sorted = [...conflicts].sort((a, b) => {
    if (a.severity === b.severity) return 0
    return a.severity === 'error' ? -1 : 1
  })

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((conflict, index) => (
        <li
          key={index}
          className={[
            'rounded-md border px-3 py-2 text-sm',
            conflict.severity === 'error'
              ? 'border-danger-200 bg-danger-50 text-danger-700'
              : 'border-warning-200 bg-warning-50 text-warning-700',
          ].join(' ')}
        >
          {conflict.message}
        </li>
      ))}
    </ul>
  )
}
