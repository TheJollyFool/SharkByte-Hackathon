# Task 11 — Real backend integration

1. In Vercel (or `.env.local`): `NEXT_PUBLIC_USE_MOCK=false`, `NEXT_PUBLIC_API_URL=<Piero's URL>`; redeploy.
2. Smoke test the backend first:
   ```bash
   curl $API/health                      # {"status":"ok","demo_mode":...}
   curl $API/advisors | head -c 300
   ```
3. In the panel, walk the whole flow and watch the browser Network tab:
   - `/advisors` on load
   - one `/chat/reply` per advisor, in `order`, each request's `history` includes the previous replies
   - `/mixture` (one call) in Mixture mode
   - `/roadmap` on "ready" (15–60 s; the loader shows)
4. CORS error in the console? Ask Piero to allow your Vercel origin.
5. A 502/504 shows a friendly error with "Try again" (no internals leaked). `source: fallback` is never displayed.
6. `getHealth()` in `lib/api.ts` is available if you want a startup check.
