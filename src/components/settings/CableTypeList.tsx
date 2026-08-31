"use client";

import { useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { DASH_PATTERN } from "@/utils/cableStyles";
import { ColorInput } from "./ColorInput";
import type { DashPattern } from "@/types/diagram";

const DASH_OPTIONS: { value: DashPattern; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "dashdot", label: "Dash-dot" },
];

function LineSample({
  color,
  strokeWidth,
  dash,
}: {
  color: string;
  strokeWidth: number;
  dash: DashPattern;
}) {
  return (
    <svg width="28" height="10" className="shrink-0">
      <line
        x1="1"
        y1="5"
        x2="27"
        y2="5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={dash === "solid" ? undefined : DASH_PATTERN[dash]}
      />
    </svg>
  );
}

export const CableTypeList = () => {
  const cableTypes = useStore((s) => s.cableTypes);
  const addCableType = useStore((s) => s.addCableType);
  const removeCableType = useStore((s) => s.removeCableType);
  const updateCableTypeStyle = useStore((s) => s.updateCableTypeStyle);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      addCableType(trimmed);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
        Cable Type
      </h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
      <ul className="space-y-2">
        {cableTypes.map((def) => (
          <li
            key={def.name}
            className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <LineSample
                color={def.color}
                strokeWidth={def.strokeWidth}
                dash={def.dash}
              />
              <span className="min-w-0 flex-1 break-words">{def.name}</span>
              <ColorInput
                value={def.color}
                onCommit={(hex) =>
                  updateCableTypeStyle(def.name, { color: hex })
                }
                className="h-6 w-8 shrink-0 cursor-pointer rounded border border-zinc-300 bg-transparent dark:border-zinc-600"
                ariaLabel={`${def.name} color`}
              />
              <label className="flex shrink-0 items-center gap-1 text-xs">
                <span className="text-zinc-500">Width</span>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={def.strokeWidth}
                  onChange={(e) =>
                    updateCableTypeStyle(def.name, {
                      strokeWidth: Math.min(
                        6,
                        Math.max(1, Number(e.target.value) || 1),
                      ),
                    })
                  }
                  className="w-12 rounded border border-zinc-300 bg-white px-1 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>
              <select
                value={def.dash}
                onChange={(e) =>
                  updateCableTypeStyle(def.name, {
                    dash: e.target.value as DashPattern,
                  })
                }
                className="shrink-0 rounded border border-zinc-300 bg-white px-1 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              >
                {DASH_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeCableType(def.name)}
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
