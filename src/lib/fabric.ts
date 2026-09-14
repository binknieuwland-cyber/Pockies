// Stof per product in meters
export const STOF_METERS: Record<string, number> = {
  'Pockies': 1,
  'Boyfriendboxers (vrouwen pockies)': 1,
  'Pyjamabroek': 2.86,
  'Pyjamashirt': 2.86,
  'Djellaba': 3.34,
}
export const STOF_DOEL = 100 // meter

export function computeTotalStof(orders: { quantity: number; product: { name: string } }[]): number {
  return orders.reduce((s, o) => {
    const m = STOF_METERS[o.product.name] ?? 0
    return s + m * o.quantity
  }, 0)
}
