import { randomUUID } from 'node:crypto'
import { copyFileSync, cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { createServerFn } from '@tanstack/react-start'

import type { DayHours, DeliverySettings, MenuItem, SessionPayload } from '#/lib/types'

import { endSession, getSessionPayload, hashPassword, startSession, verifyPassword } from './auth.server'
import { defaultDelivery, defaultHours } from '#/lib/defaults'
import {
  activateLocation,
  completeOrder,
  createDriver,
  createUser,
  driverOrders,
  findDriverByToken,
  findLocationById,
  findUserByEmail,
  getOrderById,
  getOrderByToken,
  listDrivers,
  listOrders,
  removeMenuItem,
  setDriverActive,
  setMenu,
  takeOrder,
  updateMenuItem,
  updateOrderStatus,
  upsertLocation,
} from './store.server'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type AuthResult = { ok: true } | { ok: false; error: string }

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionPayload | null> => getSessionPayload(),
)

export const signupFn = createServerFn({ method: 'POST' })
  .validator((data: { name: string; email: string; password: string }) => data)
  .handler(async ({ data }): Promise<AuthResult> => {
    const name = data.name?.trim() ?? ''
    const email = data.email?.trim().toLowerCase() ?? ''
    const password = data.password ?? ''

    if (name.length < 2) return { ok: false, error: 'Indiquez votre nom.' }
    if (!EMAIL.test(email)) return { ok: false, error: 'Cet email n’est pas valide.' }
    if (password.length < 8) {
      return { ok: false, error: 'Le mot de passe doit faire au moins 8 caractères.' }
    }
    if (findUserByEmail(email)) {
      return { ok: false, error: 'Un compte existe déjà avec cet email. Connectez-vous.' }
    }

    const user = createUser({ email, name, passwordHash: hashPassword(password) })
    startSession(user.id)
    return { ok: true }
  })

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }): Promise<AuthResult> => {
    const email = data.email?.trim().toLowerCase() ?? ''
    const user = findUserByEmail(email)

    if (!user || !verifyPassword(data.password ?? '', user.passwordHash)) {
      return { ok: false, error: 'Email ou mot de passe incorrect.' }
    }

    startSession(user.id)
    return { ok: true }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  endSession()
  return { ok: true }
})

export const saveEstablishmentFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      id?: string
      name: string
      address: string
      postalCode: string
      city: string
      cuisine: string
      phone: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session) return { ok: false as const, error: 'Session expirée.' }

    const name = data.name.trim()
    const address = data.address.trim()
    if (name.length < 2) return { ok: false as const, error: 'Indiquez le nom de la pizzeria.' }
    if (address.length < 4) return { ok: false as const, error: 'Indiquez l’adresse.' }

    const location = upsertLocation(session.user.id, {
      name,
      address,
      postalCode: data.postalCode.trim(),
      city: data.city.trim(),
      cuisine: data.cuisine.trim(),
      phone: data.phone.trim(),
      hours: session.location?.hours ?? defaultHours(),
      delivery: session.location?.delivery ?? defaultDelivery(),
      onboardingStep: Math.max(session.location?.onboardingStep ?? 1, 2),
    })

    return { ok: true as const, location }
  })

export const saveMenuFn = createServerFn({ method: 'POST' })
  .validator((data: { items: MenuItem[] }) => data)
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session) return { ok: false as const, error: 'Session expirée.' }

    const items = data.items
      .filter((item) => item.name.trim().length > 0 && item.priceCents >= 0)
      .map((item) => ({
        id: item.id || randomUUID(),
        category: item.category.trim() || 'Pizza',
        name: item.name.trim(),
        description: item.description.trim(),
        priceCents: Math.round(item.priceCents),
        available: item.available !== false,
      }))

    if (items.length === 0) {
      return { ok: false as const, error: 'Ajoutez au moins un produit.' }
    }

    const location = setMenu(session.user.id, items)
    upsertLocation(session.user.id, {
      onboardingStep: Math.max(location.onboardingStep, 3),
    })

    return { ok: true as const, menu: items }
  })

