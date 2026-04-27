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
import { cn } from "@/lib/utils";

import { CustomNode } from "@/components/nodes/CustomNode";
import { StagePlanNode } from "@/components/nodes/StagePlanNode";
import { ExportButton } from "@/components/diagram/ExportButton";
import { CustomNodeData } from "@/types/diagram";
import { useStore } from "@/store/useStore";

const nodeTypes = {
  custom: StagePlanNode,
};

// const groupNodesStore = new Map<string, Node>();

export const StagePlanCanvas = () => {
  const originalNodes = useStore((s) => s.nodes);
  const nodes = useStagePlanStore((state) => state.nodes);
  useEffect(() => {
    useStagePlanStore.getState().matchNode(originalNodes);
  }, [originalNodes]);
  const moveNodes = useStagePlanStore((state) => state.moveNodes);
  const onNodesChangeOrig = useStagePlanStore((state) => state.onNodesChange);
  const selectedNodeIds = useStagePlanStore((state) => state.selectedNodeIds);
  const setSelectedNodeIds = useStagePlanStore(
    (state) => state.setSelectedNodeIds,
  );
  // const groupNodesMap = useMemo(() => groupNodesStore, []);
  // const [groupNodesTick, setGroupNodesTick] = useState(0);
  // const setSelectedEdgeIds = useStagePlanStore(
  //   (state) => state.setSelectedEdgeIds,
  // );
  // const addNode = useStagePlanStore((state) => state.addNode);
  // const pendingPosition = useStagePlanStore((state) => state.pendingPosition);
  // const setIsModalOpen = useStagePlanStore((state) => state.setIsModalOpen);
  // const setPendingPosition = useStagePlanStore(
  //   (state) => state.setPendingPosition,
  // );
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

  // const handleCreateNode = useCallback(
  //   (name: string, location: string) => {
  //     if (pendingPosition) {
  //       addNode("custom", pendingPosition, name, location);
  //     }
  //     setIsModalOpen(false);
  //     setPendingPosition(null);
  //   },
  //   [pendingPosition, setIsModalOpen, setPendingPosition, addNode],
  // );

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

      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedNodeIds.length > 0
      ) {
        // deleteNodes(selectedNodeIds);
      }
    },
    // [selectedNodeIds, deleteNodes, setPendingPosition, setIsModalOpen],
    [selectedNodeIds, undo, redo],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // const groupChanges = changes.filter(
      //   (
      //     c,
      //   ): c is NodeChange<Node<CustomNodeData>> & {
      //     type: "position";
      //     position: { x: number; y: number };
      //   } => "id" in c && c.id.startsWith("group-") && c.type === "position",
      // );
      // const otherChanges = changes.filter(
      //   (c) => !("id" in c) || !c.id.startsWith("group-"),
      // ) as NodeChange<Node<CustomNodeData>>[];

      // if (groupChanges.length > 0) {
      //   groupChanges.forEach((change) => {
      //     const { id, position } = change;
      //     const existingNode = groupNodesMap.get(id);
      //     if (existingNode) {
      //       const delta = {
      //         x: position.x - existingNode.position.x,
      //         y: position.y - existingNode.position.y,
      //       };

      //       if (delta.x !== 0 || delta.y !== 0) {
      //         const location = id.replace("group-", "");
      //         const nodesToMove = nodes.filter(
      //           (n) => n.data.location === location,
      //         );
      //         if (nodesToMove.length > 0) {
      //           moveNodes(
      //             nodesToMove.map((n) => n.id),
      //             delta,
      //           );
      //         }
      //       }
      //       groupNodesMap.set(id, { ...existingNode, position });
      //     }
      //   });
      //   setGroupNodesTick((t) => t + 1);
      // }

      // if (otherChanges.length > 0) {
      //   onNodesChangeOrig(otherChanges);
      // }
      onNodesChangeOrig(changes as NodeChange<Node<CustomNodeData>>[]);
    },
    // [onNodesChangeOrig, groupNodesMap, nodes, moveNodes],
    [onNodesChangeOrig],
  );

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full">
        <ReactFlow
          nodes={nodes}
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
          <Controls />
        </ReactFlow>
      </div>
      <div className="absolute top-4 left-4 z-10">
        <ExportButton targetRef={containerRef} isStagePlanMode={true} />
      </div>
    </div>
  );
};
