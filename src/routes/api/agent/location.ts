import { createFileRoute } from '@tanstack/react-router'

import { listLocations } from '#/server/store.server'

export const Route = createFileRoute('/api/agent/location')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expected = process.env.AGENT_API_KEY
        if (!expected) {
          return Response.json(
            { ok: false, error: 'agent_api_not_configured' },
            { status: 503 },
          )
        }
        if (request.headers.get('x-agent-key') !== expected) {
          return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
        }

        const tenant = new URL(request.url, 'http://localhost').searchParams.get('tenant')
        const locations = await listLocations()
        let location = null
        if (tenant) {
          const t = tenant.replace(/\D/g, '')
          location =
            locations.find(
              (item) => item.twilioNumber && item.twilioNumber.replace(/\D/g, '') === t,
            ) ?? null
        }
        if (!location) {
          location = locations.find((item) => item.status === 'active') ?? locations[0] ?? null
        }
        if (!location) {
          return Response.json({ ok: false, error: 'no_location' }, { status: 404 })
        }

        return Response.json({
          ok: true,
          location: {
            id: location.id,
            name: location.name,
            address: location.address,
            postalCode: location.postalCode,
            city: location.city,
            cuisine: location.cuisine,
            phone: location.phone,
            hours: location.hours,
            delivery: location.delivery,
            status: location.status,
          },
        })
      },
    },
  },
})