// Treeunfe cover clip (8 s loop) in three acts, each made out of the previous one:
//   1. INVOICE  an electronic invoice (DANFE layout) fills in on a tilted sheet and gets authorised
//   2. VOLUME   the sheet joins a stream of invoices passing a scanner; counters and charts climb
//   3. DEPLOY   CI/CD pipeline and a zero-downtime stack migration, then the empty sheet returns
// No logos or brand names; every number is illustrative. Pure function of time,
// so frame 0 equals frame `duration`. Loaded by scripts/case-video.ts, after kit.js.

const kit = window.createKit({ accent: "#2bab6f", accentSoft: "rgba(43,171,111,0.35)", duration: 8 });
const { W, H, WHITE, LINE, DIM, FAINT, SANS, ACCENT, ACCENT_SOFT, DURATION } = kit;
const { clamp01, lerp, spring, expoIn, expoOut, phase, life, track, fmt } = kit;
const { text, typed, seg, frame, hatch, squash, polyline, lit } = kit;

const ACT = DURATION / 3;

// Deterministic pseudo-random numbers (barcode widths, QR cells).
const noise = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------- the sheet

// Sheet drawn in its own pixel space (630 x 891, A4 ratio) and mapped onto a
// plane in 3D: 300 sheet pixels = 1 unit.
const SW = 630;
const SH = 891;

function sheetSpace(view) {
  const project = kit.projector(view, { F: 2500, D: 11, pitch: view.pitch, pivotY: 0 });
  const at = (x, y) => project((x - SW / 2) / 300, (SH / 2 - y) / 300, 0);
  return {
    line(ctx, x0, y0, x1, y1, p = 1) {
      if (p <= 0) return;
      const a = at(x0, y0);
      const b = at(lerp(x0, x1, p), lerp(y0, y1, p));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    },
    rect(ctx, x, y, w, h, p = 1) {
      if (p <= 0) return;
      const pts = [at(x, y), at(x + w, y), at(x + w, y + h), at(x, y + h)];
      const total = 2 * (w + h);
      let left = total * p;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      const sides = [w, h, w, h];
      for (let i = 0; i < 4 && left > 0; i++) {
        const k = Math.min(1, left / sides[i]);
        const a = pts[i];
        const b = pts[(i + 1) % 4];
        ctx.lineTo(lerp(a.x, b.x, k), lerp(a.y, b.y, k));
        left -= sides[i];
      }
      ctx.stroke();
    },
    fill(ctx, x, y, w, h) {
      const pts = [at(x, y), at(x + w, y), at(x + w, y + h), at(x, y + h)];
      ctx.beginPath();
      pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
      ctx.closePath();
      ctx.fill();
    },
    // Text laid on the sheet: a local affine transform follows the perspective.
    text(ctx, s, x, y, o = {}) {
      const o0 = at(x, y);
      const ox = at(x + 1, y);
      const oy = at(x, y + 1);
      ctx.save();
      ctx.setTransform(ox.x - o0.x, ox.y - o0.y, oy.x - o0.x, oy.y - o0.y, o0.x, o0.y);
      text(ctx, s, 0, 0, o);
      ctx.restore();
    },
    at,
  };
}

const ACCESS_KEY = "3526 1012 3456 7800 0190 5500 1000 1284 4210 0012 8442";
const ITEMS = [
  ["SERVIÇO DE CONSULTORIA", "1", "4.200,00"],
  ["LICENÇA DE SOFTWARE", "3", "2.940,00"],
  ["SUPORTE MENSAL", "1", "1.850,00"],
  ["TREINAMENTO", "2", "1.640,00"],
  ["INTEGRAÇÃO API", "1", "1.850,00"],
];

