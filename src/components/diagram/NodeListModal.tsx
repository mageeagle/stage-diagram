"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../store/useStore";

import { type GroupByMode, type NodeListModalProps } from "./node-list-modal-types";
import { groupByName, groupByLocation, groupByType } from "./node-list-utils";
import { NodeListHeader } from "./node-list-modal/NodeListHeader";
import { NodeListTabs } from "./node-list-modal/NodeListTabs";
import { NodeListContent } from "./node-list-modal/NodeListContent";

export const NodeListModal = ({ isOpen, onClose }: NodeListModalProps) => {
  const [groupBy, setGroupBy] = useState<GroupByMode>("none");
  const [showDetails, setShowDetails] = useState(true);
  const { nodes, edges, cableTypes } = useStore();

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

  if (!isOpen) return null;

  const aggregatedNodes =
    nodes.length > 0
      ? groupBy === "none"
        ? groupByName(nodes)
        : groupBy === "location"
          ? groupByLocation(nodes)
          : groupByType(nodes)
      : [];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <NodeListHeader onClose={onClose} />

        <div className="px-6 pb-6">
          <NodeListTabs groupBy={groupBy} setGroupBy={setGroupBy} />

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

          <NodeListContent
            aggregatedNodes={aggregatedNodes}
            groupBy={groupBy}
            showDetails={showDetails}
          />

          {cableTypes.length > 0 && (
            <div className="mt-6">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800">
                Cables
              </div >
              <div className="px-5 py-2">
                {cableTypes.map((type) => {
                  const count = edges.filter((edge) => edge.data.cableType === type).length;
                  return (
                    <div key={type} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700 dark:text-zinc-300">{type}</span>
                      <span className="text-gray-500 dark:text-zinc-500">{count}</span>
                    </div >
                  );
                })}
              </div >
            </div >
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
