import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { config } from './config'

export type ProgramTransition = {
  id: string
  to: string
  intent: string
  examples: string[]
}

export type ProgramState = {
  id: string
  kind: 'start' | 'say' | 'branch' | 'capture' | 'action' | 'handoff' | 'end'
  say: string
  audio: string
  slot?: string
  tool?: string
  transitions: ProgramTransition[]
}

export type Program = {
  flowId: string
  version: number
  voice: string
  states: Record<string, ProgramState>
  audio: Array<{
    key: string
    nodeId: string
    text: string
    voice: string
    characters?: number
  }>
  fallback: {
    threshold: number
    bridgeText: string
    bridgeAudio: string
  }
}

export type Tenant = {
  id: string
  name: string
  program: Program
  audioDir: string
  locationId?: string
}

function tenantRoot(id: string) {
  return resolve(config.dataDir, 'tenants', id)
}

export function tenantExists(id: string) {
  return existsSync(join(tenantRoot(id), 'program.json'))
}

export function loadTenant(id: string): Tenant | null {
  const clean = id.replace(/[^0-9a-zA-Z_-]/g, '')
  const candidates = [clean, 'default']

  for (const candidate of candidates) {
    const root = tenantRoot(candidate)
    const programFile = join(root, 'program.json')
    if (!existsSync(programFile)) continue

    const program = JSON.parse(readFileSync(programFile, 'utf8')) as Program
    let name = 'PizzaVoice'
    let locationId: string | undefined

    const metaFile = join(root, 'meta.json')
    if (existsSync(metaFile)) {
      try {
        const meta = JSON.parse(readFileSync(metaFile, 'utf8')) as {
          name?: string
          locationId?: string
        }
        name = meta.name ?? name
        locationId = meta.locationId
      } catch {
        // ignore broken meta
      }
    }

    return {
      id: candidate,
      name,
      program,
      audioDir: join(root, 'audio'),
      locationId,
    }
  }

  return null
}

export function audioPath(tenant: Tenant, key: string) {
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, '_')
  return join(tenant.audioDir, `${safe}.ulaw`)
}

export function bridgePath(tenant: Tenant) {
  return audioPath(tenant, tenant.program.fallback.bridgeAudio)
}

export function listTenants() {
  return ['default']
}
