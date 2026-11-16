import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/legal')({
  head: () => ({
    meta: [
      { title: 'Informations légales, PizzaVoice' },
      {
        name: 'description',
        content:
          'Mentions légales, confidentialité, conditions d’utilisation et cookies de PizzaVoice.',
      },
    ],
  }),
  component: Legal,
})

function Legal() {
  return (
    <>
      <section className="section" style={{ borderTop: 0 }}>
        <div className="container">
          <div className="legal-hero">
            <p className="eyebrow">Informations légales</p>
            <h1 className="display">Les pages à lire avant de commander.</h1>
            <p className="lede" style={{ marginTop: 24 }}>
              Chaque page est rédigée avec les informations réelles de la société. Les
              champs manquants restent marqués <span className="todo">TODO</span> jusqu'à
              validation.
            </p>
          </div>

          <div className="legal-list legal-page">
            <article className="legal-item" id="privacy">
              <h2 className="h3">Confidentialité</h2>
              <p>
                Données collectées : compte, établissements, menu, commandes, appels et
                coordonnées des clients finaux. Finalités : fournir le service, éditer les
                tickets, assurer le suivi des livraisons, mesurer l'usage. <strong>Appels :</strong>{' '}
                la conversation est traitée par un assistant vocal d'intelligence
                artificielle (Gemini Live, Google) et une transcription textuelle horodatée
                est conservée pour la qualité de service, la preuve de commande et le suivi
                des litiges ; elle est supprimée avec le compte ou sur demande. Conservation :
                durée du compte, puis suppression. Sous-traitants : hébergeur, téléphonie,
                messagerie, paiement, fournisseur du modèle vocal (Google). Droits RGPD :
                accès, rectification, effacement, portabilité, opposition, via
                bonjour@pizzavoice.fr. Société : <span className="todo">TODO</span>.
              </p>
            </article>

            <article className="legal-item" id="terms">
              <h2 className="h3">Conditions d'utilisation</h2>
              <p>
                Objet : accès à un standard téléphonique et à un tableau de bord de
                commandes. <strong>Nature du service :</strong> les appels sont pris en charge
                par un assistant vocal automatisé ; le client final doit être informé qu'il
                parle à une machine et que l'échange est transcrit. Le gérant reste
                responsable du contenu du menu, des prix, des horaires et des conditions de
                livraison qu'il publie : l'assistant ne fait que restituer ces données.
                Obligations du client : exactitude du menu et des prix, usage conforme,
                confidentialité des accès. Disponibilité : objectif de service continu,
                maintenance annoncée. Résiliation : en ligne, à la fin de la période en
                cours. Responsabilité : limitée aux sommes versées sur les douze derniers
                mois. Éditeur : <span className="todo">TODO</span>.
              </p>
            </article>

            <article className="legal-item" id="cookies">
              <h2 className="h3">Cookies</h2>
              <p>
                Cookies nécessaires : session, sécurité, préférences d'affichage. Mesure
                d'audience uniquement après consentement. Aucun cookie publicitaire au
                lancement. Gestion des préférences depuis le bandeau et les réglages du
                navigateur.
              </p>
            </article>

            <article className="legal-item" id="notices">
              <h2 className="h3">Mentions légales</h2>
              <p>
                Raison sociale : <span className="todo">TODO</span>. SIRET :{' '}
                <span className="todo">TODO</span>. Adresse :{' '}
                <span className="todo">TODO</span>. Contact : bonjour@pizzavoice.fr.
                Hébergeur : <span className="todo">TODO</span>. Directeur de la publication :{' '}
                <span className="todo">TODO</span>.
              </p>
            </article>

            <article className="legal-item" id="dpa">
              <h2 className="h3">Sous-traitance (DPA)</h2>
              <p>
                Le contrat de sous-traitance précise les catégories de données, les durées,
                les mesures de sécurité et la liste des sous-traitants ultérieurs. Version
                signée disponible sur demande.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  )
}
