// UnitedHealth Group cover clip (8 s loop) in three acts, each made out of the previous one:
//   1. PULSE    a field of ECG traces in perspective, beating at 75 bpm
//   2. CONSULT  the front trace drops into a doctor's consultation screen: vitals, agenda, charts climbing
//   3. NETWORK  the screen gives way to a turning globe of connected doctors, then the ECG field returns
// No logos or brand names; every number is illustrative. Pure function of time,
// so frame 0 equals frame `duration`. Loaded by scripts/case-video.ts, after kit.js.

const kit = window.createKit({ accent: "#f9761f", accentSoft: "rgba(249,118,31,0.35)", duration: 8 });
const { W, H, WHITE, LINE, DIM, FAINT, SANS, ACCENT, ACCENT_SOFT, DURATION } = kit;
const { clamp01, lerp, spring, expoIn, expoOut, phase, life, fmt } = kit;
const { text, typed, seg, frame, hatch, squash, polyline, lit } = kit;

// 75 bpm = one beat every 0.8 s, so the loop holds exactly ten beats.
const BEAT = 0.8;

// One heartbeat (P wave, QRS complex, T wave) over a phase in [0, 1).
function ecg(u) {
  u = ((u % 1) + 1) % 1;
  const bump = (c, w, h) => h * Math.exp(-(((u - c) / w) ** 2));
  return (
    bump(0.18, 0.035, 0.14) -
    bump(0.3, 0.01, 0.12) +
    bump(0.33, 0.012, 1) -
    bump(0.37, 0.014, 0.28) +
    bump(0.58, 0.06, 0.26)
  );
}

// ---------------------------------------------------------------- act 1: ECG field

const TRACES = 18;
const SAMPLES = 320;
const X0 = -5.6;
const X1 = 5.6;
const PERIOD = 3.2; // world units per beat

const fieldProjector = kit.projector({ yaw: -0.18, cx: 960, cy: 560, s: 1, pitch: 0.5 }, { F: 2100, D: 15, pivotY: 0 });

// Screen points of one trace. `spread` pulls the traces together (1 = full field),
// `width` grows the field out of its centre.
function tracePoints(k, t, spread, width) {
  const z = k * 0.75 * spread;
  const amp = 1.25 * (1 - k / (TRACES + 6));
  const shift = t / BEAT + k * 0.11;
  const pts = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = lerp(X0, X1, i / SAMPLES) * width;
    const p = fieldProjector(x, amp * ecg(x / PERIOD - shift), z);
    pts.push([p.x, p.y]);
  }
  return pts;
}

function fieldState(t) {
  if (t < 3) return { spread: 1 - expoIn(phase(t, 2.25, 2.7)), width: 1, front: t < 2.7 };
  return { spread: 1, width: spring(t - 7.15, 9), front: true };
}

function field(ctx, t) {
  if (t > 2.75 && t < 7.15) return;
  const { spread, width } = fieldState(t);
  if (width <= 0.01) return;
  for (let k = TRACES - 1; k >= 1; k--) {
    if (spread < 0.02) break;
    ctx.strokeStyle = k < 4 ? LINE : k < 10 ? DIM : FAINT;
    ctx.lineWidth = k < 4 ? 1.6 : 1.2;
    polyline(ctx, tracePoints(k, t, spread, width));
  }
  if (t < 2.7 || t > 7.15) lit(ctx, () => polyline(ctx, tracePoints(0, t, spread, width)), 3.2);

  // Readouts around the field.
  const L = life(t, 0.3, 2.2, 12);
  squash(ctx, 540, L, () => {
    text(ctx, "FREQUÊNCIA CARDÍACA", 1770, 180, { size: 16, align: "right" });
    const beat = 1 - phase((t % BEAT) / BEAT, 0.3, 0.6);
    text(ctx, "75", 1690, 270, { size: 96, weight: 700, family: SANS, color: WHITE, align: "right", track: -0.02 });
    text(ctx, "BPM", 1770, 268, { size: 20, weight: 700, color: ACCENT, align: "right" });
    ctx.fillStyle = ACCENT;
    const s = 10 + 8 * beat;
    ctx.fillRect(1750 - s / 2, 190 + 14 - s / 2, s, s);
    text(ctx, "RITMO SINUSAL · ESTÁVEL", 1770, 310, { size: 15, color: LINE, align: "right" });
    text(ctx, "DERIVAÇÃO DII", 150, 900, { size: 15, color: ACCENT });
    text(ctx, "25 mm/s · 10 mm/mV · 12 CANAIS", 150, 930, { size: 15 });
  });
}

