import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-ink-800 text-white hover:bg-ink-900 active:bg-ink-950 border border-ink-800',
  secondary:
    'bg-white text-ink-700 border border-ink-200 hover:bg-paper-50 active:bg-paper-100',
  danger: 'bg-crimson-600 text-white hover:bg-crimson-700 active:bg-crimson-700 border border-crimson-600',
  ghost: 'text-ink-700 hover:bg-ink-50 active:bg-ink-100',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 font-mono text-xs uppercase tracking-wide rounded-sm gap-1',
  md: 'px-4 py-3 text-sm font-medium rounded-sm gap-1.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
}
