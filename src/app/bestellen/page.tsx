import { prisma } from '@/lib/prisma'
import PublicOrderForm from '@/components/PublicOrderForm'

export const dynamic = 'force-dynamic'

export default async function BestellenPage() {
  const [products, clubSection, huizenSection, huisgenotenSection] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.section.findFirst({
      where: { name: 'Vrienden/clubgenoten van huisgenoten' },
      include: { groups: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.section.findFirst({
      where: { name: 'Huizen' },
      include: { groups: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.section.findFirst({
      where: { name: 'Huisgenoten' },
      include: { persons: { orderBy: { sortOrder: 'asc' } } },
    }),
  ])

  const productsPlain = products.map((p) => ({
    ...p,
    priceExclBtw: Number(p.priceExclBtw),
  }))

  return (
    <PublicOrderForm
      products={productsPlain}
      clubs={(clubSection?.groups ?? []).map((g) => ({ id: g.id, name: g.name }))}
      huizen={(huizenSection?.groups ?? []).map((g) => ({ id: g.id, name: g.name }))}
      huisgenoten={(huisgenotenSection?.persons ?? []).map((p) => ({
        id: p.id,
        name: p.fullName ?? p.name,
      }))}
    />
  )
}
