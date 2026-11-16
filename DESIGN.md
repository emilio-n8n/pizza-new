# PizzaVoice, design system V2

> Statut : direction proposée, à valider avant le développement des écrans.
> Portée : site marketing FR/EN, application (commandes, menu, réglages, équipe, livreurs, statistiques), suivi client, back-office plateforme.
> Concept directeur : **le carnet de commandes**.

---

## 01. Positionnement

PizzaVoice est le standard téléphonique des pizzerias indépendantes et des petites chaînes. Il répond aux appels pendant le service, prend la commande, l'envoie en cuisine et tient le livreur informé. L'interface doit inspirer la même chose que le produit : de l'ordre au milieu du rush.

Trois idées guident tout le design :

1. **La voix devient un ticket.** Chaque écran montre la transformation d'un appel en commande lisible.
2. **Le calme opérationnel.** Beaucoup de données, peu de bruit. Des filets, des tampons, des chiffres nets.
3. **La matière.** Papier chaud, encre, tomate, basilic. Des surfaces solides, pas de effets lumineux.

Ce que le site ne doit jamais évoquer : une startup IA générique, un dashboard SaaS interchangeable, une démo de robot.

---

## 02. Les trois décisions qui définissent l'identité

| Décision | Choix | Pourquoi |
|---|---|---|
| Couleur | Tomate `#C43D24` sur papier chaud `#F7F1E6` | Une couleur de produit alimentaire, pas la couleur par défaut des outils IA. |
| Typographie | Fraunces pour le display, Archivo pour l'interface, IBM Plex Mono pour les données | Un contraste éditorial fort, lisible en cuisine, loin d'Inter et Geist. |
| Layout | Hero asymétrique avec un ticket de commande qui se remplit | On montre le produit au lieu de décrire trois fonctionnalités. |

---

## 03. Nom et signature

**Nom de travail : PizzaVoice.** On retire le « AI » du wordmark. Le nom reste reconnaissable pour les chaînes déjà en discussion, et le mot « AI » n'apporte plus rien en 2026.

**Signature courte :**

- FR : « Le standard des pizzerias. »
- EN : « The pizzeria phone standard. »

**Signature longue :**

- FR : « Chaque appel devient une commande. »
- EN : « Every call becomes an order. »

**Baseline produit :**

- FR : « Répond, prend la commande, envoie en cuisine. »
- EN : « Answers, takes the order, sends it to the kitchen. »

Le nom peut être changé plus tard. Toute la structure de marque est prévue pour être remplacée sans toucher aux composants.

---

## 04. Logo et favicon

**Wordmark :** « PizzaVoice » en Fraunces 600, interlettrage `-0.02em`, couleur encre. Pas d'italique, pas de dégradé.

**Descripteur :** « LE STANDARD DES PIZZERIAS » en Archivo 600, 10 px, interlettrage `0.18em`, majuscules, couleur mutée.

**Marque :** un ticket rectangle avec deux encoches et une onde sonore à l'intérieur. Dessiné en SVG, trait 1,5 px, sans dégradé. Le ticket rappelle la commande, l'onde rappelle la voix. Pas de part de pizza, pas de robot, pas de téléphone vintage.

**Favicon :** le ticket seul, en tomate sur papier. Déclinaisons 32, 180 et 512 px. Pas de favicon par défaut.

**Zone de protection :** la hauteur du « P » du wordmark tout autour. Taille minimale : 96 px de large pour le wordmark complet, 24 px pour la marque seule.

---

## 05. Couleurs

### Tokens sémantiques, thème clair

