'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type PublicCategory = 'OUD_HUISGENOOT' | 'CLUB' | 'HUIS' | 'VIA_HUISGENOOT'

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
  /** CLUB: bestaande club-groep. HUIS: bestaand huis (indien niet nieuwHuisNaam). */
  groupId: number | null
  /** HUIS: naam voor een nieuw aan te maken huis. */
  newHuisNaam: string | null
  /** VIA_HUISGENOOT: id van de huisgenoot via wie besteld wordt. */
  referredById: number | null
  lines: PublicOrderLine[]
}

const SECTION_NAMES: Record<PublicCategory, string> = {
  OUD_HUISGENOOT: 'Oud-huisgenoten',
  CLUB: 'Vrienden/clubgenoten van huisgenoten',
  HUIS: 'Huizen',
  VIA_HUISGENOOT: 'Via huisgenoten',
}

export async function submitPublicOrder(input: PublicOrderInput) {
  const name = input.name.trim()
  const phone = input.phone.trim()

  if (!name) throw new Error('Naam is verplicht')
  if (!phone) throw new Error('Telefoonnummer is verplicht')
  if (!SECTION_NAMES[input.category]) {
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
  let referredById: number | null = null

  if (input.category === 'CLUB' && input.groupId !== null) {
    const group = await prisma.group.findFirst({
      where: { id: input.groupId, sectionId: section.id },
    })
    if (!group) throw new Error('Ongeldige club')
    groupId = group.id
  }

  if (input.category === 'HUIS') {
    const newHuisNaam = input.newHuisNaam?.trim()
    if (newHuisNaam) {
      const last = await prisma.group.findFirst({
        where: { sectionId: section.id },
        orderBy: { sortOrder: 'desc' },
      })
      const created = await prisma.group.create({
        data: { name: newHuisNaam, sectionId: section.id, sortOrder: (last?.sortOrder ?? -1) + 1 },
      })
      groupId = created.id
    } else {
      if (input.groupId === null) throw new Error('Kies een huis of vul een nieuwe naam in')
      const group = await prisma.group.findFirst({
        where: { id: input.groupId, sectionId: section.id },
      })
      if (!group) throw new Error('Ongeldig huis')
      groupId = group.id
    }
  }

  if (input.category === 'VIA_HUISGENOOT') {
    if (input.referredById === null) throw new Error('Kies via welke huisgenoot je bestelt')
    const huisgenotenSection = await prisma.section.findFirst({ where: { name: 'Huisgenoten' } })
    const referrer = await prisma.person.findFirst({
      where: { id: input.referredById, sectionId: huisgenotenSection?.id },
    })
    if (!referrer) throw new Error('Ongeldige huisgenoot')
    referredById = referrer.id
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
      referredById,
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
