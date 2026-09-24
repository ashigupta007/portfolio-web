/* ============================================================
   UX AUDIT — CONFIGURATION

   Everything commercial or illustrative on /ux-audit lives here
   and nowhere else: pricing, the sample findings, the sample
   score and the audit matrix. Change a number here and the
   page follows.

   The enquiry form and scheduling live in src/lead/config.js,
   since both pages use them.
   ============================================================ */

/* ------------------------------------------------------------
   Engagements — the single source for every scope promise on the
   page. The comparison table, the mobile cards and the custom tier
   are all rendered from this.

   Deliberately no prices: a number shown before the scope is known
   is either wrong or anchors the conversation in the wrong place.
   Quoting happens after the intro call.

   A value of `true` renders as included, `false` as not included,
   and any string is shown as written.
   ------------------------------------------------------------ */
export const PRICING = {
  tiers: [
    {
      id: "health-check",
      name: "UX Health Check",
      bestFor: "One problematic journey",
      cta: "Start with a Health Check",
    },
    {
      id: "product-audit",
      name: "Product UX Audit",
      bestFor: "A full SaaS product review",
      cta: "Book a Product UX Audit",
      featured: true,
    },
  ],

  groups: [
    {
      title: "Scope",
      rows: [
        { label: "Workflows", values: ["1 workflow", "3–5 critical workflows"] },
        { label: "Findings", values: ["~8–15 strong findings", "~30–60 verified findings"] },
      ],
    },
    {
      title: "Review",
      rows: [
        { label: "Manual review", values: [true, true] },
        { label: "Agentic exploration", values: ["Light", "Full"] },
        { label: "Severity & prioritisation", values: [true, true] },
        { label: "Screenshots & evidence", values: [true, true] },
        { label: "Engineering-aware recommendations", values: ["Basic", "Detailed"] },
      ],
    },
    {
      title: "Report",
      rows: [
        { label: "Executive summary", values: [false, true] },
        { label: "Pattern & root-cause analysis", values: [false, true] },
      ],
    },
    {
      title: "Engagement",
      rows: [
        { label: "Walkthrough", values: ["30 minutes", "60 minutes"] },
        { label: "Revision", values: ["Clarifications only", "1 consolidated iteration"] },
        { label: "Payment", values: ["100% upfront", "50% upfront, 50% before the full report"] },
      ],
    },
  ],

  custom: {
    name: "Deep Product Audit",
    summary: "Beyond five workflows, or products with complex roles, permissions and multi-tenant surfaces.",
    cta: "Talk about a larger scope",
  },
};

export const PRICING_NOTE =
  "Every engagement is quoted after the intro call, once the scope is real — how many workflows, how complex the product, what access is needed. Scope, deliverables, timeline and payment terms are all agreed in writing before any work starts.";

/* ------------------------------------------------------------
   Sample audit — clearly illustrative, never a real client
   ------------------------------------------------------------ */
export const SAMPLE_SCORE = {
  overall: 71,
  breakdown: [
    { label: "Navigation", value: 82 },
    { label: "Forms", value: 63 },
    { label: "Tables", value: 69 },
    { label: "Consistency", value: 58 },
    { label: "Feedback & states", value: 76 },
    { label: "Accessibility", value: 61 },
    { label: "Discoverability", value: 72 },
  ],
};

/** 48 in total — inside the Product UX Audit's ~30–60, which is what the sample is labelled as. */
export const SEVERITIES = [
  { key: "critical", label: "Critical", count: 3 },
  { key: "high", label: "High", count: 11 },
  { key: "medium", label: "Medium", count: 22 },
  { key: "low", label: "Low", count: 12 },
];

export const SEVERITY_BASIS =
  "Severity weighs user impact against how often the workflow runs, how central it is, and what it costs the business when it goes wrong. It is a judgement call, made consistently — not a formula.";

/**
 * Illustrative findings written in the format the real report uses.
 * They describe patterns common to operational SaaS products; they
 * are not drawn from, and do not describe, any client's product.
 */
