import { useState } from 'react'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function ContactSection() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const payload = Object.fromEntries(new FormData(event.currentTarget))

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setStatus(response.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="section section-ink" id="contact">
      <div className="container contact-grid">
        <div>
          <p className="eyebrow light">Une question ?</p>
          <h2 className="display">Parlons de votre service.</h2>
          <p className="lede" style={{ marginTop: 20 }}>
            L'ouverture de compte, l'import du menu et la mise en route se font en ligne.
            Écrivez-nous si vous avez une question avant de commencer.
          </p>
          <p className="contact-note">Réponse sous un jour ouvré.</p>
        </div>

        {status === 'sent' ? (
          <div className="component-box" role="status">
            <p className="eyebrow">Message reçu</p>
            <p className="h3" style={{ marginBottom: 8 }}>
              Merci. Nous revenons vers vous avec votre accès.
            </p>
            <p className="small-note">
              Nous répondons sous un jour ouvré.
            </p>
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="contact-name">Nom</label>
              <input id="contact-name" name="name" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="contact-email">Email professionnel</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="contact-phone">Téléphone</label>
              <input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
            </div>
            <div className="field">
              <label htmlFor="contact-locations">Établissements</label>
              <select id="contact-locations" name="locations" defaultValue="1">
                <option>1</option>
                <option>2 à 4</option>
                <option>5 à 9</option>
                <option>10 et plus</option>
              </select>
            </div>
            <div className="field full">
              <label htmlFor="contact-message">Votre message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={3}
                placeholder="Ville, nombre d'appels par jour, logiciel actuel..."
              />
            </div>
            <div className="field full form-foot">
              <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
              </button>
              <p className="small-note light">
                En envoyant ce formulaire, vous acceptez notre{' '}
                <a href="/legal#privacy">politique de confidentialité</a>.
              </p>
            </div>
            {status === 'error' ? (
              <p className="field full small-note light" role="alert">
                L'envoi n'a pas abouti. Réessayez ou écrivez à bonjour@pizzavoice.fr.
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  )
}
