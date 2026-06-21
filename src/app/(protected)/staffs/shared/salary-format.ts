export function formatVndAmount(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "";

  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";

  return Number(digits).toLocaleString("vi-VN");
}

export function parseVndAmount(value?: string): number | undefined {
  if (!value?.trim()) return undefined;

  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;

  const parsed = Number(digits);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function formatVndLabel(value?: number | null): string {
  if (value === undefined || value === null) return "—";
  return `${value.toLocaleString("vi-VN")} đ`;
}
