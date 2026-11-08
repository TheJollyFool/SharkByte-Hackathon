import { fmtMoney } from "./format";
import { t, type StringKey } from "./i18n";
import { C, PdfWriter, type RGB } from "./pdf";
import type { Language, Roadmap, StepKind } from "./types";

const MDC = "https://www.mdc.edu/";
const KIND_RGB: Record<StepKind, RGB> = {
  mdc_program: [29, 127, 214],
  certification: [124, 58, 237],
  exam: [217, 119, 6],
  internship: [5, 150, 105],
  transfer: [219, 39, 119],
  degree: [15, 118, 110],
  other: [100, 116, 139],
};

/** Real-text PDF of the roadmap: selectable text, every step with a source URL is a clickable link. */
export function generateRoadmapPdf(roadmap: Roadmap, lang: Language): void {
  const w = new PdfWriter();
  const c = roadmap.career;
  w.text(t(lang, "yourRoadmap"), { size: 11, color: C.muted, after: 0 });
  w.text(c.title, { size: 20, bold: true, after: 4 });
  w.text(c.overview, { size: 10, after: 4 });
  const facts: string[] = [];
  if (c.median_salary_usd != null) facts.push(`${t(lang, "medianSalary")}: ${fmtMoney(c.median_salary_usd)}`);
  if (c.outlook) facts.push(`${t(lang, "outlook")}: ${c.outlook}`);
  if (facts.length) w.text(facts.join("   |   "), { size: 9, color: C.muted, after: 6 });

  if (roadmap.warnings?.length) {
    w.ensure(30 + roadmap.warnings.length * 12);
    const top = w.y;
    w.fillRect(w.margin, top, w.contentW, 14 + roadmap.warnings.length * 13, C.amberBg);
    w.y = top + 4;
    w.text(t(lang, "warnings"), { size: 9, bold: true, color: C.amber, x: w.margin + 8, after: 1 });
    roadmap.warnings.forEach((m) => w.text(`- ${m}`, { size: 8.5, color: C.amber, x: w.margin + 8, maxW: w.contentW - 16, after: 0 }));
    w.y = top + 14 + roadmap.warnings.length * 13 + 8;
  }

  roadmap.routes.forEach((route) => {
    w.ensure(80);
    w.fillRect(w.margin, w.y, w.contentW, 20, C.band);
    w.setFont(11, true, C.text);
    w.doc.text(route.name, w.margin + 8, w.y + 14);
    const net = route.net_cost_after_aid_usd != null ? ` (${fmtMoney(route.net_cost_after_aid_usd)} ${t(lang, "netCost")})` : "";
    w.setFont(9, false, C.muted);
    w.doc.text(`${route.total_months} ${t(lang, "months")} - ${fmtMoney(route.total_cost_usd)}${net}`, w.pageW - w.margin - 8, w.y + 14, { align: "right" });
    w.y += 26;
    if (route.summary) w.text(route.summary, { size: 9, color: C.muted, after: 4 });

    const steps = [...route.steps].sort((a, b) => a.order - b.order);
    steps.forEach((s, i) => {
      w.ensure(52);
      const pageBefore = w.doc.getNumberOfPages();
      const top = w.y;
      const x = w.margin + 12;
      const name = `${i + 1}. ${s.program_name ?? s.credential}`;
      w.text(name, { size: 10.5, bold: true, x, link: s.source_url ?? undefined, color: s.source_url ? C.blue : C.text, after: 0 });
      w.text(`${t(lang, `kind_${s.kind}` as StringKey)} - ${s.institution} - ${s.credential}`, { size: 8.5, color: C.muted, x, after: 0 });
      w.text(
        `${s.duration_months} ${t(lang, "months")} - ${fmtMoney(s.cost_usd)}${s.estimate ? ` (${t(lang, "estimate")})` : ""}`,
        { size: 8.5, x, after: 2 },
      );
      if (w.doc.getNumberOfPages() === pageBefore) w.fillRect(w.margin, top, 4, w.y - top, KIND_RGB[s.kind]);
      (route.workforce_entry_points ?? [])
        .filter((e) => e.after_step === i)
        .forEach((e) =>
          w.text(`${t(lang, "jobEntry")}: ${e.job_title}${e.salary_range_usd ? ` - ${e.salary_range_usd}` : ""}`, {
            size: 8.5,
            color: C.green,
            x,
            after: 0,
          }),
        );
      w.space(7);
    });
    w.space(6);
  });

  w.ensure(40);
  w.text(t(lang, "goToMdc"), { size: 10, link: MDC, color: C.blue, after: 6 });
  w.text(t(lang, "pdfDisclaimer"), { size: 8.5, color: C.muted });
  w.finish("shark-advisor-roadmap.pdf", {
    footerLeft: t(lang, "pdfFooter"),
    linkLabel: t(lang, "goToMdc"),
    linkUrl: MDC,
    pageWord: t(lang, "pageWord"),
  });
}
