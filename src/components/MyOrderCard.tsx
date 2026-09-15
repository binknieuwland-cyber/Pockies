'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Card from './ui/Card'
import Button from './ui/Button'
import OrderLinesEditor, { newOrderLine, linesTotal, type OrderLine, type Product } from './OrderLinesEditor'
import { inclBtw, formatEuro } from '@/lib/utils'
import { updateOwnOrder } from '@/app/mijn-overzicht/actions'

export interface ExistingOrderLine {
  productId: number
  size: string
  quantity: number
  note: string
  productName: string
  priceExclBtw: number
}

const STATUS_LABEL: Record<'NOG_NIET_GESTUURD' | 'TIKKIE_GESTUURD' | 'BETAALD', string> = {
  NOG_NIET_GESTUURD: 'Tikkie nog niet gestuurd',
  TIKKIE_GESTUURD: 'Tikkie gestuurd',
  BETAALD: 'Betaald',
}

export default function MyOrderCard({
  products,
  existingLines,
  paymentStatus,
}: {
  products: Product[]
  existingLines: ExistingOrderLine[]
  paymentStatus: 'NOG_NIET_GESTUURD' | 'TIKKIE_GESTUURD' | 'BETAALD'
}) {
  const canEdit = paymentStatus === 'NOG_NIET_GESTUURD'
  const [editing, setEditing] = useState(existingLines.length === 0 && canEdit)
  const [lines, setLines] = useState<OrderLine[]>(() =>
    existingLines.length > 0
      ? existingLines.map((l) => ({ ...newOrderLine(l.productId), size: l.size, quantity: l.quantity, note: l.note }))
      : [newOrderLine(products[0]?.id ?? 0)],
  )
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSave = () => {
    setError('')
    startTransition(async () => {
      try {
        await updateOwnOrder(lines.map(({ productId, size, quantity, note }) => ({ productId, size, quantity, note })))
        setEditing(false)
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      }
    })
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-4 lg:px-5 py-3 bg-paper-50 border-b border-t-2 border-t-gold-400 border-ink-100 flex items-center justify-between gap-3">
        <h2 className="font-mono font-medium text-ink-500 text-xs uppercase tracking-wider">
          Jouw bestelling
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500 bg-white px-2 py-1 rounded-sm shrink-0">
          {STATUS_LABEL[paymentStatus]}
        </span>
      </div>

      <div className="px-4 lg:px-6 py-4 space-y-4">
        {editing ? (
          <>
            <OrderLinesEditor products={products} lines={lines} onChange={setLines} />
            <div className="bg-gold-50 rounded-sm px-4 py-3 flex items-center justify-between border border-gold-200">
              <span className="text-sm text-gold-800">Totaal incl. BTW</span>
              <span className="font-display text-xl text-gold-900">
                {formatEuro(linesTotal(products, lines))}
              </span>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-2">
              {existingLines.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => {
                    setError('')
                    setEditing(false)
                    setLines(
                      existingLines.map((l) => ({
                        ...newOrderLine(l.productId),
                        size: l.size,
                        quantity: l.quantity,
                        note: l.note,
                      })),
                    )
                  }}
                >
                  Annuleren
                </Button>
              )}
              <Button variant="primary" disabled={isPending} onClick={handleSave} className="flex-1">
                {isPending ? 'Opslaan...' : 'Wijzigingen opslaan'}
              </Button>
            </div>
          </>
        ) : existingLines.length === 0 ? (
          <p className="text-ink-400 text-sm text-center py-4">
            Je hebt nog niets besteld — neem contact op met Comm Pockies als je denkt dat dit niet
            klopt.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-ink-50">
              {existingLines.map((o, i) => (
                <li key={i} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="text-ink-800">
                    {o.productName} · {o.size}
                    {o.quantity > 1 ? ` · ${o.quantity}×` : ''}
                    {o.note ? <span className="text-ink-400"> · {o.note}</span> : null}
                  </span>
                  <span className="font-medium text-ink-900 tabular-nums">
                    {formatEuro(inclBtw(o.priceExclBtw) * o.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            {canEdit ? (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Bestelling wijzigen
              </Button>
            ) : (
              <p className="text-xs text-ink-500">
                Je bestelling is al in verwerking en kan niet meer gewijzigd worden. Neem contact
                op met Comm Pockies als er iets moet veranderen.
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
