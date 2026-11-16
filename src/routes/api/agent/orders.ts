import { createFileRoute } from '@tanstack/react-router'

import type { OrderLine, OrderMode } from '#/lib/types'
import {
  createOrder,
  findLocationById,
  listLocations,
} from '#/server/store.server'
import { sendSms } from '#/server/sms.server'

type Payload = {
  tenant?: string
  locationId?: string
  phone?: string
  address?: string
  mode?: OrderMode
  customerName?: string
  items?: Array<{ name: string; quantity?: number }>
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function publicUrl(path: string) {
  const base = process.env.APP_PUBLIC_URL ?? 'http://localhost:4000'
  return `${base.replace(/\/$/, '')}${path}`
}

export const Route = createFileRoute('/api/agent/orders')({
  server: {
    handlers: {
      POST: async ({ request }) => {
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

        let payload: Payload
        try {
          payload = (await request.json()) as Payload
        } catch {
          return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 })
        }

        const locations = listLocations()
        let location =
          (payload.locationId && findLocationById(payload.locationId)) || null

        if (!location && payload.tenant) {
          const tenant = payload.tenant.replace(/\D/g, '')
          location =
            locations.find(
              (item) =>
                item.twilioNumber &&
                item.twilioNumber.replace(/\D/g, '') === tenant,
            ) ?? null
        }

        if (!location) {
          location =
            locations.find((item) => item.status === 'active') ??
            locations[0] ??
            null
        }

        if (!location) {
          return Response.json(
            { ok: false, error: 'no_location' },
            { status: 404 },
          )
        }

        if (!payload.phone) {
          return Response.json(
            { ok: false, error: 'missing_phone' },
            { status: 422 },
          )
        }

        const lines: OrderLine[] = (payload.items ?? [])
          .map((item) => {
            const quantity = Math.max(1, Math.round(item.quantity ?? 1))
            const key = normalize(item.name)
            const menuItem =
              location.menu.find((entry) => normalize(entry.name) === key) ??
              location.menu.find(
                (entry) =>
                  normalize(entry.name).includes(key) ||
                  key.includes(normalize(entry.name)),
              )

            return {
              name: menuItem?.name ?? item.name,
              quantity,
              priceCents: menuItem?.priceCents ?? 0,
            }
          })
          .filter((line) => line.name.length > 0)

        if (lines.length === 0) {
          return Response.json(
            { ok: false, error: 'empty_order' },
            { status: 422 },
          )
        }

        const mode: OrderMode = payload.mode ?? 'pickup'
        const deliveryFeeCents =
          mode === 'delivery' && location.delivery.enabled
            ? location.delivery.feeCents
            : 0

        const order = createOrder({
          locationId: location.id,
          customerName: payload.customerName ?? '',
          phone: payload.phone,
          address: payload.address ?? '',
          mode,
          lines,
          deliveryFeeCents,
        })

        const trackingUrl = publicUrl(`/suivi/${order.token}`)
        const sms = await sendSms(
          order.phone,
          `PizzaVoice — commande ${order.reference} confirmée. Suivez-la ici : ${trackingUrl}`,
        )

        return Response.json({
          ok: true,
          order: {
            id: order.id,
            reference: order.reference,
            token: order.token,
            trackingUrl,
            totalCents: order.totalCents,
            status: order.status,
          },
          sms,
        })
      },
    },
  },
})
