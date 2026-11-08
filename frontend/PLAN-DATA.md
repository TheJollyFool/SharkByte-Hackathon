# Program plans (design C · Courses): assumed data shape

Waiting for Diego's data in `data/`. The panel expects, per program (`step.program_id`):

```json
{
  "program_id": "…", "program_name": "…", "credential": "A.S.", "official_url": "https://www.mdc.edu/…",
  "total_credits": 60,
  "semesters": [
    { "courses": [
        { "code": "COP 2250", "name": "Java Programming", "credits": 3, "kind": "program", "prerequisites": ["COP 1000"] },
        { "code": "ENC 1101", "name": "English Composition I", "credits": 3, "kind": "gen_ed" } ],
      "pick_groups": [ { "id": "hum", "pick": 1, "options": [ { "code": "PHI 2010", "name": "…", "kind": "gen_ed" } ] } ] }
  ]
}
```

- `kind`: `program` (blue) or `gen_ed` (gray). `prerequisites` are course codes → shown as orange "First you need: …".
- Loaded via `GET /programs/{program_id}/plan` (**assumption: confirm with Piero/Diego**), 404 = "plan not available yet".
- `lib/plan.ts → normalizePlan()` accepts a few alternate field names; adjust it if the real data differs.
- Mock mode uses `mock/program-plan.sample.json` (placeholder).

## PDFs (real text, clickable links)
- `lib/pdf.ts` (jsPDF writer), `lib/plan-pdf.ts` (plan), `lib/roadmap-pdf.ts` (roadmap). Links use `textWithLink`: program name and the "Official program page" / "Go to mdc.edu" lines, plus each roadmap step's `source_url`. `html-to-image` is no longer used.
- Compare against `docs/samples/` and tweak spacing/colors in those files.
