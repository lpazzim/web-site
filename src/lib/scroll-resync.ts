const instant = { behavior: "instant" } as const;

/**
 * Makes scroll-driven effects pick up a restored scroll position.
 *
 * On a reload in the middle of a page, the browser (and React Router's
 * <ScrollRestoration>) put the page back at its old position before Motion is
 * ready: `m.*` components only follow their motion values once the lazily
 * loaded animation features arrive (see root.tsx), and nothing moves after that
 * until the visitor scrolls again. Meanwhile everything driven by the scroll
 * stayed at "top of the page": the home hero was fully opaque over the carousel
 * (and caught clicks), the carousel did not turn and the header read 000 %.
 *
 * Moving the page 1 px up and back is a real scroll every listener reacts to
 * (a synthetic "scroll" event at the same position is not enough); the 1 px for
 * one frame is not visible. Called once the features have loaded.
 */
export function resyncScrollPosition() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (window.scrollY <= 0) return;
      window.scrollBy({ top: -1, ...instant });
      requestAnimationFrame(() => window.scrollBy({ top: 1, ...instant }));
    });
  });
}
