'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireSession, requireCommPockies, generateCode, hashCode } from '@/lib/auth'

export async function createAccount(personId: number, email: string) {
  const session = await requireSession()
  requireCommPockies(session)

  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) throw new Error('E-mailadres is verplicht')

  const person = await prisma.person.findUniqueOrThrow({ where: { id: personId } })

  const existing = await prisma.user.findFirst({
    where: { OR: [{ personId }, { email: cleanEmail }] },
  })
  if (existing) throw new Error('Deze persoon of dit e-mailadres heeft al een account')

  const code = generateCode()
  const codeHash = await hashCode(code)

  await prisma.user.create({
    data: { email: cleanEmail, codeHash, role: 'HUISGENOOT', personId: person.id },
  })

  revalidatePath('/admin/accounts')
  return { email: cleanEmail, code }
}

export async function regenerateCode(userId: number) {
  const session = await requireSession()
  requireCommPockies(session)

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  const code = generateCode()
  const codeHash = await hashCode(code)
  await prisma.user.update({ where: { id: userId }, data: { codeHash } })

  revalidatePath('/admin/accounts')
  return { email: user.email, code }
}
