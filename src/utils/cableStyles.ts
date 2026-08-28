import type { CSSProperties } from "react";
import type { CableTypeDef, DashPattern } from "@/types/diagram";

export const DASH_PATTERN: Record<Exclude<DashPattern, "solid">, string> = {
  dashed: "8 5",
  dotted: "2 4",
  dashdot: "10 4 2 4",
};

export const CABLE_TYPE_PALETTE = [
  "#3b82f6",
  "#22c55e",
  "#ef4444",
  "#f97316",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#eab308",
];

/**
 * Normalizes a loaded `cableTypes` array that may contain legacy plain
 * strings (pre-styling project files) or partial objects.
 */
export function migrateCableTypes(raw: unknown): CableTypeDef[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry): CableTypeDef | null => {
      if (typeof entry === "string") {
        return {
          name: entry,
          color: "#71717a",
          strokeWidth: 2,
          dash: "solid",
        };
      }
      if (
        entry !== null &&
        typeof entry === "object" &&
        typeof (entry as CableTypeDef).name === "string"
      ) {
        const def = entry as Partial<CableTypeDef>;
        return {
          name: def.name as string,
          color: typeof def.color === "string" ? def.color : "#71717a",
          strokeWidth:
            typeof def.strokeWidth === "number" ? def.strokeWidth : 2,
          dash:
            def.dash === "dashed" ||
            def.dash === "dotted" ||
            def.dash === "dashdot"
              ? def.dash
              : "solid",
        };
      }
      return null;
    })
    .filter((def): def is CableTypeDef => def !== null);
}

/** Stroke style derived from a cable type definition (undefined = theme default). */
export function cableTypeStyle(
  def: CableTypeDef | undefined,
): CSSProperties | undefined {
  if (!def) return undefined;
  return {
    stroke: def.color,
    strokeWidth: def.strokeWidth,
    ...(def.dash !== "solid" && { strokeDasharray: DASH_PATTERN[def.dash] }),
  };
}
