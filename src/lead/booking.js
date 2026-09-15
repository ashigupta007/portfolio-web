import { SCHEDULING } from "./config.js";
import { track } from "../core/analytics.js";

/* ============================================================
   INTRO CALL — scheduling.

   The portfolio already runs on Calendly, so this reuses it
   rather than introducing a second provider. Nothing loads
   until a lead has actually been captured: the widget script
   is fetched on first reveal and never on page load.
   ============================================================ */

const SCRIPT = "https://assets.calendly.com/assets/external/widget.js";

/** Calendly reads these from the URL and paints itself in the site's palette. */
function themedUrl() {
  const url = new URL(SCHEDULING.url);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("hide_landing_page_details", "1");
  url.searchParams.set("background_color", "0d0d0c");
  url.searchParams.set("text_color", "f2efe9");
  url.searchParams.set("primary_color", "c9b08a");
  return url.toString();
}

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.Calendly) return resolve();
    const existing = document.querySelector(`script[src="${SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.append(script);
  });
}

const started = new WeakSet();

/** @param {ParentNode} scope container holding the booking block */
export async function revealBooking(scope = document) {
  const block = scope.querySelector("[data-booking]");
  const mount = block?.querySelector("[data-calendly-mount]");
  if (!block || !mount) return;

  block.hidden = false;
  if (started.has(block)) return;
  started.add(block);

  track("ux_audit_booking_started", { duration: SCHEDULING.duration });

  try {
    await loadScript();
    if (!window.Calendly) throw new Error("Calendly unavailable");
    mount.replaceChildren();
    window.Calendly.initInlineWidget({ url: themedUrl(), parentElement: mount });
  } catch {
    // the scheduler is third-party; if it can't load, the visitor still gets
    // a working link rather than an empty box
    mount.innerHTML = `
      <p class="booking-fallback">
        The scheduler couldn't load here.
        <a href="${SCHEDULING.url}" target="_blank" rel="noopener">Open the calendar in a new tab</a>
        to pick a time.
      </p>`;
  }
}

/** Markup for the booking step. Hidden until a lead is captured. */
export function bookingMarkup() {
  return `
    <div class="booking" data-booking hidden>
      <div class="booking-head">
        <h3 class="booking-h">Choose a time</h3>
        <p class="booking-p">${SCHEDULING.duration}. If nothing here works, reply to the confirmation email and we'll find a slot.</p>
      </div>
      <div class="booking-mount" data-calendly-mount>
        <p class="booking-loading">Loading the calendar…</p>
      </div>
    </div>`;
}

/* Calendly reports scheduling back over postMessage. */
window.addEventListener("message", (e) => {
  if (typeof e.origin !== "string" || !e.origin.endsWith("calendly.com")) return;
  if (e.data?.event === "calendly.event_scheduled") {
    track("ux_audit_booking_completed", {}, true);
    document.querySelectorAll("[data-booking]").forEach((b) => b.classList.add("is-booked"));
  }
});
