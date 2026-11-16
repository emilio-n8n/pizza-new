import { Link } from '@tanstack/react-router'

import { Brand } from './brand'

const links = [
  { label: 'Produit', to: '/' as const, hash: 'product' },
  { label: 'Chaînes', to: '/' as const, hash: 'chains' },
  { label: 'Tarifs', to: '/tarifs' as const },
  { label: 'FAQ', to: '/' as const, hash: 'faq' },
]

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Brand />

        <nav className="nav-links" aria-label="Navigation principale">
          {links.map((link) => (
            <Link key={link.label} to={link.to} hash={'hash' in link ? link.hash : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="btn btn-primary btn-sm" to="/signup">
            Créer mon compte
          </Link>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Ouvrir le menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </summary>
          <div className="mobile-menu-panel">
            <Link to="/" hash="product">
              Produit
            </Link>
            <Link to="/" hash="chains">
              Chaînes
            </Link>
            <Link to="/tarifs">Tarifs</Link>
            <Link to="/" hash="faq">
              FAQ
            </Link>
            <Link className="btn btn-primary btn-sm" to="/signup" style={{ marginTop: 4 }}>
              Créer mon compte
            </Link>
          </div>
        </details>
      </div>
    </header>
  )
}
