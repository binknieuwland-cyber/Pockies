import { SVGProps } from 'react'

/**
 * Shared line-icon set. All icons share the same visual language
 * (2px stroke, round caps/joins, 24x24 viewBox) so they stay consistent
 * wherever they're used across the app.
 */
type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  }
}

export function IconEdit(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v16m8-8H4" />
    </svg>
  )
}

export function IconChevronDown({ open, ...props }: IconProps & { open?: boolean }) {
  return (
    <svg
      {...base(props)}
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${props.className ?? ''}`}
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14m-6-6l6 6-6 6" />
    </svg>
  )
}

export function IconArrowLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5m6-6l-6 6 6 6" />
    </svg>
  )
}

/** Package/box — used for "Artikelen" stat */
export function IconBox(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  )
}

/** Euro sign — used for money stats */
export function IconEuro(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M17 7.5a6 6 0 100 9M5 10.5h8M5 13.5h7" />
    </svg>
  )
}

/** Two people — used for "Deelnemers" stat */
export function IconUsers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0112 0" />
      <circle cx="17.5" cy="9" r="2.25" />
      <path d="M15.5 13.2a4.5 4.5 0 015.5 4.4" />
    </svg>
  )
}

/** Trending line — used for averages */
export function IconTrendUp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  )
}

/** Stacked layers — used for fabric/progress goal */
export function IconLayers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  )
}

/** Palette — used for the "Bekijk het ontwerp" link */
export function IconPalette(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3a9 9 0 000 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.8.7-1.5 1.5-1.5H16a5 5 0 005-5c0-3.9-4-7-9-7z" />
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="11" cy="7.5" r="1" />
      <circle cx="15" cy="8" r="1" />
    </svg>
  )
}

/** Single laurel sprig — echoes the wreath on the VS42 crest, used as a quiet section motif */
export function IconLaurelSprig(props: IconProps) {
  return (
    <svg viewBox="0 0 60 16" fill="none" {...props}>
      <path d="M1 8h52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {[6, 14, 22, 30, 38, 46].map((x) => (
        <ellipse
          key={x}
          cx={x}
          cy="8"
          rx="4.5"
          ry="2.6"
          transform={`rotate(-32 ${x} 8)`}
          fill="currentColor"
          opacity={0.85}
        />
      ))}
      <circle cx="54" cy="8" r="2" fill="currentColor" />
    </svg>
  )
}
