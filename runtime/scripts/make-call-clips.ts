import { mkdirSync, writeFileSync } from 'node:fs'

import { synthesizeMulaw } from '../src/tts'

const clips = [
  ['mode', 'En livraison.'],
  ['address', '24 rue Oberkampf.'],
  ['menu', 'Une pizza.'],
  ['pizza', 'Margherita.'],
  ['quantity', 'Deux.'],
  ['yes', 'Oui.'],
  ['drink', 'Coca.'],
]

mkdirSync('/tmp/opencode/flow', { recursive: true })

for (const [name, text] of clips) {
  console.log('génération', name, text)
  const audio = await synthesizeMulaw(text)
  writeFileSync(`/tmp/opencode/flow/${name}.ulaw`, audio)
}

console.log('terminé')
