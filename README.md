# PizzaVoice

Le standard téléphonique des pizzerias : il répond pendant le service, prend la commande,
l'envoie en cuisine et tient le livreur informé.

## Stack

- **TanStack Start** (React 19, Vite 8, routage par fichiers)
- **Tailwind CSS v4** avec les tokens sémantiques de `DESIGN.md`
- **Supabase** pour l'authentification, la base et le stockage (à brancher)
- Polices auto-hébergées : Fraunces, Archivo, IBM Plex Mono

## Démarrer

```bash
ord deploy
```

`ord` installe les dépendances si besoin et sert l'application sur un port libre.
Le port est affiché dans la sortie. Sans `ord` :

```bash
npm install
npm run dev
```

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (client + serveur) |
| `npm run typecheck` | Vérification TypeScript |
| `npm run preview` | Prévisualisation du build |

## Atelier

L'Atelier (`/studio`) est la plateforme interne qui produit les dialogues de l'agent :
graphe de nœuds, intentions, exemples d'énoncés, compilation en programme versionné,
simulateur texte et manifeste des voix. L'architecture complète est dans
[`PLATFORM.md`](./PLATFORM.md).

Le routeur JEV est branché sur OpenCode Zen. Le modèle `jev-1.13-free` fonctionne avec
le jeton public, sans clé ; en production, mettez une clé Console :

```sh
export JEV_API_KEY=...          # facultatif, "public" par défaut
export JEV_MODEL=jev-1.13-free
export JEV_ENDPOINT=https://opencode.ai/inference/systemone/v1/systemone
```

Sans réseau, l'Atelier reste utilisable : le simulateur bascule sur le score local et
l'indique dans la trace.

## Parcours

1. `/signup` crée le compte et la session.
2. `/onboarding` fait le tour complet en quatre étapes : établissement, carte, service,
   téléphone. La progression est enregistrée à chaque étape.
3. `/app` ouvre le tableau de bord : commandes, menu, réglages, numéro de test et codes de
   transfert par opérateur.

## Structure

```
src/
  routes/            routes TanStack (fichiers)
    __root.tsx       shell HTML, header, footer
    index.tsx        accueil marketing
    studio.tsx       Atelier, graphe et simulateur
    tarifs.tsx       tarifs et calculateur de parc
    contact.tsx      contact et support
    legal.tsx        mentions, confidentialité, CGU, cookies
    signup.tsx       création de compte
    login.tsx        connexion
    _authenticated.tsx   garde de session
    _authenticated/onboarding.tsx
    _authenticated/app.tsx + app/*
    suivi.$token.tsx     page de suivi client
    livreur.$token.tsx   dashboard livreur
    api/contact.ts   réception du formulaire
    api/agent/orders.ts  création de commande par le runtime
  components/
    brand.tsx        wordmark et marque
    site-header.tsx  navigation
    site-footer.tsx  pied de page
    marketing/       sections de la page publique
  data/pricing.ts    grille tarifaire, source de vérité
  studio/            modèle de graphe, compilateur, routeur local
  lib/               types, parseur de carte, valeurs par défaut
  server/            sessions, stockage, server functions, routeur JEV
  styles.css         tokens, base, composants
design/
  reference.html     référence visuelle validée (archive)
  assets/            images générées
public/images/       images servies par l'application
DESIGN.md            source de vérité du design
```

## Conventions

- Aucune couleur ni taille codée en dur dans un composant : tokens de `src/styles.css`.
- Les prix viennent de `src/data/pricing.ts`, jamais d'une chaîne écrite à la main.
- Les textes sont en français ; l'anglais arrive avec les routes bilingues.
- Les données sont stockées dans `.data/db.json` (ignoré par git) pour que le parcours
  fonctionne sans dépendance externe. `src/server/store.server.ts` est le seul fichier à
  remplacer par Supabase : les server functions et les écrans ne changent pas.
- `PV_TEST_NUMBER` change le numéro de test affiché. `PV_DATA_FILE` change le chemin du
  fichier de données.
- Stripe n'est pas branché : l'essai est affiché, aucun paiement n'est demandé.

## Runtime téléphonique

Le service `runtime/` prend les appels Twilio, transcrit avec Groq `whisper-large-v3-turbo`,
joue le message d'accueil préenregistré, puis passe **immédiatement** la main à
Gemini 3.8 Live qui conduit l'appel de bout en bout. JEV est désactivé.

Gemini Live n'a **aucune donnée en dur** : il interroge l'API produit par appels
d'outils — `get_menu`, `get_delivery_info`, `get_opening_hours`,
`get_available_drivers`, `get_restaurant_info`, `create_order`. Le menu, les prix,
les horaires et les frais affichés sont donc toujours ceux du restaurant connecté.

Chaque appel produit une transcription horodatée (client + agent) dans
`runtime/data/transcripts/` : `.jsonl` incrémental pendant l'appel, `.json` complet
à la fermeture.

```bash
cd runtime
cp .env.example .env
npm run seed          # écrit le programme de démonstration
npm run generate      # synthétise les voix (clé Gemini)
npm start             # écoute sur :8080
```

Healthcheck : `GET /health`. Webhook Twilio : `POST /twilio`.

Le programme publié depuis l'Atelier est écrit dans `runtime/data/tenants/<tenant>/`.
Le runtime choisit le tenant avec le numéro Twilio appelé (`To`).

## Déploiement

`DEPLOY.md` décrit le VPS complet : Docker Compose, Caddy, HTTPS, Twilio, génération des
voix et sauvegardes.

```bash
cp .env.example .env
docker compose up -d --build
```

La CI (`.github/workflows/ci.yml`) vérifie les types et le build à chaque push et pull
request.

## Tester à distance sans VPS

`npm run tunnel` lance l'app (4001), le runtime (8080) et un proxy sur 8088 qui
route `/phone-ws`, `/web-call`, `/media`, `/health` et `/twilio` vers le runtime,
le reste vers l'app. C'est une cible unique, donc un seul tunnel suffit :

```bash
npm run tunnel
# dans un autre terminal
cloudflared tunnel --url http://127.0.0.1:8088 --no-autoupdate --protocol http2
```

L'URL `https://*.trycloudflare.com` affichée donne accès à l'app complète, y compris
l'appel navigateur en `wss` (l'URL WebSocket est déduite de l'hôte du navigateur,
donc rien à configurer).

Limites de ce mode : processus de développement (pas de build), données dans
`runtime/data` et `.data/db.json`, tunnel éphémère à chaque redémarrage.
