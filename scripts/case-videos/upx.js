// UPX cover clip (8 s loop) in three acts, each made out of the previous one:
//   1. SPEED   stacked browser windows in 3D load a page while four quality scores climb to 100
//   2. VITALS  the window opens into a performance panel: request waterfall, Core Web Vitals, rising score
//   3. GLOBAL  a turning globe of language routes, a result climbing to first place, canonical tags typed
// No logos or brand names; every number is illustrative. Pure function of time,
// so frame 0 equals frame `duration`. Loaded by scripts/case-video.ts, after kit.js.

const kit = window.createKit({ accent: "#1a88ff", accentSoft: "rgba(26,136,255,0.35)", duration: 8 });
const { W, H, BG, WHITE, LINE, DIM, FAINT, SANS, ACCENT, ACCENT_SOFT, DURATION } = kit;
const { clamp01, lerp, spring, expoIn, expoOut, phase, life, track, fmt } = kit;
const { text, typed, seg, frame, hatch, squash, polyline, lit } = kit;

// ---------------------------------------------------------------- browser in 3D

// Window drawn in its own pixel space (1200 x 760) on a plane in 3D: 400 px = 1 unit.
const BW = 1200;
const BH = 760;

function browserSpace(view, z) {
  const project = kit.projector(view, { F: 2600, D: 12, pitch: view.pitch, pivotY: 0 });
  const at = (x, y) => project((x - BW / 2) / 400, (BH / 2 - y) / 400, z);
  const quad = (ctx, x, y, w, h) => {
    const pts = [at(x, y), at(x + w, y), at(x + w, y + h), at(x, y + h)];
    ctx.beginPath();
    pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.closePath();
  };
  return {
    at,
    stroke(ctx, x, y, w, h) {
      quad(ctx, x, y, w, h);
      ctx.stroke();
    },
    fill(ctx, x, y, w, h) {
      quad(ctx, x, y, w, h);
      ctx.fill();
    },
    line(ctx, x0, y0, x1, y1) {
      const a = at(x0, y0);
      const b = at(x1, y1);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    },
    text(ctx, s, x, y, o) {
      const o0 = at(x, y);
      const ox = at(x + 1, y);
      const oy = at(x, y + 1);
      ctx.save();
      ctx.setTransform(ox.x - o0.x, ox.y - o0.y, oy.x - o0.x, oy.y - o0.y, o0.x, o0.y);
      text(ctx, s, 0, 0, o);
      ctx.restore();
    },
  };
}

// Page skeleton blocks, in load order.
const BLOCKS = [
  [40, 76, 1120, 56], // nav
  [40, 160, 640, 60], // headline
  [40, 236, 520, 24],
  [40, 272, 440, 24],
  [40, 324, 180, 52], // button
  [720, 160, 440, 300], // hero image
  [40, 500, 350, 220], // cards
  [425, 500, 350, 220],
  [810, 500, 350, 220],
];

// Draws one browser window; `load` reveals the page blocks in order.
function drawBrowser(ctx, view, z, { outline, load, front }) {
  const B = browserSpace(view, z);
  ctx.fillStyle = "rgba(11,11,13,0.94)";
  B.fill(ctx, 0, 0, BW, BH);
  if (front) {
    lit(ctx, () => B.stroke(ctx, 0, 0, BW, BH), 2.6);
  } else {
    ctx.strokeStyle = DIM;
    ctx.lineWidth = 1.5;
    B.stroke(ctx, 0, 0, BW, BH);
  }
  if (outline < 1 || !front) return;
  // Chrome: tab dots and address bar.
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.5;
  B.line(ctx, 0, 52, BW, 52);
  for (let i = 0; i < 3; i++) {
    const c = B.at(30 + i * 26, 26);
    ctx.beginPath();
    ctx.arc(c.x, c.y, 6 * view.s, 0, Math.PI * 2);
    ctx.stroke();
  }
  B.stroke(ctx, 130, 12, 760, 28);
  B.text(ctx, "https://exemplo.com/pt", 150, 32, { size: 16, color: WHITE, track: 0.04 });
  // Load bar across the top.
  ctx.fillStyle = ACCENT;
  B.fill(ctx, 0, 50, BW * load, 4);
  BLOCKS.forEach(([x, y, w, h], i) => {
    const r = phase(load, i / BLOCKS.length, (i + 1.6) / BLOCKS.length);
    if (r <= 0) return;
    ctx.strokeStyle = i === 4 ? ACCENT : LINE;
    ctx.lineWidth = 1.5;
    B.stroke(ctx, x, y, w * r, h);
    if (i === 5 || i >= 6) {
      ctx.strokeStyle = FAINT;
      for (let k = 1; k < 6; k++) B.line(ctx, x, y + (h * k) / 6, x + w * r, y + (h * k) / 6);
    }
    if (i === 1)
      B.text(ctx, typed("RÁPIDO EM QUALQUER LUGAR", r * 1.3), x + 14, y + 44, {
        size: 34,
        weight: 700,
        family: SANS,
        color: WHITE,
        track: 0,
      });
  });
}