// ---------------------------------------------------------------- act 2: consultation

const TILE = { x: 600, y: 120, w: 280, h: 210 };
function tileEcg(t, morph) {
  // Mini ECG in the heart-rate tile; while morphing it comes from the big front trace.
  const pts = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const u = i / SAMPLES;
    const x = TILE.x + 20 + u * (TILE.w - 40);
    const wx = lerp(X0, X1, u);
    const y = TILE.y + 150 - 60 * ecg(wx / PERIOD - t / BEAT);
    pts.push([x, y]);
  }
  if (morph >= 1) return pts;
  const big = tracePoints(0, t, 1, 1);
  return pts.map(([x, y], i) => [lerp(big[i][0], x, morph), lerp(big[i][1], y, morph)]);
}

function consult(ctx, t) {
  if (t < 2.3 || t > 5.9) return;
  const OUT = 5.1;

  // The front trace flies into the heart-rate tile.
  const morph = spring(t - 2.4, 8);
  const tile = life(t, 2.7, OUT);
  squash(ctx, TILE.y + TILE.h / 2, { k: tile.k, p: 1 }, () => {
    lit(ctx, () => polyline(ctx, tileEcg(t, morph)), lerp(3.2, 2.2, morph));
  });

  // Vital-sign tiles.
  const vitals = [
    ["FREQUÊNCIA", "75", "bpm"],
    ["PRESSÃO", "120/80", "mmHg"],
    ["SATURAÇÃO", "98", "% SpO₂"],
    ["TEMPERATURA", "36,7", "°C"],
  ];
  vitals.forEach(([label, value, unit], i) => {
    const L = life(t, 2.65 + i * 0.08, OUT);
    const x = TILE.x + i * 297;
    squash(ctx, TILE.y + TILE.h / 2, L, () => {
      ctx.strokeStyle = i === 0 ? ACCENT : LINE;
      ctx.lineWidth = 2;
      frame(ctx, x, TILE.y, TILE.w, TILE.h, L.p);
      text(ctx, label, x + 20, TILE.y + 36, { size: 14 });
      text(ctx, value, x + 20, TILE.y + (i === 0 ? 84 : 120), {
        size: i === 0 ? 34 : 52,
        weight: 700,
        family: SANS,
        color: WHITE,
        track: 0,
      });
      text(ctx, unit, x + TILE.w - 20, TILE.y + 36, { size: 14, color: ACCENT, align: "right" });
      if (i === 2) {
        ctx.strokeStyle = FAINT;
        ctx.lineWidth = 6;
        seg(ctx, x + 20, TILE.y + 170, x + TILE.w - 20, TILE.y + 170);
        ctx.strokeStyle = ACCENT;
        seg(ctx, x + 20, TILE.y + 170, x + TILE.w - 20, TILE.y + 170, 0.98 * expoOut(phase(t, 2.9, 3.8)));
      }
      if (i === 1 || i === 3) {
        ctx.strokeStyle = DIM;
        ctx.lineWidth = 1.5;
        const spark = Array.from({ length: 20 }, (_, j) => [
          x + 20 + j * 12.6,
          TILE.y + 175 - 14 * Math.sin(j * 0.9 + i) * 0.5,
        ]);
        polyline(ctx, spark.slice(0, Math.round(20 * L.p)));
      }
    });
  });

  // Patient card.
  let L = life(t, 2.75, OUT);
  squash(ctx, 300, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 150, 120, 410, 360, L.p);
    ctx.strokeStyle = WHITE;
    ctx.beginPath();
    ctx.arc(225, 205, 46, 0, Math.PI * 2 * L.p);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(225, 192, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(225, 244, 28, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    text(ctx, "PACIENTE 0428", 292, 196, { size: 18, weight: 700, color: WHITE });
    text(ctx, "54 ANOS · RETORNO", 292, 224, { size: 14 });
    [
      ["ALERGIAS", "NENHUMA"],
      ["ÚLTIMA CONSULTA", "12/03"],
      ["CONDIÇÃO", "HIPERTENSÃO"],
      ["STATUS", "EM CONSULTA"],
    ].forEach(([k, v], i) => {
      const y = 310 + i * 40;
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      seg(ctx, 172, y + 14, 538, y + 14, L.p);
      text(ctx, k, 172, y, { size: 13 });
      text(ctx, typed(v, L.p * 1.5), 538, y, {
        size: 14,
        weight: 700,
        color: i === 3 ? ACCENT : WHITE,
        align: "right",
      });
    });
  });

  // Today's agenda.
  L = life(t, 2.85, OUT);
  squash(ctx, 740, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 150, 510, 410, 470, L.p);
    text(ctx, "AGENDA DE HOJE", 172, 552, { size: 16, weight: 700, color: WHITE });
    const rows = ["08:00", "09:30", "11:00", "14:30", "15:30", "16:30", "17:30"];
    const now = 3;
    rows.forEach((time, i) => {
      const y = 600 + i * 52;
      const done = i < now;
      const r = spring(t - 3.0 - i * 0.05, 16);
      if (r < 0.02) return;
      if (i === now) {
        ctx.fillStyle = ACCENT_SOFT;
        ctx.fillRect(160, y - 28, 390 * r, 44);
      }
      text(ctx, time, 172, y, { size: 16, color: i === now ? WHITE : done ? DIM : LINE });
      ctx.strokeStyle = i === now ? WHITE : DIM;
      ctx.lineWidth = 2;
      seg(ctx, 260, y - 6, 260 + 170 * r * (0.6 + 0.4 * Math.sin(i * 1.7) ** 2), y - 6);
      if (done) {
        ctx.strokeStyle = ACCENT;
        ctx.lineWidth = 2.5;
        seg(ctx, 512, y - 8, 518, y - 2);
        seg(ctx, 518, y - 2, 530, y - 15);
      }
    });
  });

  // Treatment adherence: a line that keeps climbing.
  L = life(t, 2.95, OUT);
  squash(ctx, 670, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 600, 370, 580, 610, L.p);
    text(ctx, "ADESÃO AO TRATAMENTO", 624, 412, { size: 16, weight: 700, color: WHITE });
    const reveal = expoOut(phase(t, 3.1, 4.6));
    text(ctx, `${fmt(54 + 38 * reveal)}%`, 1156, 412, { size: 22, weight: 700, color: ACCENT, align: "right" });
    const base = 900;
    const left = 640;
    const right = 1150;
    for (let g = 0; g <= 4; g++) {
      ctx.strokeStyle = g === 0 ? DIM : FAINT;
      ctx.lineWidth = 1;
      seg(ctx, left, base - g * 100, right, base - g * 100, L.p);
    }
    ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN"].forEach((m, i) => {
      text(ctx, m, left + (i * (right - left)) / 5, base + 34, { size: 13, align: "center", color: DIM });
    });
    const values = [0.32, 0.41, 0.48, 0.62, 0.74, 0.92];
    const pts = [];
    for (let i = 0; i <= 50; i++) {
      const u = i / 50;
      if (u > reveal) break;
      const f = u * 5;
      const a = Math.floor(Math.min(4, f));
      const v = lerp(values[a], values[a + 1], (1 - Math.cos((f - a) * Math.PI)) / 2);
      pts.push([left + u * (right - left), base - v * 400]);
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
      hatch(ctx, left, base - 420, right - left, 420, 8);
      ctx.restore();
      lit(ctx, () => polyline(ctx, pts), 3);
      values.forEach((v, i) => {
        if (i / 5 > reveal) return;
        ctx.fillStyle = "#0b0b0d";
        ctx.strokeStyle = WHITE;
        ctx.lineWidth = 2;
        const x = left + (i * (right - left)) / 5;
        ctx.fillRect(x - 7, base - v * 400 - 7, 14, 14);
        ctx.strokeRect(x - 7, base - v * 400 - 7, 14, 14);
      });
    }
  });

  // Digital prescription, typed and signed.
  L = life(t, 3.05, OUT);
  squash(ctx, 670, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 1220, 370, 550, 610, L.p);
    text(ctx, "PRESCRIÇÃO DIGITAL", 1244, 412, { size: 16, weight: 700, color: WHITE });
    const lines = [
      ["MEDICAMENTO A · 50 MG", "1 COMPRIMIDO AO DIA"],
      ["MEDICAMENTO B · 10 MG", "1 COMPRIMIDO À NOITE"],
      ["EXAME", "PERFIL LIPÍDICO"],
      ["RETORNO", "EM 30 DIAS"],
    ];
    lines.forEach(([a, b], i) => {
      const p = phase(t, 3.2 + i * 0.22, 3.5 + i * 0.22);
      const y = 470 + i * 92;
      text(ctx, typed(a, p * 1.3), 1244, y, { size: 17, weight: 700, color: WHITE, track: 0.06 });
      text(ctx, typed(b, p * 1.3 - 0.3), 1244, y + 28, { size: 14 });
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      seg(ctx, 1244, y + 48, 1746, y + 48, p);
    });
    const sign = spring(t - 4.25, 14);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(1244, 860, 502 * sign, 64);
    text(ctx, typed(t > 4.6 ? "ENVIADA AO PACIENTE ✓" : "ASSINAR DIGITALMENTE", sign * 1.4), 1495, 900, {
      size: 17,
      weight: 700,
      color: "#fff",
      align: "center",
    });
  });
}

