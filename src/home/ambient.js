import { addTick, reduceMotion } from "../core/motion.js";

/* ------------------------------------------------------------
   Ambient background — three lights drifting almost
   imperceptibly. Rendered at 1/8 resolution, ~30fps.
   ------------------------------------------------------------ */
export function initAmbient() {
  const canvas = document.getElementById("ambient");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0;

  const size = () => {
    w = canvas.width = Math.max(160, Math.floor(window.innerWidth / 8));
    h = canvas.height = Math.max(90, Math.floor(window.innerHeight / 8));
  };
  size();
  window.addEventListener("resize", size, { passive: true });

  const lights = [
    { c: "201, 176, 138", a: 0.055, r: 0.75, fx: 0.11, fy: 0.07, px: 0.28, py: 0.26 },
    { c: "142, 152, 164", a: 0.045, r: 0.85, fx: 0.07, fy: 0.09, px: 0.74, py: 0.66 },
    { c: "120, 96, 66",  a: 0.038, r: 0.95, fx: 0.05, fy: 0.04, px: 0.5,  py: 0.95 },
  ];

  const paint = (t) => {
    ctx.clearRect(0, 0, w, h);
    for (const L of lights) {
      const x = (L.px + Math.sin(t * L.fx) * 0.14) * w;
      const y = (L.py + Math.cos(t * L.fy) * 0.12) * h;
      const r = L.r * Math.max(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${L.c}, ${L.a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  };

  if (reduceMotion.matches) {
    paint(2);
    return;
  }

  let last = 0;
  addTick((now) => {
    if (now - last < 33) return; // ~30fps is plenty for fog
    last = now;
    paint(now / 4000);
  });
}
