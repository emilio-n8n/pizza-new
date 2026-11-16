# Atelier, la plateforme de dialogues

> Plateforme propriétaire qui produit et exécute les appels de PizzaVoice.
> Elle est liée au produit par une API (établissement, menu, commandes) mais reste un outil séparé :
> le gérant ne la voit pas, il voit seulement l'agent qui répond.

---

## 1. Le principe

**État actuel (15/11/2026) : JEV est désactivé, Gemini Live traite seul l'appel.**

L'accueil reste un message préenregistré (réponse instantanée au décroché). Dès qu'il est terminé,
la session bascule sur **Gemini Live**, qui conduit toute la conversation : questions, carte, prix,
horaires, livraison, disponibilité des livreurs, prise de commande.

Gemini Live n'a **aucune donnée en dur** : il interroge l'API produit par appels d'outils
(`get_menu`, `get_delivery_info`, `get_opening_hours`, `get_available_drivers`,
`get_restaurant_info`, `create_order`). Le menu affiché est donc toujours celui de la pizzeria
connectée, jamais une carte générique.

Le routeur **JEV** et le graphe de dialogue restent dans le dépôt, mais dormants : ils ne sont plus
appelés par le runtime. Ils pourront resservir plus tard (parcours courts, coût, latence).

Chaque appel produit une **transcription horodatée** (client + agent, fournie nativement par Gemini
Live) enregistrée dans `runtime/data/transcripts/` : un `.jsonl` incrémental pendant l'appel, un
`.json` complet à la fermeture. C'est la matière première pour automatiser plus tard.

Le client ne doit jamais attendre sans entendre quelque chose.

---

## 2. Les deux plans

### Atelier (authoring)

Application interne :

- éditeur de graphe : nœuds, sorties, intentions, exemples d'énoncés ;
- simulation texte avec trace JEV (choix, confiance, probabilités) ;
- génération et prévisualisation des voix ;
- compilation en programme versionné ;
- publication vers un environnement (test, production) ;
- statistiques : nœuds les plus visités, taux de sortie, taux de handoff.

### Runtime (voice gateway)

Service séparé, sans interface :

- reçoit l'appel du fournisseur téléphonique (média temps réel) ;
- joue l'accueil préenregistré puis passe la main à Gemini Live ;
- streame l'audio client vers Gemini Live (16 kHz) et renvoie l'audio agent (8 kHz µ-law) ;
- exécute les appels d'outils demandés par le modèle via l'API produit ;
- écrit la commande dans le produit et renvoie l'URL de suivi ;
- enregistre la transcription horodatée de l'appel (`data/transcripts/`).

---

## 3. Le graphe

### Types de nœuds

| Type | Rôle | Sorties |
|---|---|---|
| `start` | Accueil, premier message | plusieurs intentions |
| `say` | Information, liste de plats, confirmation | une sortie `continuer` |
| `branch` | Question fermée, choix parmi des réponses | une sortie par réponse |
| `capture` | Collecte une valeur libre (adresse, téléphone, quantité) | une sortie `continuer` |
| `action` | Appel outil (menu, horaires, commande) | une sortie `succès`, une `échec` |
| `handoff` | Passage à Gemini Live | fin ou retour au graphe |
| `end` | Fin d'appel | aucune |

### Sorties

Chaque sortie porte :

- `intent` : libellé court, en français, utilisé comme question pour JEV ;
- `examples` : 5 à 15 formulations réelles du client ;
- `to` : nœud cible ;
- `action` optionnelle (ex. `lookup_menu`, `create_order`).

### Règles d'authoring

- Un nœud = un seul message oral. Pas de paragraphe.
- Une question = au maximum 4 sorties. Au-delà, on découpe.
- Chaque sortie a au moins 5 exemples, dont les formulations fautives courantes.
- Les valeurs dynamiques (prix, adresse, récapitulatif) sont des emplacements, pas du texte figé.
- Le handoff est toujours accessible : toute branche peut sortir par `exception`.

---

## 4. Compilation

Le graphe est compilé en un **programme** immuable, versionné, publié :

