"use client";
import { useCallback, useEffect, useState } from "react";
import { ApiError, getProgramPlan } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { t } from "@/lib/i18n";
import { prereqs, semesterCredits } from "@/lib/plan";
import { guideOrOpen, openExternal } from "@/lib/shark-bridge";
import type { Language, PlanCourse, ProgramPlan as Plan, Step } from "@/lib/types";
import ErrorBox from "./ErrorBox";

const BLUE = "#1d7fd6"; // program course
const GRAY = "#94a3b8"; // general education
const ORANGE = "#ea580c"; // "First you need: …"

function CourseRow({ plan, course, lang }: { plan: Plan; course: PlanCourse; lang: Language }) {
  const pre = prereqs(plan, course);
  return (
    <div className="flex gap-2 rounded-lg bg-white p-2 shadow-sm" style={{ borderLeft: `4px solid ${course.kind === "program" ? BLUE : GRAY}` }}>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold leading-tight">{course.name}</span>
          <span className="shrink-0 text-[10px] text-slate-400">{course.code}</span>
        </div>
        {pre.length > 0 && (
          <div className="mt-0.5 text-[11px]" style={{ color: ORANGE }}>
            {t(lang, "firstYouNeed")} {pre.map((p) => (p.name === p.code ? p.code : `${p.name} (${p.code})`)).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProgramPlan({ step, lang, onBack }: { step: Step; lang: Language; onBack: () => void }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [err, setErr] = useState("");
  const [busyPdf, setBusyPdf] = useState(false);

  const load = useCallback(() => {
    if (!step.program_id) return setState("missing");
    setState("loading");
    getProgramPlan(step.program_id)
      .then((p) => {
        setPlan(p);
        setState(p.semesters.length ? "ready" : "missing");
      })
      .catch((e) => {
        if (e instanceof ApiError && (e.code === "not_found" || e.status === 404)) setState("missing");
        else {
          setErr(errorMessage(e, lang));
          setState("error");
        }
      });
  }, [step.program_id, lang]);

  useEffect(load, [load]);

  const name = plan?.program_name || step.program_name || step.credential;
  const officialUrl = plan?.official_url || step.source_url || "https://www.mdc.edu/";

  async function downloadPdf() {
    if (!plan) return;
    setBusyPdf(true);
    try {
      const { generatePlanPdf } = await import("@/lib/plan-pdf");
      generatePlanPdf(plan, lang);
    } finally {
      setBusyPdf(false);
    }
  }

  const btn = "w-full rounded-full py-2 text-sm font-semibold";
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <button onClick={onBack} aria-label={t(lang, "back")} className="text-sm text-shark-600">←</button>
          <h2 className="min-w-0 flex-1 truncate font-bold text-shark-900">{name}</h2>
        </div>
        <div className="mt-0.5 pl-6 text-xs text-slate-500">
          {[plan?.credential ?? step.credential, plan?.total_credits ? `${plan.total_credits} ${t(lang, "credits")}` : ""].filter(Boolean).join(" · ")}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 pl-6 text-[10px] text-slate-600">
          <span><i className="mr-1 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: BLUE }} />{t(lang, "programCourse")}</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-sm align-middle" style={{ background: GRAY }} />{t(lang, "genEd")}</span>
          <span style={{ color: ORANGE }}>{t(lang, "firstYouNeed").replace(/:$/, "")}</span>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50 p-3">
        {state === "loading" && <p className="mt-6 text-center text-sm text-slate-500">{t(lang, "loading")}</p>}
        {state === "error" && <ErrorBox lang={lang} message={err} onRetry={load} />}
        {state === "missing" && <p className="rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm">{t(lang, "planUnavailable")}</p>}

        {state === "ready" &&
          plan &&
          plan.semesters.map((sem, i) => (
            <section key={i}>
              <div className="mb-1 flex items-baseline justify-between">
                <h3 className="text-sm font-bold text-shark-900">{t(lang, "semester", { n: String(i + 1) })}</h3>
                {semesterCredits(sem) > 0 && (
                  <span className="text-[10px] text-slate-500">{semesterCredits(sem)} {t(lang, "credits")}</span>
                )}
              </div>
              <div className="space-y-1.5">
                {sem.courses.map((c) => (
                  <CourseRow key={c.code + c.name} plan={plan} course={c} lang={lang} />
                ))}
                {(sem.pick_groups ?? []).map((g, gi) => (
                  <div key={g.id ?? gi} className="rounded-xl border border-dashed border-slate-300 p-2">
                    <div className="mb-1 text-[11px] font-bold text-slate-600">{t(lang, "pickN", { n: String(g.pick) })}</div>
                    <div className="space-y-1.5">
                      {g.options.map((c) => (
                        <CourseRow key={c.code + c.name} plan={plan} course={c} lang={lang} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
      </div>

      <footer className="space-y-2 border-t border-slate-200 bg-white p-3">
        <button onClick={() => openExternal(officialUrl)} className={`${btn} border border-shark-600 text-shark-600`}>
          {t(lang, "officialPage")} ↗
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => void downloadPdf()}
            disabled={state !== "ready" || busyPdf}
            className={`${btn} bg-shark-600 text-white disabled:bg-slate-300`}
          >
            {busyPdf ? "…" : t(lang, "downloadPdf")}
          </button>
          <button
            onClick={() => guideOrOpen({ label: name, kind: "mdc_program", url: officialUrl, step_id: step.id }, lang)}
            className={`${btn} bg-emerald-600 text-white`}
          >
            {t(lang, "goToMdc")}
          </button>
        </div>
      </footer>
    </div>
  );
}
