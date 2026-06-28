export const CCCD_LENGTH = 12;

export function parseIdentificationId(value?: string): string {
  return (value ?? "").replace(/\D/g, "").slice(0, CCCD_LENGTH);
}

/** CCCD 12 số — nhóm 3 chữ số: 079 201 000 001 */
export function formatIdentificationId(value?: string | null): string {
  const digits = parseIdentificationId(value ?? "");
  if (!digits) return "";

  return digits.replace(/(\d{3})(?=\d)/g, "$1 ");
}

export function isValidIdentificationId(value?: string): boolean {
  const digits = parseIdentificationId(value);
  if (!digits) return true;
  return digits.length === CCCD_LENGTH;
}
