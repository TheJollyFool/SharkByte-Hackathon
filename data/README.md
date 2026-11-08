# data/

Hand-curated from mdc.edu and official aid pages. Agents may **only** choose MDC programs from here.
Every entry needs a `source_url`. Numbers that are guesses get `"estimate": true`.

| File | Contents |
|---|---|
| `advisors.json` | The 6 advisors: id, name, role, MDC section, emoji, color, turn order, model |
| `careers.json` | Career families + student keywords (EN/ES) used to filter programs |
| `mdc_programs.json` | **Every program in MDC's official [2026-2028 Catalog](https://mdc.curricunet.com/catalog)** (A.A. pathways, A.S., B.S., B.A.S., certificates): official plan code, credits (or clock hours), modality, description, key program courses, and a `source_url` to that program's catalog page. CIP/SOC codes from MDC's [Academic Program Inventory](https://www.mdc.edu/academics/documents/academic-programs-cip.pdf). `typical_months_full_time` is derived from MDC's Course Sequence Guide → `"estimate": true` |
| `transfer_agreements.json` | 2+2 / articulation agreements (FIU Connect4Success, FAU, UCF…) incl. limited-access caveats |
| `costs.json` | Tuition per credit (MDC + transfer universities), fees, books |
| `financial_aid.json` | Pell, Bright Futures, FSAG, work-study, MDC scholarships |

Entries with `TODO` are templates — replace with real data.
