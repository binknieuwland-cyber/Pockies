import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type SessionPayload,
} from './session'

export type { SessionPayload }

export async function getHuisgenotenSectionId(): Promise<number> {
  const section = await prisma.section.findFirst({ where: { name: 'Huisgenoten' } })
  if (!section) throw new Error('Sectie "Huisgenoten" niet gevonden')
  return section.id
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Comm Pockies ziet gevoelig beheeroverzicht: geen persistente cookie,
    // dus uitgelogd zodra de browser dichtgaat. Huisgenoten blijven wel
    // ingelogd (bewuste keuze voor lage drempel).
    ...(payload.role === 'COMM_POCKIES' ? {} : { maxAge: SESSION_MAX_AGE }),
  })
}

export async function destroySessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new Error('Niet ingelogd')
  return session
}

export function assertSectionAccess(sectionId: number, session: SessionPayload) {
  if (session.role === 'COMM_POCKIES') return
  if (session.role === 'HUISGENOOT' && sectionId === session.huisgenotenSectionId) return
  throw new Error('Geen toegang tot deze sectie')
}

export function requireCommPockies(session: SessionPayload) {
  if (session.role !== 'COMM_POCKIES') throw new Error('Alleen Comm Pockies heeft hier toegang')
}

// ─── Codes ──────────────────────────────────────────────────────────────────

export function generateCode(): string {
  // 6 leesbare tekens (geen 0/O/1/I om verwarring te voorkomen)
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(6)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += alphabet[bytes[i] % alphabet.length]
  }
  return code
}

export async function hashCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10)
}

export async function verifyCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash)
}