| Token | Valeur | Usage |
|---|---|---|
| `--background` | `#F7F1E6` | Fond général, papier chaud |
| `--foreground` | `#1C1917` | Texte principal, encre |
| `--card` | `#FFFCF5` | Cartes, tickets, surfaces élevées |
| `--card-foreground` | `#1C1917` | Texte sur carte |
| `--muted` | `#EDE3D2` | Fonds secondaires, survol de ligne |
| `--muted-foreground` | `#6B6156` | Texte secondaire, métadonnées |
| `--primary` | `#C43D24` | Tomate, action principale, statut nouveau |
| `--primary-foreground` | `#FFF8F0` | Texte sur tomate |
| `--secondary` | `#2E5B3E` | Basilic, succès, statut prêt |
| `--secondary-foreground` | `#F4F8F2` | Texte sur basilic |
| `--accent` | `#E7B34A` | Semoule, préparation, points d'attention |
| `--accent-foreground` | `#2A2113` | Texte sur semoule |
| `--destructive` | `#A92E22` | Erreur, annulation |
| `--destructive-foreground` | `#FFF8F0` | Texte sur erreur |
| `--success` | `#2F7A4F` | Confirmation |
| `--warning` | `#A86400` | Avertissement |
| `--info` | `#2F5D7C` | Livraison, information |
| `--border` | `#D9CDBA` | Filets, bordures |
| `--input` | `#D9CDBA` | Bordure de champ |
| `--ring` | `#C43D24` | Anneau de focus |
| `--sidebar` | `#1C1917` | Fond de la navigation produit |
| `--sidebar-foreground` | `#F7F1E6` | Texte de la navigation |
| `--sidebar-muted` | `#A79C8D` | Texte secondaire de la navigation |
| `--sidebar-active` | `#C43D24` | Indicateur actif |

### Tokens sémantiques, thème sombre

| Token | Valeur |
|---|---|
| `--background` | `#151210` |
| `--foreground` | `#F4EDE1` |
| `--card` | `#1E1A16` |
| `--card-foreground` | `#F4EDE1` |
| `--muted` | `#2A241E` |
| `--muted-foreground` | `#A79C8D` |
| `--primary` | `#E4634A` |
| `--primary-foreground` | `#1C1210` |
| `--secondary` | `#6FA37F` |
| `--secondary-foreground` | `#101A13` |
| `--accent` | `#E7B34A` |
| `--accent-foreground` | `#2A2113` |
| `--destructive` | `#E05A4A` |
| `--destructive-foreground` | `#1C1210` |
| `--success` | `#6FBF8B` |
| `--warning` | `#E0A34A` |
| `--info` | `#7FB0CF` |
| `--border` | `#3A3229` |
| `--input` | `#3A3229` |
| `--ring` | `#E4634A` |
| `--sidebar` | `#0F0D0B` |
| `--sidebar-foreground` | `#F4EDE1` |
| `--sidebar-muted` | `#8C8174` |
| `--sidebar-active` | `#E4634A` |

### Règles d'usage

- Le tomate est réservé à l'action principale, au statut « nouvelle » et aux accents de marque. Il ne colore pas toutes les cartes.
- Le basilic signale le succès et le statut « prête ». Jamais en décoration.
- La semoule signale la préparation et les avertissements doux. Jamais pour une erreur bloquante.
- Un statut n'est jamais porté par la couleur seule : un libellé texte l'accompagne toujours.
- Les couleurs de graphiques sont : tomate, basilic, semoule, encre, bleu information, gris chaud. Pas de dégradé.

### Contrastes

Tous les couples texte/fond respectent WCAG 2.2 AA. Les couples critiques :

- Encre `#1C1917` sur papier `#F7F1E6` : 14,4:1.
- Blanc chaud `#FFF8F0` sur tomate `#C43D24` : 5,2:1.
- Texte secondaire `#6B6156` sur papier `#F7F1E6` : 5,4:1.
- Papier `#F4EDE1` sur fond sombre `#151210` : 13,8:1.

Le tomate n'est jamais utilisé pour du texte de moins de 16 px sur papier sans vérification.

---

## 06. Typographie

### Familles

| Rôle | Famille | Graisses | Détails |
|---|---|---|---|
| Display | **Fraunces** variable | 400, 500, 600, 700 | `font-optical-sizing: auto`, `SOFT 30`, `WONK 0` |
| Interface et corps | **Archivo** variable | 400, 500, 600, 700 | Très lisible en petite taille, tabulaire pour les chiffres |
| Données | **IBM Plex Mono** | 400, 500 | IDs, heures, téléphones, totaux, codes opérateurs |

