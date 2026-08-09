export const BTW = 0.21

/** Compute price including BTW */
export function inclBtw(priceExclBtw: number): number {
  return priceExclBtw * (1 + BTW)
}

/** Format a number as a Dutch euro string, e.g. "€ 18,40" */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
