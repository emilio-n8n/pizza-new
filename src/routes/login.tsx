import { Link, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Brand } from '#/components/brand'
import { getSessionFn, loginFn } from '#/server/api'

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [{ title: 'Connexion, PizzaVoice' }],
  }),
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (session) {
      throw redirect({ to: session.location?.status === 'active' ? '/app' : '/onboarding' })
    }
  },
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const form = new FormData(event.currentTarget)
    const result = await loginFn({
      data: {
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      },
    })

    if (!result.ok) {
      setError(result.error)
      setPending(false)
      return
    }

    const session = await getSessionFn()
    await navigate({ to: session?.location?.status === 'active' ? '/app' : '/onboarding' })
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-top">
          <Brand />
          <p className="small-note">
            Pas encore de compte ? <Link to="/signup">Créer un établissement</Link>
          </p>
        </div>

        <div className="auth-main">
          <div className="auth-card">
            <p className="eyebrow">Connexion</p>
            <h1 className="auth-title">Reprendre le service.</h1>
            <p className="lede" style={{ fontSize: 15 }}>
              Vos commandes, votre menu et l'état de votre agent sont là où vous les avez
              laissés.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="login-email">Email professionnel</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@maisonluigi.fr"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="login-password">Mot de passe</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error ? <p className="auth-error">{error}</p> : null}

              <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
                {pending ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>

            <div className="auth-links">
              <span>Mot de passe oublié ? Écrivez à bonjour@pizzavoice.fr.</span>
            </div>
          </div>
        </div>
      </div>

      <aside className="auth-aside" aria-hidden="true">
        <img src="/images/oven.webp" alt="" />
        <div className="auth-quote">
          <p>« Le téléphone sonne, la commande part en cuisine. Personne ne quitte le four. »</p>
          <span>Chez Luigi · Paris 11e</span>
        </div>
      </aside>
    </div>
  )
}
