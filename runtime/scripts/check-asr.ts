import { readFileSync } from 'node:fs'

import { mulawToPcm16 } from '../src/audio'
import { transcribe } from '../src/asr'

const file = process.argv[2]
if (!file) {
  console.error('usage: tsx scripts/check-asr.ts <fichier.ulaw>')
  process.exit(1)
}

const pcm = mulawToPcm16(readFileSync(file))
console.log('échantillons', pcm.length)
console.log(await transcribe(pcm))
