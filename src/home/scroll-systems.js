import { addTick, clamp, reduceMotion, removeTick, view } from "../core/motion.js";

/* ------------------------------------------------------------
   Horizontal timeline — scroll pins the section and drives
   the track sideways. Falls back to native horizontal scroll
   on touch, small screens, and reduced motion.
   ------------------------------------------------------------ */
export function initTimeline() {
  const outer = document.getElementById("timeline-outer");
  const track = document.getElementById("timeline-track");
  const progress = document.getElementById("tl-progress");
  if (!outer || !track) return;

  const wantsStatic = () =>
    reduceMotion.matches ||
    window.innerWidth < 900 ||
    !window.matchMedia("(pointer: fine)").matches;

  let distance = 0;
  let staticMode = false;

  const layout = () => {
    staticMode = wantsStatic();
    outer.classList.toggle("is-static", staticMode);
    if (staticMode) {
      outer.style.height = "";
      track.style.transform = "";
      return;
    }
    distance = Math.max(0, track.scrollWidth - window.innerWidth);
    outer.style.height = `${view.height + distance}px`;
  };
  layout();
  window.addEventListener("resize", layout, { passive: true });

  let lastP = -1;
  const tick = () => {
    if (staticMode || distance === 0) return;
    const top = outer.getBoundingClientRect().top;
    const p = clamp(-top / distance, 0, 1);
    if (Math.abs(p - lastP) < 0.0005) return;
    lastP = p;
    track.style.transform = `translate3d(${(-p * distance).toFixed(1)}px, 0, 0)`;
    if (progress) progress.style.width = `${(p * 100).toFixed(2)}%`;
  };

  // tick only while the pinned section is on screen
  new IntersectionObserver(
    ([e]) => (e.isIntersecting ? addTick(tick) : removeTick(tick))
  ).observe(outer);
}

/* ------------------------------------------------------------
   Philosophy stack — as the next statement arrives, the
   previous one recedes: fades and settles back in depth.
   ------------------------------------------------------------ */
export function initPhilosophy() {
  if (reduceMotion.matches) return;
  const stack = document.querySelector(".phil-stack");
  const panels = [...document.querySelectorAll(".phil-panel")];
  if (!stack || panels.length < 2) return;

  const tick = () => {
    for (let i = 0; i < panels.length - 1; i++) {
      const nextTop = panels[i + 1].getBoundingClientRect().top;
      if (nextTop > view.height || nextTop < -view.height) continue;
      const p = clamp(1 - nextTop / view.height, 0, 1);
      const inner = panels[i].firstElementChild;
      inner.style.opacity = clamp(1 - p * 1.25, 0, 1).toFixed(3);
      inner.style.transform = `scale(${(1 - 0.04 * p).toFixed(4)}) translateY(${(-24 * p).toFixed(1)}px)`;
    }
  };

  // tick only while the stack is on screen
  new IntersectionObserver(
    ([e]) => (e.isIntersecting ? addTick(tick) : removeTick(tick))
  ).observe(stack);
}

/* ------------------------------------------------------------
   Philosophy evidence — each statement can reveal one line of
   supporting product evidence. Hover on fine pointers, click
   or keyboard everywhere, so it never depends on hover alone.
   ------------------------------------------------------------ */
export function initPhilosophyEvidence() {
  document.querySelectorAll("[data-evidence-toggle]").forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });
}
