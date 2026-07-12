/** Parse switcher key: "all" | "branch-{id}" | "warehouse-{id}". */
export type ParsedLocationKey = {
  locationId: string
  locationType: "branch" | "warehouse"
}

export function parseLocationKey(
  key: string | null | undefined,
): ParsedLocationKey | null {
  if (!key || key === "all") return null
  const [type, ...rest] = key.split("-")
  const id = rest.join("-")
  if ((type === "branch" || type === "warehouse") && id) {
    return { locationId: id, locationType: type }
  }
  return null
}
