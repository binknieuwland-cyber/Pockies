'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createSessionCookie, destroySessionCookie, verifyCode } from '@/lib/auth'

export async function login(email: string, code: string) {
  const cleanEmail = email.trim().toLowerCase()
  const cleanCode = code.trim()

  if (!cleanEmail || !cleanCode) {
    throw new Error('Vul e-mail en code in')
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } })
  if (!user || !user.codeHash) {
    throw new Error('Onbekende combinatie van e-mail en code')
  }

  const valid = await verifyCode(cleanCode, user.codeHash)
  if (!valid) {
    throw new Error('Onbekende combinatie van e-mail en code')
  }

  const huisgenotenSection = await prisma.section.findFirst({ where: { name: 'Huisgenoten' } })
  if (!huisgenotenSection) {
    throw new Error('Configuratiefout: sectie "Huisgenoten" niet gevonden')
  }

  await createSessionCookie({
    userId: user.id,
    role: user.role,
    personId: user.personId,
    huisgenotenSectionId: huisgenotenSection.id,
  })

  redirect(user.role === 'COMM_POCKIES' ? '/' : '/mijn-overzicht')
}

export async function loginHuisgenoot(email: string) {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) {
    throw new Error('Vul je e-mailadres in')
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } })
  if (!user || user.role !== 'HUISGENOOT') {
    throw new Error('Onbekend e-mailadres — vraag Comm Pockies om een account voor je aan te maken')
  }

  const huisgenotenSection = await prisma.section.findFirst({ where: { name: 'Huisgenoten' } })
  if (!huisgenotenSection) {
    throw new Error('Configuratiefout: sectie "Huisgenoten" niet gevonden')
  }

  await createSessionCookie({
    userId: user.id,
    role: user.role,
    personId: user.personId,
    huisgenotenSectionId: huisgenotenSection.id,
  })

  redirect('/mijn-overzicht')
}

export async function logoutAction() {
  await destroySessionCookie()
  redirect('/login')
}
