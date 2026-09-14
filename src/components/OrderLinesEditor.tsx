'use client'

import Card from './ui/Card'
import { IconPlus, IconClose } from './icons'
import { inclBtw, formatEuro } from '@/lib/utils'

export interface Product {
  id: number
  name: string
  priceExclBtw: number
}

export interface OrderLine {
  key: number
  productId: number
  size: string
  quantity: number
  note: string
}

const SIZES = ['S', 'M', 'L', 'XL']
let lineKeySeq = 0

export function newOrderLine(defaultProductId: number): OrderLine {
  lineKeySeq += 1
  return { key: lineKeySeq, productId: defaultProductId, size: 'M', quantity: 1, note: '' }
}

export function linesTotal(products: Product[], lines: OrderLine[]): number {
  return lines.reduce((sum, line) => {
    const product = products.find((p) => p.id === line.productId)
    return sum + (product ? inclBtw(product.priceExclBtw) * line.quantity : 0)
  }, 0)
}

export default function OrderLinesEditor({
  products,
  lines,
  onChange,
}: {
  products: Product[]
  lines: OrderLine[]
  onChange: (lines: OrderLine[]) => void
}) {
  const updateLine = (key: number, patch: Partial<OrderLine>) => {
    onChange(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  }

  const addLine = () => onChange([...lines, newOrderLine(products[0]?.id ?? 0)])
  const removeLine = (key: number) =>
    onChange(lines.length > 1 ? lines.filter((l) => l.key !== key) : lines)

  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        const product = products.find((p) => p.id === line.productId)
        const lineTotal = product ? inclBtw(product.priceExclBtw) * line.quantity : 0
        return (
          <Card key={line.key} className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-400">
                Product {idx + 1}
              </p>
              {lines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(line.key)}
                  className="text-ink-300 hover:text-red-600 p-1"
                  aria-label="Product verwijderen"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={line.productId}
              onChange={(e) => updateLine(line.key, { productId: Number(e.target.value) })}
              className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 bg-white focus:outline-none focus:ring-2 focus:ring-ink-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatEuro(inclBtw(p.priceExclBtw))}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-4 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateLine(line.key, { size: s })}
                  className={`py-3 rounded-sm font-mono text-sm font-medium border-2 transition-colors ${
                    line.size === s
                      ? 'border-ink-700 bg-ink-50 text-ink-800'
                      : 'border-ink-200 text-ink-700 hover:border-ink-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateLine(line.key, { quantity: Math.max(1, line.quantity - 1) })}
                className="w-11 h-11 rounded-sm border border-ink-200 text-xl font-medium text-ink-700 hover:bg-paper-50 flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={99}
                value={line.quantity}
                onChange={(e) =>
                  updateLine(line.key, { quantity: Math.max(1, Number(e.target.value)) })
                }
                className="w-16 text-center rounded-sm border border-ink-200 px-2 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500"
              />
              <button
                type="button"
                onClick={() => updateLine(line.key, { quantity: line.quantity + 1 })}
                className="w-11 h-11 rounded-sm border border-ink-200 text-xl font-medium text-ink-700 hover:bg-paper-50 flex items-center justify-center"
              >
                +
              </button>
              <span className="ml-auto text-sm font-semibold text-ink-900 tabular-nums">
                {formatEuro(lineTotal)}
              </span>
            </div>

            <input
              type="text"
              value={line.note}
              onChange={(e) => updateLine(line.key, { note: e.target.value })}
              placeholder="Opmerking (optioneel)"
              className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
            />
          </Card>
        )
      })}

      <button
        type="button"
        onClick={addLine}
        className="w-full flex items-center justify-center gap-1.5 rounded-sm border-2 border-dashed border-ink-200 py-3 text-sm font-medium text-ink-700 hover:border-ink-400 hover:bg-white transition-colors"
      >
        <IconPlus className="w-4 h-4" />
        Nog een product toevoegen
      </button>
    </div>
  )
}
