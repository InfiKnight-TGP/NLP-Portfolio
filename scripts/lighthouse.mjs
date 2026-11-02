// Mobile Lighthouse against a running production server (npm run build && npm start).
// Usage: node scripts/lighthouse.mjs [url] [runs]
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000";
const runs = Number(process.argv[3] ?? 1);
const dir = mkdtempSync(join(tmpdir(), "lh-"));

for (let i = 0; i < runs; i++) {
  const out = join(dir, `run${i}.json`);
  execFileSync(
    "npx",
    ["--yes", "lighthouse@latest", url, "--quiet", "--chrome-flags=--headless=new",
      "--only-categories=performance,accessibility,best-practices", "--output=json", `--output-path=${out}`],
    { env: { ...process.env, CHROME_PATH: chromium.executablePath() }, stdio: "inherit", shell: true },
  );
  const r = JSON.parse(readFileSync(out, "utf8"));
  const score = (k) => Math.round(r.categories[k].score * 100);
  console.log(
    `run ${i + 1}: performance ${score("performance")}, accessibility ${score("accessibility")}, ` +
      `best practices ${score("best-practices")} | LCP ${r.audits["largest-contentful-paint"].displayValue}, ` +
      `CLS ${r.audits["cumulative-layout-shift"].displayValue}, TBT ${r.audits["total-blocking-time"].displayValue}`,
  );
  for (const a of Object.values(r.audits)) {
    if (a.score === 0 && ["binary", "numeric", "metricSavings"].includes(a.scoreDisplayMode)) console.log(`   ${a.id}: ${a.title}`);
  }
}
