'use client';

import React from 'react';
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
      <div className="w-64 h-full bg-gray-100 border-l border-gray-300 p-4 text-gray-500 text-sm italic">
        Select a node to edit properties
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-white border-l border-gray-300 p-4 overflow-y-auto flex flex-col">
      <div className="flex-grow">
        <h2 className="font-bold text-lg mb-4">Properties</h2>

        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
            Node Label
          </label>
          <input
            type="text"
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            value={selectedNode.data.label}
            onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-500 uppercase">
              Inputs
            </label>
            <button
              onClick={() => addInput(selectedNode.id)}
              className="text-blue-500 hover:text-blue-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {selectedNode.data.inputs?.map((input) => (
              <div key={input.id} className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  value={input.name}
                  onChange={(e) => updateInputName(selectedNode.id, input.id, e.target.value)}
                />
                <button
                  onClick={() => removeInput(selectedNode.id, input.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-500 uppercase">
              Outputs
            </label>
            <button
              onClick={() => addOutput(selectedNode.id)}
              className="text-blue-500 hover:text-blue-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {selectedNode.data.outputs?.map((output) => (
              <div key={output.id} className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  value={output.name}
                  onChange={(e) => updateOutputName(selectedNode.id, output.id, e.target.value)}
                />
                <button
                  onClick={() => removeOutput(selectedNode.id, output.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => selectedNodeId && copyNode(selectedNodeId)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        >
          <Copy size={16} />
          Copy Node
        </button>
        <button
          onClick={() => selectedNodeId && deleteNode(selectedNodeId)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
        >
          <Trash2 size={16} />
          Delete Node
        </button>
      </div>
    </div>
  );
};
