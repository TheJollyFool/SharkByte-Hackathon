import type { Usage } from "./types";

export const fmtCost = (usd: number): string => (usd < 0.01 ? `$${usd.toFixed(4)}` : `$${usd.toFixed(2)}`);
export const fmtMoney = (usd: number): string => `$${Math.round(usd).toLocaleString("en-US")}`;
export const fmtTokens = (n: number): string => n.toLocaleString("en-US");

export function sumUsage(items: (Usage | undefined)[]): { tokens: number; cost: number } {
  return items.reduce(
    (acc, u) => (u ? { tokens: acc.tokens + u.total_tokens, cost: acc.cost + u.cost_usd } : acc),
    { tokens: 0, cost: 0 },
  );
}
