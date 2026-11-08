# Task 8 — Deploy on Vercel

1. vercel.com → Add New → Project → import the GitHub repo.
2. **Root Directory: `frontend`** (Vercel only builds this folder, which is why `mock/` is committed).
3. Environment variables (Production + Preview):
   - `NEXT_PUBLIC_USE_MOCK=true` (switch to `false` in task 11)
   - `NEXT_PUBLIC_API_URL=<Piero's backend URL>` (can wait until ~1:00 AM)
   - `NEXT_PUBLIC_HOST_ORIGIN=https://www.mdc.edu`
4. Deploy. Send the URL to **Adrian** (his `PANEL_ORIGIN`) and **Piero** (CORS).
5. Verify the header: `curl -sI https://<your-app>.vercel.app | grep -i content-security-policy`
   → `frame-ancestors https://*.mdc.edu http://localhost:*`
6. Never add `SWARMS_API_KEY` to Vercel env vars for this project.
