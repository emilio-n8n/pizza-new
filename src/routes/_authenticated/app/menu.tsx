import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { formatPriceInput, parsePriceInput } from '#/lib/defaults'
import type { MenuItem } from '#/lib/types'
import {
  addMenuItemFn,
  getMenuFn,
  removeMenuItemFn,
  updateMenuItemFn,
} from '#/server/api'

export const Route = createFileRoute('/_authenticated/app/menu')({
  head: () => ({ meta: [{ title: 'Menu, PizzaVoice' }] }),
  loader: async () => getMenuFn(),
  component: MenuPage,
})

const BLANK = {
  name: '',
  category: 'Pizza',
  description: '',
  price: '',
}

function MenuPage() {
  const data = Route.useLoaderData()
  const [items, setItems] = useState<MenuItem[]>(data?.location.menu ?? [])
  const [draft, setDraft] = useState(BLANK)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const priceCents = parsePriceInput(draft.price)
    if (draft.name.trim().length < 2) {
      setError('Indiquez le nom du produit.')
      setPending(false)
      return
    }
    if (priceCents <= 0) {
      setError('Indiquez un prix supérieur à zéro.')
      setPending(false)
      return
    }

    const result = await addMenuItemFn({
      data: {
        name: draft.name.trim(),
        category: draft.category.trim() || 'Pizza',
        description: draft.description.trim(),
        priceCents,
        available: true,
      },
    })

    if (!result.ok) {
      setError(result.error)
      setPending(false)
      return
    }

    setItems(result.menu)
    setDraft(BLANK)
    setPending(false)
  }

  async function toggle(item: MenuItem) {
    const result = await updateMenuItemFn({
      data: { id: item.id, patch: { available: !item.available } },
    })
    if (result.ok) setItems(result.menu)
  }

  async function remove(item: MenuItem) {
    const result = await removeMenuItemFn({ data: { id: item.id } })
    if (result.ok) setItems(result.menu)
  }

  const categories = Array.from(new Set(items.map((item) => item.category)))

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Menu</h2>
          <p>
            {items.length} produit{items.length > 1 ? 's' : ''} · {categories.length} catégorie
            {categories.length > 1 ? 's' : ''} · l'agent ne propose que ce qui est disponible.
          </p>
        </div>
      </div>

      <div className="panel">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Prix</th>
              <th>Disponible</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <b>{item.name}</b> <span className="item-category">{item.category}</span>
                  {item.description ? (
                    <>
                      <br />
                      <span className="mono" style={{ color: 'var(--muted-foreground)' }}>
                        {item.description}
                      </span>
                    </>
                  ) : null}
                </td>
                <td>
                  <span className="price" style={{ fontSize: 13 }}>
                    {formatPriceInput(item.priceCents)} €
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className={`switch${item.available ? ' on' : ''}`}
                    role="switch"
                    aria-checked={item.available}
                    aria-label={`${item.name} ${item.available ? 'disponible' : 'indisponible'}`}
                    onClick={() => toggle(item)}
                  />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="row-remove"
                    type="button"
                    aria-label={`Supprimer ${item.name}`}
                    onClick={() => remove(item)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-row">
                  Aucun produit. Ajoutez votre première pizza ci-dessous.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <section className="panel">
        <h2>Ajouter un produit</h2>
        <form className="wizard-form" onSubmit={addItem} style={{ marginTop: 14 }}>
          <div className="wizard-grid">
            <div className="field">
              <label htmlFor="item-name">Nom</label>
              <input
                id="item-name"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="Margherita"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="item-category">Catégorie</label>
              <input
                id="item-category"
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                placeholder="Pizza"
              />
            </div>
          </div>
          <div className="wizard-grid">
            <div className="field">
              <label htmlFor="item-description">Description</label>
              <input
                id="item-description"
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                placeholder="Tomate, mozzarella, basilic"
              />
            </div>
            <div className="field">
              <label htmlFor="item-price">Prix (€)</label>
              <input
                id="item-price"
                value={draft.price}
                onChange={(event) => setDraft({ ...draft, price: event.target.value })}
                placeholder="12,00"
                inputMode="decimal"
                required
              />
            </div>
          </div>
          {error ? (
            <p className="wizard-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="form-foot">
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? 'Ajout…' : 'Ajouter au menu'}
            </button>
            <p className="small-note">
              Le produit est disponible immédiatement pour les prochains appels.
            </p>
          </div>
        </form>
      </section>
    </>
  )
}
