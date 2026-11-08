"use client";
import { t } from "@/lib/i18n";
import type { Advisor, AdvisorId, Language } from "@/lib/types";

export default function AdvisorPicker({
  lang,
  advisors,
  selected,
  onToggle,
  onStart,
  onBack,
}: {
  lang: Language;
  advisors: Advisor[];
  selected: AdvisorId[];
  onToggle: (id: AdvisorId) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-slate-200 p-3">
        <button onClick={onBack} className="text-sm text-shark-600" aria-label={t(lang, "back")}>←</button>
        <h2 className="font-bold text-shark-900">{t(lang, "newGroup")}</h2>
      </header>
      <p className="px-4 pt-3 text-xs text-slate-500">{t(lang, "newGroupHint")}</p>

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {advisors.map((a) => {
          const on = selected.includes(a.id);
          return (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-2xl border p-3"
              style={{ borderColor: on ? a.color : "#e2e8f0", background: on ? `${a.color}12` : "#fff" }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl"
                style={{ background: `${a.color}25` }}
                aria-hidden
              >
                {a.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{a.name}</div>
                <div className="text-xs text-slate-600">{a.role}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">
                  {a.mdc_section} · {a.model_name}
                </div>
              </div>
              <button
                onClick={() => onToggle(a.id)}
                aria-pressed={on}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${on ? "bg-slate-200 text-slate-700" : "bg-shark-600 text-white"}`}
              >
                {on ? t(lang, "removeAdvisor") : t(lang, "addAdvisor")}
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="border-t border-slate-200 p-3">
        <button
          onClick={onStart}
          disabled={selected.length === 0}
          className="w-full rounded-full bg-shark-600 py-2.5 text-sm font-semibold text-white disabled:bg-slate-300"
        >
          {selected.length === 0 ? t(lang, "pickAtLeastOne") : `${t(lang, "startChat")} (${selected.length})`}
        </button>
      </footer>
    </div>
  );
}
