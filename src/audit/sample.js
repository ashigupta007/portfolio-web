import {
  AUDIT_MATRIX,
  PRICING,
  PRICING_NOTE,
  SAMPLE_FINDINGS,
  SAMPLE_SCORE,
  SEVERITIES,
} from "./config.js";
import { track } from "../core/analytics.js";

/* ============================================================
   SAMPLE AUDIT — the product, rendered from config.

   Everything here is illustrative and labelled as such. The
   markup deliberately mirrors the real report's structure, so
   what a visitor reads on this page is what lands in the file.
   ============================================================ */

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const total = SEVERITIES.reduce((sum, s) => sum + s.count, 0);

/* ---- score ------------------------------------------------- */
function renderScore(mount) {
  const { overall, breakdown } = SAMPLE_SCORE;
  const c = 2 * Math.PI * 52;

  mount.innerHTML = `
    <div class="score-dial">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle class="score-ring" cx="60" cy="60" r="52" />
        <circle class="score-value" cx="60" cy="60" r="52"
                stroke-dasharray="${c.toFixed(1)}"
                stroke-dashoffset="${(c * (1 - overall / 100)).toFixed(1)}" />
      </svg>
      <div class="score-read">
        <b>${overall}</b><span>/ 100</span>
      </div>
    </div>
    <ul class="score-bars">
      ${breakdown
        .map(
          (row) => `
        <li>
          <span class="score-k">${esc(row.label)}</span>
          <span class="score-track"><i style="--w:${row.value}%"></i></span>
          <b class="score-n">${row.value}</b>
        </li>`
        )
        .join("")}
    </ul>`;
}

/** The hero's condensed read: one number, no chrome. */
function renderScoreCompact(mount) {
  mount.innerHTML = `
    <span class="scorec-k">UX health</span>
    <span class="scorec-v"><b>${SAMPLE_SCORE.overall}</b>/ 100</span>`;
}

/* ---- severity --------------------------------------------- */
function renderSeverity(mount) {
  mount.innerHTML = `
    <p class="sev-total"><b>${total}</b> findings</p>
    <ul class="sev-list">
      ${SEVERITIES.map(
        (s) => `
        <li data-sev="${s.key}">
          <span class="sev-dot" aria-hidden="true"></span>
          <span class="sev-k">${esc(s.label)}</span>
          <span class="sev-track"><i style="--w:${Math.round((s.count / total) * 100)}%"></i></span>
          <b class="sev-n">${String(s.count).padStart(2, "0")}</b>
        </li>`
      ).join("")}
    </ul>`;
}

/* ---- one finding card --------------------------------------
   `level` keeps the document outline intact in both placements: the hero
   sits under the page h1, the list sits under its section h2. ---- */
function findingCard(f, index, { compact = false, level = 3 } = {}) {
  const bodyId = `finding-body-${f.id}`;
  const sev = SEVERITIES.find((s) => s.key === f.severity);
  const H = `h${level}`;
  const SubH = `h${level + 1}`;

  return `
    <article class="finding" data-sev="${f.severity}" data-finding="${esc(f.id)}">
      <${H} class="finding-head">
        <button type="button" class="finding-toggle" aria-expanded="false" aria-controls="${bodyId}">
          <span class="finding-id">${esc(f.id)}</span>
          <span class="finding-sev">${esc(sev?.label ?? f.severity)}</span>
          <span class="finding-title">${esc(f.problem.split(". ")[0])}.</span>
          <span class="finding-mod">${esc(f.module)}</span>
          <span class="finding-caret" aria-hidden="true">+</span>
        </button>
      </${H}>

      <div class="finding-body" id="${bodyId}" hidden>
        <dl class="finding-meta">
          <div><dt>Workflow</dt><dd>${esc(f.workflow)}</dd></div>
          <div><dt>Category</dt><dd>${esc(f.category)}</dd></div>
          <div><dt>Detection</dt><dd>${esc(f.source)}</dd></div>
          <div><dt>User impact</dt><dd>${esc(f.userImpact)}</dd></div>
          <div><dt>Complexity</dt><dd>${esc(f.complexity)}</dd></div>
          <div><dt>Confidence</dt><dd>${esc(f.confidence)}</dd></div>
        </dl>

        <div class="finding-section"><${SubH}>Problem</${SubH}><p>${esc(f.problem)}</p></div>
        <div class="finding-section" data-part="evidence" tabindex="-1"><${SubH}>Evidence</${SubH}><p>${esc(f.evidence)}</p></div>
        <div class="finding-section"><${SubH}>Why it matters</${SubH}><p>${esc(f.impact)}</p></div>
        <div class="finding-section" data-part="recommendation" tabindex="-1"><${SubH}>Recommendation</${SubH}><p>${esc(f.recommendation)}</p></div>
        <div class="finding-section"><${SubH}>Expected behaviour</${SubH}><p>${esc(f.expected)}</p></div>
        ${
          compact
            ? ""
            : `<div class="finding-section"><${SubH}>Implementation notes</${SubH}><p>${esc(f.notes)}</p></div>`
        }
      </div>

      ${
        index === 0
          ? `<div class="finding-actions">
               <button type="button" class="finding-jump" data-part-target="evidence">View evidence</button>
               <button type="button" class="finding-jump" data-part-target="recommendation">Recommendation</button>
             </div>`
          : ""
      }
    </article>`;
}

