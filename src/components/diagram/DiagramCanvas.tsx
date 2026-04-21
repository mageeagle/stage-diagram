'use client';

import React, { useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '@/store/useStore';
import { CustomNode } from '@/components/nodes/CustomNode';
import { NodeCreationModal } from '@/components/diagram/NodeCreationModal';

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
    isModalOpen,
    pendingPosition,
    setIsModalOpen,
    setPendingPosition
  } = useStore();

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
  }, [selectedNodeId, deleteNode, setPendingPosition, setIsModalOpen]);

  const handleCreateNode = (name: string, inputsCount: number, outputsCount: number) => {
    if (pendingPosition) {
      addNode('custom', pendingPosition, name, inputsCount, outputsCount);
    }
    setIsModalOpen(false);
    setPendingPosition(null);
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#aaa" gap={20} />
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
