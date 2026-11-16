import { createFileRoute } from '@tanstack/react-router'

import { listDrivers, listLocations } from '#/server/store.server'

export const Route = createFileRoute('/api/agent/drivers')({
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
        const locations = listLocations()
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

        const drivers = listDrivers(location.id)
        return Response.json({
          ok: true,
          drivers: drivers.map((d) => ({
            name: d.name,
            active: d.active,
          })),
        })
      },
    },
  },
})