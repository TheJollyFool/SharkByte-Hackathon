import { ApiError } from "./api";
import { t } from "./i18n";
import type { Language } from "./types";

/** Friendly, translated message for any thrown error. Never exposes `source: fallback` or internals. */
export function errorMessage(e: unknown, lang: Language): string {
  if (e instanceof ApiError) {
    if (e.code === "network") return t(lang, "errorNetwork");
    if (e.code === "timeout") return t(lang, "errorTimeout");
  }
  return t(lang, "errorGeneric");
}