```json
{
  "flowId": "chez-luigi",
  "version": 7,
  "voice": "sophie-fr",
  "states": {
    "greeting": {
      "say": "Bonjour, bienvenue chez Luigi...",
      "audio": "chez-luigi/greeting/v7",
      "transitions": [
        { "id": "commander", "to": "mode", "intent": "Le client veut commander", "examples": ["..."] },
        { "id": "info", "to": "info", "intent": "Le client veut une information", "examples": ["..."] }
      ]
    }
  },
  "actions": {},
  "fallback": {
    "threshold": 0.55,
    "bridgeAudio": "global/bridge/v1",
    "bridgeText": "Veuillez patienter quelques secondes, je vérifie."
  }
}
```

Règles :

- une version publiée ne change plus ; on crée la suivante ;
- chaque nœud a une clé audio stable : `flow/node/version` ;
- le programme ne contient aucun secret et ne depend pas de la base produit ;
- les actions sont des contrats : entrée, sortie, timeout, idempotence.

---

## 5. Stack retenue

| Brique | Choix |
|---|---|
| Téléphonie | **Twilio Media Streams** (μ-law 8 kHz, trames base64) |
| Transcription | **Groq `whisper-large-v3-turbo`**, une requête par tour de parole |
| Routage | **JEV 1.13 Free**, OpenCode Zen |
| Conversation libre | **Gemini Live**, clé AI Studio |
| Voix des messages | à trancher : ElevenLabs ou Gemini TTS |

### Chemin d'un appel

```text
Client → numéro public de la pizzeria
       → renvoi d'appel opérateur (codes fournis au gérant)
       → numéro Twilio
       → webhook TwiML : <Connect><Stream url="wss://runtime/..."/>
       → média temps réel Twilio ↔ runtime
```

Le numéro public reste celui de la pizzeria. Twilio ne reçoit que les appels renvoyés.
Le runtime connaît l'établissement par le numéro Twilio appelé (`To`), pas par le numéro
du client.

### Audio

- Twilio : μ-law 8 kHz mono, trames de 20 ms.
- Groq : accepte WAV, FLAC, MP3, OGG. On envoie un WAV PCM 16 bits par segment de parole.
- Gemini Live : PCM 16 bits, 16 kHz en entrée, 24 kHz en sortie. Conversion obligatoire
  vers 8 kHz μ-law pour Twilio.
- Messages préenregistrés : stockés en μ-law 8 kHz, envoyés par paquets de 20 ms.
- Barge-in : VAD sur le flux entrant, on coupe la lecture et on vide la file.

### Latence

Le tour de parole est découpé par le VAD, pas par un silence fixe. Groq transcrit le
segment complet, JEV choisit, l'audio préenregistré démarre. Objectif : moins de 900 ms
entre la fin de phrase et le début de la réponse.

---

## 6. La boucle d'appel

```text
audio client
  → VAD (fin de tour)
  → transcription streaming
  → JEV (état + questions = sorties du nœud courant)
  → si confiance >= seuil : message préenregistré du nœud suivant
  → sinon : message d'attente préenregistré + session Gemini Live
  → à la fin du handoff : fin d'appel ou retour à un nœud défini
```

Budget de latence visé, après la fin de phrase du client :

| Étape | Cible |
|---|---|
| Transcription finale | 250 ms |
| JEV | 150 ms |
| Démarrage de l'audio | 100 ms |
| Total sur le chemin graphe | < 600 ms |

Le handoff ajoute le temps d'ouverture de Gemini Live. Le message d'attente couvre ce délai et évite
un silence.

---

## 7. JEV

JEV ne génère pas de texte : il **choisit** parmi les sorties proposées.

Endpoint vérifié :

```text
POST https://opencode.ai/inference/systemone/v1/systemone
Authorization: Bearer public        # free, sans clé ; clé Console en production
model: jev-1.13-free
```

Entrée réelle :

```json
{
  "model": "jev-1.13-free",
  "state": "Le client vient de dire : je voudrais deux margheritas.",
  "questions": {
    "next": {
      "type": "choice",
      "instructions": "Choisis la prochaine étape de la conversation. Si aucune option ne correspond vraiment, choisis hors_flux.",
      "criteria": {
        "option_0": "Commander. Le client veut commander. Exemples : ...",
        "option_1": "Information. Le client veut une information. Exemples : ...",
        "hors_flux": "Le client dit quelque chose hors du graphe."
      }
    }
  }
}
```