Les polices sont auto-hébergées en WOFF2, sous-ensemble latin, `font-display: swap`. Pas de Google Fonts en production.

### Échelle

| Style | Taille desktop | Taille mobile | Interligne | Interlettrage | Usage |
|---|---|---|---|---|---|
| Display XL | 88 px | 44 px | 0,92 | -0,035em | Hero marketing |
| Display | 64 px | 38 px | 0,96 | -0,03em | Titres de section forts |
| H1 | 48 px | 32 px | 1,02 | -0,02em | Titre de page produit |
| H2 | 36 px | 28 px | 1,08 | -0,02em | Sections |
| H3 | 28 px | 22 px | 1,15 | -0,01em | Sous-sections |
| H4 | 22 px | 19 px | 1,25 | 0 | Cartes, blocs |
| Body large | 18 px | 17 px | 1,55 | 0 | Intro, lede |
| Body | 16 px | 16 px | 1,55 | 0 | Texte courant |
| Small | 14 px | 14 px | 1,45 | 0 | Labels, aides |
| Caption | 12 px | 12 px | 1,4 | 0,01em | Métadonnées |
| Mono | 13 px | 13 px | 1,4 | 0,02em | IDs, temps, prix |
| Eyebrow | 11 px | 11 px | 1,2 | 0,12em | Sur-titres, majuscules |

### Règles

- Un seul niveau de display par page.
- Pas de titre en dégradé, pas de mot en italique dans un titre pour « ajouter de l'émotion ».
- Les prix et les totaux utilisent Archivo avec `font-variant-numeric: tabular-nums`.
- Les IDs et les heures utilisent Plex Mono.
- Les paragraphes marketing ne dépassent pas 65 caractères par ligne.

---

## 07. Espacement, grille, rayons, élévation

### Espacement

Base de 4 px : 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

- Padding de section marketing : 128 px en haut et en bas sur desktop, 64 px sur mobile.
- Gouttière de grille : 24 px.
- Écart entre un titre et son texte : 16 px.
- Écart entre un texte et une action : 24 px.
- Écart entre deux blocs d'une même section : 48 px.

### Grille

- Largeur maximale : 1240 px.
- 12 colonnes sur desktop, 8 sur tablette, 4 sur mobile.
- Hero : 7 colonnes de texte, 5 colonnes de ticket.
- Produit : 80 px de numéro, puis deux colonnes égales.
- Application : sidebar 232 px, contenu fluide, panneau de détail 320 px.

### Rayons

| Élément | Rayon |
|---|---|
| Badge, tampon | 4 px |
| Bouton, champ, onglet | 6 px |
| Carte, ticket, fenêtre | 10 px |
| Cadre de téléphone | 32 px |
| Pastille | 999 px |

Pas de `rounded-2xl` ou `rounded-3xl` partout. Un seul système.

### Élévation

- Les cartes et les tableaux sont plats. Bordure 1 px, pas d'ombre.
- Les tickets et les fenêtres flottantes ont une ombre chaude : `0 24px 60px rgba(28, 25, 23, 0.10)`.
- Les menus et dialogues ont : `0 16px 40px rgba(28, 25, 23, 0.12), 0 2px 8px rgba(28, 25, 23, 0.06)`.
- Pas de glow, pas de bordure lumineuse, pas de verre.

---

## 08. Iconographie

- Jeu maison de 16 icônes, trait 1,5 px, extrémités arrondies, grille 20 px.
- Icônes fonctionnelles : téléphone, ticket, flamme, scooter, graphique, utilisateurs, réglages, plus, recherche, cloche, flèche, coche, horloge, épingle, imprimante, chevron.
- Les icônes ne remplacent jamais un libellé dans une action importante.
- Pas d'emoji dans les titres. Pas d'icône « sparkles » pour dire IA.
- Sur le marketing, peu d'icônes. Les artefacts produit remplacent les icônes de fonctionnalité.

---

