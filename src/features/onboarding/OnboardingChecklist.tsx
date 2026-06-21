import { Link } from 'react-router-dom'

interface Step {
  label: string
  to: string
  cta: string
}

const STEPS: Step[] = [
  { label: 'Cadastre sua equipe', to: '/app/equipe', cta: 'Ir para Equipe' },
  { label: 'Defina os turnos da semana', to: '/app/configuracoes', cta: 'Ir para Configurações' },
  { label: 'Monte a escala arrastando funcionários', to: '/app/escala', cta: 'Ir para Escala' },
]

interface OnboardingChecklistProps {
  hasEmployees: boolean
  hasShifts: boolean
  hasAssignments: boolean
}

export function OnboardingChecklist({ hasEmployees, hasShifts, hasAssignments }: OnboardingChecklistProps) {
  const done = [hasEmployees, hasShifts, hasAssignments]
  if (done.every(Boolean)) return null

  const currentIndex = done.findIndex((step) => !step)

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
      <p className="text-sm font-semibold text-primary-800">Primeiros passos no ShiftPlan</p>
      <ol className="mt-3 flex flex-col gap-2">
        {STEPS.map((step, index) => {
          const isDone = done[index]
          const isCurrent = index === currentIndex
          return (
            <li key={step.to} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className={isDone ? 'text-primary-700 line-through' : 'font-medium text-muted-700'}>
                {isDone ? '✅' : `${index + 1}.`} {step.label}
              </span>
              {isCurrent && (
                <Link to={step.to} className="text-xs font-medium text-primary-700 hover:underline">
                  {step.cta} →
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
