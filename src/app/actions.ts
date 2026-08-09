'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ─── Person ────────────────────────────────────────────────────────────────

export async function addPerson(sectionId: number, name: string, groupId: number | null = null) {
  if (!name.trim()) throw new Error('Naam is verplicht')
  const last = await prisma.person.findFirst({
    where: { sectionId },
    orderBy: { sortOrder: 'desc' },
  })
  await prisma.person.create({
    data: { name: name.trim(), sectionId, groupId, sortOrder: (last?.sortOrder ?? -1) + 1 },
  })
  revalidatePath('/')
  revalidatePath(`/sections/${sectionId}`)
}

export async function updatePerson(id: number, name: string) {
  if (!name.trim()) throw new Error('Naam is verplicht')
  const person = await prisma.person.update({
    where: { id },
    data: { name: name.trim() },
  })
  revalidatePath('/')
  revalidatePath(`/sections/${person.sectionId}`)
}

export async function deletePerson(id: number) {
  const person = await prisma.person.findUnique({ where: { id } })
  if (!person) return
  if (person.locked) throw new Error('Deze persoon is vergrendeld en kan niet verwijderd worden')
  // Orders are cascade-deleted via schema
  await prisma.person.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath(`/sections/${person.sectionId}`)
}

export async function setPersonGroup(personId: number, groupId: number | null) {
  const person = await prisma.person.update({
    where: { id: personId },
    data: { groupId },
  })
  revalidatePath('/')
  revalidatePath(`/sections/${person.sectionId}`)
}

// ─── Group ─────────────────────────────────────────────────────────────────

export async function addGroup(sectionId: number, name: string) {
  if (!name.trim()) throw new Error('Naam is verplicht')
  const last = await prisma.group.findFirst({
    where: { sectionId },
    orderBy: { sortOrder: 'desc' },
  })
  await prisma.group.create({
    data: { name: name.trim(), sectionId, sortOrder: (last?.sortOrder ?? -1) + 1 },
  })
  revalidatePath('/')
  revalidatePath(`/sections/${sectionId}`)
}

export async function updateGroup(id: number, name: string) {
  if (!name.trim()) throw new Error('Naam is verplicht')
  const group = await prisma.group.update({
    where: { id },
    data: { name: name.trim() },
  })
  revalidatePath('/')
  revalidatePath(`/sections/${group.sectionId}`)
}

export async function deleteGroup(id: number) {
  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return
  // Persons keep existing via groupId → null (schema onDelete: SetNull)
  await prisma.group.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath(`/sections/${group.sectionId}`)
}

// ─── Order ─────────────────────────────────────────────────────────────────

export async function addOrder(
  personId: number,
  productId: number,
  size: string,
  quantity: number,
  note: string,
) {
  const person = await prisma.person.findUniqueOrThrow({ where: { id: personId } })
  await prisma.order.create({
    data: { personId, productId, size, quantity, note: note.trim() || null },
  })
  revalidatePath('/')
  revalidatePath(`/sections/${person.sectionId}`)
}

export async function updateOrder(
  id: number,
  productId: number,
  size: string,
  quantity: number,
  note: string,
) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id },
    include: { person: true },
  })
  await prisma.order.update({
    where: { id },
    data: { productId, size, quantity, note: note.trim() || null },
  })
  revalidatePath('/')
  revalidatePath(`/sections/${order.person.sectionId}`)
}

export async function deleteOrder(id: number) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id },
    include: { person: true },
  })
  await prisma.order.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath(`/sections/${order.person.sectionId}`)
}