// Draws the invoice. `border` is the outline progress, `fill` reveals the
// content top to bottom, `stamp` slams the authorisation stamp.
function drawSheet(ctx, view, { border, fill, stamp }) {
  const S = sheetSpace(view);
  ctx.lineWidth = 2;
  lit(ctx, () => S.rect(ctx, 0, 0, SW, SH, border), 2.4);
  if (fill <= 0) return;
  const step = (a, b) => phase(fill, a, b);

  // Header.
  let p = step(0, 0.15);
  ctx.strokeStyle = LINE;
  S.rect(ctx, 20, 20, 590, 120, p);
  S.line(ctx, 330, 20, 330, 140, p);
  S.text(ctx, typed("DANFE", p * 2), 40, 72, { size: 40, weight: 700, family: SANS, color: WHITE, track: 0.04 });
  S.text(ctx, typed("DOCUMENTO AUXILIAR DA", p * 1.6), 40, 100, { size: 13 });
  S.text(ctx, typed("NOTA FISCAL ELETRÔNICA", p * 1.6), 40, 120, { size: 13 });
  S.text(ctx, typed("NF-e Nº 000.128.442", p * 1.5), 350, 62, { size: 17, weight: 700, color: WHITE, track: 0.06 });
  S.text(ctx, typed("SÉRIE 001 · FOLHA 1/1", p * 1.5), 350, 90, { size: 13 });
  S.text(ctx, typed("0 - ENTRADA  1 - SAÍDA", p * 1.5), 350, 118, { size: 13 });

  // Barcode and access key.
  p = step(0.12, 0.3);
  ctx.fillStyle = WHITE;
  let x = 24;
  for (let i = 0; x < 24 + 582 * p; i++) {
    const w = 1.5 + Math.floor(noise(i) * 3) * 1.5;
    if (i % 2 === 0) S.fill(ctx, x, 156, w, 52);
    x += w + 1.5;
  }
  S.text(ctx, "CHAVE DE ACESSO", 20, 232, { size: 12 });
  S.text(ctx, typed(ACCESS_KEY, p), 20, 252, { size: 13, color: WHITE, track: 0.06 });

  // Issuer and recipient.
  p = step(0.25, 0.42);
  ctx.strokeStyle = DIM;
  S.rect(ctx, 20, 270, 290, 92, p);
  S.rect(ctx, 320, 270, 290, 92, p);
  S.text(ctx, "EMITENTE", 34, 294, { size: 12 });
  S.text(ctx, "DESTINATÁRIO", 334, 294, { size: 12 });
  ctx.strokeStyle = LINE;
  for (const [x0, w0] of [
    [34, 230],
    [334, 200],
  ]) {
    S.line(ctx, x0, 318, x0 + w0, 318, p);
    S.line(ctx, x0, 338, x0 + w0 * 0.7, 338, p);
  }

  // Items table, one row at a time.
  p = step(0.4, 0.5);
  ctx.strokeStyle = LINE;
  S.line(ctx, 20, 390, 610, 390, p);
  S.text(ctx, "DESCRIÇÃO", 24, 382, { size: 12 });
  S.text(ctx, "QTD", 440, 382, { size: 12 });
  S.text(ctx, "VALOR", 606, 382, { size: 12, align: "right" });
  ITEMS.forEach(([desc, qty, value], i) => {
    const r = step(0.45 + i * 0.06, 0.55 + i * 0.06);
    if (r <= 0) return;
    const y = 422 + i * 40;
    S.text(ctx, typed(desc, r * 1.4), 24, y, { size: 15, color: WHITE, track: 0.05 });
    S.text(ctx, qty, 452, y, { size: 15, color: r > 0.6 ? WHITE : DIM, align: "center" });
    S.text(ctx, r > 0.6 ? value : "", 606, y, { size: 15, color: WHITE, align: "right", track: 0.04 });
    ctx.strokeStyle = FAINT;
    S.line(ctx, 20, y + 14, 610, y + 14, r);
  });

  // Totals and QR block.
  p = step(0.8, 1);
  ctx.strokeStyle = LINE;
  S.rect(ctx, 20, 700, 590, 90, p);
  S.text(ctx, "VALOR TOTAL DA NOTA", 36, 728, { size: 12 });
  S.text(ctx, `R$ ${fmt(12480 * p, 2)}`, 596, 774, {
    size: 34,
    weight: 700,
    family: SANS,
    color: WHITE,
    align: "right",
    track: 0,
  });
  ctx.fillStyle = LINE;
  for (let i = 0; i < 100; i++) {
    if (noise(i + 50) > 0.5 && i / 100 < p) S.fill(ctx, 22 + (i % 10) * 8, 806 + Math.floor(i / 10) * 8, 7, 7);
  }
  S.text(ctx, "PROTOCOLO 135 2600 1284 4221", 120, 836, { size: 12, color: p > 0.5 ? LINE : FAINT });
  S.text(ctx, "AMBIENTE: PRODUÇÃO", 120, 860, { size: 12, color: p > 0.5 ? LINE : FAINT });

  // Authorisation stamp.
  if (stamp > 0) {
    const s = lerp(1.6, 1, stamp);
    const c = S.at(450, 645);
    const u = S.at(451, 645);
    const v = S.at(450, 646);
    ctx.save();
    ctx.setTransform(u.x - c.x, u.y - c.y, v.x - c.x, v.y - c.y, c.x, c.y);
    ctx.rotate(-0.12);
    ctx.scale(s, s);
    ctx.globalAlpha = clamp01(stamp * 2);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 4;
    ctx.strokeRect(-130, -38, 260, 76);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-122, -30, 244, 60);
    text(ctx, "AUTORIZADA", 22, 12, {
      size: 30,
      weight: 700,
      family: SANS,
      color: ACCENT,
      align: "center",
      track: 0.08,
    });
    ctx.lineWidth = 5;
    seg(ctx, -104, 0, -94, 12);
    seg(ctx, -94, 12, -76, -12);
    ctx.restore();
  }
}

