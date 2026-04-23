import { type Node } from "@xyflow/react";
import { type CustomNodeData } from "../../types/diagram";
import { type GroupedNode } from "./node-list-modal-types";

// Helper: group by name & type, hide location
export const groupByName = (nodes: Node<CustomNodeData>[]): GroupedNode[] => {
  const map = new Map<string, GroupedNode[]>();
  nodes.forEach((node) => {
    const key = node.data.label || "unassigned";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({
      name: node.data.label || "",
      type: node.data.type,
      location: node.data.location,
      quantity: 1,
    });
  });

  const result: GroupedNode[] = [];
  map.forEach((group) => {
    const subMap = new Map<string, GroupedNode>();
    group.forEach((n) => {
      const subKey = `${n.name}-${n.type}-${n.location}`;
      if (subMap.has(subKey)) {
        subMap.get(subKey)!.quantity += 1;
      } else {
        subMap.set(subKey, { ...n, quantity: 1 });
      }
    });
    subMap.forEach((subNode) => result.push(subNode));
  });
  return result;
};

// Helper: group by location, then name & type
export const groupByLocation = (nodes: Node<CustomNodeData>[]): GroupedNode[] => {
  const map = new Map<string, GroupedNode[]>();
  nodes.forEach((node) => {
    const key = node.data.location || "unassigned";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({
      name: node.data.label || "",
      type: node.data.type,
      location: node.data.location,
      quantity: 1,
    });
  });

  const result: GroupedNode[] = [];
  map.forEach((group) => {
    const subMap = new Map<string, GroupedNode>();
    group.forEach((n) => {
      const subKey = `${n.name}-${n.type}`;
      if (subMap.has(subKey)) {
        subMap.get(subKey)!.quantity += 1;
      } else {
        subMap.set(subKey, { ...n, quantity: 1 });
      }
    });
    subMap.forEach((subNode) => result.push(subNode));
  });
  return result;
};

// Helper: group by type, then name
export const groupByType = (nodes: Node<CustomNodeData>[]): GroupedNode[] => {
  const map = new Map<string, GroupedNode[]>();
  nodes.forEach((node) => {
    const key = node.data.type || "unassigned";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({
      name: node.data.label || "",
      type: node.data.type,
      location: node.data.location,
      quantity: 1,
    });
  });

  const result: GroupedNode[] = [];
  map.forEach((group) => {
    const subMap = new Map<string, GroupedNode>();
    group.forEach((n) => {
      const subKey = `${n.name}-${n.type}`;
      if (subMap.has(subKey)) {
        subMap.get(subKey)!.quantity += 1;
      } else {
        subMap.set(subKey, { ...n, quantity: 1 });
      }
    });
    subMap.forEach((subNode) => result.push(subNode));
  });
  return result;
};
