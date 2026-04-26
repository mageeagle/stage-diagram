'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { NodeInput, NodeOutput, NodeTemplate } from '../../types/diagram';

interface TemplateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: NodeTemplate) => void;
  template: NodeTemplate;
  types: string[];
}

export const TemplateEditModal = ({
  isOpen,
  onClose,
  onSave,
  template,
  types,
}: TemplateEditModalProps) => {
  const [name, setName] = useState(template.name);
  const [type, setType] = useState(template.type);
  const [inputs, setInputs] = useState<NodeInput[]>(template.inputs);
  const [outputs, setOutputs] = useState<NodeOutput[]>(template.outputs);

  if (!isOpen) return null;


  const handleAddInput = () => {
    setInputs([...inputs, { id: nanoid(), name: `Input ${inputs.length + 1}` }]);
  };

  const handleRemoveInput = (id: string) => {
    setInputs(inputs.filter((input) => input.id !== id));
  };

  const handleUpdateInputName = (id: string, newName: string) => {
    setInputs(inputs.map((input) => (input.id === id ? { ...input, name: newName } : input)));
  };

  const handleAddOutput = () => {
    setOutputs([...outputs, { id: nanoid(), name: `Output ${outputs.length + 1}` }]);
  };

  const handleRemoveOutput = (id: string) => {
    setOutputs(outputs.filter((output) => output.id !== id));
  };

  const handleUpdateOutputName = (id: string, newName: string) => {
    setOutputs(outputs.map((output) => (output.id === id ? { ...output, name: newName } : output)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...template,
      name,
      type,
      inputs,
      outputs,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Edit Template
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">None</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inputs</h3>
                <button
                  type="button"
                  onClick={handleAddInput}
                  className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  <Plus size={14} /> Add Input
                </button>
              </div>
              <div className="space-y-2">
                {inputs.map((input) => (
                  <div key={input.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input.name}
                      onChange={(e) => handleUpdateInputName(input.id, e.target.value)}
                      className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInput(input.id)}
                      className="rounded-md p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Outputs</h3>
                <button
                  type="button"
                  onClick={handleAddOutput}
                  className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  <Plus size={14} /> Add Output
                </button>
              </div>
              <div className="space-y-2">
                {outputs.map((output) => (
                  <div key={output.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={output.name}
                      onChange={(e) => handleUpdateOutputName(output.id, e.target.value)}
                      className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOutput(output.id)}
                      className="rounded-md p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-md bg-blue-400 px-4 py-2 text-sm font-medium text-white hover:bg-blue-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
