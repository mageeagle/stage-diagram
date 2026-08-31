import type { NamedColorDef } from "@/types/diagram";

/** Resolve a node's background hex from a palette entry name. */
export function resolveBackgroundColor(
  name: string | undefined,
  namedColors: NamedColorDef[]
): string | undefined {
  if (!name) return undefined;
  const entry = namedColors.find((c) => c.name === name);
  return entry?.color || undefined;
}

export const isValidHexColor = (value: string | undefined): value is string =>
  !!value && /^#[0-9a-f]{6}$/i.test(value);

/** Relative luminance → readable text color for a hex fill. */
export function textColorFor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return L > 0.5 ? "#1c1917" : "#f5f5f4";
}
