export const TRIAL_DAYS = 14

export const pricingBrackets = [
  { min: 1, max: 1, unit: 79, label: '1' },
  { min: 2, max: 4, unit: 69, label: '2 à 4' },
  { min: 5, max: 9, unit: 59, label: '5 à 9' },
  { min: 10, max: Number.POSITIVE_INFINITY, unit: 49, label: '10 et plus' },
] as const

export const MIN_LOCATIONS = 1
export const MAX_LOCATIONS = 50

export function clampLocations(value: number) {
  if (!Number.isFinite(value)) return MIN_LOCATIONS
  return Math.min(MAX_LOCATIONS, Math.max(MIN_LOCATIONS, Math.round(value)))
}

export function unitPrice(locations: number) {
  const count = clampLocations(locations)
  const bracket = pricingBrackets.find((item) => count >= item.min && count <= item.max)
  return bracket?.unit ?? pricingBrackets[0].unit
}

export function monthlyTotal(locations: number) {
  const count = clampLocations(locations)
  return count * unitPrice(count)
}

export function activeBracket(locations: number) {
  const count = clampLocations(locations)
  return pricingBrackets.find((item) => count >= item.min && count <= item.max) ?? pricingBrackets[0]
}

export function formatEuros(value: number, decimals = 0) {
  return (
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value) + ' €'
  )
}

export function formatLocations(count: number) {
  return `${count} établissement${count > 1 ? 's' : ''}`
}
