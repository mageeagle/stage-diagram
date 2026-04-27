"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Trash2, Plus, Copy, Save } from "lucide-react";
import { NodeTemplate } from "@/types/diagram";
import { nanoid } from "nanoid";
import { EdgeProperties } from "./EdgeProperties";

export const PropertiesPanel = () => {
  const selectedNodeIds = useStore((state) => state.selectedNodeIds);
  const selectedEdgeIds = useStore((state) => state.selectedEdgeIds);
  const nodes = useStore((state) => state.nodes);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const updateNodeType = useStore((state) => state.updateNodeType);
  const updateNodeLocation = useStore((state) => state.updateNodeLocation);
  const updateNodePower = useStore((state) => state.updateNodePower);
  const updateNodeHidden = useStore((state) => state.updateNodeHidden);
  const updateNodeHideFromList = useStore(
    (state) => state.updateNodeHideFromList,
  );
  const types = useStore((state) => state.types);
  const locations = useStore((state) => state.locations);
  const addType = useStore((state) => state.addType);
  const addLocation = useStore((state) => state.addLocation);
  const addInput = useStore((state) => state.addInput);
  const removeInput = useStore((state) => state.removeInput);
  const updateInputName = useStore((state) => state.updateInputName);
  const addOutput = useStore((state) => state.addOutput);
  const removeOutput = useStore((state) => state.removeOutput);
  const updateOutputName = useStore((state) => state.updateOutputName);
  const deleteNodes = useStore((state) => state.deleteNodes);
  const copyNodes = useStore((state) => state.copyNodes);
  const addTemplate = useStore((state) => state.addTemplate);

  const primaryNode = nodes.find((n) => n.id === selectedNodeIds[0]);

  if (!primaryNode) return null;

  const isMultiSelect = selectedNodeIds.length > 1;

  const handleAddNewType = () => {
    const newType = window.prompt("Enter new type:");
    if (newType) {
      addType(newType);
      updateNodeType(selectedNodeIds, newType);
    }
  };

  const handleAddNewLocation = () => {
    const newLocation = window.prompt("Enter new location:");
    if (newLocation) {
      addLocation(newLocation);
      updateNodeLocation(selectedNodeIds, newLocation);
    }
  };

  const handleSaveAsTemplate = () => {
    const template: NodeTemplate = {
      id: nanoid(),
      name: primaryNode.data.label,
      inputs: [...(primaryNode.data.inputs || [])],
      outputs: [...(primaryNode.data.outputs || [])],
      type: primaryNode.data.type || "",
      nodeType: primaryNode.type!,
      power: primaryNode.data.power ?? false,
    };
    addTemplate(template);
  };

  // Helper functions to detect mixed types/locations
  const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
  const hasMixedTypes =
    isMultiSelect && new Set(selectedNodes.map((n) => n.data.type)).size > 1;
  const hasMixedLocations =
    isMultiSelect &&
    new Set(selectedNodes.map((n) => n.data.location)).size > 1;
  const anyHidden =
    isMultiSelect && selectedNodes.some((n) => n.data.hidden === true);
  const anyHideFromList =
    isMultiSelect && selectedNodes.some((n) => n.data.hideFromList === true);

  return (
    <div
      className={cn(
        "w-64 h-full p-4 overflow-y-auto flex flex-col border-l",
        "bg-white text-foreground border-gray-300 dark:bg-background dark:border-gray-700",
      )}
    >
      <div className="grow">
        <h2 className="font-bold text-lg mb-4">Properties</h2>

        {!isMultiSelect && (
          <div className="mb-6">
            <label
              className={cn(
                "block text-xs font-medium uppercase mb-1",
                "text-gray-500 dark:text-gray-400",
              )}
            >
              Node Label
            </label>
            <input
              type="text"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
              value={primaryNode.data.label}
              onChange={(e) => updateNodeLabel(primaryNode.id, e.target.value)}
            />
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label
              className={cn(
                "block text-xs font-medium uppercase",
                "text-gray-500 dark:text-gray-400",
              )}
            >
              Type
            </label>
            <button
              onClick={handleAddNewType}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <select
            value={primaryNode.data.type || ""}
            onChange={(e) => updateNodeType(selectedNodeIds, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
          >
            <option value="none">None</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {isMultiSelect && hasMixedTypes && (
            <p className="text-[10px] text-gray-500 italic mt-1">
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
              Location
            </label>
            <button
              onClick={handleAddNewLocation}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <select
            value={primaryNode.data.location || ""}
            onChange={(e) =>
              updateNodeLocation(selectedNodeIds, e.target.value)
            }
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
          >
            <option value="none">None</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {isMultiSelect && hasMixedLocations && (
            <p className="text-[10px] text-gray-500 italic mt-1">
              Multiple locations selected
            </p>
          )}
        </div>

        {!isMultiSelect && (
          <>
            <div className="mb-6 flex items-center gap-3">
              <input
                type="checkbox"
                id="node-power"
                className="w-4 h-4 cursor-pointer"
                checked={!!primaryNode.data.power}
                onChange={(e) =>
                  updateNodePower(selectedNodeIds, e.target.checked)
                }
              />
              <label
                htmlFor="node-power"
                className="text-sm font-medium cursor-pointer"
              >
                Require Power Plug?
              </label>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label
                  className={cn(
                    "block text-xs font-medium uppercase",
                    "text-gray-500 dark:text-gray-400",
                  )}
                >
                  Inputs
                </label>
                <button
                  onClick={() => addInput(primaryNode.id)}
                  className="cursor-pointer text-blue-500 hover:text-blue-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {primaryNode.data.inputs?.map((input) => (
                  <div key={input.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs dark:border-gray-700 dark:bg-transparent"
                      value={input.name}
                      onChange={(e) =>
                        updateInputName(
                          primaryNode.id,
                          input.id,
                          e.target.value,
                        )
                      }
                    />
                    <button
                      onClick={() => removeInput(primaryNode.id, input.id)}
                      className="cursor-pointer text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label
                  className={cn(
                    "block text-xs font-medium uppercase",
                    "text-gray-500 dark:text-gray-400",
                  )}
                >
                  Outputs
                </label>
                <button
                  onClick={() => addOutput(primaryNode.id)}
                  className="cursor-pointer text-blue-500 hover:text-blue-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {primaryNode.data.outputs?.map((output) => (
                  <div key={output.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs dark:border-gray-700 dark:bg-transparent"
                      value={output.name}
                      onChange={(e) =>
                        updateOutputName(
                          primaryNode.id,
                          output.id,
                          e.target.value,
                        )
                      }
                    />
                    <button
                      onClick={() => removeOutput(primaryNode.id, output.id)}
                      className="cursor-pointer text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Power checkbox for both single and multi mode (in multi mode it's below Location) */}
        {isMultiSelect && (
          <div className="mb-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="node-power"
              className="w-4 h-4 cursor-pointer"
              checked={!!primaryNode.data.power}
              onChange={(e) =>
                updateNodePower(selectedNodeIds, e.target.checked)
              }
            />
            <label
              htmlFor="node-power"
              className="text-sm font-medium cursor-pointer"
            >
              Require Power Plug?
            </label>
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center gap-3">
        <input
          type="checkbox"
          id="node-hidden"
          className="w-4 h-4 cursor-pointer"
          checked={isMultiSelect ? anyHidden : primaryNode.data.hidden}
          onChange={(e) => updateNodeHidden(selectedNodeIds, e.target.checked)}
        />
        <label
          htmlFor="node-hidden"
          className="text-sm font-medium cursor-pointer"
        >
          Hidden
        </label>
      </div>

      {/* Hide from List checkbox */}
      <div className="mb-6 flex items-center gap-3">
        <input
          type="checkbox"
          id="node-hide-from-list"
          className="w-4 h-4 cursor-pointer"
          checked={
            isMultiSelect ? anyHideFromList : primaryNode.data.hideFromList
          }
          onChange={(e) =>
            updateNodeHideFromList(selectedNodeIds, e.target.checked)
          }
        />
        <label
          htmlFor="node-hide-from-list"
          className="text-sm font-medium cursor-pointer"
        >
          Hide from List
        </label>
      </div>

      {selectedEdgeIds.length > 0 && <EdgeProperties />}
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        {!isMultiSelect && (
          <button
            onClick={handleSaveAsTemplate}
            className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50 rounded-md transition-colors"
          >
            <Save size={16} />
            Save as Template
          </button>
        )}
        <button
          onClick={() => copyNodes(selectedNodeIds)}
          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded-md transition-colors"
        >
          <Copy size={16} />
          {isMultiSelect ? "Copy Nodes" : "Copy Node"}
        </button>
        <button
          onClick={() => deleteNodes(selectedNodeIds)}
          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 rounded-md transition-colors"
        >
          <Trash2 size={16} />
          {isMultiSelect ? "Delete Nodes" : "Delete Node"}
        </button>
      </div>
    </div>
  );
};