/* ---- disclosure behaviour ---------------------------------- */
function wireFindings(scope) {
  scope.querySelectorAll(".finding").forEach((card) => {
    const toggle = card.querySelector(".finding-toggle");
    const body = card.querySelector(".finding-body");
    if (!toggle || !body) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      body.hidden = !open;
      card.classList.toggle("is-open", open);
      if (open) track("ux_audit_sample_viewed", { finding: card.dataset.finding }, true);
    };

    toggle.addEventListener("click", () =>
      setOpen(toggle.getAttribute("aria-expanded") !== "true")
    );

    card.querySelectorAll("[data-part-target]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setOpen(true);
        const part = body.querySelector(`[data-part="${btn.dataset.partTarget}"]`);
        part?.focus({ preventScroll: false });
      });
    });
  });
}

/* ---- pricing -----------------------------------------------
   One config, two renderings. A three-column comparison table is
   the clearest way to read two tiers side by side — and unreadable
   at 375px. So wide screens get a real <table> and narrow screens
   get one card per tier. CSS shows exactly one; the hidden one is
   display:none, so assistive tech never hears both.
   ------------------------------------------------------------ */
const cell = (value) =>
  value === true
    ? `<span class="pt-yes" aria-hidden="true">✓</span><span class="visually-hidden">Included</span>`
    : value === false
      ? `<span class="pt-no" aria-hidden="true">—</span><span class="visually-hidden">Not included</span>`
      : esc(value);

const leadSource = (id) => `pricing_${id.replace(/-/g, "_")}`;

