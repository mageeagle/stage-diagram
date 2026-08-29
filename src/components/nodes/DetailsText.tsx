import { ReactNode } from "react";
import {
  parseDetails,
  parseInline,
  type InlineToken,
} from "@/utils/detailsFormat";

function renderTokens(tokens: InlineToken[]): ReactNode[] {
  return tokens.map((t, i) => {
    if (t.kind === "text") return <span key={i}>{t.text}</span>;
    const children = renderTokens(t.children);
    if (t.kind === "bold") return <strong key={i}>{children}</strong>;
    if (t.kind === "italic") return <em key={i}>{children}</em>;
    return <u key={i}>{children}</u>;
  });
}

export const DetailsText = ({ value }: { value: string }) => {
  const blocks = parseDetails(value);
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === "ul") {
          return (
            <ul key={i} className="list-disc pl-4">
              {block.items.map((item, j) => (
                <li key={j}>{renderTokens(parseInline(item))}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === "ol") {
          return (
            <ol key={i} className="list-decimal pl-4">
              {block.items.map((item, j) => (
                <li key={j}>{renderTokens(parseInline(item))}</li>
              ))}
            </ol>
          );
        }
        return (
          <div key={i}>
            {block.text ? renderTokens(parseInline(block.text)) : "\u00A0"}
          </div>
        );
      })}
    </>
  );
};
