export type NodeKind =
  | 'start'
  | 'say'
  | 'branch'
  | 'capture'
  | 'action'
  | 'handoff'
  | 'end'

export type FlowNode = {
  id: string
  kind: NodeKind
  title: string
  text: string
  tool?: string
  slot?: string
}

export type FlowEdge = {
  id: string
  from: string
  to: string
  intent: string
  examples: string[]
}

export type Flow = {
  id: string
  name: string
  voice: string
  version: number
  nodes: FlowNode[]
  edges: FlowEdge[]
  fallback: {
    threshold: number
    bridgeText: string
  }
}

const edge = (
  from: string,
  to: string,
  intent: string,
  examples: string[],
): FlowEdge => ({
  id: `${from}__${to}__${intent.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  from,
  to,
  intent,
  examples,
})

export const sampleFlow: Flow = {
  id: 'chez-luigi',
  name: 'Chez Luigi · standard du soir',
  voice: 'sophie-fr',
  version: 4,
  fallback: {
    threshold: 0.55,
    bridgeText:
      'Veuillez patienter quelques secondes, je vérifie avec la pizzeria.',
  },
  nodes: [
    {
      id: 'greeting',
      kind: 'start',
      title: 'Accueil',
      text: 'Bonjour, bienvenue chez Luigi. Vous appelez pour commander ou pour une information ?',
    },
    {
      id: 'mode',
      kind: 'branch',
      title: 'Type de commande',
      text: "C'est pour du sur place, à emporter ou en livraison ?",
    },
    {
      id: 'address',
      kind: 'capture',
      title: 'Adresse',
      text: "Quelle est l'adresse de livraison ?",
      slot: 'address',
    },
    {
      id: 'menu',
      kind: 'branch',
      title: 'Catégorie',
      text: 'Très bien. Vous voulez une pizza, des pâtes ou une boisson ?',
    },
    {
      id: 'pasta',
      kind: 'say',
      title: 'Pas de pâtes ce soir',
      text: "Ce soir, nous ne faisons que des pizzas. Je vous montre la carte ?",
    },
    {
      id: 'pizzas',
      kind: 'say',
      title: 'Carte des pizzas',
      text: 'Nos pizzas ce soir : Margherita 12,50, Regina 13,50, Quatre fromages 14,00, Diavola 15,00.',
    },
    {
      id: 'pizza_choice',
      kind: 'branch',
      title: 'Choix de la pizza',
      text: 'Quelle pizza vous tente ?',
    },
    {
      id: 'quantity',
      kind: 'branch',
      title: 'Quantité',
      text: 'Combien de pizzas ?',
    },
    {
      id: 'drinks',
      kind: 'branch',
      title: 'Boisson',
      text: 'Avec une boisson ?',
    },
    {
      id: 'drink_choice',
      kind: 'branch',
      title: 'Choix de la boisson',
      text: 'Coca, eau ou diabolo ?',
    },
    {
      id: 'confirm',
      kind: 'branch',
      title: 'Récapitulatif',
      text: 'Je récapitule : {{order}}. On valide ?',
    },
    {
      id: 'create',
      kind: 'action',
      title: 'Créer la commande',
      text: "C'est envoyé en cuisine. Commande {{reference}}. Vous recevez le lien de suivi par SMS. À tout de suite.",
      tool: 'create_order',
    },
    {
      id: 'info',
      kind: 'say',
      title: 'Horaires et livraison',
      text: 'Nous sommes ouverts du mardi au dimanche, de 11 h 30 à 14 h 30 et de 18 h à 22 h 30. La livraison est à 2,50 €, offerte dès 30 €.',
    },
    {
      id: 'handoff',
      kind: 'handoff',
      title: 'Gemini Live',
      text: 'Veuillez patienter quelques secondes, je vérifie avec la pizzeria.',
    },
    {
      id: 'end',
      kind: 'end',
      title: 'Fin',
      text: 'Merci, à bientôt.',
    },
  ],
  edges: [
    edge('greeting', 'mode', 'Commander', [
      'je voudrais commander',
      'je veux une pizza',
      'bonsoir je commande',
      'je peux avoir deux pizzas',
      'c’est pour une commande',
      'je voudrais deux margheritas',
      'c’est pour une livraison',
      'je voudrais commander à livrer',
      'vous livrez ce soir',
      'je veux passer commande',
    ]),
    edge('greeting', 'info', 'Information', [
      'vous êtes ouverts',
      'quels sont vos horaires',
      'vous livrez',
      'combien de temps pour la livraison',
      'je peux voir le menu',
      'c’est quoi vos prix',
    ]),
    edge('greeting', 'handoff', 'Un humain', [
      'je veux parler à quelqu’un',
      'un humain',
      'le patron',
      'passez-moi la pizzeria',
    ]),

    edge('mode', 'menu', 'Sur place', [
      'sur place',
      'je mange sur place',
      'pour ici',
      'on reste',
    ]),
    edge('mode', 'menu', 'À emporter', [
      'à emporter',
      'je viens chercher',
      'take away',
      'je passe récupérer',
    ]),
    edge('mode', 'address', 'En livraison', [
      'en livraison',
      'livrez chez moi',
      'vous livrez au 11e',
      'j’habite à côté',
      'livraison',
    ]),
    edge('mode', 'handoff', 'Autre', [
      'je ne sais pas',
      'autre chose',
      'on verra',
    ]),

    edge('address', 'menu', 'Adresse notée', ['continuer']),

    edge('menu', 'pizzas', 'Pizzas', [
      'une pizza',
      'des pizzas',
      'je veux une pizza',
      'montrez-moi les pizzas',
      'la carte des pizzas',
    ]),
    edge('menu', 'pasta', 'Pâtes', [
      'des pâtes',
      'un plat de pâtes',
      'vous avez des pâtes',
      'une carbonara',
    ]),
    edge('menu', 'drinks', 'Boissons', [
      'une boisson',
      'un coca',
      'quelque chose à boire',
      'de l’eau',
    ]),
    edge('menu', 'handoff', 'Autre', [
      'je ne sais pas',
      'autre chose',
      'un dessert',
    ]),

    edge('pasta', 'pizzas', 'Voir la carte', ['oui', 'montrez-moi', 'ok']),
    edge('pizzas', 'pizza_choice', 'Carte', ['continuer']),

    edge('pizza_choice', 'quantity', 'Margherita', [
      'une margherita',
      'margherita',
      'deux margheritas',
      'la classique',
    ]),
    edge('pizza_choice', 'quantity', 'Regina', [
      'une regina',
      'regina',
      'avec du jambon',
      'celle avec les champignons',
    ]),
    edge('pizza_choice', 'quantity', 'Quatre fromages', [
      'quatre fromages',
      'une quatre fromages',
      'celle avec plusieurs fromages',
    ]),
    edge('pizza_choice', 'quantity', 'Diavola', [
      'une diavola',
      'diavola',
      'la piquante',
      'celle avec du salami',
    ]),
    edge('pizza_choice', 'handoff', 'Autre pizza', [
      'autre chose',
      'vous avez une autre pizza',
      'je ne sais pas',
    ]),

    edge('quantity', 'drinks', '1 pizza', ['une', 'une seule', 'juste une']),
    edge('quantity', 'drinks', '2 pizzas', [
      'deux',
      'deux pizzas',
      'une pour moi une pour ma femme',
      'deux margheritas',
    ]),
    edge('quantity', 'drinks', '3 pizzas', ['trois', 'trois pizzas']),
    edge('quantity', 'handoff', 'Beaucoup', [
      'beaucoup',
      'pour dix personnes',
      'un grand groupe',
    ]),

    edge('drinks', 'drink_choice', 'Avec boisson', [
      'oui',
      'avec un coca',
      'oui volontiers',
      'une boisson',
    ]),
    edge('drinks', 'confirm', 'Sans boisson', [
      'non',
      'sans boisson',
      'juste les pizzas',
      'rien à boire',
    ]),

    edge('drink_choice', 'confirm', 'Coca', ['un coca', 'coca', 'coca zéro']),
    edge('drink_choice', 'confirm', 'Eau', ['une eau', 'de l’eau', 'eau plate']),
    edge('drink_choice', 'confirm', 'Diabolo', [
      'un diabolo',
      'diabolo fraise',
      'diabolo menthe',
    ]),
    edge('drink_choice', 'handoff', 'Autre boisson', [
      'autre chose',
      'un jus',
      'de la bière',
    ]),

    edge('confirm', 'create', 'Valider', [
      'oui',
      'c’est bon',
      'je valide',
      'parfait',
      'oui c’est ça',
    ]),
    edge('confirm', 'handoff', 'Modifier', [
      'non',
      'attendez',
      'je veux changer',
      'pas tout à fait',
    ]),

    edge('create', 'end', 'Créée', ['continuer']),
    edge('info', 'end', 'Info', ['continuer']),
    edge('handoff', 'end', 'Fin', ['continuer']),
  ],
}

export const nodeKindLabel: Record<NodeKind, string> = {
  start: 'Accueil',
  say: 'Message',
  branch: 'Question',
  capture: 'Saisie',
  action: 'Action',
  handoff: 'Handoff',
  end: 'Fin',
}
