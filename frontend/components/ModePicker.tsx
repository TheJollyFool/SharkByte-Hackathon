"use client";
import type { Language, Mode } from "@/lib/types";
import { t } from "@/lib/i18n";

export default function ModePicker({
  lang,
  onLang,
  onPick,
}: {
  lang: Language;
  onLang: (l: Language) => void;
  onPick: (m: Mode) => void;
}) {
  const card = "w-full rounded-2xl border border-slate-200 p-4 text-left shadow-sm transition hover:border-shark-500 hover:bg-shark-50";
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-shark-900">🦈 {t(lang, "appName")}</h1>
        <div className="flex overflow-hidden rounded-full border border-slate-300 text-xs font-semibold">
          {(["en", "es"] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => onLang(l)}
              className={`px-3 py-1 ${lang === l ? "bg-shark-600 text-white" : "bg-white text-slate-600"}`}
              aria-pressed={lang === l}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 mb-3 text-sm text-slate-600">{t(lang, "pickMode")}</p>
      <div className="space-y-3">
        <button className={card} onClick={() => onPick("group_chat")}>
          <div className="font-semibold">💬 {t(lang, "groupChat")}</div>
          <div className="mt-1 text-sm text-slate-600">{t(lang, "groupChatDesc")}</div>
        </button>
        <button className={card} onClick={() => onPick("mixture")}>
          <div className="font-semibold">🧪 {t(lang, "mixture")}</div>
          <div className="mt-1 text-sm text-slate-600">{t(lang, "mixtureDesc")}</div>
        </button>
      </div>
    </div>
  );
}
