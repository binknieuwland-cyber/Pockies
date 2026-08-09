import { HTMLAttributes, ReactNode } from 'react'

export default function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}
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
      className={`px-4 lg:px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider bg-gray-50 border-b border-gray-100 ${className}`}
    >
      {children}
    </h2>
  )
}
