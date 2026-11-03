// Records a full-page scroll with Playwright, then samples frames from the recording into a
// contact sheet for review (the .webm is played back in Chromium and screenshotted).
// Usage: node scripts/scroll-video.mjs [baseUrl] [outDir] [width] [height]
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "qa/video";
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
mkdirSync(out, { recursive: true });
const name = `scroll-${width}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width, height }, recordVideo: { dir: out, size: { width, height } } });
const page = await ctx.newPage();
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(2500); // let the hero intro play
await page.mouse.move(width / 2, height / 2);
const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
// A steady, human-paced wheel scroll: 90 px every 40 ms.
for (let y = 0; y < total; y += 90) {
  await page.mouse.wheel(0, 90);
  await page.waitForTimeout(40);
}
await page.waitForTimeout(1200);
const video = page.video();
await ctx.close();
const raw = await video.path();
const file = join(out, `${name}.webm`);
renameSync(raw, file);
console.log("recorded", file);

// Review: play it back and grab evenly spaced frames.
const viewer = await browser.newPage({ viewport: { width, height } });
const src = `data:video/webm;base64,${readFileSync(resolve(file)).toString("base64")}`;
await viewer.setContent(`<video id=v muted style="width:${width}px;height:${height}px" src="${src}"></video>`);
const duration = await viewer.evaluate(
  () =>
    new Promise((resolve) => {
      const v = document.getElementById("v");
      // MediaRecorder webm files report Infinity until seeked to the end.
      const go = () => {
        if (isFinite(v.duration)) return resolve(v.duration);
        v.ondurationchange = () => isFinite(v.duration) && resolve(v.duration);
        v.currentTime = 1e9;
      };
      if (v.readyState >= 1) go();
      else v.onloadedmetadata = go;
    }),
);
const N = 24;
const shots = [];
for (let i = 0; i < N; i++) {
  const t = (duration * (i + 0.5)) / N;
  await viewer.evaluate((time) => new Promise((r) => { const v = document.getElementById("v"); v.onseeked = () => r(); v.currentTime = time; }), t);
  shots.push(await sharp(await viewer.screenshot()).resize(Math.round(width / 4)).toBuffer());
}
const tw = Math.round(width / 4);
const th = Math.round(height / 4);
await sharp({ create: { width: tw * 6, height: th * 4, channels: 3, background: "#808080" } })
  .composite(shots.map((input, i) => ({ input, left: (i % 6) * tw, top: Math.floor(i / 6) * th })))
  .png()
  .toFile(join(out, `${name}-sheet.png`));
console.log(`duration ${duration.toFixed(1)} s; sheet ${join(out, `${name}-sheet.png`)}`, readdirSync(out).join(", "));
await browser.close();
