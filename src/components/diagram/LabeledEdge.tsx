import {
  BaseEdge,
  EdgeLabelRenderer,
  SmoothStepEdge,
  StepEdge,
  StraightEdge,
  BezierEdge,
  BezierEdgeProps,
  StraightEdgeProps,
  SmoothStepEdgeProps,
  StepEdgeProps,
  type EdgeProps,
} from "@xyflow/react";
import { useRoutedEdgePath } from "reactflow-edge-routing";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

interface EdgeLabelProps {
  cableType?: string;
  className?: string;
  style?: React.CSSProperties;
  sourceX?: number;
  sourceY?: number;
  targetX?: number;
  targetY?: number;
  x?: number;
  y?: number;
}

function EdgeLabel({
  cableType,
  className,
  style,
  sourceX = 0,
  sourceY = 0,
  targetX = 0,
  targetY = 0,
  x,
  y,
}: EdgeLabelProps) {
  if (!cableType || cableType === "none") {
    return null;
  }

  const labelX = x ?? (sourceX + targetX) / 2;
  const labelY = y ?? (sourceY + targetY) / 2;

  return (
    <EdgeLabelRenderer>
      <div
        style={
          {
            ...style,
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
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

const routedLabeledEdge = (
  props: EdgeProps & {
    data: { cableType: string; exportingHidden: boolean; hidden: boolean };
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const edgeRounding = useStore((state) => state.edgeRounding);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [path, labelX, labelY, wasRouted] = useRoutedEdgePath({
    id: props.id,
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: "right",
    targetPosition: "left",
    connectorType: "orthogonal",
    borderRadius: edgeRounding,
    source: props.source,
    target: props.target,
  });

  if (!props.data || props.data.exportingHidden) {
    return null;
  }

  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        style={{ strokeDasharray: wasRouted ? undefined : "4 2" }}
      />
      <EdgeLabel
        className={cn("", { "opacity-50": props.data.hidden })}
        cableType={props.data.cableType}
        x={labelX}
        y={labelY}
      />
    </>
  );
};

const tempEdge = (props: BezierEdgeProps) => <BezierEdge {...props} />;

export {
  labeledSmoothstepEdge,
  labeledStepEdge,
  labeledStraightEdge,
  labeledBezierEdge,
  routedLabeledEdge,
  tempEdge,
};
export type { EdgeLabelProps };
