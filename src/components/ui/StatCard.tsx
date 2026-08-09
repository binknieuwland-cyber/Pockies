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
      className={`rounded-2xl p-4 lg:p-5 shadow-sm border ${
        brand ? 'bg-brand-600 border-brand-600' : 'bg-white border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className={`text-xs font-medium uppercase tracking-wider truncate ${
              brand ? 'text-brand-200' : 'text-gray-400'
            }`}
          >
            {label}
          </p>
          <p
            className={`mt-1.5 font-bold leading-none tabular-nums ${
              brand ? 'text-white text-2xl lg:text-3xl' : 'text-gray-900 text-3xl lg:text-4xl'
            }`}
          >
            {value}
          </p>
          {hint && (
            <p className={`text-xs mt-1.5 ${brand ? 'text-brand-200' : 'text-gray-400'}`}>{hint}</p>
          )}
        </div>
        <div
          className={`shrink-0 grid place-items-center w-9 h-9 lg:w-10 lg:h-10 rounded-xl ${
            brand ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand-600'
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
