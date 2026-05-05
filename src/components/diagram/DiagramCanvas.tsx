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
import "@/styles/temp-edge.css";
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
  tempEdge,
} from "@/components/diagram/LabeledEdge";
import { ExportButton } from "@/components/diagram/ExportButton";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import { format } from "date-fns/format";
import { useProximityConnect, ProximityPair } from "@/hooks/useProximityConnect";


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
  const canvasTitle = useStore((state) => state.canvasTitle);
  const canvasSubtitle = useStore((state) => state.canvasSubtitle);
  const canvasPreparedBy = useStore((state) => state.canvasPreparedBy);
  const setIsModalOpen = useStore((state) => state.setIsModalOpen);
  const setPendingPosition = useStore((state) => state.setPendingPosition);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const hideTitle = useStore((state) => state.hideTitle);
  const hideDate = useStore((state) => state.hideDate);
  const locationGroupsEnabled = useStore(
    (state) => state.locationGroupsEnabled,
  );
  const toggleLocationGroups = useStore((state) => state.toggleLocationGroups);
  const theme = useThemeStore((state) => state.theme);
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tempEdges = useStore((state) => state.tempEdges);
  const setTempEdges = useStore((state) => state.setTempEdges);
  const autoConnectEdges = useStore((state) => state.autoConnectEdges);
  const proximityPairsRef = useRef<ProximityPair[]>([]);
  const isDraggingRef = useRef(false);
  const liveNodesRef = useRef<Node<CustomNodeData>[] | undefined>(undefined);

  useEffect(() => {
    if (!liveNodesRef.current) {
      liveNodesRef.current = nodes;
    }
  }, [nodes]);
  const [, setDragTick] = useState(0);

  const [liveNodes, setLiveNodes] = useState<Node<CustomNodeData>[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _proximityHook = useProximityConnect(
    nodes,
    edges,
    (pairs) => {
      proximityPairsRef.current = pairs;
      if (pairs.length > 0) {
        const newTempEdges: Edge[] = pairs.map((pair) => ({
          id: `temp-${pair.sourceNodeId}-${pair.source}-${pair.targetNodeId}-${pair.target}`,
          source: pair.sourceNodeId,
          sourceHandle: pair.source,
          target: pair.targetNodeId,
          targetHandle: pair.target,
          type: 'tempEdge',
          className: 'temp-edge',
          animated: false,
          style: { stroke: '#a855f7', strokeWidth: 2, strokeDasharray: '8 4' },
          markerEnd: { type: 'arrow', color: '#a855f7' },
          data: { cableType: 'none', hidden: false },
        }));
        setTempEdges(newTempEdges);
      } else {
        setTempEdges([]);
      }
    },
    liveNodes,
  );

  const onNodeDrag = useCallback(() => {
    if (flowInstanceRef.current) {
      const nodes = flowInstanceRef.current.getNodes() as Node<CustomNodeData>[];
      setLiveNodes(nodes);
      setDragTick((t) => t + 1);
    }
  }, []);

  const onReactFlowApi = useCallback((instance: ReactFlowInstance) => {
    flowInstanceRef.current = instance;
  }, []);

  const groupNodesMap = useRef<Map<string, Node>>(new Map());
  const [groupNodesTick, setGroupNodesTick] = useState(0);

  useEffect(() => {
    if (!locationGroupsEnabled) {
      groupNodesMap.current.clear();
    }
  }, [locationGroupsEnabled]);

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
            (e) => memberIds.includes(e.source) || memberIds.includes(e.target),
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
      isDraggingRef.current = true;
      proximityPairsRef.current = [];
    },
    [setSelectedNodeIds, setSelectedEdgeIds],
  );

  const onMoveEnd = useCallback(() => {
    isDraggingRef.current = false;
    const pairs = proximityPairsRef.current;
    if (pairs.length > 0) {
      autoConnectEdges(pairs);
      proximityPairsRef.current = [];
      setTempEdges([])
    }
  }, [autoConnectEdges, setTempEdges]);

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
          const existingNode = groupNodesMap.current.get(id);
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
            groupNodesMap.current.set(id, { ...existingNode, position });
          }
        });
        setGroupNodesTick((t) => t + 1);
      }

      if (otherChanges.length > 0) {
        onNodesChangeOrig(otherChanges);
      }
    },
    [onNodesChangeOrig, nodes, moveNodes],
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

  useEffect(() => {
    if (!isModalOpen || !setPendingPosition) return
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
    } else {
      // Fallback to hardcoded position if instance or container is unavailable
      setPendingPosition({ x: 100, y: 100 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

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
    const hiddenEdgeIds = new Set(
      edges.filter((e) => e.data?.exportingHidden).map((e) => e.id),
    );
    if (!locationGroupsEnabled) {
      return {
        displayNodes: nodes,
        displayEdges: edges.map((edge) => ({
          ...edge,
          style: hiddenEdgeIds.has(edge.id) ? { display: "none" } : edge.style,
        })),
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
    // eslint-disable-next-line react-hooks/refs
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

      // eslint-disable-next-line react-hooks/refs
      const existingNode = groupNodesMap.current.get(groupId);
      if (existingNode) {
        const updatedNode = { ...existingNode, ...props };
        groupNodesMap.current.set(groupId, updatedNode);
        return updatedNode;
      }

      const newNode = props as Node;

      groupNodesMap.current.set(groupId, newNode);
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
      displayEdges: edges.map((edge) => ({
        ...edge,
        style: hiddenEdgeIds.has(edge.id) ? { display: "none" } : edge.style,
      })),
    };
  }, [nodes, edges, locationGroupsEnabled, groupNodesTick]);

  return (
    <div className={cn("w-full h-full relative bg-background")}>
      <div ref={containerRef} className="w-full h-full">
        <ReactFlow
          nodes={displayNodes}
          edges={[...displayEdges, ...tempEdges]}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onNodeClick={onNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onMoveEnd}
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
             tempEdge,
           }}
          onInit={onReactFlowApi}
        >
          <Controls position="bottom-right" />
        </ReactFlow>
        {!hideTitle && (
          <div className="absolute bottom-6 left-6 z-10">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {canvasTitle}
            </div>
            <div className="text-lg text-zinc-600 dark:text-zinc-400">
              {canvasSubtitle}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-500">
              {canvasPreparedBy}
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
