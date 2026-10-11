import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

const SEEN_KEY = "intro-seen";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const DURATION_SECONDS = 1.8;

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Private mode: the intro may replay on the next visit, which is harmless.
  }
}

function wasSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

const getSnapshot = () => !wasSeen() && !window.matchMedia(REDUCED_MOTION_QUERY).matches;
// Never part of the pre-rendered HTML or the hydrating render.
const getServerSnapshot = () => false;

const LINES = ["Lucas", "Pazzim"] as const;

/**
 * Boot-style opening shown once per browser session, only with motion allowed.
 * Skippable with the button, Enter, Space or Escape.
 */
export function Intro() {
  const { t } = useTranslation();
  const shouldPlay = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const skipRef = useRef<HTMLButtonElement>(null);
  const progress = useMotionValue(0);
  const counter = useTransform(progress, (value) => String(Math.round(value)).padStart(3, "0"));
  const visible = shouldPlay && !dismissed;

  const bar = useTransform(progress, [0, 100], [0, 1]);

  const dismiss = () => {
    markSeen();
    setDismissed(true);
  };

  useEffect(() => {
    if (!visible) return;

    skipRef.current?.focus();
    const finish = () => {
      markSeen();
      setDismissed(true);
    };
    const controls = animate(progress, 100, { duration: DURATION_SECONDS, ease: "easeInOut", onComplete: finish });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      controls.stop();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [visible, progress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t("intro.label")}
          className="fixed inset-0 z-200 flex flex-col justify-between bg-background px-6 py-8 md:px-12 md:py-12 bg-grid"
          initial={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
        >
          <div className="flex items-start justify-between text-hud">
            <span>{t("intro.label")}</span>
            <button
              ref={skipRef}
              type="button"
              onClick={dismiss}
              className="text-hud border border-separator px-3 py-2 transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              {t("intro.skip")} · Esc
            </button>
          </div>

          <p className="text-[16vw] leading-[0.82] font-semibold tracking-tighter uppercase md:text-[11vw]">
            {LINES.map((line, index) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className={`block ${index === 1 ? "text-primary glow-text" : ""}`}
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.15 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </p>

          <div className="flex items-end justify-between gap-6">
            <div className="h-px flex-1 bg-separator">
              <motion.div className="h-px origin-left bg-primary" style={{ scaleX: bar }} />
            </div>
            <span className="text-hud tabular-nums">
              <motion.span>{counter}</motion.span> / 100
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
