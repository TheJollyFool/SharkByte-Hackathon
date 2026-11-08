import { t } from "./i18n";
import { prereqs, semesterCredits } from "./plan";
import { C, PdfWriter, type RGB } from "./pdf";
import type { Language, PlanCourse, ProgramPlan } from "./types";

const MDC = "https://www.mdc.edu/";

function courseRow(w: PdfWriter, plan: ProgramPlan, c: PlanCourse, lang: Language, x: number): void {
  const color: RGB = c.kind === "program" ? C.blue : C.gray;
  w.ensure(30);
  const top = w.y;
  w.rowWithRight(c.name, c.code, { x: x + 10, bold: true });
  const pre = prereqs(plan, c);
  if (pre.length) {
    w.text(`${t(lang, "firstYouNeed")} ${pre.map((p) => (p.name === p.code ? p.code : `${p.name} (${p.code})`)).join(", ")}`, {
      x: x + 10,
      size: 8.5,
      color: C.orange,
      after: 0,
    });
  }
  w.fillRect(x, top, 4, Math.max(14, w.y - top), color);
  w.space(5);
}

/** Real-text PDF of one program plan: selectable text, clickable official-page and mdc.edu links. */
export function generatePlanPdf(plan: ProgramPlan, lang: Language): void {
  const w = new PdfWriter();
  w.text(plan.program_name, { size: 18, bold: true, link: plan.official_url, color: C.blue, after: 3 });
  const meta = [plan.credential, plan.total_credits ? `${plan.total_credits} ${t(lang, "credits")}` : ""].filter(Boolean).join(" - ");
  if (meta) w.text(meta, { size: 10, color: C.muted, after: 6 });

  // legend
  w.ensure(16);
  let lx = w.margin;
  const ly = w.y;
  const legend: [RGB, string][] = [
    [C.blue, t(lang, "programCourse")],
    [C.gray, t(lang, "genEd")],
    [C.orange, t(lang, "firstYouNeed").replace(/:$/, "")],
  ];
  for (const [col, label] of legend) {
    w.fillRect(lx, ly + 2, 8, 8, col);
    w.setFont(8.5, false, C.muted);
    w.doc.text(label, lx + 12, ly + 9);
    lx += 12 + w.width(label, 8.5) + 16;
  }
  w.y = ly + 22;

  plan.semesters.forEach((sem, i) => {
    w.ensure(60);
    const cr = semesterCredits(sem);
    w.fillRect(w.margin, w.y, w.contentW, 18, C.band);
    w.setFont(10.5, true, C.text);
    w.doc.text(t(lang, "semester", { n: String(i + 1) }), w.margin + 8, w.y + 12.5);
    if (cr) {
      w.setFont(8.5, false, C.muted);
      w.doc.text(`${cr} ${t(lang, "credits")}`, w.pageW - w.margin - 8, w.y + 12.5, { align: "right" });
    }
    w.y += 24;

    sem.courses.forEach((c) => courseRow(w, plan, c, lang, w.margin));

    (sem.pick_groups ?? []).forEach((g) => {
      w.ensure(40);
      w.text(t(lang, "pickOneOf", { n: String(g.pick) }), { size: 9, bold: true, color: C.muted, x: w.margin + 6, after: 3 });
      g.options.forEach((c) => courseRow(w, plan, c, lang, w.margin + 14));
    });
    w.space(6);
  });

  w.ensure(60);
  w.text(t(lang, "officialPage"), { size: 10, link: plan.official_url, color: C.blue, after: 2 });
  w.text(t(lang, "goToMdc"), { size: 10, link: MDC, color: C.blue, after: 8 });
  w.text(t(lang, "pdfDisclaimer"), { size: 8.5, color: C.muted });

  const slug = (plan.program_name || "program").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  w.finish(`shark-plan-${slug || "program"}.pdf`, {
    footerLeft: t(lang, "pdfFooter"),
    linkLabel: t(lang, "goToMdc"),
    linkUrl: MDC,
    pageWord: t(lang, "pageWord"),
  });
}
