import { EdgeLabelRenderer, SmoothStepEdge, EdgeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export function LabeledEdge(props: EdgeProps) {
  const { data, sourceX, sourceY, targetX, targetY } = props;
  const cableType = data?.cableType as string;

  return (
    <>
      <SmoothStepEdge {...props} />
      {cableType && cableType !== 'none' && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
              pointerEvents: 'none',
            }}
            className={cn(
              "bg-white px-1 rounded text-[10px] border shadow-sm select-none whitespace-nowrap"
            )}
          >
            {cableType}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