export const saveServiceFn = createServerFn({ method: 'POST' })
  .validator((data: { hours: DayHours[]; delivery: DeliverySettings }) => data)
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session) return { ok: false as const, error: 'Session expirée.' }

    const hours = data.hours
      .filter((day) => day.day >= 0 && day.day <= 6)
      .map((day) => ({
        day: day.day,
        closed: Boolean(day.closed),
        open: day.open || '11:30',
        close: day.close || '22:30',
      }))

    const delivery = {
      enabled: Boolean(data.delivery.enabled),
      feeCents: Math.max(0, Math.round(data.delivery.feeCents)),
      minOrderCents: Math.max(0, Math.round(data.delivery.minOrderCents)),
      radiusKm: Math.max(0, Number(data.delivery.radiusKm) || 0),
      postalCodes: data.delivery.postalCodes.trim(),
    }

    upsertLocation(session.user.id, {
      hours: hours.length === 7 ? hours : defaultHours(),
      delivery,
      onboardingStep: Math.max(session.location?.onboardingStep ?? 3, 4),
    })

    return { ok: true as const }
  })

function digits(value: string) {
  return value.replace(/\D/g, '')
}

function provisionRuntime(location: {
  id: string
  name: string
  twilioNumber: string
}) {
  const number = digits(location.twilioNumber)
  if (!number) return null

  const tenants = resolve(
    process.env.RUNTIME_DATA_DIR ?? 'runtime/data',
    'tenants',
  )
  const source = join(tenants, 'default', 'program.json')
  if (!existsSync(source)) return null

  const target = join(tenants, number)
  mkdirSync(join(target, 'audio'), { recursive: true })
  copyFileSync(source, join(target, 'program.json'))

  const sourceAudio = join(tenants, 'default', 'audio')
  if (existsSync(sourceAudio)) {
    cpSync(sourceAudio, join(target, 'audio'), { recursive: true })
  }
  writeFileSync(
    join(target, 'meta.json'),
    JSON.stringify({ name: location.name, locationId: location.id }, null, 2),
    'utf8',
  )

  return { path: target, number }
}

export const activateFn = createServerFn({ method: 'POST' })
  .validator((data: { twilioNumber?: string }) => data)
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session) return { ok: false as const, error: 'Session expirée.' }
    if (!session.location || session.location.menu.length === 0) {
      return { ok: false as const, error: 'Ajoutez au moins un produit au menu.' }
    }

    if (data.twilioNumber) {
      upsertLocation(session.user.id, {
        twilioNumber: data.twilioNumber.trim(),
      })
    }

    const location = activateLocation(session.user.id)
    const provisioned = provisionRuntime({
      id: location.id,
      name: location.name,
      twilioNumber: location.twilioNumber,
    })

    return { ok: true as const, location, provisioned }
  })

export const saveTelephonyFn = createServerFn({ method: 'POST' })
  .validator((data: { twilioNumber: string }) => data)
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session) return { ok: false as const, error: 'Session expirée.' }

    const location = upsertLocation(session.user.id, {
      twilioNumber: data.twilioNumber.trim(),
    })
    const provisioned = provisionRuntime({
      id: location.id,
      name: location.name,
      twilioNumber: location.twilioNumber,
    })

    return { ok: true as const, location, provisioned }
  })

export const updateMenuItemFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string; patch: Partial<MenuItem> }) => data)
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session) return { ok: false as const, error: 'Session expirée.' }
    const location = updateMenuItem(session.user.id, data.id, data.patch)
    return { ok: true as const, menu: location?.menu ?? [] }
  })

export const addMenuItemFn = createServerFn({ method: 'POST' })
  .validator((data: Omit<MenuItem, 'id'>) => data)
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session?.location) return { ok: false as const, error: 'Session expirée.' }
    const item: MenuItem = { ...data, id: randomUUID() }
    const location = setMenu(session.user.id, [...session.location.menu, item])
    return { ok: true as const, menu: location?.menu ?? [] }
  })

