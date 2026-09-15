/* ============================================================
   MOTION CORE
   One rAF loop shared by every animated system on the site.
   Systems register a tick and de-register when offscreen, so
   the loop costs nothing when nothing is visible.
   ============================================================ */

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
export const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EASE_INOUT = "cubic-bezier(0.65, 0, 0.35, 1)";

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;

const ticks = new Set();
let rafId = null;

function loop(now) {
  for (const t of ticks) t(now);
  rafId = ticks.size ? requestAnimationFrame(loop) : null;
}

export function addTick(fn) {
  ticks.add(fn);
  if (rafId === null) rafId = requestAnimationFrame(loop);
}

export function removeTick(fn) {
  ticks.delete(fn);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden && rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  } else if (!document.hidden && ticks.size && rafId === null) {
    rafId = requestAnimationFrame(loop);
  }
});

/* ------------------------------------------------------------
   Scroll state — one passive listener, read by all systems.
   ------------------------------------------------------------ */
export const view = { scrollY: window.scrollY, height: window.innerHeight };

window.addEventListener("scroll", () => { view.scrollY = window.scrollY; }, { passive: true });
window.addEventListener("resize", () => { view.height = window.innerHeight; }, { passive: true });

/* ------------------------------------------------------------
   Visibility helpers — every demo on the site is gated by one
   of these so offscreen work never runs.
   ------------------------------------------------------------ */

/**
 * A `[data-reveal="mask"]` wrapper clips its inner frame with
 * `clip-path: inset(100% 0 0 0)` until it scrolls in, and Chromium reports a
 * fully clipped element as non-intersecting — and does not re-notify when the
 * clip later animates open. Gating a demo on its own root therefore reports
 * "offscreen" forever. Observe the uncipped wrapper instead; it covers exactly
 * the same region.
 */
const visibilityProxy = (el) => el.closest?.('[data-reveal="mask"]') ?? el;

/** Run `enter` when `el` scrolls into view, `exit` when it leaves. Returns a disposer. */
export function whenVisible(el, enter, exit, options = {}) {
  if (!el) return () => {};
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) enter?.(entry);
    else exit?.(entry);
  }, { threshold: 0.15, ...options });
  io.observe(visibilityProxy(el));
  return () => io.disconnect();
}

/**
 * Run `fn` once, the first time any part of `el` comes into view.
 *
 * threshold stays 0 deliberately: it is a ratio of the *target*, so a tall
 * section (the work list runs to several thousand pixels) would never reach
 * a fractional threshold from a rootMargin preload, and the callback would
 * fire far later than intended — or not at all.
 */
export function onceVisible(el, fn, options = {}) {
  if (!el) return;
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    fn(entry);
  }, { threshold: 0, ...options });
  io.observe(el);
}

/* ------------------------------------------------------------
   Interval that only runs while its element is on screen, and
   pauses with the tab. Used by every looping product demo.
   ------------------------------------------------------------ */
export function visibleInterval(el, ms, fn, options = {}) {
  if (reduceMotion.matches) return () => {};
  let last = 0;
  const tick = (now) => {
    if (now - last < ms) return;
    last = now;
    fn();
  };
  return whenVisible(
    el,
    () => { last = performance.now(); addTick(tick); },
    () => removeTick(tick),
    options
  );
}
