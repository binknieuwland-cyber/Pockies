'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Card from './ui/Card'
import Button from './ui/Button'
import OrderLinesEditor, { newOrderLine, linesTotal, type OrderLine, type Product } from './OrderLinesEditor'
import PhoneInput from './PhoneInput'
import { formatPhoneDisplay } from '@/lib/phone'
import { inclBtw, formatEuro } from '@/lib/utils'
import { lookupOrdersByPhone, updateMyOrder } from '@/app/mijn-bestelling/actions'

type LookupResult = Awaited<ReturnType<typeof lookupOrdersByPhone>>[number]

const STATUS_LABEL: Record<LookupResult['paymentStatus'], string> = {
  NOG_NIET_GESTUURD: 'Tikkie nog niet gestuurd',
  TIKKIE_GESTUURD: 'Tikkie gestuurd',
  BETAALD: 'Betaald',
}

function PersonOrderCard({ person, phone, products }: { person: LookupResult; phone: string; products: Product[] }) {
  const [lines, setLines] = useState<OrderLine[]>(() =>
    person.orders.map((o) => ({ ...newOrderLine(o.productId), productId: o.productId, size: o.size, quantity: o.quantity, note: o.note })),
  )
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const total = linesTotal(products, lines)

  const handleSave = () => {
    setError('')
    setSaved(false)
    startTransition(async () => {
      try {
        await updateMyOrder(
          person.id,
          phone,
          lines.map(({ productId, size, quantity, note }) => ({ productId, size, quantity, note })),
        )
        setSaved(true)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      }
    })
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-serif font-semibold text-ink-900">{person.name}</p>
          <p className="font-mono text-xs text-ink-400">
            {person.sectionName}
            {person.groupName ? ` · ${person.groupName}` : ''}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500 bg-paper-100 px-2 py-1 rounded-sm">
          {STATUS_LABEL[person.paymentStatus]}
        </span>
      </div>

      {person.canEdit ? (
        <>
          <OrderLinesEditor products={products} lines={lines} onChange={setLines} />
          <div className="bg-gold-50 rounded-sm px-4 py-3 flex items-center justify-between border border-gold-200">
            <span className="text-sm text-gold-800">Totaal incl. BTW</span>
            <span className="font-display text-xl text-gold-900">{formatEuro(total)}</span>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {saved && <p className="text-green-700 text-sm">Bestelling bijgewerkt!</p>}
          <Button variant="primary" disabled={isPending} onClick={handleSave} className="w-full">
            {isPending ? 'Opslaan...' : 'Wijzigingen opslaan'}
          </Button>
        </>
      ) : (
        <>
          <ul className="divide-y divide-ink-50 border-t border-ink-100">
            {person.orders.map((o, i) => (
              <li key={i} className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-ink-800">
                  {o.productName} · {o.size}
                  {o.quantity > 1 ? ` · ${o.quantity}×` : ''}
                </span>
                <span className="font-medium text-ink-900 tabular-nums">
                  {formatEuro(inclBtw(o.priceExclBtw) * o.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-500">
            Deze bestelling is al in verwerking en kan niet meer gewijzigd worden. Neem contact op
            met Comm Pockies als er iets moet veranderen.
          </p>
        </>
      )}
    </Card>
  )
}

export default function LookupOrderForm({ products }: { products: Product[] }) {
  const [phoneInput, setPhoneInput] = useState('')
  const [searchedPhone, setSearchedPhone] = useState<string | null>(null)
  const [results, setResults] = useState<LookupResult[] | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        const found = await lookupOrdersByPhone(phoneInput)
        setResults(found)
        setSearchedPhone(phoneInput.trim())
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      }
    })
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
            Bekijk of wijzig je bestelling
          </h1>
        </div>

        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          <Card className="p-5 space-y-4">
            <PhoneInput
              id="lookup-phone"
              label="Telefoonnummer waarmee je besteld hebt"
              value={phoneInput}
              onChange={setPhoneInput}
              required
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" variant="primary" disabled={isPending} className="w-full">
              {isPending ? 'Zoeken...' : 'Zoeken'}
            </Button>
          </Card>
        </form>

        {results && results.length === 0 && (
          <Card className="p-5 text-center space-y-2">
            <p className="text-sm text-ink-600">
              Geen bestelling gevonden bij {searchedPhone && formatPhoneDisplay(searchedPhone)}.
            </p>
            <Link href="/bestellen" className="text-sm text-ink-700 font-medium hover:underline">
              Nog geen bestelling? Plaats er hier een →
            </Link>
          </Card>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4">
            {results.map((person) => (
              <PersonOrderCard key={person.id} person={person} phone={searchedPhone!} products={products} />
            ))}
          </div>
        )}

        <p className="text-center mt-6">
          <Link href="/" className="text-xs text-ink-400 hover:text-ink-600 hover:underline">
            ← Terug naar het beginscherm
          </Link>
        </p>
      </div>
    </div>
  )
}
