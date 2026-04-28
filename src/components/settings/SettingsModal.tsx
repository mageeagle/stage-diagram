"use client";

import { useState, useRef } from "react";
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
    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
    />
  </div >
);

const ListSection = ({
  title,
  items,
  onAdd,
  onRemove,
  placeholder,
  autoFocus = false,
}: {
  title: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAdd(trimmed);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
        {title}
      </h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
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
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <span>{item}</span>
            <button
              onClick={() => onRemove(item)}
              className="cursor-pointer text-zinc-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PropertySection = ({
  title,
  hideTitle,
  onToggleHideTitle,
  hideDate,
  onToggleHideDate,
  properties,
}: {
  title: string;
  hideTitle: boolean;
  onToggleHideTitle: () => void;
  hideDate: boolean;
  onToggleHideDate: () => void;
  properties: {
    label: string;
    value: string;
    onChange: (val: string) => void;
  }[];
}) => {
  const safeId = (id: string) => id.replace(/\s+/g, "-").toLowerCase();
  const titleId = safeId(title);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex gap-8">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${titleId}-hide-title`}
            className="w-4 h-4 cursor-pointer"
            checked={hideTitle}
            onChange={onToggleHideTitle}
          />
          <label htmlFor={`${titleId}-hide-title`} className="text-sm font-medium cursor-pointer">
            Hide Title
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${titleId}-hide-date`}
            className="w-4 h-4 cursor-pointer"
            checked={hideDate}
            onChange={onToggleHideDate}
          />
          <label htmlFor={`${titleId}-hide-date`} className="text-sm font-medium cursor-pointer">
            Hide Date
          </label>
        </div>
      </div>
      <div className="space-y-3">
        {properties.map((prop) => (
          <PropertyInput key={prop.label} {...prop} />
        ))}
      </div>
    </div>
  );
};

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const types = useStore((s) => s.types);
  const locations = useStore((s) => s.locations);
  const cableTypes = useStore((s) => s.cableTypes);
  const addType = useStore((s) => s.addType);
  const removeType = useStore((s) => s.removeType);
  const addLocation = useStore((s) => s.addLocation);
  const removeLocation = useStore((s) => s.removeLocation);
  const addCableType = useStore((s) => s.addCableType);
  const removeCableType = useStore((s) => s.removeCableType);
  const riderListTitle = useStore((s) => s.riderListTitle);
  const riderListSubtitle = useStore((s) => s.riderListSubtitle);
  const riderListPreparedBy = useStore((s) => s.riderListPreparedBy);
  const updateRiderListTitle = useStore((s) => s.updateRiderListTitle);
  const updateRiderListSubtitle = useStore((s) => s.updateRiderListSubtitle);
  const updateRiderListPreparedBy = useStore((s) => s.updateRiderListPreparedBy);
  const canvasTitle = useStore((s) => s.canvasTitle);
  const canvasSubtitle = useStore((s) => s.canvasSubtitle);
  const canvasPreparedBy = useStore((s) => s.canvasPreparedBy);
  const updateCanvasTitle = useStore((s) => s.updateCanvasTitle);
  const updateCanvasSubtitle = useStore((s) => s.updateCanvasSubtitle);
  const updateCanvasPreparedBy = useStore((s) => s.updateCanvasPreparedBy);
  const hideTitle = useStore((s) => s.hideTitle);
  const hideRiderTitle = useStore((s) => s.hideRiderTitle);
  const toggleHideTitle = useStore((s) => s.toggleHideTitle);
  const toggleHideRiderTitle = useStore((s) => s.toggleHideRiderTitle);
  const hideDate = useStore((s) => s.hideDate);
  const hideRiderDate = useStore((s) => s.hideRiderDate);
  const toggleHideDate = useStore((s) => s.toggleHideDate);
  const toggleHideRiderDate = useStore((s) => s.toggleHideRiderDate);

  const stagePlanTitle = useStagePlanStore((s) => s.title);
  const stagePlanSubtitle = useStagePlanStore((s) => s.subtitle);
  const stagePlanPreparedBy = useStagePlanStore((s) => s.preparedBy);
  const updateStagePlanTitle = useStagePlanStore((s) => s.updateTitle);
  const updateStagePlanSubtitle = useStagePlanStore((s) => s.updateSubtitle);
  const updateStagePlanPreparedBy = useStagePlanStore((s) => s.updatePreparedBy);
  const hideStagePlanTitle = useStagePlanStore((s) => s.hideStagePlanTitle);
  const toggleHideStagePlanTitle = useStagePlanStore((s) => s.toggleHideStagePlanTitle);
  const hideStagePlanDate = useStagePlanStore((s) => s.hideStagePlanDate);
  const toggleHideStagePlanDate = useStagePlanStore((s) => s.toggleHideStagePlanDate);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

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
            <ListSection
              title="Type"
              items={types}
              onAdd={addType}
              onRemove={removeType}
              placeholder="Add type"
              autoFocus={true}
            />
            <ListSection
              title="Location"
              items={locations}
              onAdd={addLocation}
              onRemove={removeLocation}
              placeholder="Add location"
            />
            <ListSection
              title="Cable Type"
              items={cableTypes}
              onAdd={addCableType}
              onRemove={removeCableType}
              placeholder="Add cable type"
            />
          </div>

          {/* Properties Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <PropertySection
              title="Rider List"
              hideTitle={hideRiderTitle}
              onToggleHideTitle={toggleHideRiderTitle}
              hideDate={hideRiderDate}
              onToggleHideDate={toggleHideRiderDate}
              properties={[
                { label: "Title", value: riderListTitle, onChange: updateRiderListTitle },
                { label: "Subtitle", value: riderListSubtitle, onChange: updateRiderListSubtitle },
                { label: "Prepared By", value: riderListPreparedBy, onChange: updateRiderListPreparedBy },
              ]}
            />
            <PropertySection
              title="Signal Flow"
              hideTitle={hideTitle}
              onToggleHideTitle={toggleHideTitle}
              hideDate={hideDate}
              onToggleHideDate={toggleHideDate}
              properties={[
                { label: "Title", value: canvasTitle, onChange: updateCanvasTitle },
                { label: "Subtitle", value: canvasSubtitle, onChange: updateCanvasSubtitle },
                { label: "Prepared By", value: canvasPreparedBy, onChange: updateCanvasPreparedBy },
              ]}
            />
            <PropertySection
              title="Stage Plan"
              hideTitle={hideStagePlanTitle}
              onToggleHideTitle={toggleHideStagePlanTitle}
              hideDate={hideStagePlanDate}
              onToggleHideDate={toggleHideStagePlanDate}
              properties={[
                { label: "Title", value: stagePlanTitle, onChange: updateStagePlanTitle },
                { label: "Subtitle", value: stagePlanSubtitle, onChange: updateStagePlanSubtitle },
                { label: "Prepared By", value: stagePlanPreparedBy, onChange: updateStagePlanPreparedBy },
              ]}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
