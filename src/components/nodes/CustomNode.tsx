import { Handle, Position, NodeProps, useUpdateNodeInternals, Node } from "@xyflow/react";
import { CustomNodeData, NodeInput, NodeOutput } from "@/types/diagram";
import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";

export const CustomNode = ({ data, id, selected }: NodeProps<Node<CustomNodeData>>) => {
  const update = useUpdateNodeInternals();
  const { theme } = useThemeStore();

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
      "px-4 py-2 shadow-md rounded-md border-2 min-w-[250px]",
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
              <div
                key={input.id}
                className="relative flex items-center w-full h-4"
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input.id}
                  className={cn("w-3 h-3 bg-blue-500!", isDark && "!hover:bg-blue-300")}
                />
                <span className="text-[10px] ml-4">{input.name}</span >
              </div>
            ))
          ) : (
            <div className="w-4"></div >
          )}
        </div>

        {/* Outputs */}
        <div className="flex flex-col gap-2">
          {data.outputs ? (
            data.outputs.map((output: NodeOutput) => (
              <div
                key={output.id}
                className="relative flex items-center w-full h-4"
              >
                <span className="text-[10px] mr-4">{output.name}</span >
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output.id}
                  className={cn("w-3 h-3 bg-green-500!", isDark && "bg-green-400!")}
                />
              </div>
            ))
          ) : (
            <div className="w-4"></div >
          )}
        </div>
      </div>
    </div>
  );
};

