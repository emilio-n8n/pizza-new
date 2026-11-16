import { createFileRoute } from '@tanstack/react-router'

import { ContactSection } from '#/components/marketing/contact'
import { Faq } from '#/components/marketing/faq'
import { PricingSection } from '#/components/marketing/pricing'

export const Route = createFileRoute('/tarifs')({
  head: () => ({
    meta: [
      { title: 'Tarifs, PizzaVoice' },
      {
        name: 'description',
        content:
          'Abonnement mensuel par établissement, appels illimités, sans commission. 14 jours d’essai sans carte. Le tarif est public et le total se calcule en direct.',
      },
    ],
  }),
  component: Tarifs,
})

function Tarifs() {
  return (
    <>
      <PricingSection />
      <Faq />
      <ContactSection />
    </>
  )
}
