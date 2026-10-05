import { type ChannelRow } from "./channel-list-report-generator";

export interface ChannelListColumnProps {
  title: string;
  rows: ChannelRow[];
}

export const ChannelListColumn = ({ title, rows }: ChannelListColumnProps) => (
  <div className="min-w-[240px] flex-1 max-h-[400px] overflow-y-auto">
    <div className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-y border-zinc-100 dark:border-zinc-800">
      {title}
    </div>
    <div className="flex items-center px-5 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
      <div className="shrink-0 w-20">Number</div>
      <div className="flex-1">Node Name</div>
    </div>
    {rows.map((row, index) => (
      <div
        key={`${row.number ?? "unnumbered"}-${index}`}
        className="flex items-center border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="shrink-0 w-20 px-5 py-3 text-gray-500 dark:text-zinc-500">
          {row.number ?? ""}
        </div>
        <div className="flex-1 px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100 wrap-break-word max-w-full">
          {row.name}
        </div>
      </div>
    ))}
  </div>
);
