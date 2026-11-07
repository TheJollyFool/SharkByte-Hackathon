# frontend/

Next.js app. Not scaffolded yet. From the repo root:

```bash
rm frontend/README.md   # create-next-app needs an empty folder
npx create-next-app@latest frontend --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*"
```

Then follow the frontend conventions in [AGENTS.md](../AGENTS.md) and the layout in
[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md). Build against `shared/fixtures/` with `NEXT_PUBLIC_USE_MOCK=true`.
