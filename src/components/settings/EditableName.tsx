"use client";

import { useState } from "react";
import { Pencil, Check } from "lucide-react";

export const EditableName = ({
  value,
  onRename,
}: {
  value: string;
  onRename: (oldName: string, newName: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onRename(value, trimmed);
    }
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);

  return editing ? (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitEdit();
          if (e.key === "Escape") cancelEdit();
        }}
        onBlur={commitEdit}
        className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        onClick={commitEdit}
        onMouseDown={(e) => e.preventDefault()}
        className="shrink-0 cursor-pointer text-green-500 hover:text-green-600"
      >
        <Check size={16} />
      </button>
    </div>
  ) : (
    <>
      <span className="min-w-0 flex-1 break-words">{value}</span>
      <button
        onClick={startEdit}
        className="shrink-0 cursor-pointer text-zinc-400 hover:text-blue-500"
      >
        <Pencil size={16} />
      </button>
    </>
  );
};