## 09. Composants

### Boutons

| Variante | Fond | Texte | Bordure | Usage |
|---|---|---|---|---|
| Primaire | `--primary` | `--primary-foreground` | 1 px `--primary` | Une seule action principale par écran |
| Secondaire | transparent | `--foreground` | 1 px `--border` | Actions de support |
| Fantôme | transparent | `--foreground` | aucune | Navigation, actions discrètes |
| Danger | `--destructive` | `--destructive-foreground` | 1 px `--destructive` | Suppression, annulation |
| Icône | transparent | `--muted-foreground` | aucune | Barre d'outils, lignes de tableau |

Hauteur : 40 px, 44 px sur mobile. Padding horizontal : 16 px. Texte 14 px, poids 600. Focus : anneau 2 px `--ring` avec décalage 2 px. Survol : changement de couleur uniquement, pas de mise à l'échelle.

### Champs

- Hauteur 40 px, rayon 6 px, bordure 1 px `--input`, fond `--card`.
- Label au-dessus, 13 px, poids 600. Aide en 12 px, couleur mutée.
- Erreur : bordure `--destructive`, message 12 px sous le champ, icône texte.
- Focus : bordure `--ring`, anneau `color-mix(in srgb, var(--ring) 24%, transparent)`.
- Pas de placeholder comme label.

### Cartes

- Fond `--card`, bordure 1 px `--border`, rayon 10 px, padding 20 ou 24 px.
- Pas d'ombre par défaut.
- Une carte peut avoir un en-tête avec filet, un corps et un pied. Pas de bordure colorée sur toutes les cartes.

### Tampons de statut

Un composant signature : petit rectangle à bordure 1,5 px, texte mono 10 px, majuscules, interlettrage `0.08em`, rotation `-2deg` pour les états forts (nouvelle, prête, livrée). Les états courants restent droits.

Couleurs :

- Nouvelle : tomate.
- En préparation : semoule.
- Prête : basilic.
- En livraison : bleu information.
- Livrée : basilic, fond plein.
- Annulée : gris muté, texte barré.

### Ticket

Le composant central du produit.

- Fond `--card`, bordure 1 px, rayon 10 px, ombre chaude.
- En-tête avec méta mono : `APPEL ENTRANT`, heure, durée.
- Séparateur pointillé.
- Lignes d'articles avec quantité, nom, prix. Les modificateurs sont en retrait, 12 px, couleur mutée.
- Total en bas, bordure pleine, chiffres tabulaires.
- Tampon de statut en bas à droite.
- Version imprimable 80 mm : noir sur blanc, mono, pas de couleur, logo 12 px.

### Carte tarifaire

- Une seule carte par page, fond `--card`, bordure 1 px, ombre chaude.
- Prix en Fraunces 600, 56 px, chiffres tabulaires. La mention « HT » est en 12 px, à côté du total.
- Sélecteur de parc : boutons − et +, champ mono 52 px, total recalculé à chaque changement.
- Grille dégressive en tableau, ligne active surlignée tomate à 7 %.
- Une seule action : « Créer mon établissement ». Pas de colonne entreprise, pas de « nous contacter ».

### Tableaux

- En-tête mono 10 px, majuscules, couleur mutée, bordure basse.
- Lignes 44 à 52 px, bordure basse, survol `--muted`.
- Colonnes de chiffres alignées à droite, tabulaires.
- actions à droite, visibles au survol et toujours accessibles au clavier.
- Sur mobile, les lignes deviennent des cartes avec libellés.

### Onglets

- Onglets texte avec indicateur 2 px `--primary` en bas. Pas de pastilles pleines.
- Compteur en mono, 11 px, couleur mutée.

### Notifications

- Toast en bas à droite, carte, bordure gauche 3 px `--primary`, ombre, 4 secondes.
- Nouvelle commande : son court, toast persistant jusqu'à action, badge dans l'onglet.
- Erreur : bordure `--destructive`, message court, action « Réessayer ».

### Dialogues

