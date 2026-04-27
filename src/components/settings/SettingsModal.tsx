"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useStagePlanStore } from "../../store/useStagePlanStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertyInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    />
  </div>
);

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const {
    types,
    locations,
    cableTypes,
    addType,
    removeType,
    addLocation,
    removeLocation,
    addCableType,
    removeCableType,
    riderListTitle,
    riderListSubtitle,
    riderListPreparedBy,
    updateRiderListTitle,
    updateRiderListSubtitle,
    updateRiderListPreparedBy,
    canvasTitle,
    canvasSubtitle,
    canvasPreparedBy,
    updateCanvasTitle,
    updateCanvasSubtitle,
    updateCanvasPreparedBy,
  } = useStore();

  const {
    title: stagePlanTitle,
    subtitle: stagePlanSubtitle,
    preparedBy: stagePlanPreparedBy,
    updateTitle: updateStagePlanTitle,
    updateSubtitle: updateStagePlanSubtitle,
    updatePreparedBy: updateStagePlanPreparedBy,
  } = useStagePlanStore();

  const [newType, setNewType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCableType, setNewCableType] = useState("");

  const typeInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const cableTypeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      typeInputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newType.trim()) {
      addType(newType.trim());
      setNewType("");
      typeInputRef.current?.focus();
    }
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocation.trim()) {
      addLocation(newLocation.trim());
      setNewLocation("");
      locationInputRef.current?.focus();
    }
  };

  const handleAddCableType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCableType.trim()) {
      addCableType(newCableType.trim());
      setNewCableType("");
      cableTypeInputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-10">
          {/* Lists Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Type List */}
            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
                Type
              </h3>
              <form onSubmit={handleAddType} className="flex gap-2 mb-4">
                <input
                  ref={typeInputRef}
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="Add type"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-md bg-blue-400 p-1.5 text-white hover:bg-blue-300"
                >
                  <Plus size={18} />
                </button>
              </form>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {types.map((type) => (
                  <li
                    key={type}
                    className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    <span>{type}</span>
                    <button
                      onClick={() => removeType(type)}
                      className="cursor-pointer text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location List */}
            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
                Location
              </h3>
              <form onSubmit={handleAddLocation} className="flex gap-2 mb-4">
                <input
                  ref={locationInputRef}
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Add location"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-md bg-blue-400 p-1.5 text-white hover:bg-blue-300"
                >
                  <Plus size={18} />
                </button>
              </form>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {locations.map((location) => (
                  <li
                    key={location}
                    className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    <span>{location}</span>
                    <button
                      onClick={() => removeLocation(location)}
                      className="cursor-pointer text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cable Type List */}
            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
                Cable Type
              </h3>
              <form onSubmit={handleAddCableType} className="flex gap-2 mb-4">
                <input
                  ref={cableTypeInputRef}
                  type="text"
                  value={newCableType}
                  onChange={(e) => setNewCableType(e.target.value)}
                  placeholder="Add cable type"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-md bg-blue-400 p-1.5 text-white hover:bg-blue-300"
                >
                  <Plus size={18} />
                </button>
              </form>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {cableTypes.map((cableType) => (
                  <li
                    key={cableType}
                    className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    <span>{cableType}</span>
                    <button
                      onClick={() => removeCableType(cableType)}
                      className="cursor-pointer text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Properties Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            {/* Rider List Properties */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
                Rider List
              </h3>
              <div className="space-y-3">
                <PropertyInput
                  label="Title"
                  value={riderListTitle}
                  onChange={updateRiderListTitle}
                />
                <PropertyInput
                  label="Subtitle"
                  value={riderListSubtitle}
                  onChange={updateRiderListSubtitle}
                />
                <PropertyInput
                  label="Prepared By"
                  value={riderListPreparedBy}
                  onChange={updateRiderListPreparedBy}
                />
              </div>
            </div>

            {/* Diagram Canvas Properties */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
                Diagram Canvas
              </h3>
              <div className="space-y-3">
                <PropertyInput
                  label="Title"
                  value={canvasTitle}
                  onChange={updateCanvasTitle}
                />
                <PropertyInput
                  label="Subtitle"
                  value={canvasSubtitle}
                  onChange={updateCanvasSubtitle}
                />
                <PropertyInput
                  label="Prepared By"
                  value={canvasPreparedBy}
                  onChange={updateCanvasPreparedBy}
                />
              </div>
            </div>

            {/* Stage Plan Canvas Properties */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
                Stage Plan Canvas
              </h3>
              <div className="space-y-3">
                <PropertyInput
                  label="Title"
                  value={stagePlanTitle}
                  onChange={updateStagePlanTitle}
                />
                <PropertyInput
                  label="Subtitle"
                  value={stagePlanSubtitle}
                  onChange={updateStagePlanSubtitle}
                />
                <PropertyInput
                  label="Prepared By"
                  value={stagePlanPreparedBy}
                  onChange={updateStagePlanPreparedBy}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
