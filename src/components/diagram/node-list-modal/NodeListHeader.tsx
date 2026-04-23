import React from "react";
import { format } from "date-fns";
import { X, List, FileDown } from "lucide-react";
import { type NodeListHeaderProps } from "../node-list-modal-types";

export const NodeListHeader = ({ onClose, onExport, title, preparedBy }: NodeListHeaderProps) => {
  const currentDate = format(new Date(), "yyyy.MM.dd");

  return (
    <div className="flex items-center justify-between p-6 pb-4">
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
          <List size={24} />
          Existing Nodes
        </h2>
        <div className="text-sm">
          <div className="font-medium text-zinc-800 dark:text-zinc-200">{title}</div>
          <div className="text-zinc-500 dark:text-zinc-500">
            {preparedBy && `Prepared by ${preparedBy} • `}{currentDate}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onExport && (
          <button
            onClick={onExport}
            className="cursor-pointer rounded-md flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <FileDown size={18} />
            Export PDF
          </button>
        )}
        <button
          onClick={onClose}
          className="cursor-pointer rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
