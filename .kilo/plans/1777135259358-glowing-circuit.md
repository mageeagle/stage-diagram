# Plan: Group-by-Location Selection and Editing

## Objective
Update the group node click behavior in `DiagramCanvas.tsx` so that clicking a group node selects all its member nodes and their connected edges, without selecting the group node itself.

## Implementation Details

### 1. Update `onNodeClick` in `DiagramCanvas.tsx`
Modify the `onNodeClick` callback to detect if the clicked node is a group node.

- If the clicked node's ID starts with `"group-"`:
    - Extract the location from the group node's data (label).
    - Filter all `nodes` to find member nodes that have a matching `location`.
    - Collect the IDs of these member nodes.
    - Filter all `edges` to find those where either `source` or `target` is one of the member node IDs.
    - Call `setSelectedNodeIds` with the member node IDs.
    - Call `setSelectedEdgeIds` with the connected edge IDs.
- Otherwise:
    - Use the existing behavior of selecting only the clicked node and clearing edge selection.

**Implementation Sketch**:
```typescript
const onNodeClick = useCallback(
  (_: React.MouseEvent, node: Node) => {
    if (node.id.startsWith('group-')) {
      const location = node.data.label;
      const memberNodes = nodes.filter(
        (n) => n.data.location === location && !n.id.startsWith('group-')
      );
      const memberIds = memberNodes.map((n) => n.id);

      setSelectedNodeIds(memberIds);

      const connectedEdgeIds = edges
        .filter((e) => memberIds.includes(e.source) || memberIds.includes(e.target))
        .map((e) => e.id);
      setSelectedEdgeIds(connectedEdgeIds);
    } else {
      setSelectedNodeIds([node.id]);
      setSelectedEdgeIds([]);
    }
  },
  [nodes, edges, setSelectedNodeIds, setSelectedEdgeIds],
);
```

## Verification Steps
1. **Group Selection**: Click a group node header. Verify that:
   - All member nodes in the group are selected (have the selection border).
   - All edges connected to those member nodes are selected.
   - The group node itself is NOT selected.
2. **Single Node Selection**: Click a regular node. Verify it selects only that node and clears edge selection.
3. **Edge Selection**: Click an edge directly. Verify it selects only that edge.
4. **Clear Selection**: Click on the pane background. Verify all selections are cleared.
5. **Properties Panel**: With the group's members selected, verify the Properties Panel shows multi-select mode (hides Label, Inputs, Outputs).
