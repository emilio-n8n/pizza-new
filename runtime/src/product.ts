import { config } from './config'

export type ProductOrderResult = {
  reference: string
  token: string
  trackingUrl: string
  totalCents: number
}

export async function getLocation(): Promise<{
  name: string
  address: string
  postalCode: string
  city: string
  cuisine: string
  phone: string
  hours: Array<{ day: number; closed: boolean; open: string; close: string }>
  delivery: {
    enabled: boolean
    feeCents: number
    minOrderCents: number
    radiusKm: number
    postalCodes: string
  }
} | null> {
  if (!config.agentApiKey) return null
  try {
    const response = await fetch(`${config.productApiUrl}/api/agent/location`, {
      headers: { 'x-agent-key': config.agentApiKey },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return null
    const payload = (await response.json()) as { ok: boolean; location?: any }
    return payload.location ?? null
  } catch (error) {
    console.error('[location] échec', error)
    return null
  }
}

export async function getMenu(): Promise<
  Array<{ name: string; category: string; description: string; priceCents: number; priceEuros: string }>
> {
  if (!config.agentApiKey) return []
  try {
    const response = await fetch(`${config.productApiUrl}/api/agent/menu`, {
      headers: { 'x-agent-key': config.agentApiKey },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return []
    const payload = (await response.json()) as { ok: boolean; menu?: any[] }
    return payload.menu ?? []
  } catch (error) {
    console.error('[menu] échec', error)
    return []
  }
}

export async function getDrivers(): Promise<Array<{ name: string; active: boolean }>> {
  if (!config.agentApiKey) return []
  try {
    const response = await fetch(`${config.productApiUrl}/api/agent/drivers`, {
      headers: { 'x-agent-key': config.agentApiKey },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return []
    const payload = (await response.json()) as { ok: boolean; drivers?: any[] }
    return payload.drivers ?? []
  } catch (error) {
    console.error('[drivers] échec', error)
    return []
  }
}
export async function createProductOrder(input: {
  tenant: string
  locationId?: string
  phone: string
  address: string
  mode: 'delivery' | 'pickup' | 'dine-in'
  items: Array<{ name: string; quantity: number }>
}): Promise<ProductOrderResult | null> {
  if (!config.agentApiKey) {
    console.warn('[order] AGENT_API_KEY absent, commande non transmise')
    return null
  }

  try {
    const response = await fetch(`${config.productApiUrl}/api/agent/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-key': config.agentApiKey,
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.error('[order] produit', response.status, await response.text())
      return null
    }

    const payload = (await response.json()) as {
      ok: boolean
      order?: ProductOrderResult
    }

    return payload.order ?? null
  } catch (error) {
    console.error('[order] échec', error)
    return null
  }
}
