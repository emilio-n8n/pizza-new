import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import type {
  Driver,
  Location,
  MenuItem,
  Order,
  OrderLine,
  OrderMode,
  OrderStatus,
} from '#/lib/types'
import { defaultDelivery, defaultHours } from '#/lib/defaults'

const TEST_NUMBER = process.env.PV_TEST_NUMBER ?? '01 89 71 33 56'

export type StoredUser = {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: string
}

export type StoredSession = {
  id: string
  userId: string
  expiresAt: string
}

type Database = {
  users: StoredUser[]
  locations: Location[]
  sessions: StoredSession[]
  orders: Order[]
  drivers: Driver[]
}

const DATA_FILE = resolve(process.env.PV_DATA_FILE ?? '.data/db.json')

const emptyDatabase = (): Database => ({
  users: [],
  locations: [],
  sessions: [],
  orders: [],
  drivers: [],
})

let cache: Database | null = null

function load(): Database {
  if (cache) return cache
  if (!existsSync(DATA_FILE)) {
    cache = emptyDatabase()
    return cache
  }
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, 'utf8')) as Partial<Database>
    cache = {
      users: parsed.users ?? [],
      locations: parsed.locations ?? [],
      sessions: parsed.sessions ?? [],
      orders: parsed.orders ?? [],
      drivers: parsed.drivers ?? [],
    }
  } catch {
    cache = emptyDatabase()
  }
  return cache
}

function persist(database: Database) {
  cache = database
  mkdirSync(dirname(DATA_FILE), { recursive: true })
  const temporary = `${DATA_FILE}.tmp`
  writeFileSync(temporary, JSON.stringify(database, null, 2), 'utf8')
  renameSync(temporary, DATA_FILE)
}

// --- Users -----------------------------------------------------------------

export function findUserByEmail(email: string) {
  return load().users.find((user) => user.email === email.trim().toLowerCase())
}

export function findUserById(id: string) {
  return load().users.find((user) => user.id === id)
}

export function createUser(input: {
  email: string
  name: string
  passwordHash: string
}): StoredUser {
  const database = load()
  const user: StoredUser = {
    id: randomUUID(),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
  }
  database.users.push(user)
  persist(database)
  return user
}

// --- Sessions --------------------------------------------------------------

export function createSession(userId: string, days = 30): StoredSession {
  const database = load()
  const session: StoredSession = {
    id: randomUUID(),
    userId,
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
  }
  database.sessions = database.sessions.filter(
    (item) => new Date(item.expiresAt).getTime() > Date.now(),
  )
  database.sessions.push(session)
  persist(database)
  return session
}

export function findSession(id: string | undefined): StoredSession | null {
  if (!id) return null
  const session = load().sessions.find((item) => item.id === id)
  if (!session) return null
  if (new Date(session.expiresAt).getTime() <= Date.now()) return null
  return session
}

export function deleteSession(id: string) {
  const database = load()
  database.sessions = database.sessions.filter((session) => session.id !== id)
  persist(database)
}

// --- Locations -------------------------------------------------------------

export function findLocationByUser(userId: string): Location | null {
  return (
    load().locations.find(
      (location) => (location as Location & { userId: string }).userId === userId,
    ) ?? null
  )
}

export function findLocationById(id: string): Location | null {
  return load().locations.find((location) => location.id === id) ?? null
}

type LocationWithOwner = Location & { userId: string }

export function listLocations(): LocationWithOwner[] {
  return load().locations as LocationWithOwner[]
}

export function upsertLocation(
  userId: string,
  patch: Partial<Omit<Location, 'id'>>,
): Location {
  const database = load()
  const existing = database.locations.find(
    (location) => (location as LocationWithOwner).userId === userId,
  )

  if (existing) {
    Object.assign(existing, patch)
    persist(database)
    return existing
  }

  const location = {
    id: randomUUID(),
    userId,
    name: '',
    address: '',
    postalCode: '',
    city: '',
    cuisine: 'Italienne',
    phone: '',
    menu: [],
    hours: defaultHours(),
    delivery: defaultDelivery(),
    status: 'draft',
    testNumber: TEST_NUMBER,
    twilioNumber: '',
    onboardingStep: 1,
    createdAt: new Date().toISOString(),
    ...patch,
  } as LocationWithOwner

  database.locations.push(location)
  persist(database)
  return location
}

export function setMenu(userId: string, menu: MenuItem[]) {
  return upsertLocation(userId, { menu })
}

