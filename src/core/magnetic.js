import { addTick, clamp, lerp, reduceMotion, removeTick } from "./motion.js";

/* ------------------------------------------------------------
   Magnetic buttons — pull toward the cursor, spring home.
   Pointer-fine only; skipped entirely under reduced motion.
   ------------------------------------------------------------ */
export function initMagnetic() {
  if (reduceMotion.matches || !window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let active = false;

    const tick = () => {
      cx = lerp(cx, tx, 0.18);
      cy = lerp(cy, ty, 0.18);
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (!active && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) {
        el.style.transform = "";
        removeTick(tick);
      }
    };

    el.addEventListener("pointerenter", () => {
      active = true;
      addTick(tick);
    });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) * 0.28, -10, 10);
      ty = clamp((e.clientY - (r.top + r.height / 2)) * 0.28, -8, 8);
    });
    el.addEventListener("pointerleave", () => {
      active = false;
      tx = 0;
      ty = 0;
    });
  });
}
