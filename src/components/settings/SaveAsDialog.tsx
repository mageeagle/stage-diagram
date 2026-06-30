"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const INVALID_FILENAME_CHARS = /[<>:"/\\|?*]/g;

function stripExtension(name: string): string {
  const lastDot = name.lastIndexOf(".");
  return lastDot > 0 ? name.slice(0, lastDot) : name;
}

function sanitizeFilename(name: string): string {
  return name.replace(INVALID_FILENAME_CHARS, "");
}

interface SaveAsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedName: string;
  extension: string;
  onConfirm: (filename: string) => void;
}

export const SaveAsDialog = ({
  isOpen,
  onClose,
  suggestedName,
  extension,
  onConfirm,
}: SaveAsDialogProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const nameWithoutExt = stripExtension(suggestedName);
      setInputValue(sanitizeFilename(nameWithoutExt));
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen, suggestedName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSave = () => {
    const sanitized = sanitizeFilename(inputValue).trim();
    if (sanitized) {
      onConfirm(sanitized + "." + extension);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Save As
          </h2>
          <button
            onClick={handleCancel}
            className="cursor-pointer rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Filename
            </label>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(sanitizeFilename(e.target.value))}
              placeholder="Enter filename"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Extension
            </label>
            <input
              type="text"
              value={"." + extension}
              disabled
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="cursor-pointer rounded-md bg-blue-400 px-4 py-2 text-sm font-medium text-white hover:bg-blue-300"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
