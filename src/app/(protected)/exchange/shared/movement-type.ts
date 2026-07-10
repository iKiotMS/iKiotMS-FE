import type { MovementType } from "@/types/stock-movement";

export const MOVEMENT_TYPE_MAP: Record<
  MovementType,
  { label: string; className: string }
> = {
  IMPORT: {
    label: "Nhập hàng",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  EXPORT: {
    label: "Xuất kho",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  },
  ADJUST: {
    label: "Điều chỉnh",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  },
  RETURN: {
    label: "Trả hàng",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
};
