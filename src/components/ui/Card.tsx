import { HTMLAttributes, ReactNode } from 'react'

export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-md border border-ink-100 ${className}`}
      {...props}
    />
  )
}

export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h2
      className={`px-4 lg:px-5 py-3 font-mono font-medium text-ink-500 text-xs uppercase tracking-wider bg-paper-50 border-b border-t-2 border-t-gold-400 border-ink-100 ${className}`}
    >
      {children}
    </h2>
  )
}
