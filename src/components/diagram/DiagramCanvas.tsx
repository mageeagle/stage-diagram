'use client';

import React, { useCallback, useEffect } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/store/useStore';
import { CustomNode } from '@/components/nodes/CustomNode';
import { NodeCreationModal } from '@/components/diagram/NodeCreationModal';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/lib/utils';

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
     deleteNode,
     addNode,
     copyNode,
     isModalOpen,
     pendingPosition,
     setIsModalOpen,
     setPendingPosition
   } = useStore();

  const { theme } = useThemeStore();

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (isTyping) {
        return;
      }

     if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
       deleteNode(selectedNodeId);
     }

     if (event.key.toLowerCase() === 'c' && selectedNodeId) {
       copyNode(selectedNodeId);
     }

     if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        // Use a default position or center of viewport if possible. 
        // For now, we'll just add at a reasonable offset from current center or just 0,0
        setPendingPosition({ x: 100, y: 100 });
        setIsModalOpen(true);
     }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => { 
      window.removeEventListener('keydown', handleKeyDown);
    };
   }, [selectedNodeId, deleteNode, copyNode, setPendingPosition, setIsModalOpen]);

  const handleCreateNode = (name: string, inputsCount: number, outputsCount: number, type: string, location: string) => {
    if (pendingPosition) {
      addNode('custom', pendingPosition, name, inputsCount, outputsCount, type, location);
    }
    setIsModalOpen(false);
    setPendingPosition(null);
  };

  return (
    <div className={cn("w-full h-full relative bg-background")}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          colorMode={theme}
          fitView
        >
          <Controls />
        </ReactFlow>
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

