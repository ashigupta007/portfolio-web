import { SCHEDULING } from "./config.js";
import { track } from "../core/analytics.js";
import { reduceMotion } from "../core/motion.js";

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
  // our own heading already says what this is and how long it takes
  url.searchParams.set("hide_event_type_details", "1");
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

/**
 * What the visitor just typed into our form, handed to Calendly so the
 * "Enter Details" step is already filled in. Asking for a name and email
 * twice in one flow is the weakest point in a booking journey.
 */
function prefillFrom(lead) {
  if (!lead) return {};
  const prefill = {};
  if (lead.name) prefill.name = lead.name;
  if (lead.email) prefill.email = lead.email;

  const question = SCHEDULING.customQuestion;
  const context = [lead.productUrl, lead.primaryConcern].filter(Boolean).join(" — ");
  if (question && context) prefill.customAnswers = { [question]: context };

  return prefill;
}

/**
 * Which CTA produced this booking, readable in Calendly on the invite itself:
 * hero, a pricing tier, the nav, or the modal opening on its own.
 */
function utmFrom(lead) {
  return {
    utmSource: "ashish-gupta.com",
    utmMedium: location.pathname.startsWith("/ux-audit") ? "ux-audit" : "portfolio",
    utmCampaign: "ux-audit-intro-call",
    utmContent: lead?.source || "unknown",
  };
}

const started = new WeakSet();

/**
 * @param {ParentNode} scope container holding the booking block
 * @param {object} [lead] the submitted form values, used to prefill Calendly
 */
export async function revealBooking(scope = document, lead = null) {
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
    window.Calendly.initInlineWidget({
      url: themedUrl(),
      parentElement: mount,
      prefill: prefillFrom(lead),
      utm: utmFrom(lead),
    });

    // In the modal the calendar sits below the confirmation copy; on a phone
    // that leaves it mostly offscreen. Bring it up so the dates are what the
    // visitor sees. Only in the dialog — on the page, the "Thanks" message
    // has just been scrolled into view deliberately.
    if (block.closest("dialog")) {
      requestAnimationFrame(() =>
        block.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" })
      );
    }
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
