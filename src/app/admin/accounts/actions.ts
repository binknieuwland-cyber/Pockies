'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireSession, requireCommPockies, generateCode, hashCode, getHuisgenotenSectionId } from '@/lib/auth'

export async function addHuisgenoot(name: string, fullName: string, email: string) {
  const session = await requireSession()
  requireCommPockies(session)

  const cleanName = name.trim()
  const cleanFullName = fullName.trim()
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanName) throw new Error('Voorletters zijn verplicht')
  if (!cleanFullName) throw new Error('Volledige naam is verplicht')
  if (!cleanEmail) throw new Error('E-mailadres is verplicht')

  const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } })
  if (existingEmail) throw new Error('Dit e-mailadres heeft al een account')

  const sectionId = await getHuisgenotenSectionId()
  const last = await prisma.person.findFirst({
    where: { sectionId },
    orderBy: { sortOrder: 'desc' },
  })

  await prisma.$transaction(async (tx) => {
    const person = await tx.person.create({
      data: {
        name: cleanName,
        fullName: cleanFullName,
        sectionId,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    })
    await tx.user.create({ data: { email: cleanEmail, role: 'HUISGENOOT', personId: person.id } })
  })

  revalidatePath('/admin/accounts')
  revalidatePath(`/sections/${sectionId}`)
}

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

  await prisma.user.create({
    data: { email: cleanEmail, role: 'HUISGENOOT', personId: person.id },
  })

  revalidatePath('/admin/accounts')
  return { email: cleanEmail }
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
