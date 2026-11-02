// Animation review: drives key interactions and captures frame sequences as contact sheets.
// Usage: node scripts/frames.mjs [baseUrl] [outDir] [scenario]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "qa/frames";
const only = process.argv[4];
mkdirSync(out, { recursive: true });

async function capture(page, clip, n, gap = 30) {
  const frames = [];
  for (let i = 0; i < n; i++) {
    frames.push(await page.screenshot({ clip }));
    await page.waitForTimeout(gap);
  }
  return frames;
}

async function sheet(name, frames, clip, cols = 6) {
  const scale = Math.min(1, 1600 / cols / clip.width);
  const w = Math.round(clip.width * scale);
  const h = Math.round(clip.height * scale);
  const rows = Math.ceil(frames.length / cols);
  const tiles = await Promise.all(frames.map((f) => sharp(f).resize(w, h).toBuffer()));
  await sharp({ create: { width: w * cols, height: h * rows, channels: 3, background: "#777" } })
    .composite(tiles.map((input, i) => ({ input, left: (i % cols) * w, top: Math.floor(i / cols) * h })))
    .png()
    .toFile(`${out}/${name}.png`);
  console.log(`${name}: ${frames.length} frames`);
}

async function box(page, selector) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  return el.boundingBox();
}

const scenarios = {
  // Hero words rising in on load.
  async hero(page) {
    await page.goto(base, { waitUntil: "commit" });
    await page.waitForSelector("#hero-title");
    const clip = { x: 0, y: 0, width: page.viewportSize().width, height: 700 };
    await sheet("hero-reveal", await capture(page, clip, 18, 20), clip);
  },
  // Flick the star field left, watch momentum + rubber-band settle.
  async flick(page) {
    const b = await box(page, '[aria-label^="Star field"]');
    const clip = { x: b.x, y: b.y, width: b.width, height: b.height };
    const cy = b.y + b.height * 0.85;
    await page.mouse.move(b.x + b.width * 0.8, cy);
    await page.mouse.down();
    for (let i = 1; i <= 6; i++) {
      await page.mouse.move(b.x + b.width * 0.8 - i * 45, cy);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await sheet("stars-flick", await capture(page, clip, 18, 40), clip);
  },
  // Drag past the left edge (rubber-band), then release.
  async rubberband(page) {
    const b = await box(page, '[aria-label^="Star field"]');
    const clip = { x: b.x, y: b.y, width: b.width, height: b.height };
    const cy = b.y + b.height * 0.85;
    await page.mouse.move(b.x + 40, cy);
    await page.mouse.down();
    const frames = [];
    for (let i = 1; i <= 6; i++) {
      await page.mouse.move(b.x + 40 + i * 60, cy, { steps: 3 });
      frames.push(await page.screenshot({ clip }));
    }
    await page.waitForTimeout(80);
    await page.mouse.up();
    frames.push(...(await capture(page, clip, 12, 40)));
    await sheet("stars-rubberband", frames, clip);
  },
  // Tap a star: sheet grows from it; then Escape shrinks it back.
  async sheet(page) {
    const star = page.locator('[aria-label^="Star field"] button').nth(1);
    await star.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const vp = page.viewportSize();
    const clip = { x: 0, y: 0, width: vp.width, height: vp.height };
    await star.click();
    const open = await capture(page, clip, 10, 30);
    await page.keyboard.press("Escape");
    const close = await capture(page, clip, 8, 30);
    await sheet("star-sheet", [...open, ...close], clip, 6);
  },
  // Drag the sheet down to dismiss.
  async sheetdrag(page) {
    const star = page.locator('[aria-label^="Star field"] button').nth(2);
    await star.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await star.click();
    await page.waitForTimeout(600);
    const s = await page.locator('[role="dialog"]').boundingBox();
    const vp = page.viewportSize();
    const clip = { x: 0, y: 0, width: vp.width, height: vp.height };
    await page.mouse.move(s.x + s.width / 2, s.y + 30);
    await page.mouse.down();
    const frames = [];
    for (let i = 1; i <= 5; i++) {
      await page.mouse.move(s.x + s.width / 2, s.y + 30 + i * 40);
      await page.waitForTimeout(16);
      frames.push(await page.screenshot({ clip }));
    }
    await page.mouse.up();
    frames.push(...(await capture(page, clip, 10, 30)));
    await sheet("sheet-drag-dismiss", frames, clip);
  },
  // Snap carousel: flick to the next cards.
  async carousel(page) {
    const b = await box(page, '[aria-roledescription="carousel"]');
    if (!b) return;
    const clip = { x: 0, y: b.y, width: page.viewportSize().width, height: b.height };
    const cy = b.y + b.height / 2;
    await page.mouse.move(b.x + b.width * 0.7, cy);
    await page.mouse.down();
    for (let i = 1; i <= 5; i++) {
      await page.mouse.move(b.x + b.width * 0.7 - i * 40, cy);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await sheet("carousel-flick", await capture(page, clip, 14, 40), clip);
  },
  // Vector playground: drag the point around the origin.
  async vectors(page) {
    const b = await box(page, "#vector-plane");
    if (!b) return;
    const h = await page.locator("#vector-handle").boundingBox();
    const clip = { x: b.x, y: b.y - 10, width: b.width, height: Math.min(b.height + 260, 900) };
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
    await page.mouse.down();
    const frames = [];
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI;
      await page.mouse.move(b.x + b.width / 2 + Math.cos(a) * b.width * 0.35, b.y + b.height / 2 - Math.sin(a) * b.height * 0.35, { steps: 2 });
      frames.push(await page.screenshot({ clip }));
    }
    await page.mouse.up();
    await sheet("vector-drag", frames, clip, 4);
  },
  // Flip the class-interaction cards.
  async flip(page) {
    const card = page.locator("#class button").first();
    if (!(await card.count())) return;
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const b = await card.boundingBox();
    const clip = { x: Math.max(0, b.x - 20), y: b.y - 20, width: b.width + 40, height: b.height + 40 };
    await card.click();
    await sheet("card-flip", await capture(page, clip, 12, 30), clip);
  },
};

const browser = await chromium.launch();
for (const [name, run] of Object.entries(scenarios)) {
  if (only && !only.split(",").includes(name)) continue;
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  if (name !== "hero") await page.goto(base, { waitUntil: "networkidle" });
  try {
    await run(page);
  } catch (e) {
    console.log(`${name}: FAILED ${e.message.split("\n")[0]}`);
  }
  await page.close();
}
await browser.close();
