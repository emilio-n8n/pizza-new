import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { BrandMark } from '#/components/brand'
import type { Order } from '#/lib/types'
import {
  completeDeliveryFn,
  getDriverViewFn,
  takeDeliveryFn,
} from '#/server/api'

export const Route = createFileRoute('/livreur/$token')({
  head: () => ({
    meta: [
      { title: 'Livraisons, PizzaVoice' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  loader: async ({ params }) => getDriverViewFn({ data: { token: params.token } }),
  component: DriverPage,
})

function euro(cents: number) {
  return `${new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)} €`
}

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

function OrderCard({
  order,
  driverToken,
  action,
  pending,
  onTaken,
}: {
  order: Order
  driverToken: string
  action: 'take' | 'complete'
  pending: boolean
  onTaken?: () => void
}) {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function run() {
    setBusy(true)
    const result =
      action === 'take'
        ? await takeDeliveryFn({
            data: { token: driverToken, orderId: order.id },
          })
        : await completeDeliveryFn({
            data: { token: driverToken, orderId: order.id },
          })
    setBusy(false)
    if (result.ok) {
      if (action === 'take') onTaken?.()
      await router.invalidate()
    }
  }

  return (
    <article className="driver-card">
      <div className="driver-card-head">
        <div>
          <span className="mono">{order.reference}</span>
          <b>{order.mode === 'delivery' ? 'Livraison' : 'Retrait'}</b>
        </div>
        <span className={`badge ${order.status === 'delivering' ? 'badge-delivering' : 'badge-ready'}`}>
          {order.status === 'delivering' ? 'En cours' : 'Disponible'}
        </span>
      </div>

      <a className="driver-address" href={mapsUrl(order.address)} target="_blank" rel="noreferrer">
        <span className="mono">Adresse</span>
        <strong>{order.address || 'Adresse à confirmer'}</strong>
      </a>

      <div className="driver-meta">
        <a href={`tel:${order.phone}`} className="btn-link">
          {order.phone}
        </a>
        <span className="mono">{euro(order.totalCents)} à encaisser</span>
      </div>

      <ul className="driver-lines">
        {order.lines.map((line, index) => (
          <li key={`${line.name}-${index}`}>
            <span>
              {line.quantity} × {line.name}
            </span>
            <span className="mono">{euro(line.priceCents * line.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="driver-actions">
        <a className="btn btn-secondary btn-sm" href={mapsUrl(order.address)} target="_blank" rel="noreferrer">
          Ouvrir l'itinéraire
        </a>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => void run()}
          disabled={busy || pending}
        >
          {busy ? '…' : action === 'take' ? 'Prendre la course' : 'Marquer livrée'}
        </button>
      </div>
    </article>
  )
}

function DriverPage() {
  const data = Route.useLoaderData()
  const { token } = Route.useParams()
  const [tab, setTab] = useState<'available' | 'active'>('available')
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      void router.invalidate()
    }, 12000)
    return () => clearInterval(timer)
  }, [router])

  if (!data) {
    return (
      <div className="public-page">
        <div className="public-top">
          <Link className="brand" to="/">
            <BrandMark className="brand-mark" />
            <span className="brand-word">PizzaVoice</span>
          </Link>
        </div>
        <div className="public-card">
          <p className="eyebrow">Livreur</p>
          <h1 className="h2">Lien invalide ou désactivé.</h1>
          <p className="lede" style={{ marginTop: 12 }}>
            Demandez un nouveau lien à la pizzeria.
          </p>
        </div>
      </div>
    )
  }

  const orders = tab === 'available' ? data.available : data.active

  return (
    <div className="public-page driver-page">
      <div className="public-top">
        <Link className="brand" to="/">
          <BrandMark className="brand-mark" />
          <span className="brand-word">PizzaVoice</span>
        </Link>
        <span className="badge badge-success">
          <span className="dot" aria-hidden="true" /> En ligne
        </span>
      </div>

      <div className="driver-header">
        <p className="eyebrow" style={{ marginBottom: 6 }}>
          {data.location?.name ?? 'Livraisons'}
        </p>
        <h1 className="h2">Bonjour {data.driver.name}.</h1>
        <p className="lede" style={{ marginTop: 8 }}>
          {data.available.length} course{data.available.length > 1 ? 's' : ''} disponible
          {data.available.length > 1 ? 's' : ''} · {data.active.length} en cours
        </p>
      </div>

      <div className="tabs" role="tablist" aria-label="Courses">
        <button
          className={`tab${tab === 'available' ? ' active' : ''}`}
          type="button"
          role="tab"
          aria-selected={tab === 'available'}
          onClick={() => setTab('available')}
        >
          Disponibles <span className="count">{data.available.length}</span>
        </button>
        <button
          className={`tab${tab === 'active' ? ' active' : ''}`}
          type="button"
          role="tab"
          aria-selected={tab === 'active'}
          onClick={() => setTab('active')}
        >
          En cours <span className="count">{data.active.length}</span>
        </button>
      </div>

      <div className="driver-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>{tab === 'available' ? 'Aucune course disponible.' : 'Aucune course en cours.'}</h3>
            <p>La page se met à jour automatiquement.</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              driverToken={token}
              action={tab === 'available' ? 'take' : 'complete'}
              pending={false}
              onTaken={() => setTab('active')}
            />
          ))
        )}
      </div>
    </div>
  )
}
