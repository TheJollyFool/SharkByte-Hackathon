"use client";
import { useCallback, useEffect, useState } from "react";
import AdvisorPicker from "@/components/AdvisorPicker";
import Chat from "@/components/Chat";
import ErrorBox from "@/components/ErrorBox";
import ModePicker from "@/components/ModePicker";
import { createRoadmap, getAdvisors } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { t } from "@/lib/i18n";
import { bridge } from "@/lib/shark-bridge";
import type { Advisor, AdvisorId, Language, Message, Mode, Roadmap } from "@/lib/types";

type Screen = "mode" | "group" | "chat" | "building" | "roadmap";

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [screen, setScreen] = useState<Screen>("mode");
  const [mode, setMode] = useState<Mode>("group_chat");
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selected, setSelected] = useState<AdvisorId[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); // frontend owns the conversation
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAdvisors = useCallback(() => {
    setError(null);
    getAdvisors()
      .then(setAdvisors)
      .catch((e) => setError(errorMessage(e, lang)));
  }, [lang]);

  useEffect(() => {
    bridge.ready();
    loadAdvisors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickMode = (m: Mode) => {
    setMode(m);
    setMessages([]);
    if (m === "mixture") {
      setSelected(advisors.map((a) => a.id)); // Mixture merges all advisors
      setScreen("chat");
    } else {
      setScreen("group");
    }
  };

  const toggle = (id: AdvisorId) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const buildRoadmap = useCallback(async () => {
    setError(null);
    setScreen("building");
    try {
      setRoadmap(await createRoadmap({ mode, language: lang, history: messages }));
      setScreen("roadmap");
    } catch (e) {
      setError(errorMessage(e, lang));
    }
  }, [mode, lang, messages]);

  const chosen = advisors.filter((a) => selected.includes(a.id));

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ height: "100vh" }}>
      {error && screen !== "building" && <ErrorBox lang={lang} message={error} onRetry={loadAdvisors} />}

      {screen === "mode" && <ModePicker lang={lang} onLang={setLang} onPick={pickMode} />}

      {screen === "group" && (
        <AdvisorPicker
          lang={lang}
          advisors={advisors}
          selected={selected}
          onToggle={toggle}
          onStart={() => setScreen("chat")}
          onBack={() => setScreen("mode")}
        />
      )}

      {screen === "chat" && (
        <Chat
          lang={lang}
          mode={mode}
          advisors={chosen}
          allAdvisors={advisors}
          messages={messages}
          setMessages={setMessages}
          onReady={buildRoadmap}
          onBack={() => setScreen(mode === "mixture" ? "mode" : "group")}
        />
      )}

      {screen === "building" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          {error ? (
            <>
              <ErrorBox lang={lang} message={error} onRetry={buildRoadmap} />
              <button className="text-sm text-shark-600 underline" onClick={() => setScreen("chat")}>
                {t(lang, "back")}
              </button>
            </>
          ) : (
            <>
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-shark-100 border-t-shark-600" />
              <p className="text-sm text-slate-600">{t(lang, "building")}</p>
            </>
          )}
        </div>
      )}

      {screen === "roadmap" && roadmap && (
        <div className="p-4 text-sm">
          <button className="mb-3 text-shark-600 underline" onClick={() => setScreen("chat")}>
            ← {t(lang, "back")}
          </button>
          <h2 className="font-bold">{roadmap.career.title}</h2>
          <ul className="mt-2 list-disc pl-5">
            {roadmap.routes.map((r) => (
              <li key={r.id}>
                {r.name} · {r.total_months} {t(lang, "months")} · ${r.total_cost_usd}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">The flowchart arrives in task 9.</p>
        </div>
      )}
    </div>
  );
}