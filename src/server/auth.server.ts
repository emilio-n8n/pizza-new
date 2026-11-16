import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'

import type { PublicUser, SessionPayload } from '#/lib/types'

import {
  createSession,
  deleteSession,
  findLocationByUser,
  findSession,
  findUserById,
} from './store.server'

const COOKIE = 'pv_session'
const MAX_AGE = 60 * 60 * 24 * 30

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  if (candidate.length !== expected.length) return false
  return timingSafeEqual(candidate, expected)
}

export function startSession(userId: string) {
  const session = createSession(userId)
  setCookie(COOKIE, session.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  })
}

export function endSession() {
  const id = getCookie(COOKIE)
  if (id) deleteSession(id)
  deleteCookie(COOKIE, { path: '/' })
}

export function getSessionPayload(): SessionPayload | null {
  const session = findSession(getCookie(COOKIE))
  if (!session) return null

  const user = findUserById(session.userId)
  if (!user) return null

  const publicUser: PublicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
  }

  return {
    user: publicUser,
    location: findLocationByUser(user.id),
  }
}
