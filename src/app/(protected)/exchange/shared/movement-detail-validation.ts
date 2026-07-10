export type MovementDetailInput = {
  productItemId: string
  quantity: number
  importPrice?: number
  note?: string
}

export function findDuplicateProductIds(details: { productItemId: string }[]): string[] {
  const seen = new Set<string>()
  const dupes = new Set<string>()
  for (const d of details) {
    if (!d.productItemId) continue
    if (seen.has(d.productItemId)) dupes.add(d.productItemId)
    seen.add(d.productItemId)
  }
  return [...dupes]
}

/** Receiver chốt giá nhập; sender chỉ sửa SL / mặt hàng. */
export function validateOpeningDetailsSubmit(
  details: MovementDetailInput[],
  party: 'sender' | 'receiver',
): string | null {
  return validateMovementDetails(details, {
    requireImportPrice: party === 'receiver',
  })
}

/** Validate line items before create / update details. */
export function validateMovementDetails(
  details: MovementDetailInput[],
  options: { requireImportPrice: boolean },
): string | null {
  const valid = details.filter((d) => d.productItemId)
  if (valid.length === 0) return 'Cần ít nhất 1 mặt hàng'
  if (valid.some((d) => !Number.isFinite(d.quantity) || d.quantity <= 0)) {
    return 'Số lượng phải lớn hơn 0'
  }
  if (
    options.requireImportPrice &&
    valid.some((d) => !Number.isFinite(d.importPrice) || (d.importPrice ?? 0) <= 0)
  ) {
    return 'Giá nhập phải > 0'
  }
  if (findDuplicateProductIds(valid).length > 0) {
    return 'Không được chọn trùng hàng hóa'
  }
  return null
}

export function validateReceiveDetails(
  details: { productItemId: string; receivedQuantity: number }[],
): string | null {
  if (details.length === 0) return 'Không có mặt hàng để nhận'
  if (details.some((d) => d.receivedQuantity < 0)) {
    return 'Số lượng thực nhận không được âm'
  }
  if (details.every((d) => d.receivedQuantity === 0)) {
    return 'Số lượng thực nhận phải lớn hơn 0'
  }
  return null
}
