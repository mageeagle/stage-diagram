"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../store/useStore";

import {
  type GroupByMode,
  type NodeListModalProps,
  type NodeListHeaderProps,
} from "./node-list-modal-types";
import { NodeListHeader } from "./node-list-modal/NodeListHeader";
import { NodeListTabs } from "./node-list-modal/NodeListTabs";
import { NodeListContent } from "./node-list-modal/NodeListContent";
import { generateNodeListReport } from "./node-list-modal/node-list-report-generator";
import { exportToPdf } from "./node-list-modal/pdf-export-utils";

export const NodeListModal = ({ isOpen, onClose }: NodeListModalProps) => {
  const [groupBy, setGroupBy] = useState<GroupByMode>("none");
  const [showDetails, setShowDetails] = useState(true);
  
  const { title, preparedBy, nodes, edges, cableTypes, updateTitle, updatePreparedBy } = useStore();
  
  // Sync with store on mount and when isOpen or store values change
  useEffect(() => {
    if (!isOpen) return;
    
    setGroupBy("none");
    setShowDetails(true);
    return () => {};
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleExport = () => {
    const report = generateNodeListReport(nodes, groupBy, edges);
    exportToPdf(report);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTitle(e.target.value);
  };

  const handlePreparedByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreparedBy(e.target.value);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <NodeListHeader
          onClose={onClose}
          onExport={handleExport}
          title={title}
          preparedBy={preparedBy}
        />

        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 py-2">
            <input
              type="text"
              id="title-input"
              value={title}
              onChange={(e) => updateTitle(e.target.value)}
              className="flex-1 text-sm font-semibold border-b border-zinc-300 dark:border-zinc-700 bg-transparent focus:border-blue-500 dark:focus:border-blue-400 placeholder-zinc-400 dark:placeholder-zinc-600"
              placeholder="Technical Rider"
            />
          </div>
          <div className="flex items-center gap-2 py-2">
            <input
              type="text"
              id="prepared-by-input"
              value={preparedBy}
              onChange={(e) => updatePreparedBy(e.target.value)}
              className="flex-1 text-sm border-b border-zinc-300 dark:border-zinc-700 bg-transparent focus:border-blue-500 dark:focus:border-blue-400 placeholder-zinc-400 dark:placeholder-zinc-600"
              placeholder="Prepared by..."
            />
          </div>
          <NodeListTabs groupBy={groupBy} setGroupBy={setGroupBy} />

          {groupBy !== "type" && (
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="show-details-toggle"
                checked={showDetails}
                onChange={(e) => setShowDetails(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <label
                htmlFor="show-details-toggle"
                className="text-sm font-medium text-gray-700 dark:text-zinc-300 select-none"
              >
                Show details
              </label>
            </div>
          )}
          <NodeListContent
            nodes={nodes}
            edges={edges}
            groupBy={groupBy}
            showDetails={showDetails}
          />

          {cableTypes.length > 0 && (
            <div className="mt-6">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800">
                Cables
              </div>
              <div className="px-5 py-2">
                {cableTypes.map((type) => {
                  const count = edges.filter(
                    (edge) => edge.data!.cableType === type,
                  ).length;
                  return (
                    <div key={type} className="flex justify-between py-1">
                      <span className="text-gray-700 dark:text-zinc-300">
                        {type}
                      </span>
                      <span className="text-gray-500 dark:text-zinc-500">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
