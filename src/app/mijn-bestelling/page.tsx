import { prisma } from '@/lib/prisma'
import LookupOrderForm from '@/components/LookupOrderForm'

export const dynamic = 'force-dynamic'

export default async function MijnBestellingPage() {
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } })
  const productsPlain = products.map((p) => ({ ...p, priceExclBtw: Number(p.priceExclBtw) }))

  return <LookupOrderForm products={productsPlain} />
}
