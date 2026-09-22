'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { normalizePhoneDigits } from '@/lib/phone'

export interface MyOrderLine {
  productId: number
  size: string
  quantity: number
  note: string
}

export async function lookupOrdersByPhone(phone: string) {
  const cleanPhone = normalizePhoneDigits(phone)
  if (!cleanPhone) throw new Error('Vul een telefoonnummer in')

  const persons = await prisma.person.findMany({
    where: { phone: cleanPhone },
    include: {
      section: true,
      group: true,
      orders: { include: { product: true }, orderBy: { createdAt: 'asc' } },
    },
    orderBy: { id: 'asc' },
  })

  return persons.map((p) => ({
    id: p.id,
    name: p.name,
    sectionName: p.section.name,
    groupName: p.group?.name ?? null,
    paymentStatus: p.paymentStatus,
    canEdit: p.paymentStatus === 'NOG_NIET_GESTUURD',
    orders: p.orders.map((o) => ({
      productId: o.productId,
      size: o.size,
      quantity: o.quantity,
      note: o.note ?? '',
      productName: o.product.name,
      priceExclBtw: Number(o.product.priceExclBtw),
    })),
  }))
}

export async function updateMyOrder(personId: number, phone: string, lines: MyOrderLine[]) {
  const cleanPhone = normalizePhoneDigits(phone)
  if (!cleanPhone) throw new Error('Vul een telefoonnummer in')
  if (lines.length === 0) throw new Error('Voeg minimaal één product toe')
  for (const line of lines) {
    if (!line.productId || !line.size || line.quantity < 1) {
      throw new Error('Vul elk productregel volledig in')
    }
  }

  const person = await prisma.person.findUniqueOrThrow({ where: { id: personId } })

  if (person.phone !== cleanPhone) {
    throw new Error('Telefoonnummer komt niet overeen')
  }
  if (person.paymentStatus !== 'NOG_NIET_GESTUURD') {
    throw new Error(
      'Je bestelling is al in verwerking en kan niet meer gewijzigd worden — neem contact op met Comm Pockies.',
    )
  }

  await prisma.$transaction([
    prisma.order.deleteMany({ where: { personId } }),
    prisma.order.createMany({
      data: lines.map((line) => ({
        personId,
        productId: line.productId,
        size: line.size,
        quantity: line.quantity,
        note: line.note.trim() || null,
      })),
    }),
  ])

  revalidatePath('/')
  revalidatePath(`/sections/${person.sectionId}`)
}
