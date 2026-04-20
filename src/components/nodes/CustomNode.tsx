import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from '@/types/diagram';

export const CustomNode = ({ data }: NodeProps<CustomNodeData>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 min-w-[150px]">
      <div className="font-bold text-sm mb-2 text-center">{data.label}</div>
      
      <div className="flex flex-col gap-2">
        {/* Inputs */}
        <div className="flex flex-col gap-2">
          {data.inputs?.map((input) => (
            <div key={input.id} className="relative flex items-center justify-center w-full h-4">
              <Handle
                type="target"
                position={Position.Left}
                id={input.id}
                className="w-3 h-3 !bg-blue-500"
              />
              <span className="text-[10px] ml-4">{input.name}</span>
            </div>
          ))}
        </div>

        {/* Outputs */}
        <div className="flex flex-col gap-2">
          {data.outputs?.map((output) => (
            <div key={output.id} className="relative flex items-center justify-center w-full h-4">
              <span className="text-[10px] mr-4">{output.name}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={output.id}
                className="w-3 h-3 !bg-green-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
