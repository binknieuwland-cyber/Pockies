'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Section {
  id: number
  name: string
}

interface Props {
  sections: Section[]
  role: 'COMM_POCKIES' | 'HUISGENOOT'
  huisgenotenSectionId: number
}

export default function NavTabs({ sections, role, huisgenotenSectionId }: Props) {
  const pathname = usePathname()

  const visibleSections =
    role === 'COMM_POCKIES' ? sections : sections.filter((s) => s.id === huisgenotenSectionId)

  const tabs = [
    ...(role === 'COMM_POCKIES' ? [{ href: '/', label: 'Overzicht' }] : []),
    ...visibleSections.map((s) => ({ href: `/sections/${s.id}`, label: s.name })),
    ...(role === 'COMM_POCKIES' ? [{ href: '/admin/accounts', label: 'Accounts' }] : []),
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
