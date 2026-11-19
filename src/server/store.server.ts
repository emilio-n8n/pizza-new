import { randomUUID } from 'node:crypto'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type {
  DayHours,
  DeliverySettings,
  Driver,
  Location,
  MenuItem,
  Order,
  OrderLine,
  OrderMode,
  OrderStatus,
} from '#/lib/types'
import { defaultDelivery, defaultHours } from '#/lib/defaults'

/**
 * Accès aux données via Supabase (Postgres).
 *
 * Toutes les fonctions sont asynchrones : elles étaient synchrones quand les
 * données vivaient dans un fichier JSON en mémoire. Les appelants doivent donc
 * les attendre.
 *
 * Le client utilise la clé service_role : il contourne RLS, ce qui est voulu —
 * il ne vit que côté serveur, jamais dans un bundle navigateur.
 */

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

export type LocationWithOwner = Location & { userId: string }

let client: SupabaseClient | null = null

function db(): SupabaseClient {
  if (client) return client
  const url = process.env.SUPABASE_URL ?? ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? ''
  if (!url || !key) {
    throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (voir .env).')
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

function fail(scope: string, error: unknown) {
  console.error(`[store] ${scope}`, error)
}

// ------------------------------------------------------------------ mappers

type UserRow = {
  id: string
  email: string
  name: string
  password_hash: string
  created_at: string
}

type LocationRow = {
  id: string
  user_id: string
  name: string
  address: string
  postal_code: string
  city: string
  cuisine: string
  phone: string
  menu: MenuItem[] | null
  hours: DayHours[] | null
  delivery: DeliverySettings | null
  status: 'draft' | 'active'
  test_number: string
  twilio_number: string
  onboarding_step: number
  created_at: string
}

type OrderRow = {
  id: string
  location_id: string
  reference: string
  token: string
  customer_name: string
  phone: string
  address: string
  mode: OrderMode
  lines: OrderLine[] | null
  subtotal_cents: number
  delivery_fee_cents: number
  total_cents: number
  status: OrderStatus
  driver_id: string | null
  created_at: string
  updated_at: string
}

type DriverRow = {
  id: string
  location_id: string
  name: string
  phone: string
  token: string
  active: boolean
  created_at: string
}

function rowToUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  }
}

const toLocation = (row: LocationRow): LocationWithOwner => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  address: row.address,
  postalCode: row.postal_code,
  city: row.city,
  cuisine: row.cuisine,
  phone: row.phone,
  menu: row.menu ?? [],
  hours: row.hours?.length ? row.hours : defaultHours(),
  delivery: row.delivery ?? defaultDelivery(),
  status: row.status,
  testNumber: row.test_number || TEST_NUMBER,
  twilioNumber: row.twilio_number,
  onboardingStep: row.onboarding_step,
  createdAt: row.created_at,
})

