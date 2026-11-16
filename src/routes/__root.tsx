import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from '@tanstack/react-router'

import { SiteFooter } from '#/components/site-footer'
import { SiteHeader } from '#/components/site-header'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#F7F1E6' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const isApp =
    pathname.startsWith('/app') || pathname === '/onboarding' || pathname === '/studio'
const isPublicFollow =
    pathname.startsWith('/suivi/') || pathname.startsWith('/livreur/')
  const isAuth = pathname === '/login' || pathname === '/signup'
  const bare = isApp || isAuth || isPublicFollow

  if (bare) {
    return (
      <main id="main">
        <Outlet />
      </main>
    )
  }

  return (
    <>
      <a className="skip" href="#main">
        Aller au contenu
      </a>
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}

function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Page introuvable</p>
        <h1 className="h1">Cette page n'existe pas.</h1>
        <p className="lede" style={{ marginTop: 16 }}>
          Le lien est peut-être ancien. Revenez à l'accueil ou regardez les tarifs.
        </p>
        <div className="hero-actions" style={{ marginTop: 24 }}>
          <a className="btn btn-primary" href="/">
            Retour à l'accueil
          </a>
          <a className="btn btn-secondary" href="/tarifs">
            Voir les tarifs
          </a>
        </div>
      </div>
    </section>
  )
}
