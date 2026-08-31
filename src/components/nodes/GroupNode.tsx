import { NodeProps, Node } from "@xyflow/react";
import { useThemeStore } from "@/store/useThemeStore";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { isValidHexColor } from "@/utils/color";

export const GroupNode = <T extends Node>(
  props: NodeProps<T> & { data: T["data"] & { label?: string } },
) => {
  const { theme } = useThemeStore();
  const locationBackgrounds = useStore((s) => s.locationBackgrounds);
  const raw = locationBackgrounds[props.data?.label ?? ""];
  const bg = isValidHexColor(raw) ? raw : undefined;

  return (
    // The full-size container is the overlay that sits underneath every node
    // grouped under this location — the location color fills this area, not
    // the individual nodes or the label chip.
    <div
      className={cn(
        "flex h-full w-full items-start rounded-lg p-2 select-none",
      )}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      <div
        className={cn(
          "font-semibold text-xs px-2 py-1 border rounded mb-1",
          theme === "dark"
            ? "bg-stone-800/30 border-stone-700"
            : "bg-stone-200/30 border-stone-300",
        )}
      >
        {props.data?.label || "Group"}
      </div>
    </div>
  );
};