// Sheet camera: a slow sway, back to the same pose at the end of the loop.
const swayYaw = (u) => -0.42 + 0.06 * u;
function sheetView(t) {
  const segs = (a, b, c) => [{ f: () => a }, { t: 2.35, f: () => b, w: 9 }, { t: 7.25, f: () => c, w: 9 }];
  return {
    yaw: track(t, [
      { f: (u) => swayYaw(u) },
      { t: 2.35, f: () => 0, w: 9 },
      { t: 7.25, f: (u) => swayYaw(u - DURATION), w: 9 },
    ]),
    pitch: track(t, segs(0.22, 0, 0.22)),
    cx: track(t, segs(960, 960, 960)),
    cy: track(t, segs(560, 600, 560)),
    s: track(t, segs(1, 0.2, 1)),
  };
}

function sheet(ctx, t) {
  const view = sheetView(t);
  if (t < 3.1) {
    drawSheet(ctx, view, {
      border: 1,
      fill: phase(t, 0.15, 1.7),
      stamp: t > 1.75 ? spring(t - 1.75, 18) : 0,
    });
  } else if (t > 7.2) {
    drawSheet(ctx, view, { border: spring(t - 7.25, 10), fill: 0, stamp: 0 });
  }
  // Callouts around the sheet in the first act.
  const L = life(t, 0.5, 2.2, 12);
  squash(ctx, 540, L, () => {
    const S = sheetSpace(view);
    const callout = (sx, sy, dx, label, value) => {
      const a = S.at(sx, sy);
      const bx = a.x + dx;
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1.5;
      seg(ctx, a.x, a.y, bx, a.y, L.p);
      ctx.fillStyle = ACCENT;
      ctx.fillRect(a.x - 4, a.y - 4, 8, 8);
      const align = dx < 0 ? "right" : "left";
      const tx = bx + (dx < 0 ? -12 : 12);
      text(ctx, label, tx, a.y - 8, { size: 15, align });
      text(ctx, value, tx, a.y + 18, { size: 18, weight: 700, color: WHITE, align });
    };
    callout(20, 182, -260, "VALIDAÇÃO SEFAZ", "OK · 118 ms");
    callout(610, 330, 230, "SCHEMA", "v4.00 · ZOD");
    callout(20, 745, -240, "IMPOSTOS", "CALCULADOS");
  });
}

// ---------------------------------------------------------------- act 2: volume

