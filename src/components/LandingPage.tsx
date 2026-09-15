import Image from 'next/image'
import Link from 'next/link'
import Card from './ui/Card'
import FabricGauge from './ui/FabricGauge'
import { IconArrowRight, IconBox, IconEdit, IconUsers } from './icons'

function ActionBlock({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 bg-white border border-ink-100 rounded-md px-5 py-6 hover:border-gold-400 hover:shadow-sm transition-all"
    >
      <span className="grid place-items-center w-12 h-12 rounded-sm bg-ink-50 text-ink-700 shrink-0 group-hover:bg-gold-50 group-hover:text-gold-700 transition-colors">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-serif text-lg font-semibold text-ink-900">{title}</span>
        <span className="block text-sm text-ink-400 mt-0.5">{subtitle}</span>
      </span>
      <IconArrowRight className="w-5 h-5 text-ink-300 group-hover:text-gold-600 group-hover:translate-x-0.5 transition shrink-0" />
    </Link>
  )
}

export default function LandingPage({ stofMeters, stofDoel }: { stofMeters: number; stofDoel: number }) {
  return (
    <div className="min-h-dvh px-4 py-10 sm:py-14 bg-paper flex justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
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
          <h1 className="mt-1 font-serif text-2xl font-semibold text-ink-900">
            De Voorstraat Shop
          </h1>
        </div>

        {/* ── ONTWERP ─────────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="relative bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/design/pockies-hondenprint.png"
              alt="Ontwerp: Pockies met Samprint"
              className="w-full h-auto"
            />
          </div>
          <div className="px-4 py-3 border-t border-ink-100 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-gold-600">
                Dit ontwerp gaan we maken
              </p>
              <p className="text-sm font-medium text-ink-900">Pockies met Samprint</p>
            </div>
            <Link
              href="/design"
              className="font-mono text-xs text-ink-400 hover:text-ink-700 hover:underline shrink-0"
            >
              Bekijk groter →
            </Link>
          </div>
        </Card>

        {/* ── STOF VOORTGANG ──────────────────────────────────────────── */}
        <Card className="px-4 py-5">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-400 mb-3">
            Samen op weg naar het doel · {stofDoel} m stof
          </p>
          <FabricGauge valueM={stofMeters} goalM={stofDoel} />
        </Card>

        {/* ── ACTIES ──────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <ActionBlock
            href="/login"
            icon={<IconUsers className="w-6 h-6" />}
            title="Huisgenoten login"
            subtitle="Log in met je e-mailadres"
          />
          <ActionBlock
            href="/mijn-bestelling"
            icon={<IconEdit className="w-6 h-6" />}
            title="Al besteld? Login"
            subtitle="Bekijk of wijzig je bestelling"
          />
          <ActionBlock
            href="/bestellen"
            icon={<IconBox className="w-6 h-6" />}
            title="Bestelling plaatsen"
            subtitle="Nieuw hier? Begin je bestelling"
          />
        </div>

        <p className="text-center pt-2">
          <Link
            href="/login?admin=1"
            className="font-mono text-[10px] uppercase tracking-wider text-ink-300 hover:text-ink-500 hover:underline"
          >
            Beheerder inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
