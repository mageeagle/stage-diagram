'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, List, MapPin, Tag } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Node } from '@xyflow/react';
import { CustomNodeData } from '../../types/diagram';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NodeListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GroupByMode = 'none' | 'location' | 'type';

export const NodeListModal = ({
  isOpen,
  onClose,
}: NodeListModalProps) => {
  const [groupBy, setGroupBy] = useState<GroupByMode>('none');
  const { nodes } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderNode = (node: Node<CustomNodeData>) => (
    <div key={node.id} className="flex flex-col p-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      <span className="font-medium text-zinc-900 dark:text-zinc-100">{node.data.label}</span>
      <div className="flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        {node.data.type && (
          <div className="flex items-center gap-1">
            <Tag size={12} />
            {node.data.type}
          </div>
        )}
        {node.data.location && (
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            {node.data.location}
          </div>
        )}
      </div>
    </div>
  );

  const renderGroupedList = () => {
    if (groupBy === 'none') {
      return <div className="max-h-[400px] overflow-y-auto">{nodes.map(renderNode)}</div>;
    }

    const groups: Record<string, Node<CustomNodeData>[]> = {};
    nodes.forEach((node) => {
      const val = groupBy === 'location' ? node.data.location : node.data.type;
      const groupKey = val || 'unassigned';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(node);
    });

    return (
      <div className="max-h-[400px] overflow-y-auto">
        {Object.entries(groups).map(([groupName, groupNodes]) => (
          <div key={groupName}>
            <div className="sticky top-0 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
              {groupName}
            </div>
            {groupNodes.map(renderNode)}
          </div>
        ))}
      </div>
    );
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
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
              onClick={() => setGroupBy('none')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded transition-colors",
                groupBy === 'none' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              None
            </button>
            <button
              onClick={() => setGroupBy('location')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded transition-colors",
                groupBy === 'location' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <MapPin size={14} />
              Location
            </button>
            <button
              onClick={() => setGroupBy('type')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded transition-colors",
                groupBy === 'type' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
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
    document.body
  );
};
