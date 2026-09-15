/* ============================================================
   ASHISH GUPTA — PORTFOLIO
   Homepage entry. Zero runtime dependencies.
   One rAF loop, GPU transforms only, every system gated by an
   IntersectionObserver. Everything respects prefers-reduced-motion.
   ============================================================ */

import { onceVisible } from "./src/core/motion.js";
import { initReveals } from "./src/core/reveal.js";
import { initNav, initMenu } from "./src/core/nav.js";
import { initMagnetic } from "./src/core/magnetic.js";
import { initClickTracking } from "./src/core/analytics.js";
import { initLeadModal } from "./src/lead/modal.js";
import { initAmbient } from "./src/home/ambient.js";
import { initHeroMachine } from "./src/home/hero-machine.js";
import { initTimeline, initPhilosophy, initPhilosophyEvidence } from "./src/home/scroll-systems.js";
import { initPortrait } from "./src/home/portrait.js";

function init() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  initReveals();
  initNav();
  initMenu();
  initTimeline();
  initPhilosophy();
  initPhilosophyEvidence();
  initPortrait();
  initClickTracking();
  initLeadModal();

  // hero entrance — after first paint so the masks animate
  requestAnimationFrame(() =>
    requestAnimationFrame(() => document.body.classList.add("is-loaded"))
  );

  // atmosphere and the hero machine start off the critical path; the
  // hero visual only becomes visible at +700ms, so this is invisible
  const whenIdle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300));
  whenIdle(() => {
    initAmbient();
    initHeroMachine();
    initMagnetic();
  });

  // the Selected Work demos and the Lab are the heaviest scripts on the
  // page and live far below the fold — fetch them just before they're needed
  onceVisible(
    document.getElementById("work"),
    () => import("./src/home/demos/index.js").then((m) => m.initProductDemos()),
    { rootMargin: "600px 0px" }
  );

  onceVisible(
    document.getElementById("lab"),
    () => import("./src/home/lab.js").then((m) => m.initLab()),
    { rootMargin: "600px 0px" }
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
