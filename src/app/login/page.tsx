'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { login } from './actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      try {
        await login(email, code)
        router.refresh()
      } catch (err: unknown) {
        // NEXT_REDIRECT wordt door Next.js zelf afgehandeld en komt hier niet als echte fout aan
        if (err instanceof Error && err.message !== 'NEXT_REDIRECT') {
          setError(err.message)
        }
      }
    })
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-paper">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src="/logo.png"
            alt="VS42"
            width={160}
            height={160}
            priority
            className="h-16 w-16 object-contain mb-3"
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold-600">
            VS42 · Sinds 1962
          </p>
          <h1 className="mt-1 font-serif text-xl font-semibold text-ink-900">
            De Voorstraat Shop
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">
              E-mailadres
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@voorbeeld.nl"
              required
              autoFocus
              autoComplete="username"
              className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-ink-700 mb-1">
              Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Jouw persoonlijke code"
              required
              autoComplete="current-password"
              className="w-full rounded-sm border border-ink-200 px-4 py-3 text-ink-900 tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-ink-500 focus:border-transparent"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" variant="primary" disabled={isPending} className="w-full">
            {isPending ? 'Inloggen...' : 'Inloggen'}
          </Button>
        </form>

        <p className="text-center mt-4 space-x-3">
          <Link href="/bestellen" className="text-xs text-ink-400 hover:text-ink-600 hover:underline">
            Nog geen account? Plaats hier een bestelling
          </Link>
          <span className="text-ink-200">·</span>
          <Link href="/" className="text-xs text-ink-400 hover:text-ink-600 hover:underline">
            Terug
          </Link>
        </p>
      </Card>
    </div>
  )
}
