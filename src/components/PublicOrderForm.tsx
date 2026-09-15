'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Card from './ui/Card'
import Button from './ui/Button'
import OrderLinesEditor, { newOrderLine, linesTotal, type OrderLine, type Product } from './OrderLinesEditor'
import { formatEuro } from '@/lib/utils'
import { submitPublicOrder, type PublicCategory } from '@/app/bestellen/actions'

interface NamedOption {
  id: number
  name: string
}

type Step =
  | 'oud-huisgenoot'
  | 'virgiel'
  | 'clubgenoot'
  | 'huis-vraag'
  | 'club'
  | 'huis'
  | 'referrer'
  | 'form'

function Shell({ children }: { children: React.ReactNode }) {
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
          <h1 className="mt-1 font-serif text-xl font-semibold text-ink-900">Bestelling plaatsen</h1>
        </div>
        {children}
      </div>
    </div>
  )
}

function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-4 text-xs text-ink-400 hover:text-ink-700 hover:underline"
    >
      ← Terug
    </button>
  )
}

function YesNoStep({
  question,
  onBack,
  onYes,
  onNo,
}: {
  question: string
  onBack?: () => void
  onYes: () => void
  onNo: () => void
}) {
  return (
    <Card className="p-6 sm:p-8">
      {onBack && <BackLink onBack={onBack} />}
      <p className="font-serif text-lg font-semibold text-ink-900 mb-5">{question}</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onYes}
          className="rounded-sm border-2 border-ink-700 bg-ink-50 py-4 text-sm font-medium text-ink-900 hover:bg-ink-100 transition-colors"
        >
          Ja
        </button>
        <button
          type="button"
          onClick={onNo}
          className="rounded-sm border-2 border-ink-200 py-4 text-sm font-medium text-ink-700 hover:border-ink-400 transition-colors"
        >
          Nee
        </button>
      </div>
    </Card>
  )
}

function PickStep({
  question,
  options,
  emptyLabel,
  onBack,
  onPick,
  extra,
}: {
  question: string
  options: NamedOption[]
  emptyLabel?: string
  onBack: () => void
  onPick: (id: number | null) => void
  extra?: React.ReactNode
}) {
  return (
    <Card className="p-6 sm:p-8">
      <BackLink onBack={onBack} />
      <p className="font-serif text-lg font-semibold text-ink-900 mb-5">{question}</p>
      <div className="space-y-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id)}
            className="w-full text-left rounded-sm border-2 border-ink-200 px-4 py-3 text-sm text-ink-800 hover:border-ink-700 hover:bg-ink-50 transition-colors"
          >
            {o.name}
          </button>
        ))}
        {options.length === 0 && (
          <p className="text-sm text-ink-400">Nog niemand in de lijst</p>
        )}
        {emptyLabel && (
          <button
            type="button"
            onClick={() => onPick(null)}
            className="w-full text-left rounded-sm border-2 border-dashed border-ink-200 px-4 py-3 text-sm text-ink-500 hover:border-ink-400 transition-colors"
          >
            {emptyLabel}
          </button>
        )}
      </div>
      {extra}
    </Card>
  )
}

