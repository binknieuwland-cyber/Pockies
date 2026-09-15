import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed sections
  const sections = [
    { name: 'Huisgenoten' },
    { name: 'Oud-huisgenoten' },
    { name: 'Vrienden/clubgenoten van huisgenoten' },
    { name: 'Huizen' },
    { name: 'Via huisgenoten' },
  ]

  for (const section of sections) {
    await prisma.section.upsert({
      where: { id: sections.indexOf(section) + 1 },
      update: { name: section.name },
      create: { name: section.name },
    })
  }

  // Seed products (prices excl. BTW in euros)
  const products = [
    { name: 'Pockies', priceExclBtw: 15.21 },
    { name: 'Boyfriendboxers (vrouwen pockies)', priceExclBtw: 15.21 },
    { name: 'Pyjamabroek', priceExclBtw: 31.22 },
    { name: 'Pyjamashirt', priceExclBtw: 36.18 },
    { name: 'Djellaba', priceExclBtw: 33.89 },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: products.indexOf(product) + 1 },
      update: { name: product.name, priceExclBtw: product.priceExclBtw },
      create: { name: product.name, priceExclBtw: product.priceExclBtw },
    })
  }

  console.log(`Seed voltooid: ${sections.length} secties en ${products.length} producten aangemaakt.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
