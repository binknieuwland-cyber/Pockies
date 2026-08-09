import Link from 'next/link'
import type { Metadata } from 'next'
import Card from '@/components/ui/Card'
import { IconArrowLeft } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Ontwerp — Voorstraat 42 shop',
}

export default function DesignPage() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
      >
        <IconArrowLeft className="w-4 h-4" />
        Terug naar overzicht
      </Link>

      <div>
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">Ontwerp</h2>
        <p className="text-sm text-gray-500 mt-0.5">Pockies met hondenprint</p>
      </div>

      <Card className="overflow-hidden max-w-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/design/pockies-hondenprint.png"
          alt="Ontwerp: Pockies met hondenprint"
          className="w-full h-auto"
        />
      </Card>
    </div>
  )
}
