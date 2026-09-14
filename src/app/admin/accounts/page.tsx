import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import AccountsPanel from '@/components/AccountsPanel'

export const dynamic = 'force-dynamic'

export default async function AccountsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'COMM_POCKIES') redirect(`/sections/${session.huisgenotenSectionId}`)

  const huisgenotenSection = await prisma.section.findFirst({
    where: { name: 'Huisgenoten' },
    include: {
      persons: {
        where: { locked: true },
        orderBy: { sortOrder: 'asc' },
        include: { user: true },
      },
    },
  })

  const persons = (huisgenotenSection?.persons ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    user: p.user ? { id: p.user.id, email: p.user.email } : null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl lg:text-2xl font-semibold text-ink-900 leading-tight">
          Huisgenoten-accounts
        </h2>
        <p className="font-mono text-sm text-ink-500 mt-0.5">
          Beheer inlogcodes voor de {persons.length} huisgenoten
        </p>
      </div>
      <AccountsPanel persons={persons} />
    </div>
  )
}
