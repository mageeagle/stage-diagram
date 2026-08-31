import { NodeProps, Node } from "@xyflow/react";
import { useThemeStore } from "@/store/useThemeStore";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { textColorFor, isValidHexColor } from "@/utils/color";

export const GroupNode = <T extends Node>(
  props: NodeProps<T> & { data: T["data"] & { label?: string } },
) => {
  const { theme } = useThemeStore();
  const locationBackgrounds = useStore((s) => s.locationBackgrounds);
  const raw = locationBackgrounds[props.data?.label ?? ""];
  const bg = isValidHexColor(raw) ? raw : undefined;
  const fg = bg ? textColorFor(bg) : undefined;

  return (
    <div className={cn("flex w-full p-2 select-none")}>
      <div
        className={cn(
          "font-semibold text-xs px-2 py-1 border rounded mb-1",
          !bg &&
            (theme === "dark"
              ? "bg-stone-800/30 border-stone-700"
              : "bg-stone-200/30 border-stone-300"),
        )}
        style={
          bg
            ? { backgroundColor: bg, borderColor: bg, color: fg }
            : undefined
        }
      >
        {props.data?.label || "Group"}
      </div>
    </div>
  );
};
