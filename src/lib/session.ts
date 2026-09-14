// Edge-safe: alleen `jose`, geen Prisma/bcrypt/next-headers hier — dit bestand
// wordt ook door middleware.ts (Edge runtime) geïmporteerd.
import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'vs42_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 dagen

export interface SessionPayload {
  userId: number
  role: 'COMM_POCKIES' | 'HUISGENOOT'
  personId: number | null
  huisgenotenSectionId: number
}

function secretKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET ontbreekt in de environment variables')
  return new TextEncoder().encode(secret)
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey())
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
