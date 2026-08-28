"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";
import {
  PathBuilder,
  useEdgeRoutingStore,
  type AvoidRoute,
  type FlowEdge,
  type FlowNode,
  type HandlePosition,
} from "reactflow-edge-routing";
import {
  AStarPath,
  ConnEnd,
  ConnRef,
  ConnType_Orthogonal,
  ConnectorCrossings,
  OrthogonalRouting,
  Point,
  Rectangle,
  Router,
  ShapeRef,
  generateStaticOrthogonalVisGraph,
  idealNudgingDistance,
  improveHyperedgeRoutesMovingJunctions,
  improveOrthogonalRoutes,
  nudgeOrthogonalSegmentsConnectedToShapes,
  nudgeOrthogonalTouchingColinearSegments,
  nudgeSharedPathsWithCommonEndPoint,
  performUnifyingNudgingPreprocessingStep,
  segmentPenalty,
  shapeBufferDistance,
  vertexVisibility,
} from "obstacle-router";
import type { CustomNodeData } from "@/types/diagram";

const ROUTE_DEBOUNCE_MS = 16;
const SETTLE_DELAY_MS = 64;
const STUB_BASE = 20;
const LANE_SPACING = 4;

type Pt = { x: number; y: number };

type HandleAnchor = Pt & { side: HandlePosition };

type FlowData = {
  flowNodes: FlowNode[];
  anchors: Map<string, Map<string, HandleAnchor>>;
};

function buildFlowData(
  nodes: Node<CustomNodeData>[],
  instance: ReactFlowInstance,
): FlowData {
  const flowNodes: FlowNode[] = [];
  const anchors = new Map<string, Map<string, HandleAnchor>>();
  for (const node of nodes) {
    if (node.type === "group" || node.id.startsWith("group-")) continue;
    const internal = instance.getInternalNode(node.id);
    const measuredW = internal?.measured?.width ?? node.measured?.width;
    const measuredH = internal?.measured?.height ?? node.measured?.height;
    if (!measuredW || !measuredH) continue;
    const handleBounds = internal?.internals.handleBounds;
    const handles = [
      ...(handleBounds?.source ?? []),
      ...(handleBounds?.target ?? []),
    ];
    const byHandle = new Map<string, HandleAnchor>();
    for (const handle of handles) {
      if (!handle.id) continue;
      const cx = handle.x + handle.width / 2;
      const cy = handle.y + handle.height / 2;
      byHandle.set(handle.id, {
        x: node.position.x + cx,
        y: node.position.y + cy,
        side: handle.position,
      });
    }
    anchors.set(node.id, byHandle);
    flowNodes.push({
      id: node.id,
      position: node.position,
      width: node.width,
      height: node.height,
      measured: { width: measuredW, height: measuredH },
    });
  }
  return { flowNodes, anchors };
}

function offsetFromSide(pt: Pt, side: HandlePosition, len: number): Pt {
  switch (side) {
    case "left":
      return { x: pt.x - len, y: pt.y };
    case "right":
      return { x: pt.x + len, y: pt.y };
    case "top":
      return { x: pt.x, y: pt.y - len };
    default:
      return { x: pt.x, y: pt.y + len };
  }
}

function pointAtFraction(points: Pt[], t: number): Pt {
  if (points.length === 1) return points[0];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  const target = total * Math.max(0, Math.min(1, t));
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (walked + segLen >= target) {
      const frac = segLen > 0 ? (target - walked) / segLen : 0;
      return { x: points[i - 1].x + dx * frac, y: points[i - 1].y + dy * frac };
    }
    walked += segLen;
  }
  return points[points.length - 1];
}

function computeStubLengths(
  flowEdges: FlowEdge[],
  anchors: Map<string, Map<string, HandleAnchor>>,
): { src: Map<string, number>; tgt: Map<string, number> } {
  function collect(
    nodeOf: (e: FlowEdge) => string,
    handleOf: (e: FlowEdge) => string | null,
  ): Map<string, number> {
    type Entry = { nodeId: string; handleId: string; pos: number };
    const groups = new Map<string, Entry[]>();
    for (const e of flowEdges) {
      const nodeId = nodeOf(e);
      const handleId = handleOf(e);
      if (!handleId) continue;
      const anchor = anchors.get(nodeId)?.get(handleId);
      if (!anchor) continue;
      const key = `${nodeId}|${anchor.side}`;
      const group = groups.get(key) ?? [];
      if (!group.some((h) => h.handleId === handleId)) {
        group.push({
          nodeId,
          handleId,
          pos:
            anchor.side === "top" || anchor.side === "bottom" ? anchor.x : anchor.y,
        });
      }
      groups.set(key, group);
    }
    const lenByHandle = new Map<string, number>();
    for (const group of groups.values()) {
      group.sort((a, b) => a.pos - b.pos);
      group.forEach((entry, i) =>
        lenByHandle.set(`${entry.nodeId}|${entry.handleId}`, STUB_BASE + i * LANE_SPACING),
      );
    }
    return lenByHandle;
  }
  return {
    src: collect((e) => e.source, (e) => e.sourceHandle ?? null),
    tgt: collect((e) => e.target, (e) => e.targetHandle ?? null),
  };
}

