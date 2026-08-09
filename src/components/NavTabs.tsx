'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Section {
  id: number
  name: string
}

export default function NavTabs({ sections }: { sections: Section[] }) {
  const pathname = usePathname()

  const tabs = [
    { href: '/', label: 'Overzicht' },
    ...sections.map((s) => ({ href: `/sections/${s.id}`, label: s.name })),
  ]

  return (
    <nav className="max-w-app mx-auto overflow-x-auto scrollbar-hide -mb-px">
      <div className="flex min-w-max px-4 lg:px-8 gap-1 lg:gap-2">
        {tabs.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 lg:px-4 py-2.5 font-mono text-xs tracking-wider uppercase whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'border-gold-500 text-white'
                  : 'border-transparent text-ink-300 hover:text-white hover:border-ink-500'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
