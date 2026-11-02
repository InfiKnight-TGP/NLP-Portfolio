// Scene QA: contact sheets of the scroll-choreographed scenes.
// Usage: node scripts/scenes.mjs <baseUrl> <outDir> <scene...>
//   scene = hero | <id of a PinnedScene wrapper>, e.g. stars-scene case-scene fisher-scene hands-scene
// Each sheet: rows = light / dark / reduced (light), columns = progress 0, 25, 50, 75, 100 %
// (hero: rows of intro timeline frames, then scroll-recede frames).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const [base = "http://localhost:3000", out = "qa/scenes", ...scenes] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const WIDTHS = [
  { w: 390, h: 844 },
  { w: 1440, h: 900 },
];
const VARIANTS = [
  { name: "light", colorScheme: "light", reducedMotion: "no-preference" },
  { name: "dark", colorScheme: "dark", reducedMotion: "no-preference" },
  { name: "reduced", colorScheme: "light", reducedMotion: "reduce" },
];
const PROGRESS = [0, 0.25, 0.5, 0.75, 1];

async function grid(file, rows, tileW) {
  const first = await sharp(rows[0][0]).metadata();
  const scale = tileW / first.width;
  const w = Math.round(first.width * scale);
  const h = Math.round(first.height * scale);
  const cols = Math.max(...rows.map((r) => r.length));
  const tiles = [];
  for (const [ri, row] of rows.entries())
    for (const [ci, buf] of row.entries())
      tiles.push({ input: await sharp(buf).resize(w, h).toBuffer(), left: ci * (w + 6), top: ri * (h + 6) });
  await sharp({ create: { width: cols * (w + 6), height: rows.length * (h + 6), channels: 3, background: "#808080" } })
    .composite(tiles)
    .png()
    .toFile(file);
  console.log("wrote", file);
}

const browser = await chromium.launch();
const errors = [];

async function open(vp, v) {
  const page = await browser.newPage({
    viewport: { width: vp.w, height: vp.h },
    colorScheme: v.colorScheme,
    reducedMotion: v.reducedMotion,
    hasTouch: vp.w < 1000,
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return page;
}

async function scrollTo(page, y) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(700); // let scroll-linked springs settle
}

for (const scene of scenes) {
  for (const vp of WIDTHS) {
    const rows = [];
    for (const v of VARIANTS) {
      const page = await open(vp, v);
      const row = [];
      if (scene === "hero") {
        await page.goto(base, { waitUntil: "commit" });
        for (const t of [250, 700, 1100, 1450, 1800, 2600]) {
          const now = await page.evaluate(() => performance.now()).catch(() => 0);
          if (t > now) await page.waitForTimeout(t - now);
          row.push(await page.screenshot());
        }
        await page.waitForLoadState("networkidle");
        const hh = await page.evaluate(() => document.getElementById("top").offsetHeight);
        for (const p of [0.25, 0.5, 0.75, 1]) {
          await scrollTo(page, hh * p);
          row.push(await page.screenshot());
        }
      } else {
        await page.goto(base, { waitUntil: "networkidle" });
        const { top, span } = await page.evaluate((id) => {
          const el = document.getElementById(id);
          const r = el.getBoundingClientRect();
          return { top: r.top + scrollY, span: Math.max(0, el.offsetHeight - innerHeight) };
        }, scene);
        // Approach first so the lazy scene mounts, then step through progress.
        await scrollTo(page, Math.max(0, top - vp.h));
        await page.waitForTimeout(500);
        for (const p of PROGRESS) {
          await scrollTo(page, top + span * p);
          row.push(await page.screenshot());
        }
      }
      rows.push(row);
      await page.close();
    }
    await grid(`${out}/${scene}-${vp.w}.png`, rows, vp.w === 390 ? 230 : 380);
  }
}
await browser.close();
if (errors.length) {
  console.log(`${errors.length} console errors:`);
  [...new Set(errors)].slice(0, 5).forEach((e) => console.log("  ", e.slice(0, 300)));
  process.exit(1);
}
