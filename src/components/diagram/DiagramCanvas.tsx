"use client";

import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  Controls,
  Node,
  Edge,
  NodeChange,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStore } from "@/store/useStore";
import { CustomNodeData } from "@/types/diagram";
import { CustomNode } from "@/components/nodes/CustomNode";
import { GroupNode } from "@/components/nodes/GroupNode";
import { NodeCreationModal } from "@/components/diagram/NodeCreationModal";
import {
  labeledSmoothstepEdge,
  labeledStepEdge,
  labeledStraightEdge,
  labeledBezierEdge,
} from "@/components/diagram/LabeledEdge";
import { ExportButton } from "@/components/diagram/ExportButton";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

const nodeTypes = {
  custom: CustomNode,
  group: GroupNode,
};

const groupNodesStore = new Map<string, Node>();

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
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onReactFlowApi = useCallback((instance: ReactFlowInstance) => {
    flowInstanceRef.current = instance;
  }, []);
  const groupNodesMap = useMemo(() => groupNodesStore, []);
  const [groupNodesTick, setGroupNodesTick] = useState(0);

  useEffect(() => {
    if (!locationGroupsEnabled) {
      groupNodesMap.clear();
    }
  }, [locationGroupsEnabled, groupNodesMap]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id.startsWith("group-")) {
        const location = node.data.label;
        const memberNodes = nodes.filter(
          (n) => n.data.location === location && !n.id.startsWith("group-"),
        );
        const memberIds = memberNodes.map((n) => n.id);

        setSelectedNodeIds(memberIds);

        const connectedEdgeIds = edges
          .filter(
            (e) =>
              memberIds.includes(e.source) || memberIds.includes(e.target),
          )
          .map((e) => e.id);
        setSelectedEdgeIds(connectedEdgeIds);
      } else {
        setSelectedNodeIds([node.id]);
        setSelectedEdgeIds([]);
      }
    },
    [nodes, edges, setSelectedNodeIds, setSelectedEdgeIds],
  );


  const onNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNodeIds([node.id]);
      setSelectedEdgeIds([]);
    },
    [setSelectedNodeIds, setSelectedEdgeIds],
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
      // If any of the newly selected nodes is a group node, we ignore the selection change
      // because onNodeClick will handle the group selection logic.
      if (params.nodes.some((n) => n.id.startsWith("group-"))) {
        return;
      }

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
    },
    [onNodesChangeOrig, groupNodesMap, nodes, moveNodes],
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
        const instance = flowInstanceRef.current;
        const container = containerRef.current;

        if (instance && container) {
          // Calculate center coordinates in flow units
          const viewPort = instance.getViewport();
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;

          // Calculate flow coordinates for the center
          const x = (containerWidth / 2 - viewPort.x) / viewPort.zoom;
          const y = (containerHeight / 2 - viewPort.y) / viewPort.zoom;

          setPendingPosition({ x, y });
          setIsModalOpen(true);
        } else {
          // Fallback to hardcoded position if instance or container is unavailable
          setPendingPosition({ x: 100, y: 100 });
          setIsModalOpen(true);
        }
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
    const groupNodesList = groupEntries.map(([location, groupNodes]) => {
      const groupId = `group-${location}`;
      console.log(groupNodes[0].position.y)
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
            ...groupNodes.map((n) => (n.position.x || 0) + (n.measured?.width || n.width || 200)),
          ) -
          Math.min(...groupNodes.map((n) => n.position.x || 0)) +
          40,
        height:
          Math.max(
            ...groupNodes.map((n) => (n.position.y || 0) + (n.measured?.height || n.height || 100)),
          ) - Math.min(...groupNodes.map((n) => n.position.y || 0)) + 70,
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

    return {
      displayNodes,
      displayEdges: edges,
    };
  }, [nodes, edges, locationGroupsEnabled, groupNodesMap, groupNodesTick]);

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
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          colorMode={theme}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          edgeTypes={{
            default: labeledBezierEdge,
            labeledSmoothstep: labeledSmoothstepEdge,
            labeledStep: labeledStepEdge,
            labeledStraight: labeledStraightEdge,
            labeledBezier: labeledBezierEdge,
          }}
          onInit={onReactFlowApi}
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