function pricingTable() {
  const { tiers, groups, priceLabel } = PRICING;
  const feat = (t) => (t.featured ? " is-featured" : "");

  return `
    <div class="pt-wrap">
      <table class="pt">
        <caption class="visually-hidden">Comparison of ${tiers.map((t) => esc(t.name)).join(" and ")}</caption>
        <thead>
          <tr>
            <td class="pt-corner"></td>
            ${tiers.map((t) => `<th scope="col" class="pt-tier${feat(t)}">${esc(t.name)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          <tr class="pt-price-row">
            <th scope="row">${esc(priceLabel)}</th>
            ${tiers.map((t) => `<td class="${feat(t).trim()}"><span class="pt-price">${esc(t.price)}</span></td>`).join("")}
          </tr>
          <tr class="pt-best-row">
            <th scope="row">Best for</th>
            ${tiers.map((t) => `<td class="${feat(t).trim()}">${esc(t.bestFor)}</td>`).join("")}
          </tr>
          ${groups
            .map(
              (g) => `
            <tr class="pt-group">
              <th scope="rowgroup">${esc(g.title)}</th>
              ${tiers.map((t) => `<td class="${feat(t).trim()}"></td>`).join("")}
            </tr>
            ${g.rows
              .map(
                (r) => `
              <tr>
                <th scope="row">${esc(r.label)}</th>
                ${r.values.map((v, i) => `<td class="${feat(tiers[i]).trim()}">${cell(v)}</td>`).join("")}
              </tr>`
              )
              .join("")}`
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td class="pt-corner"></td>
            ${tiers
              .map(
                (t) => `
              <td class="${feat(t).trim()}">
                <a class="btn-pill${t.featured ? " is-primary" : ""}" href="#enquiry" data-open-lead="${leadSource(t.id)}">${esc(t.cta)}</a>
              </td>`
              )
              .join("")}
          </tr>
        </tfoot>
      </table>
    </div>`;
}

function pricingCards() {
  const { tiers, groups, priceLabel } = PRICING;
  return `
    <div class="pc-list">
      ${tiers
        .map(
          (t, i) => `
        <article class="pc${t.featured ? " is-featured" : ""}">
          <h3 class="pc-name">${esc(t.name)}</h3>
          <p class="pc-label">${esc(priceLabel)}</p>
          <p class="pc-price">${esc(t.price)}</p>
          <p class="pc-best">Best for ${esc(t.bestFor.charAt(0).toLowerCase() + t.bestFor.slice(1))}</p>
          ${groups
            .map(
              (g) => `
            <h4 class="pc-group">${esc(g.title)}</h4>
            <dl class="pc-rows">
              ${g.rows
                .map(
                  (r) => `
                <div class="${r.values[i] === false ? "is-absent" : ""}">
                  <dt>${esc(r.label)}</dt>
                  <dd>${cell(r.values[i])}</dd>
                </div>`
                )
                .join("")}
            </dl>`
            )
            .join("")}
          <a class="btn-pill${t.featured ? " is-primary" : ""} pc-cta" href="#enquiry" data-open-lead="${leadSource(t.id)}">${esc(t.cta)}</a>
        </article>`
        )
        .join("")}
    </div>`;
}

function renderPricing(mount) {
  const { custom } = PRICING;
  mount.innerHTML = `
    ${pricingTable()}
    ${pricingCards()}
    <article class="pt-custom">
      <div class="pt-custom-copy">
        <h3 class="pt-custom-name">${esc(custom.name)}</h3>
        <p class="pt-custom-summary">${esc(custom.summary)}</p>
      </div>
      <div class="pt-custom-side">
        <span class="pt-custom-price">${esc(custom.price)}</span>
        <a class="btn-pill" href="#enquiry" data-open-lead="pricing_deep_audit">${esc(custom.cta)}</a>
      </div>
    </article>
    <p class="price-note">${esc(PRICING_NOTE)}</p>`;
}

/* ---- what gets audited ------------------------------------- */
function renderMatrix(mount) {
  mount.innerHTML = AUDIT_MATRIX.map(
    (col) => `
    <div class="matrix-col">
      <h3 class="matrix-h">${esc(col.group)}</h3>
      <ul class="matrix-list">
        ${col.items.map((i) => `<li>${esc(i)}</li>`).join("")}
      </ul>
    </div>`
  ).join("");
}

/* ------------------------------------------------------------ */
export function initSample() {
  const score = document.querySelector("[data-score-mount]");
  if (score) renderScore(score);

  const compact = document.querySelector("[data-score-compact-mount]");
  if (compact) renderScoreCompact(compact);

  const severity = document.querySelector("[data-severity-mount]");
  if (severity) renderSeverity(severity);

  const hero = document.querySelector("[data-hero-finding-mount]");
  if (hero) {
    hero.innerHTML = findingCard(SAMPLE_FINDINGS[0], 0, { compact: true, level: 2 });
    wireFindings(hero);
  }

  const list = document.querySelector("[data-findings-mount]");
  if (list) {
    list.innerHTML = SAMPLE_FINDINGS.map((f, i) => findingCard(f, i + 1)).join("");
    wireFindings(list);
  }

  const pricing = document.querySelector("[data-pricing-mount]");
  if (pricing) renderPricing(pricing);

  const matrix = document.querySelector("[data-matrix-mount]");
  if (matrix) renderMatrix(matrix);
}
