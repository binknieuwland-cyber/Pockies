import { ReactNode } from 'react'

interface Props {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon: ReactNode
  tone?: 'default' | 'brand'
}

export default function StatCard({ label, value, hint, icon, tone = 'default' }: Props) {
  const brand = tone === 'brand'
  return (
    <div
      className={`rounded-md p-4 lg:p-5 border border-t-2 ${
        brand ? 'bg-ink-900 border-ink-900 border-t-gold-500' : 'bg-white border-ink-100 border-t-gold-400'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className={`font-mono text-xs uppercase tracking-wider truncate ${
              brand ? 'text-gold-300' : 'text-ink-400'
            }`}
          >
            {label}
          </p>
          <p
            className={`mt-1.5 font-display leading-none tabular-nums ${
              brand ? 'text-white text-3xl lg:text-4xl' : 'text-ink-950 text-4xl lg:text-5xl'
            }`}
          >
            {value}
          </p>
          {hint && (
            <p className={`font-mono text-xs mt-1.5 ${brand ? 'text-ink-300' : 'text-ink-400'}`}>{hint}</p>
          )}
        </div>
        <div
          className={`shrink-0 grid place-items-center w-9 h-9 lg:w-10 lg:h-10 rounded-sm ${
            brand ? 'bg-white/10 text-gold-300' : 'bg-ink-50 text-ink-700'
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
