// Renders a case-study cover clip from scripts/case-videos/<id>.js into
// public/videos/<id>.mp4 plus a poster (<id>.webp, the first frame). Run it
// manually after changing a scene:
//
//   pnpm video webmotors            encode the clip and its poster
//   pnpm video webmotors --stills   only write a few PNG frames to test-results/case-video
//
// Frames are drawn on a canvas and encoded to H.264 with WebCodecs inside
// Google Chrome (Chromium builds have no H.264 encoder), with exact timestamps
// so the loop is seamless. The MP4 muxer is loaded from jsDelivr at a pinned
// version: this is a manual tool, so it stays out of the project's dependencies.
// Needs network access for the muxer and the Google Fonts stylesheet.
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const [id, flag] = process.argv.slice(2);
if (!id || !/^[a-z0-9-]+$/.test(id)) {
  console.error("usage: pnpm video <case-id> [--stills]");
  process.exit(1);
}

const root = new URL("../", import.meta.url);
const FONTS =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700&display=block";
const kit = await readFile(new URL("scripts/case-videos/kit.js", root), "utf8");
const scene = await readFile(new URL(`scripts/case-videos/${id}.js`, root), "utf8");

// Runs in the page. Kept as a string so this Node-only file needs no DOM typings.
// Wrapped in a block: classic scripts share one global scope with the scene.
const encoder = `{
  const { width, height, duration, fps, draw, bitrate = 1_400_000 } = window.scene;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const toBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  };

  window.still = (t, type = "image/png") => {
    draw(ctx, t);
    return canvas.toDataURL(type, 0.82).split(",")[1];
  };

  window.encode = async () => {
    const { Muxer, ArrayBufferTarget } = await import("https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.2/+esm");
    const target = new ArrayBufferTarget();
    const muxer = new Muxer({ target, video: { codec: "avc", width, height, frameRate: fps }, fastStart: "in-memory" });
    // High profile, level 4.0: enough for 1080p30 and supported everywhere.
    const config = { codec: "avc1.640028", width, height, bitrate, framerate: fps };
    const { supported } = await VideoEncoder.isConfigSupported(config);
    if (!supported) throw new Error("H.264 encoder not available in this browser");

    let failure;
    const videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: (error) => (failure = error),
    });
    videoEncoder.configure(config);
    const frames = Math.round(duration * fps);
    for (let i = 0; i < frames; i++) {
      draw(ctx, i / fps);
      const frame = new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / fps), duration: Math.round(1e6 / fps) });
      videoEncoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
      frame.close();
      while (videoEncoder.encodeQueueSize > 8) await new Promise((resolve) => setTimeout(resolve, 5));
    }
    await videoEncoder.flush();
    if (failure) throw failure;
    muxer.finalize();
    return toBase64(target.buffer);
  };
}`;

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage();
  // A secure origin of our own (served by the route below) so the page can
  // import the muxer as an ES module and use WebCodecs.
  const origin = "https://case-video.localhost/";
  await page.route(origin, (route) =>
    route.fulfill({
      contentType: "text/html",
      // The site's typefaces, so labels drawn on the canvas match the page.
      body: `<!doctype html><title>case video</title><link rel="stylesheet" href="${FONTS}" />`,
    }),
  );
  await page.goto(origin);
  await page.addScriptTag({ content: kit });
  await page.addScriptTag({ content: scene });
  await page.addScriptTag({ content: encoder });
  await page.evaluate(
    `Promise.all(["500", "700"].flatMap((w) => [document.fonts.load(w + ' 20px "JetBrains Mono"'), document.fonts.load(w + ' 20px "Space Grotesk"')]))`,
  );
  const duration = await page.evaluate<number>("window.scene.duration");

  if (flag === "--stills") {
    const dir = new URL("test-results/case-video/", root);
    await mkdir(dir, { recursive: true });
    for (let i = 0; i < 12; i++) {
      const t = (duration * i) / 12;
      const data = await page.evaluate<string>(`window.still(${t})`);
      await writeFile(new URL(`${id}-${t.toFixed(1)}.png`, dir), Buffer.from(data, "base64"));
    }
    console.log(`case-video: wrote stills to ${fileURLToPath(dir)}`);
  } else {
    const dir = new URL("public/videos/", root);
    await mkdir(dir, { recursive: true });
    const video = await page.evaluate<string>("window.encode()");
    const output = new URL(`${id}.mp4`, dir);
    await writeFile(output, Buffer.from(video, "base64"));
    const poster = await page.evaluate<string>(`window.still(0, "image/webp")`);
    await writeFile(new URL(`${id}.webp`, dir), Buffer.from(poster, "base64"));
    console.log(`case-video: wrote ${fileURLToPath(output)} (${Math.round(video.length * 0.75) / 1000} kB) and poster`);
  }
} finally {
  await browser.close();
}
