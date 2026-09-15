'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Card, { CardHeader } from './ui/Card'
import Button from './ui/Button'
import { addHuisgenoot, createAccount, regenerateCode } from '@/app/admin/accounts/actions'

interface PersonRow {
  id: number
  name: string
  user: { id: number; email: string; role: 'COMM_POCKIES' | 'HUISGENOOT' } | null
}

function AddHuisgenootForm() {
  const [name, setName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    startTransition(async () => {
      try {
        await addHuisgenoot(name, fullName, email)
        setSuccess(`${fullName} (${name}) is toegevoegd — kan direct inloggen met ${email}`)
        setName('')
        setFullName('')
        setEmail('')
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 lg:px-6 py-4 space-y-3">
      <div className="grid sm:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Voorletters (bv. BN)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-sm border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Volledige naam"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="rounded-sm border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
        />
        <input
          type="email"
          placeholder="mail@voorbeeld.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-sm border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-700 text-sm">{success}</p>}
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={isPending || !name.trim() || !fullName.trim() || !email.trim()}
      >
        {isPending ? 'Toevoegen...' : 'Huisgenoot toevoegen'}
      </Button>
    </form>
  )
}

export default function AccountsPanel({ persons }: { persons: PersonRow[] }) {
  const [emailDrafts, setEmailDrafts] = useState<Record<number, string>>({})
  const [created, setCreated] = useState<{ personId: number; email: string } | null>(null)
  const [revealedCode, setRevealedCode] = useState<{ personId: number; email: string; code: string } | null>(
    null,
  )
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCreate = (personId: number) => {
    const email = emailDrafts[personId] ?? ''
    setError('')
    startTransition(async () => {
      try {
        const result = await createAccount(personId, email)
        setCreated({ personId, email: result.email })
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      }
    })
  }

  const handleRegenerate = (userId: number, personId: number) => {
    setError('')
    startTransition(async () => {
      try {
        const result = await regenerateCode(userId)
        setRevealedCode({ personId, email: result.email, code: result.code })
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader>Nieuwe huisgenoot toevoegen</CardHeader>
        <AddHuisgenootForm />
      </Card>

      <Card className="overflow-hidden">
      <CardHeader>Huisgenoten</CardHeader>
      {error && <p className="px-4 lg:px-6 py-2 text-red-600 text-sm">{error}</p>}
      <ul className="divide-y divide-ink-100">
        {persons.map((person) => (
          <li key={person.id} className="px-4 lg:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="min-w-0 sm:w-40 shrink-0">
                <p className="font-serif font-semibold text-ink-900">{person.name}</p>
                {person.user && (
                  <p className="font-mono text-xs text-ink-400 truncate">{person.user.email}</p>
                )}
              </div>

              {person.user ? (
                person.user.role === 'COMM_POCKIES' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleRegenerate(person.user!.id, person.id)}
                  >
                    Nieuwe code genereren
                  </Button>
                ) : (
                  <p className="text-sm text-ink-500">
                    Account actief — logt in met e-mail, geen code nodig
                  </p>
                )
              ) : (
                <div className="flex flex-1 gap-2">
                  <input
                    type="email"
                    placeholder="mail@voorbeeld.nl"
                    value={emailDrafts[person.id] ?? ''}
                    onChange={(e) =>
                      setEmailDrafts((prev) => ({ ...prev, [person.id]: e.target.value }))
                    }
                    className="flex-1 min-w-0 rounded-sm border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isPending || !(emailDrafts[person.id] ?? '').trim()}
                    onClick={() => handleCreate(person.id)}
                  >
                    Account aanmaken
                  </Button>
                </div>
              )}
            </div>

            {created && created.personId === person.id && (
              <div className="mt-3 rounded-sm border border-gold-400 bg-gold-50 px-4 py-3">
                <p className="text-sm text-ink-800">
                  Account aangemaakt voor <span className="font-medium">{created.email}</span>.
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  {person.name} kan nu direct inloggen met dit e-mailadres — geen code nodig.
                </p>
              </div>
            )}

            {revealedCode && revealedCode.personId === person.id && (
              <div className="mt-3 rounded-sm border border-gold-400 bg-gold-50 px-4 py-3">
                <p className="text-sm text-ink-800">
                  Code voor <span className="font-medium">{revealedCode.email}</span>:
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tracking-widest text-ink-900">
                  {revealedCode.code}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Deze code wordt niet opnieuw getoond — stuur 'm nu privé door.
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
      </Card>
    </div>
  )
}
