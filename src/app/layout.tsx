import type { Metadata } from 'next'
import { Fraunces, Bebas_Neue, Inter, IBM_Plex_Mono } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import { prisma } from '@/lib/prisma'
import NavTabs from '@/components/NavTabs'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
})
const bebas = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-numeral',
  weight: '400',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Voorstraat 42 shop',
  description: 'Bestellingentracker voor ondergoed',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sections = await prisma.section.findMany({ orderBy: { id: 'asc' } })

  return (
    <html
      lang="nl"
      className={`${fraunces.variable} ${bebas.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body className="bg-paper min-h-dvh text-ink-900 font-sans">
        <header className="bg-ink-900 sticky top-0 z-20 border-b-2 border-gold-500">
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
                <p className="font-mono text-[10px] tracking-[0.2em] text-gold-400 uppercase leading-tight truncate">
                  VS42 · Domus Mater Nobis Est
                </p>
                <h1 className="font-serif text-lg lg:text-xl font-semibold text-white tracking-tight leading-tight truncate">
                  De Voorstraat Shop
                </h1>
              </div>
              <p className="hidden lg:block ml-auto font-mono text-xs text-ink-300 shrink-0">
                Sinds 1962
              </p>
            </div>
          </div>
          <NavTabs sections={sections} />
        </header>
        <main className="max-w-app mx-auto px-4 lg:px-8 py-5 lg:py-8">{children}</main>
      </body>
    </html>
  )
}
