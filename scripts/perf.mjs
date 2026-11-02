// Interaction smoothness at 4x CPU throttle: long tasks during load and during scrolling/dragging,
// frame-time percentiles, and the top functions by self time (CPU profile) during load.
// Usage: node scripts/perf.mjs [baseUrl] [width] [height]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const width = Number(process.argv[3] ?? 390);
const height = Number(process.argv[4] ?? 844);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, hasTouch: false });
await page.addInitScript(() => {
  window.__long = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__long.push({ start: Math.round(e.startTime), dur: Math.round(e.duration) });
  }).observe({ type: "longtask", buffered: true });
});
const cdp = await page.context().newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
await cdp.send("Profiler.start");
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(4000);
const { profile } = await cdp.send("Profiler.stop");

// Self time per function.
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map();
const dt = profile.timeDeltas;
profile.samples.forEach((id, i) => {
  const n = byId.get(id);
  const f = n.callFrame;
  if (["(idle)", "(program)", "(garbage collector)", "(root)"].includes(f.functionName)) return;
  const key = `${f.functionName || "(anonymous)"} ${f.url.split("/").pop()}:${f.lineNumber}`;
  self.set(key, (self.get(key) ?? 0) + (dt[i] ?? 0) / 1000);
});
const loadLong = await page.evaluate(() => window.__long.splice(0));
console.log(`load (4x CPU, ${width}x${height}): ${loadLong.length} long tasks, total ${loadLong.reduce((a, t) => a + t.dur, 0)} ms`);
loadLong.forEach((t) => console.log(`   at ${t.start} ms: ${t.dur} ms`));
console.log("top self time during load:");
[...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([k, v]) => console.log(`   ${v.toFixed(0).padStart(5)} ms  ${k.slice(0, 110)}`));

// Interaction: scroll the whole page in wheel steps, then drag the star field and the carousel.
await page.evaluate(() => {
  window.__frames = [];
  let last = performance.now();
  const tick = (t) => {
    window.__frames.push(t - last);
    last = t;
    window.__raf = requestAnimationFrame(tick);
  };
  window.__raf = requestAnimationFrame(tick);
});
await page.mouse.move(width / 2, height / 2);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 120) {
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(16);
}
for (const sel of ['[aria-label^="Star field"]', '[aria-roledescription="carousel"]']) {
  const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  if (!b) continue;
  await page.mouse.move(b.x + b.width * 0.7, b.y + b.height * 0.8);
  await page.mouse.down();
  for (let i = 1; i <= 20; i++) {
    await page.mouse.move(b.x + b.width * 0.7 - i * 15, b.y + b.height * 0.8);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(800);
}
const { frames, long } = await page.evaluate(() => {
  cancelAnimationFrame(window.__raf);
  return { frames: window.__frames.slice(1), long: window.__long };
});
frames.sort((a, b) => a - b);
const pct = (p) => frames[Math.min(frames.length - 1, Math.floor(frames.length * p))].toFixed(1);
console.log(`interaction: ${frames.length} frames, median ${pct(0.5)} ms, p95 ${pct(0.95)} ms, p99 ${pct(0.99)} ms, max ${frames.at(-1).toFixed(0)} ms`);
console.log(`   frames over 33 ms: ${frames.filter((f) => f > 33.4).length}; long tasks: ${long.length}${long.length ? ` (max ${Math.max(...long.map((t) => t.dur))} ms)` : ""}`);
await browser.close();
