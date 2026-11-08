import { fmtCost, fmtTokens } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { Language, Usage } from "@/lib/types";

export default function UsageBadge({ usage, lang }: { usage: Usage; lang: Language }) {
  return (
    <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
      {fmtTokens(usage.total_tokens)} {t(lang, "tokens")} · {fmtCost(usage.cost_usd)}
    </span>
  );
}

