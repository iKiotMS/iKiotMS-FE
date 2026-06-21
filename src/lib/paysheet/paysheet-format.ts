const VND_FORMATTER = new Intl.NumberFormat("vi-VN");

export function formatVnd(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${VND_FORMATTER.format(Math.round(value))} đ`;
}

export function formatVndInput(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  return VND_FORMATTER.format(Math.round(value));
}

export function parseVndInput(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  const parsed = Number(digits);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function formatPercent(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${value}%`;
}

export function parseDecimalInput(raw: string): number | undefined {
  const normalized = raw.trim().replace(",", ".");
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function formatCoefficient(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return String(Number(value.toFixed(2)));
}

export function parseIntegerInput(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  const parsed = Number.parseInt(digits, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function normalizeVnd(value?: number): number | undefined {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return Math.round(value);
}

export function normalizeCoefficient(value: number): number {
  return Number(value.toFixed(2));
}

export function normalizePercent(value: number): number {
  return Number(value.toFixed(2));
}
