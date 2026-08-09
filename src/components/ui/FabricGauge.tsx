interface Props {
  valueM: number
  goalM: number
  className?: string
}

function formatM(m: number) {
  return m.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Fabric-progress bar styled as a tailor's measuring tape — cm ticks, a major
 * mark every 10 m, and a pin that reads like the tape's pull-tab hook.
 */
export default function FabricGauge({ valueM, goalM, className = '' }: Props) {
  const pct = Math.min((valueM / goalM) * 100, 100)
  const reached = valueM >= goalM
  const majorStep = 10
  const minorStep = 2
  const marks: { pos: number; major: boolean }[] = []
  for (let m = 0; m <= goalM; m += minorStep) {
    marks.push({ pos: (m / goalM) * 100, major: m % majorStep === 0 })
  }

  return (
    <div className={className}>
      {/* Pin marking current position */}
      <div className="relative h-6">
        <div
          className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
          style={{ left: `${pct}%` }}
        >
          <span
            className={`font-display text-base leading-none px-1.5 py-1 rounded-sm ${
              reached ? 'bg-gold-500 text-ink-950' : 'bg-ink-900 text-gold-300'
            }`}
          >
            {Math.round(pct)}%
          </span>
          <span className={`w-px h-2 ${reached ? 'bg-gold-500' : 'bg-ink-900'}`} />
        </div>
      </div>

      {/* Tape */}
      <div className="relative h-12 rounded-sm overflow-hidden border border-ink-900/70 isolate">
        <div className="absolute inset-0 bg-gold-50" />
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-500 ${
            reached ? 'bg-gold-500' : 'bg-ink-700'
          }`}
          style={{ width: `${pct}%` }}
        />
        {/* Ticks + labels, blended so they read on both the filled and unfilled tape */}
        <div className="absolute inset-0">
          {marks.map(({ pos, major }) => (
            <span
              key={pos}
              className="absolute bottom-0 mix-blend-difference"
              style={{ left: `${pos}%` }}
            >
              <span
                className={`block w-px bg-white/80 ${major ? 'h-5' : 'h-2.5'}`}
              />
              {major && (
                <span className="absolute -top-0.5 left-1 -translate-y-full font-mono text-[10px] text-white/90 tabular-nums whitespace-nowrap">
                  {pos === 0 ? '0' : `${(pos / 100) * goalM}m`}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <p className="font-display text-3xl lg:text-4xl text-ink-950 tabular-nums leading-none">
          {formatM(valueM)}
          <span className="font-mono text-sm text-ink-400 ml-1.5 tracking-normal">m besteld</span>
        </p>
        <p className="font-mono text-xs text-ink-400">
          {reached ? (
            <span className="text-gold-600 font-semibold">doel behaald</span>
          ) : (
            `nog ${formatM(goalM - valueM)} m`
          )}
        </p>
      </div>
    </div>
  )
}
