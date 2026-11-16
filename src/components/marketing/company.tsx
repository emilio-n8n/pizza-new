import { PhotoPrint } from './photo-print'

export function Chains() {
  return (
    <section className="section" id="chains">
      <div className="container chains-grid">
        <div>
          <p className="eyebrow">Chaînes</p>
          <h2 className="h2">Plusieurs établissements, un seul standard.</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Chaque pizzeria garde son menu, ses horaires et ses règles de livraison. Vous
            pilotez la chaîne depuis une vue unique.
          </p>
          <ul className="feature-list">
            <li>
              <span className="mono">01</span>
              <div>
                <b>Vue chaîne et vue établissement.</b> Les chiffres s'agrègent, les
                opérations restent locales.
              </div>
            </li>
            <li>
              <span className="mono">02</span>
              <div>
                <b>Menus et horaires par adresse.</b> Une carte différente le midi, une
                autre le soir, sans dupliquer les réglages.
              </div>
            </li>
            <li>
              <span className="mono">03</span>
              <div>
                <b>Rôles et permissions.</b> Propriétaire, manager, équipe. Chacun voit ce
                qui le concerne.
              </div>
            </li>
            <li>
              <span className="mono">04</span>
              <div>
                <b>Statistiques agrégées.</b> Les commandes, les appels et le panier moyen
                par établissement.
              </div>
            </li>
          </ul>
        </div>
        <div className="location-panel" aria-label="Aperçu de la vue chaîne">
          <div className="panel-head">
            <span>Maison Luigi</span>
            <span className="badge badge-success">
              <span className="dot" aria-hidden="true" />3 actifs
            </span>
          </div>
          <div className="location-row">
            <div>
              <b>Chez Luigi</b>
              <span>Paris 11e</span>
            </div>
            <span className="mono">24 cmd</span>
            <span className="badge badge-success">Actif</span>
          </div>
          <div className="location-row">
            <div>
              <b>Luigi Bastille</b>
              <span>Paris 12e</span>
            </div>
            <span className="mono">18 cmd</span>
            <span className="badge badge-success">Actif</span>
          </div>
          <div className="location-row">
            <div>
              <b>Luigi Vincennes</b>
              <span>Vincennes</span>
            </div>
            <span className="mono">11 cmd</span>
            <span className="badge badge-preparing">Test</span>
          </div>
          <div className="panel-foot">
            <span>Total du jour</span>
            <span className="num">1 842,50 €</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Install() {
  return (
    <section className="section section-tint" id="install">
      <div className="container install-grid">
        <PhotoPrint
          src="/images/counter.webp"
          alt="Comptoir de pizzeria avec un téléphone, un carnet de commandes et des tomates."
          ratio="4-3"
          caption="Comptoir · 18:30"
          note="Avant le service"
          tilt="right"
        />
        <div>
          <p className="eyebrow">Installation</p>
          <h2 className="h2">Votre carte en ligne en dix minutes.</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Créez votre compte, collez votre carte, vérifiez les prix. L'agent ne répond
            qu'avec ce que vous avez validé, et vous branchez votre ligne vous-même.
          </p>
          <ol className="steps">
            <li>
              <span className="step-num">1</span>
              <div>
                <b>Ouvrez votre compte.</b>
                <p>Email, mot de passe, nom de la pizzeria. Sans carte bancaire.</p>
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div>
                <b>Collez votre carte.</b>
                <p>Une ligne par produit, ou ajoutez les lignes à la main.</p>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div>
                <b>Branchez le téléphone.</b>
                <p>Numéro de test, code de transfert, puis activation.</p>
              </div>
            </li>
          </ol>
          <p className="small-note" style={{ marginTop: 20 }}>
            Aucune ligne n'est publiée sans votre validation. Les prix restent les vôtres.
          </p>
        </div>
      </div>
    </section>
  )
}

export function Outcomes() {
  return (
    <section className="section" id="outcomes">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Ce que ça change</p>
            <h2 className="h2">Le service reste fluide.</h2>
          </div>
          <p className="lede">
            Pas de chiffres inventés. Voici ce que le produit change concrètement, dès le
            premier service.
          </p>
        </div>
        <div className="outcomes-grid">
          <div className="outcome">
            <span className="mono">01</span>
            <p>
              <b>Le téléphone est décroché même en plein service.</b> Le four continue, la
              file avance, personne ne s'arrête pour noter une commande.
            </p>
          </div>
          <div className="outcome">
            <span className="mono">02</span>
            <p>
              <b>Chaque commande arrive complète.</b> Articles, options, adresse, téléphone
              et total. Pas de rappel pour l'étage ou le code.
            </p>
          </div>
          <div className="outcome">
            <span className="mono">03</span>
            <p>
              <b>Le livreur sait où aller.</b> L'adresse et le contact sont sur la même
              carte, avec le montant à encaisser.
            </p>
          </div>
          <div className="outcome">
            <span className="mono">04</span>
            <p>
              <b>Vous savez ce qui se passe.</b> Appels traités, commandes créées, appels
              manqués. Les chiffres sont datés, pas décoratifs.
            </p>
          </div>
        </div>
        <p className="small-note outcomes-note">
          Les résultats des pizzerias pilotes seront publiés avec leur accord.
        </p>
      </div>
    </section>
  )
}
