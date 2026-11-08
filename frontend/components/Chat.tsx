"use client";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { chatReply, mixture } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { fmtCost, fmtTokens, sumUsage } from "@/lib/format";
import { t } from "@/lib/i18n";
import type { Advisor, Language, Message, Mode } from "@/lib/types";
import ErrorBox from "./ErrorBox";
import Markdown from "./Markdown";
import UsageBadge from "./UsageBadge";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function Chat({
  lang,
  mode,
  advisors, // selected advisors (Mixture: all of them)
  allAdvisors,
  messages,
  setMessages,
  onReady,
  onBack,
}: {
  lang: Language;
  mode: Mode;
  advisors: Advisor[];
  allAdvisors: Advisor[];
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  onReady: () => void;
  onBack: () => void;
}) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState<Advisor | null>(null); // advisor currently "typing"
  const [mixing, setMixing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryRef = useRef<(() => Promise<void>) | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const ordered = [...advisors].sort((a, b) => a.order - b.order);
  const byId = (id?: string) => allAdvisors.find((a) => a.id === id);
  const busy = typing !== null || mixing;
  const total = sumUsage(messages.map((m) => m.usage));
  const hasAnswer = messages.some((m) => m.role !== "student");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, mixing, error]);

  // Task 5: the FRONTEND runs the turn loop. One POST /chat/reply per advisor, in `order`,
  // appending each reply to the history before the next call.
  async function runRound(hist: Message[], queue: Advisor[]) {
    setError(null);
    let h = hist;
    for (let i = 0; i < queue.length; i++) {
      const a = queue[i]!;
      setTyping(a);
      try {
        const reply = await chatReply({ advisor_id: a.id, group: ordered.map((x) => x.id), language: lang, history: h });
        h = [...h, reply];
        setMessages(h);
      } catch (e) {
        setTyping(null);
        setError(errorMessage(e, lang));
        const rest = queue.slice(i);
        retryRef.current = () => runRound(h, rest); // resume from the advisor that failed
        return;
      }
    }
    setTyping(null);
  }

  // Task 6: Mixture = one aggregated answer.
  async function runMixture(hist: Message[]) {
    setError(null);
    setMixing(true);
    try {
      const res = await mixture({ advisors: ordered.map((a) => a.id), language: lang, history: hist });
      setMessages([...hist, res.message]);
    } catch (e) {
      setError(errorMessage(e, lang));
      retryRef.current = () => runMixture(hist);
    } finally {
      setMixing(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const hist: Message[] = [...messages, { id: uid(), role: "student", text, created_at: new Date().toISOString() }];
    setMessages(hist);
    if (mode === "mixture") await runMixture(hist);
    else await runRound(hist, ordered);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 bg-shark-900 p-3 text-white">
        <button onClick={onBack} aria-label={t(lang, "back")}>←</button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {mode === "mixture" ? `🧪 ${t(lang, "mixture")}` : ordered.map((a) => a.emoji).join(" ")}
          </div>
          <div className="text-[11px] text-slate-300">
            {t(lang, "total")}: {fmtTokens(total.tokens)} {t(lang, "tokens")} · {fmtCost(total.cost)}
          </div>
        </div>
      </header>

      <div aria-live="polite" className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-chat-bg p-3">
        {messages.length === 0 && <p className="mt-6 text-center text-sm text-slate-500">{t(lang, "emptyChat")}</p>}

        {messages.map((m) => {
          if (m.role === "student")
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-chat-student px-3 py-2 text-sm shadow-sm">
                  <Markdown text={m.text} />
                </div>
              </div>
            );
          const a = byId(m.advisor_id);
          const isAgg = m.role === "aggregator";
          const color = isAgg ? "#0b2a47" : (a?.color ?? "#64748b");
          return (
            <div key={m.id} className="flex">
              <div
                className="max-w-[90%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm shadow-sm"
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <div className="mb-0.5 text-xs font-bold" style={{ color }}>
                  {isAgg ? `🧪 ${t(lang, "mixture")}` : `${a?.emoji ?? ""} ${a?.name ?? m.advisor_id}`}
                </div>
                <Markdown text={m.text} />
                {isAgg && m.contributors && (
                  <div className="mt-1 text-[10px] text-slate-500">
                    {t(lang, "builtBy")}: {m.contributors.map((id) => byId(id)?.name ?? id).join(", ")}
                  </div>
                )}
                {m.usage && <UsageBadge usage={m.usage} lang={lang} />}
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex">
            <div className="rounded-2xl bg-white px-3 py-2 text-xs italic shadow-sm" style={{ color: typing.color }}>
              {typing.emoji} {t(lang, "typing", { name: typing.name })}
            </div>
          </div>
        )}
        {mixing && (
          <div className="flex">
            <div className="rounded-2xl bg-white px-3 py-2 text-xs italic text-slate-600 shadow-sm">
              🧪 {t(lang, "typing", { name: t(lang, "mixture") })}
            </div>
          </div>
        )}
        {error && <ErrorBox lang={lang} message={error} onRetry={() => void retryRef.current?.()} />}
        <div ref={endRef} />
      </div>

      <footer className="border-t border-slate-200 bg-white p-2">
        {/* Task 7: available in both modes once there is at least one answer */}
        {hasAnswer && !busy && (
          <button
            onClick={onReady}
            className="mb-2 w-full rounded-full bg-emerald-600 py-2 text-sm font-semibold text-white"
          >
            {t(lang, "readyDeeper")} →
          </button>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void send()}
            placeholder={t(lang, "typeMessage")}
            disabled={busy}
            className="min-w-0 flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-shark-500 disabled:bg-slate-50"
          />
          <button
            onClick={() => void send()}
            disabled={busy || !input.trim()}
            className="rounded-full bg-shark-600 px-4 text-sm font-semibold text-white disabled:bg-slate-300"
          >
            {t(lang, "send")}
          </button>
        </div>
      </footer>
    </div>
  );
}
