/**
 * URL du runtime vocal, quel que soit l'hébergement.
 *
 * En local (ou derrière un tunnel unique), le runtime est proxifié sur le même
 * hôte que l'app : on retombe sur l'origine du navigateur. En production
 * séparée (Vercel + Render), `VITE_RUNTIME_WS_URL` porte l'adresse complète du
 * runtime et on remplace le chemin pour viser le bon point d'entrée.
 *
 * La variable est inlinée au build par Vite : elle doit être fournie à la
 * commande `npm run build`, pas seulement dans le tableau de bord.
 */
export function runtimeWsUrl(path: string): string {
  const configured = (import.meta.env.VITE_RUNTIME_WS_URL as string | undefined)?.trim()

  if (configured) {
    try {
      const url = new URL(configured)
      url.pathname = path
      url.search = ''
      url.hash = ''
      return url.toString()
    } catch {
      // Valeur malformée : on ignore et on retombe sur l'hôte courant.
    }
  }

  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${scheme}://${window.location.host}${path}`
}
