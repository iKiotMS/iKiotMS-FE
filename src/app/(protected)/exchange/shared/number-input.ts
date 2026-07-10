/** Safe number parsing for spinner/keyboard number inputs. Avoids NaN from valueAsNumber. */
export function parseNumberInput(
  value: string,
  fallback = 0,
): number {
  if (value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
