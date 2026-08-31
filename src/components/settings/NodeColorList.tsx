"use client";

import { useState, useRef } from "react";
import { Info, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Tooltip } from "@/components/tooltip/Tooltip";
import { ColorInput } from "./ColorInput";

export const NodeColorList = () => {
  const namedColors = useStore((s) => s.namedColors);
  const addNamedColor = useStore((s) => s.addNamedColor);
  const removeNamedColor = useStore((s) => s.removeNamedColor);
  const renameNamedColor = useStore((s) => s.renameNamedColor);
  const updateNamedColorColor = useStore((s) => s.updateNamedColorColor);
  const [inputValue, setInputValue] = useState("");
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      addNamedColor(trimmed);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-1 text-sm font-medium uppercase tracking-wider text-zinc-500">
        Node Background Colors
        <span className="relative inline-flex">
          <Tooltip
            position="bottom"
            isVisible={isTooltipVisible}
            content="Named colors available as node backgrounds. Renaming a color updates every node using it."
            className="absolute right-0 top-full mt-2 w-56"
          />
          <Info
            size={14}
            className="cursor-help text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            onMouseEnter={() => setIsTooltipVisible(true)}
            onMouseLeave={() => setIsTooltipVisible(false)}
          />
        </span>
      </h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add color name"
          aria-label="Add color name"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-blue-400 p-1.5 text-white hover:bg-blue-300"
        >
          <Plus size={18} />
        </button>
      </form>
      <ul className="space-y-2">
        {namedColors.map((def) => (
          <li
            key={def.name}
            className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className="h-4 w-6 shrink-0 rounded border border-zinc-300 dark:border-zinc-600"
                style={{ backgroundColor: def.color }}
              />
              <input
                type="text"
                defaultValue={def.name}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== def.name) renameNamedColor(def.name, v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                aria-label="Rename color"
                className="min-w-0 flex-1 truncate rounded border border-transparent bg-transparent px-1 py-0.5 text-sm focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-zinc-600"
              />
              <ColorInput
                value={def.color}
                onCommit={(hex) => updateNamedColorColor(def.name, hex)}
                className="h-6 w-8 shrink-0 cursor-pointer rounded border border-zinc-300 bg-transparent dark:border-zinc-600"
                ariaLabel={`${def.name} color`}
              />
              <button
                onClick={() => removeNamedColor(def.name)}
                aria-label={`Delete ${def.name}`}
                className="shrink-0 cursor-pointer text-zinc-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
