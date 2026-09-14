import { prisma } from '@/lib/prisma'
import PublicOrderForm from '@/components/PublicOrderForm'

export const dynamic = 'force-dynamic'

export default async function BestellenPage() {
  const [products, vriendenSection] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.section.findFirst({
      where: { name: 'Vrienden/clubgenoten van huisgenoten' },
      include: { groups: { orderBy: { sortOrder: 'asc' } } },
    }),
  ])

  const productsPlain = products.map((p) => ({
    ...p,
    priceExclBtw: Number(p.priceExclBtw),
  }))

  return (
    <PublicOrderForm
      products={productsPlain}
      vriendenGroups={(vriendenSection?.groups ?? []).map((g) => ({ id: g.id, name: g.name }))}
    />
  )
}