const swayYaw = (u) => -0.38 + 0.05 * u;
function browserView(t) {
  const segs = (a, b, c) => [{ f: () => a }, { t: 2.3, f: () => b, w: 9 }, { t: 7.2, f: () => c, w: 9 }];
  return {
    yaw: track(t, [
      { f: (u) => swayYaw(u) },
      { t: 2.3, f: () => 0, w: 9 },
      { t: 7.2, f: (u) => swayYaw(u - DURATION), w: 9 },
    ]),
    pitch: track(t, segs(0.16, 0, 0.16)),
    cx: track(t, segs(900, 960, 900)),
    cy: track(t, segs(520, 540, 520)),
    s: track(t, segs(1, 1.35, 1)),
  };
}

function browsers(ctx, t) {
  if (t > 3.0 && t < 7.2) return;
  const view = browserView(t);
  const load = t < 3 ? expoOut(phase(t, 0.25, 1.9)) : 0;
  const depth = t < 3 ? 1 - expoIn(phase(t, 2.2, 2.7)) : spring(t - 7.25, 10);
  // Folds away (squashed flat) as the performance panel opens.
  squash(ctx, 540, t < 3 ? 1 - expoIn(phase(t, 2.55, 2.95)) : 1, () => {
    for (let k = 2; k >= 1; k--) {
      if (depth > 0.02) drawBrowser(ctx, view, k * 0.75 * depth, { outline: 1, load: 0, front: false });
    }
    drawBrowser(ctx, view, 0, { outline: t < 3 ? 1 : spring(t - 7.25, 10), load, front: true });
  });
}

// Quality scores next to the window: four rings filling to 100.
function scores(ctx, t) {
  const L = life(t, 0.35, 2.3, 12);
  squash(ctx, 540, L, () => {
    ["PERFORMANCE", "ACESSIBILIDADE", "BOAS PRÁTICAS", "SEO"].forEach((label, i) => {
      const cx = 1640;
      const cy = 200 + i * 205;
      const v = expoOut(phase(t, 0.5 + i * 0.15, 1.9 + i * 0.1));
      const n = Math.round(lerp(38 + i * 9, 100, v));
      ctx.lineWidth = 8;
      ctx.strokeStyle = FAINT;
      ctx.beginPath();
      ctx.arc(cx, cy, 66, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = ACCENT;
      ctx.beginPath();
      ctx.arc(cx, cy, 66, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * n) / 100);
      ctx.stroke();
      text(ctx, String(n), cx, cy + 14, {
        size: 40,
        weight: 700,
        family: SANS,
        color: WHITE,
        align: "center",
        track: 0,
      });
      text(ctx, label, cx - 96, cy + 6, { size: 15, align: "right" });
    });
  });
}

// ---------------------------------------------------------------- act 2: vitals

const REQUESTS = [
  ["document", 0, 0.12, 14],
  ["main.css", 0.1, 0.12, 9],
  ["entry.js", 0.12, 0.18, 42],
  ["fonts.woff2", 0.14, 0.14, 21],
  ["hero.avif", 0.2, 0.2, 38],
  ["route-home.js", 0.3, 0.1, 12],
  ["i18n/pt.json", 0.32, 0.06, 4],
  ["route-blog.js", 0.62, 0.1, 9],
  ["cards.avif", 0.66, 0.16, 24],
];

