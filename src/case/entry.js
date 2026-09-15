/* ============================================================
   /work/<slug> — case study pages.
   Shares the portfolio's nav, menu and analytics. Deliberately
   carries no lead modal and no auto-open: someone reading a case
   study is mid-read, and interrupting that costs more than it earns.
   ============================================================ */

import { initNav, initMenu } from "../core/nav.js";
import { initMagnetic } from "../core/magnetic.js";
import { initClickTracking } from "../core/analytics.js";

/**
 * "All work" is a real link to /#work, so it works when the page was opened
 * in a new tab or from a shared URL. But when the visitor arrived from the
 * homepage in this tab, going *back* is strictly better: the browser restores
 * the exact scroll position they left, instead of jumping to the top of Work.
 */
function initBackLink() {
  const link = document.querySelector("[data-case-back]");
  if (!link) return;

  link.addEventListener("click", (e) => {
    let fromHome = false;
    try {
      const ref = new URL(document.referrer);
      fromHome = ref.origin === location.origin && ref.pathname === "/";
    } catch {
      /* no referrer — follow the link */
    }
    if (fromHome && history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
}

function init() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  initNav();
  initMenu();
  initBackLink();
  initClickTracking();

  const whenIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300));
  whenIdle(() => initMagnetic());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
