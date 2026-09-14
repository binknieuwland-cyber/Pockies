'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Card from './ui/Card'
import Button from './ui/Button'
import OrderLinesEditor, { newOrderLine, linesTotal, type OrderLine, type Product } from './OrderLinesEditor'
import { formatEuro } from '@/lib/utils'
import { submitPublicOrder, type PublicCategory } from '@/app/bestellen/actions'

interface Group {
  id: number
  name: string
}

export default function PublicOrderForm({
  products,
  vriendenGroups,
}: {
  products: Product[]
  vriendenGroups: Group[]
}) {
  const defaultProductId = products[0]?.id ?? 0

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState<PublicCategory>('OUD_HUISGENOOT')
  const [groupId, setGroupId] = useState<string>('')
  const [lines, setLines] = useState<OrderLine[]>([newOrderLine(defaultProductId)])
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ phone: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const total = linesTotal(products, lines)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        await submitPublicOrder({
          name,
          phone,
          category,
          groupId: category === 'VRIEND' && groupId ? Number(groupId) : null,
          lines: lines.map(({ productId, size, quantity, note }) => ({
            productId,
            size,
            quantity,
            note,
          })),
        })
        setDone({ phone })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      }
    })
  }

  if (done) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 bg-paper">
        <Card className="w-full max-w-sm p-6 sm:p-8 text-center">
          <Image
            src="/logo.png"
            alt="VS42"
            width={160}
            height={160}
            className="h-16 w-16 object-contain mx-auto mb-4"
          />
          <h1 className="font-serif text-xl font-semibold text-ink-900">Bedankt voor je bestelling!</h1>
          <p className="mt-3 text-sm text-ink-600">
            We nemen via Tikkie contact op op <span className="font-medium">{done.phone}</span> om
            te betalen.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-dvh px-4 py-8 sm:py-12 bg-paper flex justify-center">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src="/logo.png"
            alt="VS42"
            width={160}
            height={160}
            priority
            className="h-16 w-16 object-contain mb-3"
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold-600">
            VS42 · Sinds 1962
          </p>
          <h1 className="mt-1 font-serif text-xl font-semibold text-ink-900">
            Bestelling plaatsen
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card className="p-5 space-y-4">
            <div>
              <label htmlFor="pub-name" className="block text-sm font-medium text-ink-700 mb-1">
                Naam
              </label>
              <input
                id="pub-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-ink-700 mb-2">Ik ben...</p>
              <div className="grid grid-cols-1 gap-2">
                <label
                  className={`flex items-center gap-2 rounded-sm border-2 px-4 py-3 cursor-pointer transition-colors ${
                    category === 'OUD_HUISGENOOT'
                      ? 'border-ink-700 bg-ink-50'
                      : 'border-ink-200 hover:border-ink-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={category === 'OUD_HUISGENOOT'}
                    onChange={() => setCategory('OUD_HUISGENOOT')}
                    className="accent-ink-700"
                  />
                  <span className="text-sm text-ink-800">Oud-huisgenoot</span>
                </label>
                <label
                  className={`flex items-center gap-2 rounded-sm border-2 px-4 py-3 cursor-pointer transition-colors ${
                    category === 'VRIEND'
                      ? 'border-ink-700 bg-ink-50'
                      : 'border-ink-200 hover:border-ink-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={category === 'VRIEND'}
                    onChange={() => setCategory('VRIEND')}
                    className="accent-ink-700"
                  />
                  <span className="text-sm text-ink-800">Vriend, clubgenoot of familie van een huisgenoot</span>
                </label>
              </div>
            </div>

            {category === 'VRIEND' && (
              <div>
                <label htmlFor="pub-group" className="block text-sm font-medium text-ink-700 mb-1">
                  Via wie ken je een huisgenoot?
                </label>
                <select
                  id="pub-group"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 bg-white focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
                >
                  {vriendenGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                  <option value="">Overig</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="pub-phone" className="block text-sm font-medium text-ink-700 mb-1">
                Telefoonnummer <span className="text-ink-400">(voor de Tikkie)</span>
              </label>
              <input
                id="pub-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12345678"
                required
                className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
              />
            </div>
          </Card>

          <OrderLinesEditor products={products} lines={lines} onChange={setLines} />

          <div className="bg-gold-50 rounded-sm px-4 py-3 flex items-center justify-between border border-gold-200">
            <span className="text-sm text-gold-800">Totaal incl. BTW</span>
            <span className="font-display text-xl text-gold-900">{formatEuro(total)}</span>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button type="submit" variant="primary" disabled={isPending} className="w-full">
            {isPending ? 'Bezig...' : 'Bestelling plaatsen'}
          </Button>

          <p className="text-center space-x-3">
            <Link href="/mijn-bestelling" className="text-xs text-ink-400 hover:text-ink-600 hover:underline">
              Al besteld?
            </Link>
            <span className="text-ink-200">·</span>
            <Link href="/login" className="text-xs text-ink-400 hover:text-ink-600 hover:underline">
              Log in
            </Link>
            <span className="text-ink-200">·</span>
            <Link href="/" className="text-xs text-ink-400 hover:text-ink-600 hover:underline">
              Terug
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
