import { Link, createFileRoute } from '@tanstack/react-router'

import { getDashboardFn } from '#/server/api'

export const Route = createFileRoute('/_authenticated/app/')({
  head: () => ({ meta: [{ title: "Vue d'ensemble, PizzaVoice" }] }),
  loader: async () => getDashboardFn(),
  component: Dashboard,
})

function Dashboard() {
  const data = Route.useLoaderData()
  const { session } = Route.useRouteContext()
  const location = data?.location ?? session.location
  const orders = data?.orders ?? []
  const today = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  const firstName = session.user.name.split(' ')[0]
  const revenue = orders.reduce((sum, order) => sum + order.totalCents, 0)

  const steps = [
    { label: 'Compte créé', detail: session.user.email, done: true },
    {
      label: 'Établissement renseigné',
      detail: location?.address || 'Adresse manquante',
      done: Boolean(location?.name && location?.address),
    },
    {
      label: 'Carte importée',
      detail: `${location?.menu.length ?? 0} produit${(location?.menu.length ?? 0) > 1 ? 's' : ''}`,
      done: (location?.menu.length ?? 0) > 0,
    },
    {
      label: 'Horaires et livraison',
      detail: location?.delivery.enabled ? 'Livraison active' : 'À emporter seulement',
      done: Boolean(location?.hours.length),
    },
    {
      label: 'Téléphone connecté',
      detail: location?.status === 'active' ? 'Transfert expliqué' : 'À faire',
      done: location?.status === 'active',
    },
  ]
  const doneCount = steps.filter((step) => step.done).length

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Bonjour {firstName}.</h2>
          <p style={{ textTransform: 'capitalize' }}>{today}</p>
        </div>
        <div className="page-actions">
          <Link className="btn btn-secondary btn-sm" to="/app/menu">
            Modifier le menu
          </Link>
          <Link className="btn btn-primary btn-sm" to="/app/reglages">
            Réglages de l'agent
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <span className="label">Commandes du jour</span>
          <div className="value">{orders.length}</div>
          <span className="delta">depuis minuit</span>
        </div>
        <div className="stat">
          <span className="label">Chiffre d'affaires</span>
          <div className="value">{new Intl.NumberFormat('fr-FR').format(revenue / 100)} €</div>
          <span className="delta">commandes encaissées</span>
        </div>
        <div className="stat">
          <span className="label">Appels traités</span>
          <div className="value">0</div>
          <span className="delta">en attente du transfert</span>
        </div>
        <div className="stat">
          <span className="label">Produits au menu</span>
          <div className="value">{location?.menu.length ?? 0}</div>
          <span className="delta">{location?.menu.filter((item) => item.available).length ?? 0} disponibles</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel" aria-labelledby="recent-orders">
          <div className="app-section-head">
            <div>
              <h2 id="recent-orders">Dernières commandes</h2>
              <p>Les appels arrivent ici dès que le transfert est actif.</p>
            </div>
            <Link className="btn btn-ghost btn-sm" to="/app/commandes">
              Tout voir
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <h3>Aucune commande pour l'instant.</h3>
              <p>Le standard est prêt. Testez l'agent avec le numéro de test.</p>
              <Link className="btn btn-secondary btn-sm" to="/app/reglages">
                Voir le numéro de test
              </Link>
            </div>
          ) : (
            <table className="order-table">
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Commande</th>
                  <th>Total</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td className="mono">
                      {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="items">
                      {order.lines.map((line) => `${line.quantity} ${line.name}`).join(', ')}
                      <span>{order.address}</span>
                    </td>
                    <td className="total">{new Intl.NumberFormat('fr-FR').format(order.totalCents / 100)} €</td>
                    <td>
                      <span className="badge badge-new">Nouvelle</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <div>
          <section className="panel" aria-labelledby="setup-title">
            <div className="app-section-head">
              <div>
                <h2 id="setup-title">Mise en route</h2>
                <p>
                  {doneCount} sur {steps.length} étapes terminées
                </p>
              </div>
              <span className="mono">{Math.round((doneCount / steps.length) * 100)} %</span>
            </div>
            <ul className="checklist">
              {steps.map((step) => (
                <li key={step.label} data-done={step.done}>
                  <span className="check">{step.done ? '✓' : ''}</span>
                  <span>
                    <b>{step.label}</b>
                    <small>{step.detail}</small>
                  </span>
                  {!step.done ? (
                    <Link className="btn btn-ghost btn-sm" to="/onboarding">
                      Reprendre
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel" aria-labelledby="agent-title">
            <div className="app-section-head" style={{ marginBottom: 6 }}>
              <div>
                <h2 id="agent-title">Votre agent</h2>
                <p>{location?.twilioNumber ? 'Numéro Twilio' : 'Numéro de test'}</p>
              </div>
              <span className={`badge ${location?.status === 'active' ? 'badge-success' : 'badge-outline'}`}>
                {location?.status === 'active' ? 'Actif' : 'Brouillon'}
              </span>
            </div>
            <p className="mono" style={{ fontSize: 18, letterSpacing: '0.04em' }}>
              {location?.twilioNumber || location?.testNumber || '01 89 71 33 56'}
            </p>
            <p className="small-note" style={{ marginTop: 8 }}>
              Appelez ce numéro pour simuler une commande, ou testez directement depuis le
              navigateur.
            </p>
            <Link className="btn btn-secondary btn-sm" to="/app/telephone" style={{ marginTop: 12 }}>
              Tester dans le navigateur
            </Link>
          </section>
        </div>
      </div>
    </>
  )
}
