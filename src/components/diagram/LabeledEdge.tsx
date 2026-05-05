import {
  EdgeLabelRenderer,
  SmoothStepEdge,
  StepEdge,
  StraightEdge,
  BezierEdge,
  BezierEdgeProps,
  StraightEdgeProps,
  SmoothStepEdgeProps,
  StepEdgeProps,
} from "@xyflow/react";
import { cn } from "@/lib/utils";

interface EdgeLabelProps {
  cableType?: string;
  className?: string;
  style?: React.CSSProperties;
  sourceX?: number;
  sourceY?: number;
  targetX?: number;
  targetY?: number;
}

function EdgeLabel({
  cableType,
  className,
  style,
  sourceX = 0,
  sourceY = 0,
  targetX = 0,
  targetY = 0,
}: EdgeLabelProps) {
  if (!cableType || cableType === "none") {
    return null;
  }

  return (
    <EdgeLabelRenderer>
      <div
        style={
          {
            ...style,
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
            pointerEvents: "none",
          } as React.CSSProperties
        }
        className={cn(
          "dark:bg-stone-800 dark:text-stone-100 dark:border-stone-600 bg-white text-stone-900 border-stone-400 px-1 rounded text-[10px] border shadow-sm select-none whitespace-nowrap",
          className,
        )}
      >
        {cableType}
      </div>
    </EdgeLabelRenderer>
  );
}

const labeledSmoothstepEdge = (
  props: SmoothStepEdgeProps & {
    data: { cableType: string; exportingHidden: boolean; hidden: boolean };
  },
) =>
  !props.data || props.data.exportingHidden ? null : (
    <>
      <SmoothStepEdge {...props} />
      <EdgeLabel
        className={cn("", { "opacity-50": props.data.hidden })}
        cableType={props.data?.cableType}
        sourceX={props.sourceX}
        sourceY={props.sourceY}
        targetX={props.targetX}
        targetY={props.targetY}
      />
    </>
  );

const labeledStepEdge = (
  props: StepEdgeProps & {
    data: { cableType: string; exportingHidden: boolean; hidden: boolean };
  },
) =>
  !props.data || props.data.exportingHidden ? null : (
    <>
      <StepEdge {...props} />
      <EdgeLabel
        className={cn("", { "opacity-50": props.data.hidden })}
        cableType={props.data?.cableType}
        sourceX={props.sourceX}
        sourceY={props.sourceY}
        targetX={props.targetX}
        targetY={props.targetY}
      />
    </>
  );

const labeledStraightEdge = (
  props: StraightEdgeProps & {
    data: { cableType: string; exportingHidden: boolean; hidden: boolean };
  },
) =>
  !props.data || props.data.exportingHidden ? null : (
    <>
      <StraightEdge {...props} />
      <EdgeLabel
        className={cn("", { "opacity-50": props.data.hidden })}
        cableType={props.data?.cableType}
        sourceX={props.sourceX}
        sourceY={props.sourceY}
        targetX={props.targetX}
        targetY={props.targetY}
      />
    </>
  );

const labeledBezierEdge = (
  props: BezierEdgeProps & {
    data: { cableType: string; exportingHidden: boolean; hidden: boolean };
  },
) =>
  !props.data || props.data.exportingHidden ? null : (
    <>
      <BezierEdge {...props} />
      <EdgeLabel
        className={cn("", { "opacity-50": props.data.hidden })}
        cableType={props.data?.cableType}
        sourceX={props.sourceX}
        sourceY={props.sourceY}
        targetX={props.targetX}
        targetY={props.targetY}
      />
    </>
  );

const tempEdge = (props: BezierEdgeProps) => <BezierEdge {...props} />;

export {
  labeledSmoothstepEdge,
  labeledStepEdge,
  labeledStraightEdge,
  labeledBezierEdge,
  tempEdge,
};
export type { EdgeLabelProps };