const LANES = [-2.4, -1.2, 0, 1.2, 2.4];
const SPACING = 2.6;
// Invoices travel towards the camera through a scanner at z = 3.
function stream(ctx, t) {
  if (t < 2.5 || t > 5.9) return;
  const appear = spring(t - 2.6, 8);
  const leave = expoIn(phase(t, 5.15, 5.6));
  if (appear <= 0.01 || leave >= 1) return;
  const project = kit.projector({ yaw: 0, cx: 960, cy: 520, s: 1, pitch: 0.32 }, { F: 1500, D: 9, pivotY: 0.9 });
  const travel = (t - 2.6) * 5.2;
  const scanZ = 3;
  // Kept between the two side panels.
  ctx.save();
  ctx.beginPath();
  ctx.rect(590, 0, 740, H);
  ctx.clip();

  // Conveyor rails and the scanner gate.
  ctx.lineWidth = 1.5;
  for (const x of [-3.1, 3.1]) {
    ctx.strokeStyle = DIM;
    kit.path3(ctx, project, [
      [x, 0, -3],
      [x, 0, 34 * appear],
    ]);
  }
  for (let z = -2 + (travel % 2); z < 34 * appear; z += 2) {
    ctx.strokeStyle = FAINT;
    kit.path3(ctx, project, [
      [-3.1, 0, z],
      [3.1, 0, z],
    ]);
  }
  lit(
    ctx,
    () =>
      kit.path3(ctx, project, [
        [-3.3, 0, scanZ],
        [-3.3, 1.9, scanZ],
        [3.3, 1.9, scanZ],
        [3.3, 0, scanZ],
      ]),
    3,
  );

  // Invoices standing on the belt.
  const docs = [];
  LANES.forEach((x, lane) => {
    for (let k = 0; k < 14; k++) {
      const z = 34 - ((k * SPACING + lane * 0.9 + travel) % (14 * SPACING));
      docs.push({ x, z, id: lane * 14 + k });
    }
  });
  docs.sort((a, b) => b.z - a.z);
  for (const { x, z, id } of docs) {
    if (z < -2.5 || z > 33 * appear) continue;
    const drop = lerp(0, -3, leave);
    const corners = [
      [x - 0.42, 0.1 + drop, z],
      [x + 0.42, 0.1 + drop, z],
      [x + 0.42, 1.3 + drop, z],
      [x - 0.42, 1.3 + drop, z],
    ];
    const passed = z < scanZ;
    ctx.fillStyle = "rgba(11,11,13,0.92)";
    const q = corners.map(([a, b, c]) => project(a, b, c));
    ctx.beginPath();
    q.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = passed ? ACCENT : z > 20 ? DIM : LINE;
    ctx.lineWidth = passed ? 2 : 1.2;
    ctx.stroke();
    if (z > 22) continue;
    ctx.strokeStyle = z > 12 ? FAINT : DIM;
    ctx.lineWidth = 1;
    for (let r = 0; r < 4; r++) {
      const y = 1.12 - r * 0.2 + drop;
      kit.path3(ctx, project, [
        [x - 0.32, y, z],
        [x + (r === 0 ? 0.05 : 0.32 - noise(id + r) * 0.3), y, z],
      ]);
    }
    if (passed) {
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 3;
      const a = project(x + 0.08, 0.36 + drop, z);
      const b = project(x + 0.16, 0.27 + drop, z);
      const c = project(x + 0.32, 0.47 + drop, z);
      polyline(ctx, [
        [a.x, a.y],
        [b.x, b.y],
        [c.x, c.y],
      ]);
    }
  }
  ctx.restore();
}

