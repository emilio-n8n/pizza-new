import { writeFileSync } from 'node:fs'

import { synthesizeMulaw } from '../src/tts'

const text = process.argv[2]
const out = process.argv[3]
if (!text || !out) {
  console.error('usage: tsx scripts/make-clip.ts "<texte>" <sortie.ulaw>')
  process.exit(1)
}

writeFileSync(out, await synthesizeMulaw(text))
console.log('écrit', out)
