// Webmotors cover clip (12 s loop) in four acts, each made out of the previous one:
//   1. VEHICLE  a wireframe hatchback turns on a measuring disc while a scan passes over it
//   2. SEARCH   it shrinks into the first card of a car-marketplace results page
//   3. CREDIT   the clicked card opens into a financing simulation; every chart climbs
//   4. ROAD     the panel drops onto a road the car drives along, then parks on the disc again
// No logos or brand names. Pure function of time, so frame 0 equals frame `duration`.
// Loaded into the recording page by scripts/case-video.ts, after kit.js.

const kit = window.createKit({ accent: "#e63b3b", accentSoft: "rgba(230,59,59,0.35)", duration: 12 });
const { W, H, BG, WHITE, LINE, DIM, FAINT, SANS, ACCENT: RED, ACCENT_SOFT: RED_SOFT, DURATION } = kit;
const { clamp01, lerp, spring, expoIn, expoOut, phase, life, track, fmt } = kit;
const { text, typed, seg, frame, hatch, squash, lit, path3, circle3 } = kit;

// ---------------------------------------------------------------- 3D car

// Side profiles (x along the car, front = +x, metres) of generic body styles.
// None is modelled on a real car.
const MODELS = {
  hatch: {
    top: [
      [2.05, 0.6],
      [2.0, 0.78],
      [1.3, 0.95],
      [0.5, 1.42],
      [-1.2, 1.46],
      [-1.85, 1.25],
      [-2.02, 0.95],
      [-2.05, 0.6],
    ],
    belt: 0.95,
    bottom: 0.3,
    halfW: 0.88,
    roofW: 0.66,
    wheels: [1.3, -1.32],
    r: 0.32,
  },
  sedan: {
    top: [
      [2.3, 0.6],
      [2.25, 0.78],
      [1.35, 0.97],
      [0.55, 1.42],
      [-0.75, 1.44],
      [-1.55, 1.04],
      [-2.27, 0.98],
      [-2.3, 0.62],
    ],
    belt: 0.97,
    bottom: 0.3,
    halfW: 0.9,
    roofW: 0.66,
    wheels: [1.4, -1.45],
    r: 0.32,
  },
  suv: {
    top: [
      [2.2, 0.72],
      [2.15, 0.98],
      [1.45, 1.1],
      [0.7, 1.64],
      [-1.75, 1.68],
      [-2.12, 1.48],
      [-2.2, 0.72],
    ],
    belt: 1.1,
    bottom: 0.4,
    halfW: 0.92,
    roofW: 0.74,
    wheels: [1.38, -1.4],
    r: 0.38,
  },
  pickup: {
    top: [
      [2.6, 0.72],
      [2.55, 1.02],
      [1.6, 1.12],
      [0.95, 1.72],
      [-0.3, 1.74],
      [-0.38, 1.14],
      [-2.6, 1.14],
      [-2.6, 0.72],
    ],
    belt: 1.12,
    bottom: 0.42,
    halfW: 0.95,
    roofW: 0.76,
    wheels: [1.65, -1.7],
    r: 0.4,
  },
};

