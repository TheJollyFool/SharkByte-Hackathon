import type { ReactNode } from "react";

// Tiny renderer for what CONTRACTS.md allows: **bold**, [links](https://…), "- " lists, line breaks.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g).map((p, i) => {
    if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const m = /^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/.exec(p);
    if (m)
      return (
        <a key={i} href={m[2]} target="_blank" rel="noreferrer" className="text-shark-600 underline">
          {m[1]}
        </a>
      );
    return p;
  });
}

export default function Markdown({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    out.push(
      <ul key={`ul${out.length}`} className="my-1 list-disc pl-5">
        {list.map((li, i) => (
          <li key={i}>{inline(li)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  text.split("\n").forEach((line, i) => {
    const li = /^\s*[-*]\s+(.*)$/.exec(line);
    if (li) return void list.push(li[1] ?? "");
    flush();
    if (line.trim()) out.push(<p key={`p${i}`} className="my-1">{inline(line)}</p>);
  });
  flush();
  return <>{out}</>;
}