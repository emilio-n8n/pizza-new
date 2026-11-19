# Déploiement

Deux cibles possibles.

## A. Vercel (app) + Supabase — recommandé aujourd'hui

L'app se déploie sur Vercel. Le **runtime vocal ne peut pas** y tourner : il
tient des WebSockets ouverts pendant des minutes, ce que les fonctions Vercel
ne permettent pas. Il reste sur une machine persistante et l'app l'appelle en
`wss://`.

1. Coller `supabase/schema.sql` dans Supabase → SQL Editor → Run.
2. Variables à définir sur Vercel :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (Production, Preview et Development)
3. Construire et déployer :

```bash
npm i
NITRO_PRESET=vercel npm run build   # produit .vercel/output
npx vercel deploy --prebuilt        # ou via Git : push sur main
```

Avec l'intégration Git, Vercel lance `npm run build` seul ; il faut alors
définir `NITRO_PRESET=vercel` dans les Environment Variables du projet.

Le plan gratuit Vercel suffit pour l'app. Le runtime reste à héberger
(VPS, Fly.io, Railway) le jour où les appels téléphoniques deviennent réels.

## B. VPS + Docker (tout-en-un)

Objectif : un VPS, Docker, deux domaines, les clés API, et le standard répond.

## 1. Préparer le VPS

- Ubuntu 24.04, 2 vCPU, 4 Go de RAM minimum.
- Docker et le plugin Compose installés.
- Deux enregistrements DNS de type A vers l'IP du VPS :
  - `app.pizzavoice.fr` (ou votre domaine) ;
  - `runtime.pizzavoice.fr`.

## 2. Configurer

```bash
git clone <repo> pizzavoice
cd pizzavoice
cp .env.example .env
```

Remplir `.env` :

- `APP_DOMAIN` et `RUNTIME_DOMAIN` ;
- `ATELIER_ADMINS` avec l'email du compte qui pourra publier les graphes ;
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` et `TWILIO_FROM` (SMS de suivi et validation du webhook) ;
- `GROQ_API_KEY` ;
- `GEMINI_API_KEY` ;
- `JEV_API_KEY=public` (ou une clé Console).

## 3. Démarrer

```bash
docker compose up -d --build
```

Caddy obtient les certificats HTTPS tout seul. Vérifier :

```bash
curl https://runtime.pizzavoice.fr/health
```

La réponse doit indiquer `groq: true`, `gemini: true`.

## 4. Générer les voix

Le runtime génère les messages à la demande et les met en cache. Pour tout préparer
d'avance :

```bash
docker compose exec runtime npm run generate
```

Les fichiers sont écrits dans le volume `pizzavoice_data`, dossier
`/data/runtime/tenants/default/audio`.

Le modèle par défaut est `gemini-3.8-flash-tts`. Le quota gratuit est faible :
le script espace les requêtes et réessaie sur 429, mais pour un parc de plusieurs
pizzerias il faut activer la facturation Google. Sans génération préalable, le runtime
synthétise le message au premier appel et le met en cache.

## 5. Twilio

1. Acheter un numéro Twilio avec la voix.
2. Dans le numéro, configurer **A call comes in** :
   - URL : `https://runtime.pizzavoice.fr/twilio`
   - méthode : `POST`.
3. Dans l'application, ouvrir **Réglages → Téléphone**, saisir le numéro Twilio et
   enregistrer. Le runtime crée le dossier du tenant pour ce numéro.
4. Depuis la ligne de la pizzeria, activer le renvoi d'appel vers le numéro Twilio
   avec le code de l'opérateur (Orange, SFR, Bouygues, Free).
5. Appeler le numéro de la pizzeria : l'agent doit décrocher.

Le compte Twilio d'essai ne peut envoyer des SMS qu'aux numéros vérifiés. Le lien de suivi
reste disponible dans le tableau de bord, même si le SMS échoue. Pour envoyer les SMS à
tous les clients, il faut activer la facturation Twilio.

Le runtime déduit l'établissement du numéro Twilio appelé (`To`). S'il n'existe pas de
dossier pour ce numéro, il utilise le tenant `default`.

## 6. Application

1. Ouvrir `https://app.pizzavoice.fr`.
2. Créer un compte.
3. Remplir l'établissement, la carte, les horaires et la livraison.
4. Le tableau de bord affiche le numéro de test et les codes de transfert.

## 7. Suivi client et livreurs

- Chaque commande reçoit un lien public `/suivi/<token>` envoyé par SMS au client.
- Le client voit le statut, la timeline, les articles, le total et le contact de la pizzeria.
- Dans **Réglages → Livreurs**, ajoutez un livreur et copiez son lien `/livreur/<token>`.
- Le livreur voit les courses disponibles, l'adresse, le téléphone, le montant à encaisser,
  l'itinéraire Google Maps, puis prend la course et la marque livrée.
- Désactiver un livreur révoque son lien.

## 8. Téléphone navigateur

L'application propose `/app/telephone` pour tester l'agent sans Twilio : micro du
navigateur, transcription Groq, JEV, réponses audio et handoff Gemini Live. En production,
le WebSocket passe par Caddy sur `/phone-ws` ; en local, `VITE_RUNTIME_WS_URL` pointe vers
`ws://127.0.0.1:8080/web-call`.

## 9. Publier un graphe

1. Ouvrir `/studio` sur l'application.
2. Se connecter avec un email présent dans `ATELIER_ADMINS`.
3. Modifier le graphe, puis **Publier**.
4. Le programme est écrit dans le volume partagé et le runtime le prend au prochain appel.
5. Les nouveaux messages sont synthétisés au premier appel, puis mis en cache.

## 10. Plusieurs établissements

Le runtime cherche `data/tenants/<numéro Twilio sans espaces>/program.json`.
Pour un nouveau client :

```bash
docker compose exec runtime sh
mkdir -p /data/runtime/tenants/33612345678/audio
cp /data/runtime/tenants/default/program.json /data/runtime/tenants/33612345678/
```

Puis publier un graphe spécifique depuis l'Atelier (le tenant est à adapter dans le code
de publication) ou remplacer le `program.json`.

## 11. Sauvegardes

Tout l'état est dans le volume `pizzavoice_data` :

```bash
docker run --rm -v pizzavoice_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/pizzavoice-$(date +%F).tar.gz /data
```

## Limites de cette version

- L'application utilise encore un fichier JSON (`/data/app/db.json`) : un seul VPS, pas de
  scale horizontal. Pour plusieurs instances, passer à Postgres/Supabase.
- Pas de paiement Stripe.
- Pas de gestion multi-établissements dans l'interface.
- Le quota gratuit Gemini TTS est faible. Les messages statiques sont préenregistrés ; les
  nœuds dynamiques (récapitulatif, référence) utilisent un fallback préenregistré si le TTS
  échoue. Activer la facturation Google pour la voix dynamique complète.
- Le suivi client et le tableau de bord livreur ne sont pas encore branchés.
- La validation de signature Twilio protège le webhook, mais le runtime n'a pas de limite
  de débit par numéro.
