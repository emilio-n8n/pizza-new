export type MenuItem = {
  id: string
  category: string
  name: string
  description: string
  priceCents: number
  available: boolean
}

export type DayHours = {
  day: number
  closed: boolean
  open: string
  close: string
}

export type DeliverySettings = {
  enabled: boolean
  feeCents: number
  minOrderCents: number
  radiusKm: number
  postalCodes: string
}

export type LocationStatus = 'draft' | 'active'

export type Location = {
  id: string
  name: string
  address: string
  postalCode: string
  city: string
  cuisine: string
  phone: string
  menu: MenuItem[]
  hours: DayHours[]
  delivery: DeliverySettings
  status: LocationStatus
  testNumber: string
  twilioNumber: string
  onboardingStep: number
  createdAt: string
}

export type PublicUser = {
  id: string
  email: string
  name: string
}

export type SessionPayload = {
  user: PublicUser
  location: Location | null
}

export type OrderLine = {
  name: string
  quantity: number
  priceCents: number
}

export type OrderStatus =
  | 'new'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled'

export type OrderMode = 'delivery' | 'pickup' | 'dine-in'

export type Order = {
  id: string
  locationId: string
  reference: string
  token: string
  customerName: string
  phone: string
  address: string
  mode: OrderMode
  lines: OrderLine[]
  subtotalCents: number
  deliveryFeeCents: number
  totalCents: number
  status: OrderStatus
  driverId: string | null
  createdAt: string
  updatedAt: string
}

export type Driver = {
  id: string
  locationId: string
  name: string
  phone: string
  token: string
  active: boolean
  createdAt: string
}

export type ContactPayload = {
  name?: string
  email?: string
  phone?: string
  locations?: string
  message?: string
}
