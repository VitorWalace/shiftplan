import { Link } from 'react-router-dom'
import { buttonPrimaryClass, buttonSecondaryClass, cardClass } from '../../../components/ui/styles'

const BENEFITS = [
  {
    icon: '🗓️',
    title: 'Escala sem conflitos',
    description: 'Arraste sua equipe pra grade da semana e veja na hora se alguém ficou com horário batido ou turno descoberto.',
  },
  {
    icon: '💬',
    title: 'Pronto pro WhatsApp',
    description: 'Um clique copia a escala da semana formatada e organizada por dia, prontinha pra colar no grupo da equipe.',
  },
  {
    icon: '⏱️',
    title: 'Sem complicação',
    description: 'Cadastre a equipe, defina os turnos e monte a escala em minutos — sem treinamento, sem planilha.',
  },
]

export function LandingPage() {
  return (
    <div className="bg-muted-50">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-lg font-bold text-primary-600">ShiftPlan</span>
        <Link to="/login" className={buttonSecondaryClass}>
          Entrar
        </Link>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-muted-900 sm:text-4xl">
          Monte a escala da sua equipe sem dor de cabeça
        </h1>
        <p className="max-w-xl text-muted-600">
          Pra bares, salões, cafeterias e lojas com poucos funcionários. Arraste, veja os conflitos na hora e exporte
          pronto pro grupo do WhatsApp.
        </p>
        <Link to="/login" className={`${buttonPrimaryClass} px-6 py-3 text-base`}>
          Criar minha conta gratuita
        </Link>
      </section>

      <section className="mx-auto grid max-w-4xl gap-4 px-4 pb-16 sm:grid-cols-3">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className={cardClass}>
            <p className="text-2xl">{benefit.icon}</p>
            <p className="mt-2 font-semibold text-muted-900">{benefit.title}</p>
            <p className="mt-1 text-sm text-muted-600">{benefit.description}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-md px-4 pb-20 text-center">
        <div className={`${cardClass} flex flex-col items-center gap-2`}>
          <p className="text-sm font-medium text-muted-500">Preço simples</p>
          <p className="text-3xl font-bold text-muted-900">
            R$ 39<span className="text-base font-normal text-muted-500">/mês</span>
          </p>
          <p className="text-sm text-muted-600">Equipe e escalas ilimitadas, histórico completo, sem marca d'água.</p>
          <p className="text-xs text-muted-400">Comece grátis com até 5 funcionários e 1 escala ativa.</p>
          <Link to="/login" className={`${buttonPrimaryClass} mt-2`}>
            Começar agora
          </Link>
        </div>
      </section>

      <footer className="border-t border-muted-200 px-4 py-6 text-center text-xs text-muted-400">
        ShiftPlan — feito para pequenos comércios.
      </footer>
    </div>
  )
}
