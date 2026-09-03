import { FormEvent, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { api, getApiError, storeUser } from '../api'
import type { AuthUser } from '../types'

export function LoginPage({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const login = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<AuthUser>('/api/auth/login', { email, password })
      return data
    },
    onSuccess: (data) => {
      storeUser(data)
      onLogin(data)
    },
    onError: (err) => setError(getApiError(err).message),
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    login.mutate()
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <img className="login-logo" src="/brand/mayitos-logo.jpg" alt="Mayitos" />
          <div>
            <span>Acceso operativo</span>
            <h1>Autobuses Mayitos</h1>
          </div>
        </div>
        <form onSubmit={submit} className="form stack">
          <label>
            Correo
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
          </label>
          <label>
            Contraseña
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
          </label>
          {error && <div className="alert">{error}</div>}
          <button className="primary-action" disabled={login.isPending}>
            <ShieldCheck size={18} />
            {login.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