export const removeMenuItemFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session) return { ok: false as const, error: 'Session expirée.' }
    const location = removeMenuItem(session.user.id, data.id)
    return { ok: true as const, menu: location?.menu ?? [] }
  })

export const getDashboardFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = getSessionPayload()
  if (!session) return null

  const orders = listOrders(session.user.id)
  return {
    user: session.user,
    location: session.location,
    orders,
  }
})

export const getMenuFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = getSessionPayload()
  if (!session?.location) return null
  return { location: session.location }
})


// --- Suivi client ----------------------------------------------------------

export const getTrackingFn = createServerFn({ method: 'GET' })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const order = getOrderByToken(data.token)
    if (!order) return null

    const location = findLocationById(order.locationId)

    return {
      order,
      location: location
        ? {
            name: location.name,
            address: location.address,
            city: location.city,
            phone: location.phone,
          }
        : null,
    }
  })

// --- Livreurs --------------------------------------------------------------

export const getDriverViewFn = createServerFn({ method: 'GET' })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const driver = findDriverByToken(data.token)
    if (!driver || !driver.active) return null

    const location = findLocationById(driver.locationId)
    const orders = driverOrders(driver)

    return {
      driver: { id: driver.id, name: driver.name, phone: driver.phone },
      location: location
        ? { name: location.name, address: location.address, city: location.city }
        : null,
      available: orders.available,
      active: orders.active,
    }
  })

export const takeDeliveryFn = createServerFn({ method: 'POST' })
  .validator((data: { token: string; orderId: string }) => data)
  .handler(async ({ data }) => {
    const order = takeOrder(data.token, data.orderId)
    if (!order) return { ok: false as const, error: 'Course indisponible.' }
    return { ok: true as const }
  })

export const completeDeliveryFn = createServerFn({ method: 'POST' })
  .validator((data: { token: string; orderId: string }) => data)
  .handler(async ({ data }) => {
    const order = completeOrder(data.token, data.orderId)
    if (!order) return { ok: false as const, error: 'Course introuvable.' }
    return { ok: true as const }
  })

export const listDriversFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = getSessionPayload()
    if (!session?.location) return []
    return listDrivers(session.location.id).map((driver) => ({
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      token: driver.token,
      active: driver.active,
    }))
  },
)

export const createDriverFn = createServerFn({ method: 'POST' })
  .validator((data: { name: string; phone: string }) => data)
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session?.location) {
      return { ok: false as const, error: 'Session expirée.' }
    }
    if (data.name.trim().length < 2) {
      return { ok: false as const, error: 'Indiquez le prénom du livreur.' }
    }

    const driver = createDriver({
      locationId: session.location.id,
      name: data.name,
      phone: data.phone,
    })

    return { ok: true as const, driver }
  })

export const toggleDriverFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string; active: boolean }) => data)
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session?.location) {
      return { ok: false as const, error: 'Session expirée.' }
    }

    const driver = setDriverActive(data.id, data.active)
    if (!driver || driver.locationId !== session.location.id) {
      return { ok: false as const, error: 'Livreur introuvable.' }
    }

    return { ok: true as const }
  })

export const updateOrderStatusFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      orderId: string
      status: 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'
    }) => data,
  )
  .handler(async ({ data }) => {
    const session = getSessionPayload()
    if (!session?.location) {
      return { ok: false as const, error: 'Session expirée.' }
    }

    const order = getOrderById(data.orderId)
    if (!order || order.locationId !== session.location.id) {
      return { ok: false as const, error: 'Commande introuvable.' }
    }

    const updated = updateOrderStatus(order.id, data.status)
    return updated
      ? { ok: true as const }
      : { ok: false as const, error: 'Mise à jour impossible.' }
  })
