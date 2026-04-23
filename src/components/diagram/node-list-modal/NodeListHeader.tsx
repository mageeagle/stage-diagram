import React from "react";
import { X, List } from "lucide-react";
import { type NodeListHeaderProps } from "../node-list-modal-types";

export const NodeListHeader = ({ onClose }: NodeListHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-6 pb-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <List size={24} />
        Existing Nodes
      </h2>
      <button
        onClick={onClose}
        className="cursor-pointer rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <X size={20} />
      </button>
    </div>
  );
};
