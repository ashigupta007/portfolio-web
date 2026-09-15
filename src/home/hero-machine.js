import { addTick, reduceMotion, removeTick, whenVisible } from "../core/motion.js";

/* ============================================================
   HERO MACHINE
   One honest demonstration instead of a decorative animation:
   the path a spoken sentence actually takes through the kind
   of system this portfolio is about —

     VOICE → TRANSCRIPT → AGENT → TOOL → INTERFACE

   The clock is the point. It counts real budget, stage by
   stage, and lands under a second.
   ============================================================ */

const STAGES = [
  { id: "voice",     hold: 2200, latency: 220 },
  { id: "transcript", hold: 2300, latency: 380 },
  { id: "agent",     hold: 2600, latency: 640 },
  { id: "tool",      hold: 2300, latency: 820 },
  { id: "interface", hold: 3400, latency: 940 },
];

export function initHeroMachine() {
  const root = document.getElementById("machine");
  if (!root) return;

  const nodes = new Map(
    [...root.querySelectorAll("[data-node]")].map((el) => [el.dataset.node, el])
  );
  const panels = new Map(
    [...root.querySelectorAll("[data-panel]")].map((el) => [el.dataset.panel, el])
  );
  const clockEl = root.querySelector("[data-machine-clock]");
  const stageNameEl = root.querySelector("[data-machine-stage-name]");
  const canvas = root.querySelector("[data-machine-wave]");

  let index = 0;
  let stageStart = 0;
  let clockFrom = 0;

  const applyStage = (i, animate) => {
    const stage = STAGES[i];
    nodes.forEach((el, id) => {
      el.classList.toggle("is-active", id === stage.id);
      el.classList.toggle("is-done", STAGES.findIndex((s) => s.id === id) < i);
    });
    panels.forEach((el, id) => {
      const active = id === stage.id;
      // remove-then-add restarts the panel's CSS enter animation
      if (active && animate) el.classList.remove("is-active");
      el.classList.toggle("is-active", active);
      if (active && animate) void el.offsetWidth;
    });
    if (stageNameEl) stageNameEl.textContent = stage.id;
  };

  const setClock = (ms) => {
    if (clockEl) clockEl.textContent = `${Math.round(ms)} ms`;
  };

  /* ---- waveform: 34 bars of smoothed noise, drawn only while
     the VOICE stage is on screen and running ---- */
  let wave = null;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const BARS = 34;
    const amps = new Float32Array(BARS);
    let w = 0, h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    wave = {
      resize,
      draw(t, live) {
        ctx.clearRect(0, 0, w, h);
        const slot = w / BARS;
        const bw = Math.max(1.5, slot * 0.42);
        for (let i = 0; i < BARS; i++) {
          // two out-of-phase sines + a per-bar offset reads as speech,
          // without a random() that flickers between frames
          const target = live
            ? (0.25 +
               Math.abs(Math.sin(t * 0.006 + i * 0.55)) * 0.45 +
               Math.abs(Math.sin(t * 0.011 + i * 0.21)) * 0.3) *
              (0.45 + 0.55 * Math.sin((i / BARS) * Math.PI))
            : 0.06;
          amps[i] += (target - amps[i]) * 0.18;
          const bh = Math.max(1.5, amps[i] * h);
          const x = i * slot + (slot - bw) / 2;
          ctx.fillStyle = i % 7 === 3
            ? "rgba(201, 176, 138, 0.85)"
            : "rgba(242, 239, 233, 0.34)";
          ctx.fillRect(x, (h - bh) / 2, bw, bh);
        }
      },
    };
  }

  // hands stage visibility over to JS; until this lands, CSS shows the
  // VOICE panel, so there is never an empty stage or a flash
  root.classList.add("is-running");

  /* ---- reduced motion: render the finished state, no loop ---- */
  if (reduceMotion.matches) {
    applyStage(STAGES.length - 1, false);
    nodes.forEach((el) => el.classList.add("is-done"));
    setClock(STAGES.at(-1).latency);
    wave?.draw(0, false);
    return;
  }

  const tick = (now) => {
    const stage = STAGES[index];
    const elapsed = now - stageStart;
    // rAF timestamps can predate the performance.now() captured when the
    // machine came into view; clamping keeps the clock from reading negative
    const p = Math.max(0, Math.min(1, elapsed / stage.hold));

    setClock(clockFrom + (stage.latency - clockFrom) * Math.min(1, p * 1.6));
    if (stage.id === "voice") wave?.draw(now, p < 0.9);

    if (elapsed >= stage.hold) {
      clockFrom = index === STAGES.length - 1 ? 0 : stage.latency;
      index = (index + 1) % STAGES.length;
      stageStart = now;
      applyStage(index, true);
      if (index === 0) wave?.resize();
    }
  };

  applyStage(0, false);
  setClock(0);

  whenVisible(
    root,
    () => { stageStart = performance.now(); addTick(tick); },
    () => removeTick(tick),
    { threshold: 0.2 }
  );
}
