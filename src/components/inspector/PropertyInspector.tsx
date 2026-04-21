'use client';

import { useState } from 'react';
import { cn } from "@/lib/utils";
import { useStore } from '@/store/useStore';
import { Trash2, Plus, Copy, Save, Pencil } from 'lucide-react';
import { NodeTemplate } from '@/types/diagram';
import { TemplateEditModal } from '@/components/diagram/TemplateEditModal';
import { nanoid } from 'nanoid';

export const PropertyInspector = () => {
  const { 
    selectedNodeId, 
    nodes, 
    updateNodeLabel, 
    updateNodeType,
    updateNodeLocation,
    types,
    locations,
    addType,
    addLocation,
    addInput, 
    removeInput, 
    updateInputName, 
    addOutput, 
    removeOutput, 
    updateOutputName,
    deleteNode,
    copyNode,
    templates,
    addTemplate,
    applyTemplate,
    updateTemplate,
    deleteTemplate
  } = useStore();

  const [editingTemplate, setEditingTemplate] = useState<NodeTemplate | null>(null);
  const [isTemplateEditModalOpen, setIsTemplateEditModalOpen] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    if (!selectedNode) {
      return (
        <>
          <div className={cn("w-64 h-full p-4 text-sm border-l flex flex-col", "bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700")}>
            <h2 className="font-bold text-lg mb-4 text-foreground">Templates</h2>
            <div className="space-y-2">
              {templates.length === 0 ? (
                <div className="italic text-center py-8">
                  Select a node to edit properties or create a template
                </div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center gap-1 w-full text-sm rounded border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <button
                      onClick={() => applyTemplate(template, { x: 0, y: 0 })}
                      className="flex-1 text-left px-3 py-2"
                    >
                      {template.name}
                    </button>
                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTemplate(template);
                          setIsTemplateEditModalOpen(true);
                        }}
                        className="p-2 text-zinc-500 hover:text-blue-500"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete template "${template.name}"?`)) {
                            deleteTemplate(template.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {editingTemplate && (
            <TemplateEditModal
              key={editingTemplate.id}
              isOpen={isTemplateEditModalOpen}
              onClose={() => setIsTemplateEditModalOpen(false)}
              onSave={(t) => {
                updateTemplate(t);
                setIsTemplateEditModalOpen(false);
              }}
              template={editingTemplate}
              types={types}
            />
          )}
        </>
      );
    }

  const handleAddNewType = () => {
    const newType = window.prompt('Enter new type:');
    if (newType) {
      addType(newType);
      updateNodeType(selectedNode.id, newType);
    }
  };

  const handleAddNewLocation = () => {
    const newLocation = window.prompt('Enter new location:');
    if (newLocation) {
      addLocation(newLocation);
      updateNodeLocation(selectedNode.id, newLocation);
    }
  };

  const handleSaveAsTemplate = () => {
    if (!selectedNode) return;
    const template: NodeTemplate = {
      id: nanoid(),
      name: selectedNode.data.label,
      inputs: [...(selectedNode.data.inputs || [])],
      outputs: [...(selectedNode.data.outputs || [])],
      type: selectedNode.data.type || '',
      nodeType: selectedNode.type,
    };
    addTemplate(template);
  };

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
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className={cn("block text-xs font-medium uppercase", "text-gray-500 dark:text-gray-400")}>
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
            value={selectedNode.data.type || ''}
            onChange={(e) => updateNodeType(selectedNode.id, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
          >
             <option value="none">None</option>
             {types.map((t) => (
               <option key={t} value={t}>{t}</option>
             ))}
           </select>
         </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className={cn("block text-xs font-medium uppercase", "text-gray-500 dark:text-gray-400")}>
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
            value={selectedNode.data.location || ''}
            onChange={(e) => updateNodeLocation(selectedNode.id, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:border-gray-700 dark:bg-transparent"
          >
             <option value="none">None</option>
             {locations.map((l) => (
               <option key={l} value={l}>{l}</option>
             ))}
           </select>
         </div>

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
          </div>
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
              </div>
            ))}
          </div>
        </div>

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
          </div>
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
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={handleSaveAsTemplate}
          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50 rounded-md transition-colors"
        >
          <Save size={16} />
          Save as Template
        </button>
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
      </div>
      {editingTemplate && (
            <TemplateEditModal
              key={editingTemplate.id}
              isOpen={isTemplateEditModalOpen}
              onClose={() => setIsTemplateEditModalOpen(false)}
              onSave={(t) => {
                updateTemplate(t);
                setIsTemplateEditModalOpen(false);
              }}
              template={editingTemplate}
              types={types}
            />

      )}
    </div>
  );
};
