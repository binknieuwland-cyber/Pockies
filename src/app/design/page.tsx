import Link from 'next/link'
import type { Metadata } from 'next'
import Card from '@/components/ui/Card'
import LaurelDivider from '@/components/ui/LaurelDivider'
import { IconArrowLeft } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Ontwerp — Voorstraat 42 shop',
}

export default function DesignPage() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink-600 hover:text-ink-900"
      >
        <IconArrowLeft className="w-4 h-4" />
        Terug naar overzicht
      </Link>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold-600">Ontwerp</p>
        <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-ink-950 leading-tight mt-1">
          Pockies met Samprint
        </h2>
        <LaurelDivider className="mt-3" />
      </div>

      <Card className="overflow-hidden max-w-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/design/pockies-hondenprint.png"
          alt="Ontwerp: Pockies met Samprint"
          className="w-full h-auto"
        />
      </Card>
    </div>
  )
}
