import { useEffect, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { CustomNodeData } from "@/types/diagram";

export interface ProximityPair {
  source: string; // output handle id
  target: string; // input handle id
  sourceNodeId: string;
  targetNodeId: string;
}

const MIN_DISTANCE = 150;

function getHandleCenter(node: Node<CustomNodeData>, handleId: string, isOutput: boolean): { x: number; y: number } | null {
  const handle = isOutput
    ? node.data?.outputs?.find((o) => o.id === handleId)
    : node.data?.inputs?.find((i) => i.id === handleId);

  if (!handle) return null;

  const idx = isOutput
    ? (node.data?.outputs || []).findIndex((o) => o.id === handleId)
    : (node.data?.inputs || []).findIndex((i) => i.id === handleId);

  const count = isOutput
    ? (node.data?.outputs || []).length
    : (node.data?.inputs || []).length;

  if (count === 0) return null;

  const spacing = 30;
  const totalHeight = (count - 1) * spacing;
  const startY = totalHeight / 2;

  const nodeWidth = node.measured?.width || node.width || 200;
  const nodeHeight = node.measured?.height || node.height || 100;

  if (isOutput) {
    return {
      x: node.position.x + nodeWidth,
      y: node.position.y + nodeHeight / 2 - startY + idx * spacing,
    };
  } else {
    return {
      x: node.position.x,
      y: node.position.y + nodeHeight / 2 - startY + idx * spacing,
    };
  }
}

function getDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function useProximityConnect(
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  onProximityChange: (pairs: ProximityPair[]) => void,
  liveNodes?: Node<CustomNodeData>[],
): { getPairs: () => ProximityPair[]; isQMode: () => boolean } {
  const qKeyPressed = useRef(false);
  const aKeyPressed = useRef(false);
  const prevPairsRef = useRef<ProximityPair[]>([]);
  const currentPairsRef = useRef<ProximityPair[]>([]);
  const effectiveNodes = (liveNodes && liveNodes.length > 0) ? liveNodes : nodes;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "q" || e.key === "Q") {
        qKeyPressed.current = true;
      }
      if (e.key === "a" || e.key === "A") {
        aKeyPressed.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "q" || e.key === "Q") {
        qKeyPressed.current = false;
      }
      if (e.key === "a" || e.key === "A") {
        aKeyPressed.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const findProximityPairs = (nodesList: Node<CustomNodeData>[]): ProximityPair[] => {
      if (!qKeyPressed.current) {
        return [];
      }

      const outputs: { nodeId: string; handleId: string; x: number; y: number }[] = [];
      const inputs: { nodeId: string; handleId: string; x: number; y: number }[] = [];

      for (const node of nodesList) {
        if (!node.position) continue;

        const nodeOutputs = node.data?.outputs || [];
        for (let i = 0; i < nodeOutputs.length; i++) {
          const center = getHandleCenter(node, nodeOutputs[i].id, true);
          if (center) {
            outputs.push({
              nodeId: node.id,
              handleId: nodeOutputs[i].id,
              x: center.x,
              y: center.y,
            });
          }
        }

        const nodeInputs = node.data?.inputs || [];
        for (let i = 0; i < nodeInputs.length; i++) {
          const center = getHandleCenter(node, nodeInputs[i].id, false);
          if (center) {
            inputs.push({
              nodeId: node.id,
              handleId: nodeInputs[i].id,
              x: center.x,
              y: center.y,
            });
          }
        }
      }

      const existingEdges = edges.filter((e) => !e.className?.includes("temp"));
      const usedSourceHandles = new Set<string>();
      const usedTargetHandles = new Set<string>();

      for (const edge of existingEdges) {
        usedSourceHandles.add(`${edge.source}-${edge.sourceHandle || ""}`);
        usedTargetHandles.add(`${edge.target}-${edge.targetHandle || ""}`);
      }

      const pairs: ProximityPair[] = [];

      if (aKeyPressed.current) {
        for (const output of outputs) {
          for (const input of inputs) {
            if (output.nodeId === input.nodeId) continue;

            const dist = getDistance(output.x, output.y, input.x, input.y);
            if (dist <= MIN_DISTANCE && output.x <= input.x) {
              pairs.push({
                source: output.handleId,
                target: input.handleId,
                sourceNodeId: output.nodeId,
                targetNodeId: input.nodeId,
              });
            }
          }
        }
      } else {
        const candidates: {
          output: typeof outputs[0];
          input: typeof inputs[0];
          dist: number;
        }[] = [];

        for (const output of outputs) {
          for (const input of inputs) {
            if (output.nodeId === input.nodeId) continue;

            const dist = getDistance(output.x, output.y, input.x, input.y);
            if (dist <= MIN_DISTANCE && output.x <= input.x) {
              candidates.push({ output, input, dist });
            }
          }
        }

        candidates.sort((a, b) => a.dist - b.dist);

        const matchedSources = new Set<string>();
        const matchedTargets = new Set<string>();

        for (const candidate of candidates) {
          const sourceKey = `${candidate.output.nodeId}-${candidate.output.handleId}`;
          const targetKey = `${candidate.input.nodeId}-${candidate.input.handleId}`;

          if (matchedSources.has(sourceKey)) continue;
          if (matchedTargets.has(targetKey)) continue;

          matchedSources.add(sourceKey);
          matchedTargets.add(targetKey);

          pairs.push({
            source: candidate.output.handleId,
            target: candidate.input.handleId,
            sourceNodeId: candidate.output.nodeId,
            targetNodeId: candidate.input.nodeId,
          });
        }
      }

      return pairs;
    };

    const pairs = findProximityPairs(effectiveNodes);
    currentPairsRef.current = pairs;

    const prev = prevPairsRef.current;
    const changed =
      pairs.length !== prev.length ||
      pairs.some(
        (p, i) =>
          p.source !== prev[i]?.source ||
          p.target !== prev[i]?.target ||
          p.sourceNodeId !== prev[i]?.sourceNodeId ||
          p.targetNodeId !== prev[i]?.targetNodeId,
      );

    if (changed) {
      prevPairsRef.current = pairs;
      onProximityChange(pairs);
    }
  }, [effectiveNodes, edges, onProximityChange]);

  return {
    getPairs: () => currentPairsRef.current,
    isQMode: () => qKeyPressed.current,
  };
}
