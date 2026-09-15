import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { STOF_DOEL, computeTotalStof } from '@/lib/fabric'
import { inclBtw, formatEuro } from '@/lib/utils'
import Card, { CardHeader } from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import FabricGauge from '@/components/ui/FabricGauge'
import MyOrderCard from '@/components/MyOrderCard'
import { IconBox, IconEuro } from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function MyOverviewPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!session.personId) redirect('/')

  const [me, allOrders, products] = await Promise.all([
    prisma.person.findUnique({
      where: { id: session.personId },
      include: { orders: { include: { product: true }, orderBy: { createdAt: 'asc' } } },
    }),
    prisma.order.findMany({ include: { product: true } }),
    prisma.product.findMany({ orderBy: { id: 'asc' } }),
  ])

  if (!me) redirect('/')

  const myLines = me.orders.map((o) => ({
    productId: o.productId,
    size: o.size,
    quantity: o.quantity,
    note: o.note ?? '',
    productName: o.product.name,
    priceExclBtw: Number(o.product.priceExclBtw),
  }))

  // ── Groepsstatistieken ────────────────────────────────────────────────────
  const totalItems = allOrders.reduce((s, o) => s + o.quantity, 0)
  const grandTotal = allOrders.reduce(
    (s, o) => s + inclBtw(Number(o.product.priceExclBtw)) * o.quantity,
    0,
  )
  const totalStof = computeTotalStof(allOrders)

  // ── Meest bestelde items ────────────────────────────────────────────────────
  const mostBought = products
    .map((p) => ({
      name: p.name,
      qty: allOrders.filter((o) => o.productId === p.id).reduce((s, o) => s + o.quantity, 0),
    }))
    .sort((a, b) => b.qty - a.qty)
  const maxQty = Math.max(...mostBought.map((p) => p.qty), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-xl lg:text-2xl font-semibold text-ink-900 leading-tight">
          Hoi {me.name}
        </h1>
        <p className="font-mono text-sm text-ink-500 mt-0.5">Jouw bestelling en hoe het gaat met de shop</p>
      </div>

      <MyOrderCard products={products.map((p) => ({ ...p, priceExclBtw: Number(p.priceExclBtw) }))} existingLines={myLines} paymentStatus={me.paymentStatus} />

      {/* ── STATISTIEKEN ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="font-serif text-lg font-semibold text-ink-900 mb-3">Hoe gaat het met de bestellingen</h2>
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <StatCard label="Artikelen" value={totalItems} icon={<IconBox className="w-5 h-5" />} />
          <StatCard
            label="Totaal incl. BTW"
            value={formatEuro(grandTotal)}
            icon={<IconEuro className="w-5 h-5" />}
            tone="brand"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-4">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-3">
            Stof besteld · doel {STOF_DOEL} m
          </p>
          <FabricGauge valueM={totalStof} goalM={STOF_DOEL} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>Meest bestelde items</CardHeader>
        {mostBought.every((p) => p.qty === 0) ? (
          <p className="px-4 lg:px-6 py-6 text-ink-400 text-sm text-center">Nog geen bestellingen</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {mostBought.map((p, i) => (
              <li key={p.name} className="px-4 lg:px-6 py-3">
                <div className="flex items-center justify-between mb-1.5 gap-3">
                  <span className="text-sm text-ink-800 flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-ink-300 tabular-nums w-4 shrink-0">
                      {i + 1}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </span>
                  <span className="font-mono text-sm font-semibold text-ink-900 tabular-nums shrink-0">
                    {p.qty > 0 ? `${p.qty}×` : '—'}
                  </span>
                </div>
                <div className="h-1.5 bg-paper-100 overflow-hidden ml-6">
                  <div
                    className="h-full bg-gold-500"
                    style={{ width: `${(p.qty / maxQty) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
