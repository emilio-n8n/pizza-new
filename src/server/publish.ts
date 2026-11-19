import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { createServerFn } from '@tanstack/react-start'

import { getSessionPayload } from './auth.server'

type PublishInput = {
  tenant: string
  name: string
  program: unknown
}

function admins() {
  return (process.env.ATELIER_ADMINS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export const publishFlowFn = createServerFn({ method: 'POST' })
  .validator((data: PublishInput) => data)
  .handler(async ({ data }) => {
    const allowed = admins()
    if (allowed.length > 0) {
      const session = await getSessionPayload()
      if (!session || !allowed.includes(session.user.email.toLowerCase())) {
        return { ok: false as const, error: 'Accès Atelier non autorisé.' }
      }
    }

    const tenant = data.tenant.replace(/[^0-9a-zA-Z_-]/g, '') || 'default'
    const root = resolve(
      process.env.RUNTIME_DATA_DIR ?? 'runtime/data',
      'tenants',
      tenant,
    )

    mkdirSync(join(root, 'audio'), { recursive: true })
    writeFileSync(
      join(root, 'program.json'),
      JSON.stringify(data.program, null, 2),
      'utf8',
    )
    writeFileSync(
      join(root, 'meta.json'),
      JSON.stringify({ name: data.name }, null, 2),
      'utf8',
    )

    return { ok: true as const, path: root }
  })
