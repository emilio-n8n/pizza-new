import { Link, Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'

import { BrandMark } from '#/components/brand'

export const Route = createFileRoute('/_authenticated/app')({
  head: () => ({ meta: [{ title: 'Commandes, PizzaVoice' }] }),
  component: AppLayout,
})

const NAV = [
  { to: '/app' as const, label: "Vue d'ensemble", exact: true },
  { to: '/app/commandes' as const, label: 'Commandes' },
  { to: '/app/menu' as const, label: 'Menu' },
  { to: '/app/telephone' as const, label: 'Téléphone' },
  { to: '/app/reglages' as const, label: 'Réglages' },
]

function AppLayout() {
  const { session } = Route.useRouteContext()
  const navigate = useNavigate()
  const location = session.location

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    await navigate({ to: '/' })
  }

  return (
    <div className="app-live">
      <nav className="app-mobile-nav" aria-label="Navigation de l'application">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={item.exact ? { exact: true } : undefined}
            activeProps={{ 'data-active': 'true' }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="app-shell">
        <aside className="app-sidebar" aria-label="Navigation de l'application">
          <div className="app-brand">
            <BrandMark className="brand-mark" />
            <span>PizzaVoice</span>
          </div>

          <div className="org-switch">
            <span className="org-name">{location?.name || 'Mon établissement'}</span>
            <span className="org-meta">
              {location?.city || 'Adresse à compléter'} ·{' '}
              {location?.status === 'active' ? 'Agent actif' : 'Brouillon'}
            </span>
          </div>

          <nav className="app-nav">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="nav-item"
                activeOptions={item.exact ? { exact: true } : undefined}
                activeProps={{ className: 'nav-item active' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="app-user">
            <span className="avatar">
              {session.user.name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </span>
            <div>
              <b>{session.user.name}</b>
              <span>{session.user.email}</span>
              <button className="app-signout" type="button" onClick={signOut}>
                Se déconnecter
              </button>
            </div>
          </div>
        </aside>

        <div className="app-main">
          <header className="app-topbar">
            <div className="breadcrumb">
              <span>{location?.name || 'PizzaVoice'}</span>
              <span>/</span>
              <b>{location?.city || 'Mise en route'}</b>
            </div>
            <div className="topbar-actions">
              <span className={`status-live${location?.status === 'active' ? '' : ' status-draft'}`}>
                <span className="dot" aria-hidden="true" />
                {location?.status === 'active' ? 'Standard actif' : 'Brouillon'}
              </span>
              <Link className="btn btn-secondary btn-sm" to="/">
                Voir le site
              </Link>
              <span className="avatar">
                {session.user.name
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
          </header>

          <div className="app-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
