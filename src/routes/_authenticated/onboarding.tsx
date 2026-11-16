import { Link, createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { Brand } from '#/components/brand'
import {
  DAY_LABELS,
  defaultDelivery,
  defaultHours,
  formatPriceInput,
  operatorCodes,
  parsePriceInput,
} from '#/lib/defaults'
import type { DayHours, DeliverySettings, MenuItem } from '#/lib/types'
import { parseMenuText } from '#/lib/menu'
import {
  activateFn,
  getSessionFn,
  saveEstablishmentFn,
  saveMenuFn,
  saveServiceFn,
} from '#/server/api'

export const Route = createFileRoute('/_authenticated/onboarding')({
  head: () => ({ meta: [{ title: 'Paramétrer ma pizzeria, PizzaVoice' }] }),
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (!session) throw redirect({ to: '/login' })
    if (session.location?.status === 'active') throw redirect({ to: '/app' })
    return { session }
  },
  component: Onboarding,
})

type DraftItem = {
  id: string
  category: string
  name: string
  description: string
  price: string
  available: boolean
}

const STEP_TITLES = ['Établissement', 'Menu', 'Service', 'Téléphone'] as const

function Onboarding() {
  const { session } = Route.useRouteContext()
  const location = session.location
  const navigate = useNavigate()
  const router = useRouter()

  const savedStep = Math.min(4, Math.max(1, location?.onboardingStep ?? 1))
  const [step, setStep] = useState(savedStep)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const [items, setItems] = useState<DraftItem[]>(() =>
    (location?.menu ?? []).map((item) => ({
      ...item,
      price: formatPriceInput(item.priceCents),
    })),
  )
  const [paste, setPaste] = useState('')
  const [hours, setHours] = useState<DayHours[]>(location?.hours?.length ? location.hours : defaultHours())
  const [delivery, setDelivery] = useState<DeliverySettings>(location?.delivery ?? defaultDelivery())
  const [copied, setCopied] = useState<string | null>(null)
  const [twilioNumber, setTwilioNumber] = useState(location?.twilioNumber ?? '')

  const testNumber = location?.testNumber ?? '01 89 71 33 56'
  const displayNumber = twilioNumber.trim() || testNumber
  const codes = operatorCodes(displayNumber)

  function fail(message: string) {
    setError(message)
    setPending(false)
  }

  async function saveEstablishment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
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

    if (!result.ok) return fail(result.error)
    setPending(false)
    setStep(2)
    window.scrollTo({ top: 0 })
  }

  async function saveMenu() {
    setPending(true)
    setError(null)

    if (items.length === 0) return fail('Ajoutez au moins un produit à la carte.')

    const menu: MenuItem[] = items.map((item) => ({
      id: item.id,
      category: item.category || 'Pizza',
      name: item.name,
      description: item.description,
      priceCents: parsePriceInput(item.price),
      available: item.available,
    }))

    if (menu.some((item) => item.name.trim().length < 2)) {
      return fail('Chaque ligne doit avoir un nom.')
    }

    const result = await saveMenuFn({ data: { items: menu } })
    if (!result.ok) return fail(result.error)
    setPending(false)
    setStep(3)
    window.scrollTo({ top: 0 })
  }

  async function saveService() {
    setPending(true)
    setError(null)

    const result = await saveServiceFn({ data: { hours, delivery } })
    if (!result.ok) return fail(result.error)
    setPending(false)
    setStep(4)
    window.scrollTo({ top: 0 })
  }

  async function activate() {
    setPending(true)
    setError(null)
    const result = await activateFn({ data: { twilioNumber } })
    if (!result.ok) return fail(result.error)
    await router.invalidate()
    await navigate({ to: '/app' })
  }

  function addRow() {
    setItems((current) => [
      ...current,
      {
        id: globalThis.crypto.randomUUID(),
        category: current.at(-1)?.category ?? 'Pizza',
        name: '',
        description: '',
        price: '',
        available: true,
      },
    ])
  }

  function importPaste() {
    const parsed = parseMenuText(paste)
    if (parsed.length === 0) {
      setError('Aucune ligne avec un prix n’a été trouvée. Format attendu : Margherita 12,50')
      return
    }
    setError(null)
    setItems((current) => [
      ...current,
      ...parsed.map((item) => ({ ...item, price: formatPriceInput(item.priceCents) })),
    ])
    setPaste('')
  }

  return (
    <div className="onboarding">
      <header className="onboarding-top">
        <div className="container">
          <Brand withTagline={false} />
          <span className="onboarding-progress">
            Étape {step} sur 4 · {STEP_TITLES[step - 1]}
          </span>
        </div>
      </header>

      <div className="container onboarding-body">
        <nav className="wizard-steps" aria-label="Étapes de la mise en route">
          {STEP_TITLES.map((title, index) => {
            const number = index + 1
            const state = number < step ? 'done' : number === step ? 'current' : 'todo'
            return (
              <button
                key={title}
                type="button"
                className="wizard-step"
                data-state={state}
                onClick={() => number <= step && setStep(number)}
                disabled={number > step}
              >
                <span className="step-dot">{state === 'done' ? '✓' : number}</span>
                <span>
                  <b>{title}</b>
                  <small>
                    {number === 1
                      ? 'Nom, adresse, téléphone'
                      : number === 2
                        ? 'Cartes et prix'
                        : number === 3
                          ? 'Horaires et livraison'
                          : 'Numéro et transfert'}
                  </small>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="wizard-card">
          {error ? (
            <p className="wizard-error" role="alert">
              {error}
            </p>
          ) : null}

          {step === 1 ? (
            <>
              <h1>Votre établissement.</h1>
              <p className="lede">
                Ces informations servent à l'agent pour répondre, calculer les frais et
                donner l'adresse au livreur.
              </p>
              <form className="wizard-form" onSubmit={saveEstablishment}>
                <div className="field">
                  <label htmlFor="name">Nom de la pizzeria</label>
                  <input
                    id="name"
                    name="name"
                    defaultValue={location?.name ?? ''}
                    placeholder="Chez Luigi"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="address">Adresse</label>
                  <input
                    id="address"
                    name="address"
                    defaultValue={location?.address ?? ''}
                    placeholder="24 rue Oberkampf"
                    required
                  />
                </div>
                <div className="wizard-grid">
                  <div className="field">
                    <label htmlFor="postalCode">Code postal</label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      defaultValue={location?.postalCode ?? ''}
                      placeholder="75011"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="city">Ville</label>
                    <input
                      id="city"
                      name="city"
                      defaultValue={location?.city ?? ''}
                      placeholder="Paris"
                    />
                  </div>
                </div>
                <div className="wizard-grid">
                  <div className="field">
                    <label htmlFor="cuisine">Type de cuisine</label>
                    <select
                      id="cuisine"
                      name="cuisine"
                      defaultValue={location?.cuisine ?? 'Napolitaine'}
                    >
                      <option>Napolitaine</option>
                      <option>Italienne classique</option>
                      <option>Américaine</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Téléphone de la pizzeria</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={location?.phone ?? ''}
                      placeholder="01 43 57 00 00"
                    />
                  </div>
                </div>
                <div className="wizard-actions">
                  <span className="wizard-hint">
                    Vous pourrez tout modifier plus tard depuis les réglages.
                  </span>
                  <button className="btn btn-primary" type="submit" disabled={pending}>
                    {pending ? 'Enregistrement…' : 'Continuer vers le menu'}
                  </button>
                </div>
              </form>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h1>Votre carte.</h1>
              <p className="lede">
                Collez votre carte ou ajoutez les produits à la main. L'agent ne proposera
                que ce qui figure ici, avec vos prix.
              </p>

              <div className="menu-import">
                <label htmlFor="paste" className="field" style={{ fontSize: 13, fontWeight: 600 }}>
                  Coller une carte
                </label>
                <p className="wizard-hint" style={{ marginTop: 4 }}>
                  Une ligne par produit. Un titre sans prix crée une catégorie.
                  Exemple : « PIZZAS », puis « Margherita 12,50 ».
                </p>
                <textarea
                  id="paste"
                  value={paste}
                  onChange={(event) => setPaste(event.target.value)}
                  placeholder={'PIZZAS\nMargherita 12,50\nRegina 13,50\nQuatre fromages 14,00'}
                />
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={importPaste}
                  style={{ marginTop: 10 }}
                >
                  Ajouter ces lignes
                </button>
              </div>

              <table className="menu-rows">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Prix €</th>
                    <th aria-label="Supprimer" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          className="cell-input"
                          value={item.name}
                          placeholder="Margherita"
                          aria-label={`Nom du produit ${index + 1}`}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((row) =>
                                row.id === item.id ? { ...row, name: event.target.value } : row,
                              ),
                            )
                          }
                        />
                        <input
                          className="cell-input"
                          value={item.description}
                          placeholder="Description (optionnel)"
                          aria-label={`Description du produit ${index + 1}`}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((row) =>
                                row.id === item.id
                                  ? { ...row, description: event.target.value }
                                  : row,
                              ),
                            )
                          }
                        />
                      </td>
                      <td className="cell-category">
                        <input
                          className="cell-input"
                          value={item.category}
                          aria-label={`Catégorie du produit ${index + 1}`}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((row) =>
                                row.id === item.id
                                  ? { ...row, category: event.target.value }
                                  : row,
                              ),
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input cell-price"
                          value={item.price}
                          inputMode="decimal"
                          placeholder="0,00"
                          aria-label={`Prix du produit ${index + 1}`}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((row) =>
                                row.id === item.id ? { ...row, price: event.target.value } : row,
                              ),
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="row-remove"
                          type="button"
                          aria-label={`Supprimer ${item.name || 'cette ligne'}`}
                          onClick={() =>
                            setItems((current) => current.filter((row) => row.id !== item.id))
                          }
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button className="btn btn-secondary btn-sm" type="button" onClick={addRow} style={{ marginTop: 12 }}>
                Ajouter une ligne
              </button>

              <div className="wizard-actions">
                <span className="wizard-hint">
                  {items.length} produit{items.length > 1 ? 's' : ''} · vous pourrez importer
                  une photo de carte plus tard.
                </span>
                <button className="btn btn-primary" type="button" onClick={saveMenu} disabled={pending || items.length === 0}>
                  {pending ? 'Enregistrement…' : 'Continuer vers le service'}
                </button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h1>Horaires et livraison.</h1>
              <p className="lede">
                L'agent répond seulement quand vous êtes ouvert et refuse les adresses hors
                zone. Les frais sont calculés avec vos montants.
              </p>

              <div className="wizard-form">
                <div>
                  <p className="eyebrow">Horaires</p>
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
                                  rowIndex === index
                                    ? { ...row, closed: event.target.checked }
                                    : row,
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
                </div>

                {delivery ? (
                  <div>
                    <p className="eyebrow">Livraison</p>
                    <label className="hours-closed" style={{ marginBottom: 12 }}>
                      <input
                        type="checkbox"
                        checked={delivery.enabled}
                        onChange={(event) =>
                          setDelivery({ ...delivery, enabled: event.target.checked })
                        }
                      />
                      Je livre mes clients
                    </label>
                    {delivery.enabled ? (
                      <div className="wizard-grid">
                        <div className="field">
                          <label htmlFor="fee">Frais de livraison (€)</label>
                          <input
                            id="fee"
                            value={formatPriceInput(delivery.feeCents)}
                            inputMode="decimal"
                            onChange={(event) =>
                              setDelivery({
                                ...delivery,
                                feeCents: parsePriceInput(event.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="minimum">Commande minimum (€)</label>
                          <input
                            id="minimum"
                            value={formatPriceInput(delivery.minOrderCents)}
                            inputMode="decimal"
                            onChange={(event) =>
                              setDelivery({
                                ...delivery,
                                minOrderCents: parsePriceInput(event.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="radius">Rayon (km)</label>
                          <input
                            id="radius"
                            type="number"
                            min={0}
                            value={delivery.radiusKm}
                            onChange={(event) =>
                              setDelivery({
                                ...delivery,
                                radiusKm: Number(event.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="postal">Codes postaux acceptés</label>
                          <input
                            id="postal"
                            value={delivery.postalCodes}
                            placeholder="75011, 75012"
                            onChange={(event) =>
                              setDelivery({ ...delivery, postalCodes: event.target.value })
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="wizard-hint">
                        L'agent prendra uniquement les commandes à emporter.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="wizard-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setStep(2)}>
                  Retour
                </button>
                <button className="btn btn-primary" type="button" onClick={saveService} disabled={pending}>
                  {pending ? 'Enregistrement…' : 'Continuer vers le téléphone'}
                </button>
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <h1>Branchez votre téléphone.</h1>
              <p className="lede">
                Entrez le numéro Twilio acheté pour votre agent, testez-le, puis activez le
                transfert depuis la ligne de la pizzeria.
              </p>

              <div className="field" style={{ marginBottom: 18 }}>
                <label htmlFor="twilio-number">Numéro Twilio de votre agent</label>
                <input
                  id="twilio-number"
                  value={twilioNumber}
                  onChange={(event) => setTwilioNumber(event.target.value)}
                  placeholder="+33 1 23 45 67 89"
                  inputMode="tel"
                />
                <p className="wizard-hint" style={{ marginTop: 6 }}>
                  Vos clients continuent d'appeler le numéro de la pizzeria. Ce numéro Twilio
                  reçoit le renvoi et fait répondre l'agent.
                </p>
              </div>

              <div className="activation-number">
                <div>
                  <p className="eyebrow" style={{ marginBottom: 4 }}>
                    {twilioNumber.trim()
                      ? 'Numéro de votre agent'
                      : 'Numéro de test de votre agent'}
                  </p>
                  <b>{displayNumber}</b>
                </div>
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

              <div className="step-box" style={{ marginTop: 24 }}>
                <p className="eyebrow">Activer le transfert d'appel</p>
                <p className="wizard-hint" style={{ marginTop: 6 }}>
                  Composez le code de votre opérateur depuis le téléphone de la pizzeria,
                  puis appuyez sur appel. Pour annuler plus tard : ##21#.
                </p>
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

              <div className="wizard-actions">
                <button className="btn btn-ghost" type="button" onClick={() => setStep(3)}>
                  Retour
                </button>
                <button className="btn btn-primary" type="button" onClick={activate} disabled={pending}>
                  {pending ? 'Activation…' : 'Mon agent est prêt'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 32 }}>
        <p className="small-note">
          Besoin d'aide ? Écrivez à bonjour@pizzavoice.fr ou revenez plus tard, votre
          progression est enregistrée. <Link to="/">Retour au site</Link>
        </p>
      </div>
    </div>
  )
}
