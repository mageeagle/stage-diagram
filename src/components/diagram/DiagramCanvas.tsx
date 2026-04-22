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
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    selectedNodeId,
    setSelectedEdge,
    selectedEdgeId,
    deleteNode,
    deleteEdge,
    addNode,
    copyNode,
    isModalOpen,
    pendingPosition,
    setIsModalOpen,
    setPendingPosition,
  } = useStore();

  const { theme } = useThemeStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      setSelectedEdge(null);
    },
    [setSelectedNode, setSelectedEdge],
  );

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      setSelectedEdge(null);
    },
    [setSelectedNode, setSelectedEdge],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge.id);
      setSelectedNode(null);
    },
    [setSelectedEdge, setSelectedNode],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

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
         selectedNodeId
       ) {
         deleteNode(selectedNodeId);
       }

       if ((event.key === "Delete" || event.key === "Backspace") && selectedEdgeId) {
         deleteEdge(selectedEdgeId);
       }

       if (event.key.toLowerCase() === "c" && selectedNodeId) {
         copyNode(selectedNodeId);
       }

       if (event.key === " " || event.key === "Enter") {
         event.preventDefault();
         // Use a default position or center of viewport if possible.
         // For now, we'll just add at a reasonable offset from current center or just 0,0
         setPendingPosition({ x: 100, y: 100 });
         setIsModalOpen(true);
       }
     };

     window.addEventListener("keydown", handleKeyDown);
     return () => {
       window.removeEventListener("keydown", handleKeyDown);
     };
   }, [
     selectedNodeId,
     selectedEdgeId,
     deleteNode,
     deleteEdge,
     copyNode,
     setPendingPosition,
     setIsModalOpen,
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
