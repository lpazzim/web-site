import { motion } from "motion/react";

/** "Scroll to explore" prompt with a line that keeps sliding down. */
export function ScrollCue({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`text-hud flex items-center gap-4 ${className}`}>
      <span className="relative block h-12 w-px overflow-hidden bg-separator" aria-hidden="true">
        <motion.span
          className="absolute inset-x-0 top-0 block h-1/2 bg-primary"
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
      <span>{label}</span>
    </div>
  );
}
