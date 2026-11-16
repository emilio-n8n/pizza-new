export function slotValue(intent: string): Record<string, string> {
  const normalized = intent
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const slots: Record<string, string> = {}

  if (normalized.includes('margherita')) slots.pizza = 'Margherita'
  if (normalized.includes('regina')) slots.pizza = 'Regina'
  if (normalized.includes('quatre fromages')) slots.pizza = 'Quatre fromages'
  if (normalized.includes('diavola')) slots.pizza = 'Diavola'
  if (normalized === '1 pizza') slots.quantity = '1'
  if (normalized === '2 pizzas') slots.quantity = '2'
  if (normalized === '3 pizzas') slots.quantity = '3'
  if (normalized === 'coca') slots.drink = 'Coca'
  if (normalized === 'eau') slots.drink = 'Eau'
  if (normalized === 'diabolo') slots.drink = 'Diabolo'
  if (normalized === 'sur place') slots.mode = 'sur place'
  if (normalized === 'a emporter') slots.mode = 'à emporter'
  if (normalized === 'en livraison') slots.mode = 'en livraison'

  return slots
}

export function renderText(text: string, slots: Record<string, string>) {
  const quantity = slots.quantity ?? '1'
  const pizza = slots.pizza ?? 'Margherita'
  const drink = slots.drink
  const mode = slots.mode ?? 'à emporter'

  const order = [
    `${quantity} × ${pizza}`,
    drink ? `1 × ${drink}` : null,
    mode === 'en livraison'
      ? `Livraison${slots.address ? ` au ${slots.address}` : ''}`
      : mode,
  ]
    .filter(Boolean)
    .join(', ')

  return text
    .replaceAll('{{order}}', order)
    .replaceAll('{{reference}}', slots.reference ?? `PV-${Date.now().toString().slice(-4)}`)
}


export const FALLBACK_TEXT: Record<string, string> = {
  confirm: "C'est noté. Je valide la commande ?",
  create:
    "C'est envoyé en cuisine. Vous recevez le lien de suivi par SMS. À tout de suite.",
}
