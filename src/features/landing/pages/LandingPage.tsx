import { Link } from 'react-router-dom'
import { buttonPrimaryClass, cardClass } from '../../../components/ui/styles'
import { CalendarIcon, ChatIcon, CheckIcon, ClockIcon } from '../../../components/ui/icons'

const BENEFITS = [
  {
    icon: CalendarIcon,
    title: 'Escala sem conflitos',
    description:
      'Arraste sua equipe pra grade da semana e veja na hora se alguém ficou com horário batido ou turno descoberto.',
  },
  {
    icon: ChatIcon,
    title: 'Pronto pro WhatsApp',
    description:
      'Um clique copia a escala da semana formatada e organizada por dia, prontinha pra colar no grupo da equipe.',
  },
  {
    icon: ClockIcon,
    title: 'Sem complicação',
    description: 'Cadastre a equipe, defina os turnos e monte a escala em minutos — sem treinamento, sem planilha.',
  },
]

const PRICING_FEATURES = [
  'Funcionários e escalas ilimitadas',
  'Histórico completo de escalas',
  'Exportação pro WhatsApp sem marca d’água',
]

const MOCK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
const MOCK_CELLS: ('empty' | 'ok' | 'conflict')[][] = [
  ['ok', 'ok', 'empty', 'ok', 'conflict'],
  ['empty', 'ok', 'ok', 'ok', 'ok'],
]

function ScheduleMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary-200 via-primary-100 to-warning-100 opacity-70 blur-2xl"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-muted-200 bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-muted-100 pb-3">
          <span className="text-xs font-semibold text-muted-600">Semana de 16/06 a 22/06</span>
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700">
            1 conflito
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {MOCK_DAYS.map((day) => (
            <div key={day} className="text-center text-[10px] font-medium text-muted-400">
              {day}
            </div>
          ))}
          {MOCK_CELLS.flat().map((cell, index) => (
            <div
              key={index}
              className={[
                'flex h-9 items-center justify-center rounded-md text-[9px] font-medium',
                cell === 'ok' && 'bg-primary-50 text-primary-700',
                cell === 'conflict' && 'bg-danger-50 text-danger-600 ring-1 ring-danger-200',
                cell === 'empty' && 'bg-muted-50 text-muted-300',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {cell === 'ok' ? 'Ana' : cell === 'conflict' ? 'Bruno' : '—'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-lg font-bold text-primary-600">ShiftPlan</span>
        <Link
          to="/login"
          className="rounded-lg px-4 py-2 text-sm font-medium text-muted-700 transition-colors hover:bg-muted-100"
        >
          Entrar
        </Link>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-12 md:grid-cols-2 md:py-20">
        <div className="flex flex-col items-start gap-5 text-left">
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            Feito pra bares, salões, cafeterias e lojas
          </span>
          <h1 className="text-4xl font-bold leading-tight text-muted-900 sm:text-5xl">
            Monte a escala da sua equipe sem dor de cabeça
          </h1>
          <p className="max-w-md text-base text-muted-600">
            Arraste, veja os conflitos de horário na hora e exporte pronto pro grupo do WhatsApp. Sem planilha, sem
            complicação.
          </p>
          <Link to="/login" className={`${buttonPrimaryClass} px-6 py-3 text-base`}>
            Criar minha conta gratuita
          </Link>
        </div>

        <div className="flex justify-center md:justify-end">
          <ScheduleMockup />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-5 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className={cardClass}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <benefit.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-semibold text-muted-900">{benefit.title}</p>
              <p className="mt-1 text-sm text-muted-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-md px-6 py-12 text-center">
        <div className={`${cardClass} flex flex-col items-center gap-3 border-primary-200`}>
          <p className="text-sm font-medium text-muted-500">Preço simples</p>
          <p className="text-4xl font-bold text-muted-900">
            R$ 39<span className="text-base font-normal text-muted-500">/mês</span>
          </p>
          <ul className="mt-1 flex flex-col gap-2 self-stretch text-left">
            {PRICING_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-600">
                <CheckIcon className="h-4 w-4 shrink-0 text-primary-600" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-400">Comece grátis com até 5 funcionários e 1 escala ativa.</p>
          <Link to="/login" className={`${buttonPrimaryClass} mt-1 w-full`}>
            Começar agora
          </Link>
        </div>
      </section>

      <footer className="border-t border-muted-100 px-6 py-6 text-center text-xs text-muted-400">
        ShiftPlan — feito para pequenos comércios.
      </footer>
    </div>
  )
}
