import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { inclBtw, formatEuro } from '@/lib/utils'
import Card, { CardHeader } from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import {
  IconArrowRight,
  IconBox,
  IconEuro,
  IconLayers,
  IconPalette,
  IconTrendUp,
  IconUsers,
} from '@/components/icons'

export const dynamic = 'force-dynamic'

// Stof per product in meters
const STOF_METERS: Record<string, number> = {
  'Pockies': 1,
  'Boyfriendboxers (vrouwen pockies)': 1,
  'Pyjamabroek': 2.86,
  'Pyjamashirt': 2.86,
  'Djellaba': 3.34,
}
const STOF_DOEL = 100 // meter

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
  const totalStof = orders.reduce((s, o) => {
    const m = STOF_METERS[o.product.name] ?? 0
    return s + m * o.quantity
  }, 0)
  const stofPct = Math.min((totalStof / STOF_DOEL) * 100, 100)
  const stofRest = Math.max(STOF_DOEL - totalStof, 0)
  const doelBehaald = totalStof >= STOF_DOEL

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
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8 px-6 py-8 lg:px-12 lg:py-12">
          <Image
            src="/logo.png"
            alt="VS42 logo"
            width={480}
            height={480}
            priority
            className="h-28 w-28 sm:h-32 sm:w-32 lg:h-44 lg:w-44 object-contain shrink-0"
          />
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              VS42 · Sinds 1962
            </p>
            <h1 className="mt-1 text-2xl lg:text-4xl font-bold text-gray-900 leading-tight">
              De Voorstraat Shop
            </h1>
            <p className="mt-2 text-sm lg:text-base text-gray-500 max-w-md">
              Bestellingentracker voor ondergoed — volg de voortgang, bestellingen en kosten per
              huisgenoot.
            </p>
          </div>
        </div>
      </section>

      {/* ── ONTWERP LINK ─────────────────────────────────────────────────── */}
      <Link
        href="/design"
        className="group flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-brand-200 transition"
      >
        <span className="flex items-center gap-3">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand-50 text-brand-600 shrink-0">
            <IconPalette className="w-5 h-5" />
          </span>
          <span className="text-sm font-medium text-gray-900">Bekijk het ontwerp</span>
        </span>
        <IconArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
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
        <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="hidden sm:grid place-items-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 shrink-0">
                <IconLayers className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Stof besteld
                </p>
                <p className="text-4xl font-bold text-gray-900 leading-none tabular-nums">
                  {formatM(totalStof)}
                </p>
                <p className="text-sm text-gray-400 mt-1">van {STOF_DOEL} m doel</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`text-3xl font-bold tabular-nums ${
                  doelBehaald ? 'text-green-600' : 'text-brand-600'
                }`}
              >
                {Math.round(stofPct)}%
              </p>
              {doelBehaald ? (
                <p className="text-xs text-green-600 font-medium mt-0.5">Doel behaald</p>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">nog {formatM(stofRest)}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 mb-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                doelBehaald ? 'bg-green-600' : 'bg-brand-600'
              }`}
              style={{ width: `${stofPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-3">
            <span>0 m</span>
            <span>50 m</span>
            <span>100 m</span>
          </div>
        </div>

        {/* Stof per product */}
        <div className="border-t border-gray-100">
          <CardHeader>Stof per product</CardHeader>
          <ul className="divide-y divide-gray-50 pb-1 lg:grid lg:grid-cols-2 lg:divide-y-0 lg:pb-2">
            {stofPerProduct.map((p) => {
              const barPct = totalStof > 0 ? (p.totaalMeters / totalStof) * 100 : 0
              return (
                <li key={p.name} className="px-4 lg:px-6 py-2.5 lg:py-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-700 font-medium">
                      {KORTE_NAAM[p.name] ?? p.name}
                    </span>
                    <span className="text-gray-400">
                      {p.qty}× · {p.metersPerStuk} m/stuk ={' '}
                      <span className="text-gray-700 font-semibold">{formatM(p.totaalMeters)}</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-400 rounded-full"
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
          <table className="w-full text-xs lg:text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 lg:px-6 py-2.5 lg:py-3 font-semibold text-gray-500 w-32">
                  Product
                </th>
                {SIZES.map((s) => (
                  <th key={s} className="px-3 py-2.5 lg:py-3 font-semibold text-gray-500 text-center w-10">
                    {s}
                  </th>
                ))}
                <th className="px-3 lg:px-6 py-2.5 lg:py-3 font-semibold text-gray-700 text-center w-12 border-l border-gray-100">
                  Tot.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {matrix.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50">
                  <td className="px-4 lg:px-6 py-2.5 lg:py-3 text-gray-700 font-medium whitespace-nowrap">
                    {KORTE_NAAM[row.name] ?? row.name}
                  </td>
                  {row.perSize.map((qty, si) => (
                    <td
                      key={si}
                      className={`px-3 py-2.5 lg:py-3 text-center font-medium tabular-nums ${
                        qty > 0 ? 'text-gray-900' : 'text-gray-300'
                      }`}
                    >
                      {qty > 0 ? qty : '—'}
                    </td>
                  ))}
                  <td
                    className={`px-3 lg:px-6 py-2.5 lg:py-3 text-center font-bold tabular-nums border-l border-gray-100 ${
                      row.total > 0 ? 'text-brand-700' : 'text-gray-300'
                    }`}
                  >
                    {row.total > 0 ? row.total : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-4 lg:px-6 py-2.5 lg:py-3 font-bold text-gray-700">Totaal</td>
                {colTotals.map((qty, si) => (
                  <td
                    key={si}
                    className={`px-3 py-2.5 lg:py-3 text-center font-bold tabular-nums ${
                      qty > 0 ? 'text-gray-900' : 'text-gray-300'
                    }`}
                  >
                    {qty > 0 ? qty : '—'}
                  </td>
                ))}
                <td className="px-3 lg:px-6 py-2.5 lg:py-3 text-center font-bold tabular-nums text-brand-700 border-l border-gray-200">
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
            <p className="px-4 py-6 text-gray-400 text-sm text-center">Nog geen bestellingen</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {bySection.map((sec) => (
                <li key={sec.id} className="flex items-center justify-between px-4 lg:px-6 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{sec.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {sec.personCount} {sec.personCount === 1 ? 'persoon' : 'personen'}
                      {sec.qty > 0 && ` · ${sec.qty} artikel${sec.qty !== 1 ? 'en' : ''}`}
                    </p>
                  </div>
                  {sec.qty > 0 ? (
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                      {formatEuro(sec.cost)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>Kosten per product</CardHeader>
          <ul className="divide-y divide-gray-100">
            {byProduct.map((p) => (
              <li key={p.name} className="px-4 lg:px-6 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-800 truncate pr-2">
                    {KORTE_NAAM[p.name] ?? p.name}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-gray-400">{p.qty}×</span>
                    <span className="text-sm font-semibold text-gray-900 w-20 text-right tabular-nums">
                      {p.qty > 0 ? formatEuro(p.cost) : '—'}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
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
