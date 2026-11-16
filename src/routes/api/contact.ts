import { createFileRoute } from '@tanstack/react-router'

type ContactPayload = {
  name?: string
  email?: string
  phone?: string
  locations?: string
  message?: string
}

export const Route = createFileRoute('/api/contact')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: ContactPayload
        try {
          payload = (await request.json()) as ContactPayload
        } catch {
          return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 })
        }

        const name = payload.name?.trim()
        const email = payload.email?.trim()

        if (!name || !email || !email.includes('@')) {
          return Response.json({ ok: false, error: 'missing_fields' }, { status: 422 })
        }

        // TODO(Supabase) : enregistrer la demande dans la table contact_requests
        // et envoyer l'email de confirmation. Rien n'est persisté pour l'instant.
        console.info('[contact] nouvelle demande', {
          name,
          email,
          phone: payload.phone ?? '',
          locations: payload.locations ?? '',
          message: payload.message ?? '',
        })

        return Response.json({ ok: true })
      },
    },
  },
})
