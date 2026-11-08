"use client";
import "@xyflow/react/dist/style.css";
import { useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { bridge } from "@/lib/shark-bridge";
import { fmtMoney } from "@/lib/format";
import { t, type StringKey } from "@/lib/i18n";
import type { GuideStatus, Language, Roadmap, Step, StepKind } from "@/lib/types";

const KIND_COLOR: Record<StepKind, string> = {
  mdc_program: "#1d7fd6",
  certification: "#7c3aed",
  exam: "#d97706",
  internship: "#059669",
  transfer: "#db2777",
  degree: "#0f766e",
  other: "#64748b",
};

const NODE_W = 190;
const GAP = 60;
const STEP_H = 128;
const LANE_H = 250;
const LANE_LABEL_H = 34;

type StepData = { step: Step; lang: Language; status?: GuideStatus };
type EntryData = { title: string; salary?: string; lang: Language };
type LaneData = { label: string };
type StepNode = Node<StepData, "step">;
type EntryNode = Node<EntryData, "entry">;
type LaneNode = Node<LaneData, "lane">;

function StepBox({ data }: NodeProps<StepNode>) {
  const { step, lang, status } = data;
  const color = KIND_COLOR[step.kind];
  return (
    <div
      className="cursor-pointer rounded-xl border-2 bg-white p-2 text-left shadow-md hover:shadow-lg"
      style={{ width: NODE_W, minHeight: STEP_H, borderColor: color }}
    >
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div className="flex items-center justify-between gap-1">
        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase text-white" style={{ background: color }}>
          {t(lang, `kind_${step.kind}` as StringKey)}
        </span>
        {status && (
          <span className="text-[10px] font-bold" style={{ color: status === "done" ? "#059669" : "#b45309" }}>
            {status === "done" ? "✓ " + t(lang, "guideDone") : status === "stopped" ? t(lang, "guideStopped") : t(lang, "guideFailed")}
          </span>
        )}
      </div>
      <div className="mt-1 text-xs font-semibold leading-tight">{step.program_name ?? step.credential}</div>
      <div className="text-[10px] text-slate-500">
        {step.institution} · {step.credential}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px] text-slate-700">
        <span>
          ⏱ {step.duration_months} {t(lang, "months")}
        </span>
        <span>💵 {fmtMoney(step.cost_usd)}</span>
        {step.estimate && (
          <span className="rounded-full bg-amber-100 px-1.5 text-[9px] font-semibold text-amber-800">{t(lang, "estimate")}</span>
        )}
      </div>
      {step.source_url && (
        <button
          className="nodrag nopan mt-1.5 rounded-full border border-slate-300 px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-100"
          onClick={(e) => {
            e.stopPropagation(); // secondary action: don't start the guide
            bridge.openUrl(step.source_url!);
          }}
        >
          {t(lang, "openPage")} ↗
        </button>
      )}
      <Handle type="source" position={Position.Right} style={{ background: color }} />
      <Handle id="b" type="source" position={Position.Bottom} style={{ background: "#94a3b8" }} />
    </div>
  );
}

function EntryPill({ data }: NodeProps<EntryNode>) {
  return (
    <div className="rounded-full border border-dashed border-emerald-600 bg-emerald-50 px-3 py-1 text-[10px] text-emerald-900">
      <Handle type="target" position={Position.Top} style={{ background: "#94a3b8" }} />
      <b>{t(data.lang, "jobEntry")}:</b> {data.title}
      {data.salary ? ` · ${data.salary}` : ""}
    </div>
  );
}

function LaneLabel({ data }: NodeProps<LaneNode>) {
  return <div className="whitespace-nowrap text-xs font-bold text-shark-900">{data.label}</div>;
}

const nodeTypes = { step: StepBox, entry: EntryPill, lane: LaneLabel };

