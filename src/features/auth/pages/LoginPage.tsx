import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../../../components/ui/styles'
import { CalendarIcon } from '../../../components/ui/icons'
import { useAuth } from '../AuthContext'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const { user, loading, signInWithPassword, signUp, signInWithMagicLink } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/app/escala" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const result = mode === 'login' ? await signInWithPassword(email, password) : await signUp(email, password)

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (mode === 'signup') {
      setInfo('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.')
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Informe seu e-mail para receber o link mágico.')
      return
    }
    setError(null)
    setInfo(null)
    setSubmitting(true)
    const result = await signInWithMagicLink(email)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }
    setInfo('Link de acesso enviado! Confira seu e-mail.')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted-50 px-4">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary-600">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
          <CalendarIcon className="h-5 w-5" />
        </span>
        ShiftPlan
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-muted-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-muted-900">
          {mode === 'login' ? 'Entrar no ShiftPlan' : 'Criar conta no ShiftPlan'}
        </h1>
        <p className="mt-1 text-sm text-muted-500">Monte a escala da sua equipe sem conflitos de horário.</p>

        <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className={labelClass}>
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="voce@seucomercio.com.br"
            />
          </label>

          <label className={labelClass}>
            Senha
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-danger-600">{error}</p>}
          {info && <p className="text-sm text-primary-700">{info}</p>}

          <button type="submit" disabled={submitting} className={`${buttonPrimaryClass} mt-1`}>
            {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <button type="button" onClick={handleMagicLink} disabled={submitting} className={buttonSecondaryClass}>
            Entrar com link mágico
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError(null)
            setInfo(null)
          }}
          className="mt-4 w-full text-center text-sm text-muted-500 transition-colors hover:text-primary-600"
        >
          {mode === 'login' ? 'Ainda não tem conta? Criar conta' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  )
}
