'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type PublicCategory = 'OUD_HUISGENOOT' | 'VRIEND'

export interface PublicOrderLine {
  productId: number
  size: string
  quantity: number
  note: string
}

export interface PublicOrderInput {
  name: string
  phone: string
  category: PublicCategory
  groupId: number | null
  lines: PublicOrderLine[]
}

const SECTION_NAMES: Record<PublicCategory, string> = {
  OUD_HUISGENOOT: 'Oud-huisgenoten',
  VRIEND: 'Vrienden/clubgenoten van huisgenoten',
}

export async function submitPublicOrder(input: PublicOrderInput) {
  const name = input.name.trim()
  const phone = input.phone.trim()

  if (!name) throw new Error('Naam is verplicht')
  if (!phone) throw new Error('Telefoonnummer is verplicht')
  if (input.category !== 'OUD_HUISGENOOT' && input.category !== 'VRIEND') {
    throw new Error('Kies een geldige categorie')
  }
  if (input.lines.length === 0) {
    throw new Error('Voeg minimaal één product toe')
  }
  for (const line of input.lines) {
    if (!line.productId || !line.size || line.quantity < 1) {
      throw new Error('Vul elk productregel volledig in')
    }
  }

  const section = await prisma.section.findFirst({
    where: { name: SECTION_NAMES[input.category] },
  })
  if (!section) throw new Error('Configuratiefout: sectie niet gevonden')

  let groupId: number | null = null
  if (input.category === 'VRIEND' && input.groupId !== null) {
    const group = await prisma.group.findFirst({
      where: { id: input.groupId, sectionId: section.id },
    })
    if (!group) throw new Error('Ongeldige groep')
    groupId = group.id
  }

  const last = await prisma.person.findFirst({
    where: { sectionId: section.id },
    orderBy: { sortOrder: 'desc' },
  })

  await prisma.person.create({
    data: {
      name,
      phone,
      sectionId: section.id,
      groupId,
      sortOrder: (last?.sortOrder ?? -1) + 1,
      orders: {
        create: input.lines.map((line) => ({
          productId: line.productId,
          size: line.size,
          quantity: line.quantity,
          note: line.note.trim() || null,
        })),
      },
    },
  })

  revalidatePath('/')
  revalidatePath(`/sections/${section.id}`)
}
