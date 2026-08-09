import type { Metadata } from 'next'
import Image from 'next/image'
import './globals.css'
import { prisma } from '@/lib/prisma'
import NavTabs from '@/components/NavTabs'

export const metadata: Metadata = {
  title: 'Voorstraat 42 shop',
  description: 'Bestellingentracker voor ondergoed',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sections = await prisma.section.findMany({ orderBy: { id: 'asc' } })

  return (
    <html lang="nl">
      <body className="bg-gray-50 min-h-dvh text-gray-900">
        <header className="bg-brand-600 sticky top-0 z-20 shadow-sm">
          <div className="max-w-app mx-auto px-4 lg:px-8 pt-3 lg:pt-4 pb-0">
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/logo.png"
                alt="VS42"
                width={160}
                height={160}
                priority
                className="h-11 w-11 lg:h-14 lg:w-14 object-contain shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight leading-tight truncate">
                  DE VOORSTRAAT SHOP
                </h1>
                <p className="hidden lg:block text-xs text-brand-200 leading-tight">
                  VS42 · Sinds 1962
                </p>
              </div>
            </div>
          </div>
          <NavTabs sections={sections} />
        </header>
        <main className="max-w-app mx-auto px-4 lg:px-8 py-5 lg:py-8">{children}</main>
      </body>
    </html>
  )
}
