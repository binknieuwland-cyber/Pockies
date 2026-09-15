import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SectionView from '@/components/SectionView'
import { getSession, assertSectionAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SectionPage({ params }: Props) {
  const { id } = await params
  const sectionId = Number(id)

  const session = await getSession()
  if (!session) redirect('/login')
  try {
    assertSectionAccess(sectionId, session)
  } catch {
    redirect('/mijn-overzicht')
  }

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
            referredBy: { select: { name: true } },
            group: { select: { name: true } },
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
  const personsPlain = section.persons
    .map((p) => ({
      ...p,
      referrerName: p.referredBy?.name ?? null,
      clubName: p.group?.name ?? null,
      orders: p.orders.map((o) => ({
        ...o,
        product: {
          ...o.product,
          priceExclBtw: Number(o.product.priceExclBtw),
        },
      })),
    }))
    .sort((a, b) => {
      // Wie nog een Tikkie moet krijgen/versturen staat bovenaan
      const paid = Number(a.paymentStatus === 'BETAALD') - Number(b.paymentStatus === 'BETAALD')
      if (paid !== 0) return paid
      // Daarna gegroepeerd/gesorteerd op doorverwijzende huisgenoot, voor overzicht
      return (a.referrerName ?? '').localeCompare(b.referrerName ?? '')
    })

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
      canManagePayments={session.role === 'COMM_POCKIES'}
    />
  )
}
