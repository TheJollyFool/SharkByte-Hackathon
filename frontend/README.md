# frontend/ — panel app

Next.js app shown inside the extension's panel (iframe, ~400 px wide). Not scaffolded yet. From the repo root:

```bash
rm frontend/README.md   # create-next-app needs an empty folder
npx create-next-app@latest frontend --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*"
```

Then follow the panel conventions in [AGENTS.md](../AGENTS.md), the layout in
[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) and the contracts in [docs/CONTRACTS.md](../docs/CONTRACTS.md).
Build against `shared/fixtures/` with `NEXT_PUBLIC_USE_MOCK=true`. Works standalone at `localhost:3000` too.
