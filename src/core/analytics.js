/* ------------------------------------------------------------
   Analytics — thin wrapper over the existing gtag property.

   The `gtag()` shim is declared in <head> on both pages and
   pushes straight into dataLayer, so events sent before the
   remote script arrives are still delivered once it loads.
   Every call is guarded: analytics must never break the page.
   ------------------------------------------------------------ */

const fired = new Set();

/**
 * @param {string} name    snake_case event name
 * @param {object} [params]
 * @param {boolean} [once] fire at most once per page view
 */
export function track(name, params = {}, once = false) {
  if (once) {
    if (fired.has(name)) return;
    fired.add(name);
  }
  try {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  } catch {
    /* blocked or missing analytics is not an error */
  }
}

/**
 * Any element carrying `data-track="event_name"` reports a click.
 * Optional `data-track-label` rides along as the event's `label`.
 */
export function initClickTracking(scope = document) {
  scope.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target.closest("[data-track]") : null;
    if (!el) return;
    track(el.dataset.track, el.dataset.trackLabel ? { label: el.dataset.trackLabel } : {});
  });
}

/** Fire an event once, the first time `el` is at least half visible. */
export function trackOnView(el, name, params = {}) {
  if (!el) return;
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    track(name, params, true);
  }, { threshold: 0.5 });
  io.observe(el);
}
