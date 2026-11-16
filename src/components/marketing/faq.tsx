export function Faq() {
  return (
    <section className="section" id="faq">
      <div className="container faq-grid">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="h2">Avant de brancher le standard.</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Les réponses concrètes, sans jargon.
          </p>
        </div>
        <div className="faq-list">
          <details open>
            <summary>Est-ce que je garde mon numéro actuel ?</summary>
            <p>
              Oui. Vous activez le transfert d'appel depuis votre ligne existante. Les codes
              sont fournis pour Orange, SFR, Bouygues et Free. Votre numéro reste le même.
            </p>
          </details>
          <details>
            <summary>L'agent parle-t-il anglais ?</summary>
            <p>
              Oui. L'agent répond en français ou en anglais selon la langue du client. Le
              menu peut avoir des noms et des descriptions dans les deux langues.
            </p>
          </details>
          <details>
            <summary>Que se passe-t-il si l'agent ne comprend pas ?</summary>
            <p>
              Il pose une question de clarification. Si le doute persiste, il transfère
              l'appel vers un humain et laisse une trace dans le tableau de bord.
            </p>
          </details>
          <details>
            <summary>Puis-je modifier le menu moi-même ?</summary>
            <p>
              Oui. Le menu se modifie depuis le tableau de bord. Les prix, les options et la
              disponibilité sont pris en compte au prochain appel.
            </p>
          </details>
          <details>
            <summary>Où sont hébergées les données ?</summary>
            <p>
              Les données sont hébergées en Europe. Les accès sont journalisés et les tokens
              de suivi sont révocables. La politique de confidentialité détaille les
              sous-traitants.
            </p>
          </details>
          <details>
            <summary>Combien de temps pour l'installation ?</summary>
            <p>
              Le menu est importé et relu en quelques minutes. Le test de l'agent et
              l'activation dépendent de votre ligne téléphonique. Nous ne promettons pas un
              délai que nous ne tenons pas.
            </p>
          </details>
          <details>
            <summary>Comment se passe l'abonnement ?</summary>
            <p>
              Vous démarrez un essai de 14 jours sans carte bancaire. Ensuite, l'abonnement
              est prélevé chaque mois par carte, par établissement. Pas de commission sur les
              commandes, pas de frais par appel. Vous ajoutez ou retirez un établissement
              depuis le compte, et la facture s'ajuste au prorata.
            </p>
          </details>
        </div>
      </div>
    </section>
  )
}
