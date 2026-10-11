import { COVER_SIZE, generateCover } from "@/lib/cover-art";

/**
 * Generative line art for a project cover, drawn with the surrounding
 * `--cover-accent` color. Deterministic per seed, so SSR and hydration match.
 */
export function CoverArt({ seed }: { seed: string }) {
  const { paths, dots } = generateCover(seed);

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${COVER_SIZE.width} ${COVER_SIZE.height}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      fill="none"
      stroke="var(--cover-accent)"
      strokeWidth={1}
    >
      {paths.map((path, index) => (
        <path key={index} d={path.d} opacity={path.opacity} vectorEffect="non-scaling-stroke" />
      ))}
      {dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          opacity={dot.opacity}
          fill="var(--cover-accent)"
          stroke="none"
        />
      ))}
    </svg>
  );
}
