'use client';

import { cn } from "@/lib/utils";
import { useStore } from '@/store/useStore';
import { Trash2, Plus, Copy } from 'lucide-react';

export const PropertyInspector = () => {
  const { 
    selectedNodeId, 
    nodes, 
    updateNodeLabel, 
    addInput, 
    removeInput, 
    updateInputName, 
    addOutput, 
    removeOutput, 
    updateOutputName,
    deleteNode,
    copyNode
  } = useStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className={cn("w-64 h-full p-4 text-sm italic border-l", "bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700")}>
        Select a node to edit properties
      </div >
    );
  }

  return (
    <div className={cn("w-64 h-full p-4 overflow-y-auto flex flex-col border-l", "bg-white text-foreground border-gray-300 dark:bg-background dark:border-gray-700")}>
      <div className="grow">
        <h2 className="font-bold text-lg mb-4">Properties</h2>

        <div className="mb-6">
          <label className={cn("block text-xs font-medium uppercase mb-1", "text-gray-500 dark:text-gray-400")}>
            Node Label
          </label>
          <input
            type="text"
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
            value={selectedNode.data.label}
            onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
          />
        </div >

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className={cn("block text-xs font-medium uppercase", "text-gray-500 dark:text-gray-400")}>
              Inputs
            </label>
            <button
              onClick={() => addInput(selectedNode.id)}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
            >
              <Plus size={16} />
            </button>
          </div >
          <div className="space-y-2">
            {selectedNode.data.inputs?.map((input) => (
              <div key={input.id} className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs dark:border-gray-700 dark:bg-transparent"
                  value={input.name}
                  onChange={(e) => updateInputName(selectedNode.id, input.id, e.target.value)}
                />
                <button
                  onClick={() => removeInput(selectedNode.id, input.id)}
                  className="cursor-pointer text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div >
            ))}
          </div >
        </div >

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className={cn("block text-xs font-medium uppercase", "text-gray-500 dark:text-gray-400")}>
              Outputs
            </label>
            <button
              onClick={() => addOutput(selectedNode.id)}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
            >
              <Plus size={16} />
            </button>
          </div >
          <div className="space-y-2">
            {selectedNode.data.outputs?.map((output) => (
              <div key={output.id} className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs dark:border-gray-700 dark:bg-transparent"
                  value={output.name}
                  onChange={(e) => updateOutputName(selectedNode.id, output.id, e.target.value)}
                />
                <button
                  onClick={() => removeOutput(selectedNode.id, output.id)}
                  className="cursor-pointer text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div >
            ))}
          </div >
        </div >
      </div >

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={() => selectedNodeId && copyNode(selectedNodeId)}
          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded-md transition-colors"
        >
          <Copy size={16} />
          Copy Node
        </button>
        <button
          onClick={() => selectedNodeId && deleteNode(selectedNodeId)}
          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 rounded-md transition-colors"
        >
          <Trash2 size={16} />
          Delete Node
        </button>
      </div >
    </div >
  );
};
