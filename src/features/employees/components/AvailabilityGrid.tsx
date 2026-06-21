import { useState } from 'react'
import { buttonPrimaryClass } from '../../../components/ui/styles'
import { DAY_OPTIONS, PERIODS } from '../../schedule/periods'
import type { Availability, DayOfWeek } from '../../schedule/types'
import type { AvailabilityDraft } from '../api'

type PeriodKey = 'morning' | 'afternoon' | 'evening'
type DayState = Record<PeriodKey, boolean> & { dayOff: boolean }
type GridState = Record<DayOfWeek, DayState>

function emptyGrid(): GridState {
  const grid = {} as GridState
  for (const { value } of DAY_OPTIONS) {
    grid[value] = { morning: false, afternoon: false, evening: false, dayOff: false }
  }
  return grid
}

function gridFromAvailability(availability?: Availability): GridState {
  const grid = emptyGrid()
  if (!availability) return grid

  for (const window of availability.unavailable ?? []) {
    const period = PERIODS.find((p) => p.start === window.start && p.end === window.end)
    if (period) {
      grid[window.day][period.key] = true
    }
  }
  for (const day of availability.daysOff ?? []) {
    grid[day].dayOff = true
  }
  return grid
}

function draftFromGrid(grid: GridState): AvailabilityDraft {
  const unavailable: AvailabilityDraft['unavailable'] = []
  const daysOff: DayOfWeek[] = []

  for (const { value: day } of DAY_OPTIONS) {
    const dayState = grid[day]
    if (dayState.dayOff) {
      daysOff.push(day)
      continue
    }
    for (const period of PERIODS) {
      if (dayState[period.key]) {
        unavailable.push({ day, start: period.start, end: period.end })
      }
    }
  }

  return { unavailable, daysOff }
}

interface AvailabilityGridProps {
  availability?: Availability
  saving: boolean
  onSave: (draft: AvailabilityDraft) => void
}

export function AvailabilityGrid({ availability, saving, onSave }: AvailabilityGridProps) {
  // The parent keys this component by employee id, so a fresh instance (and
  // fresh initial state) is mounted whenever the selected employee changes.
  const [grid, setGrid] = useState<GridState>(() => gridFromAvailability(availability))

  function toggle(day: DayOfWeek, key: PeriodKey | 'dayOff') {
    setGrid((prev) => ({ ...prev, [day]: { ...prev[day], [key]: !prev[day][key] } }))
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-muted-500">
            <th className="py-2 pr-2 font-medium">Dia</th>
            {PERIODS.map((period) => (
              <th key={period.key} className="px-2 py-2 text-center font-medium">
                {period.label}
              </th>
            ))}
            <th className="px-2 py-2 text-center font-medium">Folga</th>
          </tr>
        </thead>
        <tbody>
          {DAY_OPTIONS.map(({ value: day, label }) => (
            <tr key={day} className="border-t border-muted-100">
              <td className="py-2 pr-2 text-muted-700">{label}</td>
              {PERIODS.map((period) => (
                <td key={period.key} className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => toggle(day, period.key)}
                    disabled={grid[day].dayOff}
                    aria-pressed={grid[day][period.key]}
                    className={[
                      'h-7 w-16 rounded-md border text-xs font-medium transition-colors disabled:opacity-40',
                      grid[day][period.key]
                        ? 'border-danger-300 bg-danger-50 text-danger-700'
                        : 'border-muted-200 bg-white text-muted-500 hover:bg-muted-50',
                    ].join(' ')}
                  >
                    {grid[day][period.key] ? 'Indisp.' : 'Disp.'}
                  </button>
                </td>
              ))}
              <td className="px-2 py-2 text-center">
                <button
                  type="button"
                  onClick={() => toggle(day, 'dayOff')}
                  aria-pressed={grid[day].dayOff}
                  className={[
                    'h-7 w-16 rounded-md border text-xs font-medium transition-colors',
                    grid[day].dayOff
                      ? 'border-warning-300 bg-warning-50 text-warning-700'
                      : 'border-muted-200 bg-white text-muted-500 hover:bg-muted-50',
                  ].join(' ')}
                >
                  {grid[day].dayOff ? 'Folga' : '—'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        disabled={saving}
        onClick={() => onSave(draftFromGrid(grid))}
        className={`${buttonPrimaryClass} mt-3`}
      >
        {saving ? 'Salvando...' : 'Salvar disponibilidade'}
      </button>
    </div>
  )
}
