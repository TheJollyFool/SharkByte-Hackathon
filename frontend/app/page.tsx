"use client";
import { useEffect, useState } from "react";
import ModePicker from "@/components/ModePicker";
import { bridge } from "@/lib/shark-bridge";
import type { Language, Mode } from "@/lib/types";

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    bridge.ready();
  }, []);

  if (!mode) return <ModePicker lang={lang} onLang={setLang} onPick={setMode} />;
  return (
    <div className="p-4 text-sm">
      <button className="mb-3 text-shark-600 underline" onClick={() => setMode(null)}>
        ← Back
      </button>
      Mode selected: <b>{mode}</b>. Next: advisor picker (task 4).
    </div>
  );
}