function vitals(ctx, t) {
  if (t < 2.5 || t > 5.9) return;
  const OUT = 5.1;

  // Request waterfall: lazy route chunks start late, after the first paint.
  let L = life(t, 2.65, OUT);
  squash(ctx, 330, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 150, 120, 1000, 420, L.p);
    text(ctx, "REDE · CARREGAMENTO", 176, 162, { size: 16, weight: 700, color: WHITE });
    text(ctx, "LCP", 176 + 260 + 0.42 * 600, 162, { size: 14, color: ACCENT, align: "center" });
    ctx.strokeStyle = ACCENT;
    ctx.setLineDash([6, 6]);
    seg(ctx, 436 + 0.42 * 600, 176, 436 + 0.42 * 600, 520, L.p);
    ctx.setLineDash([]);
    REQUESTS.forEach(([name, start, dur, kb], i) => {
      const y = 204 + i * 36;
      const r = phase(t, 2.8 + start * 1.6, 2.8 + (start + dur) * 1.6);
      text(ctx, name, 176, y + 6, { size: 14, color: i >= 5 ? ACCENT : LINE, track: 0.04 });
      text(ctx, `${kb} kB`, 420, y + 6, { size: 13, color: DIM, align: "right", track: 0.02 });
      ctx.fillStyle = i >= 5 ? ACCENT : "rgba(255,255,255,0.55)";
      if (r > 0) ctx.fillRect(436 + start * 600, y - 8, Math.max(2, dur * 600 * r), 16);
    });
  });

  // Core Web Vitals.
  const metrics = [
    ["LCP", 1.2, "s", 1],
    ["INP", 64, "ms", 0],
    ["CLS", 0.01, "", 2],
  ];
  metrics.forEach(([name, value, unit, digits], i) => {
    const M = life(t, 2.8 + i * 0.1, OUT);
    const x = 1190 + 0;
    const y = 120 + i * 145;
    squash(ctx, y + 62, M, () => {
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 2;
      frame(ctx, x, y, 580, 125, M.p);
      text(ctx, name, x + 24, y + 40, { size: 18, weight: 700, color: WHITE });
      text(ctx, "BOM", x + 556, y + 40, { size: 14, weight: 700, color: ACCENT, align: "right" });
      const k = expoOut(phase(t, 3.0 + i * 0.12, 4.2));
      text(ctx, `${fmt(value * (0.3 + 0.7 * k), digits)} ${unit}`, x + 24, y + 98, {
        size: 44,
        weight: 700,
        family: SANS,
        color: WHITE,
        track: 0,
      });
      // Share of good visits, filling up.
      const good = (0.6 + 0.35 * k) * 300;
      ctx.fillStyle = ACCENT;
      ctx.fillRect(x + 256, y + 82, good, 12);
      ctx.fillStyle = FAINT;
      ctx.fillRect(x + 256 + good, y + 82, 300 - good, 12);
      text(ctx, `${fmt((good / 300) * 100)}% BOAS`, x + 556, y + 70, { size: 13, align: "right" });
    });
  });

  // Performance score per release: a line climbing to 99.
  L = life(t, 2.95, OUT);
  squash(ctx, 770, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 150, 580, 1620, 400, L.p);
    text(ctx, "PERFORMANCE POR RELEASE", 176, 622, { size: 16, weight: 700, color: WHITE });
    const reveal = expoOut(phase(t, 3.1, 4.7));
    const values = [52, 58, 61, 70, 74, 81, 86, 90, 94, 97, 99];
    const left = 200;
    const right = 1720;
    const base = 930;
    const y = (v) => base - ((v - 40) / 60) * 260;
    for (const g of [50, 75, 90, 100]) {
      ctx.strokeStyle = g === 90 ? ACCENT_SOFT : FAINT;
      ctx.lineWidth = 1;
      seg(ctx, left, y(g), right, y(g), L.p);
      text(ctx, String(g), left - 14, y(g) + 5, { size: 12, color: DIM, align: "right" });
    }
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const u = i / 100;
      if (u > reveal) break;
      const f = u * (values.length - 1);
      const a = Math.min(values.length - 2, Math.floor(f));
      pts.push([lerp(left, right, u), y(lerp(values[a], values[a + 1], f - a))]);
    }
    if (pts.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0][0], base);
      pts.forEach(([x, yy]) => ctx.lineTo(x, yy));
      ctx.lineTo(pts[pts.length - 1][0], base);
      ctx.clip();
      ctx.strokeStyle = ACCENT_SOFT;
      ctx.lineWidth = 1;
      hatch(ctx, left, base - 280, right - left, 280, 8);
      ctx.restore();
      lit(ctx, () => polyline(ctx, pts), 3);
      const [hx, hy] = pts[pts.length - 1];
      ctx.fillStyle = ACCENT;
      ctx.fillRect(hx - 7, hy - 7, 14, 14);
      const shown = Math.round(lerp(values[0], 99, reveal));
      text(ctx, String(shown), hx - 16, hy - 20, { size: 22, weight: 700, color: WHITE, align: "right" });
    }
    values.forEach((_, i) => {
      text(ctx, `v${i + 1}`, lerp(left, right, i / (values.length - 1)), base + 30, {
        size: 12,
        color: DIM,
        align: "center",
      });
    });
  });
}

