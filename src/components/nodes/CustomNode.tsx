import { Handle, Position, NodeProps, useUpdateNodeInternals } from "reactflow";
import { CustomNodeData } from "@/types/diagram";
import { useEffect } from "react";

export const CustomNode = ({ data, id }: NodeProps<CustomNodeData>) => {
  const update = useUpdateNodeInternals();
  useEffect(() => {
    update(id);
  }, [data.inputs, data.outputs]);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 min-w-[250px]">
      <div className="font-bold text-sm mb-2 text-center">{data.label}</div>

      <div className="flex flex-row justify-between gap-6">
        {/* Inputs */}
        <div className="flex flex-col gap-2">
          {data.inputs ? (
            data.inputs.map((input) => (
              <div
                key={input.id}
                className="relative flex items-center w-full h-4"
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input.id}
                  className="w-3 h-3 !bg-blue-500"
                />
                <span className="text-[10px] ml-4">{input.name}</span>
              </div>
            ))
          ) : (
            <div className="w-4"></div>
          )}
        </div>

        {/* Outputs */}
        <div className="flex flex-col gap-2">
          {data.outputs ? (
            data.outputs.map((output) => (
              <div
                key={output.id}
                className="relative flex items-center w-full h-4"
              >
                <span className="text-[10px] mr-4">{output.name}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output.id}
                  className="w-3 h-3 !bg-green-500"
                />
              </div>
            ))
          ) : (
            <div className="w-4"></div>
          )}
        </div>
      </div>
    </div>
  );
};
