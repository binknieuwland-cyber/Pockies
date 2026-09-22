/** Canonical stored/compared form: digits only, e.g. "0612345678". */
export function normalizePhoneDigits(input: string): string {
  return input.replace(/\D/g, '')
}

export function isValidDutchMobile(input: string): boolean {
  return /^06\d{8}$/.test(normalizePhoneDigits(input))
}

export function formatPhoneDisplay(input: string): string {
  const digits = normalizePhoneDigits(input)
  if (digits.length !== 10) return input
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)}`
}
