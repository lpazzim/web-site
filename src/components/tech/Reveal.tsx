import { m, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";

/** Slides its content up from behind a mask when it scrolls into view. */
export function TextReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <m.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: 0 } : { y: "100%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </m.div>
    </div>
  );
}

/** Endless horizontal ticker; the direction follows the sign of `baseVelocity`. */
export function ParallaxText({ children, baseVelocity = 1 }: { children: ReactNode; baseVelocity?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap flex">
      <m.div
        className="flex gap-8"
        animate={{ x: baseVelocity > 0 ? [0, -1000] : [-1000, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-[8vw] md:text-[6vw] uppercase tracking-tighter font-serif opacity-10">
            {children}
          </span>
        ))}
      </m.div>
    </div>
  );
}
