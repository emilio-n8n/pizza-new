import { randomUUID } from 'node:crypto'

import { createFileRoute } from '@tanstack/react-router'

import type { DayHours, DeliverySettings, MenuItem } from '#/lib/types'
import { defaultDelivery, defaultHours } from '#/lib/defaults'
import { findUserById, upsertLocation } from '#/server/store.server'

type MenuIn = {
  name?: string
  category?: string
  description?: string
  priceCents?: number
  price?: string
  available?: boolean
}

type HoursIn = {
  day?: number
  closed?: boolean
  open?: string
  close?: string
}

type Payload = {
  sessionId?: string
  establishment?: {
    name?: string
    address?: string
    postalCode?: string
    city?: string
    cuisine?: string
    phone?: string
  }
  menu?: MenuIn[]
  hours?: HoursIn[]
  delivery?: {
    enabled?: boolean
    feeCents?: number
    minOrderCents?: number
    radiusKm?: number
    postalCodes?: string
  }
}

const SESSION_FILE_HEADER = 'x-onboarding-session'

function clean(value: unknown, max = 120) {
  return String(value ?? '').trim().slice(0, max)
}

function toCents(item: MenuIn): number {
  if (typeof item.priceCents === 'number' && Number.isFinite(item.priceCents)) {
    return Math.max(0, Math.round(item.priceCents))
  }
  const parsed = Number.parseFloat(String(item.price ?? '').replace(',', '.'))
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100)) : 0
}

export const Route = createFileRoute('/api/agent/onboarding')({
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

        // Le runtime transmet l'id de session pour qu'on sache de quel compte il parle.
        const userId = clean(request.headers.get(SESSION_FILE_HEADER), 64)
        const user = userId ? findUserById(userId) : null
        if (!user) {
          return Response.json({ ok: false, error: 'unknown_user' }, { status: 404 })
        }

        let payload: Payload
        try {
          payload = (await request.json()) as Payload
        } catch {
          return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 })
        }

        const est = payload.establishment ?? {}
        const name = clean(est.name)
        if (name.length < 2) {
          return Response.json(
            { ok: false, error: 'missing_name', message: "Il manque le nom de la pizzeria." },
            { status: 422 },
          )
        }

        const menu: MenuItem[] = (payload.menu ?? [])
          .map((item) => {
            const itemName = clean(item.name, 80)
            const priceCents = toCents(item)
            return {
              id: randomUUID(),
              category: clean(item.category, 40) || 'Pizza',
              name: itemName,
              description: clean(item.description, 200),
              priceCents,
              available: item.available !== false,
            }
          })
          .filter((item) => item.name.length >= 2 && item.priceCents > 0)

        if (menu.length === 0) {
          return Response.json(
            {
              ok: false,
              error: 'missing_menu',
              message: 'Il faut au moins un produit avec un prix.',
            },
            { status: 422 },
          )
        }

        const baseHours = defaultHours()
        const hours: DayHours[] = baseHours.map((slot) => {
          const found = (payload.hours ?? []).find((h) => h.day === slot.day)
          if (!found) return slot
          return {
            day: slot.day,
            closed: Boolean(found.closed),
            open: clean(found.open, 5) || slot.open,
            close: clean(found.close, 5) || slot.close,
          }
        })

        const deliveryIn = payload.delivery ?? {}
        const baseDelivery = defaultDelivery()
        const delivery: DeliverySettings = {
          enabled: deliveryIn.enabled !== false,
          feeCents:
            typeof deliveryIn.feeCents === 'number' && Number.isFinite(deliveryIn.feeCents)
              ? Math.max(0, Math.round(deliveryIn.feeCents))
              : baseDelivery.feeCents,
          minOrderCents:
            typeof deliveryIn.minOrderCents === 'number' &&
            Number.isFinite(deliveryIn.minOrderCents)
              ? Math.max(0, Math.round(deliveryIn.minOrderCents))
              : baseDelivery.minOrderCents,
          radiusKm:
            typeof deliveryIn.radiusKm === 'number' && Number.isFinite(deliveryIn.radiusKm)
              ? Math.max(0, deliveryIn.radiusKm)
              : baseDelivery.radiusKm,
          postalCodes: clean(deliveryIn.postalCodes, 200),
        }

        const location = upsertLocation(user.id, {
          name,
          address: clean(est.address, 160),
          postalCode: clean(est.postalCode, 10),
          city: clean(est.city, 80),
          cuisine: clean(est.cuisine, 40) || 'Italienne',
          phone: clean(est.phone, 30),
          menu,
          hours,
          delivery,
          onboardingStep: 5,
        })

        return Response.json({
          ok: true,
          location: {
            id: location.id,
            name: location.name,
            menuCount: menu.length,
            delivery,
            hours,
          },
        })
      },
    },
  },
})
