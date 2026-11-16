import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import {
  DAY_LABELS,
  defaultDelivery,
  defaultHours,
  formatPriceInput,
  operatorCodes,
  parsePriceInput,
} from '#/lib/defaults'
import type { DayHours, DeliverySettings } from '#/lib/types'
import {
  createDriverFn,
  listDriversFn,
  saveEstablishmentFn,
  saveServiceFn,
  saveTelephonyFn,
  toggleDriverFn,
} from '#/server/api'

export const Route = createFileRoute('/_authenticated/app/reglages')({
  head: () => ({ meta: [{ title: 'Réglages, PizzaVoice' }] }),
  loader: async () => listDriversFn(),
  component: Settings,
})

function Settings() {
  const { session } = Route.useRouteContext()
  const drivers = Route.useLoaderData()
  const router = useRouter()
  const location = session.location
  const [hours, setHours] = useState<DayHours[]>(
    location?.hours?.length ? location.hours : defaultHours(),
  )
  const [delivery, setDelivery] = useState<DeliverySettings>(
    location?.delivery ?? defaultDelivery(),
  )
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [twilioNumber, setTwilioNumber] = useState(location?.twilioNumber ?? '')
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')

  const testNumber = location?.testNumber ?? '01 89 71 33 56'
  const displayNumber = twilioNumber.trim() || testNumber
  const codes = operatorCodes(displayNumber)

  async function saveInfo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(null)
    setError(null)
    const form = new FormData(event.currentTarget)

    const result = await saveEstablishmentFn({
      data: {
        name: String(form.get('name') ?? ''),
        address: String(form.get('address') ?? ''),
        postalCode: String(form.get('postalCode') ?? ''),
        city: String(form.get('city') ?? ''),
        cuisine: String(form.get('cuisine') ?? ''),
        phone: String(form.get('phone') ?? ''),
      },
    })

    setPending(false)
    if (!result.ok) setError(result.error)
    else setMessage('Informations enregistrées.')
  }

  async function addDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage(null)
    setError(null)
    const result = await createDriverFn({
      data: { name: driverName, phone: driverPhone },
    })
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setDriverName('')
    setDriverPhone('')
    setMessage('Livreur ajouté. Copiez son lien et envoyez-le-lui.')
    await router.invalidate()
  }

  async function toggleDriver(id: string, active: boolean) {
    const result = await toggleDriverFn({ data: { id, active } })
    if (result.ok) await router.invalidate()
  }

  async function copyDriverLink(token: string) {
    const link = `${window.location.origin}/livreur/${token}`
    await navigator.clipboard.writeText(link)
    setCopied(`driver-${token}`)
    window.setTimeout(() => setCopied(null), 2500)
  }

  async function saveTelephony() {
    setPending(true)
    setMessage(null)
    setError(null)
    const result = await saveTelephonyFn({ data: { twilioNumber } })
    setPending(false)
    if (!result.ok) setError(result.error)
    else setMessage('Numéro Twilio enregistré. Le runtime répond sur ce numéro.')
  }

  async function saveService() {
    setPending(true)
    setMessage(null)
    setError(null)
    const result = await saveServiceFn({ data: { hours, delivery } })
    setPending(false)
    if (!result.ok) setError(result.error)
    else setMessage('Service enregistré. L\'agent applique ces horaires au prochain appel.')
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Réglages</h2>
          <p>Les informations que l'agent utilise pour répondre et calculer.</p>
        </div>
      </div>

      {message ? (
        <p className="small-note" role="status" style={{ color: 'var(--secondary)', marginBottom: 12 }}>
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="wizard-error" role="alert" style={{ marginBottom: 12 }}>
          {error}
        </p>
      ) : null}

      <section className="panel">
        <h2>Établissement</h2>
        <p>Nom, adresse et téléphone donnés au client et au livreur.</p>
        <form className="wizard-form" onSubmit={saveInfo}>
          <div className="wizard-grid">
            <div className="field">
              <label htmlFor="settings-name">Nom</label>
              <input id="settings-name" name="name" defaultValue={location?.name ?? ''} required />
            </div>
            <div className="field">
              <label htmlFor="settings-phone">Téléphone</label>
              <input id="settings-phone" name="phone" type="tel" defaultValue={location?.phone ?? ''} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="settings-address">Adresse</label>
            <input id="settings-address" name="address" defaultValue={location?.address ?? ''} required />
          </div>
          <div className="wizard-grid">
            <div className="field">
              <label htmlFor="settings-postal">Code postal</label>
              <input id="settings-postal" name="postalCode" defaultValue={location?.postalCode ?? ''} />
            </div>
            <div className="field">
              <label htmlFor="settings-city">Ville</label>
              <input id="settings-city" name="city" defaultValue={location?.city ?? ''} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="settings-cuisine">Type de cuisine</label>
            <select id="settings-cuisine" name="cuisine" defaultValue={location?.cuisine ?? 'Napolitaine'}>
              <option>Napolitaine</option>
              <option>Italienne classique</option>
              <option>Américaine</option>
              <option>Autre</option>
            </select>
          </div>
          <div className="form-foot">
            <button className="btn btn-primary" type="submit" disabled={pending}>
              Enregistrer
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Horaires</h2>
        <p>L'agent ne prend pas de commande quand l'établissement est fermé.</p>
        <div className="hours-list">
          {hours.map((day, index) => (
            <div className="hours-row" key={day.day}>
              <span>{DAY_LABELS[day.day]}</span>
              <label className="hours-closed">
                <input
                  type="checkbox"
                  checked={day.closed}
                  onChange={(event) =>
                    setHours((current) =>
                      current.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, closed: event.target.checked } : row,
                      ),
                    )
                  }
                />
                Fermé
              </label>
              <input
                type="time"
                value={day.open}
                disabled={day.closed}
                aria-label={`Ouverture ${DAY_LABELS[day.day]}`}
                onChange={(event) =>
                  setHours((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, open: event.target.value } : row,
                    ),
                  )
                }
              />
              <input
                type="time"
                value={day.close}
                disabled={day.closed}
                aria-label={`Fermeture ${DAY_LABELS[day.day]}`}
                onChange={(event) =>
                  setHours((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, close: event.target.value } : row,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Livraison</h2>
        <p>Frais, minimum et zone. L'agent refuse une adresse hors zone.</p>
        <label className="hours-closed" style={{ marginTop: 12 }}>
          <input
            type="checkbox"
            checked={delivery.enabled}
            onChange={(event) => setDelivery({ ...delivery, enabled: event.target.checked })}
          />
          Livraison active
        </label>
        {delivery.enabled ? (
          <div className="wizard-grid" style={{ marginTop: 12 }}>
            <div className="field">
              <label htmlFor="settings-fee">Frais de livraison (€)</label>
              <input
                id="settings-fee"
                value={formatPriceInput(delivery.feeCents)}
                onChange={(event) =>
                  setDelivery({ ...delivery, feeCents: parsePriceInput(event.target.value) })
                }
                inputMode="decimal"
              />
            </div>
            <div className="field">
              <label htmlFor="settings-minimum">Commande minimum (€)</label>
              <input
                id="settings-minimum"
                value={formatPriceInput(delivery.minOrderCents)}
                onChange={(event) =>
                  setDelivery({ ...delivery, minOrderCents: parsePriceInput(event.target.value) })
                }
                inputMode="decimal"
              />
            </div>
            <div className="field">
              <label htmlFor="settings-radius">Rayon (km)</label>
              <input
                id="settings-radius"
                type="number"
                min={0}
                value={delivery.radiusKm}
                onChange={(event) =>
                  setDelivery({ ...delivery, radiusKm: Number(event.target.value) })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="settings-postal-codes">Codes postaux acceptés</label>
              <input
                id="settings-postal-codes"
                value={delivery.postalCodes}
                placeholder="75011, 75012"
                onChange={(event) =>
                  setDelivery({ ...delivery, postalCodes: event.target.value })
                }
              />
            </div>
          </div>
        ) : null}
        <div className="form-foot" style={{ marginTop: 16 }}>
          <button className="btn btn-primary" type="button" onClick={saveService} disabled={pending}>
            Enregistrer le service
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Téléphone</h2>
        <p>
          Le numéro Twilio reçoit le renvoi de la ligne de la pizzeria. Le numéro public reste
          celui de la pizzeria.
        </p>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="settings-twilio">Numéro Twilio</label>
          <input
            id="settings-twilio"
            value={twilioNumber}
            onChange={(event) => setTwilioNumber(event.target.value)}
            placeholder="+33 1 23 45 67 89"
            inputMode="tel"
          />
        </div>
        <div className="form-foot" style={{ marginTop: 10 }}>
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={saveTelephony}
            disabled={pending}
          >
            Enregistrer le numéro
          </button>
        </div>
        <div className="activation-number">
          <b>{displayNumber}</b>
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(displayNumber.replace(/\s+/g, ''))
              setCopied('number')
            }}
          >
            {copied === 'number' ? 'Copié' : 'Copier'}
          </button>
        </div>
        <div className="operator-list">
          {codes.map((operator) => (
            <div className="operator-row" key={operator.name}>
              <span>{operator.name}</span>
              <code>{operator.code}</code>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(operator.code)
                  setCopied(operator.code)
                }}
              >
                {copied === operator.code ? 'Copié' : 'Copier'}
              </button>
            </div>
          ))}
        </div>
        <p className="small-note" style={{ marginTop: 12 }}>
          Pour annuler le transfert, composez <span className="mono">##21#</span> depuis la
          même ligne.
        </p>
      </section>

      <section className="panel">
        <h2>Livreurs</h2>
        <p>
          Chaque livreur reçoit un lien personnel : courses disponibles, adresse, téléphone,
          montant à encaisser et itinéraire Google Maps. Le lien se révoque en désactivant
          le livreur.
        </p>

        <form className="wizard-form" onSubmit={addDriver}>
          <div className="wizard-grid">
            <div className="field">
              <label htmlFor="driver-name">Prénom</label>
              <input
                id="driver-name"
                value={driverName}
                onChange={(event) => setDriverName(event.target.value)}
                placeholder="Karim"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="driver-phone">Téléphone</label>
              <input
                id="driver-phone"
                value={driverPhone}
                onChange={(event) => setDriverPhone(event.target.value)}
                placeholder="06 12 34 56 78"
                inputMode="tel"
              />
            </div>
          </div>
          <div className="form-foot">
            <button className="btn btn-primary" type="submit" disabled={pending}>
              Ajouter le livreur
            </button>
          </div>
        </form>

        <div className="driver-manage">
          {drivers.length === 0 ? (
            <p className="small-note">Aucun livreur. Ajoutez le premier ci-dessus.</p>
          ) : (
            drivers.map((driver) => (
              <div className="driver-manage-row" key={driver.id}>
                <div>
                  <b>{driver.name}</b>
                  <span>{driver.phone || 'Téléphone non renseigné'}</span>
                </div>
                <span className={`badge ${driver.active ? 'badge-success' : 'badge-outline'}`}>
                  {driver.active ? 'Actif' : 'Désactivé'}
                </span>
                <div className="driver-manage-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() => void copyDriverLink(driver.token)}
                  >
                    {copied === `driver-${driver.token}` ? 'Lien copié' : 'Copier le lien'}
                  </button>
                  <Link
                    className="btn btn-ghost btn-sm"
                    to="/livreur/$token"
                    params={{ token: driver.token }}
                    target="_blank"
                  >
                    Ouvrir
                  </Link>
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => void toggleDriver(driver.id, !driver.active)}
                  >
                    {driver.active ? 'Désactiver' : 'Réactiver'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Compte</h2>
        <p>
          {session.user.name} · {session.user.email}
        </p>
        <p className="small-note">
          L'abonnement et les factures arrivent ici avec Stripe. Essai en cours, aucune carte
          enregistrée.
        </p>
      </section>
    </>
  )
}