export default function PublicOrderForm({
  products,
  clubs,
  huizen,
  huisgenoten,
}: {
  products: Product[]
  clubs: NamedOption[]
  huizen: NamedOption[]
  huisgenoten: NamedOption[]
}) {
  const defaultProductId = products[0]?.id ?? 0

  const [stack, setStack] = useState<Step[]>(['oud-huisgenoot'])
  const step = stack[stack.length - 1]
  const goTo = (s: Step) => setStack((prev) => [...prev, s])
  const goBack = () => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))

  const [category, setCategory] = useState<PublicCategory | null>(null)
  const [groupId, setGroupId] = useState<number | null>(null)
  const [newHuisNaam, setNewHuisNaam] = useState('')
  const [showNewHuis, setShowNewHuis] = useState(false)
  const [referredById, setReferredById] = useState<number | null>(null)
  const [selectionLabel, setSelectionLabel] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [lines, setLines] = useState<OrderLine[]>([newOrderLine(defaultProductId)])
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ phone: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const total = linesTotal(products, lines)

  const enterForm = (cat: PublicCategory, label: string) => {
    setCategory(cat)
    setSelectionLabel(label)
    goTo('form')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return
    setError('')
    startTransition(async () => {
      try {
        await submitPublicOrder({
          name,
          phone,
          category,
          groupId,
          newHuisNaam: category === 'HUIS' && showNewHuis ? newHuisNaam : null,
          referredById,
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
      <Shell>
        <Card className="p-6 sm:p-8 text-center">
          <h2 className="font-serif text-xl font-semibold text-ink-900">Bedankt voor je bestelling!</h2>
          <p className="mt-3 text-sm text-ink-600">
            We nemen via Tikkie contact op op <span className="font-medium">{done.phone}</span> om
            te betalen.
          </p>
        </Card>
      </Shell>
    )
  }

  if (step === 'oud-huisgenoot') {
    return (
      <Shell>
        <YesNoStep
          question="Ben je oud-huisgenoot van Voorstraat 42?"
          onYes={() => enterForm('OUD_HUISGENOOT', 'Oud-huisgenoot')}
          onNo={() => goTo('virgiel')}
        />
      </Shell>
    )
  }

  if (step === 'virgiel') {
    return (
      <Shell>
        <YesNoStep
          question="Ben je lid van Virgiel?"
          onBack={goBack}
          onYes={() => goTo('clubgenoot')}
          onNo={() => goTo('referrer')}
        />
      </Shell>
    )
  }

  if (step === 'clubgenoot') {
    return (
      <Shell>
        <YesNoStep
          question="Ben je clubgenoot van een huisgenoot?"
          onBack={goBack}
          onYes={() => goTo('club')}
          onNo={() => goTo('huis-vraag')}
        />
      </Shell>
    )
  }

  if (step === 'huis-vraag') {
    return (
      <Shell>
        <YesNoStep
          question="Bestellen jullie als huis?"
          onBack={goBack}
          onYes={() => goTo('huis')}
          onNo={() => goTo('referrer')}
        />
      </Shell>
    )
  }

  if (step === 'club') {
    return (
      <Shell>
        <PickStep
          question="Welke club?"
          options={clubs}
          emptyLabel="Mijn club staat er niet bij"
          onBack={goBack}
          onPick={(id) => {
            setGroupId(id)
            const label = id ? clubs.find((c) => c.id === id)?.name ?? '' : 'Overig'
            enterForm('CLUB', label)
          }}
        />
      </Shell>
    )
  }

  if (step === 'huis') {
    return (
      <Shell>
        <Card className="p-6 sm:p-8">
          <BackLink onBack={goBack} />
          <p className="font-serif text-lg font-semibold text-ink-900 mb-5">
            Welk huis bestelt er?
          </p>
          {!showNewHuis && (
            <div className="space-y-2">
              {huizen.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setGroupId(h.id)
                    enterForm('HUIS', h.name)
                  }}
                  className="w-full text-left rounded-sm border-2 border-ink-200 px-4 py-3 text-sm text-ink-800 hover:border-ink-700 hover:bg-ink-50 transition-colors"
                >
                  {h.name}
                </button>
              ))}
              {huizen.length === 0 && (
                <p className="text-sm text-ink-400 mb-2">Nog geen huizen geregistreerd</p>
              )}
              <button
                type="button"
                onClick={() => setShowNewHuis(true)}
                className="w-full text-left rounded-sm border-2 border-dashed border-ink-200 px-4 py-3 text-sm text-ink-500 hover:border-ink-400 transition-colors"
              >
                + Nieuw huis toevoegen
              </button>
            </div>
          )}
          {showNewHuis && (
            <div className="space-y-3">
              <input
                type="text"
                value={newHuisNaam}
                onChange={(e) => setNewHuisNaam(e.target.value)}
                placeholder="Naam van jullie huis"
                autoFocus
                className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
              />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowNewHuis(false)} className="flex-1">
                  Annuleren
                </Button>
                <Button
                  variant="primary"
                  disabled={!newHuisNaam.trim()}
                  onClick={() => {
                    setGroupId(null)
                    enterForm('HUIS', newHuisNaam.trim())
                  }}
                  className="flex-1"
                >
                  Verder
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Shell>
    )
  }

  if (step === 'referrer') {
    return (
      <Shell>
        <PickStep
          question="Via wie bestel je?"
          options={huisgenoten}
          onBack={goBack}
          onPick={(id) => {
            setReferredById(id)
            const label = huisgenoten.find((h) => h.id === id)?.name ?? ''
            enterForm('VIA_HUISGENOOT', `Via ${label}`)
          }}
        />
      </Shell>
    )
  }

  // step === 'form'
  return (
    <Shell>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="p-5 space-y-4">
          <button
            type="button"
            onClick={() => setStack(['oud-huisgenoot'])}
            className="text-xs text-ink-400 hover:text-ink-700 hover:underline"
          >
            ← Andere keuze maken
          </button>
          <p className="font-mono text-[10px] uppercase tracking-wider text-gold-600">
            {selectionLabel}
          </p>

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
    </Shell>
  )
}