- Fond `--card`, rayon 10 px, ombre, largeur max 560 px.
- Titre H3, corps 16 px, actions alignées à droite.
- Fermeture au clavier, focus piégé, retour du focus à l'élément déclencheur.

### États vides

- Bordure pointillée 1 px, fond transparent, padding 32 px, texte centré.
- Une phrase utile et une action. Pas d'illustration décorative.
- Exemple : « Aucune commande pour l'instant. Le standard est prêt. »

---

## 10. Visualisation de données

- Graphiques en barres ou en lignes, jamais en camembert pour des séries temporelles.
- Couleurs : tomate pour les commandes, basilic pour le chiffre d'affaires, semoule pour les appels manqués, bleu pour la livraison.
- Grille horizontale fine, labels en mono 11 px.
- Pas de dégradé sous la courbe. Pas de donut.
- Les axes ont une unité lisible. Les tooltips sont des cartes, pas des infobulles noires.
- Les chiffres réels sont datés et sourcés. Aucun compteur animé.

---

## 11. Imagerie

**Direction :** photo documentaire, lumière chaude, matière réelle. Des mains, de la farine, un four, un comptoir, un scooter. Pas de studio blanc, pas de 3D, pas de néon, pas de visage de stock.

**Cadrages :** 4:3 pour les scènes, 3:4 pour les portraits de mains, 16:9 pour les bandes. Les images sont des WebP optimisés, largeur maximale 1600 px, `loading="lazy"` sauf le hero.

**Usage :**

- Problème : mains dans la pâte, 3:4.
- Bande milieu de page : four à bois, 16:9, overlay encre à 70 % pour le texte.
- Installation : comptoir avec téléphone et carnet, 4:3.
- Livreur : scooter au crépuscule, 16:9.
- Menu : pizza margherita, 4:3.
- Tarifs ou contact : ingrédients, 1:1, en petite surface.

**Prompts Krea :** documentés dans `design/ASSETS.md`. Aucun texte, logo ou panneau lisible dans les images. Si une image contient du texte généré, elle est rejetée.

**Texte sur image :** uniquement sur la bande four, avec un overlay solide. Jamais de texte sur une photo claire sans garantie de contraste.

---

## 12. Motion

