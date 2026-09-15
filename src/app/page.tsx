import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import LandingPage from '@/components/LandingPage'
import { inclBtw, formatEuro } from '@/lib/utils'
import { STOF_METERS, STOF_DOEL, computeTotalStof } from '@/lib/fabric'
import Card, { CardHeader } from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import FabricGauge from '@/components/ui/FabricGauge'
import LaurelDivider from '@/components/ui/LaurelDivider'
import {
  IconArrowRight,
  IconBox,
  IconEuro,
  IconPalette,
  IconTrendUp,
  IconUsers,
} from '@/components/icons'

export const dynamic = 'force-dynamic'

// Verkorte namen voor in de tabel
const KORTE_NAAM: Record<string, string> = {
  'Pockies': 'Pockies',
  'Boyfriendboxers (vrouwen pockies)': 'BF-boxers',
  'Pyjamabroek': 'Pyjamabroek',
  'Pyjamashirt': 'Pyjamashirt',
  'Djellaba': 'Djellaba',
}

const SIZES = ['S', 'M', 'L', 'XL'] as const

function formatM(m: number) {
  return m.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m'
}

export default async function OverviewPage() {
  const session = await getSession()
  if (!session) {
    const orders = await prisma.order.findMany({ include: { product: true } })
    return <LandingPage stofMeters={computeTotalStof(orders)} stofDoel={STOF_DOEL} />
  }
  if (session.role !== 'COMM_POCKIES') redirect('/mijn-overzicht')

  const [orders, products, sections] = await Promise.all([
    prisma.order.findMany({
      include: {
        person: { include: { section: true } },
        product: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.product.findMany({ orderBy: { id: 'asc' } }),
    prisma.section.findMany({
      orderBy: { id: 'asc' },
      include: { persons: { include: { orders: true } } },
    }),
  ])

  // ── Statistieken ────────────────────────────────────────────────────────
  const totalItems = orders.reduce((s, o) => s + o.quantity, 0)
  const grandTotal = orders.reduce(
    (s, o) => s + inclBtw(Number(o.product.priceExclBtw)) * o.quantity,
    0,
  )
  const totalPeople = sections.reduce((s, sec) => s + sec.persons.length, 0)
  const peopleWithOrders = new Set(orders.map((o) => o.personId)).size
  const avgPerPerson = peopleWithOrders > 0 ? grandTotal / peopleWithOrders : 0

  // ── Stof ────────────────────────────────────────────────────────────────
  const totalStof = computeTotalStof(orders)
  // Stof per product
  const stofPerProduct = products.map((p) => {
    const m = STOF_METERS[p.name] ?? 0
    const qty = orders.filter((o) => o.productId === p.id).reduce((s, o) => s + o.quantity, 0)
    return { name: p.name, metersPerStuk: m, totaalMeters: m * qty, qty }
  })

  // ── Product × Maat matrix ────────────────────────────────────────────────
  const matrix = products.map((p) => {
    const perSize = SIZES.map((size) =>
      orders
        .filter((o) => o.productId === p.id && o.size === size)
        .reduce((s, o) => s + o.quantity, 0),
    )
    const total = perSize.reduce((s, n) => s + n, 0)
    return { id: p.id, name: p.name, perSize, total }
  })
  const colTotals = SIZES.map((_, si) =>
    matrix.reduce((s, row) => s + row.perSize[si], 0),
  )
  const grandQtyTotal = colTotals.reduce((s, n) => s + n, 0)

  // ── Per product (kostenoverzicht) ────────────────────────────────────────
  const byProduct = products.map((p) => {
    const productOrders = orders.filter((o) => o.productId === p.id)
    const qty = productOrders.reduce((s, o) => s + o.quantity, 0)
    const cost = productOrders.reduce(
      (s, o) => s + inclBtw(Number(o.product.priceExclBtw)) * o.quantity,
      0,
    )
    return { name: p.name, qty, cost }
  })
  const maxProductQty = Math.max(...byProduct.map((p) => p.qty), 1)

  // ── Per sectie ───────────────────────────────────────────────────────────
  const bySection = sections.map((sec) => {
    const sectionOrders = orders.filter((o) => o.person.sectionId === sec.id)
    const qty = sectionOrders.reduce((s, o) => s + o.quantity, 0)
    const cost = sectionOrders.reduce(
      (s, o) => s + inclBtw(Number(o.product.priceExclBtw)) * o.quantity,
      0,
    )
    return { id: sec.id, name: sec.name, personCount: sec.persons.length, qty, cost }
  })

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-ink-900 rounded-md overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />
        <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-8 px-6 py-8 lg:px-12 lg:py-12">
          <Image
            src="/logo.png"
            alt="VS42 logo"
            width={480}
            height={480}
            priority
            className="h-28 w-28 sm:h-32 sm:w-32 lg:h-44 lg:w-44 object-contain shrink-0"
          />
          <div className="text-center sm:text-left">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold-400">
              VS42 · Sinds 1962
            </p>
            <h1 className="mt-2 font-serif text-3xl lg:text-5xl font-semibold text-white leading-tight">
              De Voorstraat Shop
            </h1>
            <p className="mt-3 text-sm lg:text-base text-ink-200 max-w-md">
              Welkom bij de VS42 Shop. Plaats hier je samplebestelling of wijzig een bestaande
              bestelling.
            </p>
            <div className="mt-4 flex justify-center sm:justify-start">
              <LaurelDivider />
            </div>
          </div>
        </div>
      </section>

      {/* ── ONTWERP LINK ─────────────────────────────────────────────────── */}
      <Link
        href="/design"
        className="group flex items-center justify-between gap-3 bg-white border border-ink-100 rounded-md px-5 py-4 hover:border-gold-400 transition-colors"
      >
        <span className="flex items-center gap-3">
          <span className="grid place-items-center w-9 h-9 rounded-sm bg-ink-50 text-ink-700 shrink-0">
            <IconPalette className="w-5 h-5" />
          </span>
          <span className="text-sm font-medium text-ink-900">Bekijk het ontwerp</span>
        </span>
        <IconArrowRight className="w-4 h-4 text-ink-300 group-hover:text-gold-600 group-hover:translate-x-0.5 transition" />
      </Link>

      {/* ── STATISTIEKEN ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Artikelen" value={totalItems} icon={<IconBox className="w-5 h-5" />} />
        <StatCard
          label="Totaal incl. BTW"
          value={formatEuro(grandTotal)}
          icon={<IconEuro className="w-5 h-5" />}
          tone="brand"
        />
        <StatCard
          label="Deelnemers"
          value={peopleWithOrders}
          hint={`van ${totalPeople} geregistreerd`}
          icon={<IconUsers className="w-5 h-5" />}
        />
        <StatCard
          label="Gem. per persoon"
          value={formatEuro(avgPerPerson)}
          hint="incl. BTW"
          icon={<IconTrendUp className="w-5 h-5" />}
        />
      </div>

      {/* ── STOF VOORTGANG ──────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-4">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-3">
            Stof besteld · doel {STOF_DOEL} m
          </p>
          <FabricGauge valueM={totalStof} goalM={STOF_DOEL} />
        </div>

        {/* Stof per product */}
        <div className="border-t border-ink-100">
          <CardHeader>Stof per product</CardHeader>
          <ul className="divide-y divide-ink-50 pb-1 lg:grid lg:grid-cols-2 lg:divide-y-0 lg:pb-2">
            {stofPerProduct.map((p) => {
              const barPct = totalStof > 0 ? (p.totaalMeters / totalStof) * 100 : 0
              return (
                <li key={p.name} className="px-4 lg:px-6 py-2.5 lg:py-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-ink-700 font-medium">
                      {KORTE_NAAM[p.name] ?? p.name}
                    </span>
                    <span className="font-mono text-ink-400">
                      {p.qty}× · {p.metersPerStuk} m/stuk ={' '}
                      <span className="text-ink-700 font-semibold">{formatM(p.totaalMeters)}</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-paper-100 overflow-hidden">
                    <div
                      className="h-full bg-ink-400"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </Card>

      {/* ── AANTALLEN PER PRODUCT × MAAT ────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardHeader>Aantallen per product & maat</CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs lg:text-sm font-mono">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="text-left px-4 lg:px-6 py-2.5 lg:py-3 font-medium text-ink-400 uppercase tracking-wide w-32">
                  Product
                </th>
                {SIZES.map((s) => (
                  <th key={s} className="px-3 py-2.5 lg:py-3 font-medium text-ink-400 uppercase text-center w-10">
                    {s}
                  </th>
                ))}
                <th className="px-3 lg:px-6 py-2.5 lg:py-3 font-medium text-ink-700 uppercase text-center w-12 border-l border-ink-100">
                  Tot.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {matrix.map((row) => (
                <tr key={row.id} className="hover:bg-paper-50">
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3 text-ink-700 font-medium whitespace-nowrap font-sans">
                    {KORTE_NAAM[row.name] ?? row.name}
                  </td>
                  {row.perSize.map((qty, si) => (
                    <td
                      key={si}
                      className={`px-3 py-2.5 lg:py-3 text-center font-medium tabular-nums ${
                        qty > 0 ? 'text-ink-900' : 'text-ink-200'
                      }`}
                    >
                      {qty > 0 ? qty : '—'}
                    </td>
                  ))}
                  <td
                    className={`px-3 lg:px-6 py-2.5 lg:py-3 text-center font-semibold tabular-nums border-l border-ink-100 ${
                      row.total > 0 ? 'text-gold-700' : 'text-ink-200'
                    }`}
                  >
                    {row.total > 0 ? row.total : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-ink-200 bg-paper-50">
                <td className="px-4 lg:px-6 py-2.5 lg:py-3 font-semibold text-ink-700 uppercase tracking-wide">Totaal</td>
                {colTotals.map((qty, si) => (
                  <td
                    key={si}
                    className={`px-3 py-2.5 lg:py-3 text-center font-semibold tabular-nums ${
                      qty > 0 ? 'text-ink-900' : 'text-ink-200'
                    }`}
                  >
                    {qty > 0 ? qty : '—'}
                  </td>
                ))}
                <td className="px-3 lg:px-6 py-2.5 lg:py-3 text-center font-semibold tabular-nums text-gold-700 border-l border-ink-200">
                  {grandQtyTotal > 0 ? grandQtyTotal : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* ── PER SECTIE & PER PRODUCT ────────────────────────────────────── */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
        <Card className="overflow-hidden">
          <CardHeader>Per sectie</CardHeader>
          {bySection.every((s) => s.qty === 0) ? (
            <p className="px-4 py-6 text-ink-400 text-sm text-center">Nog geen bestellingen</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {bySection.map((sec) => (
                <li key={sec.id} className="flex items-center justify-between px-4 lg:px-6 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{sec.name}</p>
                    <p className="font-mono text-xs text-ink-400 mt-0.5">
                      {sec.personCount} {sec.personCount === 1 ? 'persoon' : 'personen'}
                      {sec.qty > 0 && ` · ${sec.qty} artikel${sec.qty !== 1 ? 'en' : ''}`}
                    </p>
                  </div>
                  {sec.qty > 0 ? (
                    <span className="text-sm font-semibold text-ink-900 whitespace-nowrap tabular-nums">
                      {formatEuro(sec.cost)}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-200">—</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>Kosten per product</CardHeader>
          <ul className="divide-y divide-ink-100">
            {byProduct.map((p) => (
              <li key={p.name} className="px-4 lg:px-6 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-ink-800 truncate pr-2">
                    {KORTE_NAAM[p.name] ?? p.name}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs font-medium text-ink-400">{p.qty}×</span>
                    <span className="text-sm font-semibold text-ink-900 w-20 text-right tabular-nums">
                      {p.qty > 0 ? formatEuro(p.cost) : '—'}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-paper-100 overflow-hidden">
                  <div
                    className="h-full bg-gold-500"
                    style={{ width: `${(p.qty / maxProductQty) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

    </div>
  )
}
