import { PhotoPrint } from './photo-print'

export function Problem() {
  return (
    <section className="section" id="problem">
      <div className="container problem-grid">
        <PhotoPrint
          src="/images/dough-hands.webp"
          alt="Mains farinées d'un pizzaiolo qui étirent la pâte sur un plan de travail en marbre."
          ratio="3-4"
          caption="Service · 19:42"
          note="Le service, pas le standard."
        />
        <div>
          <p className="eyebrow">Le vrai problème</p>
          <h2 className="h2">Le téléphone sonne pendant le service.</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Un appel manqué, c'est une commande perdue. Un appel pris les mains dans la
            pâte, c'est une adresse oubliée, un prix approximatif, un client qui attend.
          </p>
          <ul className="problem-list">
            <li className="problem-item">
              <span className="num">01</span>
              <div>
                <h3>Vous décrochez les mains pleines.</h3>
                <p>Le pizzaiolo s'arrête, le four attend, la file s'allonge.</p>
              </div>
            </li>
            <li className="problem-item">
              <span className="num">02</span>
              <div>
                <h3>Le client rappelle. Ou il commande ailleurs.</h3>
                <p>
                  Un standard saturé transforme un service correct en perte de chiffre.
                </p>
              </div>
            </li>
            <li className="problem-item">
              <span className="num">03</span>
              <div>
                <h3>La commande finit sur un bout de papier.</h3>
                <p>
                  Adresse incomplète, total recalculé, ticket perdu entre la caisse et le
                  four.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export function ProductLedger() {
  return (
    <section className="section section-tint" id="product">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Le produit</p>
            <h2 className="display">Un appel. Cinq états. Zéro ressaisie.</h2>
          </div>
          <p className="lede">
            Chaque étape laisse une trace. Le client, la cuisine et le livreur voient la
            même commande, au même moment.
          </p>
        </div>

        <div className="ledger">
          <article className="ledger-row">
            <div className="ledger-num">01</div>
            <div className="ledger-copy">
              <h3>L'appel</h3>
              <p>
                L'agent répond en français ou en anglais, charge le menu de l'établissement
                et pose les questions utiles. Il ne propose jamais un plat absent de la
                carte.
              </p>
              <ul className="micro-list">
                <li>Menu et prix à jour</li>
                <li>Horaires et zones de livraison</li>
                <li>Transfert vers un humain si besoin</li>
              </ul>
            </div>
            <div className="ledger-art">
              <div className="mini-card">
                <div className="mini-card-head">
                  <span className="live">Appel en cours</span>
                  <span className="mono">19:42</span>
                </div>
                <div className="transcript">
                  <p>
                    <span className="who">Client</span>Vous avez des pizzas sans porc ?
                  </p>
                  <p>
                    <span className="who">Agent</span>Oui, la Regina peut être préparée sans
                    jambon. Je vous la propose avec de la mozzarella et des champignons.
                  </p>
                  <p>
                    <span className="who">Client</span>Parfait, une Regina et une
                    Margherita.
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="ledger-row">
            <div className="ledger-num">02</div>
            <div className="ledger-copy">
              <h3>La commande</h3>
              <p>
                Les articles, les quantités, les options, l'adresse et le téléphone sont
                structurés au fil de l'appel. Le total est calculé avec les frais de
                livraison de l'établissement.
              </p>
              <ul className="micro-list">
                <li>Prix en centimes, jamais recalculés à la main</li>
                <li>Adresse et téléphone vérifiés</li>
                <li>Ticket prêt à imprimer</li>
              </ul>
            </div>
            <div className="ledger-art">
              <div className="compact-ticket">
                <div className="ticket-meta">
                  <span>Commande #PV-1042</span>
                  <span>19:43</span>
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
                  <span>Livraison Paris 11e</span>
                  <span className="num">2,50 €</span>
                </div>
                <div className="ticket-total">
                  <span>Total</span>
                  <span className="num">30,00 €</span>
                </div>
                <div className="ticket-footer">
                  <span className="stamp stamp-primary">À confirmer</span>
                  <span className="mono">CB à la livraison</span>
                </div>
              </div>
            </div>
          </article>

          <article className="ledger-row">
            <div className="ledger-num">03</div>
            <div className="ledger-copy">
              <h3>La cuisine</h3>
              <p>
                Le ticket arrive dans la colonne « nouvelle ». Un clic le passe en
                préparation, puis en prête. Chaque changement est horodaté et visible par
                le client.
              </p>
              <ul className="micro-list">
                <li>Écran cuisine lisible à distance</li>
                <li>Impression 80 mm</li>
                <li>Alerte sonore à l'arrivée d'une commande</li>
              </ul>
            </div>
            <div className="ledger-art">
              <div className="kds">
                <div className="kds-ticket">
                  <div className="kds-head">
                    <span>#PV-1042</span>
                    <span>19:43</span>
                  </div>
                  <h4>
                    2 Margherita
                    <br />1 Diabolo
                  </h4>
                  <p>Livraison · Oberkampf</p>
                  <div className="kds-foot">Nouvelle</div>
                </div>
                <div className="kds-ticket">
                  <div className="kds-head">
                    <span>#PV-1041</span>
                    <span>19:38</span>
                  </div>
                  <h4>
                    1 Regina
                    <br />1 Tiramisu
                  </h4>
                  <p>Retrait · Comptoir</p>
                  <div className="kds-foot">En préparation</div>
                </div>
                <div className="kds-ticket">
                  <div className="kds-head">
                    <span>#PV-1040</span>
                    <span>19:31</span>
                  </div>
                  <h4>3 Quatre fromages</h4>
                  <p>Livraison · République</p>
                  <div className="kds-foot">Prête</div>
                </div>
              </div>
            </div>
          </article>

          <article className="ledger-row">
            <div className="ledger-num">04</div>
            <div className="ledger-copy">
              <h3>Le livreur</h3>
              <p>
                Le livreur reçoit un lien, voit l'adresse, le téléphone et le total. Il
                prend la course, ouvre le GPS et marque la livraison. Pas de capture
                d'écran.
              </p>
              <ul className="micro-list">
                <li>Lien signé, révocable</li>
                <li>Adresse et contact au même endroit</li>
                <li>Statut mis à jour pour le client</li>
              </ul>
            </div>
            <div className="ledger-art">
              <div className="phone-mini">
                <div className="phone-top">
                  <span>Livreur</span>
                  <span>20:04</span>
                </div>
                <h4>Course disponible</h4>
                <p className="addr">24 rue Oberkampf, 75011 Paris</p>
                <div className="phone-row">
                  <span className="mono">30,00 €</span>
                  <span className="badge badge-delivering">2,1 km</span>
                </div>
                <div className="phone-row">
                  <span className="mono">06 12 34 56 78</span>
                  <span className="btn btn-primary btn-sm" style={{ minHeight: 32, paddingInline: 10 }}>
                    Prendre
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article className="ledger-row">
            <div className="ledger-num">05</div>
            <div className="ledger-copy">
              <h3>Le pilotage</h3>
              <p>
                Le gérant voit les commandes du jour, le chiffre d'affaires, les appels
                traités et les appels manqués. Les chiffres s'agrègent par établissement et
                par chaîne.
              </p>
              <ul className="micro-list">
                <li>Vue temps réel</li>
                <li>Filtre par établissement</li>
                <li>Export CSV</li>
              </ul>
            </div>
            <div className="ledger-art">
              <div className="dash-strip">
                <div className="strip-stats">
                  <div className="strip-stat">
                    <span>Commandes</span>
                    <b>24</b>
                  </div>
                  <div className="strip-stat">
                    <span>CA du jour</span>
                    <b>612 €</b>
                  </div>
                  <div className="strip-stat">
                    <span>Appels manqués</span>
                    <b>0</b>
                  </div>
                </div>
                <div className="strip-row">
                  <span>#PV-1042 · 2 Margherita, 1 Diabolo</span>
                  <span className="badge badge-new">Nouvelle</span>
                </div>
                <div className="strip-row">
                  <span>#PV-1041 · 1 Regina, 1 Tiramisu</span>
                  <span className="badge badge-preparing">En préparation</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export function OvenBand() {
  return (
    <section className="band" aria-label="La commande arrive en cuisine">
      <div className="container band-stage">
        <div className="band-photo">
          <img src="/images/oven.webp" alt="Pizzaïolo enfournant une pizza dans un four à bois." loading="lazy" />
        </div>
        <div className="band-note">
          <p className="eyebrow">En cuisine · 19:48</p>
          <p className="band-title">La commande arrive quand le client raccroche.</p>
          <p className="band-text">
            Pas de carnet, pas de photo floue, pas de rappel. Le ticket est lisible,
            imprimable et déjà horodaté.
          </p>
          <span className="stamp stamp-primary" style={{ marginTop: 18 }}>
            Reçue
          </span>
        </div>
        <span className="band-tag">Four à bois · Paris 11e</span>
      </div>
    </section>
  )
}
