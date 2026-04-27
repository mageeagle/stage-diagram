"use client";

import { cn } from "@/lib/utils";
import { useStagePlanStore } from "@/store/useStagePlanStore";

export const StagePlanPropertiesPanel = () => {
  const selectedNodeIds = useStagePlanStore((state) => state.selectedNodeIds);
  const nodes = useStagePlanStore((state) => state.nodes);
  const updateNodeShape = useStagePlanStore((state) => state.updateNodeShape);
  const updateNodeRotation = useStagePlanStore((state) => state.updateNodeRotation);
  const updateNodeDimensions = useStagePlanStore((state) => state.updateNodeDimensions);

  const primaryNode = nodes.find((n) => n.id === selectedNodeIds[0]);

  if (!primaryNode) return null;

  const isMultiSelect = selectedNodeIds.length > 1;

  return (
    <div
      className={cn(
        "w-64 h-full p-4 overflow-y-auto flex flex-col border-l",
        "bg-white text-foreground border-gray-300 dark:bg-background dark:border-gray-700",
      )}
    >
      <div className="grow">
        <h2 className="font-bold text-lg mb-4">StagePlan Properties</h2>

        <div className="mb-6">
          <label className="block text-xs font-medium uppercase mb-1 text-gray-500 dark:text-gray-400">
            Shape
          </label>
          <select
            value={primaryNode.data.shape || "rectangle"}
            onChange={(e) =>
              updateNodeShape(selectedNodeIds, e.target.value as 'rectangle' | 'circle' | 'triangle')
            }
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="triangle">Triangle</option>
          </select>
          {isMultiSelect && (
            <p className="text-[10px] text-gray-500 italic mt-1">
              Multiple shapes selected
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium uppercase mb-1 text-gray-500 dark:text-gray-400">
            Rotation ({primaryNode.data.rotation || 0}°)
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={primaryNode.data.rotation || 0}
            onChange={(e) =>
              updateNodeRotation(selectedNodeIds, parseInt(e.target.value, 10))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium uppercase mb-1 text-gray-500 dark:text-gray-400">
            Dimensions (W x H)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
              value={primaryNode.data.width || 150}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  updateNodeDimensions(
                    selectedNodeIds,
                    val,
                    (primaryNode.data.height as number) || 50,
                  );
                }
              }}
            />
            <span className="text-gray-400">×</span>
            <input
              type="number"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
              value={primaryNode.data.height || 50}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  updateNodeDimensions(
                    selectedNodeIds,
                    (primaryNode.data.width as number) || 150,
                    val,
                  );
                }
              }}
            />
          </div>
          {isMultiSelect && (
            <p className="text-[10px] text-gray-500 italic mt-1">
              Multiple dimensions selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
