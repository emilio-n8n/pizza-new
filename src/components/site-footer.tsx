import { Link } from '@tanstack/react-router'

import { Brand } from './brand'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>
              Le standard téléphonique qui transforme les appels en commandes, pour les
              pizzerias indépendantes et les petites chaînes.
            </p>
          </div>
          <div className="footer-col">
            <h4>Produit</h4>
            <Link to="/" hash="product">
              Fonctionnement
            </Link>
            <Link to="/" hash="chains">
              Chaînes
            </Link>
            <Link to="/tarifs">Tarifs</Link>
            <Link to="/" hash="faq">
              FAQ
            </Link>
          </div>
          <div className="footer-col">
            <h4>Ressources</h4>
            <Link to="/" hash="install">
              Installation
            </Link>
            <Link to="/">Aperçu produit</Link>
            <Link to="/legal" hash="privacy">
              Confidentialité
            </Link>
            <a href="/contact">Nous contacter</a>
          </div>
          <div className="footer-col">
            <h4>Légal</h4>
            <Link to="/legal">Mentions légales</Link>
            <Link to="/legal" hash="privacy">
              Confidentialité
            </Link>
            <Link to="/legal" hash="terms">
              CGU
            </Link>
            <Link to="/legal" hash="cookies">
              Cookies
            </Link>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <Link to="/signup">Créer un compte</Link>
            <a href="/contact">Support</a>
            <Link to="/tarifs">Tarifs</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} PizzaVoice. Tous droits réservés.</span>
          <span className="footer-lang">FR</span>
        </div>
      </div>
    </footer>
  )
}
