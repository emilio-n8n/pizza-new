import { createFileRoute } from '@tanstack/react-router'

import { ContactSection } from '#/components/marketing/contact'
import { Chains, Install, Outcomes } from '#/components/marketing/company'
import { Faq } from '#/components/marketing/faq'
import { Hero } from '#/components/marketing/hero'
import { PricingSection } from '#/components/marketing/pricing'
import { OvenBand, Problem, ProductLedger } from '#/components/marketing/product'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'PizzaVoice, le standard des pizzerias' },
      {
        name: 'description',
        content:
          "PizzaVoice répond au téléphone pendant le service, prend la commande, l'envoie en cuisine et tient le livreur informé. Pour les pizzerias indépendantes et les petites chaînes.",
      },
    ],
  }),
  component: Home,
})

function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <ProductLedger />
      <OvenBand />
      <Chains />
      <Install />
      <Outcomes />
      <PricingSection />
      <Faq />
      <ContactSection />
    </>
  )
}
