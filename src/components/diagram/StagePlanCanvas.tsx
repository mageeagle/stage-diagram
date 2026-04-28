"use client";

import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Node,
  ReactFlowInstance,
  OnInit,
  Edge,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useStagePlanStore } from "@/store/useStagePlanStore";
import { useThemeStore } from "@/store/useThemeStore";
import { StagePlanNode } from "@/components/nodes/StagePlanNode";
import { ExportButton } from "@/components/diagram/ExportButton";
import { CustomNodeData } from "@/types/diagram";
import { useStore } from "@/store/useStore";
import { GroupNode } from "../nodes/GroupNode";
import { format } from "date-fns/format";

const nodeTypes = {
  custom: StagePlanNode,
  group: GroupNode,
};

const groupNodesStore = new Map<string, Node>();

export const StagePlanCanvas = () => {
  const originalNodes = useStore((s) => s.nodes);
  const nodes = useStagePlanStore((state) => state.nodes);
  const title = useStagePlanStore((state) => state.title);
  const subtitle = useStagePlanStore((state) => state.subtitle);
  const preparedBy = useStagePlanStore((state) => state.preparedBy);
  useEffect(() => {
    useStagePlanStore.getState().matchNode(originalNodes);
  }, [originalNodes]);
  const moveNodes = useStagePlanStore((state) => state.moveNodes);
  const onNodesChangeOrig = useStagePlanStore((state) => state.onNodesChange);
  const hideTitle = useStagePlanStore((state) => state.hideStagePlanTitle);
  const hideDate = useStagePlanStore((state) => state.hideStagePlanDate);
  const setSelectedNodeIds = useStagePlanStore(
    (state) => state.setSelectedNodeIds,
  );
  const locationGroupsEnabled = useStagePlanStore(
    (state) => state.locationGroupsEnabled,
  );
  const toggleLocationGroups = useStagePlanStore(
    (state) => state.toggleLocationGroups,
  );
  const groupNodesMap = useMemo(() => groupNodesStore, []);
  useEffect(() => {
    if (!locationGroupsEnabled) {
      groupNodesMap.clear();
    }
  }, [locationGroupsEnabled, groupNodesMap]);

  const [groupNodesTick, setGroupNodesTick] = useState(0);

  const undo = useStagePlanStore((state) => state.undo);
  const redo = useStagePlanStore((state) => state.redo);
  const theme = useThemeStore((state) => state.theme);
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onReactFlowApi = useCallback((instance: ReactFlowInstance) => {
    flowInstanceRef.current = instance;
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeIds([node.id]);
    },
    [setSelectedNodeIds],
  );

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeIds([node.id]);
    },
    [setSelectedNodeIds],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeIds([]);
  }, [setSelectedNodeIds]);

  const onSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      const newNodeIds = params.nodes.map((n) => n.id);

      if (JSON.stringify(newNodeIds) !== JSON.stringify(setSelectedNodeIds)) {
        setSelectedNodeIds(newNodeIds);
      }
    },
    [setSelectedNodeIds],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (isTyping) {
        return;
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "z" || event.key === "Z")
      ) {
        undo();
        return;
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "y" ||
          event.key === "Y" ||
          (event.shiftKey && event.key === "Z"))
      ) {
        redo();
        return;
      }
    },
    [undo, redo],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const groupChanges = changes.filter(
        (
          c,
        ): c is NodeChange<Node<CustomNodeData>> & {
          type: "position";
          position: { x: number; y: number };
        } => "id" in c && c.id.startsWith("group-") && c.type === "position",
      );
      const otherChanges = changes.filter(
        (c) => !("id" in c) || !c.id.startsWith("group-"),
      ) as NodeChange<Node<CustomNodeData>>[];

      if (groupChanges.length > 0) {
        groupChanges.forEach((change) => {
          const { id, position } = change;
          const existingNode = groupNodesMap.get(id);
          if (existingNode) {
            const delta = {
              x: position.x - existingNode.position.x,
              y: position.y - existingNode.position.y,
            };

            if (delta.x !== 0 || delta.y !== 0) {
              const location = id.replace("group-", "");
              const nodesToMove = nodes.filter(
                (n) => n.data.location === location,
              );
              if (nodesToMove.length > 0) {
                moveNodes(
                  nodesToMove.map((n) => n.id),
                  delta,
                );
              }
            }
            groupNodesMap.set(id, { ...existingNode, position });
          }
        });
        setGroupNodesTick((t) => t + 1);
      }

      if (otherChanges.length > 0) {
        onNodesChangeOrig(otherChanges);
      }
      onNodesChangeOrig(changes as NodeChange<Node<CustomNodeData>>[]);
    },
    [onNodesChangeOrig, groupNodesMap, nodes, moveNodes],
  );

  const displayNodes = useMemo(() => {
    if (!locationGroupsEnabled) return nodes;

    const groupedNodes = new Map<string, Node[]>();

    nodes.forEach((node) => {
      const location = node.data.location!;
      if (!groupedNodes.has(location)) {
        groupedNodes.set(location, []);
      }
      groupedNodes.get(location)?.push(node);
    });

    const groupEntries = Array.from(groupedNodes.entries()).filter(
      ([, nodeGroup]) => nodeGroup.length > 1,
    );
    const groupNodesList = groupEntries.map(([location, groupNodes]) => {
      const groupId = `group-${location}`;
      const props = {
        id: groupId,
        type: "group" as const,
        position: {
          x: Math.min(...groupNodes.map((n) => n.position.x - 20 || 0)),
          y: Math.min(...groupNodes.map((n) => n.position.y - 50 || 0)),
        },
        data: { label: location },
        selected: false,
        width:
          Math.max(
            ...groupNodes.map(
              (n) =>
                (n.position.x || 0) + (n.measured?.width || n.width || 200),
            ),
          ) -
          Math.min(...groupNodes.map((n) => n.position.x || 0)) +
          40,
        height:
          Math.max(
            ...groupNodes.map(
              (n) =>
                (n.position.y || 0) + (n.measured?.height || n.height || 100),
            ),
          ) -
          Math.min(...groupNodes.map((n) => n.position.y || 0)) +
          70,
      };

      const existingNode = groupNodesMap.get(groupId);
      if (existingNode) {
        const updatedNode = { ...existingNode, ...props };
        groupNodesMap.set(groupId, updatedNode);
        return updatedNode;
      }

      const newNode = props as Node;

      groupNodesMap.set(groupId, newNode);
      return newNode;
    });

    const groupedNodeIds = new Set(groupNodesList.map((g) => g.id));

    const baseDisplayNodes = [
      ...groupNodesList,
      ...nodes.filter((node) => !groupedNodeIds.has(node.id)),
    ];

    const baseDisplayNodesMap = new Map(baseDisplayNodes.map((n) => [n.id, n]));

    const displayNodes = baseDisplayNodes.map((node) => {
      if (node.position && node.parentId) {
        const parent = baseDisplayNodesMap.get(node.parentId);
        if (parent && parent.position) {
          // We use groupNodesTick to trigger re-calculation of transient nodes
          // even though it's not directly used in the calculation.
          void groupNodesTick;

          return {
            ...node,
            position: {
              ...node.position,
              absolute: {
                x: node.position.x - parent.position.x,
                y: node.position.y - parent.position.y,
              },
            },
          };
        }
      }
      return node;
    });

    return displayNodes;
  }, [nodes, locationGroupsEnabled, groupNodesMap, groupNodesTick]);
  return (
    <div className="w-full h-full relative bg-background">
      <div ref={containerRef} className="w-full h-full">
        <ReactFlow
          nodes={displayNodes}
          onNodesChange={onNodesChange}
          onSelectionChange={onSelectionChange}
          onNodeClick={onNodeClick}
          onNodeDragStart={onNodeDragStart}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          colorMode={theme}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          onInit={onReactFlowApi as OnInit}
        >
          <Controls position="bottom-right" />
        </ReactFlow>
        {!hideTitle && (
          <div className="absolute bottom-6 left-6 z-10">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {title}
            </div>
            <div className="text-lg text-zinc-600 dark:text-zinc-400">
              {subtitle}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-500">
              {preparedBy}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-500">
              {preparedBy}
            </div>
            {!hideDate && (
              <div className="text-sm text-zinc-500 dark:text-zinc-500">
                {format(new Date(), "yyyy.MM.dd")}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <ExportButton targetRef={containerRef} isStagePlanMode={true} />
        <label className="flex items-center gap-2 cursor-pointer bg-stone-200 dark:bg-stone-700 px-3 py-1 rounded border border-stone-400">
          <input
            type="checkbox"
            checked={locationGroupsEnabled}
            onChange={() => toggleLocationGroups()}
            className="accent-stone-600"
          />
          <span className="text-sm text-stone-700 dark:text-stone-300">
            Group by Location
          </span>
        </label>
      </div>
    </div>
  );
};
