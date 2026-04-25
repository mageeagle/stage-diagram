import { NodeProps, Node } from "@xyflow/react";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

export const GroupNode = <T extends Node>(
  props: NodeProps<T> & { data: T["data"] & { label?: string } },
) => {
  const { theme } = useThemeStore();

  return (
    <div className={cn("flex w-full p-2 select-none")}>
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
