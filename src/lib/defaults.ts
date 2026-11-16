import type { DayHours, DeliverySettings } from './types'

export function defaultHours(): DayHours[] {
  return [
    { day: 1, closed: false, open: '11:30', close: '14:30' },
    { day: 2, closed: false, open: '11:30', close: '14:30' },
    { day: 3, closed: false, open: '11:30', close: '14:30' },
    { day: 4, closed: false, open: '11:30', close: '14:30' },
    { day: 5, closed: false, open: '11:30', close: '14:30' },
    { day: 6, closed: false, open: '11:30', close: '14:30' },
    { day: 0, closed: false, open: '18:00', close: '22:30' },
  ]
}

export function defaultDelivery(): DeliverySettings {
  return {
    enabled: true,
    feeCents: 250,
    minOrderCents: 1500,
    radiusKm: 4,
    postalCodes: '',
  }
}

export const DAY_LABELS = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
] as const

export function operatorCodes(number: string) {
  const digits = number.replace(/\s+/g, '')
  return [
    { name: 'Orange / Sosh', code: `**21*${digits}#` },
    { name: 'SFR / Red', code: `*21*${digits}#` },
    { name: 'Bouygues', code: `*61*${digits}#` },
    { name: 'Free', code: `*21*${digits}#` },
  ]
}

export function formatPriceInput(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',')
}

export function parsePriceInput(value: string) {
  const parsed = Number.parseFloat(value.replace(',', '.').replace(/[^\d.]/g, ''))
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0
}
