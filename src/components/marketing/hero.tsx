import { Link } from '@tanstack/react-router'

export function Hero() {
  return (
    <>
      <section className="hero" id="top">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Standard téléphonique pour pizzerias</p>
            <h1 className="display">
              Chaque appel
              <br />
              devient une <span className="accent-word">commande</span>.
            </h1>
            <p className="lede">
              PizzaVoice répond pendant le service, prend la commande, l'envoie en
              cuisine et tient le livreur informé. En français et en anglais.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/" hash="product">
                Voir l'agent en action
              </Link>
              <Link className="btn-link" to="/tarifs">
                Voir le tarif <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="hero-note">
              Indépendants et petites chaînes · 14 jours d'essai · Mise en route en ligne
            </p>
          </div>

          <div className="hero-art">
            <div className="ticket" aria-label="Exemple de ticket de commande généré après un appel">
              <div className="ticket-top">
                <div className="ticket-meta">
                  <span>Appel entrant</span>
                  <span>19:42 · 38 s</span>
                </div>
                <div className="ticket-caller">
                  <div>
                    <span className="ticket-label">Numéro</span>
                    <span className="mono">06 12 34 56 78</span>
                  </div>
                  <div>
                    <span className="ticket-label">Adresse</span>
                    <span>Paris 11e</span>
                  </div>
                </div>
              </div>
              <div className="ticket-transcript">
                <p>
                  <span className="who">Client</span>Bonsoir, je voudrais deux margheritas et
                  un diabolo.
                </p>
                <p>
                  <span className="who">Agent</span>C'est noté. Vous êtes au 24 rue Oberkampf ?
                </p>
                <p>
                  <span className="who">Client</span>Oui, c'est ça. Vous pouvez livrer vers
                  20 h 15 ?
                </p>
                <p>
                  <span className="who">Agent</span>Parfait, je valide la commande.
                </p>
              </div>
              <div className="ticket-sep" />
              <div className="ticket-body">
                <div className="ticket-meta">
                  <span>Commande #PV-1042</span>
                  <span>2 articles</span>
                </div>
                <div className="ticket-line">
                  <span>
                    <b>2</b> Margherita
                  </span>
                  <span className="num">24,00 €</span>
                </div>
                <div className="ticket-line">
                  <span>
                    <b>1</b> Diabolo fraise
                  </span>
                  <span className="num">3,50 €</span>
                </div>
                <div className="ticket-line muted">
                  <span>Livraison</span>
                  <span className="num">2,50 €</span>
                </div>
                <div className="ticket-total">
                  <span>Total</span>
                  <span className="num">30,00 €</span>
                </div>
                <div className="ticket-footer">
                  <span className="stamp stamp-primary">Envoyée en cuisine</span>
                  <span className="mono">Paiement à la livraison</span>
                </div>
              </div>
              <div className="ticket-stub">
                <span>#PV-1042</span>
                <span>À détacher</span>
              </div>
            </div>
            <div className="ticket-caption">
              <span className="live">Appel en cours</span>
              <span>Ticket généré sans ressaisie</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flow-strip">
        <div className="container flow-row" aria-label="Le flux d'une commande">
          <span>
            <i className="dot" aria-hidden="true" />
            Appel traité
          </span>
          <span>Commande structurée</span>
          <span>Ticket cuisine</span>
          <span>Lien de suivi envoyé</span>
        </div>
      </div>
    </>
  )
}
