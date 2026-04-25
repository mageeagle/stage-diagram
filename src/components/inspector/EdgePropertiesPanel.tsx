"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Trash2 } from "lucide-react";
import { EdgeProperties } from "./EdgeProperties";

export const EdgePropertiesPanel = () => {
  const selectedEdgeIds = useStore((state) => state.selectedEdgeIds);
  const edges = useStore((state) => state.edges);

  const deleteEdge = useStore((state) => state.deleteEdge);

  const selectedEdges = edges.filter((edge) =>
    selectedEdgeIds.includes(edge.id),
  );

  const isMultiSelect = selectedEdgeIds.length > 1;

  const handleDeleteEdges = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedEdges.length} edge(s)?`,
      )
    ) {
      deleteEdge(selectedEdgeIds);
    }
  };

  return (
    <div
      className={cn(
        "w-64 h-full p-4 overflow-y-auto flex flex-col border-l",
        "bg-white text-foreground border-gray-300 dark:bg-background dark:border-gray-700",
      )}
    >
      <EdgeProperties />
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={handleDeleteEdges}
          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 rounded-md transition-colors"
        >
          <Trash2 size={16} />
          {isMultiSelect ? "Delete Edges" : "Delete Edge"}
        </button>
      </div>
    </div>
  );
};