- Durées : 150 ms pour les micro-interactions, 220 ms pour les panneaux, 320 ms pour les dialogues.
- Courbe : `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Survol : couleur et bordure, pas de `scale`, pas de `translateY` sur toutes les cartes.
- Apparition : contenu visible au chargement. Pas de `whileInView` sur chaque section.
- Pouls : uniquement pour un appel en cours ou une commande nouvelle, 2 s, désactivé avec `prefers-reduced-motion`.
- Transition de statut : le tampon se pose en 180 ms, sans rebond.

---

## 13. Voix et ton

### Français

- Vouvoiement. Phrases courtes. Verbes concrets.
- On parle du « standard », de « la commande », de « la cuisine », du « livreur ».
- On ne dit pas « solution innovante », « boostez », « révolutionnez », « sans effort ».
- On ne promet pas de chiffre non mesuré.
- Exemple : « Le téléphone sonne pendant le service. PizzaVoice répond, prend la commande et l'envoie en cuisine. »

### Anglais

- Direct, no hype. « Every call becomes an order. »
- Pas de « AI-powered », « seamless », « unleash ».
- Exemple : « Your pizzeria always picks up. »

### Microcopie

- Bouton principal : « Créer mon établissement », « Démarrer l'essai », « Enregistrer ».
- Jamais « Demander un devis », « Parler à un commercial » ou « Contacter les ventes » : l'accès au produit est autonome.
- Erreur : ce qui s'est passé, puis quoi faire. « Ce numéro est déjà utilisé. Connectez-vous ou utilisez un autre numéro. »
- Vide : « Aucune commande pour l'instant. Le standard est prêt. »
- Confirmation : « Commande envoyée en cuisine. » Pas de « Succès ! ».

### Règles

- Pas de tiret cadratin dans le contenu.
- Pas d'emoji dans les titres.
- Pas de « ce n'est pas X, c'est Y ».
- Pas de faux témoignage, faux compteur, faux logo client.
- Les liens du footer mènent tous à une page réelle.

---

## 14. Blueprints des pages

### Site marketing

1. **Accueil** : navigation, hero avec ticket, bande de flux, problème, ledger produit (appel, commande, cuisine, livreur, pilotage), bande four, chaînes, installation, résultats, tarifs, FAQ, contact, footer.
2. **Produit** : les cinq étapes en détail, captures réelles, simulateur.
3. **Chaînes** : vue multi-établissements, rôles, statistiques agrégées.
4. **Tarifs** : une offre par établissement, grille dégressive publique, sélecteur de parc avec total en direct, FAQ.
5. **Contact** : formulaire de support et coordonnées, jamais une condition d'accès au produit.
6. **Légal** : mentions légales, confidentialité, CGU, cookies, DPA.

### Tarifs et facturation

- Modèle : abonnement mensuel par établissement, appels illimités, aucune commission sur les commandes, aucun frais par appel.
- Essai de 14 jours sans carte bancaire, puis prélèvement mensuel automatique et facture disponible dans le compte.
- Grille de lancement, HT : 79 € pour une adresse, 69 € de 2 à 4 adresses, 59 € de 5 à 9, 49 € à partir de 10. Le prix est par établissement et par mois.
- La page tarifs montre une seule carte avec le total du parc, un sélecteur d'établissements, la grille dégressive en tableau et la liste des inclusions. Le total se recalcule à la volée.
- Souscription et paiement autonomes via Stripe. Ajout ou retrait d'un établissement depuis le compte, prorata sur la facture suivante.
- Interdits : « Le plus populaire », prix barré factice, « nous contacter pour le prix », offre entreprise sans prix, formulaire de devis.
- Les prix sont affichés HT et la mention « HT » accompagne toujours le montant.

### Authentification

- Écran divisé : formulaire à gauche, image ou citation à droite.
- Inscription, vérification email, connexion, mot de passe oublié, invitation d'équipe.
- Pas de connexion sociale au lancement.

### Onboarding

- Inscription autonome : email, mot de passe, nom de la pizzeria. Aucun appel commercial, aucun devis.
- Une tâche par écran, progression visible, sauvegarde et reprise à l'étape en cours.
- Étapes : établissement, carte, horaires et livraison, téléphone et transfert, activation.
- La carte se colle en texte libre (une ligne par produit) ou s'ajoute ligne par ligne. Chaque prix est relu avant publication.
- Le numéro de test est affiché, les codes de transfert sont donnés par opérateur, et l'activation est immédiate.
- Après activation, le gérant arrive sur le tableau de bord, pas sur une page d'attente.

### Application

- **Vue d'ensemble** : chiffres du jour, commandes récentes, appels, alertes.
- **Commandes** : onglets par statut, tableau, panneau de détail, ticket imprimable, notification temps réel.
- **Menu** : catégories, tableau, édition en ligne, import, disponibilité.
- **Établissements** : liste, statut, agent, menu, horaires, duplication.
- **Équipe** : membres, rôles, invitations.
- **Livreurs** : liens, statut, courses.
- **Statistiques** : appels, commandes, chiffre d'affaires, panier moyen, pics.
- **Réglages** : organisation, établissement, agent, clés API, facturation.

### Suivi client

- Mobile first. Statut en haut, timeline, articles, total, contact pizzeria.
- Token opaque, page `noindex`, aucune donnée personnelle inutile.

### Livreur

- Mobile first. Deux onglets : disponibles, en cours. Carte de course, adresse, téléphone, GPS, action principale.
- Lien magique, session courte, révocation.

### Back-office plateforme

- Organisations, établissements, statut, numéro d'agent, checklist d'activation, journal d'audit.
- Rôles plateforme séparés des rôles d'organisation.

---

## 15. Responsive

| Breakpoint | Largeur | Comportement |
|---|---|---|
| Mobile | < 640 px | 1 colonne, navigation en feuille, tableaux en cartes, boutons 44 px |
| Tablette | 640 à 899 px | 8 colonnes, hero empilé, sidebar en icônes |
| Desktop | 900 à 1199 px | 12 colonnes, sidebar 232 px, panneau détail 320 px |
| Large | 1200 px et plus | Largeur max 1240 px, marges généreuses |

- Les images ne dépassent jamais leur colonne.
- Les tableaux larges ont un conteneur `overflow-x: auto` avec ombre de fin.
- Le panneau de détail devient une feuille plein écran sous 900 px.
- La navigation produit devient une barre inférieure sous 900 px.
- Aucun texte sous 12 px.

---

## 16. Accessibilité

- Cible WCAG 2.2 AA.
- Contraste vérifié pour chaque token.
- Focus visible sur tous les éléments interactifs.
- Navigation clavier complète, ordre logique, lien d'évitement.
- Labels explicites, erreurs reliées au champ, `aria-describedby`.
- Statuts annoncés en texte, pas seulement en couleur.
- `prefers-reduced-motion` respecté.
- Langue déclarée sur chaque page, `lang="fr"` ou `lang="en"`.
- Images avec alt utile, images décoratives avec alt vide.
- Cibles tactiles de 44 px minimum.

---

## 17. Anti-patterns

À ne jamais introduire :

- Violet ou indigo, dégradé sur fond noir.
- Texte en dégradé.
- Glassmorphism, `backdrop-blur` décoratif.
- Blobs flous, grille de points, grain sur dégradé.
- Bento grid sans raison de contenu.
- Trois cartes de fonctionnalités identiques.
- Ombre sur chaque carte, coins arrondis à 24 px partout.
- Inter, Geist, Space Grotesk.
- Instrument Serif en italique dans un titre.
- Emoji dans les titres, icône « sparkles » pour l'IA.
- Compteurs animés, faux témoignages, faux logos clients.
- Trois paliers de prix avec « Le plus populaire ».
- Thème clair/sombre dans le header marketing.
- Liens `href="#"`, favicon par défaut, page sans OG image.
- Pages légales absentes.
- Admin côté client, clé service role dans le bundle, webhook ouvert.
- `localStorage` pour l'autorisation.

---

## 18. Implémentation

- TanStack Start (React 19, Vite) avec routage par fichiers dans `src/routes`.
- Tailwind v4 avec les tokens dans `src/styles.css`, bloc `@theme`.
- Composants shadcn/ui adaptés, jamais utilisés avec leurs couleurs par défaut.
- Structure : `src/components/ui`, `src/components/marketing`, `src/features/*`.
- Grille tarifaire et fonctions de calcul dans `src/data/pricing.ts`. Aucun prix écrit à la main dans un composant.
- Polices auto-hébergées : `@fontsource-variable/fraunces`, `@fontsource-variable/archivo`, `@fontsource/ibm-plex-mono`.
- Images dans `public/images`, WebP et AVIF, dimensions explicites.
- Aucun token codé en dur dans les composants. Uniquement `bg-background`, `text-foreground`, `border-border`, etc.
- Le thème sombre suit le système, avec un réglage dans les paramètres de l'application. Pas de toggle dans le header marketing.
- Abonnements : Stripe Checkout pour la souscription, Customer Portal pour la gestion, webhooks côté serveur. Aucun prix ni droit d'accès calculé dans le client.
- CI GitHub Actions : `npm ci`, `npm run typecheck`, `npm run build` à chaque push et pull request.
- `DESIGN.md` est la source de vérité. Toute nouvelle couleur ou taille doit y être ajoutée avant usage.

---

## 19. Ce qui reste à valider

1. Le nom PizzaVoice sans « AI ».
2. La palette tomate, papier, basilic, semoule.
3. Le couple Fraunces et Archivo.
4. Le hero avec ticket plutôt qu'un mockup de téléphone.
5. Le ton bilingue et la promesse « Chaque appel devient une commande ».
6. Les tarifs de lancement (79 € par mois et par établissement, dégressif) et les conditions d'essai.
7. Les informations légales de la société.
