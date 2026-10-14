// Shared drawing kit for the case-study cover clips (scripts/case-videos/<id>.js).
// Loaded before the scene by scripts/case-video.ts; a scene calls
// `createKit({ accent, accentSoft, duration })` and destructures what it needs.
// Everything here is a pure function of its inputs, so scenes stay deterministic.
//
// Visual rules shared by every clip: dark HUD background with a 48 px grid, one
// accent colour per company, lines lit as accent with a white core, critically
// damped springs (nothing overshoots), elements that draw on and collapse out,
// and a frame 0 identical to the last frame.
(() => {
  const W = 1920;
  const H = 1080;
  const BG = "#0b0b0d";
  const WHITE = "rgba(255,255,255,0.92)";
  const LINE = "rgba(255,255,255,0.5)";
  const DIM = "rgba(255,255,255,0.22)";
  const FAINT = "rgba(255,255,255,0.08)";
  const MONO = "JetBrains Mono";
  const SANS = "Space Grotesk";

  // ------------------------------------------------------------ timing

  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  // Critically damped spring: lands on the target without overshooting.
  const spring = (x, w = 14) => (x <= 0 ? 0 : 1 - (1 + w * x) * Math.exp(-w * x));
  const expoIn = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, 10 * x - 10));
  const expoOut = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const phase = (t, a, b) => clamp01((t - a) / (b - a));

  // Element lifetime: grows in with a spring at `tin`, collapses with an
  // exponential ease-in at `tout`. Returns draw progress and the collapse scale.
  const life = (t, tin, tout, w = 14) => ({ p: spring(t - tin, w), k: 1 - expoIn((t - tout) / 0.4) });

  // A value that follows a chain of target functions, springing from one to the next.
  function track(t, segments) {
    let value = segments[0].f(t);
    for (let i = 1; i < segments.length; i++) {
      const s = segments[i];
      if (t < s.t) break;
      value = lerp(value, s.f(t), spring(t - s.t, s.w ?? 10));
    }
    return value;
  }

  const fmt = (n, digits = 0) =>
    n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

  // ------------------------------------------------------------ 2D

  function text(ctx, s, x, y, o = {}) {
    const size = o.size ?? 18;
    ctx.font = `${o.weight ?? 500} ${size}px "${o.family ?? MONO}"`;
    ctx.letterSpacing = `${(o.track ?? 0.14) * size}px`;
    ctx.textAlign = o.align ?? "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = o.color ?? LINE;
    ctx.fillText(s, x, y);
    ctx.letterSpacing = "0px";
  }

  // Text typed on character by character as p goes 0 -> 1.
  const typed = (s, p) => s.slice(0, Math.round(s.length * clamp01(p)));

  function seg(ctx, x0, y0, x1, y1, p = 1) {
    if (p <= 0) return;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(lerp(x0, x1, p), lerp(y0, y1, p));
    ctx.stroke();
  }

  // Rectangle outline drawn on like a pen going round it.
  function frame(ctx, x, y, w, h, p = 1) {
    if (p <= 0) return;
    const perimeter = 2 * (w + h);
    ctx.setLineDash([perimeter * p, perimeter]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }

  function hatch(ctx, x, y, w, h, gap = 9) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.beginPath();
    for (let d = -h; d < w; d += gap) {
      ctx.moveTo(x + d, y + h);
      ctx.lineTo(x + d + h, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Runs fn squashed vertically around cy by k (the collapse exit). Content
  // only shows once its frame has started drawing (p), so labels never float alone.
  // `state` is a collapse scale, or a life() result.
  function squash(ctx, cy, state, fn) {
    const { k, p } = typeof state === "number" ? { k: state, p: 1 } : state;
    if (k <= 0.002 || p <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = clamp01(p * 1.5);
    ctx.translate(0, cy);
    ctx.scale(1, k);
    ctx.translate(0, -cy);
    fn();
    ctx.restore();
  }

  function polyline(ctx, pts) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }

  function grid(ctx) {
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 48) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
    }
    for (let y = 12; y <= H; y += 48) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
    }
    ctx.stroke();
  }

  // ------------------------------------------------------------ 3D

  // Yaw/pitch around a pivot, then perspective. `s` scales the projection so the
  // same model works full screen or as a thumbnail.
  function projector({ yaw, cx, cy, s, pitch }, camera = {}) {
    const { F = 2500, D = 11, pivotY = 0.75 } = camera;
    const p = pitch ?? camera.pitch ?? 0.3;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(p);
    const sinP = Math.sin(p);
    return (x, y, z) => {
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y1 = y - pivotY;
      const y2 = y1 * cosP + z1 * sinP;
      const z2 = -y1 * sinP + z1 * cosP;
      const depth = z2 + D;
      return { x: cx + (s * F * x1) / depth, y: cy - (s * F * y2) / depth, depth };
    };
  }

  // Draws a 3D polyline; points behind the near plane break the line.
  function path3(ctx, project, pts, closed = false) {
    ctx.beginPath();
    let open = false;
    const list = closed ? [...pts, pts[0]] : pts;
    for (const [x, y, z] of list) {
      const p = project(x, y, z);
      if (p.depth < 2) {
        open = false;
        continue;
      }
      if (open) ctx.lineTo(p.x, p.y);
      else ctx.moveTo(p.x, p.y);
      open = true;
    }
    ctx.stroke();
  }

  function circle3(cx, cy, cz, r, plane, n = 32) {
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      if (plane === "xy") return [cx + r * Math.cos(a), cy + r * Math.sin(a), cz];
      if (plane === "yz") return [cx, cy + r * Math.cos(a), cz + r * Math.sin(a)];
      return [cx + r * Math.cos(a), cy, cz + r * Math.sin(a)];
    });
  }

  window.createKit = ({ accent, accentSoft, duration }) => {
    // A line drawn as light: accent body with a thin white core.
    function lit(ctx, draw, width = 2.5, color = accent) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      draw();
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = Math.max(0.8, width * 0.3);
      draw();
    }

    // Corner label per act (typed in at the start of the act, out before the
    // next, so the loop point is clean), beat counter and corner brackets.
    function hud(ctx, t, acts) {
      const length = duration / acts.length;
      const act = Math.min(acts.length - 1, Math.floor(t / length));
      const local = t - act * length;
      const label = `FIG. 0${act + 1} — ${acts[act]}`;
      text(ctx, typed(label, Math.min(local / 0.3, (length - local) / 0.25)), 150, 66, {
        size: 20,
        color: LINE,
        track: 0.2,
      });
      const beats = Math.round(duration * 2);
      const beat = Math.floor(t * 2) + 1;
      text(ctx, `BEAT ${String(beat).padStart(2, "0")} / ${beats}`, 1770, 1030, {
        size: 20,
        color: LINE,
        align: "right",
        track: 0.2,
      });
      ctx.strokeStyle = DIM;
      ctx.lineWidth = 2;
      for (const [x, y, dx, dy] of [
        [40, 40, 1, 1],
        [1880, 40, -1, 1],
        [40, 1040, 1, -1],
        [1880, 1040, -1, -1],
      ]) {
        ctx.beginPath();
        ctx.moveTo(x, y + dy * 36);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx * 36, y);
        ctx.stroke();
      }
    }

    // Clears the frame and sets the common stroke style.
    function background(ctx) {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      grid(ctx);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
    }

    return {
      W,
      H,
      BG,
      WHITE,
      LINE,
      DIM,
      FAINT,
      MONO,
      SANS,
      ACCENT: accent,
      ACCENT_SOFT: accentSoft,
      DURATION: duration,
      clamp01,
      lerp,
      spring,
      expoIn,
      expoOut,
      phase,
      life,
      track,
      fmt,
      text,
      typed,
      seg,
      frame,
      hatch,
      squash,
      polyline,
      grid,
      background,
      projector,
      path3,
      circle3,
      lit,
      hud,
    };
  };
})();
