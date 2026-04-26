"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Plus } from "lucide-react";

export const EdgeProperties = () => {
  const selectedEdgeIds = useStore((state) => state.selectedEdgeIds);
  const edges = useStore((state) => state.edges);
  const nodes = useStore((state) => state.nodes);
  const cableTypes = useStore((state) => state.cableTypes);
  const addCableType = useStore((state) => state.addCableType);
  const updateEdgeCableType = useStore((state) => state.updateEdgeCableType);
  const updateEdgeType = useStore((state) => state.updateEdgeType);
  const deleteEdge = useStore((state) => state.deleteEdge);

  const selectedEdges = edges.filter((edge) =>
    selectedEdgeIds.includes(edge.id),
  );

  const isMultiSelect = selectedEdgeIds.length > 1;

  // For single select, we can show the current cable type of the selected edge.
  // For multi select, we should show a cable type that is common to all selected edges,
  // or 'none' if they differ.
  const getCommonCableType = () => {
    if (selectedEdges.length === 0) return "none";
    const firstType = (selectedEdges[0].data?.cableType as string) || "none";
    const allMatch = selectedEdges.every(
      (edge) => (edge.data?.cableType || "none") === firstType,
    );
    return allMatch ? firstType : "mixed";
  };

  const getCommonEdgeType = () => {
    if (selectedEdges.length === 0) return "labeledSmoothstep";
    const firstType = selectedEdges[0].type;
    const allMatch = selectedEdges.every((edge) => edge.type === firstType);
    return allMatch ? firstType : "mixed";
  };

  const currentCableType = getCommonCableType();
  const currentEdgeType = getCommonEdgeType();

  const handleAddNewCableType = () => {
    const newType = window.prompt("Enter new cable type:");
    if (newType) {
      addCableType(newType);
      updateEdgeCableType(selectedEdgeIds, newType);
    }
  };

  const handleCableTypeChange = (newType: string) => {
    updateEdgeCableType(selectedEdgeIds, newType);
  };

  const handleEdgeTypeChange = (newType: string) => {
    updateEdgeType(selectedEdgeIds, newType);
  };

  return (
    <>
      <div className="grow">
        <h2 className="font-bold text-lg mb-4">Edge Properties</h2>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label
              className={cn(
                "block text-xs font-medium uppercase",
                "text-gray-500 dark:text-gray-400",
              )}
            >
              Edge Type
            </label>
          </div>
          <select
            value={
              currentEdgeType === "mixed"
                ? "labeledSmoothstep"
                : currentEdgeType
            }
            onChange={(e) => handleEdgeTypeChange(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
          >
            <option value="default">Default</option>
            <option value="labeledSmoothstep">SmoothStep</option>
            <option value="labeledStep">Step</option>
            <option value="labeledStraight">Straight</option>
            <option value="labeledBezier">Bezier</option>
          </select>
          {currentEdgeType === "mixed" && (
            <p className="text-[10px] text-gray-500 mt-1 italic">
              Multiple types selected
            </p>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label
              className={cn(
                "block text-xs font-medium uppercase",
                "text-gray-500 dark:text-gray-400",
              )}
            >
              Cable Type
            </label>
            <button
              onClick={handleAddNewCableType}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <select
            value={currentCableType === "mixed" ? "none" : currentCableType}
            onChange={(e) => handleCableTypeChange(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
          >
            <option value="none">None</option>
            {cableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {currentCableType === "mixed" && (
            <p className="text-[10px] text-gray-500 mt-1 italic">
              Multiple types selected
            </p>
          )}
        </div>

        {/* If single select, maybe show source/target info, but let's keep it simple for now */}
        {!isMultiSelect && selectedEdges[0] && (
          <div className="text-xs text-gray-500">
            {(() => {
              const edge = selectedEdges[0];
              const sourceNode = nodes.find((n) => n.id === edge.source);
              const targetNode = nodes.find((n) => n.id === edge.target);

              if (!sourceNode || !targetNode) return null;

              const sourceOutput = sourceNode.data.outputs?.find(
                (o) => o.id === edge.sourceHandle,
              );
              const targetInput = targetNode.data.inputs?.find(
                (i) => i.id === edge.targetHandle,
              );

              return (
                <>
                  <p>
                    Source: {sourceNode.data.label} (
                    {sourceOutput?.name || "Unknown Output"})
                  </p>
                  <p>
                    Target: {targetNode.data.label} (
                    {targetInput?.name || "Unknown Input"})
                  </p>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </>
  );
};