function volumePanels(ctx, t) {
  if (t < 2.6 || t > 5.9) return;
  const OUT = 5.1;

  // Live log on the left.
  let L = life(t, 2.75, OUT);
  squash(ctx, 560, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 150, 120, 420, 860, L.p);
    text(ctx, "EMISSÕES EM TEMPO REAL", 172, 160, { size: 16, weight: 700, color: WHITE });
    ctx.save();
    ctx.beginPath();
    ctx.rect(150, 180, 420, 790);
    ctx.clip();
    const scroll = (t - 2.75) * 160;
    for (let i = 0; i < 26; i++) {
      const y = 220 + i * 44 - (scroll % 44);
      const n = 128442 + i + Math.floor(scroll / 44);
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      seg(ctx, 172, y + 16, 548, y + 16);
      text(ctx, `NF-e ${String(n).padStart(9, "0")}`, 172, y, { size: 15, color: WHITE, track: 0.06 });
      text(ctx, `${80 + Math.floor(noise(n) * 90)} ms`, 470, y, { size: 14, align: "right", track: 0.04 });
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 2.5;
      seg(ctx, 516, y - 6, 522, y);
      seg(ctx, 522, y, 534, y - 13);
    }
    ctx.restore();
  });

  // Counters and a climbing throughput chart on the right.
  L = life(t, 2.9, OUT);
  squash(ctx, 560, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 1350, 120, 420, 860, L.p);
    const k = expoOut(phase(t, 2.9, 4.9));
    text(ctx, "NOTAS EMITIDAS HOJE", 1372, 166, { size: 15 });
    text(ctx, fmt(1284902 * (0.2 + 0.8 * k)), 1372, 226, {
      size: 50,
      weight: 700,
      family: SANS,
      color: WHITE,
      track: 0,
    });

    text(ctx, "USUÁRIOS SIMULTÂNEOS", 1372, 300, { size: 15 });
    const users = Math.round(1000 * expoOut(phase(t, 3.0, 4.6)));
    text(ctx, `${fmt(users)}+`, 1748, 300, { size: 18, weight: 700, color: ACCENT, align: "right" });
    for (let i = 0; i < 40; i++) {
      const on = i < users / 25;
      ctx.fillStyle = on ? ACCENT : FAINT;
      ctx.fillRect(1372 + (i % 10) * 38, 322 + Math.floor(i / 10) * 30, 30, 22);
    }

    text(ctx, "NOTAS / MINUTO", 1372, 490, { size: 15 });
    const base = 760;
    const pts = [];
    const reveal = expoOut(phase(t, 3.1, 4.8));
    for (let i = 0; i <= 50; i++) {
      const u = i / 50;
      if (u > reveal) break;
      pts.push([1372 + 376 * u, base - 20 - 200 * Math.pow(u, 1.4) - 10 * Math.sin(u * 23) * u]);
    }
    ctx.strokeStyle = DIM;
    seg(ctx, 1372, base, 1748, base);
    for (let g = 1; g <= 3; g++) {
      ctx.strokeStyle = FAINT;
      seg(ctx, 1372, base - g * 70, 1748, base - g * 70);
    }
    if (pts.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0][0], base);
      pts.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(pts[pts.length - 1][0], base);
      ctx.clip();
      ctx.strokeStyle = ACCENT_SOFT;
      ctx.lineWidth = 1;
      hatch(ctx, 1372, 500, 376, 260, 8);
      ctx.restore();
      lit(ctx, () => polyline(ctx, pts), 3);
      const [hx, hy] = pts[pts.length - 1];
      ctx.fillStyle = ACCENT;
      ctx.fillRect(hx - 6, hy - 6, 12, 12);
    }
    text(ctx, `${fmt(4800 * reveal)}/min`, 1748, 490, { size: 18, weight: 700, color: WHITE, align: "right" });

    text(ctx, "ERROS", 1372, 830, { size: 15 });
    text(ctx, "0,00%", 1748, 830, { size: 18, weight: 700, color: ACCENT, align: "right" });
    text(ctx, "FILA", 1372, 880, { size: 15 });
    text(ctx, "ESTÁVEL", 1748, 880, { size: 18, weight: 700, color: WHITE, align: "right" });
    text(ctx, "P95", 1372, 930, { size: 15 });
    text(ctx, "142 ms", 1748, 930, { size: 18, weight: 700, color: WHITE, align: "right" });
  });
}

// ---------------------------------------------------------------- act 3: deploy

