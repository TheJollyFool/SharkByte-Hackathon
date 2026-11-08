// postMessage wrapper for the Extension <-> Panel contract (CONTRACTS.md section A).
// Safe to call anywhere: no-ops when not inside an iframe, and checks event.origin on receive.
import type { IncomingSharkMessage, OutgoingSharkMessage } from "./types";

// Origin of the page embedding us. Panel accepts only https://*.mdc.edu (+ localhost for dev).
const HOST_ORIGIN = process.env.NEXT_PUBLIC_HOST_ORIGIN ?? "https://www.mdc.edu";

export function inIframe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.parent !== window;
  } catch {
    return true; // cross-origin access threw => we are framed
  }
}

function isAllowedOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    if (u.protocol === "https:" && (u.hostname === "mdc.edu" || u.hostname.endsWith(".mdc.edu"))) return true;
    if (u.protocol === "http:" && u.hostname === "localhost") return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function sendToHost(msg: OutgoingSharkMessage): void {
  if (!inIframe()) return;
  window.parent.postMessage({ source: "shark", ...msg }, HOST_ORIGIN);
}

export const bridge = {
  ready: () => sendToHost({ type: "shark:ready" }),
  close: () => sendToHost({ type: "shark:close" }),
  startGuide: (goal: Extract<OutgoingSharkMessage, { type: "shark:start_guide" }>["goal"], language: "en" | "es") =>
    sendToHost({ type: "shark:start_guide", goal, language }),
  openUrl: (url: string) => sendToHost({ type: "shark:open_url", url }),
};

/** Subscribe to messages from the extension. Returns an unsubscribe function. */
export function onHostMessage(handler: (msg: IncomingSharkMessage) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (event: MessageEvent) => {
    if (!isAllowedOrigin(event.origin)) return;
    const data = event.data as { source?: string; type?: string } | null;
    if (!data || data.source !== "shark" || typeof data.type !== "string") return;
    if (data.type === "shark:guide_finished" || data.type === "shark:page_context") {
      handler(data as unknown as IncomingSharkMessage);
    }
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}