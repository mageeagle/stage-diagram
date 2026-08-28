"use client";

import { useStore } from "@/store/useStore";
import { DASH_PATTERN } from "@/utils/cableStyles";

export const CableLegend = () => {
  const edges = useStore((s) => s.edges);
  const nodes = useStore((s) => s.nodes);
  const cableTypes = useStore((s) => s.cableTypes);
  const hideLegend = useStore((s) => s.hideLegend);

  const hiddenNodeIds = new Set(
    nodes.filter((n) => n.data?.hidden).map((n) => n.id),
  );

  const usedTypes = new Set(
    edges
      .filter((e) => !e.data?.hidden && !e.data?.exportingHidden)
      .filter(
        (e) =>
          !hiddenNodeIds.has(e.source) && !hiddenNodeIds.has(e.target),
      )
      .map((e) => e.data?.cableType as string)
      .filter((t): t is string => Boolean(t) && t !== "none"),
  );

  const defs = cableTypes.filter((c) => usedTypes.has(c.name));

  if (hideLegend || defs.length < 2) return null;

  return (
    <div className="absolute bottom-6 right-24 z-10 bg-white/90 dark:bg-zinc-900/90 border border-stone-300 dark:border-stone-600 rounded shadow-sm backdrop-blur px-3 py-2">
      {defs.map((def) => (
        <div key={def.name} className="flex items-center gap-2 py-0.5">
          <svg width="28" height="10" className="shrink-0">
            <line
              x1="1"
              y1="5"
              x2="27"
              y2="5"
              stroke={def.color}
              strokeWidth={def.strokeWidth}
              strokeDasharray={
                def.dash === "solid" ? undefined : DASH_PATTERN[def.dash]
              }
            />
          </svg>
          <span className="text-xs text-stone-700 dark:text-stone-300">
            {def.name}
          </span>
        </div>
      ))}
    </div>
  );
};
