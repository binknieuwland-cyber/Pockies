import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SectionView from '@/components/SectionView'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SectionPage({ params }: Props) {
  const { id } = await params
  const sectionId = Number(id)

  const [section, products] = await Promise.all([
    prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        persons: {
          orderBy: { sortOrder: 'asc' },
          include: {
            orders: {
              orderBy: { createdAt: 'asc' },
              include: { product: true },
            },
          },
        },
        groups: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!section) notFound()

  // Serialize Decimal → number for client components
  const personsPlain = section.persons.map((p) => ({
    ...p,
    orders: p.orders.map((o) => ({
      ...o,
      product: {
        ...o.product,
        priceExclBtw: Number(o.product.priceExclBtw),
      },
    })),
  }))

  const productsPlain = products.map((p) => ({
    ...p,
    priceExclBtw: Number(p.priceExclBtw),
  }))

  return (
    <SectionView
      section={{ id: section.id, name: section.name }}
      persons={personsPlain}
      products={productsPlain}
      groups={section.groups}
    />
  )
}
