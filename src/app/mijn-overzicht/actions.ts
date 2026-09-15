'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireSession } from '@/lib/auth'

export interface MyOrderLine {
  productId: number
  size: string
  quantity: number
  note: string
}

export async function updateOwnOrder(lines: MyOrderLine[]) {
  const session = await requireSession()
  if (!session.personId) throw new Error('Geen persoon gekoppeld aan dit account')
  if (lines.length === 0) throw new Error('Voeg minimaal één product toe')
  for (const line of lines) {
    if (!line.productId || !line.size || line.quantity < 1) {
      throw new Error('Vul elk productregel volledig in')
    }
  }

  const person = await prisma.person.findUniqueOrThrow({ where: { id: session.personId } })
  if (person.paymentStatus !== 'NOG_NIET_GESTUURD') {
    throw new Error(
      'Je bestelling is al in verwerking en kan niet meer gewijzigd worden — neem contact op met Comm Pockies.',
    )
  }

  await prisma.$transaction([
    prisma.order.deleteMany({ where: { personId: person.id } }),
    prisma.order.createMany({
      data: lines.map((line) => ({
        personId: person.id,
        productId: line.productId,
        size: line.size,
        quantity: line.quantity,
        note: line.note.trim() || null,
      })),
    }),
  ])

  revalidatePath('/mijn-overzicht')
  revalidatePath('/')
  revalidatePath(`/sections/${person.sectionId}`)
}
