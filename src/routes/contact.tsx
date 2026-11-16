import { createFileRoute } from '@tanstack/react-router'

import { ContactSection } from '#/components/marketing/contact'

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      { title: 'Ouvrir un compte, PizzaVoice' },
      {
        name: 'description',
        content:
          'Laissez vos coordonnées pour ouvrir votre compte PizzaVoice. Réponse sous un jour ouvré, aucune carte bancaire demandée.',
      },
    ],
  }),
  component: Contact,
})

function Contact() {
  return <ContactSection />
}