function fallbackAnchor(
  flowNodes: FlowNode[],
  nodeId: string,
  otherNodeId: string,
): HandleAnchor | null {
  const node = flowNodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const w = node.measured?.width ?? node.width ?? 0;
  const h = node.measured?.height ?? node.height ?? 0;
  const cx = node.position.x + w / 2;
  const cy = node.position.y + h / 2;
  const other = flowNodes.find((n) => n.id === otherNodeId);
  let side: HandlePosition;
  let x: number;
  let y: number;
  if (other) {
    const ow = other.measured?.width ?? other.width ?? 0;
    const oh = other.measured?.height ?? other.height ?? 0;
    const dx = other.position.x + ow / 2 - cx;
    const dy = other.position.y + oh / 2 - cy;
    if (Math.abs(dx) >= Math.abs(dy)) {
      side = dx >= 0 ? "right" : "left";
      x = side === "right" ? node.position.x + w : node.position.x;
      y = cy;
    } else {
      side = dy >= 0 ? "bottom" : "top";
      x = cx;
      y = side === "bottom" ? node.position.y + h : node.position.y;
    }
  } else {
    side = "right";
    x = node.position.x + w;
    y = cy;
  }
  return { x, y, side };
}

function routeEdges(
  flowNodes: FlowNode[],
  flowEdges: FlowEdge[],
  anchors: Map<string, Map<string, HandleAnchor>>,
  cornerRadius: number,
): Record<string, AvoidRoute> {
  const router = new Router(OrthogonalRouting);
  const lateBound = router as unknown as {
    _generateStaticOrthogonalVisGraph: typeof generateStaticOrthogonalVisGraph;
    _improveOrthogonalRoutes: typeof improveOrthogonalRoutes;
    _ConnectorCrossings: typeof ConnectorCrossings;
    _AStarPath: typeof AStarPath;
    _vertexVisibility: typeof vertexVisibility;
  };
  lateBound._generateStaticOrthogonalVisGraph = generateStaticOrthogonalVisGraph;
  lateBound._improveOrthogonalRoutes = improveOrthogonalRoutes;
  lateBound._ConnectorCrossings = ConnectorCrossings;
  lateBound._AStarPath = AStarPath;
  lateBound._vertexVisibility = vertexVisibility;
  router.setRoutingParameter(shapeBufferDistance, 8);
  router.setRoutingParameter(idealNudgingDistance, 4);
  router.setRoutingParameter(segmentPenalty, 10);
  router.setRoutingOption(nudgeOrthogonalSegmentsConnectedToShapes, false);
  router.setRoutingOption(nudgeSharedPathsWithCommonEndPoint, true);
  router.setRoutingOption(performUnifyingNudgingPreprocessingStep, true);
  router.setRoutingOption(nudgeOrthogonalTouchingColinearSegments, false);
  router.setRoutingOption(improveHyperedgeRoutesMovingJunctions, true);

  const shapeRefs: ShapeRef[] = [];
  for (const node of flowNodes) {
    const w = node.measured?.width ?? node.width ?? 0;
    const h = node.measured?.height ?? node.height ?? 0;
    if (!w || !h) continue;
    const rect = new Rectangle(
      new Point(node.position.x, node.position.y),
      new Point(node.position.x + w, node.position.y + h),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shapeRefs.push(new ShapeRef(router as any, rect));
  }

  const lengths = computeStubLengths(flowEdges, anchors);
  type ConnInfo = {
    edge: FlowEdge;
    connRef: ConnRef;
    src: HandleAnchor;
    tgt: HandleAnchor;
  };
  const connInfos: ConnInfo[] = [];
  for (const edge of flowEdges) {
    const srcHandle = edge.sourceHandle ?? null;
    const tgtHandle = edge.targetHandle ?? null;
    let src: HandleAnchor | null = srcHandle
      ? anchors.get(edge.source)?.get(srcHandle) ?? null
      : null;
    let tgt: HandleAnchor | null = tgtHandle
      ? anchors.get(edge.target)?.get(tgtHandle) ?? null
      : null;
    let sLen = STUB_BASE;
    let tLen = STUB_BASE;
    if (src && srcHandle) {
      sLen = lengths.src.get(`${edge.source}|${srcHandle}`) ?? STUB_BASE;
    }
    if (tgt && tgtHandle) {
      tLen = lengths.tgt.get(`${edge.target}|${tgtHandle}`) ?? STUB_BASE;
    }
    if (!src) src = fallbackAnchor(flowNodes, edge.source, edge.target);
    if (!tgt) tgt = fallbackAnchor(flowNodes, edge.target, edge.source);
    if (!src || !tgt) continue;
    const s = offsetFromSide(src, src.side, sLen);
    const t = offsetFromSide(tgt, tgt.side, tLen);
    const connRef = new ConnRef(
      router,
      ConnEnd.fromPoint(new Point(s.x, s.y)),
      ConnEnd.fromPoint(new Point(t.x, t.y)),
    );
    connRef.setRoutingType(ConnType_Orthogonal);
    connInfos.push({ edge, connRef, src, tgt });
  }

  try {
    router.processTransaction();
  } catch (err) {
    console.error("[avoid-nodes-routing] processTransaction failed:", err);
  }

  const result: Record<string, AvoidRoute> = {};
  for (const info of connInfos) {
    const route = info.connRef.displayRoute();
    const size = route.size();
    if (size < 2) continue;
    const pts: Pt[] = [];
    for (let i = 0; i < size; i++) {
      const p = route.at(i);
      pts.push({ x: p.x, y: p.y });
    }
    pts.unshift({ x: info.src.x, y: info.src.y });
    pts.push({ x: info.tgt.x, y: info.tgt.y });
    const midP = pointAtFraction(pts, 0.5);
    result[info.edge.id] = {
      points: pts,
      path: PathBuilder.polylineToPath(pts.length, (i) => pts[i], {
        cornerRadius,
      }),
      labelX: midP.x,
      labelY: midP.y,
      sourceX: pts[0].x,
      sourceY: pts[0].y,
      targetX: pts[pts.length - 1].x,
      targetY: pts[pts.length - 1].y,
    };
  }
  for (const info of connInfos) router.deleteConnector(info.connRef);
  for (const ref of shapeRefs) router.deleteShape(ref);
  return result;
}

interface UseAvoidNodesRoutingParams {
  enabled: boolean;
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  edgeRounding: number;
  instance: ReactFlowInstance | null;
}

export function useAvoidNodesRouting({
  enabled,
  nodes,
  edges,
  edgeRounding,
  instance,
}: UseAvoidNodesRoutingParams) {
  const draggingRef = useRef(false);
  const lastSigRef = useRef<string | null>(null);

  const routeAll = useCallback(() => {
    if (!enabled || !instance || draggingRef.current) return;
    const { flowNodes, anchors } = buildFlowData(nodes, instance);
    const flowEdges: FlowEdge[] = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
    }));
    const sig = [
      edgeRounding,
      ...flowNodes.map(
        (n) =>
          `${n.id}:${n.position.x},${n.position.y}:${n.width ?? "?"},${n.height ?? "?"}:${n.measured?.width},${n.measured?.height}`,
      ),
      ...Array.from(anchors, ([nodeId, byHandle]) =>
        Array.from(byHandle, ([handleId, a]) => `${nodeId}:${handleId}:${a.x},${a.y}`).join(","),
      ),
      ...flowEdges.map(
        (e) =>
          `${e.id}|${e.source}|${e.target}|${e.sourceHandle ?? ""}|${e.targetHandle ?? ""}`,
      ),
    ].join(";");
    if (sig === lastSigRef.current) return;
    lastSigRef.current = sig;
    useEdgeRoutingStore
      .getState()
      .setRoutes(routeEdges(flowNodes, flowEdges, anchors, edgeRounding));
  }, [enabled, instance, nodes, edges, edgeRounding]);

  useEffect(() => {
    if (!enabled) {
      draggingRef.current = false;
      lastSigRef.current = null;
      useEdgeRoutingStore.getState().setRoutes({});
      useEdgeRoutingStore.getState().setDraggingNodeIds(new Set());
      return;
    }
    const first = setTimeout(routeAll, ROUTE_DEBOUNCE_MS);
    const settle = setTimeout(routeAll, SETTLE_DELAY_MS);
    return () => {
      clearTimeout(first);
      clearTimeout(settle);
    };
  }, [enabled, routeAll]);

  useEffect(
    () => () => {
      useEdgeRoutingStore.getState().setRoutes({});
      useEdgeRoutingStore.getState().setDraggingNodeIds(new Set());
    },
    [],
  );

  const beginDrag = useCallback((nodeIds: string[]) => {
    draggingRef.current = true;
    useEdgeRoutingStore.getState().setDraggingNodeIds(new Set(nodeIds));
  }, []);

  const endDrag = useCallback(() => {
    draggingRef.current = false;
    useEdgeRoutingStore.getState().setDraggingNodeIds(new Set());
    routeAll();
  }, [routeAll]);

  return { beginDrag, endDrag };
}
