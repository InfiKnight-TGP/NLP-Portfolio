// Visual QA: full-page screenshots across viewports, colour schemes and motion settings.
// Usage: node scripts/shots.mjs [baseUrl] [outDir] [filter]
//   e.g. node scripts/shots.mjs http://localhost:3000 qa/shots 390
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "qa/shots";
const filter = process.argv[4] ?? "";
mkdirSync(out, { recursive: true });

const viewports = [
  { w: 390, h: 844 },
  { w: 768, h: 1024 },
  { w: 1440, h: 900 },
];
const browser = await chromium.launch();
let failures = 0;

for (const vp of viewports) {
  for (const scheme of ["light", "dark"]) {
    for (const motion of ["no-preference", "reduce"]) {
      const name = `${vp.w}-${scheme}-${motion === "reduce" ? "reduced" : "motion"}`;
      if (filter && !name.includes(filter)) continue;
      const page = await browser.newPage({
        viewport: { width: vp.w, height: vp.h },
        deviceScaleFactor: 1,
        colorScheme: scheme,
        reducedMotion: motion,
        hasTouch: vp.w < 1000,
      });
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(base, { waitUntil: "networkidle" });
      // Walk the page so in-view reveals fire, then return to the top.
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += vp.h / 2) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
        await page.waitForTimeout(120);
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(800);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
      const status = [overflow && "HORIZONTAL OVERFLOW", errors.length && `${errors.length} console errors`]
        .filter(Boolean)
        .join(", ");
      if (status) failures++;
      console.log(`${name}: ${status || "ok"}`);
      errors.slice(0, 3).forEach((e) => console.log("   ", e.slice(0, 300)));
      await page.close();
    }
  }
}
await browser.close();
process.exit(failures ? 1 : 0);
