"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, List, MapPin, Tag } from "lucide-react";
import { useStore } from "../../store/useStore";
import { Node } from "@xyflow/react";
import { CustomNodeData } from "../../types/diagram";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NodeListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GroupByMode = "none" | "location" | "type";

interface GroupedNode {
  name: string;
  type?: string;
  location?: string;
  quantity: number;
}

// Helper: group by name & type, hide location
const groupByName = (nodes: Node<CustomNodeData>[]): GroupedNode[] => {
  const map = new Map<string, GroupedNode[]>();
  nodes.forEach((node) => {
    const key = node.data.label || "unassigned";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({
      name: node.data.label || "",
      type: node.data.type,
      location: node.data.location,
      quantity: 1,
    });
  });

  const result: GroupedNode[] = [];
  map.forEach((group) => {
    const subMap = new Map<string, GroupedNode>();
    group.forEach((n) => {
      const subKey = `${n.name}-${n.type}-${n.location}`;
      if (subMap.has(subKey)) {
        subMap.get(subKey)!.quantity += 1;
      } else {
        subMap.set(subKey, { ...n, quantity: 1 });
      }
    });
    subMap.forEach((subNode) => result.push(subNode));
  });
  return result;
};

// Helper: group by location, then name & type
const groupByLocation = (nodes: Node<CustomNodeData>[]): GroupedNode[] => {
  const map = new Map<string, GroupedNode[]>();
  nodes.forEach((node) => {
    const key = node.data.location || "unassigned";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({
      name: node.data.label || "",
      type: node.data.type,
      location: node.data.location,
      quantity: 1,
    });
  });

  const result: GroupedNode[] = [];
  map.forEach((group) => {
    const subMap = new Map<string, GroupedNode>();
    group.forEach((n) => {
      const subKey = `${n.name}-${n.type}`;
      if (subMap.has(subKey)) {
        subMap.get(subKey)!.quantity += 1;
      } else {
        subMap.set(subKey, { ...n, quantity: 1 });
      }
    });
    subMap.forEach((subNode) => result.push(subNode));
  });
  return result;
};

// Helper: group by type, then name
const groupByType = (nodes: Node<CustomNodeData>[]): GroupedNode[] => {
  const map = new Map<string, GroupedNode[]>();
  nodes.forEach((node) => {
    const key = node.data.type || "unassigned";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({
      name: node.data.label || "",
      type: node.data.type,
      location: node.data.location,
      quantity: 1,
    });
  });

  const result: GroupedNode[] = [];
  map.forEach((group) => {
    const subMap = new Map<string, GroupedNode>();
    group.forEach((n) => {
      const subKey = `${n.name}-${n.type}`;
      if (subMap.has(subKey)) {
        subMap.get(subKey)!.quantity += 1;
      } else {
        subMap.set(subKey, { ...n, quantity: 1 });
      }
    });
    subMap.forEach((subNode) => result.push(subNode));
  });
  return result;
};

export const NodeListModal = ({ isOpen, onClose }: NodeListModalProps) => {
  const [groupBy, setGroupBy] = useState<GroupByMode>("none");
  const { nodes } = useStore();

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

  const renderGroupedList = () => {
    return (
      <div className="max-h-[400px] overflow-y-auto">
        {aggregatedNodes.reduce((acc: React.ReactNode[], node, index) => {
          if (groupBy === "location") {
            const isNewLocation =
              index === 0 ||
              node.location !== aggregatedNodes[index - 1].location;
            if (isNewLocation) {
              acc.push(
                <div
                  key={`header-${index}`}
                  className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800"
                >
                  {node.location || "unassigned"}
                </div>,
              );
            }
          }

          if (groupBy === "type") {
            const isNewType =
              index === 0 ||
              node.type !== aggregatedNodes[index - 1].type;
            if (isNewType) {
              acc.push(
                <div
                  key={`header-${index}`}
                  className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800"
                >
                  {node.type || "unassigned"}
                </div>,
              );
            }
          }

          acc.push(
            <div
              key={`${node.name}-${node.quantity}-${index}`}
              className="flex items-center border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex-1 px-5 py-3">
                <div className="font-medium text-zinc-900 dark:text-zinc-100 wrap-break-word max-w-full flex flex-col">
                  <span className="truncate">{node.name}</span>
                  <div className="flex gap-3  text-xs text-zinc-500 dark:text-zinc-400">
                    {node.type && (
                      <div className=" mt-1 flex items-center gap-1">
                        <Tag size={12} />
                        {node.type}
                      </div>
                    )}
                    {groupBy === "none" && (
                      <div className="mt-1 flex items-center gap-1">
                        <MapPin size={12} />
                        {node.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="shrink-0 w-20 px-3 py-3 text-right border-l border-zinc-100 dark:border-zinc-800">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {node.quantity}
                </span>
              </div>
            </div>,
          );
          return acc;
        }, [])}
      </div>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="px-6 pb-6">
          <div className="flex gap-2 mb-4 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
            <button
              onClick={() => setGroupBy("none")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded transition-colors",
                groupBy === "none"
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
              )}
            >
              None
            </button>
            <button
              onClick={() => setGroupBy("location")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded transition-colors",
                groupBy === "location"
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
              )}
            >
              <MapPin size={14} />
              Location
            </button>
            <button
              onClick={() => setGroupBy("type")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded transition-colors",
                groupBy === "type"
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
              )}
            >
              <Tag size={14} />
              Type
            </button>
          </div>

          {renderGroupedList()}
        </div>
      </div>
    </div>,
    document.body,
  );
};
