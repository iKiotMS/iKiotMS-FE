import type { StockMovement } from "@/types/stock-movement";

export function normalizeOptionalNote(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function hasOrderNote(movement: Pick<StockMovement, "note">) {
  return Boolean(normalizeOptionalNote(movement.note));
}

export function hasLineNotes(movement: Pick<StockMovement, "details">) {
  return movement.details.some((item) => Boolean(normalizeOptionalNote(item.note)));
}

export function hasAnyMovementNote(movement: StockMovement) {
  return hasOrderNote(movement) || hasLineNotes(movement);
}

export function getMovementNotePreview(movement: StockMovement) {
  const orderNote = normalizeOptionalNote(movement.note);
  if (orderNote) return orderNote;
  const lineNote = movement.details
    .map((item) => normalizeOptionalNote(item.note))
    .find(Boolean);
  return lineNote;
}
