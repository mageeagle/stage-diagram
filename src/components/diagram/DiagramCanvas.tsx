"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { ReactFlow, Controls, Node, SmoothStepEdge, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStore } from "@/store/useStore";
import { CustomNode } from "@/components/nodes/CustomNode";
import { NodeCreationModal } from "@/components/diagram/NodeCreationModal";
import { ExportButton } from "@/components/diagram/ExportButton";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

const nodeTypes = {
  custom: CustomNode,
};

export const DiagramCanvas = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);
  const setSelectedNodeIds = useStore((state) => state.setSelectedNodeIds);
  const selectedNodeIds = useStore((state) => state.selectedNodeIds);
  const setSelectedEdge = useStore((state) => state.setSelectedEdge);
  const selectedEdgeId = useStore((state) => state.selectedEdgeId);
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

  const { theme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeIds([node.id]);
      setSelectedEdge(null);
    },
    [setSelectedNodeIds, setSelectedEdge],
  );

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeIds([node.id]);
      setSelectedEdge(null);
    },
    [setSelectedNodeIds, setSelectedEdge],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge.id);
      setSelectedNodeIds([]);
    },
    [setSelectedEdge, setSelectedNodeIds],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeIds([]);
    setSelectedEdge(null);
  }, [setSelectedNodeIds, setSelectedEdge]);

  const onSelectionChange = useCallback(
    (params: { nodes: Node[] }) => {
      const newIds = params.nodes.map((n) => n.id);
      if (JSON.stringify(newIds) !== JSON.stringify(selectedNodeIds)) {
        setSelectedNodeIds(newIds);
      }
    },
    [selectedNodeIds, setSelectedNodeIds],
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
        (event.key === "Delete" || event.key === "Backspace") && selectedEdgeId
      ) {
        deleteEdge(selectedEdgeId);
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
        (event.key === "y" || event.key === "Y" || (event.shiftKey && event.key === "Z"))
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
    selectedEdgeId,
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

  return (
    <div className={cn("w-full h-full relative bg-background")}>
      <div ref={containerRef} className="w-full h-full">
       <ReactFlow
         nodes={nodes}
         edges={edges}
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
           edgeTypes={{ default: SmoothStepEdge }}
        >
          <Controls />
        </ReactFlow>
      </div>
      <div className="absolute top-4 left-4 z-10">
        <ExportButton targetRef={containerRef} />
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
