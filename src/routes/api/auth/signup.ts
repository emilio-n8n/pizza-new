import { createFileRoute } from '@tanstack/react-router'
import { setCookie } from '@tanstack/react-start/server'

import { hashPassword } from '#/server/auth.server'
import { createSession, createUser, findUserByEmail } from '#/server/store.server'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Body = { name?: string; email?: string; password?: string }

export const Route = createFileRoute('/api/auth/signup')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body
        try {
          body = (await request.json()) as Body
        } catch {
          return Response.json({ ok: false, error: 'Requête invalide.' }, { status: 400 })
        }

        const name = body.name?.trim() ?? ''
        const email = body.email?.trim().toLowerCase() ?? ''
        const password = body.password ?? ''

        if (name.length < 2) {
          return Response.json({ ok: false, error: 'Indiquez votre nom.' })
        }
        if (!EMAIL.test(email)) {
          return Response.json({ ok: false, error: 'Cet email n’est pas valide.' })
        }
        if (password.length < 8) {
          return Response.json({
            ok: false,
            error: 'Le mot de passe doit faire au moins 8 caractères.',
          })
        }
        if (await findUserByEmail(email)) {
          return Response.json({
            ok: false,
            error: 'Un compte existe déjà avec cet email. Connectez-vous.',
          })
        }

        try {
          const user = await createUser({
            email,
            name,
            passwordHash: hashPassword(password),
          })
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
          console.error('[signup]', error)
          return Response.json(
            { ok: false, error: 'Création impossible pour le moment.' },
            { status: 500 },
          )
        }
      },
    },
  },
})