const toOrder = (row: OrderRow): Order => ({
  id: row.id,
  locationId: row.location_id,
  reference: row.reference,
  token: row.token,
  customerName: row.customer_name,
  phone: row.phone,
  address: row.address,
  mode: row.mode,
  lines: row.lines ?? [],
  subtotalCents: row.subtotal_cents,
  deliveryFeeCents: row.delivery_fee_cents,
  totalCents: row.total_cents,
  status: row.status,
  driverId: row.driver_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const toDriver = (row: DriverRow): Driver => ({
  id: row.id,
  locationId: row.location_id,
  name: row.name,
  phone: row.phone,
  token: row.token,
  active: row.active,
  createdAt: row.created_at,
})

// -------------------------------------------------------------------- users

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const { data, error } = await db()
    .from('pv_users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle<UserRow>()
  if (error) {
    fail('findUserByEmail', error)
    return null
  }
  return data ? rowToUser(data) : null
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const { data, error } = await db()
    .from('pv_users')
    .select('*')
    .eq('id', id)
    .maybeSingle<UserRow>()
  if (error) {
    fail('findUserById', error)
    return null
  }
  return data ? rowToUser(data) : null
}

export async function createUser(input: {
  email: string
  name: string
  passwordHash: string
}): Promise<StoredUser> {
  const { data, error } = await db()
    .from('pv_users')
    .insert({
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      password_hash: input.passwordHash,
    })
    .select('*')
    .single<UserRow>()
  if (error || !data) {
    fail('createUser', error)
    throw error ?? new Error('createUser failed')
  }
  return rowToUser(data)
}

// ----------------------------------------------------------------- sessions

export async function createSession(userId: string, days = 30): Promise<StoredSession> {
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await db()
    .from('pv_sessions')
    .insert({ user_id: userId, expires_at: expiresAt })
    .select('id, user_id, expires_at')
    .single<{ id: string; user_id: string; expires_at: string }>()
  if (error || !data) {
    fail('createSession', error)
    throw error ?? new Error('createSession failed')
  }
  return { id: data.id, userId: data.user_id, expiresAt: data.expires_at }
}

export async function findSession(id: string | undefined): Promise<StoredSession | null> {
  if (!id) return null
  const { data, error } = await db()
    .from('pv_sessions')
    .select('id, user_id, expires_at')
    .eq('id', id)
    .maybeSingle<{ id: string; user_id: string; expires_at: string }>()
  if (error) {
    fail('findSession', error)
    return null
  }
  if (!data) return null
  if (new Date(data.expires_at).getTime() <= Date.now()) return null
  return { id: data.id, userId: data.user_id, expiresAt: data.expires_at }
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await db().from('pv_sessions').delete().eq('id', id)
  if (error) fail('deleteSession', error)
}

// ---------------------------------------------------------------- locations

export async function findLocationByUser(
  userId: string,
): Promise<LocationWithOwner | null> {
  const { data, error } = await db()
    .from('pv_locations')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<LocationRow>()
  if (error) {
    fail('findLocationByUser', error)
    return null
  }
  return data ? toLocation(data) : null
}

export async function findLocationById(id: string): Promise<LocationWithOwner | null> {
  const { data, error } = await db()
    .from('pv_locations')
    .select('*')
    .eq('id', id)
    .maybeSingle<LocationRow>()
  if (error) {
    fail('findLocationById', error)
    return null
  }
  return data ? toLocation(data) : null
}

export async function listLocations(): Promise<LocationWithOwner[]> {
  const { data, error } = await db().from('pv_locations').select('*')
  if (error) {
    fail('listLocations', error)
    return []
  }
  return (data ?? []).map((row) => toLocation(row as LocationRow))
}

export async function upsertLocation(
  userId: string,
  patch: Partial<Omit<Location, 'id'>>,
): Promise<LocationWithOwner> {
  const existing = await findLocationByUser(userId)

  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.address !== undefined) row.address = patch.address
  if (patch.postalCode !== undefined) row.postal_code = patch.postalCode
  if (patch.city !== undefined) row.city = patch.city
  if (patch.cuisine !== undefined) row.cuisine = patch.cuisine
  if (patch.phone !== undefined) row.phone = patch.phone
  if (patch.menu !== undefined) row.menu = patch.menu
  if (patch.hours !== undefined) row.hours = patch.hours
  if (patch.delivery !== undefined) row.delivery = patch.delivery
  if (patch.status !== undefined) row.status = patch.status
  if (patch.twilioNumber !== undefined) row.twilio_number = patch.twilioNumber
  if (patch.onboardingStep !== undefined) row.onboarding_step = patch.onboardingStep

  if (existing) {
    const { data, error } = await db()
      .from('pv_locations')
      .update(row)
      .eq('id', existing.id)
      .select('*')
      .single<LocationRow>()
    if (error || !data) {
      fail('upsertLocation.update', error)
      throw error ?? new Error('upsertLocation failed')
    }
    return toLocation(data)
  }

  const { data, error } = await db()
    .from('pv_locations')
    .insert({
      user_id: userId,
      name: '',
      address: '',
      postal_code: '',
      city: '',
      cuisine: 'Italienne',
      phone: '',
      menu: [],
      hours: defaultHours(),
      delivery: defaultDelivery(),
      status: 'draft',
      test_number: TEST_NUMBER,
      twilio_number: '',
      onboarding_step: 1,
      ...row,
    })
    .select('*')
    .single<LocationRow>()
  if (error || !data) {
    fail('upsertLocation.insert', error)
    throw error ?? new Error('upsertLocation failed')
  }
  return toLocation(data)
}

export async function setMenu(userId: string, menu: MenuItem[]) {
  return upsertLocation(userId, { menu })
}

export async function updateMenuItem(
  userId: string,
  itemId: string,
  patch: Partial<MenuItem>,
) {
  const location = await findLocationByUser(userId)
  if (!location) return null
  const menu = location.menu.map((item) =>
    item.id === itemId ? { ...item, ...patch, id: item.id } : item,
  )
  return upsertLocation(userId, { menu })
}

export async function removeMenuItem(userId: string, itemId: string) {
  const location = await findLocationByUser(userId)
  if (!location) return null
  return upsertLocation(userId, {
    menu: location.menu.filter((item) => item.id !== itemId),
  })
}

export async function activateLocation(userId: string) {
  return upsertLocation(userId, { status: 'active', onboardingStep: 5 })
}

// ------------------------------------------------------------------- orders

export async function listOrders(userId: string): Promise<Order[]> {
  const location = await findLocationByUser(userId)
  if (!location) return []
  const { data, error } = await db()
    .from('pv_orders')
    .select('*')
    .eq('location_id', location.id)
    .order('created_at', { ascending: false })
  if (error) {
    fail('listOrders', error)
    return []
  }
  return (data ?? []).map((row) => toOrder(row as OrderRow))
}

export async function listOrdersForLocation(locationId: string): Promise<Order[]> {
  const { data, error } = await db()
    .from('pv_orders')
    .select('*')
    .eq('location_id', locationId)
    .order('created_at', { ascending: false })
  if (error) {
    fail('listOrdersForLocation', error)
    return []
  }
  return (data ?? []).map((row) => toOrder(row as OrderRow))
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const { data, error } = await db()
    .from('pv_orders')
    .select('*')
    .eq('token', token)
    .maybeSingle<OrderRow>()
  if (error) {
    fail('getOrderByToken', error)
    return null
  }
  return data ? toOrder(data) : null
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await db()
    .from('pv_orders')
    .select('*')
    .eq('id', id)
    .maybeSingle<OrderRow>()
  if (error) {
    fail('getOrderById', error)
    return null
  }
  return data ? toOrder(data) : null
}

export async function createOrder(input: {
  locationId: string
  customerName?: string
  phone: string
  address: string
  mode: OrderMode
  lines: OrderLine[]
  deliveryFeeCents?: number
}): Promise<Order> {
  const subtotalCents = input.lines.reduce(
    (sum, line) => sum + line.priceCents * line.quantity,
    0,
  )
  const deliveryFeeCents = input.mode === 'delivery' ? (input.deliveryFeeCents ?? 0) : 0

  const { data, error } = await db()
    .from('pv_orders')
    .insert({
      location_id: input.locationId,
      reference: `PV-${Date.now().toString().slice(-5)}`,
      token: randomUUID().replace(/-/g, ''),
      customer_name: input.customerName ?? '',
      phone: input.phone,
      address: input.address,
      mode: input.mode,
      lines: input.lines,
      subtotal_cents: subtotalCents,
      delivery_fee_cents: deliveryFeeCents,
      total_cents: subtotalCents + deliveryFeeCents,
      status: 'new',
    })
    .select('*')
    .single<OrderRow>()
  if (error || !data) {
    fail('createOrder', error)
    throw error ?? new Error('createOrder failed')
  }
  return toOrder(data)
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const { data, error } = await db()
    .from('pv_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select('*')
    .maybeSingle<OrderRow>()
  if (error) {
    fail('updateOrderStatus', error)
    return null
  }
  return data ? toOrder(data) : null
}

// ------------------------------------------------------------------ drivers

export async function createDriver(input: {
  locationId: string
  name: string
  phone: string
}): Promise<Driver> {
  const { data, error } = await db()
    .from('pv_drivers')
    .insert({
      location_id: input.locationId,
      name: input.name.trim(),
      phone: input.phone.trim(),
      token: randomUUID().replace(/-/g, ''),
      active: true,
    })
    .select('*')
    .single<DriverRow>()
  if (error || !data) {
    fail('createDriver', error)
    throw error ?? new Error('createDriver failed')
  }
  return toDriver(data)
}

export async function listDrivers(locationId: string): Promise<Driver[]> {
  const { data, error } = await db()
    .from('pv_drivers')
    .select('*')
    .eq('location_id', locationId)
  if (error) {
    fail('listDrivers', error)
    return []
  }
  return (data ?? []).map((row) => toDriver(row as DriverRow))
}

export async function findDriverByToken(token: string): Promise<Driver | null> {
  const { data, error } = await db()
    .from('pv_drivers')
    .select('*')
    .eq('token', token)
    .maybeSingle<DriverRow>()
  if (error) {
    fail('findDriverByToken', error)
    return null
  }
  return data ? toDriver(data) : null
}

export async function setDriverActive(driverId: string, active: boolean) {
  const { data, error } = await db()
    .from('pv_drivers')
    .update({ active })
    .eq('id', driverId)
    .select('*')
    .maybeSingle<DriverRow>()
  if (error) {
    fail('setDriverActive', error)
    return null
  }
  return data ? toDriver(data) : null
}

export async function driverOrders(driver: Driver) {
  const orders = await listOrdersForLocation(driver.locationId)
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

export async function takeOrder(driverToken: string, orderId: string) {
  const driver = await findDriverByToken(driverToken)
  if (!driver || !driver.active) return null

  const order = await getOrderById(orderId)
  if (!order) return null
  if (order.locationId !== driver.locationId) return null
  if (order.status !== 'ready') return null

  const { data, error } = await db()
    .from('pv_orders')
    .update({
      status: 'delivering',
      driver_id: driver.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('status', 'ready')
    .select('*')
    .maybeSingle<OrderRow>()
  if (error) {
    fail('takeOrder', error)
    return null
  }
  return data ? toOrder(data) : null
}

export async function completeOrder(driverToken: string, orderId: string) {
  const driver = await findDriverByToken(driverToken)
  if (!driver) return null

  const order = await getOrderById(orderId)
  if (!order) return null
  if (order.driverId !== driver.id) return null
  if (order.status !== 'delivering') return null

  const { data, error } = await db()
    .from('pv_orders')
    .update({ status: 'delivered', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('driver_id', driver.id)
    .eq('status', 'delivering')
    .select('*')
    .maybeSingle<OrderRow>()
  if (error) {
    fail('completeOrder', error)
    return null
  }
  return data ? toOrder(data) : null
}
