'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface NodeCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, inputsCount: number, outputsCount: number, type: string, location: string) => void;
}

export const NodeCreationModal = ({
  isOpen,
  onClose,
  onCreate,
}: NodeCreationModalProps) => {
  const [name, setName] = useState('');
  const [inputsCount, setInputsCount] = useState(1);
  const [outputsCount, setOutputsCount] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  const { types, locations, addType, addLocation } = useStore();

  const nameRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      nameRef.current?.focus();
    }
  }, [isOpen]);

  const effectiveType = selectedType || 'none';
  const effectiveLocation = selectedLocation || 'none';

  const handleAddNewType = () => {
    const newType = window.prompt('Enter new type:');
    if (newType) {
      addType(newType);
      setSelectedType(newType);
    }
  };

  const handleAddNewLocation = () => {
    const newLocation = window.prompt('Enter new location:');
    if (newLocation) {
      addLocation(newLocation);
      setSelectedLocation(newLocation);
    }
  };

  if (!isOpen) return null;

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onCreate(name || 'New Node', inputsCount, outputsCount, effectiveType, effectiveLocation);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Create New Node
          </h2>
          <button
            onClick={handleCancel}
            className="cursor-pointer rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Node Name
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Node"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Type
            </label>
            <div className="flex gap-2">
              <select
                value={effectiveType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {types.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="none">None</option>
              </select>
              <button
                type="button"
                onClick={handleAddNewType}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Location
            </label>
            <div className="flex gap-2">
              <select
                value={effectiveLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {locations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
                <option value="none">None</option>
              </select>
              <button
                type="button"
                onClick={handleAddNewLocation}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Inputs
              </label>
              <input
                ref={inputRef}
                type="number"
                min="0"
                value={inputsCount}
                onChange={(e) => setInputsCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Outputs
              </label>
              <input
                type="number"
                min="0"
                value={outputsCount}
                onChange={(e) => setOutputsCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-md bg-blue-400 px-4 py-2 text-sm font-medium text-white hover:bg-blue-300"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
