import { createFileRoute } from '@tanstack/react-router'
import { setCookie } from '@tanstack/react-start/server'

import { verifyPassword } from '#/server/auth.server'
import { createSession, findUserByEmail } from '#/server/store.server'

type Body = { email?: string; password?: string }

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body
        try {
          body = (await request.json()) as Body
        } catch {
          return Response.json({ ok: false, error: 'Requête invalide.' }, { status: 400 })
        }

        const email = body.email?.trim().toLowerCase() ?? ''
        const password = body.password ?? ''

        try {
          const user = await findUserByEmail(email)
          if (!user || !verifyPassword(password, user.passwordHash)) {
            return Response.json({ ok: false, error: 'Email ou mot de passe incorrect.' })
          }

          const session = await createSession(user.id)
          setCookie('pv_session', session.id, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
            secure: process.env.NODE_ENV === 'production',
          })
          return Response.json({ ok: true })
        } catch (error) {
          console.error('[login]', error)
          return Response.json(
            { ok: false, error: 'Connexion impossible pour le moment.' },
            { status: 500 },
          )
        }
      },
    },
  },
})
