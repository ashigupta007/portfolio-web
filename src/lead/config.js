/* ============================================================
   LEAD CAPTURE — configuration shared by both pages.

   The enquiry form and its scheduling step appear on the
   portfolio and on /ux-audit, so their settings live here
   rather than inside either page's own config.
   ============================================================ */

/* ------------------------------------------------------------
   Integrations — plain constants, edited right here.

   Neither value is a secret. A Formspree form id is a public
   endpoint by design (spam handling happens on Formspree's side)
   and the Calendly URL is a link people click. Nothing here needs
   to be hidden, so nothing here needs to be an environment
   variable — and a constant can't be missing on one deploy target
   and present on another.
   ------------------------------------------------------------ */

/**
 * Formspree form id — the last path segment of the endpoint:
 *   https://formspree.io/f/meaqydwv   →   "meaqydwv"
 *
 * Emptying it is safe: the form still validates and, on submit, tells
 * the visitor to email FALLBACK_EMAIL rather than failing silently or
 * pretending to have sent anything.
 */
export const FORMSPREE_ID = "meaqydwv";

export const FORMSPREE_ENDPOINT = FORMSPREE_ID
  ? `https://formspree.io/f/${FORMSPREE_ID}`
  : "";

/** Where enquiries land if the form itself is unavailable. */
export const FALLBACK_EMAIL = "love4css@gmail.com";

/**
 * Scheduling. The portfolio already runs on Calendly, so this reuses it
 * rather than adding a second provider.
 *
 * "Product UX Review — Intro Call", a dedicated 45-minute event. The
 * homepage Contact section deliberately still links the separate hiring
 * conversation event; the two funnels shouldn't share a calendar.
 *
 * Keep `duration` in step with the event — it's printed directly above
 * the embedded calendar.
 */
export const SCHEDULING = {
  url: "https://calendly.com/love4css/product-ux-review-intro-call",
  duration: "45 minutes",
};

/* ------------------------------------------------------------
   The form.

   Cut from eleven fields to six. Everything removed was either
   derivable (company, from the work-email domain) or genuinely
   intro-call material (product type, review areas, timeline,
   free-text context). A first contact should cost under a minute;
   qualification is what the call is for.
   ------------------------------------------------------------ */
export const ROLES = [
  "Founder / Co-founder",
  "Product",
  "Design",
  "Engineering",
  "Growth",
  "Other",
];

export const SCOPE = [
  "Not sure yet",
  "1–10 screens",
  "10–25 screens",
  "25–50 screens",
  "50–100 screens",
  "100+ screens",
];

/* ------------------------------------------------------------
   Auto-open.

   Deliberately conservative. The common recommendation for
   time-triggered prompts is 30–60 seconds — under ~5s reads as an
   ambush and depresses conversion — with scroll depth around
   half the page as the other usual trigger. Google's intrusive
   interstitial guidance also rules out anything that covers
   content immediately on arrival, particularly on mobile.

   So: whichever of these the visitor reaches first, never before
   real engagement, and at most once a month.
   ------------------------------------------------------------ */
export const AUTO_OPEN = {
  /** ms of time on the page */
  afterMs: 45000,
  /** fraction of the page scrolled */
  afterScroll: 0.55,
  /** desktop only — pointer leaving toward the browser chrome */
  exitIntent: true,
  /** don't ask again for this many days after a dismissal */
  snoozeDays: 30,
  /** localStorage key holding the snooze timestamp */
  storageKey: "ag.lead.snoozeUntil",
};