export const SAMPLE_FINDINGS = [
  {
    id: "UX-042",
    severity: "high",
    module: "Finance → Recharge History",
    workflow: "Reviewing past wallet recharges",
    category: "Discoverability",
    source: "Agent discovered → Human verified",
    userImpact: "Medium",
    complexity: "Low",
    confidence: "High",
    problem:
      "Save View is exposed in a workflow where reusable views provide no meaningful value. The screen has two filters, both of which reset on every visit.",
    evidence:
      "Save View appears in the toolbar on Recharge History, Invoice History and Passbook. Saving a view and returning to the screen loads the default filter set regardless.",
    impact:
      "Creates a misleading expectation that the current configuration can be restored later. Users who rely on it lose their filter state without any indication that it was never persisted.",
    recommendation:
      "Remove Save View from screens where views are not restored on entry. If the pattern is retained for consistency, persist the saved view on navigation and show the active view name in the toolbar.",
    expected:
      "Either the control is absent, or selecting a saved view restores the filters that were saved with it.",
    notes:
      "The toolbar appears to be a shared component rendered for every list screen. The fix is most likely a per-screen capability flag rather than a change to the control itself.",
  },
  {
    id: "UX-007",
    severity: "critical",
    module: "Orders → Bulk actions",
    workflow: "Assigning a courier to selected orders",
    category: "Feedback & system status",
    source: "Human discovered",
    userImpact: "High",
    complexity: "Medium",
    confidence: "High",
    problem:
      "A bulk action reports success even when individual rows in the batch fail. The success toast reads “Courier assigned” whether 40 of 40 or 6 of 40 rows succeeded.",
    evidence:
      "Selecting rows that include one order already in transit returns a partial result. The toast is unconditional; the failed rows are unchanged in the table with no marker.",
    impact:
      "Operations teams believe work is done that isn't. The failure is discovered downstream, usually by a customer. This is the most expensive class of UX defect: silent, and trusted.",
    recommendation:
      "Report per-row outcomes. Show “36 assigned · 4 failed”, keep failed rows selected, and give one action to retry or view the reason.",
    expected:
      "The result summary reflects the actual outcome, and failed rows remain visible and actionable.",
    notes:
      "The endpoint already returns per-row results — the interface is discarding them and rendering on the 2xx alone.",
  },
  {
    id: "UX-019",
    severity: "high",
    module: "Settings → Users & Roles",
    workflow: "A support role opening account settings",
    category: "Permissions",
    source: "Automated → Human verified",
    userImpact: "Medium",
    complexity: "Low",
    confidence: "High",
    problem:
      "Actions that the current role cannot perform are rendered and enabled. Permission is enforced only on submit, where it returns a generic error.",
    evidence:
      "Signed in as a support role, Invite user, Change role and Remove user are all clickable. Each opens its full flow and fails at the last step with “Something went wrong.”",
    impact:
      "Users are walked through a task they were never allowed to complete, and the failure gives them no way to understand why or who to ask.",
    recommendation:
      "Resolve capabilities before render. Hide actions the role can never perform; where an action is contextually unavailable, disable it and say what would unlock it.",
    expected:
      "A role only sees actions it can complete, and any disabled action explains itself.",
    notes:
      "Worth auditing every other module for the same pattern — permission checks that live only at the API boundary usually repeat across a product.",
  },
  {
    id: "UX-063",
    severity: "medium",
    module: "Orders → Filters & search",
    workflow: "Returning to a filtered list from a detail page",
    category: "Workflow friction",
    source: "Agent discovered → Human verified",
    userImpact: "High",
    complexity: "Medium",
    confidence: "High",
    problem:
      "Filter state is held in component state rather than the URL. Opening an order and pressing back returns to an unfiltered list at page one.",
    evidence:
      "Filtering to “RTO, last 30 days, Bengaluru”, opening any row and navigating back produces the default list. The filter chips are gone; the URL never changed.",
    impact:
      "The core operational loop is review a list, open a row, come back. Re-filtering on every return is a small cost paid hundreds of times a day, and it makes the list feel unreliable.",
    recommendation:
      "Move filter, sort and pagination state into query parameters so back, refresh and link-sharing all behave. Restore scroll position on return.",
    expected:
      "Back returns to the same rows, in the same order, at the same position — and the URL can be sent to a colleague.",
    notes:
      "This also removes the most common reason people open records in new tabs, which is currently the only workaround available.",
  },
  {
    id: "UX-088",
    severity: "medium",
    module: "Reports → Export",
    workflow: "Exporting a large report",
    category: "Loading & error states",
    source: "Automated → Human verified",
    userImpact: "Medium",
    complexity: "Low",
    confidence: "Medium",
    problem:
      "Exports above roughly ten thousand rows have no progress indication and no failure state. The button returns to rest immediately while the job continues elsewhere.",
    evidence:
      "A large export shows no pending state, no notification on completion, and no message when the request times out. The file simply appears in email, or does not.",
    impact:
      "Users press Export repeatedly, queueing duplicate jobs. When nothing arrives, there is no way to tell whether it failed or is still running.",
    recommendation:
      "Acknowledge the request immediately with an explicit pending state, disable re-submission for that job, and surface completion and failure in the same place the user started.",
    expected:
      "Every export has a visible state: queued, running, ready, or failed with a reason.",
    notes:
      "If exports are already asynchronous server-side, this is presentation only — the job status likely just needs to be polled and shown.",
  },
];

/* ------------------------------------------------------------
   What gets audited — the matrix
   ------------------------------------------------------------ */
export const AUDIT_MATRIX = [
  {
    group: "Structure",
    items: ["Navigation & IA", "Cross-module UX", "Discoverability", "Consistency"],
  },
  {
    group: "Data surfaces",
    items: ["Tables & bulk actions", "Filters & search", "Empty states", "Responsive behaviour"],
  },
  {
    group: "Input",
    items: ["Forms & validation", "Modals & drawers", "Workflow friction", "Design-system consistency"],
  },
  {
    group: "System behaviour",
    items: ["Loading states", "Error states", "Feedback & system status", "Permissions", "Accessibility"],
  },
];

/* ------------------------------------------------------------
   Capability switches — keep promises tied to what is offered
   ------------------------------------------------------------ */
export const CAPABILITIES = {
  /** Native mobile-app testing is not offered; responsive web is. */
  nativeMobileApps: false,
};