// ---------------------------------------------------------------- act 3: network

// Doctors on a sphere (Fibonacci lattice), linked to their nearest neighbours.
const NODES = 240;
const SPHERE = Array.from({ length: NODES }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / NODES;
  const r = Math.sqrt(1 - y * y);
  const a = i * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(a) * r, y, Math.sin(a) * r];
});
const LINKS = [];
SPHERE.forEach((p, i) => {
  const near = SPHERE.map((q, j) => [j, (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2])
    .filter(([j]) => j > i)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2);
  for (const [j] of near) LINKS.push([i, j]);
});

function network(ctx, t) {
  if (t < 5.0 || t > 7.7) return;
  const grow = spring(t - 5.15, 8) * (1 - expoIn(phase(t, 6.9, 7.35)));
  if (grow <= 0.01) return;
  const R = 2.25 * grow;
  const project = kit.projector({ yaw: t * 0.5, cx: 960, cy: 560, s: 1, pitch: 0.25 }, { F: 1500, D: 9, pivotY: 0 });
  const pts = SPHERE.map(([x, y, z]) => project(x * R, y * R, z * R));
  const depthMid = 9;
  ctx.lineWidth = 1;
  for (const [i, j] of LINKS) {
    const a = pts[i];
    const b = pts[j];
    const back = (a.depth + b.depth) / 2 > depthMid;
    ctx.strokeStyle = back ? FAINT : DIM;
    seg(ctx, a.x, a.y, b.x, b.y);
  }
  // Consultations travelling along a few links.
  for (let k = 0; k < 18; k++) {
    const [i, j] = LINKS[(k * 23) % LINKS.length];
    const u = (t * 0.9 + k * 0.37) % 1;
    const a = pts[i];
    const b = pts[j];
    if ((a.depth + b.depth) / 2 > depthMid) continue;
    lit(ctx, () => seg(ctx, a.x, a.y, lerp(a.x, b.x, u), lerp(a.y, b.y, u)), 2.5);
  }
  pts.forEach((p, i) => {
    const front = p.depth < depthMid;
    const online = (i * 7) % 5 === 0;
    const s = front ? 6 : 4;
    ctx.fillStyle = online ? ACCENT : front ? WHITE : DIM;
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
  });

  // Panels: doctors count and weekly consultations, both climbing.
  const OUT = 6.9;
  let L = life(t, 5.35, OUT);
  squash(ctx, 300, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 150, 140, 380, 320, L.p);
    text(ctx, "MÉDICOS NA PLATAFORMA", 172, 184, { size: 15 });
    const n = Math.round(100 * expoOut(phase(t, 5.4, 6.5)));
    text(ctx, `${n}+`, 172, 290, { size: 96, weight: 700, family: SANS, color: WHITE, track: -0.02 });
    text(ctx, "CENTENAS EM CONSULTAS DIÁRIAS", 172, 340, { size: 13, color: ACCENT });
    text(ctx, "ONLINE AGORA", 172, 410, { size: 13 });
    ctx.fillStyle = ACCENT;
    ctx.fillRect(372, 398, 12, 12);
  });
  L = life(t, 5.45, OUT);
  squash(ctx, 720, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 1390, 480, 380, 440, L.p);
    text(ctx, "CONSULTAS / SEMANA", 1412, 524, { size: 15 });
    for (let i = 0; i < 8; i++) {
      const r = spring(t - 5.6 - i * 0.06, 14);
      const h = (60 + 240 * Math.pow(i / 7, 1.2)) * r;
      const x = 1412 + i * 42;
      ctx.strokeStyle = i === 7 ? ACCENT : LINE;
      ctx.lineWidth = 2;
      if (h > 1) ctx.strokeRect(x, 890 - h, 28, h);
      ctx.strokeStyle = i === 7 ? ACCENT_SOFT : FAINT;
      ctx.lineWidth = 1;
      if (h > 1) hatch(ctx, x, 890 - h, 28, h, 6);
    }
  });
  L = life(t, 5.55, OUT);
  squash(ctx, 820, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 150, 700, 380, 220, L.p);
    text(ctx, "PRONTUÁRIOS ATUALIZADOS HOJE", 172, 744, { size: 15 });
    text(ctx, fmt(1840 * expoOut(phase(t, 5.6, 6.6))), 172, 830, {
      size: 64,
      weight: 700,
      family: SANS,
      color: WHITE,
      track: -0.01,
    });
    text(ctx, "SINCRONIZADOS EM TEMPO REAL", 172, 880, { size: 13, color: ACCENT });
  });
  L = life(t, 5.4, OUT);
  squash(ctx, 300, L, () => {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    frame(ctx, 1390, 140, 380, 300, L.p);
    text(ctx, "DISPONIBILIDADE", 1412, 184, { size: 15 });
    const a = Math.PI * 1.5 * expoOut(phase(t, 5.5, 6.5));
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(1580, 320, 80, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();
    ctx.strokeStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(1580, 320, 80, Math.PI * 0.75, Math.PI * 0.75 + a * 0.999);
    ctx.stroke();
    text(ctx, `${fmt(99.9 * expoOut(phase(t, 5.5, 6.5)), 1)}%`, 1580, 330, {
      size: 28,
      weight: 700,
      family: SANS,
      color: WHITE,
      align: "center",
      track: 0,
    });
  });
}

function draw(ctx, t) {
  t = ((t % DURATION) + DURATION) % DURATION;
  kit.background(ctx);
  network(ctx, t);
  field(ctx, t);
  consult(ctx, t);
  kit.hud(ctx, t, ["PULSE", "CONSULT", "NETWORK"]);
}

window.scene = { width: W, height: H, duration: DURATION, fps: 30, bitrate: 1_600_000, draw };