// Chaikin corner cutting: turns the coarse profiles into smooth body lines.
function smooth(points, passes = 3) {
  let pts = points;
  for (let n = 0; n < passes; n++) {
    const next = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      next.push([lerp(x0, x1, 0.25), lerp(y0, y1, 0.25)], [lerp(x0, x1, 0.75), lerp(y0, y1, 0.75)]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

// Vertex indices (per side) of the lines worth lighting: sill, shoulder and roof edge.
const SILL = 1;
const SHOULDER = 4;
const ROOF_EDGE = 7;

for (const model of Object.values(MODELS)) {
  model.front = model.top[0][0];
  model.rear = model.top[model.top.length - 1][0];
  const profile = smooth(model.top);
  model.topAt = (x) => {
    for (let i = 0; i < profile.length - 1; i++) {
      const [x0, y0] = profile[i];
      const [x1, y1] = profile[i + 1];
      if (x <= x0 && x >= x1) return lerp(y0, y1, (x0 - x) / (x0 - x1 || 1));
    }
    return profile[profile.length - 1][1];
  };
  // Cross sections: 8 vertices per side (y, z), from the sill round the roof.
  // Rounded shoulders and a glasshouse that leans in (tumblehome).
  const stations = 40;
  const hw = model.halfW;
  model.rings = [];
  for (let i = 0; i <= stations; i++) {
    const x = lerp(model.front - 0.02, model.rear + 0.02, i / stations);
    const top = model.topAt(x);
    const belt = Math.min(model.belt, top - 0.02);
    const glass = clamp01((top - belt - 0.04) / 0.25);
    const roofZ = lerp(hw - 0.12, model.roofW, glass);
    // Ends of the car are rounded in plan view too.
    const end = Math.min(x - model.rear, model.front - x);
    const taper = 1 - 0.14 * Math.pow(1 - clamp01(end / 0.45), 2);
    let yb = model.bottom;
    for (const wx of model.wheels) {
      const dx = Math.abs(x - wx);
      const arch = model.r + 0.08;
      if (dx < arch) yb = Math.max(yb, model.r + Math.sqrt(arch * arch - dx * dx));
    }
    const side = [
      [yb, hw - 0.12],
      [yb + 0.06, hw - 0.03],
      [lerp(yb, belt, 0.45), hw],
      [belt - 0.08, hw - 0.01],
      [belt, hw - 0.06],
      [lerp(belt, top, 0.5), lerp(hw - 0.08, roofZ, 0.55)],
      [top - 0.04, roofZ],
      [top, roofZ - 0.12],
    ].map(([y, z]) => [y, z * taper]);
    model.rings.push({
      x,
      glass: glass > 0.5,
      v: [...side.map(([y, z]) => [y, -z]), ...side.reverse().map(([y, z]) => [y, z])],
    });
  }
}

// Camera around the car centre; `s` scales it for card thumbnails.
const projector = (view) => kit.projector(view, { F: 2500, D: 11, pitch: 0.3, pivotY: 0.75 });

// Wheel rotation: five spokes, and a whole number of spoke steps per loop.
const spin = (t) => ((-2 * Math.PI) / 5) * 22 * (t / DURATION);

function drawCar(ctx, model, view, t, o = {}) {
  const project = projector(view);
  const detail = view.s > 0.35;
  const width = Math.max(1, 2.2 * Math.sqrt(view.s));
  const { rings } = model;
  const n = rings[0].v.length;

  // Cross sections: faint, every fourth a little stronger, the scanned one lit.
  rings.forEach((ring, i) => {
    const pts = ring.v.map(([y, z]) => [ring.x, y, z]);
    const scanned = o.scan != null && Math.abs(i / (rings.length - 1) - o.scan) < 0.02;
    if (scanned) {
      lit(ctx, () => path3(ctx, project, pts, true), width * 1.3);
    } else {
      ctx.strokeStyle = i % 4 === 0 ? DIM : FAINT;
      ctx.lineWidth = Math.max(0.6, width * 0.4);
      path3(ctx, project, pts, true);
    }
  });

  // Longitudinal lines: character lines lit, the rest as fine white mesh.
  for (let v = 0; v < n; v++) {
    const pts = rings.map((ring) => [ring.x, ring.v[v][0], ring.v[v][1]]);
    const k = v < n / 2 ? v : n - 1 - v;
    if (k === SILL || k === SHOULDER || k === ROOF_EDGE) {
      lit(ctx, () => path3(ctx, project, pts), k === SHOULDER ? width * 1.1 : width * 0.85);
    } else {
      ctx.strokeStyle = LINE;
      ctx.lineWidth = Math.max(0.6, width * 0.45);
      path3(ctx, project, pts);
    }
  }
  // Nose and tail outlines close the body.
  for (const ring of [rings[0], rings[rings.length - 1]]) {
    lit(
      ctx,
      () =>
        path3(
          ctx,
          project,
          ring.v.map(([y, z]) => [ring.x, y, z]),
          true,
        ),
      width * 0.8,
    );
  }

  // Wheels: tyre (two circles and tread lines), rim and five turning spokes.
  const a0 = spin(t);
  for (const wx of model.wheels) {
    for (const side of [-1, 1]) {
      const z = side * (model.halfW - 0.06);
      const zi = z - side * 0.24;
      ctx.strokeStyle = WHITE;
      ctx.lineWidth = Math.max(0.8, width * 0.75);
      path3(ctx, project, circle3(wx, model.r, z, model.r, "xy"), true);
      ctx.strokeStyle = DIM;
      path3(ctx, project, circle3(wx, model.r, zi, model.r, "xy"), true);
      if (!detail) continue;
      for (let k = 0; k < 16; k++) {
        const a = a0 + (k * Math.PI) / 8;
        path3(ctx, project, [
          [wx + Math.cos(a) * model.r, model.r + Math.sin(a) * model.r, z],
          [wx + Math.cos(a) * model.r, model.r + Math.sin(a) * model.r, zi],
        ]);
      }
      ctx.strokeStyle = LINE;
      path3(ctx, project, circle3(wx, model.r, z, model.r * 0.66, "xy"), true);
      path3(ctx, project, circle3(wx, model.r, z, model.r * 0.16, "xy", 12), true);
      for (let k = 0; k < 5; k++) {
        const a = a0 + (k * Math.PI * 2) / 5;
        const b = a + 0.22;
        const r0 = model.r * 0.16;
        const r1 = model.r * 0.64;
        path3(ctx, project, [
          [wx + Math.cos(a) * r0, model.r + Math.sin(a) * r0, z],
          [wx + Math.cos(a) * r1, model.r + Math.sin(a) * r1, z],
          [wx + Math.cos(b) * r1, model.r + Math.sin(b) * r1, z],
          [wx + Math.cos(b) * r0, model.r + Math.sin(b) * r0, z],
        ]);
      }
      // Brake disc behind the spokes.
      ctx.strokeStyle = DIM;
      path3(ctx, project, circle3(wx, model.r, z - side * 0.05, model.r * 0.5, "xy", 20), true);
    }
  }

  if (!detail) return;
  // Window pillars, door seams, handles, lights and grille.
  const glassRings = rings.filter((ring) => ring.glass);
  const pillars = [glassRings[0], glassRings[Math.round(glassRings.length * 0.42)], glassRings[glassRings.length - 1]];
  for (const side of [-1, 1]) {
    const v = (ring, k) => ring.v[side < 0 ? k : n - 1 - k];
    for (const ring of pillars) {
      if (!ring) continue;
      lit(
        ctx,
        () =>
          path3(ctx, project, [
            [ring.x, ...v(ring, SHOULDER)],
            [ring.x, ...v(ring, 6)],
          ]),
        width * 0.9,
        "rgba(255,255,255,0.8)",
      );
    }
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = width * 0.55;
    for (const ring of [rings[Math.round(rings.length * 0.33)], rings[Math.round(rings.length * 0.55)]]) {
      path3(
        ctx,
        project,
        ring.v.slice(0, SHOULDER + 1).map(([y, z]) => [ring.x, y, side * Math.abs(z)]),
      );
    }
    for (const fx of [0.4, -0.6]) {
      const ring = rings.reduce((a, b) => (Math.abs(b.x - fx) < Math.abs(a.x - fx) ? b : a));
      const [y, z] = v(ring, 3);
      path3(ctx, project, [
        [fx, y - 0.02, z * 1.01],
        [fx - 0.18, y - 0.02, z * 1.01],
      ]);
    }
    const lamp = (ring, color) => {
      const z0 = side * 0.42;
      const z1 = side * Math.abs(v(ring, 3)[1]) * 0.96;
      const y0 = model.belt - 0.28;
      lit(
        ctx,
        () =>
          path3(
            ctx,
            project,
            [
              [ring.x, y0, z0],
              [ring.x, y0 + 0.12, z0],
              [ring.x, y0 + 0.16, z1],
              [ring.x, y0 - 0.02, z1],
            ],
            true,
          ),
        width * 0.9,
        color,
      );
    };
    lamp(rings[1], "rgba(255,255,255,0.9)");
    lamp(rings[rings.length - 2], RED);
  }
  ctx.strokeStyle = LINE;
  ctx.lineWidth = width * 0.5;
  for (let k = 0; k < 5; k++) {
    const y = model.bottom + 0.1 + k * 0.05;
    path3(ctx, project, [
      [model.front - 0.01, y, -0.36],
      [model.front - 0.01, y, 0.36],
    ]);
  }
}

// Measuring disc under the car: rotates with it, ticks every 5 degrees.
function drawDisc(ctx, view, scale) {
  if (scale <= 0.01) return;
  const project = projector(view);
  const R = 3.1 * scale;
  ctx.strokeStyle = DIM;
  ctx.lineWidth = 1.2;
  path3(ctx, project, circle3(0, 0, 0, R, "xz", 72), true);
  path3(ctx, project, circle3(0, 0, 0, R * 1.08, "xz", 72), true);
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const inner = i % 6 === 0 ? 0.88 : 0.95;
    ctx.strokeStyle = i % 6 === 0 ? LINE : DIM;
    path3(ctx, project, [
      [Math.cos(a) * R * inner, 0, Math.sin(a) * R * inner],
      [Math.cos(a) * R, 0, Math.sin(a) * R],
    ]);
  }
}

// ---------------------------------------------------------------- layout

const CARD_W = 405;
const CARD_H = 310;
const CARDS = [
  { model: "hatch", title: "HATCH 1.0 FLEX", info: "2021 · 38.400 km", price: 64900 },
  { model: "suv", title: "SUV 1.5 TURBO", info: "2022 · 31.000 km", price: 118900, tag: true },
  { model: "sedan", title: "SEDAN 2.0 AUT.", info: "2020 · 52.700 km", price: 97500 },
  { model: "pickup", title: "PICAPE 2.8 DIESEL", info: "2021 · 61.200 km", price: 214000 },
  { model: "sedan", title: "SEDAN 1.6 MANUAL", info: "2019 · 70.100 km", price: 58300, tag: true },
  { model: "suv", title: "SUV 2.0 4X4", info: "2023 · 12.900 km", price: 176400 },
].map((card, i) => ({ ...card, x: 490 + (i % 3) * 437.5, y: i < 3 ? 330 : 665 }));
const thumb = (card) => ({ cx: card.x + CARD_W / 2, cy: card.y + 12 + 92 });
const PANEL = { x: 150, y: 100, w: 1620, h: 880 };

// Hero car path through the acts. It turns exactly once per loop.
const Y0 = 3.5;
const yawAt = (t, offset = 0) => Y0 + offset + ((2 * Math.PI) / DURATION) * t;
function heroView(t) {
  const c0 = thumb(CARDS[0]);
  const segments = (pick) => [
    { f: () => pick.full },
    { t: 2.6, f: () => pick.card, w: 9 },
    { t: 5.75, f: () => pick.detail, w: 8 },
    { t: 8.7, f: () => pick.full, w: 7 },
  ];
  return {
    yaw: yawAt(t),
    cx: track(t, segments({ full: 960, card: c0.cx, detail: 575 })),
    cy: track(t, segments({ full: 640, card: c0.cy + 12, detail: 520 })),
    s: track(t, segments({ full: 1, card: 0.27, detail: 0.6 })),
  };
}

// ---------------------------------------------------------------- acts

function discScale(t) {
  if (t < 3.1) return 1 - expoIn(phase(t, 2.6, 3.0));
  if (t < 9) return 0.78 * spring(t - 6.3, 10) * (1 - expoIn(phase(t, 8.6, 9.0)));
  return spring(t - 11.0, 9);
}

function vehicleCallouts(ctx, t, view) {
  // Hidden on frame 0 and on the last frame, so they never break the loop.
  const { p, k } = life(t, 0.3, 2.4, 12);
  const show = t < 3 ? p * k : 0;
  if (show <= 0.01) return;
  const project = projector(view);
  const model = MODELS.hatch;
  ctx.save();
  ctx.globalAlpha = clamp01(show);
  // Length dimension along the ground.
  const z = model.halfW + 1.25;
  const a = project(model.front, 0, z);
  const b = project(model.rear, 0, z);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1.5;
  seg(ctx, a.x, a.y, b.x, b.y, show);
  for (const q of [a, b]) seg(ctx, q.x, q.y - 12, q.x, q.y + 12);
  text(ctx, `${fmt(4230 * show)} MM`, (a.x + b.x) / 2, (a.y + b.y) / 2 - 14, {
    size: 18,
    align: "center",
    color: WHITE,
  });
  // Callouts to the front wheel and the headlight.
  const wheel = project(model.wheels[0], model.r, model.halfW);
  const lamp = project(model.front, 0.8, 0.6);
  for (const [q, label, dx, dy] of [
    [wheel, 'ARO 17"', 130, 150],
    [lamp, "LED · 6.500 K", 160, -170],
  ]) {
    ctx.strokeStyle = LINE;
    seg(ctx, q.x, q.y, q.x + dx * 0.6, q.y + dy, show);
    seg(ctx, q.x + dx * 0.6, q.y + dy, q.x + dx * 1.6, q.y + dy, show);
    ctx.fillStyle = RED;
    ctx.fillRect(q.x - 4, q.y - 4, 8, 8);
    text(ctx, label, q.x + dx * 0.6, q.y + dy - 12, { size: 18, color: WHITE });
  }
  ctx.restore();
}

function searchPage(ctx, t) {
  if (t < 2.8 || t > 6.4) return;
  const OUT = 5.5;
  ctx.lineWidth = 2;

  // Top bar with tabs; the active underline walks to FINANCIAR before the panel opens.
  let L = life(t, 2.9, OUT);
  squash(ctx, 130, L, () => {
    ctx.strokeStyle = LINE;
    frame(ctx, 150, 100, 1620, 60, L.p);
    ctx.strokeStyle = RED;
    seg(ctx, 172, 112, 172, 148, L.p);
    seg(ctx, 172, 112, 196, 112, L.p);
    const tabs = ["COMPRAR", "VENDER", "FINANCIAR", "SERVIÇOS"];
    tabs.forEach((tab, i) => text(ctx, typed(tab, (L.p - 0.2) * 1.5), 260 + i * 210, 138, { size: 18, color: LINE }));
    const at = lerp(260, 680, spring(t - 5.2, 16));
    ctx.strokeStyle = RED;
    ctx.lineWidth = 3;
    seg(ctx, at, 152, at + 120, 152, L.p);
    ctx.lineWidth = 2;
    ctx.strokeStyle = DIM;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(1620 + i * 46, 130, 14, 0, Math.PI * 2 * L.p);
      ctx.stroke();
    }
  });

  // Search field typing a query, and the search button.
  L = life(t, 3.0, OUT);
  squash(ctx, 220, L, () => {
    ctx.strokeStyle = LINE;
    frame(ctx, 150, 185, 1440, 70, L.p);
    ctx.beginPath();
    ctx.arc(190, 216, 12, 0, Math.PI * 2 * L.p);
    ctx.stroke();
    seg(ctx, 199, 225, 208, 234, L.p);
    const q = typed("suv automático até R$ 120 mil", phase(t, 3.2, 4.1));
    text(ctx, q, 228, 228, { size: 22, color: WHITE, track: 0.06 });
    if (t < 4.4 && Math.floor(t * 4) % 2 === 0) {
      ctx.fillStyle = RED;
      ctx.fillRect(232 + q.length * 14.5, 206, 3, 28);
    }
    ctx.fillStyle = RED;
    ctx.fillRect(1610, 185, 160 * L.p, 70);
    text(ctx, typed("BUSCAR", (L.p - 0.4) * 2), 1690, 228, { size: 20, weight: 700, color: "#fff", align: "center" });
  });

  // Filters: price histogram (climbing), range slider, year boxes, checkboxes, body chips.
  L = life(t, 3.1, OUT);
  squash(ctx, 630, L, () => {
    ctx.strokeStyle = LINE;
    frame(ctx, 150, 280, 300, 700, L.p);
    text(ctx, typed("PREÇO", L.p * 2), 175, 318, { size: 16 });
    for (let i = 0; i < 14; i++) {
      const h = 14 + 70 * Math.pow(i / 13, 1.4) + 10 * Math.sin(i * 1.7);
      const r = spring(t - 3.3 - i * 0.04, 16);
      const inRange = i >= 3 && i <= 10;
      ctx.fillStyle = inRange ? RED_SOFT : FAINT;
      ctx.fillRect(178 + i * 18.5, 420 - h * r, 13, h * r);
    }
    const lo = lerp(175, 222, spring(t - 3.9, 12));
    const hi = lerp(425, 372, spring(t - 4.0, 12));
    ctx.strokeStyle = DIM;
    seg(ctx, 175, 440, 425, 440, L.p);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 3;
    seg(ctx, lo, 440, hi, 440, L.p);
    ctx.lineWidth = 2;
    for (const x of [lo, hi]) {
      ctx.fillStyle = BG;
      ctx.fillRect(x - 8, 432, 16, 16);
      ctx.strokeRect(x - 8, 432, 16, 16);
    }
    text(ctx, `R$ ${fmt(lerp(20000, 45000, spring(t - 3.9, 12)))}`, 175, 478, { size: 14, color: DIM, track: 0.05 });
    text(ctx, `R$ ${fmt(lerp(250000, 120000, spring(t - 4.0, 12)))}`, 425, 478, {
      size: 14,
      color: DIM,
      align: "right",
      track: 0.05,
    });

    text(ctx, typed("ANO", L.p * 2), 175, 530, { size: 16 });
    ctx.strokeStyle = DIM;
    frame(ctx, 175, 548, 115, 44, L.p);
    frame(ctx, 310, 548, 115, 44, L.p);
    text(ctx, "2019", 232, 577, { size: 16, color: WHITE, align: "center" });
    text(ctx, "2023", 367, 577, { size: 16, color: WHITE, align: "center" });

    text(ctx, typed("CÂMBIO", L.p * 2), 175, 640, { size: 16 });
    ["AUTOMÁTICO", "MANUAL", "CVT"].forEach((label, i) => {
      const y = 660 + i * 40;
      ctx.strokeStyle = DIM;
      frame(ctx, 175, y, 22, 22, L.p);
      if (i !== 1) {
        ctx.strokeStyle = RED;
        ctx.lineWidth = 3;
        const c = spring(t - 4.2 - i * 0.15, 16);
        seg(ctx, 179, y + 11, 185, y + 17, clamp01(c * 2));
        seg(ctx, 185, y + 17, 194, y + 5, clamp01(c * 2 - 1));
        ctx.lineWidth = 2;
      }
      text(ctx, label, 210, y + 18, { size: 15, color: i === 1 ? DIM : WHITE });
    });

    text(ctx, typed("CARROCERIA", L.p * 2), 175, 820, { size: 16 });
    ["HATCH", "SEDAN", "SUV", "PICAPE"].forEach((chip, i) => {
      const x = 175 + (i % 2) * 128;
      const y = 838 + Math.floor(i / 2) * 52;
      const on = chip === "SUV" && t > 4.5;
      ctx.strokeStyle = on ? RED : DIM;
      frame(ctx, x, y, 118, 40, L.p);
      if (on) {
        ctx.fillStyle = RED_SOFT;
        ctx.fillRect(x, y, 118 * spring(t - 4.5, 16), 40);
      }
      text(ctx, chip, x + 59, y + 26, { size: 14, color: on ? WHITE : LINE, align: "center" });
    });
  });

  // Results header with a climbing offer count.
  L = life(t, 3.3, OUT);
  squash(ctx, 305, L, () => {
    const n = lerp(0, 1248, expoOut(phase(t, 3.5, 4.6)));
    text(ctx, `${fmt(n)} OFERTAS`, 490, 312, { size: 20, weight: 700, color: WHITE });
    text(ctx, typed("MAIS RELEVANTES  ▾", L.p * 1.5), 1770, 312, { size: 16, align: "right" });
  });

  // Listing cards with turning wireframes of different body styles.
  CARDS.forEach((card, i) => {
    const selected = i === 0;
    const C = life(t, 3.2 + i * 0.08, OUT);
    const open = selected ? spring(t - 5.75, 9) : 0;
    const k = selected ? 1 : C.k;
    const x = lerp(card.x, PANEL.x, open);
    const y = lerp(card.y, PANEL.y, open);
    const w = lerp(CARD_W, PANEL.w, open);
    const h = lerp(CARD_H, PANEL.h, open);
    squash(ctx, card.y + CARD_H / 2, { k, p: selected ? Math.max(C.p, open) : C.p }, () => {
      const clicked = selected && t > 5.3;
      ctx.lineWidth = clicked ? 3 : 2;
      ctx.strokeStyle = clicked ? RED : LINE;
      frame(ctx, x, y, w, h, C.p);
      if (open > 0.02) return;
      ctx.lineWidth = 1;
      ctx.strokeStyle = FAINT;
      hatch(ctx, card.x + 12, card.y + 12, CARD_W - 24, 184);
      ctx.strokeStyle = DIM;
      frame(ctx, card.x + 12, card.y + 12, CARD_W - 24, 184, C.p);
      if (!selected) {
        const { cx, cy } = thumb(card);
        drawCar(ctx, MODELS[card.model], { yaw: yawAt(t, i * 0.5), cx, cy: cy + 12, s: 0.27 * C.p }, t);
      }
      // Favourite heart.
      ctx.strokeStyle = i === 2 && t > 4.8 ? RED : LINE;
      ctx.lineWidth = 2;
      const hx = card.x + CARD_W - 40;
      const hy = card.y + 40;
      ctx.beginPath();
      ctx.moveTo(hx, hy + 9);
      ctx.bezierCurveTo(hx - 16, hy - 2, hx - 8, hy - 14, hx, hy - 5);
      ctx.bezierCurveTo(hx + 8, hy - 14, hx + 16, hy - 2, hx, hy + 9);
      ctx.stroke();
      if (card.tag) {
        ctx.fillStyle = RED;
        ctx.fillRect(card.x + 24, card.y + 24, 128 * C.p, 26);
        text(ctx, typed("BOA OFERTA", C.p * 2 - 1), card.x + 34, card.y + 43, {
          size: 13,
          weight: 700,
          color: "#fff",
          track: 0.12,
        });
      }
      text(ctx, typed(card.title, C.p * 1.4), card.x + 16, card.y + 228, {
        size: 18,
        weight: 700,
        color: WHITE,
        track: 0.08,
      });
      text(ctx, card.info, card.x + 16, card.y + 254, { size: 14, color: DIM, track: 0.06 });
      text(ctx, `R$ ${fmt(card.price * spring(t - 3.6 - i * 0.08, 8))}`, card.x + 16, card.y + 292, {
        size: 24,
        weight: 700,
        family: SANS,
        color: WHITE,
        track: 0.02,
      });
      ctx.strokeStyle = DIM;
      seg(ctx, card.x + 250, card.y + 284, card.x + CARD_W - 16, card.y + 284, C.p);
    });
  });

  // Cursor: arrives, clicks the first card.
  if (t > 4.4 && t < OUT + 0.3) {
    const c0 = thumb(CARDS[0]);
    const m = spring(t - 4.6, 7);
    const cx = lerp(1500, c0.cx + 60, m);
    const cy = lerp(1000, c0.cy + 150, m);
    const press = t > 5.3 ? spring(t - 5.3, 12) : 0;
    if (press > 0 && press < 0.999) {
      ctx.strokeStyle = RED;
      ctx.lineWidth = 2;
      const r = 50 * press;
      ctx.strokeRect(cx - r, cy - r, 2 * r, 2 * r);
    }
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1.3, 1.3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 26);
    ctx.lineTo(7, 20);
    ctx.lineTo(12, 31);
    ctx.lineTo(17, 29);
    ctx.lineTo(12, 18);
    ctx.lineTo(21, 18);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = BG;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

function creditPanel(ctx, t) {
  if (t < 5.9 || t > 9.2) return;
  const OUT = 8.6;
  ctx.lineWidth = 2;

  // Panel frame (the opened card) and its title row.
  const P = life(t, 6.2, OUT);
  squash(ctx, 540, 1 - expoIn(phase(t, 8.75, 9.15)), () => {
    if (t > 6.4) {
      ctx.strokeStyle = LINE;
      ctx.strokeRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
    }
  });
  squash(ctx, 150, P, () => {
    text(ctx, typed("HATCH 1.0 FLEX · 2021 · 38.400 KM", phase(t, 6.2, 6.9)), 190, 160, { size: 20, color: WHITE });
    text(ctx, `R$ ${fmt(64900)}`, 960, 160, {
      size: 28,
      weight: 700,
      family: SANS,
      color: WHITE,
      align: "right",
      track: 0.02,
    });
    ctx.strokeStyle = DIM;
    seg(ctx, 190, 185, 960, 185, P.p);
    seg(ctx, 990, 130, 990, 950, P.p);
  });

  // Down-payment slider.
  let L = life(t, 6.3, OUT);
  squash(ctx, 270, L, () => {
    text(ctx, typed("SIMULE O FINANCIAMENTO", L.p * 1.5), 1030, 160, { size: 20, weight: 700, color: WHITE });
    const share = lerp(0.2, 0.4, spring(t - 6.7, 8));
    text(ctx, "ENTRADA", 1030, 232, { size: 16 });
    text(ctx, `R$ ${fmt(64900 * share)}`, 1730, 232, { size: 18, color: WHITE, align: "right", track: 0.06 });
    ctx.strokeStyle = DIM;
    seg(ctx, 1030, 262, 1730, 262, L.p);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 4;
    const knob = lerp(1030, 1730, share);
    seg(ctx, 1030, 262, knob, 262, L.p);
    ctx.lineWidth = 2;
    ctx.fillStyle = BG;
    ctx.fillRect(knob - 10, 252, 20, 20);
    ctx.strokeRect(knob - 10, 252, 20, 20);
  });

  // Instalment chips; the selection steps to 48x.
  L = life(t, 6.45, OUT);
  const terms = [12, 24, 36, 48, 60];
  let pick = 0;
  for (const [i, at] of [
    [1, 6.9],
    [2, 7.15],
    [3, 7.4],
  ])
    if (t > at) pick = i;
  squash(ctx, 320, L, () => {
    terms.forEach((n, i) => {
      const x = 1030 + i * 142;
      ctx.strokeStyle = i === pick ? RED : DIM;
      ctx.lineWidth = i === pick ? 3 : 2;
      frame(ctx, x, 296, 128, 48, L.p);
      text(ctx, `${n}x`, x + 64, 328, { size: 18, color: i === pick ? WHITE : LINE, align: "center" });
    });
  });

  // Monthly instalment counter.
  L = life(t, 6.6, OUT);
  squash(ctx, 410, L, () => {
    const n = terms[pick];
    const financed = 64900 * 0.6;
    const r = 0.0189;
    const pmt = (financed * r) / (1 - Math.pow(1 + r, -n));
    text(ctx, typed("PARCELA ESTIMADA", L.p * 2), 1030, 384, { size: 16 });
    text(ctx, `${n}x R$ ${fmt(pmt * L.p)}`, 1030, 448, {
      size: 58,
      weight: 700,
      family: SANS,
      color: WHITE,
      track: -0.01,
    });
  });

  // Approvals per month: twelve bars climbing left to right.
  L = life(t, 6.8, OUT);
  squash(ctx, 640, L, () => {
    text(ctx, typed("APROVAÇÕES / MÊS", L.p * 2), 1030, 500, { size: 16 });
    const top = 520;
    const base = 760;
    ctx.strokeStyle = DIM;
    seg(ctx, 1030, base, 1730, base, L.p);
    for (let g = 1; g <= 3; g++) {
      ctx.strokeStyle = FAINT;
      seg(ctx, 1030, base - g * 60, 1730, base - g * 60, L.p);
    }
    for (let i = 0; i < 12; i++) {
      const h = (base - top - 30) * (0.18 + 0.82 * Math.pow(i / 11, 1.25)) + 4 * Math.sin(i * 2.1);
      const r = spring(t - 7.0 - i * 0.07, 14);
      if (r < 0.02) continue;
      const x = 1040 + i * 58;
      const bh = h * r;
      ctx.strokeStyle = i === 11 ? RED : LINE;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, base - bh, 38, bh);
      ctx.strokeStyle = i === 11 ? RED_SOFT : DIM;
      ctx.lineWidth = 1;
      hatch(ctx, x, base - bh, 38, bh, 7);
    }
    const growth = 212 * expoOut(phase(t, 7.2, 8.2));
    text(ctx, `+${fmt(growth)}%`, 1730, 500, { size: 22, weight: 700, color: RED, align: "right" });
  });

  // Searches over time: a line climbing with a hatched area under it.
  L = life(t, 7.1, OUT);
  squash(ctx, 870, L, () => {
    text(ctx, typed("BUSCAS ORGÂNICAS", L.p * 2), 1030, 812, { size: 16 });
    const base = 950;
    const p = expoOut(phase(t, 7.3, 8.4));
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const k = i / 60;
      if (k > p) break;
      pts.push([1030 + 700 * k, base - 12 - 104 * Math.pow(k, 1.3) - 5 * Math.sin(k * 21) * k]);
    }
    ctx.strokeStyle = DIM;
    ctx.lineWidth = 2;
    seg(ctx, 1030, base, 1730, base, L.p);
    if (pts.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0][0], base);
      pts.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(pts[pts.length - 1][0], base);
      ctx.closePath();
      ctx.clip();
      ctx.strokeStyle = RED_SOFT;
      ctx.lineWidth = 1;
      hatch(ctx, 1030, 820, 700, 130, 8);
      ctx.restore();
      lit(
        ctx,
        () => {
          ctx.beginPath();
          pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.stroke();
        },
        3,
      );
      const [hx, hy] = pts[pts.length - 1];
      ctx.fillStyle = RED;
      ctx.fillRect(hx - 6, hy - 6, 12, 12);
      text(ctx, `+${fmt(38 * p)}%`, hx - 14, hy - 18, { size: 18, weight: 700, color: WHITE, align: "right" });
    }
  });

  // Credit gauge under the car.
  L = life(t, 6.9, OUT);
  squash(ctx, 880, L, () => {
    const cx = 330;
    const cy = 930;
    const fill = 0.82 * expoOut(phase(t, 7.1, 8.1));
    ctx.strokeStyle = DIM;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 100, Math.PI, Math.PI + Math.PI * L.p);
    ctx.stroke();
    for (let i = 0; i <= 20; i++) {
      const a = Math.PI + (i / 20) * Math.PI;
      ctx.strokeStyle = i / 20 <= fill ? RED : DIM;
      seg(ctx, cx + Math.cos(a) * 82, cy + Math.sin(a) * 82, cx + Math.cos(a) * 94, cy + Math.sin(a) * 94);
    }
    const a = Math.PI + fill * Math.PI;
    lit(ctx, () => seg(ctx, cx, cy, cx + Math.cos(a) * 74, cy + Math.sin(a) * 74), 3);
    text(ctx, `${fmt(fill * 1000)}`, cx, cy - 18, {
      size: 30,
      weight: 700,
      family: SANS,
      color: WHITE,
      align: "center",
      track: 0,
    });
    text(ctx, "SCORE", cx, cy + 8, { size: 13, align: "center" });
    text(ctx, typed("CRÉDITO PRÉ-APROVADO", phase(t, 7.6, 8.2)), 470, 880, { size: 18, weight: 700, color: WHITE });
    text(ctx, `ATÉ R$ ${fmt(71340 * expoOut(phase(t, 7.6, 8.3)))}`, 470, 916, { size: 18, color: LINE });
    if (t > 8.1) {
      ctx.strokeStyle = RED;
      ctx.lineWidth = 3;
      const c = spring(t - 8.1, 14);
      seg(ctx, 470, 940, 480, 950, clamp01(c * 2));
      seg(ctx, 480, 950, 498, 930, clamp01(c * 2 - 1));
    }
  });
}

