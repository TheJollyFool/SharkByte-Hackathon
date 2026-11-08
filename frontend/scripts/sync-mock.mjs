// Copies data/advisors.json and shared/fixtures/* from the repo root into frontend/mock/
// (Vercel only builds frontend/, so it cannot read outside it). Commit the result.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const mock = resolve(here, "..", "mock");
mkdirSync(mock, { recursive: true });

const advisors = join(root, "data", "advisors.json");
const fixtures = join(root, "shared", "fixtures");

if (existsSync(advisors)) {
  cpSync(advisors, join(mock, "advisors.json"));
  console.log("[sync-mock] data/advisors.json -> mock/advisors.json");
} else {
  console.log("[sync-mock] data/advisors.json not found, keeping committed copy");
}
if (existsSync(fixtures)) {
  cpSync(fixtures, join(mock, "fixtures"), { recursive: true });
  console.log("[sync-mock] shared/fixtures -> mock/fixtures");
} else {
  console.log("[sync-mock] shared/fixtures not found, keeping committed copy");
}
