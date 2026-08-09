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
              className={`px-3 lg:px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors rounded-t-lg ${
                active
                  ? 'border-white text-white'
                  : 'border-transparent text-brand-200 hover:text-white hover:border-brand-300'
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
