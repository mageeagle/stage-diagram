import React, { useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals, Node, NodeResizer } from '@xyflow/react';
import { CustomNodeData } from '@/types/diagram';
import { useStagePlanStore } from '@/store/useStagePlanStore';
import { cn } from '@/lib/utils';
import { RotateCw } from 'lucide-react';

export type StagePlanNodeData = CustomNodeData & {
  shape?: 'rectangle' | 'circle' | 'triangle';
  rotation?: number;
  width?: number;
  height?: number;
};

export const StagePlanNode = ({ data, id, selected, width: nodeWidth, height: nodeHeight }: NodeProps<Node<StagePlanNodeData>>) => {
  const update = useUpdateNodeInternals();
  const { updateNodeRotation, updateNodeShape } = useStagePlanStore();
  
  const nodeRef = useRef<HTMLDivElement>(null);

  const shape = data.shape || 'rectangle';
  const rotation = data.rotation || 0;
  const width = nodeWidth || data.width || 200;
  const height = nodeHeight || data.height || 150;

  useEffect(() => {
    update(id);
  }, [data, id, update]);

  // --- Rotation Logic ---
  const rotationRef = useRef<{
    isDragging: boolean;
    startAngle: number;
    startRotation: number;
  }>({
    isDragging: false,
    startAngle: 0,
    startRotation: 0,
  });

  const onRotationMouseDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!nodeRef.current) return;

    const rect = nodeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    rotationRef.current = {
      isDragging: true,
      startAngle,
      startRotation: rotation,
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!rotationRef.current.isDragging) return;

      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      const deltaAngle = (currentAngle - rotationRef.current.startAngle) * (180 / Math.PI);
      const newRotation = rotationRef.current.startRotation + deltaAngle;

      updateNodeRotation([id], newRotation);
    };

    const onPointerUp = () => {
      rotationRef.current.isDragging = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [id, rotation, updateNodeRotation]);

  return (
    <div 
      ref={nodeRef}
      style={{ 
        width, 
        height, 
        transform: `rotate(${rotation}deg)`,
        position: 'relative'
      }}
      className="group"
    >
      {selected && <NodeResizer minWidth={50} minHeight={50} />}

      {/* The actual shape */}
      <div className="w-full h-full relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {shape === 'rectangle' && (
            <rect x="1" y="1" width="98" height="98" fill="white" stroke="#a8a29e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          )}
          {shape === 'circle' && (
            <circle cx="50" cy="50" r="48" fill="white" stroke="#a8a29e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          )}
          {shape === 'triangle' && (
            <polygon points="50,1 1,99 99,99" fill="white" stroke="#a8a29e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-center text-lg font-bold pointer-events-none truncate px-2 text-stone-800">
          {data.label}
        </div>
      </div>

      {/* Interaction Handles (only when selected) */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Rotation Handle */}
          <div 
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full pointer-events-auto cursor-grab flex items-center justify-center"
            onPointerDown={onRotationMouseDown}
          >
            <RotateCw className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};
