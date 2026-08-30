import React, { useCallback, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import {
  NodeProps,
  useUpdateNodeInternals,
  Node,
  NodeResizer,
} from "@xyflow/react";
import { CustomNodeData } from "@/types/diagram";
import { useStagePlanStore } from "@/store/useStagePlanStore";
import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { DetailsText } from "./DetailsText";

export type StagePlanNodeData = CustomNodeData & {
  shape?: "rectangle" | "circle" | "triangle";
  rotation?: number;
  width?: number;
  height?: number;
};

export const StagePlanNode = ({
  data,
  id,
  selected,
  width: nodeWidth,
  height: nodeHeight,
}: NodeProps<Node<StagePlanNodeData>>) => {
  const update = useUpdateNodeInternals();
  const { updateNodeRotation } = useStagePlanStore();
  const hideDetails = useStagePlanStore((s) => s.hideDetailsStagePlan);
  const defaultLabelFontSize = useStagePlanStore((s) => s.defaultLabelFontSize);
  const defaultDetailsFontSize = useStagePlanStore((s) => s.defaultDetailsFontSize);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const nodeRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const shape = data.shape || "rectangle";
  const rotation = data.rotation || 0;
  const width = nodeWidth || data.width || 200;
  const height = nodeHeight || data.height || 150;

  const labelSize = data.labelFontSize ?? defaultLabelFontSize;
  const detailsSize = data.detailsFontSize ?? defaultDetailsFontSize;

  const boxStyle = useMemo(() => {
    if (shape === "circle") {
      const s = Math.min(width, height) * 0.7;
      return {
        position: "absolute" as const,
        width: s,
        height: s,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
    }
    if (shape === "triangle") {
      // Apex is at the top: only the lower-middle area is usable.
      return {
        position: "absolute" as const,
        width: width * 0.5,
        height: height * 0.35,
        left: "50%",
        top: "70%",
        transform: "translate(-50%, -50%)",
      };
    }
    return {
      position: "absolute" as const,
      left: "8%",
      top: "8%",
      width: "84%",
      height: "84%",
    };
  }, [shape, width, height]);

  useEffect(() => {
    update(id);
  }, [data, id, update]);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const title = titleRef.current;
    const details = detailsRef.current;
    if (!box || !title) return;
    const ratio = labelSize > 0 ? detailsSize / labelSize : 0.62;
    let size = labelSize;
    while (size > 10) {
      title.style.fontSize = `${size}px`;
      if (details) {
        details.style.fontSize = `${Math.max(9, Math.round(size * ratio))}px`;
      }
      if (box.scrollHeight <= box.clientHeight + 1) break;
      size -= 1;
    }
  }, [data.label, data.details, hideDetails, width, height, shape, labelSize, detailsSize]);

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

  const onRotationMouseDown = useCallback(
    (e: React.PointerEvent) => {
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

        const currentAngle = Math.atan2(
          moveEvent.clientY - centerY,
          moveEvent.clientX - centerX,
        );
        const deltaAngle =
          (currentAngle - rotationRef.current.startAngle) * (180 / Math.PI);
        const newRotation =
          (((rotationRef.current.startRotation + deltaAngle + 180) % 360 + 360) % 360) - 180;

        updateNodeRotation([id], newRotation);
      };

      const onPointerUp = () => {
        rotationRef.current.isDragging = false;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [id, rotation, updateNodeRotation],
  );
  // Return null to hide the node from the canvas during export
  if (data.exportingHidden) {
    return null;
  }
  return (
    <div
      ref={nodeRef}
      style={{
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        position: "relative",
      }}
      className="group"
    >
      {selected && <NodeResizer minWidth={50} minHeight={50} />}

      {/* The actual shape */}
      <div
        className={cn(
          "w-full h-full relative",
          data.hidden ? "opacity-30" : "",
        )}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {shape === "rectangle" && (
            <rect
              x="1"
              y="1"
              width="98"
              height="98"
              fill={isDark ? "grey" : "white"}
              stroke="#a8a29e"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {shape === "circle" && (
            <circle
              cx="50"
              cy="50"
              r="48"
              fill={isDark ? "grey" : "white"}
              stroke="#a8a29e"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {shape === "triangle" && (
            <polygon
              points="50,1 1,99 99,99"
              fill={isDark ? "grey" : "white"}
              stroke="#a8a29e"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        <div
          ref={boxRef}
          style={boxStyle}
          className="overflow-hidden flex items-center justify-center text-center pointer-events-none"
        >
          <div className="w-full">
            <div
              ref={titleRef}
              className="font-bold break-words leading-tight text-stone-800"
              style={{ fontSize: labelSize }}
            >
              {data.label}
            </div>
            {!hideDetails && data.details ? (
              <div
                ref={detailsRef}
                className="break-words leading-tight mt-1 px-2 text-left text-stone-600"
                style={{ fontSize: detailsSize }}
              >
                <DetailsText value={data.details} />
              </div>
            ) : null}
          </div>
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
