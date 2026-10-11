// Deterministic generative art for project covers and the social image.
// Pure functions (no DOM, no Math.random): the same seed always yields the same
// shapes, so pre-rendered HTML and the first browser render are identical.

export type CoverVariant = "mesh" | "circuits" | "waves" | "nodes";

export interface CoverPath {
  d: string;
  opacity: number;
}

export interface CoverDot {
  x: number;
  y: number;
  r: number;
  opacity: number;
}

export interface CoverArt {
  variant: CoverVariant;
  paths: CoverPath[];
  dots: CoverDot[];
}

export interface CoverSize {
  width: number;
  height: number;
}

export const COVER_SIZE: CoverSize = { width: 800, height: 600 };

const VARIANTS: readonly CoverVariant[] = ["mesh", "circuits", "waves", "nodes"];

/** FNV-1a: a small, stable string hash. */
export function hashSeed(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: a tiny seeded PRNG returning floats in [0, 1). */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const variantFor = (seed: string): CoverVariant => VARIANTS[hashSeed(seed) % VARIANTS.length];

// One decimal keeps the markup small and hides last-bit float differences
// between JavaScript engines.
const round = (value: number) => Math.round(value * 10) / 10;
const polyline = (points: [number, number][]) =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${round(x)} ${round(y)}`).join("");

function mesh(random: () => number, { width, height }: CoverSize): CoverArt {
  const rows = 22;
  const phaseA = random() * Math.PI * 2;
  const phaseB = random() * Math.PI * 2;
  const freqA = 0.004 + random() * 0.004;
  const freqB = 0.011 + random() * 0.006;
  const paths: CoverPath[] = [];

  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    const baseY = height * 0.3 + t ** 1.7 * height * 0.78;
    const amplitude = 8 + t * 46;
    const points: [number, number][] = [];
    for (let x = 0; x <= width; x += 16) {
      const wave = Math.sin(x * freqA + phaseA + t * 3) + 0.5 * Math.sin(x * freqB + phaseB - t * 2);
      points.push([x, baseY - amplitude * wave]);
    }
    paths.push({ d: polyline(points), opacity: round(0.12 + 0.6 * t) });
  }
  return { variant: "mesh", paths, dots: [] };
}

function waves(random: () => number, { width, height }: CoverSize): CoverArt {
  const count = 16;
  const paths: CoverPath[] = [];

  for (let line = 0; line < count; line++) {
    const t = line / (count - 1);
    const baseY = height * (0.15 + 0.7 * t);
    const amplitude = 14 + random() * 40;
    const freq = 0.006 + random() * 0.012;
    const phase = random() * Math.PI * 2;
    const points: [number, number][] = [];
    for (let x = 0; x <= width; x += 10) {
      const envelope = Math.sin((x / width) * Math.PI);
      points.push([x, baseY + Math.sin(x * freq + phase) * amplitude * envelope]);
    }
    paths.push({ d: polyline(points), opacity: round(0.18 + 0.5 * random()) });
  }
  return { variant: "waves", paths, dots: [] };
}

function circuits(random: () => number, { width, height }: CoverSize): CoverArt {
  const cell = 40;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const paths: CoverPath[] = [];
  const dots: CoverDot[] = [];

  for (let trace = 0; trace < 16; trace++) {
    let col = Math.floor(random() * cols);
    let row = Math.floor(random() * rows);
    const points: [number, number][] = [[col * cell, row * cell]];
    dots.push({ x: col * cell, y: row * cell, r: 3, opacity: 0.8 });

    // Orthogonal runs with an occasional 45-degree jog, like a PCB trace.
    for (let step = 0; step < 6; step++) {
      const horizontal = step % 2 === 0;
      const run = (1 + Math.floor(random() * 4)) * (random() < 0.5 ? -1 : 1);
      if (horizontal) col = Math.min(cols, Math.max(0, col + run));
      else row = Math.min(rows, Math.max(0, row + run));
      points.push([col * cell, row * cell]);
      if (random() < 0.3) {
        col = Math.min(cols, Math.max(0, col + 1));
        row = Math.min(rows, Math.max(0, row + 1));
        points.push([col * cell, row * cell]);
      }
    }
    const [endX, endY] = points[points.length - 1];
    dots.push({ x: endX, y: endY, r: 5, opacity: 0.9 });
    paths.push({ d: polyline(points), opacity: round(0.25 + 0.5 * random()) });
  }
  return { variant: "circuits", paths, dots };
}

function nodes(random: () => number, { width, height }: CoverSize): CoverArt {
  const points: [number, number][] = Array.from({ length: 56 }, () => [random() * width, random() * height]);
  const paths: CoverPath[] = [];
  const reach = 150;

  points.forEach(([x, y], i) => {
    for (let j = i + 1; j < points.length; j++) {
      const distance = Math.hypot(points[j][0] - x, points[j][1] - y);
      const opacity = round(0.55 * (1 - distance / reach));
      // Links at the edge of `reach` round to zero: skip them instead of shipping invisible paths.
      if (distance < reach && opacity > 0) paths.push({ d: polyline([[x, y], points[j]]), opacity });
    }
  });
  const dots = points.map(([x, y]) => ({ x: round(x), y: round(y), r: round(1.5 + random() * 3), opacity: 0.85 }));
  return { variant: "nodes", paths, dots };
}

const GENERATORS: Record<CoverVariant, (random: () => number, size: CoverSize) => CoverArt> = {
  mesh,
  waves,
  circuits,
  nodes,
};

/** Builds the artwork for a seed (a project id); `variant` overrides the seeded choice. */
export function generateCover(seed: string, size: CoverSize = COVER_SIZE, variant = variantFor(seed)): CoverArt {
  return GENERATORS[variant](createRandom(hashSeed(seed)), size);
}
