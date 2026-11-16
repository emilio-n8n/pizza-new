import { Link } from '@tanstack/react-router'
import { useId, useState } from 'react'

import {
  MAX_LOCATIONS,
  MIN_LOCATIONS,
  TRIAL_DAYS,
  activeBracket,
  clampLocations,
  formatEuros,
  formatLocations,
  monthlyTotal,
  pricingBrackets,
  unitPrice,
} from '#/data/pricing'

import { PhotoPrint } from './photo-print'

export function PricingCard() {
  const inputId = useId()
  const [locations, setLocations] = useState(1)

  const unit = unitPrice(locations)
  const total = monthlyTotal(locations)
  const bracket = activeBracket(locations)

  function update(next: number) {
    setLocations(clampLocations(next))
  }

  return (
    <div className="price-card">
      <div className="price-head">
        <span className="badge badge-outline">Abonnement mensuel</span>
        <span className="mono">Sans commission</span>
      </div>

      <p className="price" aria-live="polite">
        {formatEuros(total)}
      </p>
      <p className="price-sub">
        {formatLocations(locations)}, appels illimités. {formatEuros(unit)} par adresse et
        par mois. Tarif HT.
      </p>

      <div className="fleet">
        <label htmlFor={inputId}>Votre parc</label>
        <div className="fleet-control">
          <button
            type="button"
            className="fleet-step"
            onClick={() => update(locations - 1)}
            aria-label="Retirer un établissement"
            disabled={locations <= MIN_LOCATIONS}
          >
            −
          </button>
          <input
            id={inputId}
            type="number"
            min={MIN_LOCATIONS}
            max={MAX_LOCATIONS}
            value={locations}
            inputMode="numeric"
            onChange={(event) => update(Number(event.target.value))}
            aria-describedby={`${inputId}-rate`}
          />
          <button
            type="button"
            className="fleet-step"
            onClick={() => update(locations + 1)}
            aria-label="Ajouter un établissement"
            disabled={locations >= MAX_LOCATIONS}
          >
            +
          </button>
        </div>
        <span className="mono" id={`${inputId}-rate`}>
          {formatEuros(unit)} / établissement
        </span>
      </div>

      <table className="rate-table">
        <caption className="sr-only">
          Tarif mensuel par établissement selon la taille du parc
        </caption>
        <thead>
          <tr>
            <th scope="col">Établissements</th>
            <th scope="col">Par mois, par adresse</th>
          </tr>
        </thead>
        <tbody>
          {pricingBrackets.map((item) => (
            <tr key={item.label} data-active={item.label === bracket.label}>
              <th scope="row">{item.label}</th>
              <td>{formatEuros(item.unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="price-list">
        <li>Appels illimités, en français et en anglais</li>
        <li>Menu, horaires et zones de livraison par établissement</li>
        <li>Écran cuisine, ticket 80 mm, suivi client</li>
        <li>Gestion des livreurs et de l'équipe</li>
        <li>Statistiques par établissement et par chaîne</li>
        <li>Support par email et téléphone</li>
      </ul>

      <Link className="btn btn-primary btn-block" to="/signup">
        Créer mon établissement
      </Link>
      <p className="price-foot">
        {TRIAL_DAYS} jours d'essai, sans carte. Puis prélèvement mensuel automatique,
        facture dans le compte.
      </p>
    </div>
  )
}

export function PricingSection({
  withPhoto = true,
  withIntro = true,
}: {
  withPhoto?: boolean
  withIntro?: boolean
}) {
  if (!withIntro) {
    return (
      <section className="section section-tint" id="pricing">
        <div className="container pricing-solo">
          <PricingCard />
        </div>
      </section>
    )
  }

  return (
    <section className="section section-tint" id="pricing">
      <div className="container pricing-grid">
        <div>
          <p className="eyebrow">Tarifs</p>
          <h2 className="h2">Un forfait par établissement.</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Pas de commission sur les commandes, pas de frais par appel, pas de devis. Vous
            créez votre compte, vous importez votre carte, l'agent est prêt. Le tarif baisse
            à partir de deux établissements.
          </p>
          <p className="small-note" style={{ marginTop: 24 }}>
            Tarifs HT, facturés au mois. Essai de {TRIAL_DAYS} jours sans carte bancaire.
            Résiliation en ligne, sans préavis.
          </p>
          {withPhoto ? (
            <PhotoPrint
              src="/images/ingredients.webp"
              alt="Tomates San Marzano, basilic, mozzarella et farine sur du papier cuisson."
              ratio="1-1"
              caption="Ingrédients"
              note="San Marzano"
              style={{ maxWidth: 260, marginTop: 36 }}
            />
          ) : null}
        </div>
        <PricingCard />
      </div>
    </section>
  )
}