Sortie réelle :

```json
{
  "answers": {
    "next": {
      "type": "choice",
      "choice": "option_0",
      "confidence": 1,
      "probabilities": { "option_0": 1, "option_1": 0, "hors_flux": 0 }
    }
  }
}
```

Le routeur fabrique les `criteria` à partir des sorties du nœud courant : la clé est
l'index de la sortie, la valeur est l'intention et ses exemples. `hors_flux` déclenche le
handoff. `confidence` et `probabilities` sont journalisées à chaque tour.

Le routeur doit être remplaçable : l'interface `route(state, transitions)` est la même pour JEV, pour
un mock local et pour un futur modèle maison.

---

## 8. Audio

- Les messages du graphe sont générés **une fois par version**, avec une voix unique.
- Format téléphonie : 8 kHz, mono, μ-law, coupé proprement.
- Les messages dynamiques (récapitulatif, prix, numéro de commande) ne peuvent pas être figés :
  - soit générés à l'appel par TTS (coût et latence),
  - soit composés à partir de fragments préenregistrés (chiffres, noms de produits),
  - soit lus par Gemini Live pendant le handoff.
- Le message d'attente est global, préenregistré, et joué avant chaque handoff.
- Barge-in : dès que le client parle, la lecture s'arrête et le tour est annulé.

---

## 9. Intégration avec le produit

L'Atelier ne stocke pas les commandes. Il appelle l'API du produit :

| Besoin | Appel |
|---|---|
| Contexte d'appel | `GET /agent/context?location=...` (menu, horaires, livraison, règles) |
| Création de commande | `POST /agent/orders` (signé, idempotent) |
| Mise à jour | `PATCH /agent/orders/:id/status` |
| Transfert humain | `POST /agent/calls/:id/transfer` |

Le produit reste la source de vérité pour le menu et les commandes. L'Atelier ne fait que publier des
programmes et journaliser des appels.

---

## 10. Données de l'Atelier

```text
flows            id, organisation_id, name, status
flow_versions    id, flow_id, version, program_json, published_at, published_by
audio_assets     id, flow_version_id, node_id, text, voice, url, duration_ms, hash
calls            id, flow_version_id, location_id, from_number, started_at, ended_at, outcome
turns            id, call_id, role, text, node_id, transition_id, confidence, latency_ms
```

L'Atelier vit dans son propre schéma. Le produit ne lit que `calls.outcome` et les commandes créées.

---

## 11. Sécurité et coûts

- Le runtime appelle le produit avec un token de service propre à l'établissement.
- Les webhooks téléphonie sont signés et rejouables sans doublon.
- Les enregistrements audio sont optionnels, chiffrés, avec durée de conservation configurable.
- Coût par appel : téléphonie + transcription + JEV + TTS des messages dynamiques + Gemini Live
  seulement en handoff.
- Objectif : plus de 80 % des appels terminés sans Gemini Live.

---

## 12. Découpage

| Étape | Livrable | Dépendances |
|---|---|---|
| 0 | Modèle de graphe, compilateur, simulateur texte, manifeste audio | aucune |
| 1 | Atelier : éditeur, versions, publication | étape 0 |
| 2 | Runtime téléphonie + transcription + messages préenregistrés | fournisseur téléphonique, ASR |
| 3 | Routeur JEV réel + trace et seuils | clé et contrat JEV |
| 4 | Handoff Gemini Live + message d'attente | clé Gemini Live |
| 5 | Intégration produit : contexte, commandes, suivi | API produit |
| 6 | Statistiques, coûts, A/B de graphes | étapes 1 à 5 |

---

## 13. Ce qui reste à trancher

1. Voix des messages préenregistrés : ElevenLabs, Gemini TTS ou autre.
2. Modèle Gemini Live exact et version de l'API AI Studio.
3. Politique sur les valeurs dynamiques : TTS à l'appel ou fragments préenregistrés.
4. Hébergement du runtime (le WebSocket doit être public et stable).
5. Budget JEV : le jeton public convient au prototypage ; en production, clé Console.
