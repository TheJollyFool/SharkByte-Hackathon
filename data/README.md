# data/

Hand-curated from mdc.edu and official aid pages. Agents may **only** choose MDC programs from here.
Every entry needs a `source_url`. Numbers that are guesses get `"estimate": true`.

| File | Contents |
|---|---|
| `advisors.json` | The 6 advisors: id, name, role, MDC section, emoji, color, turn order, model |
| `careers.json` | 45 career families + student keywords (EN/ES) used to filter programs |
| `mdc_programs.json` | **All 251 MDC programs** (A.A., A.S., B.S., B.A.S., certificates) from MDC's official [Academic Program Inventory](https://www.mdc.edu/academics/documents/academic-programs-cip.pdf) (rev. Sep 16, 2025). Each has `careers` ids from `careers.json`; the A.A. is tagged with every career (transfer route). A.A./A.S./B.S./B.A.S. `credits` and `typical_months_full_time` are typical totals → `"estimate": true`; certificates have `null` until checked on the program page |
| `transfer_agreements.json` | 2+2 / articulation agreements (FIU Connect4Success, FAU, UCF…) incl. limited-access caveats |
| `costs.json` | Tuition per credit (MDC + transfer universities), fees, books |
| `financial_aid.json` | Pell, Bright Futures, FSAG, work-study, MDC scholarships |

Entries with `TODO` are templates — replace with real data.
