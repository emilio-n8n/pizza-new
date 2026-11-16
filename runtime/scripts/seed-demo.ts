import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { compileFlow } from '../../src/studio/engine'
import { sampleFlow } from '../../src/studio/flow'
import { config } from '../src/config'

const program = compileFlow(sampleFlow)
const root = resolve(config.dataDir, 'tenants', 'default')
mkdirSync(join(root, 'audio'), { recursive: true })

writeFileSync(
  join(root, 'program.json'),
  JSON.stringify(program, null, 2),
  'utf8',
)

writeFileSync(
  join(root, 'meta.json'),
  JSON.stringify(
    {
      name: 'Maison Luigi',
      locationId: 'demo',
    },
    null,
    2,
  ),
  'utf8',
)

console.log(`Programme ${program.flowId} v${program.version} écrit dans ${root}`)
console.log(`${program.audio.length} messages à générer avec : npm run generate`)
