import type { CourseKind, PickGroup, PlanCourse, PlanSemester, ProgramPlan } from "./types";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (...vs: unknown[]): string => {
  for (const v of vs) if (typeof v === "string" && v.trim()) return v.trim();
  return "";
};
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const list = (...vs: unknown[]): unknown[] => {
  for (const v of vs) if (Array.isArray(v)) return v;
  return [];
};

function kindOf(v: unknown): CourseKind {
  const s = String(v ?? "").toLowerCase();
  return ["gen_ed", "gened", "general", "general_education", "ge"].includes(s) ? "gen_ed" : "program";
}

function course(raw: unknown): PlanCourse | null {
  if (!isObj(raw)) return null;
  const code = str(raw.code, raw.course_code, raw.id);
  const name = str(raw.name, raw.title, raw.course_name) || code;
  if (!code && !name) return null;
  const pre = list(raw.prerequisites, raw.prereqs, raw.requires).filter((x): x is string => typeof x === "string");
  return { code, name, credits: num(raw.credits), kind: kindOf(raw.kind ?? raw.type ?? raw.category), prerequisites: pre };
}

/** Tolerant adapter: accepts a few likely field names so small data-shape differences don't break the panel. */
export function normalizePlan(raw: unknown): ProgramPlan {
  const r = isObj(raw) ? raw : {};
  const semesters: PlanSemester[] = list(r.semesters, r.terms).map((s) => {
    const o = isObj(s) ? s : {};
    const courses = list(o.courses).map(course).filter((c): c is PlanCourse => c !== null);
    const pick_groups: PickGroup[] = list(o.pick_groups, o.pickGroups, o.choose).map((g) => {
      const go = isObj(g) ? g : {};
      return {
        id: str(go.id) || undefined,
        pick: num(go.pick) ?? 1,
        options: list(go.options, go.courses).map(course).filter((c): c is PlanCourse => c !== null),
      };
    });
    return { courses, pick_groups };
  });
  return {
    program_id: str(r.program_id, r.id),
    program_name: str(r.program_name, r.name, r.title),
    credential: str(r.credential, r.degree) || undefined,
    official_url: str(r.official_url, r.url, r.source_url) || "https://www.mdc.edu/",
    total_credits: num(r.total_credits ?? r.credits),
    semesters,
  };
}

/** code -> course, across the whole plan (including pick-group options). */
export function courseIndex(plan: ProgramPlan): Map<string, PlanCourse> {
  const m = new Map<string, PlanCourse>();
  for (const s of plan.semesters) {
    s.courses.forEach((c) => m.set(c.code, c));
    (s.pick_groups ?? []).forEach((g) => g.options.forEach((c) => m.set(c.code, c)));
  }
  return m;
}

/** Prerequisites as readable {name, code}, resolved from the plan when possible. */
export function prereqs(plan: ProgramPlan, c: PlanCourse): { name: string; code: string }[] {
  const idx = courseIndex(plan);
  return (c.prerequisites ?? []).map((code) => ({ code, name: idx.get(code)?.name ?? code }));
}

export function semesterCredits(s: PlanSemester): number {
  const fixed = s.courses.reduce((n, c) => n + (c.credits ?? 0), 0);
  const picked = (s.pick_groups ?? []).reduce((n, g) => n + g.pick * (g.options[0]?.credits ?? 0), 0);
  return fixed + picked;
}
