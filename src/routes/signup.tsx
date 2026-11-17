import { Link, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Brand } from '#/components/brand'
import { getSessionFn, signupFn } from '#/server/api'

export const Route = createFileRoute('/signup')({
  head: () => ({
    meta: [
      { title: 'Créer mon compte, PizzaVoice' },
      {
        name: 'description',
        content:
          'Créez votre compte PizzaVoice, importez votre carte et testez votre agent en quelques minutes. 14 jours d’essai, sans carte bancaire.',
      },
    ],
  }),
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (session) {
      throw redirect({ to: session.location?.status === 'active' ? '/app' : '/onboarding' })
    }
  },
  component: Signup,
})

function Signup() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const form = new FormData(event.currentTarget)
    const result = await signupFn({
      data: {
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      },
    })

    if (result.ok) {
      await navigate({ to: '/voice-setup' })
      return
    }

    setError(result.error)
    setPending(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-top">
          <Brand />
          <p className="small-note">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>

        <div className="auth-main">
          <div className="auth-card">
            <p className="eyebrow">Nouveau compte</p>
            <h1 className="auth-title">Votre standard en dix minutes.</h1>
            <p className="lede" style={{ fontSize: 15 }}>
              Créez votre compte, importez votre carte, testez l'agent. L'essai de 14 jours
              ne demande pas de carte bancaire.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="signup-name">Votre nom</label>
                <input
                  id="signup-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Emilio Moreau"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="signup-email">Email professionnel</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@maisonluigi.fr"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="signup-password">Mot de passe</label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="8 caractères minimum"
                  minLength={8}
                  required
                />
              </div>

              {error ? <p className="auth-error">{error}</p> : null}

              <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
                {pending ? 'Création du compte…' : 'Créer mon compte'}
              </button>

              <p className="small-note">
                Vous préférez remplir un formulaire ?{' '}
                <Link to="/login">Connectez-vous</Link> puis choisissez « configurer à l'écrit ».
              </p>

              <p className="small-note">
                En créant un compte, vous acceptez les{' '}
                <Link to="/legal" hash="terms">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/legal" hash="privacy">
                  politique de confidentialité
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </div>

      <aside className="auth-aside" aria-hidden="true">
        <img src="/images/counter.webp" alt="" />
        <div className="auth-quote">
          <p>« Compte créé, carte importée, agent testé. Le service peut commencer. »</p>
          <span>Mise en route · 10 minutes</span>
        </div>
      </aside>
    </div>
  )
}
