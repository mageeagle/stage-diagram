"use client";

import { useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { ColorInput } from "./ColorInput";

export const LocationList = () => {
  const locations = useStore((s) => s.locations);
  const addLocation = useStore((s) => s.addLocation);
  const removeLocation = useStore((s) => s.removeLocation);
  const locationBackgrounds = useStore((s) => s.locationBackgrounds);
  const setLocationBackground = useStore((s) => s.setLocationBackground);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      addLocation(trimmed);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
        Location
      </h3>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
      <ul className="space-y-2">
        {locations.map((location) => (
          <li
            key={location}
            className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="min-w-0 flex-1 break-words">{location}</span>
              <ColorInput
                value={locationBackgrounds[location] ?? "#e7e5e4"}
                onCommit={(hex) => setLocationBackground(location, hex)}
                className="h-6 w-8 shrink-0 cursor-pointer rounded border border-zinc-300 bg-transparent dark:border-zinc-600"
                ariaLabel={`${location} background color`}
              />
              <button
                onClick={() => removeLocation(location)}
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