export default function Flowchart({
  roadmap,
  lang,
  guideStatus,
  onBack,
}: {
  roadmap: Roadmap;
  lang: Language;
  guideStatus: Record<string, GuideStatus>;
  onBack: () => void;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [busyPdf, setBusyPdf] = useState(false);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    roadmap.routes.forEach((route, li) => {
      const laneY = li * LANE_H;
      const cost = route.net_cost_after_aid_usd != null ? ` · ${fmtMoney(route.net_cost_after_aid_usd)} ${t(lang, "netCost")}` : "";
      nodes.push({
        id: `lane-${route.id}`,
        type: "lane",
        position: { x: 0, y: laneY },
        data: { label: `${route.name} · ${route.total_months} ${t(lang, "months")} · ${fmtMoney(route.total_cost_usd)}${cost}` },
        draggable: false,
        selectable: false,
      } satisfies LaneNode);

      const steps = [...route.steps].sort((a, b) => a.order - b.order);
      steps.forEach((step, si) => {
        nodes.push({
          id: step.id,
          type: "step",
          position: { x: si * (NODE_W + GAP), y: laneY + LANE_LABEL_H },
          data: { step, lang, status: guideStatus[step.id] },
          draggable: false,
        } satisfies StepNode);
        const next = steps[si + 1];
        if (next)
          edges.push({
            id: `${step.id}->${next.id}`,
            source: step.id,
            target: next.id,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
          });
      });

      (route.workforce_entry_points ?? []).forEach((ep, ei) => {
        const after = steps[ep.after_step];
        if (!after) return;
        const id = `${route.id}-entry-${ei}`;
        nodes.push({
          id,
          type: "entry",
          position: { x: ep.after_step * (NODE_W + GAP) + 10, y: laneY + LANE_LABEL_H + STEP_H + 24 },
          data: { title: ep.job_title, salary: ep.salary_range_usd, lang },
          draggable: false,
          selectable: false,
        } satisfies EntryNode);
        edges.push({
          id: `e-${id}`,
          source: after.id,
          sourceHandle: "b",
          target: id,
          style: { strokeDasharray: "4 3", stroke: "#059669" },
        });
      });
    });
    return { nodes, edges };
  }, [roadmap, lang, guideStatus]);

  // Task 10: clicking a box asks the extension to start the in-page guide.
  function onNodeClick(_: unknown, node: Node) {
    if (node.type !== "step") return;
    const step = (node.data as StepData).step;
    bridge.startGuide(
      {
        label: step.program_name ?? step.credential,
        kind: step.kind,
        url: step.source_url ?? "https://www.mdc.edu/",
        step_id: step.id,
      },
      lang,
    );
  }

  // Task 12: PDF of the roadmap (career card + flowchart). Falls back to print on failure.
  async function downloadPdf() {
    const el = captureRef.current;
    if (!el) return;
    setBusyPdf(true);
    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      const png = await toPng(el, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        filter: (n) => !(n instanceof HTMLElement && n.closest(".no-print")),
      });
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const pdf = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "px", format: [w, h] });
      pdf.addImage(png, "PNG", 0, 0, w, h);
      pdf.save("shark-advisor-roadmap.pdf");
    } catch {
      window.print(); // cut-list fallback: print stylesheet
    } finally {
      setBusyPdf(false);
    }
  }

  const c = roadmap.career;
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="no-print sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white p-3">
        <button onClick={onBack} aria-label={t(lang, "back")} className="text-sm text-shark-600">←</button>
        <h2 className="flex-1 font-bold text-shark-900">{t(lang, "yourRoadmap")}</h2>
        <button
          onClick={() => void downloadPdf()}
          disabled={busyPdf}
          className="rounded-full bg-shark-600 px-3 py-1 text-xs font-semibold text-white disabled:bg-slate-300"
        >
          {busyPdf ? "…" : t(lang, "downloadPdf")}
        </button>
      </header>

      <div ref={captureRef} className="bg-white">
        {roadmap.warnings && roadmap.warnings.length > 0 && (
          <div className="m-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <b>⚠️ {t(lang, "warnings")}</b>
            <ul className="mt-1 list-disc pl-4">
              {roadmap.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <section className="m-3 rounded-xl border border-slate-200 p-3 text-sm shadow-sm">
          <div className="text-[10px] font-bold uppercase text-slate-400">{t(lang, "careerCard")}</div>
          <h3 className="font-bold text-shark-900">{c.title}</h3>
          <p className="mt-1 text-xs text-slate-700">{c.overview}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-slate-600">
            {c.median_salary_usd != null && (
              <span>
                {t(lang, "medianSalary")}: <b>{fmtMoney(c.median_salary_usd)}</b>
              </span>
            )}
            {c.outlook && (
              <span>
                {t(lang, "outlook")}: <b>{c.outlook}</b>
              </span>
            )}
          </div>
        </section>

        <p className="no-print px-3 text-[11px] text-slate-500">{t(lang, "clickBox")}</p>
        <div style={{ height: Math.max(320, roadmap.routes.length * LANE_H + 40) }} className="w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            minZoom={0.2}
            nodesDraggable={false}
            nodesConnectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} />
            <Controls showInteractive={false} className="no-print" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}