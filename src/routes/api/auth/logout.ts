import { createFileRoute } from '@tanstack/react-router'
import { deleteCookie, getCookie } from '@tanstack/react-start/server'

import { deleteSession } from '#/server/store.server'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: async () => {
        const id = getCookie('pv_session')
        if (id) {
          try {
            await deleteSession(id)
          } catch (error) {
            console.error('[logout]', error)
          }
        }
        deleteCookie('pv_session', { path: '/' })
        return Response.json({ ok: true })
      },
    },
  },
})
