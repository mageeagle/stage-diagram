import React from "react";
import { MapPin, Tag } from "lucide-react";
import { type NodeListTabsProps } from "../node-list-modal-types";
import { cn } from "@/lib/utils";

export const NodeListTabs = ({ groupBy, setGroupBy }: NodeListTabsProps) => {
  return (
    <div className="flex gap-2 mb-4 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
      <button
        onClick={() => setGroupBy("none")}
        className={cn(
          "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded transition-colors",
          groupBy === "none"
            ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
        )}
      >
        None
      </button>
      <button
        onClick={() => setGroupBy("location")}
        className={cn(
          "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded transition-colors",
          groupBy === "location"
            ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
        )}
      >
        <MapPin size={14} />
        Location
      </button>
      <button
        onClick={() => setGroupBy("type")}
        className={cn(
          "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded transition-colors",
          groupBy === "type"
            ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
        )}
      >
        <Tag size={14} />
        Type
      </button>
    </div>
  );
};
