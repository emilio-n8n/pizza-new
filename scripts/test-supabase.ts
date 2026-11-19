import { randomUUID } from 'node:crypto'

import {
  activateLocation,
  completeOrder,
  createDriver,
  createOrder,
  createSession,
  createUser,
  deleteSession,
  driverOrders,
  findLocationByUser,
  findSession,
  findUserByEmail,
  listDrivers,
  listOrders,
  takeOrder,
  updateOrderStatus,
  upsertLocation,
} from '#/server/store.server'

function check(label: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? 'OK  ' : 'ÉCHEC'} ${label}`, ok ? '' : JSON.stringify(detail))
  if (!ok) process.exitCode = 1
}

const email = `supatest-${Date.now()}@example.com`

const user = await createUser({ email, name: 'Test Supabase', passwordHash: 'salt:hash' })
check('createUser', !!user.id && user.email === email)

const found = await findUserByEmail(email)
check('findUserByEmail', found?.id === user.id)

const session = await createSession(user.id)
const reloaded = await findSession(session.id)
check('createSession + findSession', reloaded?.userId === user.id)

const location = await upsertLocation(user.id, {
  name: 'La Casa Test',
  address: '14 rue de Charonne',
  postalCode: '75011',
  city: 'Paris',
  cuisine: 'Italienne',
  phone: '01 43 55 12 34',
  menu: [
    { id: randomUUID(), name: 'Margherita', priceCents: 1100, category: 'Pizzas' },
    { id: randomUUID(), name: 'Regina', priceCents: 1350, category: 'Pizzas' },
  ],
  delivery: { feeCents: 300, minimumCents: 1500, radiusKm: 5, postalCodes: ['75011'] },
  onboardingStep: 4,
})
check('upsertLocation (insert)', location.name === 'La Casa Test' && location.menu.length === 2)
check('hours par défaut', location.hours.length === 7)

const patched = await upsertLocation(user.id, { city: 'Montreuil' })
check('upsertLocation (update)', patched.city === 'Montreuil' && patched.id === location.id)

const activated = await activateLocation(user.id)
check('activateLocation', activated.status === 'active')

const order = await createOrder({
  locationId: location.id,
  customerName: 'Karim',
  phone: '06 12 34 56 78',
  address: '20 rue Oberkampf',
  mode: 'delivery',
  lines: [
    { itemId: location.menu[0].id, name: 'Margherita', priceCents: 1100, quantity: 2 },
  ],
  deliveryFeeCents: 300,
})
check('createOrder', order.totalCents === 2500 && order.status === 'new')

const listed = await listOrders(user.id)
check('listOrders', listed.length === 1 && listed[0].id === order.id)

const ready = await updateOrderStatus(order.id, 'ready')
check('updateOrderStatus', ready?.status === 'ready')

const driver = await createDriver({
  locationId: location.id,
  name: 'Sam',
  phone: '06 99 88 77 66',
})
check('createDriver', driver.active === true)

const drivers = await listDrivers(location.id)
check('listDrivers', drivers.length === 1)

const view = await driverOrders(driver)
check('driverOrders.available', view.available.length === 1)

const taken = await takeOrder(driver.token, order.id)
check('takeOrder', taken?.status === 'delivering' && taken?.driverId === driver.id)

const done = await completeOrder(driver.token, order.id)
check('completeOrder', done?.status === 'delivered')

await deleteSession(session.id)
check('deleteSession', (await findSession(session.id)) === null)

console.log('\nutilisateur de test :', email)