export function updateMenuItem(userId: string, itemId: string, patch: Partial<MenuItem>) {
  const location = findLocationByUser(userId)
  if (!location) return null
  const menu = location.menu.map((item) =>
    item.id === itemId ? { ...item, ...patch, id: item.id } : item,
  )
  return upsertLocation(userId, { menu })
}

export function removeMenuItem(userId: string, itemId: string) {
  const location = findLocationByUser(userId)
  if (!location) return null
  return upsertLocation(userId, {
    menu: location.menu.filter((item) => item.id !== itemId),
  })
}

export function activateLocation(userId: string) {
  return upsertLocation(userId, { status: 'active', onboardingStep: 5 })
}

// --- Orders ----------------------------------------------------------------

export function listOrders(userId: string) {
  const location = findLocationByUser(userId)
  if (!location) return []
  return load()
    .orders.filter((order) => order.locationId === location.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listOrdersForLocation(locationId: string) {
  return load()
    .orders.filter((order) => order.locationId === locationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getOrderByToken(token: string) {
  return load().orders.find((order) => order.token === token) ?? null
}

export function getOrderById(id: string) {
  return load().orders.find((order) => order.id === id) ?? null
}

export function createOrder(input: {
  locationId: string
  customerName?: string
  phone: string
  address: string
  mode: OrderMode
  lines: OrderLine[]
  deliveryFeeCents?: number
}) {
  const database = load()
  const subtotalCents = input.lines.reduce(
    (sum, line) => sum + line.priceCents * line.quantity,
    0,
  )
  const deliveryFeeCents =
    input.mode === 'delivery' ? (input.deliveryFeeCents ?? 0) : 0
  const now = new Date().toISOString()

  const order: Order = {
    id: randomUUID(),
    locationId: input.locationId,
    reference: `PV-${Date.now().toString().slice(-5)}`,
    token: randomUUID().replace(/-/g, ''),
    customerName: input.customerName ?? '',
    phone: input.phone,
    address: input.address,
    mode: input.mode,
    lines: input.lines,
    subtotalCents,
    deliveryFeeCents,
    totalCents: subtotalCents + deliveryFeeCents,
    status: 'new',
    driverId: null,
    createdAt: now,
    updatedAt: now,
  }

  database.orders.push(order)
  persist(database)
  return order
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const database = load()
  const order = database.orders.find((item) => item.id === orderId)
  if (!order) return null
  order.status = status
  order.updatedAt = new Date().toISOString()
  persist(database)
  return order
}

// --- Drivers ---------------------------------------------------------------

export function createDriver(input: {
  locationId: string
  name: string
  phone: string
}) {
  const database = load()
  const driver: Driver = {
    id: randomUUID(),
    locationId: input.locationId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    token: randomUUID().replace(/-/g, ''),
    active: true,
    createdAt: new Date().toISOString(),
  }
  database.drivers.push(driver)
  persist(database)
  return driver
}

export function listDrivers(locationId: string) {
  return load().drivers.filter((driver) => driver.locationId === locationId)
}

export function findDriverByToken(token: string) {
  return load().drivers.find((driver) => driver.token === token) ?? null
}

export function setDriverActive(driverId: string, active: boolean) {
  const database = load()
  const driver = database.drivers.find((item) => item.id === driverId)
  if (!driver) return null
  driver.active = active
  persist(database)
  return driver
}

export function driverOrders(driver: Driver) {
  const orders = load()
    .orders.filter((order) => order.locationId === driver.locationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return {
    available: orders.filter(
      (order) => order.status === 'ready' && order.mode === 'delivery',
    ),
    active: orders.filter(
      (order) =>
        order.status === 'delivering' &&
        order.mode === 'delivery' &&
        order.driverId === driver.id,
    ),
  }
}

export function takeOrder(driverToken: string, orderId: string) {
  const driver = findDriverByToken(driverToken)
  if (!driver || !driver.active) return null

  const database = load()
  const order = database.orders.find((item) => item.id === orderId)
  if (!order) return null
  if (order.locationId !== driver.locationId) return null
  if (order.status !== 'ready') return null

  order.status = 'delivering'
  order.driverId = driver.id
  order.updatedAt = new Date().toISOString()
  persist(database)
  return order
}

export function completeOrder(driverToken: string, orderId: string) {
  const driver = findDriverByToken(driverToken)
  if (!driver) return null

  const database = load()
  const order = database.orders.find((item) => item.id === orderId)
  if (!order) return null
  if (order.driverId !== driver.id) return null
  if (order.status !== 'delivering') return null

  order.status = 'delivered'
  order.updatedAt = new Date().toISOString()
  persist(database)
  return order
}
