/* ============================================================
   /ux-audit — entry.
   Shares the portfolio's motion engine, nav, analytics and the
   lead-capture modal.
   ============================================================ */

import { initReveals } from "../core/reveal.js";
import { initNav, initMenu } from "../core/nav.js";
import { initMagnetic } from "../core/magnetic.js";
import { initClickTracking, track } from "../core/analytics.js";
import { initSample } from "./sample.js";
import { formMarkup, initLeadForm } from "../lead/form.js";
import { initLeadModal } from "../lead/modal.js";

/** The in-page enquiry form, built from the same template the modal uses. */
function initInlineForm() {
  const mount = document.querySelector("[data-lead-form-mount]");
  if (!mount) return;

  mount.innerHTML = formMarkup("audit-form");
  const form = mount.querySelector("form");
  form.dataset.leadSource = "inline";

  initLeadForm(form, () => {
    const shell = document.getElementById("audit-form-shell");
    const success = document.getElementById("audit-success");
    if (!shell || !success) return;
    shell.hidden = true;
    success.hidden = false;
    success.focus();
    success.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}

function init() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  initSample();
  initInlineForm();
  initLeadModal();
  initReveals();
  initNav();
  initMenu();
  initClickTracking();

  track("ux_audit_page_view", {}, true);

  requestAnimationFrame(() =>
    requestAnimationFrame(() => document.body.classList.add("is-loaded"))
  );

  const whenIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300));
  whenIdle(() => initMagnetic());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
