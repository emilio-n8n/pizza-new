import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { config, requireKey } from '../src/config'
import { audioPath, bridgePath, loadTenant } from '../src/program'
import { FALLBACK_TEXT } from '../src/slots'
import { synthesizeMulaw } from '../src/tts'

const tenantId = process.argv[2] ?? 'default'
const tenant = loadTenant(tenantId)

if (!tenant) {
  console.error(`Tenant introuvable : ${tenantId}. Lance npm run seed.`)
  process.exit(1)
}

requireKey('geminiKey')
console.log(
  `Génération pour ${tenant.program.flowId} v${tenant.program.version} · voix ${config.ttsVoice}`,
)

let generated = 0
let skipped = 0

for (const asset of tenant.program.audio) {
  const path = audioPath(tenant, asset.key)
  if (existsSync(path)) {
    skipped += 1
    continue
  }

  console.log(`→ ${asset.key} (${asset.characters ?? asset.text.length} car.)`)
  const audio = await synthesizeMulaw(asset.text)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, audio)
  generated += 1
}

const bridge = bridgePath(tenant)
if (!existsSync(bridge)) {
  console.log('→ message d’attente')
  const audio = await synthesizeMulaw(tenant.program.fallback.bridgeText)
  mkdirSync(dirname(bridge), { recursive: true })
  writeFileSync(bridge, audio)
  generated += 1
} else {
  skipped += 1
}

for (const [nodeId, text] of Object.entries(FALLBACK_TEXT)) {
  const path = audioPath(tenant, `fallbacks/${nodeId}`)
  if (existsSync(path)) {
    skipped += 1
    continue
  }
  console.log(`→ fallback ${nodeId}`)
  const audio = await synthesizeMulaw(text)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, audio)
  generated += 1
}

console.log(`Terminé : ${generated} générés, ${skipped} déjà présents.`)
