/** Họ / tên / địa chỉ — validate phía FE trước khi gọi API. */

export const STAFF_NAME_MAX_LENGTH = 50;
export const STAFF_ADDRESS_MAX_LENGTH = 255;
export const STAFF_ADDRESS_MIN_LENGTH = 5;

/** Chữ cái (có dấu), khoảng trắng, dấu nháy, gạch nối. */
const PERSON_NAME_PATTERN = /^[\p{L}\s'.-]+$/u;

export function normalizeStaffPersonName(value?: string): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

export function validateStaffPersonName(
  value?: string,
  label: "Họ" | "Tên" = "Họ",
): string | null {
  const normalized = normalizeStaffPersonName(value);
  if (!normalized) return `${label} là bắt buộc`;
  if (normalized.length > STAFF_NAME_MAX_LENGTH) {
    return `${label} tối đa ${STAFF_NAME_MAX_LENGTH} ký tự`;
  }
  if (!PERSON_NAME_PATTERN.test(normalized)) {
    return `${label} chỉ gồm chữ cái, không chứa số hoặc ký tự đặc biệt`;
  }
  return null;
}

export function normalizeStaffAddress(value?: string): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

export function validateStaffAddress(value?: string): string | null {
  const normalized = normalizeStaffAddress(value);
  if (!normalized) return null;

  if (normalized.length < STAFF_ADDRESS_MIN_LENGTH) {
    return `Địa chỉ tối thiểu ${STAFF_ADDRESS_MIN_LENGTH} ký tự`;
  }
  if (normalized.length > STAFF_ADDRESS_MAX_LENGTH) {
    return `Địa chỉ tối đa ${STAFF_ADDRESS_MAX_LENGTH} ký tự`;
  }
  return null;
}
