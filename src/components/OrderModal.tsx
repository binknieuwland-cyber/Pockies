'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Modal from './Modal'
import Button from './ui/Button'
import { addOrder, updateOrder } from '@/app/actions'
import { inclBtw, formatEuro } from '@/lib/utils'

interface Product {
  id: number
  name: string
  priceExclBtw: number
}

interface Props {
  personId: number
  personName: string
  products: Product[]
  /** Pass order to edit, omit to add */
  order?: {
    id: number
    productId: number
    size: string
    quantity: number
    note: string | null
  }
  onClose: () => void
}

const SIZES = ['S', 'M', 'L', 'XL']

export default function OrderModal({ personId, personName, products, order, onClose }: Props) {
  const [productId, setProductId] = useState(order?.productId ?? products[0]?.id ?? 0)
  const [size, setSize] = useState(order?.size ?? 'M')
  const [quantity, setQuantity] = useState(order?.quantity ?? 1)
  const [note, setNote] = useState(order?.note ?? '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const selectedProduct = products.find((p) => p.id === productId)
  const unitPrice = selectedProduct ? inclBtw(selectedProduct.priceExclBtw) : 0
  const lineTotal = unitPrice * quantity

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        if (order) {
          await updateOrder(order.id, productId, size, quantity, note)
        } else {
          await addOrder(personId, productId, size, quantity, note)
        }
        router.refresh()
        onClose()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      }
    })
  }

  return (
    <Modal
      title={order ? 'Bestelling bewerken' : `Bestelling voor ${personName}`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product */}
        <div>
          <label htmlFor="order-product" className="block text-sm font-medium text-ink-700 mb-1">
            Product
          </label>
          <select
            id="order-product"
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
            className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 bg-white"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatEuro(inclBtw(p.priceExclBtw))}
              </option>
            ))}
          </select>
        </div>

        {/* Size */}
        <div>
          <p className="block text-sm font-medium text-ink-700 mb-2">Maat</p>
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`py-3 rounded-sm font-mono text-sm font-medium border-2 transition-colors ${
                  size === s
                    ? 'border-ink-700 bg-ink-50 text-ink-800'
                    : 'border-ink-200 text-ink-700 hover:border-ink-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="order-qty" className="block text-sm font-medium text-ink-700 mb-1">
            Aantal
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 h-11 rounded-sm border border-ink-200 text-xl font-medium text-ink-700 hover:bg-paper-50 flex items-center justify-center"
            >
              −
            </button>
            <input
              id="order-qty"
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-16 text-center rounded-sm border border-ink-200 px-2 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-11 h-11 rounded-sm border border-ink-200 text-xl font-medium text-ink-700 hover:bg-paper-50 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Note */}
        <div>
          <label htmlFor="order-note" className="block text-sm font-medium text-ink-700 mb-1">
            Opmerking <span className="text-ink-400">(optioneel)</span>
          </label>
          <input
            id="order-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bijv. cadeau, kleur voorkeur…"
            className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
          />
        </div>

        {/* Price preview */}
        <div className="bg-gold-50 rounded-sm px-4 py-3 flex items-center justify-between border border-gold-200">
          <span className="text-sm text-gold-800">Totaal incl. BTW</span>
          <span className="font-display text-xl text-gold-900">{formatEuro(lineTotal)}</span>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Annuleren
          </Button>
          <Button type="submit" variant="primary" disabled={isPending} className="flex-1">
            {isPending ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
