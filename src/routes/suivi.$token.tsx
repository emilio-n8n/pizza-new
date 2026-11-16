import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { BrandMark } from '#/components/brand'
import { getTrackingFn } from '#/server/api'

export const Route = createFileRoute('/suivi/$token')({
  head: () => ({
    meta: [
      { title: 'Suivi de commande, PizzaVoice' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  loader: async ({ params }) => getTrackingFn({ data: { token: params.token } }),
  component: Tracking,
})

const STEPS = [
  { key: 'new', label: 'Confirmée', detail: 'Commande reçue' },
  { key: 'preparing', label: 'En cuisine', detail: 'Les pizzas sont au four' },
  { key: 'ready', label: 'Prête', detail: 'En attente du livreur' },
  { key: 'delivering', label: 'En route', detail: 'Le livreur est parti' },
  { key: 'delivered', label: 'Livrée', detail: 'Bon appétit' },
] as const

const TITLES: Record<string, { title: string; text: string }> = {
  new: { title: 'Commande reçue.', text: 'La pizzeria a bien reçu votre commande.' },
  preparing: { title: 'En cuisine.', text: 'Vos pizzas sont en préparation.' },
  ready: { title: 'Prête.', text: 'Votre commande attend le livreur.' },
  delivering: { title: 'En route.', text: 'Le livreur arrive.' },
  delivered: { title: 'Livrée.', text: 'Bon appétit.' },
  cancelled: { title: 'Annulée.', text: 'Cette commande a été annulée.' },
}

function euro(cents: number) {
  return `${new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)} €`
}

function Tracking() {
  const data = Route.useLoaderData()
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      void router.invalidate()
    }, 10000)
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
          <p className="eyebrow">Suivi</p>
          <h1 className="h2">Cette commande est introuvable.</h1>
          <p className="lede" style={{ marginTop: 12 }}>
            Le lien est peut-être incomplet. Contactez directement la pizzeria.
          </p>
        </div>
      </div>
    )
  }

  const { order, location } = data
  const visual =
    order.status === 'ready' && order.mode !== 'delivery'
      ? 'ready'
      : order.status
  const stepIndex = STEPS.findIndex((step) => step.key === visual)
  const info = TITLES[order.status] ?? TITLES.new
  const timeline =
    order.mode === 'delivery'
      ? STEPS
      : STEPS.filter((step) => step.key !== 'delivering')

  return (
    <div className="public-page">
      <div className="public-top">
        <Link className="brand" to="/">
          <BrandMark className="brand-mark" />
          <span className="brand-word">PizzaVoice</span>
        </Link>
        <span className="mono" style={{ color: 'var(--muted-foreground)' }}>
          {order.reference}
        </span>
      </div>

      <div className="public-card">
        <div className="tracking-head">
          <p className="eyebrow" style={{ marginBottom: 8 }}>
            {location?.name ?? 'Votre pizzeria'} · Suivi en direct
          </p>
          <h1 className="display" style={{ fontSize: 'clamp(38px, 5vw, 56px)' }}>
            {info.title}
          </h1>
          <p className="lede" style={{ fontSize: 16, marginTop: 10 }}>
            {info.text}
          </p>
          <span
            className={`badge ${
              order.status === 'delivered'
                ? 'badge-delivered'
                : order.status === 'delivering'
                  ? 'badge-delivering'
                  : order.status === 'ready'
                    ? 'badge-ready'
                    : order.status === 'preparing'
                      ? 'badge-preparing'
                      : 'badge-new'
            }`}
            style={{ marginTop: 14 }}
          >
            {timeline.find((step) => step.key === visual)?.label ?? 'Confirmée'}
          </span>
        </div>

        <div className="tracking-timeline">
          {timeline.map((step, index) => {
            const sourceIndex = STEPS.findIndex((item) => item.key === step.key)
            const done = sourceIndex < stepIndex || order.status === 'delivered'
            const active = sourceIndex === stepIndex && order.status !== 'delivered'
            return (
              <div
                key={step.key}
                className={`tracking-step${done ? ' is-done' : ''}${active ? ' is-active' : ''}`}
              >
                <span className="tracking-dot">{done ? '✓' : index + 1}</span>
                <div>
                  <b>{step.label}</b>
                  <span>{step.detail}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="tracking-lines">
          {order.lines.map((line, index) => (
            <div className="tracking-line" key={`${line.name}-${index}`}>
              <span>
                {line.quantity} × {line.name}
              </span>
              <span className="mono">{euro(line.priceCents * line.quantity)}</span>
            </div>
          ))}
          {order.deliveryFeeCents > 0 ? (
            <div className="tracking-line is-muted">
              <span>Livraison</span>
              <span className="mono">{euro(order.deliveryFeeCents)}</span>
            </div>
          ) : null}
          <div className="tracking-total">
            <span>Total</span>
            <span className="mono">{euro(order.totalCents)}</span>
          </div>
        </div>

        <div className="tracking-info">
          <div>
            <span className="mono">Mode</span>
            <p>
              {order.mode === 'delivery'
                ? `Livraison · ${order.address}`
                : order.mode === 'dine-in'
                  ? 'Sur place'
                  : 'À emporter'}
            </p>
          </div>
          <div>
            <span className="mono">Pizzeria</span>
            <p>
              {location?.address}
              {location?.city ? `, ${location.city}` : ''}
            </p>
            {location?.phone ? (
              <a href={`tel:${location.phone}`} className="btn-link" style={{ marginTop: 6 }}>
                Appeler la pizzeria
              </a>
            ) : null}
          </div>
        </div>

        <p className="small-note" style={{ marginTop: 20 }}>
          Cette page se met à jour toute seule. Gardez ce lien pour suivre la commande.
        </p>
      </div>
    </div>
  )
}
