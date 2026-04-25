"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FolderCode, User } from "lucide-react";
import { useStore } from "../../store/useStore";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const { setIsHelpModalOpen } = useStore();

  useEffect(() => {
    if (isOpen) {
      document.body.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Help
          </h2>
          <button
            onClick={() => {
              onClose();
              setIsHelpModalOpen(false);
            }}
            className="cursor-pointer rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This application provides a simple, unified interface for creating
            both Rider Lists and Signal Flows, helping you visualize and
            organize technical requirements more effectively.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">
            Keyboard Shortcuts
          </h3>
          <div className="rounded-md bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  Ctrl+Z
                </kbd>
                <span>Undo</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  Ctrl+Y
                </kbd>
                <span>Redo</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  C
                </kbd>
                <span>Duplicate Selected</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  Backspace / Delete
                </kbd>
                <span>Delete Selected</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  Spacebar / Enter
                </kbd>
                <span>Create New</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  Ctrl + Click
                </kbd>
                <span>Multiselect</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  Shift + Drag
                </kbd>
                <span>Multiselect Area</span>
              </li>
              <li className="flex items-center gap-2">
                <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs font-mono text-zinc-600 dark:border-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  Esc
                </kbd>
                <span>Close Dialog</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div className="flex items-center gap-4 h-12">
            <a
              href="https://www.qqaqq.net"
              target="_blank"
              rel="noopener noreferrer"
              className="h-full flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <User size={16} />
              <div className="flex flex-col items-start">
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  Made by
                </span>
                <span className="font-medium">Eagle Wu</span>
              </div>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-full flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <FolderCode size={16} />
              <span>Source Code</span>
            </a>
            <span className="text-sm">License: AGPL-3.0</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