function deploy(ctx, t) {
  if (t < 5.2 || t > 7.6) return;
  const OUT = 7.0;
  const STAGES = ["COMMIT", "BUILD", "TESTES", "DEPLOY"];

  // Pipeline.
  let L = life(t, 5.35, OUT);
  squash(ctx, 250, L, () => {
    text(ctx, "PIPELINE CI/CD · NUVEM", 150, 160, { size: 16, weight: 700, color: WHITE });
    STAGES.forEach((stage, i) => {
      const x = 150 + i * 430;
      const done = spring(t - 5.5 - i * 0.28, 16);
      ctx.strokeStyle = done > 0.5 ? ACCENT : LINE;
      ctx.lineWidth = done > 0.5 ? 3 : 2;
      frame(ctx, x, 200, 330, 110, L.p);
      text(ctx, stage, x + 24, 246, { size: 18, weight: 700, color: WHITE });
      text(ctx, done > 0.5 ? `${(12 + i * 17) % 60}s · OK` : "AGUARDANDO", x + 24, 284, {
        size: 14,
        color: done > 0.5 ? ACCENT : DIM,
      });
      ctx.strokeStyle = DIM;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 278, 224, 28, 28);
      if (done > 0) {
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 3;
        seg(ctx, x + 284, 238, x + 290, 245, clamp01(done * 2));
        seg(ctx, x + 290, 245, x + 301, 230, clamp01(done * 2 - 1));
      }
      if (i < 3) {
        ctx.strokeStyle = DIM;
        seg(ctx, x + 330, 255, x + 430, 255);
        lit(ctx, () => seg(ctx, x + 330, 255, x + 430, 255, spring(t - 5.6 - i * 0.28, 12)), 3);
      }
    });
  });

  // Migration: traffic moves to the new stack while downtime stays at zero.
  L = life(t, 5.5, OUT);
  squash(ctx, 560, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 150, 360, 1050, 400, L.p);
    text(ctx, "MIGRAÇÃO DA STACK", 180, 404, { size: 16, weight: 700, color: WHITE });
    const shift = expoOut(phase(t, 5.7, 6.8));
    const base = 720;
    ctx.strokeStyle = DIM;
    seg(ctx, 180, base, 1170, base);
    text(ctx, "TRÁFEGO NA NOVA STACK", 180, 444, { size: 14 });
    text(ctx, `${fmt(100 * shift)}%`, 1170, 444, { size: 22, weight: 700, color: ACCENT, align: "right" });
    const pts = [];
    const old = [];
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      if (u > shift) break;
      const s = 1 / (1 + Math.exp(-11 * (u - 0.45)));
      pts.push([180 + 990 * u, base - 10 - 230 * s]);
      old.push([180 + 990 * u, base - 10 - 230 * (1 - s)]);
    }
    if (pts.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0][0], base);
      pts.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(pts[pts.length - 1][0], base);
      ctx.clip();
      ctx.strokeStyle = ACCENT_SOFT;
      ctx.lineWidth = 1;
      hatch(ctx, 180, 460, 990, 260, 8);
      ctx.restore();
      lit(ctx, () => polyline(ctx, pts), 3);
    }
    // The old stack hands its traffic over: a dashed line going down.
    if (old.length > 1) {
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      polyline(ctx, old);
      ctx.setLineDash([]);
    }
  });

  // Downtime and uptime.
  L = life(t, 5.65, OUT);
  squash(ctx, 560, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 1240, 360, 530, 400, L.p);
    text(ctx, "DOWNTIME", 1270, 404, { size: 16 });
    text(ctx, "0,0 s", 1270, 500, { size: 72, weight: 700, family: SANS, color: WHITE, track: -0.01 });
    text(ctx, "UPTIME 30 DIAS", 1270, 580, { size: 14 });
    text(ctx, "99,99%", 1740, 580, { size: 18, weight: 700, color: ACCENT, align: "right" });
    for (let i = 0; i < 30; i++) {
      const r = spring(t - 5.8 - i * 0.008, 16);
      const h = (104 + 6 * noise(i + 9)) * r;
      ctx.fillStyle = ACCENT_SOFT;
      ctx.fillRect(1270 + i * 16, 720 - h, 11, h);
    }
  });

  // Footer stats.
  L = life(t, 5.8, OUT);
  squash(ctx, 860, L, () => {
    [
      ["DEPLOYS / SEMANA", 6 + 18 * expoOut(phase(t, 5.9, 6.9)), ""],
      ["COBERTURA DE TESTES", 92 * expoOut(phase(t, 5.9, 6.9)), "%"],
      ["RELEASES NO MÊS", 48 * expoOut(phase(t, 5.9, 6.9)), ""],
    ].forEach(([label, value, unit], i) => {
      const x = 150 + i * 545;
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 2;
      frame(ctx, x, 800, 515, 140, L.p);
      text(ctx, label, x + 28, 844, { size: 14 });
      text(ctx, `${fmt(value)}${unit}`, x + 28, 912, { size: 44, weight: 700, family: SANS, color: WHITE, track: 0 });
    });
  });
}

function draw(ctx, t) {
  t = ((t % DURATION) + DURATION) % DURATION;
  kit.background(ctx);
  stream(ctx, t);
  volumePanels(ctx, t);
  deploy(ctx, t);
  sheet(ctx, t);
  kit.hud(ctx, t, ["INVOICE", "VOLUME", "DEPLOY"]);
}

window.scene = { width: W, height: H, duration: DURATION, fps: 30, bitrate: 1_600_000, draw };
