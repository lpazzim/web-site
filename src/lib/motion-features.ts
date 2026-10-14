// Motion's animation engine (gestures, whileInView, exit animations, the DOM
// renderer), loaded as its own chunk by <LazyMotion> in root.tsx so it stays out
// of the JavaScript needed for the first paint. Components use `m.*`, not `motion.*`.
export { domAnimation as default } from "motion/react";
