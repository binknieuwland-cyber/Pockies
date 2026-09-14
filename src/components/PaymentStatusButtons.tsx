'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { PaymentStatus } from '@prisma/client'
import { setPaymentStatus } from '@/app/actions'

const LABELS: Record<PaymentStatus, string> = {
  NOG_NIET_GESTUURD: 'Nog niet',
  TIKKIE_GESTUURD: 'Gestuurd',
  BETAALD: 'Betaald',
}

const ORDER: PaymentStatus[] = ['NOG_NIET_GESTUURD', 'TIKKIE_GESTUURD', 'BETAALD']

export default function PaymentStatusButtons({
  personId,
  status,
}: {
  personId: number
  status: PaymentStatus
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = (next: PaymentStatus) => {
    if (next === status || isPending) return
    startTransition(async () => {
      await setPaymentStatus(personId, next)
      router.refresh()
    })
  }

  return (
    <div className="flex gap-1">
      {ORDER.map((s) => (
        <button
          key={s}
          type="button"
          disabled={isPending}
          onClick={() => handleClick(s)}
          className={`px-2 py-1 rounded-sm font-mono text-[10px] uppercase tracking-wide border transition-colors disabled:opacity-50 ${
            status === s
              ? s === 'BETAALD'
                ? 'bg-green-600 border-green-600 text-white'
                : s === 'TIKKIE_GESTUURD'
                  ? 'bg-gold-500 border-gold-500 text-white'
                  : 'bg-ink-400 border-ink-400 text-white'
              : 'border-ink-200 text-ink-400 hover:border-ink-400 hover:text-ink-700'
          }`}
        >
          {LABELS[s]}
        </button>
      ))}
    </div>
  )
}
