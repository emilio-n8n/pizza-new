import type { MenuItem } from './types'

const PRICE = /(\d+(?:[.,]\d{1,2})?)\s*(?:€|eur|euros?)?\s*$/i

function newId() {
  return globalThis.crypto.randomUUID()
}

/**
 * Analyse une carte collée en texte libre.
 * Une ligne sans prix devient une catégorie ; une ligne avec prix devient un produit.
 */
export function parseMenuText(input: string): MenuItem[] {
  const items: MenuItem[] = []
  let category = 'Pizza'

  for (const raw of input.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue

    const match = line.match(PRICE)
    if (!match) {
      const cleaned = line.replace(/[:_-]+$/, '').trim()
      if (cleaned.length >= 2 && cleaned.length <= 40) category = titleCase(cleaned)
      continue
    }

    const price = Number.parseFloat(match[1].replace(',', '.'))
    if (!Number.isFinite(price) || price <= 0) continue

    const name = line.slice(0, match.index).replace(/[-–—:]\s*$/, '').trim()
    if (name.length < 2) continue

    items.push({
      id: newId(),
      category,
      name: cleanName(name),
      description: '',
      priceCents: Math.round(price * 100),
      available: true,
    })
  }

  return items
}

function cleanName(value: string) {
  return value
    .replace(/^[-–—•*]\s*/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}