// Road under the car for the last act; lane dashes travel at a speed that
// repeats exactly over the loop.
function road(ctx, t, view) {
  const grow = t < 10.5 ? spring(t - 8.9, 8) : 1 - expoIn(phase(t, 11.0, 11.5));
  if (t < 8.9 || grow <= 0.01) return;
  const project = projector(view);
  const X = 16 * grow;
  const step = 0.5;
  const line = (z) => {
    const pts = [];
    for (let x = -X; x <= X; x += step) pts.push([x, 0, z]);
    return pts;
  };
  for (const z of [-3.4, 3.4]) lit(ctx, () => path3(ctx, project, line(z)), 2.5);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  const offset = (((t * 6) % 4) + 4) % 4;
  for (const z of [-1.15, 1.15]) {
    for (let x = -X - 4 + offset; x < X; x += 4) {
      const x0 = Math.max(-X, x);
      const x1 = Math.min(X, x + 1.8);
      if (x1 > x0)
        path3(ctx, project, [
          [x0, 0, z],
          [x1, 0, z],
        ]);
    }
  }
  ctx.strokeStyle = FAINT;
  ctx.lineWidth = 1;
  for (let x = -X - 2 + (offset % 2); x < X; x += 2)
    path3(ctx, project, [
      [x, 0, -7 * grow],
      [x, 0, 7 * grow],
    ]);
  for (const z of [-5.2, -7]) {
    path3(ctx, project, line(z * grow));
    path3(ctx, project, line(-z * grow));
  }
  // Odometer in the corner.
  const km = 38400 + (t - 8.9) * 37;
  ctx.globalAlpha = clamp01(grow);
  text(ctx, `${fmt(km)} KM`, 1770, 140, {
    size: 28,
    weight: 700,
    family: SANS,
    color: WHITE,
    align: "right",
    track: 0.02,
  });
  text(ctx, "ODÔMETRO", 1770, 104, { size: 16, align: "right" });
  ctx.globalAlpha = 1;
}

function draw(ctx, t) {
  t = ((t % DURATION) + DURATION) % DURATION;
  kit.background(ctx);

  const view = heroView(t);
  drawDisc(ctx, view, discScale(t));
  road(ctx, t, view);
  searchPage(ctx, t);
  creditPanel(ctx, t);
  const scan = t < 2.6 ? expoOut(phase(t, 0.3, 2.3)) : t > 6.6 && t < 8.6 ? phase(t, 6.6, 8.4) : null;
  drawCar(ctx, MODELS.hatch, view, t, { scan });
  vehicleCallouts(ctx, t, view);
  kit.hud(ctx, t, ["VEHICLE", "SEARCH", "CREDIT", "ROAD"]);
}

window.scene = { width: W, height: H, duration: DURATION, fps: 30, bitrate: 1_600_000, draw };
