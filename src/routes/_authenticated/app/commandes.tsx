import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import type { Order, OrderStatus } from '#/lib/types'
import { getDashboardFn, updateOrderStatusFn } from '#/server/api'

export const Route = createFileRoute('/_authenticated/app/commandes')({
  head: () => ({ meta: [{ title: 'Commandes, PizzaVoice' }] }),
  loader: async () => getDashboardFn(),
  component: OrdersPage,
})

const LABELS: Record<OrderStatus, string> = {
  new: 'Nouvelle',
  preparing: 'En préparation',
  ready: 'Prête',
  delivering: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const BADGES: Record<OrderStatus, string> = {
  new: 'badge-new',
  preparing: 'badge-preparing',
  ready: 'badge-ready',
  delivering: 'badge-delivering',
  delivered: 'badge-delivered',
  cancelled: 'badge-outline',
}

const FILTERS: Array<{ key: OrderStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Toutes' },
  { key: 'new', label: 'Nouvelles' },
  { key: 'preparing', label: 'En cuisine' },
  { key: 'ready', label: 'Prêtes' },
  { key: 'delivering', label: 'En livraison' },
  { key: 'delivered', label: 'Livrées' },
]

function euro(cents: number) {
  return `${new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)} €`
}

function nextAction(order: Order) {
  if (order.status === 'new') {
    return { label: 'Accepter', status: 'preparing' as const }
  }
  if (order.status === 'preparing') {
    return { label: 'Prête', status: 'ready' as const }
  }
  if (order.status === 'ready' && order.mode !== 'delivery') {
    return { label: 'Terminée', status: 'delivered' as const }
  }
  if (order.status === 'delivering') {
    return { label: 'Livrée', status: 'delivered' as const }
  }
  return null
}

function OrdersPage() {
  const data = Route.useLoaderData()
  const orders = data?.orders ?? []
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [busy, setBusy] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      void router.invalidate()
    }, 10000)
    return () => clearInterval(timer)
  }, [router])

  const visible =
    filter === 'all' ? orders : orders.filter((order) => order.status === filter)

  async function move(order: Order, status: 'preparing' | 'ready' | 'delivered') {
    setBusy(order.id)
    const result = await updateOrderStatusFn({
      data: { orderId: order.id, status },
    })
    setBusy(null)
    if (result.ok) await router.invalidate()
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Commandes</h2>
          <p>Chaque appel transformé en commande, avec son ticket et son lien de suivi.</p>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Filtrer les commandes">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            className={`tab${filter === item.key ? ' active' : ''}`}
            type="button"
            role="tab"
            aria-selected={filter === item.key}
            onClick={() => setFilter(item.key)}
          >
            {item.label}{' '}
            <span className="count">
              {item.key === 'all'
                ? orders.length
                : orders.filter((order) => order.status === item.key).length}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <h3>Aucune commande dans ce filtre.</h3>
          <p>Le standard est prêt. Les commandes arrivent ici dès le premier appel.</p>
          <Link className="btn btn-secondary btn-sm" to="/app/reglages">
            Voir le numéro de test
          </Link>
        </div>
      ) : (
        <table className="order-table" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Heure</th>
              <th>Commande</th>
              <th>Articles / adresse</th>
              <th>Total</th>
              <th>Statut</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => {
              const action = nextAction(order)
              return (
                <tr key={order.id}>
                  <td className="mono">
                    {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <span className="id">{order.reference}</span>
                    <br />
                    <span className="mono" style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>
                      {order.mode === 'delivery'
                        ? 'Livraison'
                        : order.mode === 'dine-in'
                          ? 'Sur place'
                          : 'À emporter'}
                    </span>
                  </td>
                  <td className="items">
                    {order.lines.map((line) => `${line.quantity} ${line.name}`).join(', ')}
                    <span>
                      {order.address
                        ? `${order.address} · ${order.phone}`
                        : order.phone}
                    </span>
                  </td>
                  <td className="total">{euro(order.totalCents)}</td>
                  <td>
                    <span className={`badge ${BADGES[order.status]}`}>
                      {LABELS[order.status]}
                    </span>
                  </td>
                  <td className="action">
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Link
                        className="btn btn-ghost btn-sm"
                        to="/suivi/$token"
                        params={{ token: order.token }}
                        target="_blank"
                      >
                        Suivi
                      </Link>
                      {action ? (
                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          disabled={busy === order.id}
                          onClick={() => void move(order, action.status)}
                        >
                          {busy === order.id ? '…' : action.label}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </>
  )
}