// ---------------------------------------------------------------- act 3: global

// Language routes pinned around the globe, spread evenly in longitude.
const ROUTES = ["/en", "/pt", "/es", "/de", "/fr", "/ja"].map((label, i) => [
  label,
  [0.5, -0.4, 0.2, 0.7, -0.15, 0.35][i],
  (i * Math.PI) / 3,
]);
const RESULTS = ["exemplo.com", "concorrente-a.com", "portal-b.com.br", "guia-c.com", "blog-d.dev"];

function global(ctx, t) {
  if (t < 5.0 || t > 7.6) return;
  const grow = spring(t - 5.15, 8) * (1 - expoIn(phase(t, 6.85, 7.3)));
  const OUT = 6.9;
  if (grow > 0.01) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(605, 90, 710, 920);
    ctx.clip();
    const R = 2.1 * grow;
    const project = kit.projector({ yaw: t * 0.45, cx: 960, cy: 560, s: 1, pitch: 0.35 }, { F: 1500, D: 9, pivotY: 0 });
    const sph = (lat, lon) => [R * Math.cos(lat) * Math.cos(lon), R * Math.sin(lat), R * Math.cos(lat) * Math.sin(lon)];
    ctx.lineWidth = 1.2;
    for (let i = -5; i <= 5; i++) {
      const lat = (i / 6) * (Math.PI / 2);
      ctx.strokeStyle = i === 0 ? LINE : DIM;
      kit.path3(
        ctx,
        project,
        Array.from({ length: 49 }, (_, k) => sph(lat, (k / 48) * Math.PI * 2)),
      );
    }
    for (let j = 0; j < 12; j++) {
      const lon = (j / 12) * Math.PI;
      ctx.strokeStyle = DIM;
      kit.path3(
        ctx,
        project,
        Array.from({ length: 49 }, (_, k) => sph((k / 48) * Math.PI * 2, lon)),
      );
    }
    lit(
      ctx,
      () =>
        kit.path3(
          ctx,
          project,
          Array.from({ length: 61 }, (_, k) => sph(0.35 * Math.sin(k * 0.3), (k / 60) * Math.PI * 2)),
        ),
      2,
    );
    ROUTES.forEach(([label, lat, lon]) => {
      const [x, y, z] = sph(lat, lon);
      const p = project(x, y, z);
      const tip = project(x * 1.18, y * 1.18, z * 1.18);
      const front = p.depth < 9;
      ctx.strokeStyle = front ? WHITE : DIM;
      ctx.lineWidth = 1.5;
      seg(ctx, p.x, p.y, tip.x, tip.y);
      ctx.fillStyle = front ? ACCENT : DIM;
      ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
      text(ctx, label, tip.x + 8, tip.y - 6, { size: 18, weight: 700, color: front ? WHITE : DIM });
    });
    ctx.restore();
  }

  // Search results: our page climbs from fifth to first.
  let L = life(t, 5.35, OUT);
  squash(ctx, 400, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 1330, 120, 440, 560, L.p);
    text(ctx, "RANKING ORGÂNICO", 1354, 162, { size: 16, weight: 700, color: WHITE });
    const climb = spring(t - 5.7, 6);
    RESULTS.forEach((site, i) => {
      const ours = i === 0;
      const from = ours ? 4 : i - 1;
      const to = i;
      const slot = lerp(from, to, climb);
      const y = 210 + slot * 94;
      ctx.strokeStyle = ours ? ACCENT : DIM;
      ctx.lineWidth = ours ? 3 : 1.5;
      ctx.strokeRect(1354, y, 392, 78);
      text(ctx, `#${Math.round(slot) + 1}`, 1372, y + 32, { size: 16, weight: 700, color: ours ? ACCENT : LINE });
      text(ctx, site, 1424, y + 32, { size: 15, color: ours ? WHITE : LINE, track: 0.04 });
      ctx.strokeStyle = ours ? LINE : FAINT;
      ctx.lineWidth = 1.5;
      seg(ctx, 1424, y + 56, 1424 + (ours ? 290 : 200 - i * 20), y + 56);
    });
  });

  // Impressions climbing.
  L = life(t, 5.45, OUT);
  squash(ctx, 830, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 1330, 710, 440, 270, L.p);
    text(ctx, "IMPRESSÕES", 1354, 750, { size: 15 });
    const r = expoOut(phase(t, 5.6, 6.7));
    text(ctx, `+${fmt(184 * r)}%`, 1746, 750, { size: 18, weight: 700, color: ACCENT, align: "right" });
    for (let i = 0; i < 10; i++) {
      const h = (30 + 150 * Math.pow(i / 9, 1.5)) * spring(t - 5.6 - i * 0.05, 14);
      if (h < 1) continue;
      ctx.strokeStyle = i === 9 ? ACCENT : LINE;
      ctx.strokeRect(1354 + i * 40, 960 - h, 28, h);
      ctx.strokeStyle = i === 9 ? ACCENT_SOFT : FAINT;
      ctx.lineWidth = 1;
      hatch(ctx, 1354 + i * 40, 960 - h, 28, h, 6);
      ctx.lineWidth = 2;
    }
  });

  // Head tags typed out.
  L = life(t, 5.4, OUT);
  squash(ctx, 550, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 150, 120, 440, 860, L.p);
    text(ctx, "<head>", 174, 166, { size: 16, weight: 700, color: WHITE });
    const tags = [
      ['<link rel="canonical"', '  href="/pt" />'],
      ['<link rel="alternate"', '  hreflang="en" href="/" />'],
      ['<link rel="alternate"', '  hreflang="es" href="/es" />'],
      ['<meta name="description"', '  content="..." />'],
      ['<meta property="og:locale"', '  content="pt_BR" />'],
      ['<script type="ld+json">', "  { ... }"],
    ];
    tags.forEach(([a, b], i) => {
      const p = phase(t, 5.55 + i * 0.14, 5.85 + i * 0.14);
      const y = 222 + i * 112;
      text(ctx, typed(a, p * 1.4), 174, y, { size: 15, color: i === 0 ? ACCENT : LINE, track: 0.02 });
      text(ctx, typed(b, p * 1.4 - 0.4), 174, y + 28, { size: 15, color: WHITE, track: 0.02 });
    });
    text(ctx, "</head>", 174, 930, { size: 16, weight: 700, color: WHITE });
  });
}

function draw(ctx, t) {
  t = ((t % DURATION) + DURATION) % DURATION;
  kit.background(ctx);
  global(ctx, t);
  vitals(ctx, t);
  browsers(ctx, t);
  scores(ctx, t);
  kit.hud(ctx, t, ["SPEED", "VITALS", "GLOBAL"]);
}

window.scene = { width: W, height: H, duration: DURATION, fps: 30, bitrate: 1_600_000, draw };
