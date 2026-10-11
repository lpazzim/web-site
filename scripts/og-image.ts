// Regenerates public/og-image.png (1200x630) from the same generative art as the
// project covers. Run manually with `pnpm og` after changing the visual identity;
// the PNG is committed because social crawlers need a static file.
//
// Needs Chromium (`pnpm exec playwright install chromium`) and network access
// for the Google Fonts stylesheet; offline it falls back to system sans-serif.
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { generateCover } from "../src/lib/cover-art.ts";

const WIDTH = 1200;
const HEIGHT = 630;
const ACCENT = "#33e0ff";

const { paths } = generateCover("lpazzim.com", { width: WIDTH, height: HEIGHT }, "mesh");

const lines = paths
  .map((path) => `<path d="${path.d}" opacity="${path.opacity}" vector-effect="non-scaling-stroke"/>`)
  .join("");

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=JetBrains+Mono:wght@500&display=swap"
    />
    <style>
      * { margin: 0; box-sizing: border-box; }
      body {
        width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; position: relative;
        background: #0f0f0f; color: #f5f5f5; font-family: "Space Grotesk", system-ui, sans-serif;
      }
      .grid {
        position: absolute; inset: 0;
        background-image: linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px);
        background-size: 64px 64px;
        mask-image: radial-gradient(ellipse at center, black, transparent 78%);
      }
      .glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 110%, rgba(51,224,255,.35), transparent 60%); }
      svg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .copy { position: absolute; left: 72px; top: 72px; right: 72px; }
      .mono { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 20px; letter-spacing: .18em; text-transform: uppercase; color: #9a9a9a; }
      h1 { margin-top: 28px; font-size: 128px; line-height: .9; font-weight: 600; letter-spacing: -.04em; text-transform: uppercase; }
      h1 span { color: ${ACCENT}; }
      .url { position: absolute; left: 72px; bottom: 56px; color: ${ACCENT}; }
    </style>
  </head>
  <body>
    <div class="grid"></div>
    <div class="glow"></div>
    <svg viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" stroke="${ACCENT}" stroke-width="1.2">${lines}</svg>
    <div class="copy">
      <p class="mono">Senior Frontend Engineer</p>
      <h1>Lucas<br /><span>Pazzim</span></h1>
    </div>
    <p class="mono url">lpazzim.com</p>
  </body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.setContent(html, { waitUntil: "networkidle" });
  // A string keeps this Node-only file free of DOM typings.
  await page.evaluate("document.fonts.ready");
  const output = fileURLToPath(new URL("../public/og-image.png", import.meta.url));
  await page.screenshot({ path: output });
  console.log(`og-image: wrote ${output}`);
} finally {
  await browser.close();
}
