import WebSocket from 'ws'

// Test e2e du parcours de configuration à la voix.
// 1) crée un compte de test via l'API produit (fichier db.json)
// 2) ouvre /onboarding-ws et joue la conversation en texte
// 3) vérifie que l'établissement est bien créé en base

const RUNTIME = process.env.RUNTIME_URL ?? 'ws://127.0.0.1:8080/onboarding-ws'
const APP = process.env.APP_URL ?? 'http://127.0.0.1:4001'

const script = [
  "Bonjour, je m'appelle Karim et ma pizzeria s'appelle La Casa Nova.",
  "On est au 14 rue de Charonne, 75011 Paris.",
  "Le téléphone c'est le 01 43 55 12 34, cuisine napolitaine.",
  "Alors la carte : une Margherita à 11 euros, une Regina à 13,50, une Diavola à 15 euros. Et un tiramisu à 6 euros.",
  "On est ouverts du lundi au samedi de 11h30 à 14h30 et de 18h à 23h, fermés le dimanche.",
  "Oui on livre : 3 euros de frais, minimum 15 euros, rayon 5 kilomètres, codes postaux 75011 et 75012.",
  "Oui c'est bon, enregistre.",
]

const results: string[] = []
let saved = false
let ws: WebSocket

function log(...parts: unknown[]) {
  const line = parts.map(String).join(' ')
  results.push(line)
  console.log(line)
}

async function main() {
  // -- 1. compte de test : inséré directement dans la base avec un mot de passe valide
  const { readFileSync, writeFileSync } = await import('node:fs')
  const { randomUUID, randomBytes, scryptSync } = await import('node:crypto')

  const email = `voicetest-${Date.now()}@example.com`
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync('motdepasse123', salt, 64).toString('hex')

  const dbPath = '../.data/db.json'
  const db = JSON.parse(readFileSync(dbPath, 'utf8'))
  const user = {
    id: randomUUID(),
    email,
    name: 'Karim Test',
    passwordHash: `${salt}:${hash}`,
    createdAt: new Date().toISOString(),
  }
  // lecture-modification-écriture immédiate : le serveur de dev recharge le fichier
  // entre deux requêtes, une écriture différée écraserait l'insertion.
  db.users.push(user)
  writeFileSync(dbPath, JSON.stringify(db, null, 2))
  await new Promise((r) => setTimeout(r, 400))

  log('[setup] user créé', user.id, email)

  // -- 2. conversation
  ws = new WebSocket(RUNTIME)
  ws.on('open', () => {
    log('[ws] connecté')
    ws.send(JSON.stringify({ type: 'start', sessionId: user.id, voice: 'Kore' }))
    script.forEach((text, index) => {
      setTimeout(() => {
        log('\n[client]', text)
        ws.send(JSON.stringify({ type: 'text', text }))
      }, 9000 + index * 12000)
    })
  })

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString())
    if (msg.type === 'audio') return
    if (msg.type === 'transcript') {
      log(msg.role === 'agent' ? '[aura]' : '[client]', msg.text)
      return
    }
    log('[event]', JSON.stringify(msg))
    if (msg.type === 'onboarding_saved') {
      saved = true
    }
  })

  ws.on('error', (error) => log('[ws erreur]', error.message))

  setTimeout(async () => {
    ws.close()
    // -- 3. vérification en base
    const after = JSON.parse(readFileSync('../.data/db.json', 'utf8'))
    const newUser = after.users.find((u: { email: string }) => u.email === email)
    const location = after.locations.find(
      (l: { userId?: string }) => l.userId === newUser?.id,
    )
    log('\n=== VERIFICATION ===')
    log('onboarding_saved reçu :', saved)
    if (location) {
      log('établissement :', location.name, '|', location.address, location.postalCode, location.city)
      log('téléphone :', location.phone, '| cuisine :', location.cuisine)
      log('produits :', location.menu.length, JSON.stringify(location.menu.map((m: { name: string; priceCents: number }) => `${m.name} ${m.priceCents / 100}€`)))
      log('horaires renseignés :', location.hours.length)
      log('livraison :', JSON.stringify(location.delivery))
      const ok =
        saved &&
        location.menu.length >= 3 &&
        location.name.toLowerCase().includes('casa') &&
        location.delivery.feeCents === 300
      log(ok ? 'VERDICT : PASS' : 'VERDICT : INCOMPLET')
      process.exit(ok ? 0 : 1)
    }
    log('VERDICT : ECHEC — aucun établissement créé')
    process.exit(1)
  }, 9000 + script.length * 12000 + 15000)
}

main().catch((error) => {
  console.error('erreur', error)
  process.exit(1)
})
