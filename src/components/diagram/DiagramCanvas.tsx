"use client";

import React, { useCallback, useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Node,
  Edge,
  applyNodeChanges,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStore } from "@/store/useStore";
import { CustomNodeData } from "@/types/diagram";
import { CustomNode } from "@/components/nodes/CustomNode";
import { GroupNode } from "@/components/nodes/GroupNode";
import { NodeCreationModal } from "@/components/diagram/NodeCreationModal";
import { LabeledEdge } from "@/components/diagram/LabeledEdge";
import { ExportButton } from "@/components/diagram/ExportButton";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

const nodeTypes = {
  custom: CustomNode,
  group: GroupNode,
};

export const DiagramCanvas = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const onNodesChangeOrig = useStore((state) => state.onNodesChange);
  const moveNodes = useStore((state) => state.moveNodes);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);
  const setSelectedNodeIds = useStore((state) => state.setSelectedNodeIds);
  const selectedNodeIds = useStore((state) => state.selectedNodeIds);
  const setSelectedEdgeIds = useStore((state) => state.setSelectedEdgeIds);
  const selectedEdgeIds = useStore((state) => state.selectedEdgeIds);
  const deleteNodes = useStore((state) => state.deleteNodes);
  const deleteEdge = useStore((state) => state.deleteEdge);
  const addNode = useStore((state) => state.addNode);
  const copyNodes = useStore((state) => state.copyNodes);
  const isModalOpen = useStore((state) => state.isModalOpen);
  const pendingPosition = useStore((state) => state.pendingPosition);
  const setIsModalOpen = useStore((state) => state.setIsModalOpen);
  const setPendingPosition = useStore((state) => state.setPendingPosition);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const locationGroupsEnabled = useStore(
    (state) => state.locationGroupsEnabled,
  );
  const toggleLocationGroups = useStore((state) => state.toggleLocationGroups);
  const { theme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDraggedNodePosition = useRef<{ x: number; y: number } | null>(null);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeIds([node.id]);
      setSelectedEdgeIds([]);
    },
    [setSelectedNodeIds, setSelectedEdgeIds],
  );

  const onNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNodeIds([node.id]);
      setSelectedEdgeIds([]);
      if (node.id.startsWith('group-')) {
        lastDraggedNodePosition.current = { x: node.position.x, y: node.position.y };
      }
    },
    [setSelectedNodeIds, setSelectedEdgeIds],
  );

  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('group-') && lastDraggedNodePosition.current) {
        const delta = {
          x: node.position.x - lastDraggedNodePosition.current.x,
          y: node.position.y - lastDraggedNodePosition.current.y,
        };

        if (delta.x !== 0 || delta.y !== 0) {
          const location = node.id.replace('group-', '');
          const nodesToMove = nodes.filter((n) => n.data.location === location);
          if (nodesToMove.length > 0) {
            moveNodes(nodesToMove.map((n) => n.id), delta);
            lastDraggedNodePosition.current = { x: node.position.x, y: node.position.y };
          }
        }
      }
    },
    [nodes, moveNodes],
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('group-')) {
        lastDraggedNodePosition.current = null;
      }
    },
    [],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdgeIds([edge.id]);
      setSelectedNodeIds([]);
    },
    [setSelectedEdgeIds, setSelectedNodeIds],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
  }, [setSelectedNodeIds, setSelectedEdgeIds]);

  const onSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      const newNodeIds = params.nodes.map((n) => n.id);
      const newEdgeIds = params.edges.map((e) => e.id);

      if (JSON.stringify(newNodeIds) !== JSON.stringify(selectedNodeIds)) {
        setSelectedNodeIds(newNodeIds);
      }
      if (JSON.stringify(newEdgeIds) !== JSON.stringify(selectedEdgeIds)) {
        setSelectedEdgeIds(newEdgeIds);
      }
    },
    [selectedNodeIds, selectedEdgeIds, setSelectedNodeIds, setSelectedEdgeIds],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Filter out changes for group nodes to prevent React Flow error
      const filteredChanges = changes.filter((change) => {
        if ('id' in change) {
          return !change.id.startsWith('group-');
        }
        return true;
      }) as NodeChange<Node<CustomNodeData>>[];

      const newNodes = applyNodeChanges(filteredChanges, nodes);
      const hasRelativePos = newNodes.some(
        (node) => node.position !== undefined,
      );

      if (!locationGroupsEnabled || !hasRelativePos) {
        onNodesChangeOrig(filteredChanges);
        return;
      }

      const updatedNodes = newNodes.map((node) => {
        if (node.position !== undefined) {
          return {
            ...node,
            position: {
              ...node.position,
              absolute: {
                x:
                  node.position.x -
                  (node.parentId
                    ? nodes.find((n) => n.id === node.parentId)?.position?.x ||
                      0
                    : 0),
                y:
                  node.position.y -
                  (node.parentId
                    ? nodes.find((n) => n.id === node.parentId)?.position?.y ||
                      0
                    : 0),
              },
            },
          };
        }
        return node;
      });
      onNodesChangeOrig(filteredChanges);
      return updatedNodes;
    },
    [nodes, onNodesChangeOrig, locationGroupsEnabled],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (isTyping) {
        return;
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedNodeIds.length > 0
      ) {
        deleteNodes(selectedNodeIds);
      }

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedEdgeIds.length > 0
      ) {
        deleteEdge(selectedEdgeIds);
      }

      if (event.key.toLowerCase() === "c" && selectedNodeIds.length > 0) {
        copyNodes(selectedNodeIds);
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "z" || event.key === "Z")
      ) {
        undo();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "y" ||
          event.key === "Y" ||
          (event.shiftKey && event.key === "Z"))
      ) {
        redo();
      }

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        setPendingPosition({ x: 100, y: 100 });
        setIsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedNodeIds,
    selectedEdgeIds,
    deleteNodes,
    deleteEdge,
    copyNodes,
    setPendingPosition,
    setIsModalOpen,
    undo,
    redo,
  ]);

  const handleCreateNode = (
    name: string,
    inputsCount: number,
    outputsCount: number,
    type: string,
    location: string,
  ) => {
    if (pendingPosition) {
      addNode(
        "custom",
        pendingPosition,
        name,
        inputsCount,
        outputsCount,
        type,
        location,
      );
    }
    setIsModalOpen(false);
    setPendingPosition(null);
  };

  const { displayNodes, displayEdges } = useMemo(() => {
    if (!locationGroupsEnabled) {
      return {
        displayNodes: nodes,
        displayEdges: edges,
      };
    }

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

    const groupNodesList = groupEntries.map(([location, groupNodes]) => ({
      id: `group-${location}`,
      type: "group",
      position: {
        x: Math.min(...groupNodes.map((n) => n.position.x - 10 || 0)),
        y: Math.min(...groupNodes.map((n) => n.position.y - 20 || 0)),
      },
      data: { label: location },
      selected: false,
      width:
        Math.max(
          ...groupNodes.map((n) => (n.position.x || 0) + (n.width || 200)),
        ) -
        Math.min(...groupNodes.map((n) => n.position.x || 0)) +
        70,
      height:
        Math.max(
          ...groupNodes.map((n) => (n.position.y || 0) + (n.height || 100)),
        ) - Math.min(...groupNodes.map((n) => n.position.y || 0)),
    }));

    const groupedNodeIds = new Set(groupNodesList.map((g) => g.id));

    const displayNodes = [
      ...groupNodesList,
      ...nodes.filter((node) => !groupedNodeIds.has(node.id)),
    ];

    const displayEdges = edges;

    return {
      displayNodes,
      displayEdges,
    };
  }, [nodes, edges, locationGroupsEnabled]);

  return (
    <div className={cn("w-full h-full relative bg-background")}>
      <div ref={containerRef} className="w-full h-full">
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onNodeClick={onNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          colorMode={theme}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          edgeTypes={{ default: LabeledEdge }}
        >
          <Controls />
        </ReactFlow>
      </div>
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <ExportButton targetRef={containerRef} />
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
      <NodeCreationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingPosition(null);
        }}
        onCreate={handleCreateNode}
      />
    </div>
  );
};
