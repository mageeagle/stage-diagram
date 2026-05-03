import { Position, NodeProps, useUpdateNodeInternals, Node } from "@xyflow/react";
import { CustomNodeData, NodeInput, NodeOutput } from "@/types/diagram";
import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import { LabeledHandle } from "./LabeledHandle";

export const CustomNode = ({ data, id, selected }: NodeProps<Node<CustomNodeData>>) => {
  const update = useUpdateNodeInternals();
  const theme = useThemeStore(s => s.theme);

  useEffect(() => {
    update(id);
  }, [data.inputs, data.outputs, id, update]);

  const isDark = theme === 'dark';

  // Return null to hide the node from the canvas during export
  if (data.exportingHidden) {
    return null;
  }

  return (
    <div className={cn(
      "py-2 shadow-md rounded-md border-2 min-w-[250px]",
      isDark ? "bg-stone-800 text-stone-100 border-stone-600" : "bg-white text-stone-900 border-stone-400",
      selected ? 'border-blue-500 ring-2 ring-blue-200' : "",
      data.hidden ? "opacity-30" : ""
    )}>
      <div className="font-bold text-sm mb-2 text-center">{data.label}</div >

      <div className="flex flex-row justify-between gap-6">
        {/* Inputs */}
        <div className="flex flex-col gap-2">
          {data.inputs ? (
            data.inputs.map((input: NodeInput) => (
              <LabeledHandle key={input.id} id={input.id} type={"target"} position={Position.Left} title={input.name} />
            ))
          ) : (
            <div className="w-4"></div >
          )}
        </div>

        {/* Outputs */}
        <div className="flex flex-col gap-2">
          {data.outputs ? (
            data.outputs.map((output: NodeOutput) => (
              <LabeledHandle key={output.id} id={output.id} type={"source"} position={Position.Right} title={output.name} />
            ))
          ) : (
            <div className="w-4"></div >
          )}
        </div>
      </div>
    </div>
  );
};

